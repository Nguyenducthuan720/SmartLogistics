import { useEffect, useState } from "react";
import api from "../services/api";
import { HiOutlineBell } from "react-icons/hi";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Spinner from "../components/common/Spinner";
import EmptyState from "../components/common/EmptyState";

export default function Notifications() {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetch = async () => { setLoading(true); setError(""); try { const {data}=await api.get("/notifications");setList(data.data||[]); } catch(err) {setError(err.response?.data?.message||"Không tải được thông báo.");} finally {setLoading(false);} };
    useEffect(() => { fetch(); }, []);

    const markRead = async (id) => { try { await api.put(`/notifications/${id}/read`); await fetch(); } catch(err){setError(err.response?.data?.message||"Không cập nhật được thông báo.");} };
    const markAllRead = async () => { try { await api.put("/notifications/read-all"); await fetch(); } catch(err){setError(err.response?.data?.message||"Không cập nhật được thông báo.");} };

    return (
        <div>
            <PageHeader title="Trung tâm thông báo" subtitle="Stay up to date with system events" icon={HiOutlineBell}
                actions={<Button variant="outline" size="sm" onClick={markAllRead}>Đánh dấu tất cả đã đọc</Button>} />
            {error&&<p className="notice error-notice mb-4" role="alert">{error}</p>}
            <Card className="!p-0">
                {loading ? (
                    <div className="py-8 text-center text-slate-500"><Spinner /></div>
                ) : list.length === 0 ? (
                    <EmptyState icon={HiOutlineBell} title="Chưa có thông báo" description="You're all caught up." />
                ) : (
                    <div className="divide-y divide-slate-100">
                        {list.map((n) => (
                            <div key={n.NotificationID} className={`p-4 flex items-start gap-3 ${n.IsRead ? "opacity-60" : "bg-brand/5"}`}>
                                <div className={`w-2 h-2 rounded-full mt-2 ${n.IsRead ? "bg-slate-300" : "bg-brand"}`} />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-ink">{n.Title}</p>
                                    <p className="text-sm text-slate-600">{n.Message}</p>
                                    <p className="text-xs text-slate-400 mt-1">{new Date(n.CreatedAt).toLocaleString()} - {n.Type}</p>
                                </div>
                                {!n.IsRead && (
                                    <Button variant="link" size="sm" onClick={() => markRead(n.NotificationID)}>Mark read</Button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}
