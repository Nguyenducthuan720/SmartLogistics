import { Link } from "react-router-dom";
import AuthLayout from "../components/common/AuthLayout";
export default function ForgotPassword(){return <AuthLayout title="Khôi phục mật khẩu" description="Yêu cầu hỗ trợ truy cập tài khoản."><p className="notice mb-6">Hệ thống hiện chưa hỗ trợ gửi liên kết khôi phục qua email. Vui lòng liên hệ quản trị viên của doanh nghiệp để đặt lại mật khẩu.</p><Link to="/login" className="btn btn-primary w-full">Quay lại đăng nhập</Link></AuthLayout>;}
