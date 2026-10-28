import { useEffect, useState } from "react";
import api from "../services/api";
import { HiOutlineChartBar, HiOutlineCash, HiOutlineUserGroup } from "react-icons/hi";
import PageHeader from "../components/common/PageHeader";
import StatCard from "../components/common/StatCard";
import Spinner from "../components/common/Spinner";
import Badge, { statusTone } from "../components/common/Badge";

export default function Reports() {
    const [orders, setOrders] = useState([]);
    const [revenue, setRevenue] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get("/reports/orders"),
            api.get("/reports/revenue"),
            api.get("/reports/drivers")
        ]).then(([oRes, rRes, dRes]) => {
            setOrders(oRes.data.data || []);
            setRevenue(rRes.data.data || []);
            setDrivers(dRes.data.data || []);
        }).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex justify-center py-12"><Spinner /></div>;

    const totalRevenue = revenue.reduce((s, r) => s + (r.Revenue || 0), 0);

    return (
        <div>
            <PageHeader title="Báo cáo & phân tích" icon={HiOutlineChartBar} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                <StatCard label="Tổng doanh thu" value={`${totalRevenue.toLocaleString()} VND`} icon={HiOutlineCash} tone="green" />
                <StatCard label="Tổng đơn hàng" value={orders.reduce((s, o) => s + (o.Count || 0), 0)} icon={HiOutlineChartBar} tone="blue" />
                <StatCard label="Đội ngũ tài xế" value={drivers.length} icon={HiOutlineUserGroup} tone="violet" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="table-wrap">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="th">Trạng thái</th>
                                <th className="th text-right">Count</th>
                                <th className="th text-right">Doanh thu</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {orders.map((o, i) => (
                                <tr key={i} className="row-hover">
                                    <td className="td"><Badge tone={statusTone(o.OrderStatus)}>{o.OrderStatus}</Badge></td>
                                    <td className="td text-right">{o.Count}</td>
                                    <td className="td text-right">{(o.Revenue || 0).toLocaleString()} VND</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="table-wrap">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="th">Tài xế</th>
                                <th className="th text-right">Trips</th>
                                <th className="th text-right">Rating</th>
                                <th className="th text-right">Avg Delivery</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {drivers.map((d, i) => (
                                <tr key={i} className="row-hover">
                                    <td className="td font-medium">{d.DriverName}</td>
                                    <td className="td text-right">{d.CompletedShipments}</td>
                                    <td className="td text-right">{d.Rating}/5</td>
                                    <td className="td text-right">{Math.round(d.AvgDeliveryMinutes || 0)} min</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
