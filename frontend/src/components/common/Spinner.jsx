export default function Spinner({ className = "" }) {
    return (
        <div className={`h-9 w-9 animate-spin rounded-full border-4 border-brand border-t-transparent ${className}`} />
    );
}
