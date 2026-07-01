import { Sidebar } from "@/components/layout/Sidebar";
import { Outlet } from "react-router-dom";
import "./layout.css";

export const Layout = () => {
    return (
        <div className="app-shell">
            <Sidebar />
            {/* Main Content */}
            <div className="main-conent">
                <Outlet />
            </div>
        </div>
    );
};
