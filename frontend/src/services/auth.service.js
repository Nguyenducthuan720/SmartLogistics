import api from "./api";

export async function login(loginValue, password) {
    const { data } = await api.post("/auth/login", { login: loginValue, password });
    return data;
}

export async function register(userData) {
    const { data } = await api.post("/auth/register", userData);
    return data;
}

export async function getProfile() {
    const { data } = await api.get("/auth/profile");
    return data;
}

export async function refreshToken(refreshTokenValue) {
    const { data } = await api.post("/auth/refresh-token", { refreshToken: refreshTokenValue });
    return data;
}

export async function logout(refreshTokenValue) {
    const { data } = await api.post("/auth/logout", { refreshToken: refreshTokenValue });
    return data;
}
