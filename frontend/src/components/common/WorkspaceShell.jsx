import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { HiOutlineHome, HiOutlineClipboardList, HiOutlineTruck, HiOutlineUserGroup, HiOutlineCube, HiOutlineOfficeBuilding, HiOutlineShoppingCart, HiOutlineUsers, HiOutlineShieldCheck, HiOutlineLogout, HiOutlineMenu, HiOutlineX, HiOutlineLightningBolt, HiOutlineChartBar, HiOutlineBell, HiOutlineMap, HiOutlineCash, HiOutlineCog, HiOutlineUser, HiOutlineLocationMarker } from "react-icons/hi";
import Brand from "./Brand";

const managers = ["ADMIN", "WAREHOUSE_MANAGER"];
const all = [...managers, "DRIVER", "CUSTOMER"];
const items = [
    ["/dashboard", "Tổng quan", HiOutlineHome, managers],
    ["/driver-dashboard", "Hôm nay", HiOutlineHome, ["DRIVER"]],
    ["/customer-dashboard", "Tổng quan", HiOutlineHome, ["CUSTOMER"]],
    ["/orders", "Đơn hàng", HiOutlineClipboardList, managers],
    ["/orders", "Đơn hàng của tôi", HiOutlineClipboardList, ["CUSTOMER"]],
    ["/customer-dashboard?create=1", "Tạo đơn hàng", HiOutlineShoppingCart, ["CUSTOMER"]],
    ["/available-jobs", "Chuyến mới", HiOutlineTruck, ["DRIVER"]],
    ["/shipments", "Điều phối", HiOutlineTruck, managers],
    ["/shipments", "Chuyến được giao", HiOutlineTruck, ["DRIVER"]],
    ["/tracking", "Theo dõi GPS", HiOutlineMap, managers],
    ["/tracking", "Theo dõi giao hàng", HiOutlineMap, ["CUSTOMER"]],
    ["/warehouses", "Kho & khu vực", HiOutlineOfficeBuilding, managers],
    ["/inventory", "Tồn kho", HiOutlineCube, managers],
    ["/products", "Sản phẩm", HiOutlineShoppingCart, [...managers, "CUSTOMER"]],
    ["/drivers", "Tài xế", HiOutlineUserGroup, managers],
    ["/vehicles", "Phương tiện", HiOutlineTruck, managers],
    ["/customers", "Khách hàng", HiOutlineUsers, managers],
    ["/ai-routes", "AI tối ưu tuyến", HiOutlineLightningBolt, [...managers, "DRIVER"]],
    ["/map", "Bản đồ địa chỉ", HiOutlineLocationMarker, all],
    ["/wallet", "Ví tài xế", HiOutlineCash, ["DRIVER"]],
    ["/reports", "Báo cáo", HiOutlineChartBar, managers],
    ["/users", "Người dùng", HiOutlineUsers, ["ADMIN"]],
    ["/roles", "Phân quyền", HiOutlineShieldCheck, ["ADMIN"]],
    ["/addresses", "Sổ địa chỉ", HiOutlineLocationMarker, ["CUSTOMER"]],
    ["/notifications", "Thông báo", HiOutlineBell, all],
    ["/settings", "Cài đặt", HiOutlineCog, ["ADMIN"]],
    ["/account", "Tài khoản", HiOutlineUser, all],
];
const roleLabels = { ADMIN: "Quản trị viên", WAREHOUSE_MANAGER: "Quản lý kho", DRIVER: "Tài xế", CUSTOMER: "Khách hàng" };

export default function WorkspaceShell() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const role = user?.roleName || user?.Role || user?.role || "";
    const visible = items.filter(item => item[3].includes(role));
    const name = user?.fullName || user?.FullName || "Người dùng";
    const active = visible.find(item => item[0] === location.pathname + location.search) || visible.find(item => item[0] === location.pathname);
    const workspace = role === "CUSTOMER" ? "CỔNG KHÁCH HÀNG" : role === "DRIVER" ? "KHÔNG GIAN TÀI XẾ" : role === "WAREHOUSE_MANAGER" ? "QUẢN LÝ KHO" : "TRUNG TÂM ĐIỀU HÀNH";
    useEffect(() => { setOpen(false); }, [location.pathname, location.search]);
    useEffect(() => {
        const close = event => { if (event.key === "Escape") setOpen(false); };
        document.addEventListener("keydown", close);
        return () => document.removeEventListener("keydown", close);
    }, []);
    const signOut = async () => {
        try { await logout(); navigate("/login", { replace: true }); }
        catch { navigate("/login", { replace: true }); }
    };
    return <div className={`app-shell flex h-dvh overflow-hidden ${role === "DRIVER" ? "driver-workspace" : ""}`}>
        <a href="#workspace-content" className="skip-link">Đến nội dung chính</a>
        <aside id="workspace-navigation" aria-label="Điều hướng chính" className={`app-sidebar fixed inset-y-0 left-0 z-50 flex flex-col text-white transition-transform lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
            <div className="sidebar-brand"><Brand light /><button className="icon-button lg:hidden" aria-label="Đóng menu" onClick={() => setOpen(false)}><HiOutlineX /></button></div>
            <p className="workspace-label">{workspace}</p>
            <nav className="sidebar-nav">{visible.map(([to, label, Icon]) => <NavLink key={to} to={to}
                className={() => `nav-item ${location.pathname + location.search === to || (!location.search && location.pathname === to) ? "nav-item-active" : ""}`}>
                <Icon aria-hidden="true" /><span>{label}</span>
            </NavLink>)}</nav>
            <div className="sidebar-profile"><span className="profile-avatar">{name[0]}</span><div><strong>{name}</strong><small>{roleLabels[role] || role}</small></div><button className="icon-button" aria-label="Đăng xuất" onClick={signOut}><HiOutlineLogout /></button></div>
        </aside>
        {open && <button className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden" aria-label="Đóng điều hướng" onClick={() => setOpen(false)} />}
        <div className="flex min-w-0 flex-1 flex-col">
            <header className="workspace-header">
                <div className="flex min-w-0 items-center gap-3">
                    <button className="icon-button lg:hidden" aria-label="Mở menu" aria-expanded={open} aria-controls="workspace-navigation" onClick={() => setOpen(true)}><HiOutlineMenu /></button>
                    <div className="workspace-breadcrumb"><span>{role === "CUSTOMER" ? "Khách hàng" : role === "DRIVER" ? "Tài xế" : "Vận hành"}</span><span>/</span><strong>{active?.[1] || "Chi tiết giao hàng"}</strong></div>
                </div>
                <div className="flex items-center gap-3"><time className="header-date">{new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date())}</time><span className="text-xs">VN</span><button className="icon-button" aria-label="Mở thông báo" onClick={() => navigate("/notifications")}><HiOutlineBell /></button></div>
            </header>
            <main id="workspace-content" tabIndex={-1} className="workspace-content min-w-0 flex-1 overflow-y-auto"><div className="workspace-page"><Outlet /></div></main>
        </div>
        {role === "DRIVER" && <nav className="driver-bottom-nav" aria-label="Điều hướng tài xế">{[["/driver-dashboard","Trang chủ",HiOutlineHome],["/shipments","Chuyến",HiOutlineTruck],["/available-jobs","Chuyến mới",HiOutlineClipboardList],["/wallet","Ví",HiOutlineCash],["/account","Tôi",HiOutlineUser]].map(([to,label,Icon]) => <NavLink key={to} to={to}><Icon /><span>{label}</span></NavLink>)}</nav>}
    </div>;
}
