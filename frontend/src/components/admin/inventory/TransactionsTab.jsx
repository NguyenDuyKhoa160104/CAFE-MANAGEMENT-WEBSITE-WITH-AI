import React, { useState, useEffect } from "react";
import { inventoryService } from "../../../services/admin/inventory.service";
import { showError, getApiErrorMessage } from "../../../utils/toast";

const UNIT_LABELS = { GRAM: "g", MILLILITER: "ml", PIECE: "cái" };

const getTypeLabel = (type) => {
    switch (type) {
        case "IMPORT":
            return <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">Nhập kho</span>;
        case "ORDER_CONSUMPTION":
            return <span className="rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">Xuất cho đơn hàng</span>;
        case "ADJUSTMENT_IN":
            return <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Điều chỉnh tăng</span>;
        case "ADJUSTMENT_OUT":
            return <span className="rounded bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">Điều chỉnh giảm</span>;
        case "WASTE":
            return <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Hao hụt</span>;
        default:
            return <span className="text-gray-500">{type}</span>;
    }
};

const TransactionsTab = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [typeFilter, setTypeFilter] = useState("");

    const fetchTransactions = async (currentPage = page) => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                type: typeFilter || undefined,
            };
            // adminApi already unwraps response.data → result = { message, data }
            const result = await inventoryService.getTransactions(params);
            const payload = result.data; // paginator

            if (payload && payload.data) {
                setTransactions(payload.data);
                setTotalPages(payload.last_page || 1);
            } else if (Array.isArray(payload)) {
                setTransactions(payload);
                setTotalPages(1);
            } else {
                setTransactions([]);
            }
        } catch (error) {
            showError(getApiErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions(page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const handleFilter = () => {
        setPage(1);
        fetchTransactions(1);
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center gap-2">
                <select
                    className="rounded-lg border border-[#ebe3dd] py-2 px-3 outline-none focus:border-[#9c513d]"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                >
                    <option value="">Tất cả loại giao dịch</option>
                    <option value="IMPORT">Nhập kho</option>
                    <option value="ORDER_CONSUMPTION">Xuất cho đơn hàng</option>
                    <option value="ADJUSTMENT_IN">Điều chỉnh tăng</option>
                    <option value="ADJUSTMENT_OUT">Điều chỉnh giảm</option>
                    <option value="WASTE">Hao hụt</option>
                </select>

                <button
                    onClick={handleFilter}
                    className="rounded-lg bg-[#ebe3dd] px-4 py-2 font-medium text-[#65473c] hover:bg-[#e4d6cc]"
                >
                    Lọc
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-[#ebe3dd] bg-white">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[#fbfaf9] text-[#998c84]">
                        <tr>
                            <th className="px-4 py-3 font-medium">Mã giao dịch</th>
                            <th className="px-4 py-3 font-medium">Thời gian</th>
                            <th className="px-4 py-3 font-medium">Nguyên liệu</th>
                            <th className="px-4 py-3 font-medium">Loại</th>
                            <th className="px-4 py-3 font-medium">Tồn trước</th>
                            <th className="px-4 py-3 font-medium">Biến động</th>
                            <th className="px-4 py-3 font-medium">Tồn sau</th>
                            <th className="px-4 py-3 font-medium">Nguồn</th>
                            <th className="px-4 py-3 font-medium">Người thực hiện</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ebe3dd]">
                        {loading ? (
                            <tr>
                                <td colSpan="9" className="p-8 text-center text-gray-500">
                                    Đang tải dữ liệu...
                                </td>
                            </tr>
                        ) : transactions.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="p-8 text-center text-gray-500">
                                    Không có giao dịch nào.
                                </td>
                            </tr>
                        ) : (
                            transactions.map((item) => {
                                const qChange = Number(item.quantity_change);
                                const isPositive = qChange > 0;
                                const unit = item.ingredient
                                    ? (UNIT_LABELS[item.ingredient.unit] || item.ingredient.unit)
                                    : "";
                                return (
                                    <tr key={item.id} className="hover:bg-[#fbfaf9]">
                                        <td className="px-4 py-3 font-medium text-gray-500">
                                            {item.transaction_code || `#${item.id}`}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {new Date(item.created_at).toLocaleString("vi-VN")}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-[#49332b]">
                                            {item.ingredient?.name || "-"}
                                        </td>
                                        <td className="px-4 py-3">{getTypeLabel(item.type)}</td>
                                        {/* Backend field: balance_before (not previous_stock) */}
                                        <td className="px-4 py-3 text-gray-500">
                                            {Number(item.balance_before)} {unit}
                                        </td>
                                        <td className={`px-4 py-3 font-bold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                                            {isPositive ? "+" : ""}{qChange} {unit}
                                        </td>
                                        {/* Backend field: balance_after (not new_stock) */}
                                        <td className="px-4 py-3 font-medium text-gray-800">
                                            {Number(item.balance_after)} {unit}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {item.reference_type
                                                ? `${item.reference_type === "ORDER" ? "Đơn hàng" : item.reference_type === "STOCK_RECEIPT" ? "Phiếu nhập" : item.reference_type} ${item.reference_id ? `#${item.reference_id}` : ""}`
                                                : item.note || "-"}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {item.admin?.name || item.staff?.name || "-"}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Trang {page} / {totalPages}</span>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            className="rounded-lg border border-[#ebe3dd] px-3 py-1 text-sm disabled:opacity-50"
                        >
                            Trang trước
                        </button>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(page + 1)}
                            className="rounded-lg border border-[#ebe3dd] px-3 py-1 text-sm disabled:opacity-50"
                        >
                            Trang sau
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionsTab;
