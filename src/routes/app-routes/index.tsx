import { LoginPage } from "@/pages/login";
import { Route, Routes } from "react-router-dom";
import { RequireAuth } from "../require-auth";
import { ROLES } from "@/commons/roles_types";
import { HomePage } from "@/pages/home";
import { Layout } from "@/layouts/layout";
import { ProductsPage } from "@/pages/products";

export function AppRoutes() {
    return (
        <Routes>
            {/* public routes */}
            <Route path="login" element={<LoginPage />} />
            {/* <Route path="register" element={<RegisterPage />} /> */}
            <Route path="/" element={<Layout />}>
                {/* protected routes - Roles: User and Admin */}
                {/* <Route
                    element={
                        <RequireAuth allowedRoles={[ROLES.Admin]} />
                    }
                > */}
                <Route path="/" element={<HomePage />} />
                <Route path="/home" element={<HomePage />} />

                <Route path="/products" element={<ProductsPage />} />

                {/* <Route path="unauthorized" element={<Unauthorized />} />

            {/* catch all */}
                {/* <Route path="*" element={<NotFound />} /> */}
                {/* </Route> */}
            </Route>
        </Routes>
    );
}
