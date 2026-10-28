import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { getDriverRating } from "../services/reviews.service";
import { useToast } from "../contexts/ToastContext";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import StatCard from "../components/common/StatCard";
import Button from "../components/common/Button";
import Badge,{statusTone} from "../components/common/Badge";
import Spinner from "../components/common/Spinner";
import Modal from "../components/common/Modal";

const flow={WAITING:{next:"PICKED_UP",label:"Xác nhận đã lấy hàng"},PICKED_UP:{next:"IN_TRANSIT",label:"Bắt đầu giao hàng"},IN_TRANSIT:{next:"DELIVERED",label:"Xác nhận đã giao"}};
export default function DriverHome(){
    const toast=useToast();
    const [driver,setDriver]=useState(null),[shipments,setShipments]=useState([]),[rating,setRating]=useState(null),[available,setAvailable]=useState(0),[loading,setLoading]=useState(true),[error,setError]=useState(""),[updating,setUpdating]=useState(null),[confirm,setConfirm]=useState(null);
    useEffect(()=>{let cancelled=false;async function load(){try{const me=await api.get("/drivers/me");const d=me.data.data;if(cancelled)return;setDriver(d);if(d){const [s,a,r]=await Promise.allSettled([api.get("/shipments",{params:{driverId:d.DriverID,limit:100}}),api.get("/shipments/available"),getDriverRating(d.DriverID)]);if(cancelled)return;if(s.status==="fulfilled")setShipments(s.value.data.data||[]);else throw s.reason;if(a.status==="fulfilled")setAvailable(a.value.data.data?.length||0);if(r.status==="fulfilled")setRating(r.value);}}catch(err){if(!cancelled)setError(err.response?.data?.message||"Không tải được chuyến hàng.");}finally{if(!cancelled)setLoading(false);}}load();return()=>{cancelled=true;};},[]);
    const update=async s=>{const next=flow[s.ShipmentStatus]?.next;if(!next)return;setUpdating(s.ShipmentID);try{await api.put(`/shipments/${s.ShipmentID}/status`,{status:next});setShipments(prev=>prev.map(r=>r.ShipmentID===s.ShipmentID?{...r,ShipmentStatus:next}:r));setConfirm(null);toast?.(next==="DELIVERED"?"Giao hàng thành công.":"Đã cập nhật trạng thái chuyến.","success");}catch(err){toast?.(err.response?.data?.message||"Không cập nhật được trạng thái.","error");}finally{setUpdating(null);}};
    if(loading)return <Spinner/>;
    if(error)return <p role="alert" className="notice error-notice">{error}</p>;
    if(!driver)return <Card><h1 className="page-title">Chưa có hồ sơ tài xế</h1><p className="page-sub">Liên hệ quản trị viên để tạo hồ sơ.</p></Card>;
    const active=shipments.filter(s=>!["DELIVERED","CANCELLED"].includes(s.ShipmentStatus));
    return <div className="space-y-5"><PageHeader title="Tài xế • Hôm nay" subtitle={`Xin chào, ${driver.FullName} • ${driver.LicensePlate||"Chưa gán phương tiện"}`} actions={<Badge tone={statusTone(driver.Status)}>{driver.Status}</Badge>}/>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3"><StatCard label="Chuyến được giao" value={shipments.length}/><StatCard label="Đang thực hiện" value={active.length}/><StatCard label="Đã hoàn tất" value={shipments.filter(s=>s.ShipmentStatus==="DELIVERED").length}/></div>
        {rating&&<p className="text-sm text-slatex">★ {Number(rating.AvgRating||0).toFixed(1)} / 5 · {rating.ReviewCount||0} đánh giá từ khách hàng</p>}
        {active.map(s=><Card key={s.ShipmentID} className="space-y-4"><div className="flex flex-wrap justify-between gap-2"><h2 className="font-bold text-lg">SHP-{s.ShipmentID} · {s.OrderCode}</h2><Badge tone={statusTone(s.ShipmentStatus)}>{s.ShipmentStatus}</Badge></div><p className="text-sm text-slatex">{s.WarehouseName||"Chưa có kho"}{s.RouteCode?" → "+s.RouteCode:""}<br/>{s.LicensePlate||driver.LicensePlate||"Chưa gán xe"}</p><div className="flex flex-wrap gap-3"><Link to={`/tracking/${s.ShipmentID}`} className="btn btn-primary">Tiếp tục chuyến</Link>{flow[s.ShipmentStatus]&&<Button variant="outline" disabled={updating===s.ShipmentID} onClick={()=>s.ShipmentStatus==="IN_TRANSIT"?setConfirm(s):update(s)}>{flow[s.ShipmentStatus].label}</Button>}</div></Card>)}
        {!active.length&&<Card><h2 className="font-bold text-lg mb-2">Bạn đã hoàn tất các chuyến được giao</h2><p className="text-sm text-slatex mb-4">Nhận chuyến mới hoặc xem lịch sử bên dưới.</p><Link to="/available-jobs" className="btn btn-primary">Tìm chuyến mới</Link></Card>}
        {available>0&&<Card><h2 className="font-bold text-lg mb-2">{available} chuyến mới đang chờ</h2><p className="text-sm text-slatex mb-4">Xem điểm lấy hàng và nhận chuyến phù hợp.</p><Link to="/available-jobs" className="btn btn-outline">Xem chuyến mới →</Link></Card>}
        <h2 className="font-bold text-lg">Lịch sử chuyến hàng</h2><div className="table-wrap"><table className="w-full"><thead><tr>{["Chuyến / Đơn","Kho","Trạng thái","Chi tiết"].map(t=><th key={t} className="th">{t}</th>)}</tr></thead><tbody>{shipments.map(s=><tr key={s.ShipmentID}><td className="td">SHP-{s.ShipmentID} · {s.OrderCode}</td><td className="td">{s.WarehouseName||"—"}</td><td className="td"><Badge tone={statusTone(s.ShipmentStatus)}>{s.ShipmentStatus}</Badge></td><td className="td"><Link className="text-brand" to={`/tracking/${s.ShipmentID}`}>Xem hành trình</Link></td></tr>)}</tbody></table></div>
        <Modal isOpen={Boolean(confirm)} onClose={()=>{if(!updating)setConfirm(null);}} title="Xác nhận giao hàng"><div className="space-y-4"><p>Đơn {confirm?.OrderCode} đã được bàn giao đầy đủ cho người nhận?</p><p className="notice">Thao tác này cập nhật trạng thái giao hàng. Ảnh và chữ ký chứng từ chưa được backend hỗ trợ.</p><div className="flex gap-3"><Button variant="outline" disabled={Boolean(updating)} onClick={()=>setConfirm(null)}>Quay lại</Button><Button disabled={Boolean(updating)} onClick={()=>update(confirm)}>{updating?"Đang lưu...":"Xác nhận đã giao"}</Button></div></div></Modal>
    </div>;
}
