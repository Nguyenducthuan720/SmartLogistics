export default function StatCard({ label, value, helper, trend }) {
    return (
        <div className="stat">
            <p className="stat-label">{label}</p>
            <p className="stat-value">{value ?? "—"}</p>
            <div>
                {trend !== undefined && (
                    <span className={`text-xs font-semibold ${trend >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {trend >= 0 ? "+" : ""}{trend}%
                    </span>
                )}
            </div>
            {helper && <p className="stat-helper">{helper}</p>}
        </div>
    );
}
