import AuthLayout from "../components/common/AuthLayout";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";


export default function Register() {
    const [form, setForm] = useState({ fullName: "", username: "", email: "", password: "", phone: "" });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            await register(form);
            setSuccess("Đăng ký thành công! Đang chuyển trang...");
            setTimeout(() => navigate("/login"), 1500);
        } catch (err) {
            setError(err.response?.data?.message || "Đăng ký không thành công");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="Tạo tài khoản mới" description="Kết nối với mạng lưới giao nhận của bạn.">
                    {error && <div role="alert" className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm">{error}</div>}
                    {success && <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl text-sm">{success}</div>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="register-fullName" className="label">Họ và tên</label>
                            <input id="register-fullName" name="fullName" value={form.fullName} onChange={handleChange} className="input" required />
                        </div>
                        <div>
                            <label htmlFor="register-username" className="label">Tên đăng nhập</label>
                            <input id="register-username" name="username" value={form.username} onChange={handleChange} className="input" required minLength={3} />
                        </div>
                        <div>
                            <label htmlFor="register-email" className="label">Email</label>
                            <input id="register-email" name="email" type="email" value={form.email} onChange={handleChange} className="input" required />
                        </div>
                        <div>
                            <label htmlFor="register-password" className="label">Mật khẩu</label>
                            <input id="register-password" name="password" type="password" value={form.password} onChange={handleChange} className="input" required minLength={6} />
                        </div>
                        <div>
                            <label htmlFor="register-phone" className="label">Số điện thoại</label>
                            <input id="register-phone" name="phone" value={form.phone} onChange={handleChange} className="input" />
                        </div>
                        <button type="submit" disabled={loading} className="btn btn-primary w-full">
                            {loading ? "Đang tạo..." : "Tạo tài khoản"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-500 mt-6">
                        Already have an account?{" "}
                        <Link to="/login" className="text-brand hover:underline">Đăng nhập</Link>
                    </p>
        </AuthLayout>
    );
}
