import { useAuth } from "@/context/hooks/use-auth";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { Image } from "primereact/image";
import { Menu } from "primereact/menu";
import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./sidebar.css";

export const Sidebar = () => {
    const { authenticatedUser, handleLogout } = useAuth();
    const navigate = useNavigate();
    const menuRef = useRef<Menu>(null);

    const menuItems = [
        {
            label: "Editar Perfil",
            icon: "pi pi-user-edit",
            command: () => {
                navigate("/edit-profile");
            },
        },
        {
            separator: true,
        },
        {
            label: "Sair",
            icon: "pi pi-sign-out",
            command: () => {
                handleLogout();
            },
        },
    ];

    return (
        <div className="surface-section h-screen flex-shrink-0 lg:block border-right-1 surface-border sidebar-content">
            <div className="flex flex-column h-full">
                <div className="flex align-items-center justify-content-between px-4 pt-3 flex-shrink-0">
                    <Link to={"/home"} className="flex align-items-center">
                        <Image
                            src="/images/logo/logo_riffhouse_white.png"
                            alt="RiffHouse Logo"
                            width="150px"
                        ></Image>
                    </Link>
                </div>
                <div className="overflow-y-auto">
                    <ul className="list-none p-3 m-0">
                        <li>
                            <Link
                                to={"/home"}
                                className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full no-underline"
                            >
                                <i className="pi pi-home mr-2"></i>
                                <span className="font-medium">Home</span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                to={"/products"}
                                className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full no-underline"
                            >
                                <i className="pi pi-shopping-cart mr-2"></i>
                                <span className="font-medium">Produtos</span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                to={"/orders"}
                                className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full no-underline"
                            >
                                <i className="pi pi-shopping-bag mr-2"></i>
                                <span className="font-medium">Pedidos</span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                to={"/categories"}
                                className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full no-underline"
                            >
                                <i className="pi pi-tags mr-2"></i>
                                <span className="font-medium">Categorias</span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                to={"/users"}
                                className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full no-underline"
                            >
                                <i className="pi pi-users mr-2"></i>
                                <span className="font-medium">Usuários</span>
                            </Link>
                        </li>
                    </ul>
                </div>
                <div className="mt-auto w-full">
                    <hr className="mb-3 mx-3 border-top-1 border-none surface-border" />
                    <Menu
                        model={menuItems}
                        popup
                        ref={menuRef}
                        id="popup_menu_right"
                        popupAlignment="right"
                    />

                    <Button
                        outlined
                        className="w-full border-0"
                        onClick={(event) => menuRef.current?.toggle(event)}
                        aria-controls="popup_menu_right"
                        aria-haspopup
                    >
                        <Avatar
                            image="https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png"
                            shape="circle"
                        />
                        <span className="font-bold">
                            {authenticatedUser?.email || "Admin"}
                        </span>
                    </Button>
                </div>
            </div>
        </div>
    );
};
