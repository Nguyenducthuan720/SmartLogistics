import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Loading from "../components/common/Loading";

export default function ProtectedRoute({ children, roles }) {
    const { user, loading } = useAuth();

    if (loading) return <Loading />;
    if (!user) return <Navigate to="/login" replace />;
    if (roles && !roles.includes(user.roleName || user.Role || user.role)) return <Navigate to="/access-denied" replace />;

    return children;
}
