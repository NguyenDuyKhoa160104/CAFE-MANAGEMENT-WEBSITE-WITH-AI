import React, { useState, useEffect } from "react";
import { PackageSearch, Boxes, AlertTriangle, AlertOctagon, CircleDollarSign } from "lucide-react";
import { inventoryService } from "../../../services/admin/inventory.service";
import { showError, getApiErrorMessage } from "../../../utils/toast";

const OverviewTab = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchSummary = async () => {
        setLoading(true);
        try {
            // adminApi already unwraps response.data → result = { message, data }
            const result = await inventoryService.getSummary();
            // result.data is the actual summary object
            setSummary(result.data);
        } catch (error) {
            showError(getApiErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSummary();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount || 0);
    };

    if (loading) {
        return (
            <div className="flex h-40 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#9c513d] border-t-transparent"></div>
            </div>
        );
    }

    if (!summary) return null;

    // Backend returns: total_ingredients, active_ingredients, normal_stock_count, low_stock_count, out_of_stock_count, inventory_value
    const cards = [
        {
            title: "Tổng nguyên liệu",
            value: summary.total_ingredients ?? 0,
            icon: Boxes,
            color: "text-blue-600",
            bg: "bg-blue-50",
        },
        {
            title: "Nguyên liệu hoạt động",
            value: summary.active_ingredients ?? 0,
            icon: PackageSearch,
            color: "text-green-600",
            bg: "bg-green-50",
        },
        {
            title: "Sắp hết hàng",
            value: summary.low_stock_count ?? 0,
            icon: AlertTriangle,
            color: "text-orange-600",
            bg: "bg-orange-50",
        },
        {
            title: "Hết hàng",
            value: summary.out_of_stock_count ?? 0,
            icon: AlertOctagon,
            color: "text-red-600",
            bg: "bg-red-50",
        },
        {
            title: "Giá trị tồn kho",
            value: formatCurrency(summary.inventory_value),
            icon: CircleDollarSign,
            color: "text-purple-600",
            bg: "bg-purple-50",
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {cards.map((card, idx) => {
                const Icon = card.icon;
                return (
                    <div key={idx} className="rounded-xl border border-[#ebe3dd] bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.bg} ${card.color}`}>
                                <Icon size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-[#998c84]">{card.title}</p>
                                <p className="mt-1 text-xl font-bold text-[#49332b]">{card.value}</p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default OverviewTab;
