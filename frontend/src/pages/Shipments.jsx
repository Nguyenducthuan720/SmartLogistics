import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { HiOutlineLocationMarker, HiOutlineTruck, HiOutlineCube } from "react-icons/hi";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import Badge, { statusTone } from "../components/common/Badge";
import Spinner from "../components/common/Spinner";
import EmptyState from "../components/common/EmptyState";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { InputField } from "../components/common/FormField";

const statusColors = {
    WAITING: "bg-yellow-100 text-yellow-800",
    PICKED_UP: "bg-blue-100 text-blue-800",
    IN_TRANSIT: "bg-purple-100 text-purple-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
};

export default function Shipments() {
    const {user}=useAuth();
    const canManage=["ADMIN","WAREHOUSE_MANAGER"].includes(user?.roleName||user?.Role||user?.role);
    const toast=useToast();
    const [error,setError]=useState("");
    const [showCreate,setShowCreate]=useState(false);
    const [orders,setOrders]=useState([]);
    const [warehouses,setWarehouses]=useState([]);
    const [newShipment,setNewShipment]=useState({orderId:"",warehouseId:"",driverId:"",vehicleId:""});
    const [submitting,setSubmitting]=useState(false);
    const [shipments, setShipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("");
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
    const [showDetail, setShowDetail] = useState(false);
    const [selected, setSelected] = useState(null);
    const [drivers, setDrivers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const navigate = useNavigate();

    const fetchShipments = async (page = 1) => {
        setLoading(true);
        try {
            const params = { page, limit: 10 };
            if (status) params.status = status;
            const { data } = await api.get("/shipments", { params });
            setShipments(data.data);
            setPagination(data.pagination);
            setError("");
        } catch(err) { setError(err.response?.data?.message||"Không tải được chuyến hàng.");
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchShipments(); }, [status]);

    const openDetail = async (shipmentId) => {
        try {
            const [{ data: sData }, { data: dData }, { data: vData }] = await Promise.all([
                api.get(`/shipments/${shipmentId}`),
                canManage?api.get("/drivers?status=AVAILABLE"):Promise.resolve({data:{data:[]}}),
                canManage?api.get("/vehicles?status=AVAILABLE"):Promise.resolve({data:{data:[]}})
            ]);
            setSelected(sData.data);
            setDrivers(dData.data || []);
            setVehicles(vData.data || []);
            setShowDetail(true);
        } catch(err) { toast?.(err.response?.data?.message||"Không tải được chi tiết chuyến.","error"); }
    };

    const assignDriver = async (driverId) => {
        try {
            await api.put(`/shipments/${selected.ShipmentID}/assign-driver`, { driverId });
            const { data } = await api.get(`/shipments/${selected.ShipmentID}`);
            setSelected(data.data);
            await fetchShipments(pagination.page);
        } catch(err) { toast?.(err.response?.data?.message||"Không phân công được tài xế.","error"); }
    };

    const assignVehicle = async (vehicleId) => {
        try {
            await api.put(`/shipments/${selected.ShipmentID}/assign-vehicle`, { vehicleId });
            const { data } = await api.get(`/shipments/${selected.ShipmentID}`);
            setSelected(data.data);
            await fetchShipments(pagination.page);
        } catch(err) { toast?.(err.response?.data?.message||"Không phân công được xe.","error"); }
    };

    const updateStatus = async (newStatus) => {
        try {
            await api.put(`/shipments/${selected.ShipmentID}/status`, { status: newStatus });
            const { data } = await api.get(`/shipments/${selected.ShipmentID}`);
            setSelected(data.data);
            fetchShipments();
        } catch(err) { toast?.(err.response?.data?.message||"Không cập nhật được chuyến.","error"); }
    };
    const openCreate=async()=>{
        try{const [o,w,d,v]=await Promise.all([api.get("/orders?limit=100"),api.get("/warehouses?limit=100"),api.get("/drivers?status=AVAILABLE"),api.get("/vehicles?status=AVAILABLE")]);setOrders((o.data.data||[]).filter(r=>!r.ShipmentID&&!["CANCELLED","DELIVERED"].includes(r.OrderStatus)));setWarehouses(w.data.data||[]);setDrivers(d.data.data||[]);setVehicles(v.data.data||[]);setNewShipment({orderId:"",warehouseId:"",driverId:"",vehicleId:""});setShowCreate(true);}
        catch(err){toast?.(err.response?.data?.message||"Không tải được dữ liệu tạo chuyến.","error");}
    };
    const createShipment=async e=>{
        e.preventDefault();setSubmitting(true);
        try{const payload=Object.fromEntries(Object.entries(newShipment).filter(([,v])=>v!=="").map(([k,v])=>[k,Number(v)]));await api.post("/shipments",payload);setShowCreate(false);await fetchShipments();toast?.("Đã tạo chuyến hàng.","success");}
        catch(err){toast?.(err.response?.data?.message||"Không tạo được chuyến.","error");}
        finally{setSubmitting(false);}
    };

    return (
        <div>
            <PageHeader
                title={canManage?"Trung tâm điều phối":"Chuyến được giao"}
                subtitle="Phân công tài xế, phương tiện và theo dõi giao hàng."
                icon={HiOutlineTruck}
                actions={canManage&&<Button onClick={openCreate}>+ Tạo chuyến</Button>}
            />

            {error&&<p role="alert" className="notice error-notice mb-4">{error}</p>}
            <Card className="mb-6">
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="input w-auto">
                    <option value="">Tất cả trạng thái</option>
                    {Object.keys(statusColors).map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
            </Card>

            <div className="table-wrap">
                <table className="w-full">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="th">Đơn hàng</th>
                            <th className="th">Tài xế</th>
                            <th className="th">Phương tiện</th>
                            <th className="th">Kho</th>
                            <th className="th">Trạng thái</th>
                            <th className="th text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="td text-center"><Spinner /></td></tr>
                        ) : shipments.length === 0 ? (
                            <tr><td colSpan={6} className="td"><EmptyState icon={HiOutlineTruck} title="Chưa có chuyến hàng" description="Các chuyến hàng sẽ xuất hiện tại đây." /></td></tr>
                        ) : shipments.map((s) => (
                            <tr key={s.ShipmentID} className="row-hover cursor-pointer" onClick={() => openDetail(s.ShipmentID)}>
                                <td className="td font-medium text-brand">{s.OrderCode}</td>
                                <td className="td">{s.DriverName || "Chưa phân công"}</td>
                                <td className="td">{s.LicensePlate || "Chưa phân công"}</td>
                                <td className="td">{s.WarehouseName || "N/A"}</td>
                                <td className="td"><Badge tone={statusTone(s.ShipmentStatus)}>{s.ShipmentStatus}</Badge></td>
                                <td className="td text-right">
                                    <button type="button" onClick={(e) => { e.stopPropagation(); navigate(`/tracking/${s.ShipmentID}`); }} className="text-emerald-600 hover:text-emerald-700 inline-flex">
                                        <HiOutlineLocationMarker className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                        <button key={p} onClick={() => fetchShipments(p)} className={`btn btn-sm ${p === pagination.page ? "btn-primary" : "btn-outline"}`}>{p}</button>
                    ))}
                </div>
            )}

            <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title={`Shipment ${selected?.OrderCode || ""}`} size="lg">
                {selected && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-700">Trạng thái:</span>
                            <Badge tone={statusTone(selected.ShipmentStatus)}>{selected.ShipmentStatus}</Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div><span className="text-slate-500">Tài xế:</span> <span className="ml-1">{selected.DriverName || "Chưa phân công"}</span></div>
                            <div><span className="text-slate-500">Phương tiện:</span> <span className="ml-1">{selected.LicensePlate || "Chưa phân công"}</span></div>
                            <div><span className="text-slate-500">Kho:</span> <span className="ml-1">{selected.WarehouseName || "N/A"}</span></div>
                            <div><span className="text-slate-500">Tuyến:</span> <span className="ml-1">{selected.RouteCode || "N/A"}</span></div>
                        </div>

                        {canManage&&<div className="border-t pt-4">
                            <h4 className="font-medium text-slate-800 mb-2">Phân công tài xế</h4>
                            <div className="flex gap-2 flex-wrap">
                                {drivers.map((d) => (
                                    <button key={d.DriverID} onClick={() => assignDriver(d.DriverID)}
                                        className={`btn btn-sm ${selected.DriverName === d.FullName ? "bg-brand text-white" : "border border-slate-300 text-slate-700 hover:bg-slate-50"}`}>
                                        <HiOutlineTruck className="w-4 h-4" />{d.FullName}
                                    </button>
                                ))}
                            </div>
                        </div>}

                        {canManage&&<div className="border-t pt-4">
                            <h4 className="font-medium text-slate-800 mb-2">Phân công phương tiện</h4>
                            <div className="flex gap-2 flex-wrap">
                                {vehicles.map((v) => (
                                    <button key={v.VehicleID} onClick={() => assignVehicle(v.VehicleID)}
                                        className={`btn btn-sm ${selected.LicensePlate === v.LicensePlate ? "bg-emerald-600 text-white" : "border border-slate-300 text-slate-700 hover:bg-slate-50"}`}>
                                        <HiOutlineCube className="w-4 h-4" />{v.LicensePlate} ({v.VehicleType})
                                    </button>
                                ))}
                            </div>
                        </div>}

                        {canManage&&<div className="border-t pt-4">
                            <h4 className="font-medium text-slate-800 mb-2">Cập nhật trạng thái</h4>
                            <div className="flex gap-2 flex-wrap">
                                {Object.keys(statusColors).map((s) => (
                                    <button key={s} onClick={() => updateStatus(s)}
                                        className={`btn btn-sm ${selected.ShipmentStatus === s ? "bg-violet-600 text-white" : "border border-slate-300 text-slate-700 hover:bg-slate-50"}`}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>}

                        <div className="flex justify-end pt-2">
                            <Button variant="success" onClick={() => { navigate(`/tracking/${selected.ShipmentID}`); }}>
                                <HiOutlineLocationMarker className="w-5 h-5" /> Xem trên bản đồ
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
            <Modal isOpen={showCreate} onClose={()=>setShowCreate(false)} title="Tạo chuyến & phân công">
                <form onSubmit={createShipment} className="space-y-4"><p className="notice">Đơn mới thường được tạo chuyến tự động. Chỉ chọn các đơn chưa có chuyến.</p>
                    {[["orderId","Đơn hàng",orders.map(o=>({value:o.OrderID,label:o.OrderCode}))],["warehouseId","Kho xuất hàng",warehouses.map(w=>({value:w.WarehouseID,label:w.WarehouseName}))],["driverId","Tài xế",drivers.map(d=>({value:d.DriverID,label:d.FullName}))],["vehicleId","Phương tiện",vehicles.map(v=>({value:v.VehicleID,label:v.LicensePlate}))]].map(([name,label,options])=><InputField key={name} name={name} label={label} type="select" value={newShipment[name]} onChange={e=>setNewShipment({...newShipment,[name]:e.target.value})} options={options} required={name==="orderId"}/>)}
                    {!orders.length&&<p className="text-sm text-slatex">Không có đơn chưa tạo chuyến trong 100 đơn gần nhất. Bạn có thể phân công tài xế và xe cho chuyến đã có.</p>}
                    <Button type="submit" disabled={submitting||!orders.length}>{submitting?"Đang tạo...":"Tạo chuyến"}</Button>
                </form>
            </Modal>
        </div>
    );
}
