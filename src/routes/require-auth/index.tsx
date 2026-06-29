import { useAuth } from "@/context/hooks/use-auth";
import { ProgressSpinner } from "primereact/progressspinner";
import { Navigate, Outlet, useLocation } from "react-router-dom";

interface RequireAuthProps {
    allowedRoles: string[];
}

export function RequireAuth({ allowedRoles }: RequireAuthProps) {
    const { isAuthenticated, authenticatedUser, loading } = useAuth();
    const location = useLocation();

    // Enquanto a sessão está sendo validada (ex: refresh com token salvo),
    // exibe um carregando para não redirecionar indevidamente para o login.
    if (loading) {
        return (
            <div className="flex align-items-center justify-content-center h-screen w-full">
                <ProgressSpinner />
            </div>
        );
    }

    // Sem autenticação -> obriga login.
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Autenticado, mas sem a role necessária (ex: não é ADMIN) -> sem permissão.
    const hasRequiredRole = authenticatedUser?.roles?.some((role) =>
        allowedRoles?.includes(role.name),
    );

    if (!hasRequiredRole) {
        return (
            <Navigate to="/unauthorized" state={{ from: location }} replace />
        );
    }

    return <Outlet />;
}
