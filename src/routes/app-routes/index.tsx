import { ROLES } from "@/commons/roles_types";
import { Layout } from "@/layouts/layout";
import { RequireAuth } from "@/components/require-auth";
import { HomePage } from "@/pages/home";
import { LoginPage } from "@/pages/login";
import { NotFound } from "@/pages/not-found";
import { RegisterPage } from "@/pages/register";
import { Unauthorized } from "@/pages/unauthorized";
import { Route, Routes } from "react-router-dom";

export function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                {/* public routes */}
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />

                {/* protected routes - Roles: User and Admin */}
                <Route
                    element={
                        <RequireAuth allowedRoles={[ROLES.Admin, ROLES.User]} />
                    }
                >
                    <Route path="/" element={<HomePage />} />
                    <Route path="/home" element={<HomePage />} />

                    <Route path="unauthorized" element={<Unauthorized />} />

                    {/* catch all */}
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Route>
        </Routes>
    );
}
