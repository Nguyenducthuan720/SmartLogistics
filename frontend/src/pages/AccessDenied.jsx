import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
export default function AccessDenied(){
    const {user}=useAuth(),role=user?.roleName||user?.Role||user?.role;
    return <section className="state-panel"><strong className="text-6xl text-brand">403</strong><h1>Bạn chưa có quyền truy cập</h1><p>Tài khoản chỉ truy cập thông tin thuộc phạm vi vai trò. Liên hệ quản trị viên nếu cần hỗ trợ.</p><Link className="btn btn-primary" to={role==="DRIVER"?"/driver-dashboard":role==="CUSTOMER"?"/customer-dashboard":"/dashboard"}>Về trang chủ</Link></section>;
}
