import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import PageHeader from "../components/common/PageHeader";
import StatCard from "../components/common/StatCard";
import Card from "../components/common/Card";
import Badge, { statusTone } from "../components/common/Badge";
import Spinner from "../components/common/Spinner";
import OperationsMap from "../components/map/OperationsMap";

export default function OperationsDashboard() {
    const { user } = useAuth();
    const [data,setData] = useState(null), [error,setError] = useState("");
    useEffect(() => {
        let cancelled = false;
        async function load() {
            try {
                const [stats,warehouses,shipments] = await Promise.all([api.get("/dashboard/stats"),api.get("/dashboard/warehouses"),api.get("/shipments?limit=5")]);
                if (!cancelled) setData({stats:stats.data.data,warehouses:warehouses.data.data || [],shipments:shipments.data.data || []});
            } catch(err) { if (!cancelled) setError(err.response?.data?.message || "Không tải được dữ liệu vận hành."); }
        }
        load(); return () => { cancelled=true; };
    },[]);
    if(error) return <div role="alert" className="notice error-notice">{error} <button className="btn btn-outline ml-3" onClick={() => window.location.reload()}>Thử lại</button></div>;
    if(!data) return <Spinner />;
    const sum = list => (list || []).reduce((s,r) => s + Number(r.Total || 0),0);
    const total = sum(data.stats.orderStats);
    const pending = data.stats.orderStats?.find(r => r.OrderStatus==="PENDING")?.Total || 0;
    const delivered = data.stats.orderStats?.find(r => r.OrderStatus==="DELIVERED")?.Total || 0;
    const active = sum(data.stats.shipmentStats?.filter(r => !["DELIVERED","CANCELLED"].includes(r.ShipmentStatus)));
    const available = data.stats.driverStats?.find(r => r.Status==="AVAILABLE")?.Total || 0;
    const warehouseRole = (user?.roleName || user?.Role || user?.role)==="WAREHOUSE_MANAGER";
    return <div className="space-y-6">
        <PageHeader title={warehouseRole ? "Không gian quản lý kho" : "Tổng quan vận hành"} subtitle="Mọi chuyến hàng, cùng một nhịp vận hành." actions={<Link to="/reports" className="btn btn-primary">Xem báo cáo</Link>} />
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Tổng đơn hàng" value={total.toLocaleString("vi-VN")} helper={pending+" đơn chờ xác nhận"} />
            <StatCard label="Đang vận chuyển" value={active} helper="Chuyến chưa hoàn tất" />
            <StatCard label="Đã giao" value={delivered} helper="Theo trạng thái đơn hàng" />
            <StatCard label="Tài xế sẵn sàng" value={available} helper={sum(data.stats.vehicleStats)+" phương tiện trong hệ thống"} />
        </section>
        <section className="operations-grid"><OperationsMap /><Card className="operations-pulse">
            <h2>Nhịp vận hành</h2>
            <p className="font-semibold text-brand">● {available} tài xế sẵn sàng</p>
            <Link to="/orders">{pending} đơn cần xác nhận →</Link>
            <Link to="/shipments">{active} chuyến đang thực hiện →</Link>
            <Link to="/warehouses">{data.stats.totalWarehouses || 0} kho đang quản lý →</Link>
            <Link to="/inventory">{data.stats.totalInventoryItems || 0} bản ghi tồn kho →</Link>
            <Link to="/shipments" className="btn btn-outline">Mở điều phối</Link>
        </Card></section>
        <div className="table-wrap"><table className="w-full"><thead><tr>{["Mã chuyến","Kho / Lộ trình","Tài xế","Trạng thái"].map(t=><th key={t} className="th">{t}</th>)}</tr></thead><tbody>
            {data.shipments.map(s=><tr key={s.ShipmentID} className="row-hover"><td className="td"><Link className="text-brand font-medium" to={`/tracking/${s.ShipmentID}`}>SHP-{s.ShipmentID}</Link></td><td className="td">{s.WarehouseName || s.RouteCode || "Chưa phân tuyến"}</td><td className="td">{s.DriverName || "Chưa phân công"}</td><td className="td"><Badge tone={statusTone(s.ShipmentStatus)}>{s.ShipmentStatus}</Badge></td></tr>)}
            {!data.shipments.length && <tr><td className="td text-center" colSpan={4}>Chưa có chuyến hàng.</td></tr>}
        </tbody></table></div>
        <Card><h2 className="font-bold text-lg mb-4">Tổng quan các kho</h2><div className="grid gap-4 sm:grid-cols-3">{data.warehouses.map(w=><Link to="/inventory" key={w.WarehouseID} className="rounded-xl bg-canvas p-4"><strong>{w.WarehouseName}</strong><p className="mt-2 text-sm text-slatex">{w.ProductCount || 0} sản phẩm · {w.TotalQuantity || 0} đơn vị</p></Link>)}</div></Card>
    </div>;
}
