import { Sidebar } from "@/components/layout/Sidebar";
import { Outlet } from "react-router-dom";
import "./layout.css";

export const Layout = () => {
    return (
        <div className="flex h-screen w-screen">
            <Sidebar />
            {/* Main Content */}
            <div className="flex-1 main-conent">
                <Outlet />
            </div>
        </div>
    );
};
