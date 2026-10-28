import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";
import { ToastProvider } from "./contexts/ToastContext";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
    return (
        <AuthProvider>
            <SocketProvider>
                <ToastProvider>
                    <AppRoutes />
                </ToastProvider>
            </SocketProvider>
        </AuthProvider>
    );
}
