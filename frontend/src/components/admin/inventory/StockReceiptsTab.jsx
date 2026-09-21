import React, { useState, useEffect } from "react";
import { Plus, Search, Eye, CheckCircle2, XCircle, Edit } from "lucide-react";
import { inventoryService } from "../../../services/admin/inventory.service";
import { showSuccess, showError, getApiErrorMessage } from "../../../utils/toast";
import StockReceiptModal from "./StockReceiptModal";

const StockReceiptsTab = () => {
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    // null = new, number = view/edit existing
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedReceiptId, setSelectedReceiptId] = useState(null);

    const fetchReceipts = async (currentPage = page) => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                search: searchTerm || undefined,
                status: statusFilter || undefined,
            };
            // adminApi already unwraps response.data → result = { message, data }
            const result = await inventoryService.getStockReceipts(params);
            const payload = result.data;

            if (payload && payload.data) {
                setReceipts(payload.data);
                setTotalPages(payload.last_page || 1);
            } else if (Array.isArray(payload)) {
                setReceipts(payload);
                setTotalPages(1);
            } else {
                setReceipts([]);
            }
        } catch (error) {
            showError(getApiErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReceipts(page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const handleSearch = () => {
        setPage(1);
        fetchReceipts(1);
    };

    const handleView = (id) => {
        setSelectedReceiptId(id);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedReceiptId(null);
        setIsModalOpen(true);
    };

    const handleComplete = async (id) => {
        if (!window.confirm("Xác nhận nhập kho? Sau khi hoàn tất, tồn kho sẽ được cộng và phiếu không thể chỉnh sửa.")) return;

        try {
            await inventoryService.completeStockReceipt(id);
            showSuccess("Hoàn tất nhập kho thành công");
            fetchReceipts(page);
        } catch (error) {
            showError(getApiErrorMessage(error));
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm("Xác nhận hủy phiếu nhập này?")) return;

        try {
            await inventoryService.cancelStockReceipt(id);
            showSuccess("Đã hủy phiếu nhập");
            fetchReceipts(page);
        } catch (error) {
            showError(getApiErrorMessage(error));
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "DRAFT":
                return <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">Bản nháp</span>;
            case "COMPLETED":
                return <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">Đã nhập kho</span>;
            case "CANCELLED":
                return <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">Đã hủy</span>;
            default:
                return null;
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount || 0);
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div className="flex flex-1 items-center gap-2">
                    <div className="relative flex-1 max-w-sm">
                        <input
                            type="text"
                            placeholder="Tìm kiếm mã phiếu..."
                            className="w-full rounded-lg border border-[#ebe3dd] py-2 pl-9 pr-4 outline-none focus:border-[#9c513d]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    </div>

                    <select
                        className="rounded-lg border border-[#ebe3dd] py-2 px-3 outline-none focus:border-[#9c513d]"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="DRAFT">Bản nháp</option>
                        <option value="COMPLETED">Đã nhập kho</option>
                        <option value="CANCELLED">Đã hủy</option>
                    </select>

                    <button
                        onClick={handleSearch}
                        className="rounded-lg bg-[#ebe3dd] px-4 py-2 font-medium text-[#65473c] hover:bg-[#e4d6cc]"
                    >
                        Lọc
                    </button>
                </div>

                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 rounded-lg bg-[#604238] px-4 py-2 font-medium text-white hover:bg-[#49332b]"
                >
                    <Plus size={18} />
                    Tạo phiếu nhập
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-[#ebe3dd] bg-white">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[#fbfaf9] text-[#998c84]">
                        <tr>
                            <th className="px-4 py-3 font-medium">Mã phiếu</th>
                            <th className="px-4 py-3 font-medium">Nhà cung cấp</th>
                            <th className="px-4 py-3 font-medium">Số mặt hàng</th>
                            <th className="px-4 py-3 font-medium">Tổng tiền</th>
                            <th className="px-4 py-3 font-medium">Trạng thái</th>
                            <th className="px-4 py-3 font-medium">Người tạo</th>
                            <th className="px-4 py-3 font-medium">Ngày tạo</th>
                            <th className="px-4 py-3 font-medium">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ebe3dd]">
                        {loading ? (
                            <tr>
                                <td colSpan="8" className="p-8 text-center text-gray-500">
                                    Đang tải dữ liệu...
                                </td>
                            </tr>
                        ) : receipts.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="p-8 text-center text-gray-500">
                                    Không có phiếu nhập kho nào.
                                </td>
                            </tr>
                        ) : (
                            receipts.map((item) => (
                                <tr key={item.id} className="hover:bg-[#fbfaf9]">
                                    <td className="px-4 py-3 font-medium text-[#49332b]">{item.receipt_code}</td>
                                    <td className="px-4 py-3">{item.supplier_name || "-"}</td>
                                    <td className="px-4 py-3">{item.items_count ?? item.items?.length ?? 0}</td>
                                    <td className="px-4 py-3 font-bold text-[#604238]">{formatCurrency(item.total_amount)}</td>
                                    <td className="px-4 py-3">{getStatusBadge(item.status)}</td>
                                    <td className="px-4 py-3">{item.created_by_admin?.name || "-"}</td>
                                    <td className="px-4 py-3">{new Date(item.created_at).toLocaleString("vi-VN")}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            {/* View detail (all statuses) */}
                                            <button
                                                onClick={() => handleView(item.id)}
                                                className="text-[#998c84] hover:text-[#9c513d]"
                                                title="Xem chi tiết"
                                            >
                                                <Eye size={18} />
                                            </button>

                                            {item.status === "DRAFT" && (
                                                <>
                                                    {/* Edit DRAFT */}
                                                    <button
                                                        onClick={() => handleView(item.id)}
                                                        className="text-blue-500 hover:text-blue-700"
                                                        title="Chỉnh sửa phiếu"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    {/* Complete */}
                                                    <button
                                                        onClick={() => handleComplete(item.id)}
                                                        className="text-green-600 hover:text-green-800"
                                                        title="Hoàn tất nhập kho"
                                                    >
                                                        <CheckCircle2 size={18} />
                                                    </button>
                                                    {/* Cancel */}
                                                    <button
                                                        onClick={() => handleCancel(item.id)}
                                                        className="text-red-600 hover:text-red-800"
                                                        title="Hủy phiếu"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
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

            {isModalOpen && (
                <StockReceiptModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedReceiptId(null);
                    }}
                    receiptId={selectedReceiptId}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        setSelectedReceiptId(null);
                        fetchReceipts(page);
                    }}
                />
            )}
        </div>
    );
};

export default StockReceiptsTab;
