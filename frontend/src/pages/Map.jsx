import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../services/api";
import { geocodeAddress, reverseGeocode } from "../services/map.service";
import AddressAutocomplete from "../components/map/AddressAutocomplete";
import {
    HiOutlineLocationMarker,
    HiOutlineOfficeBuilding,
    HiOutlineClipboardList,
    HiOutlineSearch,
    HiOutlineMap
} from "react-icons/hi";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import Spinner from "../components/common/Spinner";

const DEFAULT_CENTER = [10.8231, 106.6297];

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

function Recenter({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) map.setView(center, Math.max(map.getZoom(), 14));
    }, [center, map]);
    return null;
}

function ClickHandler({ onPick }) {
    const map = useMap();
    useEffect(() => {
        const handler = (e) => onPick(e.latlng.lat, e.latlng.lng);
        map.on("click", handler);
        return () => map.off("click", handler);
    }, [map, onPick]);
    return null;
}

function detailRows(selected) {
    if (!selected) return [];
    if (selected.address) {
        const a = selected.address;
        return [
            ["House number", a.houseNumber],
            ["Street / Road", a.road],
            ["Suburb", a.suburb],
            ["District", a.district],
            ["Thành phố", a.city],
            ["Province / State", a.state],
            ["Postal code", a.postcode],
            ["Country", a.country]
        ].filter(([, v]) => v);
    }
    return [["Địa chỉ", selected.displayName || selected.addressText || selected.title || ""]];
}

export default function Map() {
    const [selected, setSelected] = useState(null);
    const [selectedKind, setSelectedKind] = useState("");
    const [resolving, setResolving] = useState(false);
    const [orders, setOrders] = useState([]);
    const [warehouses, setWarehouses] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const [oRes, wRes] = await Promise.all([
                    api.get("/orders", { params: { limit: 20 } }),
                    api.get("/warehouses")
                ]);
                setOrders(oRes.data.data || []);
                setWarehouses(wRes.data.data || []);
            } catch {}
        })();
    }, []);

    const selectFromSearch = (r) => {
        setSelected(r);
        setSelectedKind("search");
    };

    const handleMapClick = async (lat, lng) => {
        setResolving(true);
        try {
            const r = await reverseGeocode(lat, lng);
            if (r) {
                setSelected(r);
                setSelectedKind("click");
            }
        } catch {} finally {
            setResolving(false);
        }
    };

    const selectOrder = async (o) => {
        const address = `${o.DeliveryAddress || ""}, ${o.DeliveryProvince || ""}`.trim().replace(/^,\s*|,\s*$/g, "");
        if (!address) return;
        try {
            const results = await geocodeAddress(address, 1);
            if (results.length) {
                setSelected({ ...results[0], title: `${o.OrderCode} — Delivery`, addressText: address });
                setSelectedKind("order");
            }
        } catch {}
    };

    const selectWarehouse = (w) => {
        const lat = parseFloat(w.Latitude);
        const lng = parseFloat(w.Longitude);
        setSelected({
            displayName: `${w.WarehouseName}, ${w.Address || ""}, ${w.District || ""}, ${w.Province || ""}`,
            address: { district: w.District, city: w.Province, road: w.Address },
            latitude: lat,
            longitude: lng,
            title: w.WarehouseName,
            addressText: `${w.Address || ""}, ${w.District || ""}, ${w.Province || ""}`
        });
        setSelectedKind("warehouse");
    };

    const center = selected && Number.isFinite(selected.latitude) && Number.isFinite(selected.longitude)
        ? [selected.latitude, selected.longitude]
        : DEFAULT_CENTER;

    const selectedLabel = selected?.displayName || selected?.addressText || selected?.title || "Selected location";
    const rows = detailRows(selected);

    return (
        <div>
            <PageHeader
                title="Bản đồ địa chỉ"
                subtitle="Search detailed street addresses or click the map to resolve an address — like Google Maps."
                icon={HiOutlineMap}
            />

            <div className="flex flex-col lg:flex-row gap-4" style={{ height: "calc(100vh - 200px)", minHeight: 520 }}>
                <div className="w-full lg:w-96 shrink-0 flex flex-col gap-4 overflow-y-auto pr-1">
                    <Card>
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <HiOutlineSearch className="w-5 h-5 text-brand" /> Search address
                        </h3>
                        <AddressAutocomplete onSelect={selectFromSearch} placeholder="e.g. 1 Vo Van Ngan, Thu Duc, Ho Chi Minh" />
                    </Card>

                    {selected && (
                        <Card>
                            <div className="flex items-start gap-3">
                                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand/10 text-brand">
                                    <HiOutlineLocationMarker className="w-6 h-6" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs uppercase tracking-wide text-gray-400">
                                        {selectedKind === "order" ? "Delivery address" : selectedKind === "warehouse" ? "Kho" : "Selected location"}
                                    </p>
                                    <p className="font-semibold text-gray-800 leading-snug">{selected.title || "Result"}</p>
                                    <p className="text-sm text-gray-600 mt-1 leading-snug">{selectedLabel}</p>
                                </div>
                            </div>

                            {rows.length > 0 && (
                                <div className="mt-4 border-t pt-3 space-y-1.5">
                                    {rows.map(([k, v]) => (
                                        <div key={k} className="flex justify-between text-sm">
                                            <span className="text-gray-500">{k}</span>
                                            <span className="text-gray-800 font-medium text-right ml-3">{v}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {Number.isFinite(selected.latitude) && (
                                <p className="mt-3 text-xs text-gray-400">
                                    {selected.latitude?.toFixed(6)}, {selected.longitude?.toFixed(6)}
                                </p>
                            )}
                        </Card>
                    )}

                    <Card>
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <HiOutlineClipboardList className="w-5 h-5 text-brand" /> Delivery locations
                        </h3>

                        <p className="text-xs text-gray-400 mb-2">Kho & khu vực</p>
                        {warehouses.length === 0 && <p className="text-sm text-gray-400">No warehouses</p>}
                        <div className="space-y-1.5 mb-3">
                            {warehouses.map((w) => (
                                <button key={w.WarehouseID} onClick={() => selectWarehouse(w)}
                                    className="w-full flex items-start gap-2 text-left px-3 py-2 rounded-xl hover:bg-emerald-50 text-sm">
                                    <HiOutlineOfficeBuilding className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                                    <span className="text-gray-700 leading-snug">{w.WarehouseName}</span>
                                </button>
                            ))}
                        </div>

                        <p className="text-xs text-gray-400 mb-2">Order delivery addresses</p>
                        {orders.length === 0 && <p className="text-sm text-gray-400">No orders</p>}
                        <div className="space-y-1.5">
                            {orders.map((o) => (
                                <button key={o.OrderID} onClick={() => selectOrder(o)}
                                    className="w-full flex items-start gap-2 text-left px-3 py-2 rounded-xl hover:bg-blue-50 text-sm">
                                    <HiOutlineLocationMarker className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                                    <span className="min-w-0">
                                        <span className="block font-medium text-gray-800">{o.OrderCode}</span>
                                        <span className="block text-xs text-gray-500 leading-snug">{o.DeliveryAddress}, {o.DeliveryProvince}</span>
                                    </span>
                                </button>
                            ))}
                        </div>
                    </Card>
                </div>

                <Card className="flex-1 overflow-hidden relative p-0">
                    <MapContainer center={DEFAULT_CENTER} zoom={13} style={{ height: "100%", width: "100%" }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Recenter center={center} />
                        <ClickHandler onPick={handleMapClick} />

                        {warehouses.map((w) => {
                            const lat = parseFloat(w.Latitude);
                            const lng = parseFloat(w.Longitude);
                            if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
                            return (
                                <Marker key={`w-${w.WarehouseID}`} position={[lat, lng]} icon={pinIcon("#10b981")}>
                                    <Popup>
                                        <b>{w.WarehouseName}</b>
                                        <br />{w.Address}, {w.District}, {w.Province}
                                    </Popup>
                                </Marker>
                            );
                        })}

                        {selected && Number.isFinite(selected.latitude) && Number.isFinite(selected.longitude) && (
                            <Marker position={[selected.latitude, selected.longitude]} icon={pinIcon("#2563eb")}>
                                <Popup>{selectedLabel}</Popup>
                            </Marker>
                        )}
                    </MapContainer>

                    {resolving && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow text-sm text-gray-700">
                            <Spinner className="h-4 w-4" />
                            Resolving address...
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
