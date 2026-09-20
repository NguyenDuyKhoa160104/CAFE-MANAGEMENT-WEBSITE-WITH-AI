import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Bell,
    ChevronDown,
    LogOut,
    Menu,
    Search,
    User,
    MonitorOff,
} from "lucide-react";

import { adminApi } from "../../../../config/axios.config";
import { showSuccess, showError } from "../../../../utils/toast";
import { getApiErrorMessage } from "../../../../utils/apiError";
import useAdminAuth from "../../../../hooks/useAdminAuth";

const routeTitles = {
    "/admin": "Dashboard",
    "/admin/dashboard": "Dashboard",
    "/admin/users": "Quản lý nhân viên",
    "/admin/roles": "Phân quyền & chấm công",
    "/admin/tables": "Quản lý bàn",
    "/admin/menus": "Quản lý thực đơn",
    "/admin/orders": "Quản lý hóa đơn",
    "/admin/inventory": "Quản lý kho",
    "/admin/promotions": "Quản lý khuyến mãi",
    "/admin/payroll": "Quản lý bảng lương",
    "/admin/reports": "Báo cáo & thống kê",
    "/admin/ai-insights": "AI Analytics",
    "/admin/profile": "Tài khoản cá nhân",
};

const AdminHeader = ({ onToggleSidebar }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isLoggedIn, admin, logout } = useAdminAuth();

    const [showProfile, setShowProfile] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);

    const currentTitle =
        routeTitles[location.pathname] || "Admin Panel";

    const getInitials = (name) => {
        if (!name) return "AD";

        const words = name.trim().split(/\s+/);

        if (words.length === 1) {
            return words[0]
                .slice(0, 2)
                .toUpperCase();
        }

        return (
            words[0][0] +
            words[words.length - 1][0]
        ).toUpperCase();
    };

    // ĐĂNG XUẤT THIẾT BỊ HIỆN TẠI
    const handleLogout = async () => {
        if (logoutLoading) return;

        try {
            setLogoutLoading(true);

            const response = await adminApi.post("/logout");

            showSuccess(response.message);

            setShowProfile(false);
            logout();
        } catch (error) {
            console.error(
                "Logout error:",
                error.response?.data || error
            );
            showError(getApiErrorMessage(error));
            logout(); // Force logout on error
        } finally {
            setLogoutLoading(false);
        }
    };

    // ĐĂNG XUẤT TOÀN BỘ THIẾT BỊ
    const handleLogoutAll = async () => {
        if (logoutLoading) return;

        try {
            setLogoutLoading(true);

            const response = await adminApi.post("/logout-all");

            showSuccess(response.message);

            setShowProfile(false);
            logout();
        } catch (error) {
            console.error(
                "Logout all error:",
                error.response?.data || error
            );
            showError(getApiErrorMessage(error));
            logout(); // Force logout on error
        } finally {
            setLogoutLoading(false);
        }
    };

    return (
        <header className="sticky top-0 z-40 flex h-[72px] items-center justify-between border-b border-[#ece3dc] bg-white/95 px-6 backdrop-blur">
            {/* LEFT */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onToggleSidebar}
                    className="flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-[#f7f1ed] lg:hidden"
                >
                    <Menu size={20} />
                </button>

                <div>
                    <h1 className="text-lg font-bold text-[#302723]">
                        {currentTitle}
                    </h1>

                    {(isLoggedIn && admin) && (
                        <p className="mt-0.5 text-xs text-[#998b83]">
                            Xin chào,{" "}
                            {admin.full_name} 👋
                        </p>
                    )}
                </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-3">
                {/* SEARCH */}
                <div className="hidden h-10 w-[310px] items-center gap-2 rounded-lg border border-[#e8dfd9] bg-[#faf8f6] px-3 lg:flex">
                    <Search
                        size={17}
                        className="text-[#9c918a]"
                    />

                    <input
                        type="text"
                        placeholder="Tìm kiếm nhân viên, đơn hàng..."
                        className="w-full bg-transparent text-xs text-[#302723] outline-none placeholder:text-[#aaa09a]"
                    />
                </div>

                {/* NOTIFICATION */}
                {(isLoggedIn && admin) && (
                    <button
                        type="button"
                        className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-[#e8dfd9] bg-white transition hover:bg-[#faf6f3]"
                    >
                        <Bell size={18} />

                        <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
                    </button>
                )}

                {/* PROFILE */}
                {(isLoggedIn && admin) ? (
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() =>
                                setShowProfile(
                                    (prev) => !prev
                                )
                            }
                            className="flex items-center gap-2 rounded-lg px-1 py-1 transition hover:bg-[#faf6f3]"
                        >
                            {admin.avatar ? (
                                <img
                                    src={admin.avatar_url || admin.avatar}
                                    alt={admin.full_name}
                                    className="h-9 w-9 rounded-full object-cover"
                                />
                            ) : (
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#65473c] text-xs font-bold text-white">
                                    {getInitials(
                                        admin.full_name
                                    )}
                                </div>
                            )}

                            <div className="hidden text-left md:block">
                                <p className="max-w-[160px] truncate text-xs font-semibold text-[#302723]">
                                    {admin.full_name}
                                </p>

                                <p className="text-[10px] text-[#998b83]">
                                    Quản trị viên
                                </p>
                            </div>

                            <ChevronDown
                                size={15}
                                className={`hidden text-[#857970] transition md:block ${showProfile
                                    ? "rotate-180"
                                    : ""
                                    }`}
                            />
                        </button>

                        {/* DROPDOWN */}
                        {showProfile && (
                            <div className="absolute right-0 top-[50px] w-[245px] overflow-hidden rounded-xl border border-[#e8dfd9] bg-white shadow-xl">
                                {/* INFO */}
                                <div className="border-b border-[#eee6e1] px-4 py-3">
                                    <p className="truncate text-sm font-semibold text-[#302723]">
                                        {admin.full_name}
                                    </p>

                                    <p className="mt-1 truncate text-xs text-[#998b83]">
                                        {admin.email}
                                    </p>

                                    {admin.admin_code && (
                                        <p className="mt-1 text-[10px] font-medium text-[#aa9c94]">
                                            {
                                                admin.admin_code
                                            }
                                        </p>
                                    )}
                                </div>

                                {/* PROFILE */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowProfile(false);
                                        navigate(
                                            "/admin/profile"
                                        );
                                    }}
                                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-[#554943] transition hover:bg-[#faf6f3]"
                                >
                                    <User size={17} />

                                    Tài khoản cá nhân
                                </button>

                                {/* LOGOUT CURRENT */}
                                <button
                                    type="button"
                                    disabled={logoutLoading}
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-3 border-t border-[#eee6e1] px-4 py-3 text-left text-sm text-[#554943] transition hover:bg-[#faf6f3] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <LogOut size={17} />

                                    Đăng xuất
                                </button>

                                {/* LOGOUT ALL */}
                                <button
                                    type="button"
                                    disabled={logoutLoading}
                                    onClick={handleLogoutAll}
                                    className="flex w-full items-center gap-3 border-t border-[#eee6e1] px-4 py-3 text-left text-sm text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <MonitorOff size={17} />

                                    {logoutLoading
                                        ? "Đang xử lý..."
                                        : "Đăng xuất tất cả thiết bị"}
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() =>
                            navigate("/admin/login")
                        }
                        className="rounded-lg bg-[#604238] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#50372f]"
                    >
                        Đăng nhập
                    </button>
                )}
            </div>
        </header>
    );
};

export default AdminHeader;