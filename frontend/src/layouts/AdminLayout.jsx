import React, { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/layouts/Admin/Sidebar";
import Header from "../components/layouts/Admin/Header";
import Footer from "../components/layouts/Admin/Footer";

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-[#f7f4f1]">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="flex min-w-0 flex-1 flex-col lg:ml-[245px] transition-all duration-300">
                <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

                <main className="flex-1 p-4 md:p-6">
                    <Outlet />
                </main>

                <Footer />
            </div>
        </div>
    );
};

export default AdminLayout;