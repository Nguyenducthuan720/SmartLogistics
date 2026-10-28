export default function Brand({ light = false }) {
    return <div className={`brand-lockup ${light ? "brand-light" : ""}`}>
        <span className="brand-symbol" aria-hidden="true">◈</span>
        <strong>SmartLogistics</strong>
    </div>;
}
