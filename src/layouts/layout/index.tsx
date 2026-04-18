import { Outlet, useLocation } from "react-router-dom";

export const Layout = () => {
    const location = useLocation();
    const isHome =
        location.pathname != "/login" && location.pathname != "/cadastro";

    return (
        <>
            <main className={isHome ? "home-main" : undefined}>
                <Outlet />
            </main>
        </>
    );
};
