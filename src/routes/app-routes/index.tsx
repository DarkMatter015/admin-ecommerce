import { LoginPage } from "@/pages/login";
import { Route, Routes } from "react-router-dom";

export function AppRoutes() {
    return (
        <Routes>
            {/* public routes */}
            <Route path="login" element={<LoginPage />} />
            {/* <Route path="register" element={<RegisterPage />} /> */}
            {/* <Route path="/" element={<Layout />}> */}
            {/* protected routes - Roles: User and Admin */}
            {/* <Route
                    element={
                        <RequireAuth allowedRoles={[ROLES.Admin, ROLES.User]} />
                    }
                > */}
            {/* <Route path="/" element={<HomePage />} />
                    <Route path="/home" element={<HomePage />} />

                    <Route path="unauthorized" element={<Unauthorized />} /> */}

            {/* catch all */}
            {/* <Route path="*" element={<NotFound />} /> */}
            {/* </Route> */}
            {/* </Route> */}
        </Routes>
    );
}
