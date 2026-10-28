import { statusLabel } from "../../utils/status";
const toneMap = {
    blue: "badge-blue",
    green: "badge-green",
    amber: "badge-amber",
    rose: "badge-rose",
    red: "badge-rose",
    violet: "badge-violet",
    slate: "badge-slate",
    lime: "badge-lime"
};

export const statusTone = (status = "") => {
    const s = String(status).toUpperCase();
    if (["WAITING", "PENDING", "PICKED_UP", "ASSIGNED", "NEW"].includes(s)) return "amber";
    if (["IN_TRANSIT", "PROCESSING", "SHIPPING", "CONFIRMED", "ONLINE", "ACTIVE"].includes(s)) return "blue";
    if (["DELIVERED", "COMPLETED", "AVAILABLE", "DONE", "VERIFIED"].includes(s)) return "green";
    if (["CANCELLED", "FAILED", "BLOCKED", "OFFLINE"].includes(s)) return "rose";
    return "slate";
};

export default function Badge({ tone = "slate", className = "", children }) {
    return <span className={`badge ${toneMap[tone] || "badge-slate"} ${className}`}>{typeof children === "string" ? statusLabel(children) : children}</span>;
}
