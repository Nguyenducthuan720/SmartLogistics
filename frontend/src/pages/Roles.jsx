import { useEffect, useState } from "react";
import api from "../services/api";
import Swal from "sweetalert2";
import { HiOutlineShieldCheck } from "react-icons/hi";
import Modal from "../components/common/Modal";
import PageHeader from "../components/common/PageHeader";
import Badge, { statusTone } from "../components/common/Badge";
import Button from "../components/common/Button";
import Spinner from "../components/common/Spinner";
import EmptyState from "../components/common/EmptyState";

export default function Roles() {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPerms, setShowPerms] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [selectedPerms, setSelectedPerms] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        Promise.all([api.get("/roles"), api.get("/permissions?grouped=true")])
            .then(([rRes, pRes]) => { setRoles(rRes.data.data || []); setPermissions(pRes.data.data || {}); })
            .finally(() => setLoading(false));
    }, []);

    const openPermissions = async (role) => {
        setSelectedRole(role);
        try {
            const { data } = await api.get(`/roles/${role.RoleID}`);
            setSelectedPerms((data.data?.permissions || []).map(p => p.PermissionID));
        } catch { setSelectedPerms([]); }
        setShowPerms(true);
    };

    const togglePerm = (permId) => {
        setSelectedPerms(prev => prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]);
    };

    const savePermissions = async () => {
        setSubmitting(true);
        try {
            await api.put(`/roles/${selectedRole.RoleID}/permissions`, { permissionIds: selectedPerms });
            Swal.fire({ icon: "success", title: "Permissions updated", timer: 1500, showConfirmButton: false });
            setShowPerms(false);
        } catch (err) { Swal.fire({ icon: "error", title: "Có lỗi xảy ra", text: err.response?.data?.message || "Thất bại" }); }
        finally { setSubmitting(false); }
    };

    return (
        <div>
            <PageHeader title="Vai trò & phân quyền" subtitle="Configure access control for your team" icon={HiOutlineShieldCheck} />
            <div className="table-wrap">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="th">ID</th>
                            <th className="th">Họ tên</th>
                            <th className="th">Trạng thái</th>
                            <th className="th">Created</th>
                            <th className="th text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="td text-center"><Spinner /></td></tr>
                        ) : roles.length === 0 ? (
                            <tr><td colSpan={5} className="td"><EmptyState title="No roles" description="There are no roles to display." /></td></tr>
                        ) : roles.map((r) => (
                            <tr key={r.RoleID} className="row-hover">
                                <td className="td font-medium">{r.RoleID}</td>
                                <td className="td font-medium text-ink">{r.RoleName}</td>
                                <td className="td"><Badge tone={statusTone(r.IsActive ? "ACTIVE" : "INACTIVE")}>{r.IsActive ? "Active" : "Inactive"}</Badge></td>
                                <td className="td">{new Date(r.CreatedAt).toLocaleDateString()}</td>
                                <td className="td text-right">
                                    <button onClick={() => openPermissions(r)} className="text-violet-600 hover:text-violet-800 align-middle">
                                        <HiOutlineShieldCheck className="h-5 w-5 inline" /> <span className="text-xs ml-1">Quyền truy cập</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={showPerms} onClose={() => setShowPerms(false)} title={`${selectedRole?.RoleName} - Permissions`} size="lg">
                <div className="space-y-4">
                    {Object.entries(permissions).map(([module, perms]) => (
                        <div key={module}>
                            <h4 className="eyebrow mb-2">{module}</h4>
                            <div className="flex flex-wrap gap-2">
                                {perms.map(p => (
                                    <button key={p.PermissionID} onClick={() => togglePerm(p.PermissionID)}
                                        className={`px-3 py-1.5 text-xs rounded-lg border transition ${selectedPerms.includes(p.PermissionID) ? "bg-brand text-white border-brand" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
                                        {p.PermissionName.replace("_", " ")}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button type="button" variant="outline" onClick={() => setShowPerms(false)}>Hủy</Button>
                        <Button onClick={savePermissions} disabled={submitting}>{submitting ? "Đang lưu..." : "Lưu phân quyền"}</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
