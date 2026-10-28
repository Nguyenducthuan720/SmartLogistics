export default function EmptyState({ icon: Icon, title = "Chưa có dữ liệu", description, action }) {
    return (
        <div className="empty">
            {Icon && <Icon className="h-12 w-12 text-slate-300" />}
            <p className="text-lg font-medium text-slate-500">{title}</p>
            {description && <p className="max-w-sm text-sm">{description}</p>}
            {action}
        </div>
    );
}
