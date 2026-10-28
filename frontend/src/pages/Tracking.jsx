import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { getShipmentRoute } from "../services/ai.service";
import { useSocket } from "../contexts/SocketContext";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { HiOutlineLocationMarker, HiOutlineArrowUp, HiOutlineLightningBolt } from "react-icons/hi";
import PageHeader from "../components/common/PageHeader";
import Badge, { statusTone } from "../components/common/Badge";
import Card from "../components/common/Card";
import Spinner from "../components/common/Spinner";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import { useAuth } from "../contexts/AuthContext";
import Modal from "../components/common/Modal";

const defaultCenter = [10.8231, 106.6297];

const pinIcon = (color = "#2563eb") =>
    L.divIcon({
        className: "",
        html: `<svg width="34" height="34" viewBox="0 0 24 24" fill="${color}" stroke="#ffffff" stroke-width="1.5">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.6" fill="#ffffff" stroke="none"/>
        </svg>`,
        iconSize: [34, 34],
        iconAnchor: [17, 32],
        popupAnchor: [0, -30]
    });

function FitBounds({ bounds }) {
    const map = useMap();
    useEffect(() => {
        if (!bounds || bounds.length < 2) return;
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }, [map, bounds]);
    return null;
}

export default function Tracking() {
    const { user } = useAuth();
    const isDriver = (user?.roleName || user?.Role || user?.role) === "DRIVER";
    const { shipmentId } = useParams();
    const [shipment, setShipment] = useState(null);
    const [history, setHistory] = useState([]);
    const [driverPos, setDriverPos] = useState(null);
    const [pickup, setPickup] = useState(null);
    const [delivery, setDelivery] = useState(null);
    const [route, setRoute] = useState(null);
    const [eta, setEta] = useState(null);
    const [etaLoading, setEtaLoading] = useState(false);
    const [error, setError] = useState("");
    const [driverId, setDriverId] = useState(null);
    const [sharing, setSharing] = useState(false);
    const [gpsMessage, setGpsMessage] = useState("");
    const [incident, setIncident] = useState(false);
    const [connected, setConnected] = useState(false);
    const socket = useSocket();

    const fetchETA = async () => {
        setEtaLoading(true);
        try {
            const { data } = await api.get(`/ai/predict-eta/${shipmentId}`);
            setEta(data.data);
        } catch {} finally { setEtaLoading(false); }
    };

    useEffect(() => {
        let cancelled = false;
        setShipment(null); setError(""); setHistory([]); setDriverPos(null); setPickup(null); setDelivery(null); setRoute(null); setEta(null);
        async function load() {
            try {
                const [s,h] = await Promise.all([api.get(`/shipments/${shipmentId}`), api.get(`/tracking/shipment/${shipmentId}`)]);
                if (!cancelled) { setShipment(s.data.data); setHistory(h.data.data || []); }
            } catch(err) { if (!cancelled) setError(err.response?.data?.message || "Không tải được chuyến hàng."); }
        }
        load();
        return () => { cancelled = true; };
    }, [shipmentId]);

    useEffect(() => {
        (async () => {
            try {
                const data = await getShipmentRoute(shipmentId);
                setPickup(data.pickup ? { lat: data.pickup.lat, lng: data.pickup.lng, label: data.pickup.address } : null);
                setDelivery(data.delivery ? { lat: data.delivery.lat, lng: data.delivery.lng, label: data.delivery.address } : null);
                setRoute(data);
                if (data.eta) setEta(data.eta);
            } catch {}
        })();
    }, [shipmentId]);

    useEffect(() => {
        if (!socket) return;
        const join = () => { setConnected(true); socket.emit("join:tracking", shipmentId); };
        const disconnect = () => setConnected(false);
        const entry = value => { if (value.ShipmentID === undefined || String(value.ShipmentID) === String(shipmentId)) setHistory(prev => [value,...prev]); };
        const position = loc => {
            if (String(loc.driverId) !== String(shipment?.DriverID)) return;
            const lat=Number(loc.latitude), lng=Number(loc.longitude);
            if (Number.isFinite(lat) && Number.isFinite(lng)) setDriverPos({lat,lng,name:loc.driverName,updatedAt:loc.updatedAt});
        };
        setConnected(socket.connected);
        if(socket.connected) join();
        socket.on("connect",join); socket.on("disconnect",disconnect); socket.on("tracking:new",entry); socket.on("driver:location:update",position);
        return () => { socket.emit("leave:tracking",shipmentId); socket.off("connect",join); socket.off("disconnect",disconnect); socket.off("tracking:new",entry); socket.off("driver:location:update",position); };
    }, [socket, shipmentId, shipment?.DriverID]);

    useEffect(() => {
        if(!isDriver) return;
        async function profile(){try { const res=await api.get("/drivers/me");setDriverId(res.data.data?.DriverID); } catch { setGpsMessage("Không lấy được hồ sơ tài xế."); }}
        profile();
    },[isDriver]);
    const sendLocation = useCallback(async () => {
        try {
            if(!navigator.geolocation) throw new Error("Trình duyệt không hỗ trợ GPS.");
            if(!socket?.connected) throw new Error("Mất kết nối GPS. Vui lòng thử lại khi có mạng.");
            if(!driverId || String(driverId)!==String(shipment?.DriverID)) throw new Error("Chỉ tài xế được phân công mới chia sẻ vị trí.");
            const pos=await new Promise((resolve,reject)=>navigator.geolocation.getCurrentPosition(resolve,reject,{enableHighAccuracy:true,timeout:10000,maximumAge:4000}));
            if(!socket.connected) return;
            socket.emit("driver:location",{driverId,latitude:pos.coords.latitude,longitude:pos.coords.longitude});
            setGpsMessage("Đã gửi vị trí lúc "+new Date().toLocaleTimeString("vi-VN"));
        } catch(err) { setGpsMessage(err.code===1?"Bạn chưa cho phép truy cập vị trí. Bật quyền GPS để chia sẻ.":err.message||"Không lấy được vị trí."); if(err.code===1)setSharing(false); }
    },[socket,driverId,shipment?.DriverID]);
    useEffect(() => {
        if(!sharing) return;
        sendLocation();
        const timer=setInterval(sendLocation,5000);
        return () => clearInterval(timer);
    },[sharing,sendLocation]);

    if (error) return <div role="alert" className="notice error-notice">{error}<Button variant="outline" onClick={()=>window.location.reload()}>Thử lại</Button></div>;
    if (!shipment) return <div className="flex justify-center py-12"><Spinner /></div>;

    const mapCenter = delivery ? [delivery.lat, delivery.lng] : pickup ? [pickup.lat, pickup.lng] : defaultCenter;
    const fitBounds = [pickup, delivery].filter(Boolean).map((p) => [p.lat, p.lng]);

    return (
        <div>
            <PageHeader
                title={`Theo dõi chuyến SHP-${shipment.ShipmentID}`}
                subtitle={`Đơn hàng ${shipment.OrderCode} • ${connected?"Đã kết nối GPS":"Đang kết nối GPS"}`}
                icon={HiOutlineLocationMarker}
                actions={isDriver && String(driverId)===String(shipment.DriverID) && <div className="flex flex-wrap gap-2"><Button onClick={()=>setSharing(!sharing)}><HiOutlineArrowUp className="h-4 w-4" />{sharing?"Dừng chia sẻ GPS":"Bật GPS mỗi 5 giây"}</Button><Button variant="outline" onClick={()=>setIncident(true)}>Báo sự cố</Button></div>}
            />

            {gpsMessage&&<p className="notice mb-4" role="status">{gpsMessage}</p>}
            {!connected&&<p className="notice mb-4">Đang chờ kết nối. Vị trí mới sẽ hiển thị khi kết nối GPS trở lại.</p>}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 overflow-hidden p-0 h-[450px]">
                    <MapContainer center={mapCenter} zoom={13} style={{ height: "100%", width: "100%" }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <FitBounds bounds={fitBounds} />
                        {route && route.geometry && route.geometry.length > 0 && (
                            <Polyline positions={route.geometry} pathOptions={{ color: "#087f75", weight: 5, opacity: 0.9 }} />
                        )}
                        {pickup && <Marker position={[pickup.lat, pickup.lng]} icon={pinIcon("#2563eb")}><Popup><b>Lấy hàng</b><br />{pickup.label}</Popup></Marker>}
                        {delivery && <Marker position={[delivery.lat, delivery.lng]} icon={pinIcon("#ef4444")}><Popup><b>Giao hàng</b><br />{delivery.label}</Popup></Marker>}
                        {driverPos && <Marker position={[driverPos.lat, driverPos.lng]} icon={pinIcon("#10b981")}><Popup>{driverPos.name || "Tài xế"}</Popup></Marker>}
                    </MapContainer>
                </Card>
                <Card>
                    <h3 className="font-semibold mb-3">Thông tin chuyến</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-gray-500">Trạng thái:</span><Badge tone={statusTone(shipment.ShipmentStatus)}>{shipment.ShipmentStatus}</Badge></div>
                        <div className="flex justify-between"><span className="text-gray-500">Tài xế:</span><span>{shipment.DriverName || "Chưa phân công"}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Phương tiện:</span><span>{shipment.LicensePlate || "N/A"}</span></div>
                        {route?.distanceKm && (
                            <div className="flex justify-between"><span className="text-gray-500">Khoảng cách:</span><span>{route.distanceKm} km</span></div>
                        )}
                        {route?.durationMinutes && (
                            <div className="flex justify-between"><span className="text-gray-500">Thời gian chạy:</span><span>{route.durationMinutes} min</span></div>
                        )}
                    </div>
                    <div className="mt-4 space-y-2 text-sm border-t pt-3">
                        <div className="flex items-start gap-2">
                            <HiOutlineLocationMarker className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                            <div><p className="text-xs text-gray-400">Lấy hàng</p><p className="text-gray-700">{shipment.PickupAddress || "N/A"}, {shipment.PickupProvince || ""}</p></div>
                        </div>
                        <div className="flex items-start gap-2">
                            <HiOutlineLocationMarker className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                            <div><p className="text-xs text-gray-400">Giao hàng</p><p className="text-gray-700">{shipment.DeliveryAddress || "N/A"}, {shipment.DeliveryProvince || ""}</p></div>
                        </div>
                    </div>
                    <h3 className="font-semibold mt-6 mb-3 flex items-center gap-2"><HiOutlineLightningBolt className="w-4 h-4 text-yellow-500" /> Dự đoán AI</h3>
                    {route?.source && (
                        <div className="mb-2">
                            <Badge tone={route.source === "python" ? "green" : "amber"}>{route.source === "python" ? "Python AI" : "Node AI"}</Badge>
                        </div>
                    )}
                    {etaLoading ? <p className="text-xs text-gray-400">Đang tính...</p>
                    : eta ? <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-3 text-sm">
                        <p className="text-xs text-gray-500">Dự kiến đến</p>
                        <p className="font-bold text-purple-700">{new Date(eta.predictedETA).toLocaleString()}</p>
                        <div className="flex justify-between mt-1 text-xs"><span className="text-gray-500">Độ tin cậy</span><span className="font-semibold text-purple-600">{eta.confidenceScore}%</span></div>
                        {eta.estimatedMinutes && <div className="flex justify-between mt-1 text-xs"><span className="text-gray-500">Thời gian</span><span className="font-semibold">{eta.estimatedMinutes} min</span></div>}
                    </div> : <button onClick={fetchETA} className="text-xs text-brand hover:underline">Dự đoán ETA</button>}
                    <h3 className="font-semibold mt-6 mb-3">Lịch sử</h3>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {history.length === 0 && <EmptyState title="Chưa có cập nhật" description="Lịch sử hành trình sẽ xuất hiện tại đây" />}
                        {history.map((h, idx) => (
                            <div key={idx} className="flex gap-3">
                                <div className="relative"><div className={`w-2 h-2 rounded-full mt-1.5 ${idx === 0 ? "bg-brand" : "bg-gray-300"}`} />{idx < history.length - 1 && <div className="absolute top-3 left-1 w-px h-full bg-gray-200" />}</div>
                                <div><p className="text-sm font-medium">{h.Status}</p><p className="text-xs text-gray-500">{h.Description}</p><p className="text-xs text-gray-400">{new Date(h.CreatedAt).toLocaleString()}</p></div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
            <Modal isOpen={incident} onClose={()=>setIncident(false)} title="Sự cố giao hàng"><p className="notice">Vui lòng liên hệ điều phối viên của doanh nghiệp để được xử lý. API hiện tại chưa hỗ trợ gửi báo cáo sự cố và tệp đính kèm; trạng thái chuyến chưa bị thay đổi.</p></Modal>
        </div>
    );
}
