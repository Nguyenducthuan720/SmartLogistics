import { HiOutlineX } from "react-icons/hi";
import { useEffect, useId, useRef } from "react";

export default function Modal({ isOpen, onClose, title, children, size = "md", footer }) {
    const titleId = useId();
    const panel = useRef(null);
    const closeRef = useRef(onClose);
    closeRef.current = onClose;
    useEffect(() => {
        if (!isOpen) return;
        const previous = document.activeElement;
        const dialog = panel.current;
        const focusable = () => [...dialog.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]')].filter(n => n.getClientRects().length);
        (focusable()[0] || dialog).focus();
        const keydown = e => {
            if (e.key === "Escape") closeRef.current();
            if (e.key === "Tab") {
                const nodes = focusable(), first = nodes[0], last = nodes[nodes.length - 1];
                if (!first) { e.preventDefault(); dialog.focus(); }
                else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        };
        document.addEventListener("keydown", keydown);
        return () => { document.removeEventListener("keydown", keydown); previous?.focus?.(); };
    }, [isOpen]);
    if (!isOpen) return null;

    const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div ref={panel} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} className={`relative w-full ${widths[size] || widths.md} mx-4 max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200/80 bg-white shadow-2xl`}>
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <h2 id={titleId} className="text-lg font-semibold text-slate-800">{title}</h2>
                    <button onClick={onClose} aria-label="Đóng hộp thoại" className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100">
                        <HiOutlineX className="h-5 w-5" />
                    </button>
                </div>
                <div className="px-6 py-5">{children}</div>
                {footer && <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">{footer}</div>}
            </div>
        </div>
    );
}
