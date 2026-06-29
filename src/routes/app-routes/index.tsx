import { LoginPage } from "@/pages/login";
import { Route, Routes } from "react-router-dom";
import { RequireAuth } from "../require-auth";
import { ROLES } from "@/commons/roles_types";
import { HomePage } from "@/pages/home";
import { Layout } from "@/layouts/layout";
import { ProductsPage } from "@/pages/products";
import { CategoriesPage } from "@/pages/categories";
import { OrdersPage } from "@/pages/orders";
import { NotFoundPage } from "@/pages/not-found";
import { UnauthorizedPage } from "@/pages/unauthorized";

export function AppRoutes() {
    return (
        <Routes>
            {/* rotas públicas */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* rotas protegidas - exige autenticação + perfil ADMIN */}
            <Route element={<RequireAuth allowedRoles={[ROLES.Admin]} />}>
                <Route path="/" element={<Layout />}>
                    <Route index element={<HomePage />} />
                    <Route path="home" element={<HomePage />} />
                    <Route path="products" element={<ProductsPage />} />
                    <Route path="categories" element={<CategoriesPage />} />
                    <Route path="orders" element={<OrdersPage />} />
                </Route>
            </Route>

            {/* catch all */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}
