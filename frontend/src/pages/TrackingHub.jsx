import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import useCollection from "../hooks/useCollection";
import PageHeader from "../components/common/PageHeader";
import Button from "../components/common/Button";
import Badge,{statusTone} from "../components/common/Badge";
import Spinner from "../components/common/Spinner";
export default function TrackingHub(){
    const {user}=useAuth(),navigate=useNavigate(),customer=(user?.roleName||user?.Role||user?.role)==="CUSTOMER";
    const {rows,loading,error}=useCollection(customer?"/orders":"/shipments",{limit:100});
    const [id,setId]=useState("");
    return <div className="space-y-6"><PageHeader title={customer?"Theo dõi giao hàng":"Theo dõi GPS trực tiếp"} subtitle="Chọn một chuyến để xem vị trí, hành trình và dự đoán ETA."/>
        <form className="card flex flex-wrap gap-3" onSubmit={e=>{e.preventDefault();if(/^\d+$/.test(id))navigate("/tracking/"+id);}}><input className="input flex-1 min-w-40" type="number" min="1" required placeholder="Nhập mã số chuyến hàng" aria-label="Mã số chuyến hàng" value={id} onChange={e=>setId(e.target.value)}/><Button type="submit">Theo dõi</Button></form>
        {error&&<p role="alert" className="notice error-notice">{error}</p>}
        <div className="table-wrap"><table className="w-full"><thead><tr>{["Đơn hàng","Chuyến hàng","Trạng thái","Hành động"].map(t=><th className="th" key={t}>{t}</th>)}</tr></thead><tbody>{loading?<tr><td colSpan={4}><Spinner/></td></tr>:rows.map(r=><tr key={r.OrderID||r.ShipmentID}><td className="td">{r.OrderCode}</td><td className="td">{r.ShipmentID?"SHP-"+r.ShipmentID:"Chưa tạo chuyến"}</td><td className="td"><Badge tone={statusTone(r.ShipmentStatus||r.OrderStatus)}>{r.ShipmentStatus||r.OrderStatus}</Badge></td><td className="td">{r.ShipmentID?<Link className="btn btn-sm btn-outline" to={`/tracking/${r.ShipmentID}`}>Xem hành trình</Link>:<span className="text-slatex">Chờ điều phối</span>}</td></tr>)}{!loading&&!rows.length&&<tr><td colSpan={4} className="td text-center">Chưa có chuyến hàng để theo dõi.</td></tr>}</tbody></table></div>
    </div>;
}
