import api from "./api";

export async function getWallet() {
    const { data } = await api.get("/wallets/me");
    return data.data;
}

export async function getTransactions(limit = 30) {
    const { data } = await api.get("/wallets/me/transactions", { params: { limit } });
    return data.data || [];
}

export async function getEarnings() {
    const { data } = await api.get("/wallets/me/earnings");
    return data.data || [];
}

export async function linkBank(payload) {
    const { data } = await api.post("/wallets/me/link-bank", payload);
    return data.data;
}

export async function deposit(amount) {
    const { data } = await api.post("/wallets/me/deposit", { amount });
    return data.data;
}

export async function withdraw(amount) {
    const { data } = await api.post("/wallets/me/withdraw", { amount });
    return data.data;
}
