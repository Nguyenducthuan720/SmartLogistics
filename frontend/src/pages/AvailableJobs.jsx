import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import Swal from "sweetalert2";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { HiOutlineTruck, HiOutlineLocationMarker, HiOutlineCheck } from "react-icons/hi";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import Spinner from "../components/common/Spinner";
import EmptyState from "../components/common/EmptyState";
import Button from "../components/common/Button";

const HCM_COORDS = [10.8231, 106.6297];

function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function AvailableJobs() {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [driver, setDriver] = useState(null);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(null);
    const [driverPos, setDriverPos] = useState({ lat: 10.8231, lng: 106.6297 });

    useEffect(() => {
        async function load() {
            try {
                const [meRes, jobRes] = await Promise.all([api.get("/drivers/me"), api.get("/shipments/available")]);
                setDriver(meRes.data.data);
                const raw = jobRes.data.data || [];
                const enriched = raw.map(j => ({
                    ...j,
                    distance: haversine(driverPos.lat, driverPos.lng, j.WarehouseLat || HCM_COORDS[0], j.WarehouseLng || HCM_COORDS[1])
                })).sort((a, b) => a.distance - b.distance);
                setJobs(enriched);
            } catch {} finally { setLoading(false); }
        }
        load();

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setDriverPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => {}
            );
        }
    }, []);

    const handleAccept = async (job) => {
        if (!driver) return Swal.fire({ icon: "warning", title: "No driver profile", text: "Register as driver first" });
        const { isConfirmed } = await Swal.fire({
            title: "Nhận chuyến giao hàng này?",
            html: `<b>${job.OrderCode}</b><br>${job.PickupAddress || job.WarehouseName} → ${job.DeliveryAddress}<br>Distance: ${job.distance?.toFixed(1) || 0} km<br>Payment: ${(job.TotalAmount || 0).toLocaleString()} VND`,
            icon: "question", showCancelButton: true, confirmButtonText: "Nhận chuyến"
        });
        if (!isConfirmed) return;

        setAccepting(job.ShipmentID);
        try {
            await api.post(`/shipments/${job.ShipmentID}/accept`, { driverId: driver.DriverID });
            Swal.fire({ icon: "success", title: "Đã nhận chuyến!", text: "Vào trang Hôm nay để thực hiện chuyến.", timer: 2500, showConfirmButton: false });
            setJobs(prev => prev.filter(j => j.ShipmentID !== job.ShipmentID));
        } catch (err) {
            Swal.fire({ icon: "error", title: "Thất bại", text: err.response?.data?.message || "Job already taken" });
        } finally { setAccepting(null); }
    };

    if (loading) return <div className="flex justify-center py-12"><Spinner /></div>;

    return (
        <div>
            <PageHeader
                title="Chuyến mới"
                subtitle={`${jobs.length} shipments waiting for a driver`}
                icon={HiOutlineTruck}
                actions={
                    <span className="text-sm text-slate-500">
                        Your location: {driverPos.lat.toFixed(4)}, {driverPos.lng.toFixed(4)}
                    </span>
                }
            />

            {jobs.length > 0 && (
                <Card className="mb-6 overflow-hidden p-0 h-[350px]">
                    <MapContainer center={[driverPos.lat, driverPos.lng]} zoom={12} style={{ height: "100%", width: "100%" }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={[driverPos.lat, driverPos.lng]}>
                            <Popup><b>Bạn đang ở đây</b></Popup>
                        </Marker>
                        {jobs.map(j => {
                            const lat = j.WarehouseLat || HCM_COORDS[0];
                            const lng = j.WarehouseLng || HCM_COORDS[1];
                            return (
                                <Marker key={j.ShipmentID} position={[lat, lng]}>
                                    <Popup>
                                        <b>{j.OrderCode}</b><br />
                                        {j.WarehouseName}<br />
                                        {(j.TotalAmount || 0).toLocaleString()} VND
                                    </Popup>
                                </Marker>
                            );
                        })}
                    </MapContainer>
                </Card>
            )}

            <Card className="overflow-hidden p-0">
                <div className="px-4 py-3 bg-slate-50 border-b flex items-center gap-4 text-xs font-medium text-slate-500 uppercase">
                    <span className="w-8">#</span>
                    <span className="flex-1">Đơn / Tuyến</span>
                    <span className="w-24 text-right">Khoảng cách</span>
                    <span className="w-32 text-right">Thanh toán</span>
                    <span className="w-28 text-center">Thao tác</span>
                </div>
                <div className="divide-y divide-slate-100">
                    {jobs.length === 0 ? (
                        <EmptyState title="Chưa có chuyến mới" description="Vui lòng tải lại hoặc kiểm tra sau." />
                    ) : jobs.map((j, idx) => (
                        <div key={j.ShipmentID} className="px-4 py-3 flex items-center gap-4 hover:bg-blue-50 transition">
                            <span className="w-8 text-sm font-bold text-gray-400">{idx + 1}</span>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800">{j.OrderCode}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <HiOutlineLocationMarker className="w-3 h-3" />
                                    <span className="truncate">{j.WarehouseName || "Lấy hàng"} → {j.DeliveryAddress || "Giao hàng"}</span>
                                </div>
                            </div>
                            <span className="w-24 text-right text-sm font-medium text-brand">{j.distance?.toFixed(1) || "?"} km</span>
                            <span className="w-32 text-right text-sm font-bold text-green-600">{(j.TotalAmount || 0).toLocaleString()} đ</span>
                            <span className="w-28 text-center">
                                <Button variant="success" size="sm" onClick={() => handleAccept(j)} disabled={accepting === j.ShipmentID}>
                                    <HiOutlineCheck className="h-4 w-4" /> {accepting === j.ShipmentID ? "..." : "Accept"}
                                </Button>
                            </span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
