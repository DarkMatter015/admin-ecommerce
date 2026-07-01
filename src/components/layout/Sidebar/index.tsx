import { useAuth } from "@/context/hooks/use-auth";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { Image } from "primereact/image";
import { Menu } from "primereact/menu";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import "./sidebar.css";

const NAV_ITEMS = [
    { to: "/home", icon: "pi pi-home", label: "Home" },
    { to: "/products", icon: "pi pi-shopping-cart", label: "Produtos" },
    { to: "/orders", icon: "pi pi-shopping-bag", label: "Pedidos" },
    { to: "/categories", icon: "pi pi-tags", label: "Categorias" },
    { to: "/users", icon: "pi pi-users", label: "Usuários" },
];

export const Sidebar = () => {
    const { authenticatedUser, handleLogout } = useAuth();
    const menuRef = useRef<Menu>(null);
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    // Fecha o drawer sempre que a rota muda (navegação em telas pequenas).
    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    const menuItems = [
        {
            label: "Sair",
            icon: "pi pi-sign-out",
            command: () => {
                handleLogout();
            },
        },
    ];

    const logo = (
        <Image
            src="/images/logo/logo_riffhouse_white.png"
            alt="RiffHouse Logo"
            width="140px"
        />
    );

    return (
        <>
            {/* Barra superior (apenas mobile/tablet) */}
            <header className="rh-topbar">
                <Button
                    icon="pi pi-bars"
                    text
                    rounded
                    aria-label="Abrir menu"
                    className="rh-topbar__toggle"
                    onClick={() => setMobileOpen(true)}
                />
                <Link to="/home" className="rh-topbar__brand">
                    {logo}
                </Link>
            </header>

            {/* Fundo escurecido do drawer */}
            <div
                className={`rh-sidebar__scrim ${mobileOpen ? "is-open" : ""}`}
                onClick={() => setMobileOpen(false)}
                aria-hidden="true"
            />

            <aside className={`rh-sidebar ${mobileOpen ? "is-open" : ""}`}>
                <div className="rh-sidebar__header">
                    <Link to="/home" className="rh-sidebar__brand">
                        {logo}
                    </Link>
                    <Button
                        icon="pi pi-times"
                        text
                        rounded
                        aria-label="Fechar menu"
                        className="rh-sidebar__close"
                        onClick={() => setMobileOpen(false)}
                    />
                </div>

                <nav className="rh-sidebar__nav">
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `rh-nav-link ${isActive ? "is-active" : ""}`
                            }
                        >
                            <i className={item.icon} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="rh-sidebar__footer">
                    <Menu
                        model={menuItems}
                        popup
                        ref={menuRef}
                        id="popup_menu_right"
                        popupAlignment="right"
                    />
                    <button
                        type="button"
                        className="rh-user"
                        onClick={(event) => menuRef.current?.toggle(event)}
                        aria-controls="popup_menu_right"
                        aria-haspopup="true"
                    >
                        <Avatar
                            image="https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png"
                            shape="circle"
                        />
                        <span className="rh-user__info">
                            <span className="rh-user__name">
                                {authenticatedUser?.email || "Admin"}
                            </span>
                            <span className="rh-user__role">Administrador</span>
                        </span>
                        <i className="pi pi-ellipsis-v rh-user__more" />
                    </button>
                </div>
            </aside>
        </>
    );
};
