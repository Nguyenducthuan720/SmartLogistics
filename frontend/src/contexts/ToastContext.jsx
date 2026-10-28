import { createContext, useContext, useState, useCallback } from "react";
import { HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineInformationCircle, HiOutlineExclamation } from "react-icons/hi";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = "info", duration = 4000) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
    }, []);

    const icons = { success: HiOutlineCheckCircle, error: HiOutlineXCircle, warning: HiOutlineExclamation, info: HiOutlineInformationCircle };
    const colors = { success: "border-green-500 bg-green-50", error: "border-red-500 bg-red-50", warning: "border-yellow-500 bg-yellow-50", info: "border-blue-500 bg-blue-50" };
    const iconColors = { success: "text-green-500", error: "text-red-500", warning: "text-yellow-500", info: "text-blue-500" };

    return (
        <ToastContext.Provider value={addToast}>
            {children}
            <div className="fixed bottom-4 right-4 z-[100] space-y-2">
                {toasts.map((t) => {
                    const Icon = icons[t.type] || icons.info;
                    return (
                        <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border-l-4 ${colors[t.type] || colors.info} animate-slide-in bg-white min-w-[300px]`}>
                            <Icon className={`w-5 h-5 ${iconColors[t.type] || iconColors.info}`} />
                            <span className="text-sm text-gray-700">{t.message}</span>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    return useContext(ToastContext);
}
