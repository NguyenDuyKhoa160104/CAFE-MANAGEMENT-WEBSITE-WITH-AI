import React, { useState } from "react";
import { Bell, Menu as MenuIcon, LogOut, ChevronDown } from "lucide-react";
import useStaffAuth from "../../../../hooks/useStaffAuth";
import { staffApi } from "../../../../config/axios.config";
import { showSuccess, showError } from "../../../../utils/toast";

const POSITIONS = {
    MANAGER: "Quản lý ca",
    CASHIER: "Thu ngân",
    BARISTA: "Pha chế",
    SERVER: "Phục vụ",
};

export default function StaffHeader({ toggleSidebar }) {
    const { isLoggedIn, staff, logout } = useStaffAuth();
    const [showProfile, setShowProfile] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);

    if (!isLoggedIn || !staff) {
        return (
            <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-[#ebe3dd] bg-[#fbfaf9] px-4 sm:px-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleSidebar}
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-[#625751] hover:bg-[#f3ece7] lg:hidden"
                    >
                        <MenuIcon size={20} />
                    </button>
                </div>
            </header>
        );
    }

    const handleLogout = async () => {
        if (logoutLoading) return;
        try {
            setLogoutLoading(true);
            const response = await staffApi.post("/logout");
            showSuccess(response?.message || "Đã đăng xuất");
            logout();
        } catch (error) {
            console.error("Logout error:", error);
            // Even if API fails (e.g. token expired), we should clear local state
            logout();
        } finally {
            setLogoutLoading(false);
        }
    };

    return (
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-[#ebe3dd] bg-[#fbfaf9] px-4 sm:px-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-[#625751] hover:bg-[#f3ece7] lg:hidden"
                >
                    <MenuIcon size={20} />
                </button>
            </div>

            <div className="flex items-center gap-4">
                <button className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#625751] hover:bg-[#f3ece7] transition">
                    <Bell size={18} />
                    <span className="absolute right-2.5 top-2.5 flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#fbfaf9]"></span>
                </button>

                <div className="relative border-l border-[#ebe3dd] pl-4">
                    <button 
                        onClick={() => setShowProfile(!showProfile)}
                        className="flex items-center gap-3 transition hover:opacity-80"
                    >
                        <div className="hidden text-right sm:block">
                            <p className="text-sm font-bold text-[#49332b]">{staff.full_name || 'Nhân viên'}</p>
                            <p className="text-[11px] text-[#958981]">{POSITIONS[staff.position] || "Nhân viên"}</p>
                        </div>
                        {staff.avatar ? (
                            <img src={staff.avatar_url || staff.avatar} alt="Avatar" className="h-10 w-10 rounded-full object-cover shadow-sm" />
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8dbd1] font-bold text-[#604238] shadow-sm">
                                {(staff.full_name ? staff.full_name.charAt(0) : 'S').toUpperCase()}
                            </div>
                        )}
                        <ChevronDown size={14} className="text-[#625751]" />
                    </button>

                    {showProfile && (
                        <div className="absolute right-0 top-[50px] w-48 overflow-hidden rounded-xl border border-[#e8dfd9] bg-white shadow-xl">
                            <div className="border-b border-[#eee6e1] px-4 py-3">
                                <p className="truncate text-sm font-semibold text-[#302723]">
                                    {staff.full_name || 'Nhân viên'}
                                </p>
                                <p className="mt-1 truncate text-xs text-[#998b83]">
                                    {staff.email || ''}
                                </p>
                            </div>
                            <button
                                type="button"
                                disabled={logoutLoading}
                                onClick={handleLogout}
                                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <LogOut size={17} />
                                {logoutLoading ? "Đang xử lý..." : "Đăng xuất"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
