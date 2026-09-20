import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import StaffSidebar from "../components/layouts/Staff/Sidebar";
import StaffHeader from "../components/layouts/Staff/Header";

export default function StaffLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-[#F7F4F1] font-sans">
            <StaffSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="flex flex-1 flex-col transition-all duration-300 lg:pl-[240px]">
                <StaffHeader toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

                <main className="flex-1 overflow-x-hidden">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
