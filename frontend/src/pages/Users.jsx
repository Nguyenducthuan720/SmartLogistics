import { useEffect, useState } from "react";
import api from "../services/api";
import Swal from "sweetalert2";
import { HiOutlinePencil, HiOutlineLockClosed, HiOutlineLockOpen, HiOutlineUsers } from "react-icons/hi";
import Modal from "../components/common/Modal";
import { InputField } from "../components/common/FormField";
import PageHeader from "../components/common/PageHeader";
import Badge, { statusTone } from "../components/common/Badge";
import Button from "../components/common/Button";
import Spinner from "../components/common/Spinner";
import EmptyState from "../components/common/EmptyState";

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showEdit, setShowEdit] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ fullName: "", phone: "", roleId: "", isActive: true, isLocked: false });
    const [roles, setRoles] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const fetchUsers = () => { setLoading(true); api.get("/users").then(({ data }) => setUsers(data.data || [])).finally(() => setLoading(false)); };
    useEffect(() => { fetchUsers(); }, []);

    const openEdit = async (u) => {
        try { const { data } = await api.get("/roles"); setRoles(data.data || []); } catch {}
        setEditing(u);
        setForm({ fullName: u.FullName || "", phone: u.Phone || "", roleId: u.RoleID || "", isActive: u.IsActive, isLocked: u.IsLocked });
        setShowEdit(true);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.put(`/users/${editing.UserID}`, {
                fullName: form.fullName, phone: form.phone,
                roleId: parseInt(form.roleId),
                isActive: form.isActive, isLocked: form.isLocked
            });
            Swal.fire({ icon: "success", title: "Updated", timer: 1500, showConfirmButton: false });
            setShowEdit(false); fetchUsers();
        } catch (err) { Swal.fire({ icon: "error", title: "Có lỗi xảy ra", text: err.response?.data?.message || "Thất bại" }); }
        finally { setSubmitting(false); }
    };

    const toggleLock = async (u) => {
        const action = u.IsLocked ? "unlock" : "lock";
        const { isConfirmed } = await Swal.fire({ title: `${action.charAt(0).toUpperCase() + action.slice(1)} user?`, text: `${u.FullName} (${u.Email})`, icon: "warning", showCancelButton: true });
        if (!isConfirmed) return;
        try {
            await api.put(`/users/${u.UserID}`, { isLocked: !u.IsLocked });
            Swal.fire({ icon: "success", title: `User ${action}ed`, timer: 1500, showConfirmButton: false });
            fetchUsers();
        } catch (err) { Swal.fire({ icon: "error", title: "Có lỗi xảy ra", text: err.response?.data?.message || "Thất bại" }); }
    };

    return (
        <div>
            <PageHeader title="Quản lý người dùng" subtitle="Manage system user accounts" icon={HiOutlineUsers} />
            <div className="table-wrap">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="th">Họ tên</th>
                            <th className="th">Tên đăng nhập</th>
                            <th className="th">Email</th>
                            <th className="th">Vai trò</th>
                            <th className="th">Số điện thoại</th>
                            <th className="th">Trạng thái</th>
                            <th className="th text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} className="td text-center"><Spinner /></td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan={7} className="td"><EmptyState title="No users" description="There are no users to display." /></td></tr>
                        ) : users.map((u) => {
                            const statusLabel = u.IsLocked ? "Locked" : u.IsActive ? "Active" : "Inactive";
                            return (
                                <tr key={u.UserID} className="row-hover">
                                    <td className="td font-medium">{u.FullName}</td>
                                    <td className="td">{u.Username}</td>
                                    <td className="td">{u.Email}</td>
                                    <td className="td">{u.Role}</td>
                                    <td className="td">{u.Phone || "N/A"}</td>
                                    <td className="td"><Badge tone={statusTone(statusLabel)}>{statusLabel}</Badge></td>
                                    <td className="td text-right space-x-2">
                                        <button onClick={() => openEdit(u)} className="text-brand hover:text-brand-dark align-middle"><HiOutlinePencil className="h-5 w-5 inline" /></button>
                                        <button onClick={() => toggleLock(u)} className={`align-middle ${u.IsLocked ? "text-emerald-600 hover:text-emerald-700" : "text-rose-600 hover:text-rose-700"}`}>
                                            {u.IsLocked ? <HiOutlineLockOpen className="h-5 w-5 inline" /> : <HiOutlineLockClosed className="h-5 w-5 inline" />}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title={`Edit ${editing?.FullName || ""}`}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <InputField label="Họ và tên" name="fullName" value={form.fullName} onChange={handleChange} />
                    <InputField label="Số điện thoại" name="phone" value={form.phone} onChange={handleChange} />
                    <InputField label="Vai trò" type="select" name="roleId" value={form.roleId} onChange={handleChange} options={roles.map(r => ({ value: r.RoleID, label: r.RoleName }))} />
                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="w-4 h-4" /> Active</label>
                        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isLocked" checked={form.isLocked} onChange={handleChange} className="w-4 h-4" /> Locked</label>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={() => setShowEdit(false)}>Hủy</Button>
                        <Button type="submit" disabled={submitting}>{submitting ? "Đang lưu..." : "Lưu"}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
