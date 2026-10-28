import { useEffect, useState } from "react";
import {
    getWallet, getTransactions, getEarnings, linkBank, deposit, withdraw
} from "../services/wallet.service";
import PageHeader from "../components/common/PageHeader";
import StatCard from "../components/common/StatCard";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import Spinner from "../components/common/Spinner";
import EmptyState from "../components/common/EmptyState";
import Modal from "../components/common/Modal";
import { InputField } from "../components/common/FormField";
import { useToast } from "../contexts/ToastContext";
import {
    HiOutlineCash, HiOutlineCurrencyDollar, HiOutlineDownload, HiOutlineUpload,
    HiOutlineBadgeCheck, HiOutlineClock, HiOutlineCheckCircle, HiPlus
} from "react-icons/hi";

const fmt = (n) => `${(n || 0).toLocaleString()} VND`;
const fmtDate = (d) => new Date(d).toLocaleString();

export default function DriverWallet() {
    const toast = useToast();
    const [wallet, setWallet] = useState(null);
    const [summary, setSummary] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [earnings, setEarnings] = useState([]);
    const [loading, setLoading] = useState(true);

    const [modal, setModal] = useState(null); // "bank" | "deposit" | "withdraw"
    const [form, setForm] = useState({ bankName: "", bankAccountNumber: "", accountHolder: "", amount: "" });
    const [saving, setSaving] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const [w, t, e] = await Promise.all([getWallet(), getTransactions(), getEarnings()]);
            setWallet(w.wallet);
            setSummary(w.summary);
            setTransactions(t);
            setEarnings(e);
        } catch {} finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const open = (type) => {
        setForm({ bankName: wallet?.BankName || "", bankAccountNumber: wallet?.BankAccountNumber || "", accountHolder: wallet?.AccountHolder || "", amount: "" });
        setModal(type);
    };

    const submit = async () => {
        setSaving(true);
        try {
            if (modal === "bank") {
                await linkBank({ bankName: form.bankName, bankAccountNumber: form.bankAccountNumber, accountHolder: form.accountHolder });
                toast("Bank account linked", "success");
            } else if (modal === "deposit") {
                await deposit(parseFloat(form.amount));
                toast("Deposit successful", "success");
            } else if (modal === "withdraw") {
                await withdraw(parseFloat(form.amount));
                toast("Withdrawal sent to your bank", "success");
            }
            setModal(null);
            await load();
        } catch (err) {
            toast(err.response?.data?.message || "Action failed", "error");
        } finally { setSaving(false); }
    };

    if (loading) return <div className="flex h-64 items-center justify-center"><Spinner /></div>;

    const linked = wallet?.IsLinked;
    const balance = wallet?.Balance || 0;

    return (
        <div>
            <PageHeader
                title="Driver Wallet"
                subtitle="Track earnings, link your bank and move money in or out."
                icon={HiOutlineCash}
                actions={
                    <>
                        <Button variant="outline" onClick={() => open("deposit")}><HiOutlineDownload className="h-4 w-4" /> Nạp tiền</Button>
                        <Button variant="primary" onClick={() => open("withdraw")} disabled={!linked || balance <= 0}><HiOutlineUpload className="h-4 w-4" /> Rút tiền</Button>
                    </>
                }
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Available balance" value={fmt(balance)} icon={HiOutlineCash} tone="blue" />
                <StatCard label="Total earned" value={fmt(summary?.TotalEarned)} icon={HiOutlineBadgeCheck} tone="lime" />
                <StatCard label="Pending payout" value={fmt(summary?.Pending)} icon={HiOutlineClock} tone="amber" />
                <StatCard label="Withdrawn" value={fmt(summary?.Withdrawn)} icon={HiOutlineCurrencyDollar} tone="violet" />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                    <h3 className="eyebrow mb-1">Linked bank</h3>
                    <h2 className="text-lg font-bold text-[#142b34]">Payout account</h2>
                    {linked ? (
                        <div className="mt-4 space-y-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Bank</span>
                                <span className="font-semibold text-slate-800">{wallet.BankName}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Account</span>
                                <span className="font-semibold text-slate-800">•••• {wallet.BankAccountNumber?.slice(-4)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Holder</span>
                                <span className="font-semibold text-slate-800">{wallet.AccountHolder}</span>
                            </div>
                            <Badge tone="green" className="mt-1"><HiOutlineCheckCircle className="h-4 w-4" /> Linked</Badge>
                            <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => open("bank")}>Update bank</Button>
                        </div>
                    ) : (
                        <div className="mt-4">
                            <p className="text-sm text-slate-500">No bank account linked yet. Link one to withdraw your earnings.</p>
                            <Button variant="primary" className="mt-4 w-full" onClick={() => open("bank")}><HiPlus className="h-4 w-4" /> Link bank account</Button>
                        </div>
                    )}
                </Card>

                <Card className="lg:col-span-2">
                    <h3 className="eyebrow mb-1">Recent transactions</h3>
                    <h2 className="mb-4 text-lg font-bold text-[#142b34]">Wallet activity</h2>
                    {transactions.length === 0 ? (
                        <EmptyState icon={HiOutlineCash} title="No transactions yet" description="Earnings and payouts will appear here." />
                    ) : (
                        <div className="table-wrap">
                            <table className="w-full">
                                <thead><tr>
                                    <th className="th">Loại</th>
                                    <th className="th">Mô tả</th>
                                    <th className="th text-right">Số tiền</th>
                                    <th className="th text-right">Số dư</th>
                                    <th className="th">Ngày tạo</th>
                                </tr></thead>
                                <tbody className="divide-y divide-slate-100">
                                    {transactions.map((t) => (
                                        <tr key={t.TransactionID} className="row-hover">
                                            <td className="td"><Badge tone={t.Type === "EARN" || t.Type === "DEPOSIT" ? "green" : "rose"}>{t.Type}</Badge></td>
                                            <td className="td">{t.Description}</td>
                                            <td className={`td text-right font-semibold ${t.Amount >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{t.Amount >= 0 ? "+" : ""}{fmt(t.Amount)}</td>
                                            <td className="td text-right">{fmt(t.BalanceAfter)}</td>
                                            <td className="td text-xs text-slate-400">{fmtDate(t.CreatedAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>

            <Card className="mt-6">
                <h3 className="eyebrow mb-1">Per-shipment earnings</h3>
                <h2 className="mb-4 text-lg font-bold text-[#142b34]">Delivery income</h2>
                {earnings.length === 0 ? (
                    <EmptyState icon={HiOutlineBadgeCheck} title="No earnings yet" description="Complete deliveries to start earning." />
                ) : (
                    <div className="table-wrap">
                        <table className="w-full">
                            <thead><tr>
                                <th className="th">Đơn hàng</th>
                                <th className="th">Giao hàng</th>
                                <th className="th text-right">Số tiền</th>
                                <th className="th">Trạng thái</th>
                                <th className="th">Ngày tạo</th>
                            </tr></thead>
                            <tbody className="divide-y divide-slate-100">
                                {earnings.map((e) => (
                                    <tr key={e.EarningID} className="row-hover">
                                        <td className="td font-medium text-brand">{e.OrderCode}</td>
                                        <td className="td text-slate-500">{e.DeliveryAddress}, {e.DeliveryProvince}</td>
                                        <td className="td text-right font-semibold text-emerald-600">{fmt(e.Amount)}</td>
                                        <td className="td"><Badge tone={e.Status === "PAID" ? "green" : "amber"}>{e.Status}</Badge></td>
                                        <td className="td text-xs text-slate-400">{fmtDate(e.CreatedAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            <Modal isOpen={modal === "bank"} onClose={() => setModal(null)} title="Link bank account"
                footer={<><Button variant="ghost" onClick={() => setModal(null)}>Hủy</Button><Button onClick={submit} disabled={saving}>{saving ? "Đang lưu..." : "Link account"}</Button></>}>
                <div className="space-y-4">
                    <InputField label="Bank name" name="bankName" value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} placeholder="e.g. Vietcombank" required />
                    <InputField label="Account number" name="bankAccountNumber" value={form.bankAccountNumber} onChange={(e) => setForm({ ...form, bankAccountNumber: e.target.value })} required />
                    <InputField label="Account holder" name="accountHolder" value={form.accountHolder} onChange={(e) => setForm({ ...form, accountHolder: e.target.value })} placeholder="Full name as on bank" />
                </div>
            </Modal>

            <Modal isOpen={modal === "deposit"} onClose={() => setModal(null)} title="Deposit to wallet"
                footer={<><Button variant="ghost" onClick={() => setModal(null)}>Hủy</Button><Button onClick={submit} disabled={saving}>{saving ? "Processing..." : "Nạp tiền"}</Button></>}>
                <InputField label="Amount (VND)" name="amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0" required />
            </Modal>

            <Modal isOpen={modal === "withdraw"} onClose={() => setModal(null)} title="Withdraw to bank"
                footer={<><Button variant="ghost" onClick={() => setModal(null)}>Hủy</Button><Button onClick={submit} disabled={saving}>{saving ? "Processing..." : "Rút tiền"}</Button></>}>
                <p className="mb-3 text-sm text-slate-500">Withdrawing from balance: <b>{fmt(balance)}</b></p>
                <InputField label="Amount (VND)" name="amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0" required />
            </Modal>
        </div>
    );
}
