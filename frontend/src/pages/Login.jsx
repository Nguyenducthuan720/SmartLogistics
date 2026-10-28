import AuthLayout from "../components/common/AuthLayout";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";

function getDefaultRoute(role) {
    if (role === "DRIVER") return "/driver-dashboard";
    if (role === "CUSTOMER") return "/customer-dashboard";
    return "/dashboard";
}

export default function Login() {
    const [loginValue, setLoginValue] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        setError("");
        setLoading(true);
        try {
            const res = await login(loginValue, password);
            const role = res.data?.user?.roleName || res.data?.user?.Role || res.data?.user?.role || "";
            window.location.href = getDefaultRoute(role);
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || "Đăng nhập không thành công";
            setError(msg);
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="Chào mừng trở lại" description="Đăng nhập vào không gian làm việc của bạn.">
                    {error && (
                        <div role="alert" className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="login-identity" className="label">Email hoặc tên đăng nhập</label>
                            <input
                                id="login-identity" type="text"
                                value={loginValue}
                                onChange={(e) => setLoginValue(e.target.value)}
                                className="input"
                                placeholder="admin@smartlogistics.com"
                                autoComplete="username"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="login-password" className="label">Mật khẩu</label>
                            <div className="relative">
                                <input
                                    id="login-password" type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input pr-10"
                                    placeholder="Nhập mật khẩu"
                                    autoComplete="current-password"
                                    required
                                />
                                <button type="button" aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn btn-primary w-full">
                            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                        </button>
                    </form>

                    <Link to="/forgot-password" className="block text-sm text-brand mt-4">Quên mật khẩu?</Link>
                    <p className="text-sm text-slate-500 mt-6">
                        Bạn chưa có tài khoản?{" "}
                        <Link to="/register" className="text-brand hover:underline">Đăng ký</Link>
                    </p>

                    <p className="text-center text-xs text-slate-400 mt-3">
                        Quản lý / Tài xế / Khách hàng
                    </p>
        </AuthLayout>
    );
}
