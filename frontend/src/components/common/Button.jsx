const variants = {
    primary: "btn-primary",
    success: "btn-success",
    danger: "btn-danger",
    warning: "btn-warning",
    ghost: "btn-ghost",
    outline: "btn-outline",
    link: "btn-link"
};

export default function Button({ variant = "primary", size, className = "", children, ...props }) {
    const sizeClass = size === "sm" ? "btn-sm" : "";
    return (
        <button className={`btn ${variants[variant] || "btn-primary"} ${sizeClass} ${className}`} {...props}>
            {children}
        </button>
    );
}
