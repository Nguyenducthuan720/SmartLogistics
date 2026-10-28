import { useEffect, useState } from "react";
import api from "../services/api";
import Swal from "sweetalert2";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineOfficeBuilding } from "react-icons/hi";
import Modal from "../components/common/Modal";
import { InputField } from "../components/common/FormField";
import PageHeader from "../components/common/PageHeader";
import Button from "../components/common/Button";
import Spinner from "../components/common/Spinner";
import EmptyState from "../components/common/EmptyState";
import Card from "../components/common/Card";
import { useAuth } from "../contexts/AuthContext";
import Badge, { statusTone } from "../components/common/Badge";

export default function Warehouses() {
    const { user } = useAuth(); const canCreate = (user?.roleName || user?.Role || user?.role) === "ADMIN";
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ warehouseName: "", phone: "", email: "", province: "", district: "", address: "", capacity: "" });
    const [submitting, setSubmitting] = useState(false);

    const [error,setError] = useState("");
    const fetch = async () => { setLoading(true); try { const {data}=await api.get("/warehouses"); setWarehouses(data.data || []);setError(""); } catch(err) {setError(err.response?.data?.message || "Không tải được danh sách kho.");} finally {setLoading(false);} };
    useEffect(() => { fetch(); }, []);

    const openCreate = () => { setEditing(null); setForm({ warehouseName: "", phone: "", email: "", province: "", district: "", address: "", capacity: "" }); setShowForm(true); };
    const openEdit = (w) => { setEditing(w); setForm({ warehouseName: w.WarehouseName, phone: w.Phone || "", email: w.Email || "", province: w.Province || "", district: w.District || "", address: w.Address || "", capacity: w.Capacity || "" }); setShowForm(true); };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = { ...form, capacity: parseInt(form.capacity) || null };
            if (editing) { await api.put(`/warehouses/${editing.WarehouseID}`, payload); Swal.fire({ icon: "success", title: "Đã cập nhật", timer: 1500, showConfirmButton: false }); }
            else { await api.post("/warehouses", payload); Swal.fire({ icon: "success", title: "Đã thêm kho", timer: 1500, showConfirmButton: false }); }
            setShowForm(false); fetch();
        } catch (err) { Swal.fire({ icon: "error", title: "Có lỗi xảy ra", text: err.response?.data?.message || "Thất bại" }); }
        finally { setSubmitting(false); }
    };

    return (
        <div>
            <PageHeader
                title="Kho & khu vực"
                subtitle="Quản lý vị trí, sức chứa và hoạt động của các kho."
                icon={HiOutlineOfficeBuilding}
                actions={
                    canCreate && <Button variant="primary" onClick={openCreate}>
                        <HiOutlinePlus className="w-5 h-5" /> Thêm kho
                    </Button>
                }
            />
            {error && <p role="alert" className="notice error-notice mb-4">{error}</p>}
            {loading ? (
                <Card><div className="flex justify-center py-12"><Spinner /></div></Card>
            ) : warehouses.length === 0 ? (
                <Card><EmptyState icon={HiOutlineOfficeBuilding} title="Chưa có kho" description="Kho sẽ xuất hiện tại đây khi được tạo." action={canCreate && <Button variant="primary" onClick={openCreate}><HiOutlinePlus className="w-5 h-5" /> Thêm kho</Button>} /></Card>
            ) : (
                <div className="table-wrap"><table className="w-full"><thead><tr>{["Kho hàng","Địa chỉ","Liên hệ","Sức chứa","Trạng thái","Thao tác"].map(t=><th className="th" key={t}>{t}</th>)}</tr></thead><tbody>
                    {warehouses.map((w) => (
                        <tr key={w.WarehouseID} className="row-hover"><td className="td font-semibold">{w.WarehouseName}<small className="block text-slatex">{w.WarehouseCode}</small></td><td className="td">{[w.Address,w.District,w.Province].filter(Boolean).join(", ")}</td><td className="td">{w.Phone || "—"}<small className="block text-slatex">{w.Email}</small></td><td className="td">{w.Capacity?.toLocaleString("vi-VN") || "—"}</td><td className="td"><Badge tone={statusTone(w.Status)}>{w.Status}</Badge></td><td className="td"><Button variant="outline" size="sm" onClick={()=>openEdit(w)}><HiOutlinePencil/>Chỉnh sửa</Button></td></tr>
                    ))}
                </tbody></table></div>
            )}
            <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? "Chỉnh sửa kho" : "Thêm kho"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <InputField label="Tên kho" name="warehouseName" value={form.warehouseName} onChange={handleChange} required />
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Số điện thoại" name="phone" value={form.phone} onChange={handleChange} />
                        <InputField label="Email" type="email" name="email" value={form.email} onChange={handleChange} />
                    </div>
                    <InputField label="Địa chỉ" name="address" value={form.address} onChange={handleChange} required />
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Tỉnh / thành" name="province" value={form.province} onChange={handleChange} />
                        <InputField label="Quận / huyện" name="district" value={form.district} onChange={handleChange} />
                    </div>
                    <InputField label="Sức chứa" type="number" name="capacity" value={form.capacity} onChange={handleChange} />
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline">Hủy</button>
                        <button type="submit" disabled={submitting} className="btn btn-primary disabled:opacity-50">{submitting ? "Đang lưu..." : editing ? "Cập nhật" : "Tạo kho"}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

