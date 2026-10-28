import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Swal from "sweetalert2";
import { HiOutlineClipboardList, HiOutlineTruck, HiOutlineClock, HiOutlineUserAdd, HiOutlinePlus } from "react-icons/hi";
import Modal from "../components/common/Modal";
import { InputField } from "../components/common/FormField";
import PageHeader from "../components/common/PageHeader";
import StatCard from "../components/common/StatCard";
import Spinner from "../components/common/Spinner";
import EmptyState from "../components/common/EmptyState";
import Badge, { statusTone } from "../components/common/Badge";
import Button from "../components/common/Button";

export default function CustomerDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [orders, setOrders] = useState([]);
    const [loadError,setLoadError] = useState("");
    const [, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({ pickupAddress: "", deliveryAddress: "", pickupProvince: "", deliveryProvince: "", items: [] });
    const [products, setProducts] = useState([]);
    const [itemForm, setItemForm] = useState({ productId: "", quantity: 1 });
    const [submitting, setSubmitting] = useState(false);
    const [showBecomeDriver, setShowBecomeDriver] = useState(false);
    const [driverForm, setDriverForm] = useState({ licenseNumber: "", licenseType: "B2" });

    useEffect(() => {
        async function load() {
            try {
                const [oRes, cRes] = await Promise.all([api.get("/orders?limit=50"), api.get("/customers/me")]);
                setOrders(oRes.data.data || []);
                setCustomer(cRes.data.data);
            } catch(err) { setLoadError(err.response?.data?.message || "Không tải được đơn hàng. Vui lòng tải lại trang."); } finally { setLoading(false); }
        }
        load();
    }, []);

    const pending = orders.filter(o => !["DELIVERED", "CANCELLED"].includes(o.OrderStatus)).length;
    const delivered = orders.filter(o => o.OrderStatus === "DELIVERED").length;
    const shipping = orders.filter(o => o.OrderStatus === "SHIPPING" || o.OrderStatus === "PROCESSING");
    const total = orders.length;

    const openCreate = async () => {
        try { const { data } = await api.get("/products"); setProducts(data.data || []); } catch {}
        setForm({ pickupAddress: "", deliveryAddress: "", pickupProvince: "", deliveryProvince: "", items: [] });
        setShowCreate(true);
    };

    useEffect(() => {
        if (searchParams.get("create") === "1") { openCreate(); setSearchParams({}, { replace:true }); }
    }, [searchParams, setSearchParams]);

    const addItem = () => {
        if (!itemForm.productId || !itemForm.quantity) return;
        const p = products.find(pr => pr.ProductID === parseInt(itemForm.productId));
        if (!p) {
            Swal.fire({ icon: "warning", title: "Vui lòng chọn sản phẩm hợp lệ" });
            return;
        }
        setForm({ ...form, items: [...form.items, { productId: parseInt(itemForm.productId), productName: p?.ProductName || "", quantity: parseInt(itemForm.quantity), weight: p?.Weight || 0, price: p?.Price || 0 }] });
        setItemForm({ productId: "", quantity: 1 });
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (form.items.length === 0) {
            Swal.fire({ icon: "warning", title: "Vui lòng thêm ít nhất một sản phẩm" });
            return;
        }
        setSubmitting(true);
        try {
            await api.post("/orders", form);
            Swal.fire({ icon: "success", title: "Tạo đơn hàng thành công!", timer: 1500, showConfirmButton: false });
            setShowCreate(false);
            const { data } = await api.get("/orders?limit=50");
            setOrders(data.data || []);
        } catch (err) { Swal.fire({ icon: "error", title: "Có lỗi xảy ra", text: err.response?.data?.message || "Thất bại" }); }
        finally { setSubmitting(false); }
    };

    const becomeDriver = async () => {
        setSubmitting(true);
        try {
            const { data } = await api.post("/customers/become-driver", driverForm);
            if (data.data?.accessToken) {
                localStorage.setItem("accessToken", data.data.accessToken);
            }
            Swal.fire({
                icon: "success",
                title: "You are now a driver!",
                text: "Redirecting to your driver dashboard...",
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                window.location.href = "/driver-dashboard";
            });
        } catch (err) { Swal.fire({ icon: "error", title: "Có lỗi xảy ra", text: err.response?.data?.message || "Thất bại" }); }
        finally { setSubmitting(false); }
    };

    if (loading) return <div className="flex justify-center py-12"><Spinner /></div>;
    if (loadError) return <p role="alert" className="notice error-notice">{loadError}</p>;

    return (
        <div>
            <PageHeader
                title="Tổng quan khách hàng"
                subtitle={`Xin chào ${user?.fullName || user?.FullName || "bạn"}, đơn hàng của bạn đang ở đây.`}
                icon={HiOutlineClipboardList}
                actions={
                    <>
                        <Button variant="outline" onClick={() => setShowBecomeDriver(true)}><HiOutlineUserAdd className="h-5 w-5" /> Đăng ký làm tài xế</Button>
                        <Button onClick={openCreate}><HiOutlinePlus className="h-5 w-5" /> Tạo đơn hàng</Button>
                    </>
                }
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <StatCard label="Tổng đơn hàng" value={total} icon={HiOutlineClipboardList} tone="blue" />
                <StatCard label="Đang thực hiện" value={pending} icon={HiOutlineClock} tone="orange" />
                <StatCard label="Đã giao" value={delivered} icon={HiOutlineTruck} tone="green" />
            </div>

            {shipping.length > 0 && <section className="customer-highlight">
                <h2>Kiện hàng đang đi đến bạn</h2>
                <p>{shipping.length} đơn đang được vận chuyển • Xem vị trí và thời gian giao dự kiến</p>
                <Button onClick={() => navigate("/tracking")}>Theo dõi đơn hàng</Button>
            </section>}

            <h2 className="text-lg font-semibold text-gray-800 mb-3">Đơn hàng của tôi</h2>
            <div className="table-wrap">
                <table className="w-full">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="th">Mã đơn</th>
                            <th className="th">Lấy hàng</th>
                            <th className="th">Giao hàng</th>
                            <th className="th">Trạng thái</th>
                            <th className="th">Tổng tiền</th>
                            <th className="th">Ngày tạo</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="td">
                                    <EmptyState title="Chưa có đơn hàng" description="Chọn Tạo đơn hàng để bắt đầu." />
                                </td>
                            </tr>
                        ) : orders.map(o => (
                            <tr key={o.OrderID} className="row-hover cursor-pointer" onClick={() => navigate(`/orders/${o.OrderID}`)}>
                                <td className="td font-medium text-brand">{o.OrderCode}</td>
                                <td className="td text-slate-600 truncate max-w-[150px]">{o.PickupAddress}</td>
                                <td className="td text-slate-600 truncate max-w-[150px]">{o.DeliveryAddress}</td>
                                <td className="td"><Badge tone={statusTone(o.OrderStatus)}>{o.OrderStatus}</Badge></td>
                                <td className="td text-slate-600">{(o.TotalAmount || 0).toLocaleString()}</td>
                                <td className="td text-slate-600">{new Date(o.CreatedAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Tạo đơn hàng" size="lg">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Địa chỉ lấy hàng" name="pickupAddress" value={form.pickupAddress} onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })} required />
                        <InputField label="Địa chỉ giao hàng" name="deliveryAddress" value={form.deliveryAddress} onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Tỉnh / thành lấy hàng" name="pickupProvince" value={form.pickupProvince} onChange={(e) => setForm({ ...form, pickupProvince: e.target.value })} />
                        <InputField label="Tỉnh / thành giao hàng" name="deliveryProvince" value={form.deliveryProvince} onChange={(e) => setForm({ ...form, deliveryProvince: e.target.value })} />
                    </div>
                    <div className="border-t pt-4">
                        <h4 className="font-medium mb-2">Hàng hóa</h4>
                        <div className="flex gap-2 mb-3">
                            <InputField
                                type="select"
                                name="product"
                                value={itemForm.productId}
                                onChange={(e) => setItemForm({ ...itemForm, productId: e.target.value })}
                                placeholder="Chọn sản phẩm"
                                options={products.map(p => ({ value: p.ProductID, label: `${p.ProductName} (${(p.Price || 0).toLocaleString()} VND)` }))}
                            />
                            <InputField type="number" placeholder="SL" value={itemForm.quantity} onChange={(e) => setItemForm({ ...itemForm, quantity: parseInt(e.target.value) || 1 })} />
                        </div>
                        <Button variant="success" size="sm" type="button" onClick={addItem}>+ Thêm</Button>
                        {form.items.length > 0 && form.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between mt-2 text-sm bg-slate-50 p-2 rounded-2xl">
                                <span>{item.productName} x{item.quantity}</span>
                                <span className="text-slate-500">{(item.price * item.quantity).toLocaleString()} VND</span>
                                <Button variant="link" className="text-rose-600" type="button" onClick={() => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) })}>Xóa</Button>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button variant="outline" type="button" onClick={() => setShowCreate(false)}>Hủy</Button>
                        <Button type="submit" disabled={submitting}>{submitting ? "Đang tạo..." : "Gửi yêu cầu giao hàng"}</Button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={showBecomeDriver} onClose={() => setShowBecomeDriver(false)} title="Đăng ký tài xế">
                <p className="text-sm text-gray-600 mb-4">Nhập thông tin giấy phép để đăng ký làm tài xế.</p>
                <form onSubmit={(e) => { e.preventDefault(); becomeDriver(); }} className="space-y-4">
                    <InputField label="Số giấy phép" value={driverForm.licenseNumber} onChange={(e) => setDriverForm({ ...driverForm, licenseNumber: e.target.value })} required placeholder="B2-XXXXXX" />
                    <InputField label="Hạng giấy phép" type="select" value={driverForm.licenseType} onChange={(e) => setDriverForm({ ...driverForm, licenseType: e.target.value })} options={[{ value: "B2", label: "B2" }, { value: "C", label: "C" }, { value: "D", label: "D" }, { value: "E", label: "E" }]} />
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" type="button" onClick={() => setShowBecomeDriver(false)}>Hủy</Button>
                        <Button type="submit" disabled={submitting}>{submitting ? "Đang đăng ký..." : "Đăng ký tài xế"}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
