import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { HiOutlineEye, HiOutlineSearch, HiOutlinePlus, HiOutlineCube, HiStar } from "react-icons/hi";
import Modal from "../components/common/Modal";
import { InputField } from "../components/common/FormField";
import PageHeader from "../components/common/PageHeader";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import Badge, { statusTone } from "../components/common/Badge";
import Spinner from "../components/common/Spinner";
import EmptyState from "../components/common/EmptyState";
import ReviewModal from "../components/reviews/ReviewModal";
import { getShipmentReview } from "../services/reviews.service";

const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    PROCESSING: "bg-purple-100 text-purple-800",
    SHIPPING: "bg-orange-100 text-orange-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
};

export default function Orders() {
    const { orderId } = useParams();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const isCustomer = (user?.roleName || user?.Role || user?.role) === "CUSTOMER";
    const toast = useToast();
    const [error,setError] = useState("");
    const [updatingStatus,setUpdatingStatus] = useState(false);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

    const [showCreate, setShowCreate] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [review, setReview] = useState(null);
    const [showReview, setShowReview] = useState(false);
    const [form, setForm] = useState({ customerId: "", pickupAddress: "", deliveryAddress: "", pickupProvince: "", deliveryProvince: "", items: [] });
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [itemForm, setItemForm] = useState({ productId: "", quantity: 1, weight: 0, price: 0 });
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    const fetchOrders = async (page = 1) => {
        setLoading(true);
        try {
            const params = { page, limit: 10 };
            if (search) params.search = search;
            if (status) params.status = status;
            const { data } = await api.get("/orders", { params });
            setOrders(data.data);
            setPagination(data.pagination);
            setError("");
        } catch(err) {
            setError(err.response?.data?.message || "Không tải được danh sách đơn hàng.");
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchOrders(); }, [search, status]);

    const openCreate = async () => {
        if (isCustomer) { navigate("/customer-dashboard?create=1"); return; }
        try {
            const [cRes, pRes] = await Promise.all([api.get("/customers"), api.get("/products")]);
            setCustomers(cRes.data.data || []);
            setProducts(pRes.data.data || []);
        } catch {}
        setShowCreate(true);
    };

    const addItem = () => {
        if (!itemForm.productId || !itemForm.quantity) return;
        const product = products.find((p) => p.ProductID === parseInt(itemForm.productId));
        setForm({
            ...form,
            items: [
                ...form.items,
                { productId: parseInt(itemForm.productId), productName: product?.ProductName || "", quantity: parseInt(itemForm.quantity), weight: parseFloat(itemForm.weight) || product?.Weight || 0, price: parseFloat(itemForm.price) || product?.Price || 0 }
            ]
        });
        setItemForm({ productId: "", quantity: 1, weight: 0, price: 0 });
    };

    const removeItem = (idx) => {
        setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post("/orders", { ...form, customerId: parseInt(form.customerId) });
            setShowCreate(false);
            setForm({ customerId: "", pickupAddress: "", deliveryAddress: "", pickupProvince: "", deliveryProvince: "", items: [] });
            fetchOrders();
        } catch (err) { alert(err.response?.data?.message || "Không tạo được đơn hàng"); }
        finally { setSubmitting(false); }
    };

    const openDetail = async (orderId) => {
        try {
            const { data } = await api.get(`/orders/${orderId}`);
            setSelectedOrder(data.data);
            setShowDetail(true);
            if (data.data.ShipmentID) {
                try { setReview(await getShipmentReview(data.data.ShipmentID)); } catch { setReview(null); }
            } else {
                setReview(null);
            }
        } catch(err) { toast?.(err.response?.data?.message || "Không tải được chi tiết đơn.","error"); }
    };

    const changeOrderStatus = async nextStatus => {
        setUpdatingStatus(true);
        try {
            await api.put(`/orders/${selectedOrder.OrderID}/status`,{status:nextStatus});
            setSelectedOrder(prev=>({...prev,OrderStatus:nextStatus}));
            await fetchOrders(pagination.page);
            toast?.("Đã cập nhật trạng thái đơn hàng.","success");
        } catch(err) { toast?.(err.response?.data?.message || "Không cập nhật được đơn.","error"); }
        finally { setUpdatingStatus(false); }
    };

    useEffect(() => { if (orderId) openDetail(orderId); }, [orderId]);
    useEffect(() => { if (searchParams.get("create") === "1") openCreate(); }, [searchParams]);

    return (
        <div>
            <PageHeader
                title="Quản lý đơn hàng"
                subtitle="Theo dõi từ xác nhận đến hoàn tất."
                icon={HiOutlineCube}
                actions={
                        <Button variant="primary" onClick={openCreate}>
                            <HiOutlinePlus className="w-5 h-5" /> Tạo đơn hàng
                        </Button>
                }
            />

            {error&&<p role="alert" className="notice error-notice mb-4">{error}<Button variant="outline" onClick={()=>fetchOrders()}>Thử lại</Button></p>}
            <Card className="mb-6">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input type="text" placeholder="Tìm mã đơn / khách hàng..." value={search} onChange={(e) => setSearch(e.target.value)}
                            className="input pl-10" />
                    </div>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="input w-auto">
                        <option value="">Tất cả trạng thái</option>
                        {Object.keys(statusColors).map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </Card>

            <div className="table-wrap">
                <table className="w-full">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="th">Mã đơn</th>
                            <th className="th">Khách hàng</th>
                            <th className="th">Trạng thái</th>
                            <th className="th">Tổng tiền</th>
                            <th className="th">Ngày tạo</th>
                            <th className="th text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="td text-center"><Spinner /></td></tr>
                        ) : orders.length === 0 ? (
                            <tr><td colSpan={6} className="td"><EmptyState icon={HiOutlineCube} title="Không tìm thấy đơn hàng" description="Không có đơn hàng phù hợp bộ lọc." /></td></tr>
                        ) : orders.map((o) => (
                            <tr key={o.OrderID} className="row-hover cursor-pointer" onClick={() => openDetail(o.OrderID)}>
                                <td className="td font-medium text-brand">{o.OrderCode}</td>
                                <td className="td">{o.CustomerName || "N/A"}</td>
                                <td className="td"><Badge tone={statusTone(o.OrderStatus)}>{o.OrderStatus}</Badge></td>
                                <td className="td">{(o.TotalAmount || 0).toLocaleString()} VND</td>
                                <td className="td">{new Date(o.CreatedAt).toLocaleDateString()}</td>
                                <td className="td text-right">
                                    <HiOutlineEye className="w-5 h-5 inline text-slate-400" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                        <button key={p} onClick={() => fetchOrders(p)} className={`btn btn-sm ${p === pagination.page ? "btn-primary" : "btn-outline"}`}>{p}</button>
                    ))}
                </div>
            )}

            <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Tạo đơn hàng" size="lg">
                <form onSubmit={handleCreate} className="space-y-4">
                    <InputField label="Khách hàng" name="customerId" type="select" value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                        options={customers.map((c) => ({ value: c.CustomerID, label: `${c.CompanyName || c.FullName}` }))} required />
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Địa chỉ lấy hàng" name="pickupAddress" value={form.pickupAddress} onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })} required />
                        <InputField label="Địa chỉ giao hàng" name="deliveryAddress" value={form.deliveryAddress} onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Tỉnh / thành lấy hàng" name="pickupProvince" value={form.pickupProvince} onChange={(e) => setForm({ ...form, pickupProvince: e.target.value })} />
                        <InputField label="Tỉnh / thành giao hàng" name="deliveryProvince" value={form.deliveryProvince} onChange={(e) => setForm({ ...form, deliveryProvince: e.target.value })} />
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="font-medium text-slate-800 mb-2">Hàng hóa trong đơn</h4>
                        <div className="grid grid-cols-5 gap-2 mb-3">
                            <select value={itemForm.productId} onChange={(e) => { setItemForm({ ...itemForm, productId: e.target.value }); }} className="input col-span-2">
                                <option value="">Sản phẩm</option>
                                {products.map((p) => <option key={p.ProductID} value={p.ProductID}>{p.ProductName}</option>)}
                            </select>
                            <InputField type="number" placeholder="SL" value={itemForm.quantity} onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })} />
                            <InputField type="number" placeholder="Khối lượng" value={itemForm.weight} onChange={(e) => setItemForm({ ...itemForm, weight: e.target.value })} />
                            <InputField type="number" placeholder="Đơn giá" value={itemForm.price} onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })} />
                        </div>
                        <Button type="button" variant="success" size="sm" onClick={addItem}>+ Add Item</Button>

                        {form.items.length > 0 && (
                            <div className="table-wrap mt-3">
                                <table className="w-full text-sm">
                                    <thead><tr className="bg-slate-50"><th className="th">Sản phẩm</th><th className="th">SL</th><th className="th">Khối lượng</th><th className="th">Đơn giá</th><th className="th"></th></tr></thead>
                                    <tbody>
                                        {form.items.map((item, idx) => (
                                            <tr key={idx} className="row-hover">
                                                <td className="td">{item.productName}</td>
                                                <td className="td">{item.quantity}</td>
                                                <td className="td">{item.weight} kg</td>
                                                <td className="td">{item.price?.toLocaleString()}</td>
                                                <td className="td text-right"><button type="button" onClick={() => removeItem(idx)} className="btn btn-sm btn-ghost text-rose-500">Xóa</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Hủy</Button>
                        <Button type="submit" variant="primary" disabled={submitting}>{submitting ? "Đang tạo..." : "Tạo đơn"}</Button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title={`Order ${selectedOrder?.OrderCode || ""}`} size="lg">
                {selectedOrder && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500">Trạng thái:</span>
                            <Badge tone={statusTone(selectedOrder.OrderStatus)}>{selectedOrder.OrderStatus}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><span className="text-slate-500">Amount:</span> <span className="ml-2 font-medium">{(selectedOrder.TotalAmount || 0).toLocaleString()} VND</span></div>
                            <div><span className="text-slate-500">Customer:</span> <span className="ml-2">{selectedOrder.CustomerName || selectedOrder.ContactPerson}</span></div>
                            <div><span className="text-slate-500">Weight:</span> <span className="ml-2">{selectedOrder.TotalWeight} kg</span></div>
                            <div className="col-span-2"><span className="text-slate-500">Pickup:</span> <span className="ml-2">{selectedOrder.PickupAddress}, {selectedOrder.PickupProvince}</span></div>
                            <div className="col-span-2"><span className="text-slate-500">Delivery:</span> <span className="ml-2">{selectedOrder.DeliveryAddress}, {selectedOrder.DeliveryProvince}</span></div>
                        </div>

                        <h4 className="font-medium text-slate-800 pt-2 border-t">Hàng hóa</h4>
                        {selectedOrder.items?.length > 0 ? (
                            <div className="table-wrap">
                                <table className="w-full text-sm">
                                    <thead><tr className="bg-slate-50"><th className="th">Sản phẩm</th><th className="th">SL</th><th className="th">Khối lượng</th><th className="th">Đơn giá</th></tr></thead>
                                    <tbody>
                                        {selectedOrder.items.map((item) => (
                                            <tr key={item.OrderItemID} className="row-hover">
                                                <td className="td">{item.ProductName}</td>
                                                <td className="td">{item.Quantity}</td>
                                                <td className="td">{item.Weight} kg</td>
                                                <td className="td">{(item.Price || 0).toLocaleString()} VND</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : <p className="text-sm text-slate-500">No items</p>}

                        {selectedOrder.ShipmentID && selectedOrder.OrderStatus === "DELIVERED" && (
                            <div className="pt-3 border-t">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium text-slate-800">Delivery review</h4>
                                    {!review && (
                                        <Button variant="outline" size="sm" onClick={() => setShowReview(true)}>
                                            <HiStar className="h-4 w-4" /> Write review
                                        </Button>
                                    )}
                                </div>
                                {review ? (
                                    <div className="rounded-2xl bg-slate-50 p-3">
                                        <div className="flex gap-1 mb-1">
                                            {[1, 2, 3, 4, 5].map((n) => (
                                                <HiStar key={n} className={n <= review.Rating ? "text-amber-400" : "text-slate-300"} />
                                            ))}
                                        </div>
                                        <p className="text-sm text-slate-600">{review.Comment || "No comment"}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500">You haven't reviewed this delivery yet.</p>
                                )}
                            </div>
                        )}
                        <div className="flex flex-wrap gap-3">
                            {!isCustomer && selectedOrder.OrderStatus === "PENDING" && <Button disabled={updatingStatus} onClick={()=>changeOrderStatus("CONFIRMED")}>Xác nhận đơn hàng</Button>}
                            {selectedOrder.ShipmentID && <Button variant="outline" onClick={()=>navigate(`/tracking/${selectedOrder.ShipmentID}`)}>Theo dõi giao hàng</Button>}
                        </div>
                    </div>
                )}
            </Modal>

            {selectedOrder?.ShipmentID && (
                <ReviewModal
                    isOpen={showReview}
                    onClose={() => setShowReview(false)}
                    shipmentId={selectedOrder.ShipmentID}
                    onSubmitted={() => { getShipmentReview(selectedOrder.ShipmentID).then(setReview).catch(() => setReview(null)); }}
                />
            )}
        </div>
    );
}
