import React from "react";
import { NavLink } from "react-router-dom";

import {
    Armchair,
    BadgePercent,
    BarChart3,
    BrainCircuit,
    Boxes,
    Coffee,
    LayoutDashboard,
    LogOut,
    ReceiptText,
    ShieldCheck,
    UserCircle,
    Users,
    WalletCards,
    X,
} from "lucide-react";
import useAdminAuth from "../../../../hooks/useAdminAuth";

const menuItems = [
    {
        name: "Dashboard",
        icon: LayoutDashboard,
        path: "/admin",
    },
    {
        name: "Quản lý nhân viên",
        icon: Users,
        path: "/admin/staffs",
    },
    {
        name: "Phân quyền & chấm công",
        icon: ShieldCheck,
        path: "/admin/roles",
    },
    {
        name: "Quản lý bàn",
        icon: Armchair,
        path: "/admin/tables",
    },
    {
        name: "Quản lý thực đơn",
        icon: Coffee,
        path: "/admin/menus",
    },
    {
        name: "Quản lý hóa đơn",
        icon: ReceiptText,
        path: "/admin/orders",
    },
    {
        name: "Quản lý kho",
        icon: Boxes,
        path: "/admin/inventory",
    },
    {
        name: "Quản lý khuyến mãi",
        icon: BadgePercent,
        path: "/admin/promotions",
    },
    {
        name: "Quản lý bảng lương",
        icon: WalletCards,
        path: "/admin/payroll",
    },
    {
        name: "Báo cáo & thống kê",
        icon: BarChart3,
        path: "/admin/reports",
    },
    {
        name: "AI Analytics",
        icon: BrainCircuit,
        ai: true,
        path: "/admin/ai-insights",
    },
];

const AdminSidebar = ({
    isOpen,
    onClose,
}) => {
    const { logout } = useAdminAuth();

    return (
        <>
            {/* OVERLAY MOBILE */}
            {isOpen && (
                <div
                    onClick={onClose}
                    className="fixed inset-0 z-40 bg-black/30 lg:hidden"
                />
            )}

            <aside
                className={`
          fixed left-0 top-0 z-50 flex h-screen w-[245px]
          flex-col border-r border-[#ebe3dd] bg-[#fbfaf9]
          transition-transform duration-300
          lg:translate-x-0
          ${isOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                    }
        `}
            >
                {/* LOGO */}
                <div className="flex h-[72px] items-center border-b border-[#ebe3dd] px-5">
                    <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#604238] text-white">
                        <Coffee size={22} />
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-[#49332b]">
                            CafeFlow
                        </h2>

                        <span className="text-[10px] text-[#998c84]">
                            Admin System
                        </span>
                    </div>

                    <button
                        onClick={onClose}
                        className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#f3ece7] lg:hidden"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* MENU */}
                <div className="flex-1 overflow-y-auto px-3 py-5">
                    <p className="mb-2 px-3 text-[9px] font-bold tracking-[1.5px] text-[#afa39b]">
                        TỔNG QUAN
                    </p>

                    <nav className="space-y-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon;

                            return (
                                <NavLink
                                    key={item.name}
                                    to={item.path || "#"}
                                    end={item.path === "/admin"}
                                    onClick={onClose}
                                    className={({ isActive }) => `
                    flex w-full items-center gap-3
                    rounded-lg px-3 py-2.5
                    text-left text-[12px]
                    transition
                    ${isActive
                                            ? "bg-[#f4ddd3] font-semibold text-[#9c513d]"
                                            : "text-[#625751] hover:bg-[#f3efec] hover:text-[#65473c]"
                                        }
                  `}
                                >
                                    <Icon size={18} />

                                    <span className="flex-1">
                                        {item.name}
                                    </span>

                                    {item.ai && (
                                        <span className="rounded bg-[#604238] px-1.5 py-0.5 text-[8px] font-bold text-white">
                                            AI
                                        </span>
                                    )}
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>

                <div className="border-t border-[#ebe3dd] p-3">
                    <NavLink
                        to="/admin/profile"
                        onClick={onClose}
                        className={({ isActive }) => `
                            flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs transition
                            ${isActive ? "bg-[#f4ddd3] font-semibold text-[#9c513d]" : "text-[#625751] hover:bg-[#f3efec] hover:text-[#65473c]"}
                        `}
                    >
                        <UserCircle size={18} />
                        Tài khoản cá nhân
                    </NavLink>

                    <button onClick={logout} className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs text-red-500 hover:bg-red-50">
                        <LogOut size={18} />
                        Đăng xuất
                    </button>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;