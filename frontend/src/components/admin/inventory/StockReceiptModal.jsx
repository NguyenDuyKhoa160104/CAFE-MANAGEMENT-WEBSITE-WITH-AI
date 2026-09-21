import React, { useState, useEffect } from "react";
import { X, Loader2, Plus, Trash2 } from "lucide-react";
import { inventoryService } from "../../../services/admin/inventory.service";
import { showSuccess, showError, getApiErrorMessage } from "../../../utils/toast";

const UNIT_LABELS = { GRAM: "g", MILLILITER: "ml", PIECE: "cái" };

const StockReceiptModal = ({ isOpen, onClose, receiptId, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [receipt, setReceipt] = useState(null);
    const [ingredientsList, setIngredientsList] = useState([]);

    const [formData, setFormData] = useState({
        supplier_name: "",
        note: "",
        items: [], // { ingredient_id, quantity, unit_cost }
    });

    useEffect(() => {
        if (!isOpen) return;

        const init = async () => {
            setLoading(true);
            try {
                // adminApi already unwraps response.data → result = { message, data }
                const ingRes = await inventoryService.getIngredients({ status: "ACTIVE", per_page: 1000 });
                const ingPayload = ingRes.data;
                let ingList = [];
                if (ingPayload && ingPayload.data) {
                    ingList = ingPayload.data;
                } else if (Array.isArray(ingPayload)) {
                    ingList = ingPayload;
                }
                setIngredientsList(ingList);

                if (receiptId) {
                    const res = await inventoryService.getStockReceiptById(receiptId);
                    const r = res.data;
                    setReceipt(r);
                    setFormData({
                        supplier_name: r.supplier_name || "",
                        note: r.note || "",
                        // Map backend field: unit_cost (not unit_price)
                        items: (r.items || []).map((item) => ({
                            ingredient_id: item.ingredient_id,
                            quantity: item.quantity,
                            unit_cost: item.unit_cost,
                        })),
                    });
                } else {
                    setReceipt(null);
                    setFormData({ supplier_name: "", note: "", items: [] });
                }
            } catch (error) {
                showError(getApiErrorMessage(error));
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [isOpen, receiptId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddItem = () => {
        if (ingredientsList.length === 0) return;
        setFormData((prev) => ({
            ...prev,
            items: [...prev.items, { ingredient_id: ingredientsList[0].id, quantity: 1, unit_cost: 0 }],
        }));
    };

    const handleRemoveItem = (index) => {
        setFormData((prev) => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index),
        }));
    };

    const handleItemChange = (index, field, value) => {
        setFormData((prev) => {
            const newItems = [...prev.items];
            newItems[index] = { ...newItems[index], [field]: value };
            return { ...prev, items: newItems };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.items.length === 0) {
            showError("Phiếu nhập phải có ít nhất 1 mặt hàng");
            return;
        }

        // Build payload with only allowed fields: ingredient_id, quantity, unit_cost
        const payload = {
            supplier_name: formData.supplier_name || undefined,
            note: formData.note || undefined,
            items: formData.items.map((item) => ({
                ingredient_id: Number(item.ingredient_id),
                quantity: Number(item.quantity),
                unit_cost: Number(item.unit_cost),
            })),
        };

        setSaving(true);
        try {
            if (receiptId) {
                await inventoryService.updateStockReceipt(receiptId, payload);
                showSuccess("Cập nhật phiếu nhập thành công");
            } else {
                await inventoryService.createStockReceipt(payload);
                showSuccess("Tạo phiếu nhập nháp thành công");
            }
            onSuccess();
        } catch (error) {
            showError(getApiErrorMessage(error));
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    const isReadOnly = receipt && receipt.status !== "DRAFT";

    const calculateTotal = () => {
        return formData.items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unit_cost), 0);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount || 0);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-[#49332b]">
                        {receiptId
                            ? isReadOnly
                                ? "Chi tiết phiếu nhập"
                                : "Cập nhật phiếu nhập"
                            : "Tạo phiếu nhập mới"}
                    </h3>
                    <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100 transition">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="animate-spin text-[#9c513d]" size={32} />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {receipt && (
                            <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600 border border-gray-100">
                                <span className="font-medium">Mã phiếu:</span> {receipt.receipt_code}
                                {receipt.status !== "DRAFT" && (
                                    <span className="ml-4 font-medium text-orange-600">
                                        ⚠ Phiếu đã {receipt.status === "COMPLETED" ? "hoàn tất" : "hủy"} – chỉ đọc
                                    </span>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Nhà cung cấp</label>
                                <input
                                    type="text"
                                    name="supplier_name"
                                    value={formData.supplier_name}
                                    onChange={handleChange}
                                    readOnly={isReadOnly}
                                    className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-[#9c513d] read-only:bg-gray-50"
                                    placeholder="Tên nhà cung cấp (không bắt buộc)"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Ghi chú</label>
                                <input
                                    type="text"
                                    name="note"
                                    value={formData.note}
                                    onChange={handleChange}
                                    readOnly={isReadOnly}
                                    className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-[#9c513d] read-only:bg-gray-50"
                                    placeholder="Ghi chú thêm"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-gray-800">Danh sách mặt hàng</h4>
                                {!isReadOnly && (
                                    <button
                                        type="button"
                                        onClick={handleAddItem}
                                        className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                                    >
                                        <Plus size={16} /> Thêm dòng
                                    </button>
                                )}
                            </div>

                            <div className="overflow-x-auto rounded-lg border border-gray-200">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-600">
                                        <tr>
                                            <th className="p-3 w-1/3">Nguyên liệu</th>
                                            <th className="p-3 w-1/5">Số lượng</th>
                                            <th className="p-3 w-1/5">Đơn giá nhập</th>
                                            <th className="p-3">Thành tiền (tạm tính)</th>
                                            {!isReadOnly && <th className="p-3 w-10"></th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {formData.items.length === 0 ? (
                                            <tr>
                                                <td colSpan={isReadOnly ? 4 : 5} className="p-4 text-center text-gray-500">
                                                    Chưa có mặt hàng nào.
                                                </td>
                                            </tr>
                                        ) : (
                                            formData.items.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="p-2">
                                                        {isReadOnly ? (
                                                            <span className="font-medium">
                                                                {ingredientsList.find((i) => i.id === item.ingredient_id)?.name ||
                                                                    `ID: ${item.ingredient_id}`}
                                                            </span>
                                                        ) : (
                                                            <select
                                                                value={item.ingredient_id}
                                                                onChange={(e) =>
                                                                    handleItemChange(index, "ingredient_id", Number(e.target.value))
                                                                }
                                                                className="w-full rounded border border-gray-300 p-2 outline-none"
                                                            >
                                                                {ingredientsList.map((ing) => (
                                                                    <option key={ing.id} value={ing.id}>
                                                                        {ing.name} ({UNIT_LABELS[ing.unit] || ing.unit})
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        )}
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) =>
                                                                handleItemChange(index, "quantity", Number(e.target.value))
                                                            }
                                                            readOnly={isReadOnly}
                                                            min="0.01"
                                                            step="any"
                                                            required
                                                            className="w-full rounded border border-gray-300 p-2 outline-none read-only:bg-gray-50"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="number"
                                                            value={item.unit_cost}
                                                            onChange={(e) =>
                                                                handleItemChange(index, "unit_cost", Number(e.target.value))
                                                            }
                                                            readOnly={isReadOnly}
                                                            min="0"
                                                            step="any"
                                                            required
                                                            className="w-full rounded border border-gray-300 p-2 outline-none read-only:bg-gray-50"
                                                        />
                                                    </td>
                                                    <td className="p-2 font-medium">
                                                        {formatCurrency(Number(item.quantity) * Number(item.unit_cost))}
                                                    </td>
                                                    {!isReadOnly && (
                                                        <td className="p-2 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveItem(index)}
                                                                className="text-red-500 hover:text-red-700"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                    <tfoot className="bg-gray-50">
                                        <tr>
                                            <td colSpan="3" className="p-3 text-right font-semibold">
                                                Tổng cộng (tạm tính):
                                            </td>
                                            <td colSpan={isReadOnly ? 1 : 2} className="p-3 font-bold text-[#9c513d]">
                                                {formatCurrency(calculateTotal())}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        {!isReadOnly && (
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                                    disabled={saving}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 rounded-lg bg-[#604238] px-6 py-2 text-sm font-medium text-white hover:bg-[#49332b] disabled:opacity-70"
                                >
                                    {saving && <Loader2 size={16} className="animate-spin" />}
                                    {receiptId ? "Lưu thay đổi" : "Lưu nháp"}
                                </button>
                            </div>
                        )}

                        {isReadOnly && (
                            <div className="flex justify-end pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-lg px-6 py-2 text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                                >
                                    Đóng
                                </button>
                            </div>
                        )}
                    </form>
                )}
            </div>
        </div>
    );
};

export default StockReceiptModal;
