import React from "react";
import { NavLink } from "react-router-dom";
import BrandLogo from "../../../common/BrandLogo";
import {
    Armchair,
    Coffee,
    LayoutDashboard,
    LogOut,
    ReceiptText,
    Receipt,
    UserCircle,
    X,
} from "lucide-react";
import useStaffAuth from "../../../../hooks/useStaffAuth";

const menuItems = [
    {
        name: "Bảng điều khiển",
        icon: LayoutDashboard,
        path: "/staff/dashboard",
    },
    {
        name: "Sơ đồ bàn",
        icon: Armchair,
        path: "/staff/tables",
    },
    {
        name: "Đơn hàng",
        icon: ReceiptText,
        path: "/staff/orders",
    },
    {
        name: "Thực đơn",
        icon: Coffee,
        path: "/staff/menu",
    },
    {
        name: "Hóa đơn",
        icon: Receipt,
        path: "/staff/invoices",
    },
];

export default function StaffSidebar({ isOpen, onClose }) {
    const { logout } = useStaffAuth();

    return (
        <>
            {isOpen && (
                <div onClick={onClose} className="fixed inset-0 z-40 bg-black/30 lg:hidden" />
            )}

            <aside className={`fixed left-0 top-0 z-50 flex h-screen w-[240px] flex-col border-r border-[#ebe3dd] bg-[#fbfaf9] transition-transform duration-300 lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <div className="flex h-[72px] items-center border-b border-[#ebe3dd] px-5">
                    <BrandLogo className="mr-3 h-8" />
                    <div>
                        <h2 className="text-lg font-bold text-[#49332b]">CafeFlow</h2>
                        <span className="text-[10px] font-medium text-[#958981] uppercase tracking-wider">
                            Staff Operations
                        </span>
                    </div>
                    <button onClick={onClose} className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#f3ece7] lg:hidden">
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-5">
                    <p className="mb-3 px-3 text-[10px] font-bold tracking-[1.5px] text-[#afa39b]">
                        VẬN HÀNH
                    </p>
                    <nav className="space-y-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <NavLink
                                    key={item.name}
                                    to={item.path}
                                    onClick={(e) => {
                                        if (item.badge) e.preventDefault();
                                        else onClose();
                                    }}
                                    className={({ isActive }) => `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                                        isActive && !item.badge
                                            ? "bg-[#f4ddd3] font-semibold text-[#9c513d]"
                                            : "text-[#625751] hover:bg-[#f3efec] hover:text-[#65473c]"
                                    } ${item.badge ? 'opacity-80 cursor-default hover:bg-transparent' : ''}`}
                                >
                                    <Icon size={18} />
                                    <span className="flex-1">{item.name}</span>
                                    {item.badge && (
                                        <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                                            {item.badge}
                                        </span>
                                    )}
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>

                <div className="border-t border-[#ebe3dd] p-3">
                    <NavLink
                        to="/staff/profile"
                        onClick={onClose}
                        className={({ isActive }) => `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                            isActive ? "bg-[#f4ddd3] font-semibold text-[#9c513d]" : "text-[#625751] hover:bg-[#f3efec] hover:text-[#65473c]"
                        }`}
                    >
                        <UserCircle size={18} />
                        Hồ sơ cá nhân
                    </NavLink>
                    <button onClick={logout} className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition">
                        <LogOut size={18} />
                        Đăng xuất
                    </button>
                </div>
            </aside>
        </>
    );
}
