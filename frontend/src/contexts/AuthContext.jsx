import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { login as loginApi, register as registerApi, getProfile, logout as logoutApi } from "../services/auth.service";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadUser = useCallback(async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            const res = await getProfile();
            setUser(res.data);
        } catch {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    const login = async (loginValue, password) => {
        const res = await loginApi(loginValue, password);
        localStorage.setItem("accessToken", res.data.accessToken);
        localStorage.setItem("refreshToken", res.data.refreshToken);
        setUser(res.data.user);
        return res;
    };

    const register = async (formData) => {
        const res = await registerApi(formData);
        return res;
    };

    const logout = async () => {
        const refreshToken = localStorage.getItem("refreshToken");
        try { await logoutApi(refreshToken); } catch {}
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
