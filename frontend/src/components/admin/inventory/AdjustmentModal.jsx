import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { inventoryService } from "../../../services/admin/inventory.service";
import { showSuccess, showError, getApiErrorMessage } from "../../../utils/toast";

const AdjustmentModal = ({ isOpen, onClose, ingredient, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        type: "ADJUSTMENT_IN",
        quantity: "",
        reason: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (Number(formData.quantity) <= 0) {
            showError("Số lượng điều chỉnh phải lớn hơn 0");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ingredient_id: ingredient.id,
                type: formData.type,
                quantity: Number(formData.quantity),
                reason: formData.reason
            };
            await inventoryService.adjustStock(payload);
            showSuccess("Điều chỉnh kho thành công");
            onSuccess();
            onClose();
        } catch (error) {
            showError(getApiErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !ingredient) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-[#49332b]">
                        Điều chỉnh kho
                    </h3>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 hover:bg-gray-100 transition"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="mb-4 rounded-lg bg-gray-50 p-4">
                    <p className="text-sm text-gray-600">Nguyên liệu: <span className="font-semibold text-gray-900">{ingredient.name} ({ingredient.ingredient_code})</span></p>
                    <p className="mt-1 text-sm text-gray-600">Tồn hiện tại: <span className="font-semibold text-[#9c513d]">{ingredient.current_stock} {ingredient.unit}</span></p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Loại điều chỉnh</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-[#9c513d]"
                        >
                            <option value="ADJUSTMENT_IN">Nhập điều chỉnh (Cộng)</option>
                            <option value="ADJUSTMENT_OUT">Xuất điều chỉnh (Trừ)</option>
                            <option value="WASTE">Hao hụt (Trừ)</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Số lượng điều chỉnh ({ingredient.unit})</label>
                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            min="0.001"
                            step="any"
                            required
                            className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-[#9c513d]"
                            placeholder="Nhập số lượng (số dương)"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Lý do</label>
                        <textarea
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            rows="2"
                            required
                            className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-[#9c513d]"
                            placeholder="Nhập lý do điều chỉnh bắt buộc"
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
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-70"
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            Xác nhận điều chỉnh
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdjustmentModal;
