import React, { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, ToggleLeft, ToggleRight, ArchiveRestore } from "lucide-react";
import { inventoryService } from "../../../services/admin/inventory.service";
import { showSuccess, showError, getApiErrorMessage } from "../../../utils/toast";
import IngredientFormModal from "./IngredientFormModal";
import AdjustmentModal from "./AdjustmentModal";

const UNIT_LABELS = { GRAM: "Gram (g)", MILLILITER: "Milliliter (ml)", PIECE: "Cái" };

const IngredientsTab = () => {
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedIngredient, setSelectedIngredient] = useState(null);

    const [isAdjustOpen, setIsAdjustOpen] = useState(false);
    const [adjustIngredient, setAdjustIngredient] = useState(null);

    const fetchIngredients = async (currentPage = page) => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                search: searchTerm,
                status: statusFilter || undefined,
            };
            // adminApi interceptor already unwraps response.data → result = { message, data }
            const result = await inventoryService.getIngredients(params);
            const payload = result.data; // paginator or array

            if (payload && payload.data) {
                // paginated: { data: [...], last_page, ... }
                setIngredients(payload.data);
                setTotalPages(payload.last_page || 1);
            } else if (Array.isArray(payload)) {
                setIngredients(payload);
                setTotalPages(1);
            } else {
                setIngredients([]);
            }
        } catch (error) {
            showError(getApiErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIngredients(page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const handleSearch = () => {
        setPage(1);
        fetchIngredients(1);
    };

    const handleEdit = (ingredient) => {
        setSelectedIngredient(ingredient);
        setIsFormOpen(true);
    };

    const handleAdd = () => {
        setSelectedIngredient(null);
        setIsFormOpen(true);
    };

    const handleAdjust = (ingredient) => {
        setAdjustIngredient(ingredient);
        setIsAdjustOpen(true);
    };

    const handleToggleStatus = async (ingredient) => {
        const newStatus = ingredient.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
        const label = newStatus === "INACTIVE" ? "vô hiệu hóa" : "kích hoạt";
        if (!window.confirm(`Xác nhận ${label} nguyên liệu "${ingredient.name}"?`)) return;
        try {
            await inventoryService.updateIngredientStatus(ingredient.id, newStatus);
            showSuccess(`Đã ${label} nguyên liệu thành công`);
            fetchIngredients(page);
        } catch (error) {
            showError(getApiErrorMessage(error));
        }
    };

    const handleDelete = async (ingredient) => {
        if (!window.confirm(`Xóa nguyên liệu "${ingredient.name}"? Hành động này không thể hoàn tác.`)) return;
        try {
            await inventoryService.deleteIngredient(ingredient.id);
            showSuccess("Đã xóa nguyên liệu");
            fetchIngredients(page);
        } catch (error) {
            showError(getApiErrorMessage(error));
        }
    };

    const handleFormSuccess = () => {
        handleSearch();
    };

    const handleAdjustSuccess = () => {
        fetchIngredients(page);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "ACTIVE":
                return <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">Đang hoạt động</span>;
            case "INACTIVE":
                return <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">Ngừng hoạt động</span>;
            default:
                return null;
        }
    };

    const getInventoryStatusBadge = (stock, minStock) => {
        const current = Number(stock);
        const min = Number(minStock);
        if (current <= 0) {
            return <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">Hết hàng</span>;
        }
        if (current <= min) {
            return <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">Sắp hết</span>;
        }
        return <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">Bình thường</span>;
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
                            placeholder="Tìm kiếm mã hoặc tên..."
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
                        <option value="ACTIVE">Đang hoạt động</option>
                        <option value="INACTIVE">Ngừng hoạt động</option>
                    </select>

                    <button
                        onClick={handleSearch}
                        className="rounded-lg bg-[#ebe3dd] px-4 py-2 font-medium text-[#65473c] hover:bg-[#e4d6cc]"
                    >
                        Lọc
                    </button>
                </div>

                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 rounded-lg bg-[#604238] px-4 py-2 font-medium text-white hover:bg-[#49332b]"
                >
                    <Plus size={18} />
                    Thêm nguyên liệu
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-[#ebe3dd] bg-white">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[#fbfaf9] text-[#998c84]">
                        <tr>
                            <th className="px-4 py-3 font-medium">Mã NL</th>
                            <th className="px-4 py-3 font-medium">Tên nguyên liệu</th>
                            <th className="px-4 py-3 font-medium">Đơn vị</th>
                            <th className="px-4 py-3 font-medium">Tồn / Tối thiểu</th>
                            <th className="px-4 py-3 font-medium">Giá vốn TB</th>
                            <th className="px-4 py-3 font-medium">Giá trị tồn</th>
                            <th className="px-4 py-3 font-medium">Trạng thái kho</th>
                            <th className="px-4 py-3 font-medium">Trạng thái</th>
                            <th className="px-4 py-3 font-medium">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ebe3dd]">
                        {loading ? (
                            <tr>
                                <td colSpan="9" className="p-8 text-center text-gray-500">
                                    Đang tải dữ liệu...
                                </td>
                            </tr>
                        ) : ingredients.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="p-8 text-center text-gray-500">
                                    Không có dữ liệu nguyên liệu.
                                </td>
                            </tr>
                        ) : (
                            ingredients.map((item) => (
                                <tr key={item.id} className="hover:bg-[#fbfaf9]">
                                    <td className="px-4 py-3 font-medium text-[#49332b]">{item.ingredient_code}</td>
                                    <td className="px-4 py-3">{item.name}</td>
                                    <td className="px-4 py-3">
                                        {UNIT_LABELS[item.unit] || item.unit}
                                    </td>
                                    <td className="px-4 py-3 font-bold text-[#604238]">
                                        {Number(item.current_stock)} / {Number(item.minimum_stock)}
                                    </td>
                                    <td className="px-4 py-3">{formatCurrency(item.average_cost)}</td>
                                    <td className="px-4 py-3">{formatCurrency(Number(item.current_stock) * Number(item.average_cost))}</td>
                                    <td className="px-4 py-3">{getInventoryStatusBadge(item.current_stock, item.minimum_stock)}</td>
                                    <td className="px-4 py-3">{getStatusBadge(item.status)}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            {/* Điều chỉnh kho */}
                                            <button
                                                onClick={() => handleAdjust(item)}
                                                className="text-blue-600 hover:text-blue-800"
                                                title="Điều chỉnh kho"
                                            >
                                                <ArchiveRestore size={18} />
                                            </button>
                                            {/* Sửa */}
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="text-[#998c84] hover:text-[#9c513d]"
                                                title="Sửa"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            {/* Bật/Tắt status */}
                                            <button
                                                onClick={() => handleToggleStatus(item)}
                                                className={item.status === "ACTIVE" ? "text-green-600 hover:text-green-800" : "text-gray-400 hover:text-gray-600"}
                                                title={item.status === "ACTIVE" ? "Vô hiệu hóa" : "Kích hoạt"}
                                            >
                                                {item.status === "ACTIVE" ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                            </button>
                                            {/* Xóa */}
                                            <button
                                                onClick={() => handleDelete(item)}
                                                className="text-red-500 hover:text-red-700"
                                                title="Xóa"
                                            >
                                                <Trash2 size={18} />
                                            </button>
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

            {isFormOpen && (
                <IngredientFormModal
                    isOpen={isFormOpen}
                    onClose={() => {
                        setIsFormOpen(false);
                        setSelectedIngredient(null);
                    }}
                    ingredient={selectedIngredient}
                    onSuccess={handleFormSuccess}
                />
            )}

            {isAdjustOpen && (
                <AdjustmentModal
                    isOpen={isAdjustOpen}
                    onClose={() => {
                        setIsAdjustOpen(false);
                        setAdjustIngredient(null);
                    }}
                    ingredient={adjustIngredient}
                    onSuccess={handleAdjustSuccess}
                />
            )}
        </div>
    );
};

export default IngredientsTab;
