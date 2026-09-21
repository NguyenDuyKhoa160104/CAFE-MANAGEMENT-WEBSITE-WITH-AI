import React, { useState } from "react";
import { Boxes, PackageSearch, FileText, ArrowLeftRight, AlertTriangle } from "lucide-react";
import OverviewTab from "../../../components/admin/inventory/OverviewTab";
import IngredientsTab from "../../../components/admin/inventory/IngredientsTab";
import StockReceiptsTab from "../../../components/admin/inventory/StockReceiptsTab";
import TransactionsTab from "../../../components/admin/inventory/TransactionsTab";
import LowStockTab from "../../../components/admin/inventory/LowStockTab";

const InventoryManagement = () => {
    const [activeTab, setActiveTab] = useState("overview");

    const tabs = [
        { id: "overview", name: "Tổng quan", icon: Boxes },
        { id: "ingredients", name: "Nguyên liệu", icon: PackageSearch },
        { id: "receipts", name: "Nhập kho", icon: FileText },
        { id: "transactions", name: "Lịch sử kho", icon: ArrowLeftRight },
        { id: "lowstock", name: "Sắp hết hàng", icon: AlertTriangle },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case "overview":
                return <OverviewTab />;
            case "ingredients":
                return <IngredientsTab />;
            case "receipts":
                return <StockReceiptsTab />;
            case "transactions":
                return <TransactionsTab />;
            case "lowstock":
                return <LowStockTab />;
            default:
                return <OverviewTab />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[#49332b]">Quản lý kho</h1>
                <p className="mt-1 text-sm text-[#998c84]">
                    Quản lý nguyên liệu, nhập xuất và theo dõi tồn kho.
                </p>
            </div>

            {/* Tabs */}
            <div className="border-b border-[#ebe3dd]">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    group inline-flex items-center gap-2 border-b-2 py-4 text-sm font-medium transition
                                    ${
                                        isActive
                                            ? "border-[#9c513d] text-[#9c513d]"
                                            : "border-transparent text-[#625751] hover:border-[#ebe3dd] hover:text-[#65473c]"
                                    }
                                `}
                            >
                                <Icon
                                    size={18}
                                    className={isActive ? "text-[#9c513d]" : "text-[#998c84] group-hover:text-[#65473c]"}
                                />
                                {tab.name}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Content */}
            <div className="mt-4">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default InventoryManagement;
