import React, { useState } from "react";
import { Coffee, Download, Grid2X2 } from "lucide-react";
import CategoriesTab from "../../../components/admin/menu/CategoriesTab";
import ProductsTab from "../../../components/admin/menu/ProductsTab";

const MenuManagement = () => {
    const [activeTab, setActiveTab] = useState("categories");

    return (
        <div className="space-y-5">
            {/* PAGE HEADER */}
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                <div>
                    <h1 className="text-2xl font-bold text-[#302723]">
                        Quản lý thực đơn
                    </h1>

                    <p className="mt-1 text-xs text-[#958981]">
                        Quản lý danh mục và các sản phẩm đang kinh doanh
                        trong thực đơn CafeFlow.
                    </p>
                </div>

                <button
                    type="button"
                    className="flex h-10 items-center gap-2 self-start rounded-lg border border-[#e7ddd7] bg-white px-4 text-xs font-semibold text-[#574943] hover:bg-[#faf6f3]"
                >
                    <Download size={15} />
                    Xuất dữ liệu
                </button>
            </div>

            {/* TABS */}
            <div className="flex border-b border-[#e9dfd8]">
                <TabButton
                    active={activeTab === "categories"}
                    onClick={() => setActiveTab("categories")}
                    icon={<Grid2X2 size={16} />}
                >
                    Danh mục
                </TabButton>

                <TabButton
                    active={activeTab === "products"}
                    onClick={() => setActiveTab("products")}
                    icon={<Coffee size={16} />}
                >
                    Sản phẩm
                </TabButton>
            </div>

            {/* TAB CONTENT */}
            {activeTab === "categories" ? (
                <CategoriesTab />
            ) : (
                <ProductsTab />
            )}
        </div>
    );
};

const TabButton = ({
    active,
    onClick,
    icon,
    children,
}) => (
    <button
        type="button"
        onClick={onClick}
        className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-semibold transition ${active
            ? "border-[#604238] text-[#604238]"
            : "border-transparent text-[#958981] hover:text-[#604238]"
            }`}
    >
        {icon}
        {children}
    </button>
);

export default MenuManagement;