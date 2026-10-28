import { useEffect, useState } from "react";
import api from "../services/api";
import Swal from "sweetalert2";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTruck } from "react-icons/hi";
import Modal from "../components/common/Modal";
import { InputField } from "../components/common/FormField";
import PageHeader from "../components/common/PageHeader";
import Button from "../components/common/Button";
import Spinner from "../components/common/Spinner";
import EmptyState from "../components/common/EmptyState";
import Badge, { statusTone } from "../components/common/Badge";

export default function Vehicles() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ licensePlate: "", vehicleType: "Truck", brand: "", model: "", capacityWeight: "", capacityVolume: "", fuelType: "" });
    const [submitting, setSubmitting] = useState(false);

    const fetchVehicles = () => {
        setLoading(true);
        api.get("/vehicles").then(({ data }) => setVehicles(data.data || data.data?.data || [])).finally(() => setLoading(false));
    };

    useEffect(() => { fetchVehicles(); }, []);

    const openCreate = () => { setEditing(null); setForm({ licensePlate: "", vehicleType: "Truck", brand: "", model: "", capacityWeight: "", capacityVolume: "", fuelType: "" }); setShowForm(true); };
    const openEdit = (v) => { setEditing(v); setForm({ licensePlate: v.LicensePlate, vehicleType: v.VehicleType || "", brand: v.Brand || "", model: v.Model || "", capacityWeight: v.CapacityWeight || "", capacityVolume: v.CapacityVolume || "", fuelType: v.FuelType || "" }); setShowForm(true); };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = { licensePlate: form.licensePlate, vehicleType: form.vehicleType, brand: form.brand, model: form.model, capacityWeight: parseFloat(form.capacityWeight) || null, capacityVolume: parseFloat(form.capacityVolume) || null, fuelType: form.fuelType };
            if (editing) {
                await api.put(`/vehicles/${editing.VehicleID}`, payload);
                Swal.fire({ icon: "success", title: "Updated", timer: 1500, showConfirmButton: false });
            } else {
                await api.post("/vehicles", payload);
                Swal.fire({ icon: "success", title: "Vehicle created", timer: 1500, showConfirmButton: false });
            }
            setShowForm(false);
            fetchVehicles();
        } catch (err) { Swal.fire({ icon: "error", title: "Có lỗi xảy ra", text: err.response?.data?.message || "Thất bại" }); }
        finally { setSubmitting(false); }
    };

    return (
        <div>
            <PageHeader
                title="Phương tiện & bảo trì"
                subtitle="Manage fleet, capacity and fuel types"
                icon={HiOutlineTruck}
                actions={
                    <Button variant="primary" onClick={openCreate}>
                        <HiOutlinePlus className="w-5 h-5" /> Thêm phương tiện
                    </Button>
                }
            />
            <div className="table-wrap">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="th">Plate</th>
                            <th className="th">Loại</th>
                            <th className="th">Hãng xe</th>
                            <th className="th">Mẫu xe</th>
                            <th className="th">Tải trọng</th>
                            <th className="th">Tài xế</th>
                            <th className="th">Trạng thái</th>
                            <th className="th text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={8} className="td text-center"><Spinner /></td></tr>
                        ) : vehicles.length === 0 ? (
                            <tr><td colSpan={8}><EmptyState icon={HiOutlineTruck} title="No vehicles" description="Add a vehicle to your fleet to get started." /></td></tr>
                        ) : (
                            vehicles.map((v) => (
                                <tr key={v.VehicleID} className="row-hover">
                                    <td className="td font-medium">{v.LicensePlate}</td>
                                    <td className="td">{v.VehicleType}</td>
                                    <td className="td">{v.Brand}</td>
                                    <td className="td">{v.Model}</td>
                                    <td className="td">{v.CapacityWeight} kg</td>
                                    <td className="td">{v.DriverName || "N/A"}</td>
                                    <td className="td"><Badge tone={statusTone(v.Status)}>{v.Status}</Badge></td>
                                    <td className="td text-right"><button onClick={() => openEdit(v)} className="btn btn-link p-0"><HiOutlinePencil className="w-5 h-5" /></button></td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? "Chỉnh sửa phương tiện" : "Thêm phương tiện"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Biển số" name="licensePlate" value={form.licensePlate} onChange={handleChange} required />
                        <InputField label="Loại phương tiện" type="select" name="vehicleType" value={form.vehicleType} onChange={handleChange} options={[{ value: "Truck", label: "Truck" }, { value: "Van", label: "Van" }, { value: "Car", label: "Car" }, { value: "Motorbike", label: "Motorbike" }]} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Hãng xe" name="brand" value={form.brand} onChange={handleChange} />
                        <InputField label="Mẫu xe" name="model" value={form.model} onChange={handleChange} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Capacity Weight (kg)" type="number" name="capacityWeight" value={form.capacityWeight} onChange={handleChange} />
                        <InputField label="Capacity Volume (m3)" type="number" name="capacityVolume" value={form.capacityVolume} onChange={handleChange} />
                    </div>
                    <InputField label="Fuel Type" name="fuelType" value={form.fuelType} onChange={handleChange} />
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline">Hủy</button>
                        <button type="submit" disabled={submitting} className="btn btn-primary disabled:opacity-50">{submitting ? "Đang lưu..." : editing ? "Update" : "Create"}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
