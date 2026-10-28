import { useAuth } from "../contexts/AuthContext";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import { InputField } from "../components/common/FormField";
export default function Account(){
    const {user}=useAuth();
    return <div className="space-y-6"><PageHeader title="Tài khoản của tôi" subtitle="Thông tin từ phiên đăng nhập hiện tại."/><Card><div className="grid gap-6 sm:grid-cols-2">{[["Họ và tên",user?.fullName||user?.FullName],["Email",user?.email||user?.Email],["Số điện thoại",user?.phone||user?.Phone],["Vai trò",user?.roleName||user?.Role||user?.role]].map(([label,value])=><InputField key={label} label={label} value={value||"Chưa cập nhật"} disabled/>)}</div></Card><p className="notice">Liên hệ quản trị viên để cập nhật thông tin hoặc đặt lại mật khẩu. API hiện tại chưa hỗ trợ tự chỉnh sửa hồ sơ.</p></div>;
}
