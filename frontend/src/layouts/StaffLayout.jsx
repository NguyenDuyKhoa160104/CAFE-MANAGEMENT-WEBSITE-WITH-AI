import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { LayoutDashboard, Coffee, UtensilsCrossed, ReceiptText, Receipt } from "lucide-react";
import StaffSidebar from "../components/layouts/Staff/Sidebar";
import StaffHeader from "../components/layouts/Staff/Header";

export default function StaffLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const menuItems = [
        { path: "/staff/dashboard", icon: <LayoutDashboard size={20} />, label: "Tổng quan" },
        { path: "/staff/tables", icon: <Coffee size={20} />, label: "Sơ đồ bàn" },
        { path: "/staff/menu", icon: <UtensilsCrossed size={20} />, label: "Thực đơn" },
        { path: "/staff/orders", icon: <ReceiptText size={20} />, label: "Đơn hàng" },
        { path: "/staff/invoices", icon: <Receipt size={20} />, label: "Hóa đơn" },
    ];

    return (
        <div className="flex min-h-screen bg-[#F7F4F1] font-sans">
            <StaffSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                menuItems={menuItems}
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
