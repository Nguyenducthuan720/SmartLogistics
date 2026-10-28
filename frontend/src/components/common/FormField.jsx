import { useId } from "react";
export function InputField({ label, name, type = "text", value, onChange, required, placeholder, options, rows, disabled, error, className = "" }) {
    const id = useId();
    const base = `input ${error ? "input-error" : ""} ${className}`;

    return (
        <div>
            {label && (
                <label className="label" htmlFor={id}>
                    {label}{required && <span aria-hidden="true" className="ml-1 text-rose-500">*</span>}
                </label>
            )}
            {type === "select" ? (
                <select id={id} name={name} value={value} onChange={onChange} className={base} required={required} disabled={disabled} aria-invalid={Boolean(error)}>
                    <option value="">{placeholder || "Chọn..."}</option>
                    {options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            ) : type === "textarea" ? (
                <textarea id={id} name={name} value={value} onChange={onChange} className={base} placeholder={placeholder} required={required} rows={rows || 3} disabled={disabled} aria-invalid={Boolean(error)} />
            ) : (
                <input id={id} type={type} name={name} value={value} onChange={onChange} className={base} placeholder={placeholder} required={required} disabled={disabled} aria-invalid={Boolean(error)} />
            )}
        </div>
    );
}

export function FormRow({ children, cols = 2 }) {
    const columnClass = { 1:"md:grid-cols-1", 2:"md:grid-cols-2", 3:"md:grid-cols-3", 4:"md:grid-cols-4" }[cols] || "md:grid-cols-2";
    return <div className={`grid grid-cols-1 ${columnClass} gap-4`}>{children}</div>;
}
