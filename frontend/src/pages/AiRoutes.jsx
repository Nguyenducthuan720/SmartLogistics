import { useState, useEffect } from "react";
import api from "../services/api";
import { geocodeAddress, getRoute } from "../services/map.service";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { HiOutlineLightningBolt, HiOutlineClock, HiOutlineLocationMarker } from "react-icons/hi";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";

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
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }, [map, bounds]);
    return null;
}

export default function AiRoutes() {
    const [pickupAddress, setPickupAddress] = useState("Vo Van Ngan, Thu Duc, Ho Chi Minh");
    const [deliveryAddress, setDeliveryAddress] = useState("Tran Thai Tong, Cau Giay, Ha Noi");
    const [pickup, setPickup] = useState({ lat: 10.8231, lng: 106.6297, label: "Pickup Point" });
    const [delivery, setDelivery] = useState({ lat: 10.8500, lng: 106.7720, label: "Delivery Point" });
    const [result, setResult] = useState(null);
    const [route, setRoute] = useState(null);
    const [loading, setLoading] = useState(false);
    const [etaLoading, setEtaLoading] = useState(false);
    const [etaResult, setEtaResult] = useState(null);
    const [shipmentId, setShipmentId] = useState("");

    const optimize = async () => {
        setLoading(true);
        try {
            const [pResults, dResults] = await Promise.all([
                geocodeAddress(pickupAddress, 1),
                geocodeAddress(deliveryAddress, 1)
            ]);

            const p = pResults[0];
            const d = dResults[0];
            if (!p || !d) {
                alert("Could not resolve one of the addresses. Please use a more specific address.");
                return;
            }

            setPickup({ lat: p.latitude, lng: p.longitude, label: p.displayName });
            setDelivery({ lat: d.latitude, lng: d.longitude, label: d.displayName });

            const [{ data }, road] = await Promise.all([
                api.post("/ai/optimize-route", {
                    pickupLat: p.latitude, pickupLng: p.longitude,
                    deliveryLat: d.latitude, deliveryLng: d.longitude
                }),
                getRoute(p.latitude, p.longitude, d.latitude, d.longitude).catch(() => null)
            ]);
            setResult(data.data);
            setRoute(road);
        } catch {
            alert("Optimization failed");
        } finally {
            setLoading(false);
        }
    };

    const predictEta = async () => {
        if (!shipmentId) return;
        setEtaLoading(true);
        try {
            const { data } = await api.get(`/ai/predict-eta/${shipmentId}`);
            setEtaResult(data.data);
        } catch {
            alert("ETA prediction failed");
        } finally {
            setEtaLoading(false);
        }
    };

    const center = [pickup.lat, pickup.lng];

    return (
        <div>
            <PageHeader
                title="AI tối ưu tuyến đường"
                subtitle="Enter real street addresses — they are geocoded to coordinates automatically."
                icon={HiOutlineLightningBolt}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <Card>
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <HiOutlineLightningBolt className="w-5 h-5 text-yellow-500" />Route Optimizer (GA)
                        </h3>
                        <div className="space-y-3 mb-4">
                            <div>
                                <label className="label">Pickup address</label>
                                <input value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)}
                                    className="input" placeholder="Street, district, city" />
                            </div>
                            <div>
                                <label className="label">Delivery address</label>
                                <input value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)}
                                    className="input" placeholder="Street, district, city" />
                            </div>
                        </div>
                        <Button onClick={optimize} disabled={loading} className="w-full">
                            {loading ? "Resolving & optimizing..." : "Tối ưu tuyến"}
                        </Button>

                        {(pickup.label !== "Pickup Point" || delivery.label !== "Delivery Point") && (
                            <div className="mt-4 space-y-1 text-xs text-gray-500">
                                <p className="flex items-start gap-1"><HiOutlineLocationMarker className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" /><span><b>Pickup:</b> {pickup.label}</span></p>
                                <p className="flex items-start gap-1"><HiOutlineLocationMarker className="w-4 h-4 text-red-500 mt-0.5 shrink-0" /><span><b>Delivery:</b> {delivery.label}</span></p>
                            </div>
                        )}

                        {result && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-2xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge tone={result.source === "python" ? "green" : "amber"}>
                                        {result.source === "python" ? "Python AI" : "Node.js AI"}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div><span className="text-gray-500">Khoảng cách:</span> <span className="font-medium ml-1">{result.estimatedDistance?.toFixed(2)} km</span></div>
                                    <div><span className="text-gray-500">Confidence:</span> <span className="font-medium ml-1">{result.confidenceScore}%</span></div>
                                    <div><span className="text-gray-500">Fitness:</span> <span className="font-medium ml-1">{result.fitnessScore}</span></div>
                                    <div><span className="text-gray-500">Tuyến:</span> <span className="font-medium ml-1">{result.optimalRoute?.RouteCode || "Direct"}</span></div>
                                    {route && <div><span className="text-gray-500">Road:</span> <span className="font-medium ml-1">{route.distanceKm} km</span></div>}
                                    {route && <div><span className="text-gray-500">Thời gian chạy:</span> <span className="font-medium ml-1">{route.durationMinutes} min</span></div>}
                                </div>
                            </div>
                        )}
                    </Card>

                    <Card>
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <HiOutlineClock className="w-5 h-5 text-violet-500" />ETA Predictor (ML)
                        </h3>
                        <div className="flex gap-3">
                            <input value={shipmentId} onChange={(e) => setShipmentId(e.target.value)} placeholder="Shipment ID" className="input flex-1" />
                            <Button variant="outline" onClick={predictEta} disabled={etaLoading}>
                                {etaLoading ? "..." : "Predict"}
                            </Button>
                        </div>

                        {etaResult && (
                            <div className="mt-4 p-4 bg-violet-50 rounded-2xl text-sm space-y-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge tone={etaResult.source === "python" ? "green" : "amber"}>
                                        {etaResult.source === "python" ? "Python AI" : "Node.js AI"}
                                    </Badge>
                                </div>
                                <div><span className="text-gray-500">ETA:</span> <span className="font-medium ml-1">{new Date(etaResult.predictedETA).toLocaleString()}</span></div>
                                <div><span className="text-gray-500">Confidence:</span> <span className="font-medium ml-1">{etaResult.confidenceScore}%</span></div>
                                {etaResult.estimatedMinutes && <div><span className="text-gray-500">Duration:</span> <span className="font-medium ml-1">{Math.round(etaResult.estimatedMinutes)} min</span></div>}
                                {etaResult.effectiveSpeedKmh && <div><span className="text-gray-500">Speed:</span> <span className="font-medium ml-1">{etaResult.effectiveSpeedKmh} km/h</span></div>}
                                <div><span className="text-gray-500">Method:</span> <span className="font-medium ml-1">{etaResult.method || etaResult.source}</span></div>
                            </div>
                        )}
                    </Card>
                </div>

                <Card className="overflow-hidden p-0 h-[500px]">
                    <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <FitBounds bounds={[[pickup.lat, pickup.lng], [delivery.lat, delivery.lng]]} />
                        <Marker position={[pickup.lat, pickup.lng]} icon={pinIcon("#2563eb")}>
                            <Popup>{pickup.label}</Popup>
                        </Marker>
                        <Marker position={[delivery.lat, delivery.lng]} icon={pinIcon("#ef4444")}>
                            <Popup>{delivery.label}</Popup>
                        </Marker>
                        {route && route.geometry && route.geometry.length > 0
                            ? <Polyline positions={route.geometry} pathOptions={{ color: "#2563eb", weight: 5, opacity: 0.9 }} />
                            : <Polyline positions={[[pickup.lat, pickup.lng], [delivery.lat, delivery.lng]]} pathOptions={{ color: "#2563eb", weight: 3, opacity: 0.7 }} />}
                    </MapContainer>
                </Card>
            </div>
        </div>
    );
}
