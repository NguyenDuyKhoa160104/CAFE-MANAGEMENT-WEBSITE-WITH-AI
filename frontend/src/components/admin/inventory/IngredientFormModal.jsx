import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { inventoryService } from "../../../services/admin/inventory.service";
import { showSuccess, showError, getApiErrorMessage } from "../../../utils/toast";

const IngredientFormModal = ({ isOpen, onClose, ingredient, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        ingredient_code: "",
        name: "",
        unit: "",
        minimum_stock: 0,
        description: "",
        status: "ACTIVE",
    });

    useEffect(() => {
        if (ingredient) {
            setFormData({
                ingredient_code: ingredient.ingredient_code || "",
                name: ingredient.name || "",
                unit: ingredient.unit || "",
                minimum_stock: ingredient.minimum_stock || 0,
                description: ingredient.description || "",
                status: ingredient.status || "ACTIVE",
            });
        } else {
            // Reset form when creating new ingredient
            setFormData({
                ingredient_code: "",
                name: "",
                unit: "",
                minimum_stock: 0,
                description: "",
                status: "ACTIVE",
            });
        }
    }, [ingredient, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (ingredient) {
                await inventoryService.updateIngredient(ingredient.id, formData);
                showSuccess("Cập nhật nguyên liệu thành công");
            } else {
                await inventoryService.createIngredient(formData);
                showSuccess("Thêm nguyên liệu thành công");
            }
            onSuccess();
            onClose();
        } catch (error) {
            showError(getApiErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-[#49332b]">
                        {ingredient ? "Cập nhật nguyên liệu" : "Thêm nguyên liệu"}
                    </h3>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 hover:bg-gray-100 transition"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Mã NL</label>
                        <input
                            type="text"
                            name="ingredient_code"
                            value={formData.ingredient_code}
                            onChange={handleChange}
                            required
                            className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-[#9c513d]"
                            placeholder="Ví dụ: NL001"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Tên nguyên liệu</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-[#9c513d]"
                            placeholder="Ví dụ: Cà phê hạt Robusta"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Đơn vị</label>
                            <select
                                name="unit"
                                value={formData.unit}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-[#9c513d] bg-white"
                            >
                                <option value="">-- Chọn đơn vị --</option>
                                <option value="GRAM">Gram (g)</option>
                                <option value="MILLILITER">Milliliter (ml)</option>
                                <option value="PIECE">Cái</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Tồn tối thiểu</label>
                            <input
                                type="number"
                                name="minimum_stock"
                                value={formData.minimum_stock}
                                onChange={handleChange}
                                min="0"
                                step="any"
                                required
                                className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-[#9c513d]"
                            />
                        </div>
                    </div>
                    
                    {ingredient && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-500">Tồn hiện tại</label>
                                <input
                                    type="text"
                                    value={ingredient.current_stock}
                                    readOnly
                                    className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-500 cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-500">Giá vốn TB</label>
                                <input
                                    type="text"
                                    value={ingredient.average_cost}
                                    readOnly
                                    className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-500 cursor-not-allowed"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Trạng thái</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-[#9c513d]"
                        >
                            <option value="ACTIVE">Hoạt động</option>
                            <option value="INACTIVE">Ngừng hoạt động</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Mô tả</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="2"
                            className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-[#9c513d]"
                            placeholder="Ghi chú thêm (không bắt buộc)"
                        ></textarea>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                            disabled={loading}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 rounded-lg bg-[#604238] px-6 py-2 text-sm font-medium text-white hover:bg-[#49332b] disabled:opacity-70"
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            {ingredient ? "Cập nhật" : "Thêm mới"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default IngredientFormModal;
