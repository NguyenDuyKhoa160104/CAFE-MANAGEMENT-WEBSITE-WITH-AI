import React, { useState, useEffect } from "react";
import { X, Loader2, Plus, Trash2, CookingPot, Info } from "lucide-react";
import { inventoryService } from "../../../services/admin/inventory.service";
import { showSuccess, showError, getApiErrorMessage } from "../../../utils/toast";

const UNIT_LABELS = { GRAM: "g", MILLILITER: "ml", PIECE: "cái" };

const ProductRecipeModal = ({ isOpen, onClose, product, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [ingredientsList, setIngredientsList] = useState([]);

    const [formData, setFormData] = useState({
        track_inventory: false,
        ingredients: [], // { ingredient_id, quantity_required }
    });

    const [recipeInfo, setRecipeInfo] = useState(null);

    useEffect(() => {
        if (!isOpen || !product) return;

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

                // Fetch recipe for product
                const recipeRes = await inventoryService.getProductRecipe(product.id);
                const data = recipeRes.data;

                setFormData({
                    track_inventory: data.track_inventory || false,
                    ingredients: data.ingredients || [],
                });

                if (data.track_inventory) {
                    setRecipeInfo({
                        estimated_cost: data.estimated_cost,
                        inventory_available: data.inventory_available,
                        max_producible_quantity: data.max_producible_quantity,
                    });
                } else {
                    setRecipeInfo(null);
                }
            } catch (error) {
                showError(getApiErrorMessage(error));
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [isOpen, product]);

    const handleAddItem = () => {
        if (ingredientsList.length === 0) return;
        setFormData((prev) => ({
            ...prev,
            ingredients: [...prev.ingredients, { ingredient_id: ingredientsList[0].id, quantity_required: 0 }],
        }));
    };

    const handleRemoveItem = (index) => {
        setFormData((prev) => ({
            ...prev,
            ingredients: prev.ingredients.filter((_, i) => i !== index),
        }));
    };

    const handleItemChange = (index, field, value) => {
        setFormData((prev) => {
            const newItems = [...prev.ingredients];
            newItems[index] = { ...newItems[index], [field]: value };
            return { ...prev, ingredients: newItems };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.track_inventory && formData.ingredients.length === 0) {
            showError("Vui lòng thêm ít nhất 1 nguyên liệu vào công thức");
            return;
        }

        // Only send: track_inventory + ingredients with ingredient_id + quantity_required
        const payload = {
            track_inventory: formData.track_inventory,
            ingredients: formData.track_inventory
                ? formData.ingredients.map((item) => ({
                      ingredient_id: Number(item.ingredient_id),
                      quantity_required: Number(item.quantity_required),
                  }))
                : [],
        };

        setSaving(true);
        try {
            await inventoryService.updateProductRecipe(product.id, payload);
            showSuccess("Cập nhật công thức thành công");
            onSuccess();
            onClose();
        } catch (error) {
            showError(getApiErrorMessage(error));
        } finally {
            setSaving(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount || 0);
    };

    if (!isOpen || !product) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                            <CookingPot size={22} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-[#49332b]">Công thức: {product.name}</h3>
                            <p className="text-sm text-gray-500">Mã: {product.product_code}</p>
                        </div>
                    </div>

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
                        {/* Track inventory toggle */}
                        <div className="rounded-lg border border-purple-100 bg-purple-50 p-4 flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-purple-900">Theo dõi kho</h4>
                                <p className="text-xs text-purple-700 mt-1">
                                    Khi bật, đơn hàng sẽ tự động trừ kho nguyên liệu cấu hình dưới đây.
                                </p>
                            </div>
                            <label className="relative inline-flex cursor-pointer items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.track_inventory}
                                    onChange={(e) =>
                                        setFormData({ ...formData, track_inventory: e.target.checked })
                                    }
                                    className="peer sr-only"
                                />
                                <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-purple-600 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                            </label>
                        </div>

                        {formData.track_inventory ? (
                            <>
                                {recipeInfo && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="rounded-lg bg-gray-50 p-3 border border-gray-100">
                                            <p className="text-xs text-gray-500">Chi phí NVL ước tính</p>
                                            <p className="mt-1 font-semibold text-gray-800">
                                                {formatCurrency(recipeInfo.estimated_cost)}
                                            </p>
                                        </div>
                                        <div className="rounded-lg bg-gray-50 p-3 border border-gray-100">
                                            <p className="text-xs text-gray-500">Trạng thái kho</p>
                                            {recipeInfo.inventory_available ? (
                                                <p className="mt-1 font-semibold text-green-600">Đủ nguyên liệu</p>
                                            ) : (
                                                <p className="mt-1 font-semibold text-red-600">Thiếu nguyên liệu</p>
                                            )}
                                        </div>
                                        <div className="rounded-lg bg-gray-50 p-3 border border-gray-100">
                                            <p className="text-xs text-gray-500">Có thể pha (Max)</p>
                                            <p className="mt-1 font-semibold text-gray-800">
                                                {recipeInfo.max_producible_quantity} sản phẩm
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold text-gray-800">Công thức nguyên liệu</h4>
                                        <button
                                            type="button"
                                            onClick={handleAddItem}
                                            className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                                        >
                                            <Plus size={16} /> Thêm nguyên liệu
                                        </button>
                                    </div>

                                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-gray-50 text-gray-600">
                                                <tr>
                                                    <th className="p-3 w-1/2">Nguyên liệu</th>
                                                    <th className="p-3">Đơn vị</th>
                                                    <th className="p-3 w-1/4">Lượng / 1 SP</th>
                                                    <th className="p-3 w-10"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {formData.ingredients.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={4} className="p-4 text-center text-gray-500">
                                                            Chưa có nguyên liệu nào.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    formData.ingredients.map((item, index) => {
                                                        const ing = ingredientsList.find(
                                                            (i) => i.id === Number(item.ingredient_id)
                                                        );
                                                        return (
                                                            <tr key={index}>
                                                                <td className="p-2">
                                                                    <select
                                                                        value={item.ingredient_id}
                                                                        onChange={(e) =>
                                                                            handleItemChange(
                                                                                index,
                                                                                "ingredient_id",
                                                                                Number(e.target.value)
                                                                            )
                                                                        }
                                                                        className="w-full rounded border border-gray-300 p-2 outline-none"
                                                                    >
                                                                        {ingredientsList.map((i) => (
                                                                            <option key={i.id} value={i.id}>
                                                                                {i.name}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </td>
                                                                <td className="p-2 text-gray-500">
                                                                    {ing ? (UNIT_LABELS[ing.unit] || ing.unit) : "-"}
                                                                </td>
                                                                <td className="p-2">
                                                                    <input
                                                                        type="number"
                                                                        value={item.quantity_required}
                                                                        onChange={(e) =>
                                                                            handleItemChange(
                                                                                index,
                                                                                "quantity_required",
                                                                                Number(e.target.value)
                                                                            )
                                                                        }
                                                                        min="0.001"
                                                                        step="any"
                                                                        required
                                                                        className="w-full rounded border border-gray-300 p-2 outline-none focus:border-purple-500"
                                                                    />
                                                                </td>
                                                                <td className="p-2 text-center">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveItem(index)}
                                                                        className="text-red-500 hover:text-red-700"
                                                                    >
                                                                        <Trash2 size={18} />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                                <Info size={32} className="mx-auto mb-2 text-gray-400" />
                                <h4 className="text-sm font-semibold text-gray-700">Không theo dõi nguyên liệu</h4>
                                <p className="mt-1 text-xs text-gray-500">
                                    Sản phẩm này sẽ không yêu cầu nguyên liệu để chế biến và không bị giới hạn bởi tồn kho.
                                </p>
                            </div>
                        )}

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
                                Lưu công thức
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ProductRecipeModal;
