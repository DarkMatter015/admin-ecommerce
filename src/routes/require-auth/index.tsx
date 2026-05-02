import { AuthContext } from "@/context/AuthContext";
import { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

interface RequireAuthProps {
    allowedRoles: string[];
}

export function RequireAuth({ allowedRoles }: RequireAuthProps) {
    const { isAuthenticated, authenticatedUser } = useContext(AuthContext);
    const location = useLocation();

    return authenticatedUser?.authorities?.find((authority) =>
        allowedRoles?.includes(authority.authority),
    ) ? (
        <Outlet />
    ) : isAuthenticated ? (
        <Navigate to="/unauthorized" state={{ from: location }} replace />
    ) : (
        <Navigate to="/login" state={{ from: location }} replace />
    );
}
