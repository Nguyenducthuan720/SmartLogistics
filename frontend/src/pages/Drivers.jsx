import { useEffect, useState } from "react";
import api from "../services/api";
import Swal from "sweetalert2";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineUserGroup } from "react-icons/hi";
import Modal from "../components/common/Modal";
import { InputField } from "../components/common/FormField";
import PageHeader from "../components/common/PageHeader";
import Button from "../components/common/Button";
import Spinner from "../components/common/Spinner";
import EmptyState from "../components/common/EmptyState";
import Badge, { statusTone } from "../components/common/Badge";

export default function Drivers() {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ userId: "", licenseNumber: "", licenseType: "", licenseExpiry: "", status: "AVAILABLE" });
    const [submitting, setSubmitting] = useState(false);
    const [users, setUsers] = useState([]);

    const fetchDrivers = () => {
        setLoading(true);
        api.get("/drivers").then(({ data }) => setDrivers(data.data || data.data?.data || [])).finally(() => setLoading(false));
    };

    useEffect(() => { fetchDrivers(); }, []);

    const openCreate = async () => {
        try { const { data } = await api.get("/users?limit=100"); setUsers(data.data || []); } catch {}
        setEditing(null);
        setForm({ userId: "", licenseNumber: "", licenseType: "B2", licenseExpiry: "", status: "AVAILABLE" });
        setShowForm(true);
    };

    const openEdit = (d) => {
        setEditing(d);
        setForm({ userId: d.UserID, licenseNumber: d.LicenseNumber, licenseType: d.LicenseType || "", licenseExpiry: d.LicenseExpiry ? d.LicenseExpiry.split("T")[0] : "", status: d.Status });
        setShowForm(true);
    };

    const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editing) {
                await api.put(`/drivers/${editing.DriverID}`, { licenseNumber: form.licenseNumber, licenseType: form.licenseType, licenseExpiry: form.licenseExpiry, status: form.status });
                Swal.fire({ icon: "success", title: "Updated", timer: 1500, showConfirmButton: false });
            } else {
                await api.post("/drivers", { userId: parseInt(form.userId), licenseNumber: form.licenseNumber, licenseType: form.licenseType, licenseExpiry: form.licenseExpiry || null });
                Swal.fire({ icon: "success", title: "Driver created", timer: 1500, showConfirmButton: false });
            }
            setShowForm(false);
            fetchDrivers();
        } catch (err) { Swal.fire({ icon: "error", title: "Có lỗi xảy ra", text: err.response?.data?.message || "Thất bại" }); }
        finally { setSubmitting(false); }
    };

    return (
        <div>
            <PageHeader
                title="Đội ngũ tài xế"
                subtitle="Manage drivers, licenses and availability"
                icon={HiOutlineUserGroup}
                actions={
                    <Button variant="primary" onClick={openCreate}>
                        <HiOutlinePlus className="w-5 h-5" /> Thêm tài xế
                    </Button>
                }
            />

            <div className="table-wrap">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="th">Họ tên</th>
                            <th className="th">Email</th>
                            <th className="th">Giấy phép</th>
                            <th className="th">Trạng thái</th>
                            <th className="th">Phương tiện</th>
                            <th className="th">Rating</th>
                            <th className="th">Trips</th>
                            <th className="th text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={8} className="td text-center"><Spinner /></td></tr>
                        ) : drivers.length === 0 ? (
                            <tr><td colSpan={8}><EmptyState icon={HiOutlineUserGroup} title="No drivers" description="Add your first driver to get started." /></td></tr>
                        ) : (
                            drivers.map((d) => (
                                <tr key={d.DriverID} className="row-hover">
                                    <td className="td font-medium">{d.FullName}</td>
                                    <td className="td">{d.Email}</td>
                                    <td className="td">{d.LicenseNumber}</td>
                                    <td className="td"><Badge tone={statusTone(d.Status)}>{d.Status}</Badge></td>
                                    <td className="td">{d.LicensePlate || "N/A"}</td>
                                    <td className="td">{d.Rating}/5</td>
                                    <td className="td">{d.TotalTrips}</td>
                                    <td className="td text-right">
                                        <button onClick={() => openEdit(d)} className="btn btn-link p-0"><HiOutlinePencil className="w-5 h-5" /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? "Chỉnh sửa tài xế" : "Thêm tài xế"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!editing && (
                        <InputField label="Người dùng" type="select" name="userId" value={form.userId} onChange={handleFormChange} required
                            options={users.map(u => ({ value: u.UserID, label: `${u.FullName} (${u.Email})` }))} />
                    )}
                    <InputField label="Số giấy phép" name="licenseNumber" value={form.licenseNumber} onChange={handleFormChange} required />
                    <InputField label="Hạng giấy phép" name="licenseType" value={form.licenseType} onChange={handleFormChange} />
                    <InputField label="License Expiry" type="date" name="licenseExpiry" value={form.licenseExpiry} onChange={handleFormChange} />
                    {editing && <InputField label="Trạng thái" type="select" name="status" value={form.status} onChange={handleFormChange} options={[{ value: "AVAILABLE", label: "Available" }, { value: "BUSY", label: "Busy" }, { value: "OFFLINE", label: "Offline" }]} />}
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline">Hủy</button>
                        <button type="submit" disabled={submitting} className="btn btn-primary disabled:opacity-50">{submitting ? "Đang lưu..." : editing ? "Update" : "Create"}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
