import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { inventoryService } from "../../../services/admin/inventory.service";
import { showError, getApiErrorMessage } from "../../../utils/toast";

const UNIT_LABELS = { GRAM: "g", MILLILITER: "ml", PIECE: "cái" };

const LowStockTab = () => {
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchLowStock = async () => {
        setLoading(true);
        try {
            // adminApi already unwraps response.data → result = { message, data }
            const result = await inventoryService.getLowStock({ search: searchTerm || undefined });
            // Backend getLowStock returns a Collection (not paginated) mapped to array
            const payload = result.data;
            if (Array.isArray(payload)) {
                setIngredients(payload);
            } else if (payload && Array.isArray(payload.data)) {
                // in case backend paginates in future
                setIngredients(payload.data);
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
        fetchLowStock();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearch = () => {
        fetchLowStock();
    };

    const getInventoryStatusBadge = (inventoryStatus) => {
        if (inventoryStatus === "OUT") {
            return <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">Hết hàng</span>;
        }
        return <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">Sắp hết</span>;
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

                    <button
                        onClick={handleSearch}
                        className="rounded-lg bg-[#ebe3dd] px-4 py-2 font-medium text-[#65473c] hover:bg-[#e4d6cc]"
                    >
                        Lọc
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-[#ebe3dd] bg-white">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[#fbfaf9] text-[#998c84]">
                        <tr>
                            <th className="px-4 py-3 font-medium">Mã NL</th>
                            <th className="px-4 py-3 font-medium">Tên nguyên liệu</th>
                            <th className="px-4 py-3 font-medium">Đơn vị</th>
                            <th className="px-4 py-3 font-medium">Tồn hiện tại</th>
                            <th className="px-4 py-3 font-medium">Mức tối thiểu</th>
                            <th className="px-4 py-3 font-medium">Trạng thái kho</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ebe3dd]">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-gray-500">
                                    Đang tải dữ liệu...
                                </td>
                            </tr>
                        ) : ingredients.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-gray-500">
                                    Tuyệt vời! Không có nguyên liệu nào sắp hết hàng.
                                </td>
                            </tr>
                        ) : (
                            ingredients.map((item) => (
                                <tr key={item.id} className="hover:bg-[#fbfaf9]">
                                    <td className="px-4 py-3 font-medium text-[#49332b]">{item.ingredient_code}</td>
                                    <td className="px-4 py-3">{item.name}</td>
                                    <td className="px-4 py-3 text-gray-500">
                                        {UNIT_LABELS[item.unit] || item.unit}
                                    </td>
                                    <td className="px-4 py-3 font-bold text-red-600">
                                        {Number(item.current_stock)}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-gray-600">{Number(item.minimum_stock)}</td>
                                    <td className="px-4 py-3">{getInventoryStatusBadge(item.inventory_status)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LowStockTab;
