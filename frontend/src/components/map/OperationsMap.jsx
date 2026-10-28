import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useSocket } from "../../contexts/SocketContext";
import { useEffect, useState } from "react";

export default function OperationsMap() {
    const socket = useSocket();
    const [positions, setPositions] = useState({});
    const [connected, setConnected] = useState(Boolean(socket?.connected));
    useEffect(() => {
        if (!socket) return;
        const connect = () => setConnected(true);
        const disconnect = () => setConnected(false);
        const update = loc => {
            const lat = Number(loc.latitude), lng = Number(loc.longitude);
            if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return;
            setPositions(prev => ({ ...prev, [loc.driverId]: { ...loc, lat, lng, receivedAt:Date.now() } }));
        };
        socket.on("connect", connect); socket.on("disconnect", disconnect); socket.on("driver:location:update", update);
        return () => { socket.off("connect", connect); socket.off("disconnect", disconnect); socket.off("driver:location:update", update); };
    }, [socket]);
    return <div className="operations-map">
        <MapContainer center={[10.8231,106.6297]} zoom={11} scrollWheelZoom={false} zoomControl={false}>
            <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {Object.entries(positions).map(([id, loc]) => <CircleMarker key={id} center={[loc.lat,loc.lng]} radius={8} pathOptions={{ color:"white", fillColor:"#087f75", fillOpacity:1, weight:3 }}><Popup>{loc.driverName || "Tài xế"}<br />{new Date(loc.receivedAt).toLocaleTimeString("vi-VN")}</Popup></CircleMarker>)}
        </MapContainer>
        <div className="map-caption">TP. HỒ CHÍ MINH · {connected ? Object.keys(positions).length ? "VỊ TRÍ TRỰC TIẾP" : "ĐANG CHỜ VỊ TRÍ GPS" : "ĐANG KẾT NỐI GPS"}</div>
    </div>;
}
