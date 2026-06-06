import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/useAuth";

export default function AdminRoute({ children }) {
    const { token, isAdmin } = useAuth();
    if (!token) return <Navigate to="/" replace />;
    if (!isAdmin) return <Navigate to="/dashboard" replace />;
    return children;
}