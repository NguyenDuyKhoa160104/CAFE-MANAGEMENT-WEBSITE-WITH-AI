import React, { useState, useEffect } from "react";
import { X, Loader2, Plus, Minus, Trash2 } from "lucide-react";
import { staffTableService } from "../../../services/staff/table.service";
import { staffMenuService } from "../../../services/staff/menu.service";
import { staffOrderService } from "../../../services/staff/order.service";
import { showError, showSuccess } from "../../../utils/toast";
import { getApiErrorMessage } from "../../../utils/apiError";

export default function CreateOrderModal({ isOpen, onClose, onSuccess, initialTableId = null, initialOrderType = "DINE_IN" }) {
    const [orderType, setOrderType] = useState(initialOrderType);
    const [tableId, setTableId] = useState(initialTableId || "");
    const [tables, setTables] = useState([]);
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        const fetchData = async () => {
            try {
                setLoading(true);
                const [tablesRes, productsRes] = await Promise.all([
                    staffTableService.getTables(),
                    staffMenuService.getProducts()
                ]);
                setTables(Array.isArray(tablesRes) ? tablesRes.filter(t => t.status === "AVAILABLE" || t.id === initialTableId) : []);
                setProducts(Array.isArray(productsRes) ? productsRes : []);
            } catch (error) {
                showError(getApiErrorMessage(error));
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [isOpen, initialTableId]);

    const addToCart = (product) => {
        const existingItem = cart.find(item => item.product_id === product.id);
        
        if (product.max_producible_quantity !== undefined && product.max_producible_quantity !== null) {
            const currentQty = existingItem ? existingItem.quantity : 0;
            if (currentQty + 1 > product.max_producible_quantity) {
                showError(`Kho chỉ còn đủ cho ${product.max_producible_quantity} phần.`);
                return;
            }
        }

        if (existingItem) {
            setCart(cart.map(item => item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setCart([...cart, { product_id: product.id, product_name: product.name, price: product.price, quantity: 1, note: "" }]);
        }
    };

    const updateQuantity = (productId, delta) => {
        setCart(cart.map(item => {
            if (item.product_id === productId) {
                const product = products.find(p => p.id === productId);
                const newQty = item.quantity + delta;
                
                if (product && product.max_producible_quantity !== undefined && product.max_producible_quantity !== null) {
                    if (newQty > product.max_producible_quantity) {
                        showError(`Kho chỉ còn đủ cho ${product.max_producible_quantity} phần.`);
                        return { ...item, quantity: product.max_producible_quantity };
                    }
                }
                
                return { ...item, quantity: Math.max(1, newQty) };
            }
            return item;
        }));
    };

    const updateNote = (productId, note) => {
        setCart(cart.map(item => item.product_id === productId ? { ...item, note } : item));
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.product_id !== productId));
    };

    const handleSubmit = async () => {
        if (orderType === "DINE_IN" && !tableId) {
            return showError("Vui lòng chọn bàn");
        }
        if (cart.length === 0) {
            return showError("Vui lòng chọn ít nhất 1 món");
        }

        try {
            setSubmitting(true);
            const payload = {
                order_type: orderType,
                table_id: orderType === "DINE_IN" ? tableId : null,
                customer_type: "WALK_IN",
                items: cart.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    note: item.note
                }))
            };
            const response = await staffOrderService.createOrder(payload);
            showSuccess(response.message || "Tạo đơn hàng thành công");
            onSuccess();
        } catch (error) {
            showError(getApiErrorMessage(error));
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="flex h-[90vh] w-full max-w-5xl flex-col rounded-2xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-[#E9DFD8] px-6 py-4">
                    <h2 className="text-xl font-bold text-[#49332b]">Tạo đơn hàng mới</h2>
                    <button onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
                        <X size={20} />
                    </button>
                </div>

                {loading ? (
                    <div className="flex flex-1 items-center justify-center">
                        <Loader2 className="animate-spin text-[#9c513d]" size={40} />
                    </div>
                ) : (
                    <div className="flex flex-1 overflow-hidden">
                        {/* LEFT: Menu Selection */}
                        <div className="flex-1 flex flex-col border-r border-[#E9DFD8] bg-[#fbfaf9] p-4">
                            <h3 className="font-bold text-[#49332b] mb-4">Danh sách món</h3>
                            <div className="overflow-y-auto pr-2 grid grid-cols-2 md:grid-cols-3 gap-3">
                                {products.map(product => (
                                    <div key={product.id} className="rounded-lg border border-[#E9DFD8] bg-white p-3 hover:shadow-sm transition flex flex-col justify-between">
                                        <div>
                                            <p className="font-bold text-[#49332b] text-sm">{product.name}</p>
                                            <p className="text-[#604238] text-xs font-semibold mt-1">{Number(product.price).toLocaleString()} ₫</p>
                                            {product.track_inventory && product.max_producible_quantity !== null && (
                                                <p className="text-[10px] text-orange-600 font-medium mt-1">Kho: {product.max_producible_quantity} phần</p>
                                            )}
                                        </div>
                                        {/* Disable check based on effective_sellable */}
                                        {product.status !== 'ACTIVE' || product.recipe_configured === false || product.inventory_available === false ? (
                                            <button
                                                disabled
                                                className="mt-3 w-full flex items-center justify-center gap-1 bg-gray-100 text-gray-400 py-1 rounded text-xs font-semibold cursor-not-allowed"
                                            >
                                                {product.status === 'INACTIVE' ? 'Ngừng bán' :
                                                 product.status === 'OUT_OF_STOCK' ? 'Hết món' :
                                                 product.recipe_configured === false ? 'Chưa có CT' : 'Hết NL'}
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => addToCart(product)}
                                                className="mt-3 rounded border border-[#604238] py-1 text-xs font-bold text-[#604238] hover:bg-[#604238] hover:text-white transition"
                                            >
                                                Thêm
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT: Order Form & Cart */}
                        <div className="w-96 flex flex-col bg-white p-4">
                            <h3 className="font-bold text-[#49332b] mb-4">Thông tin đơn</h3>
                            
                            <div className="mb-4 space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-[#625751] mb-1">Loại đơn</label>
                                    <select
                                        value={orderType}
                                        onChange={(e) => {
                                            setOrderType(e.target.value);
                                            if (e.target.value === "TAKEAWAY") setTableId("");
                                        }}
                                        className="w-full rounded-lg border border-[#E9DFD8] px-3 py-2 text-sm text-[#49332b] focus:border-[#604238] focus:ring-1 focus:ring-[#604238] outline-none"
                                    >
                                        <option value="DINE_IN">Tại bàn</option>
                                        <option value="TAKEAWAY">Mang đi</option>
                                    </select>
                                </div>

                                {orderType === "DINE_IN" && (
                                    <div>
                                        <label className="block text-xs font-semibold text-[#625751] mb-1">Bàn</label>
                                        <select
                                            value={tableId}
                                            onChange={(e) => setTableId(e.target.value)}
                                            className="w-full rounded-lg border border-[#E9DFD8] px-3 py-2 text-sm text-[#49332b] focus:border-[#604238] focus:ring-1 focus:ring-[#604238] outline-none"
                                        >
                                            <option value="">-- Chọn bàn --</option>
                                            {tables.map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 overflow-y-auto mb-4">
                                <h3 className="font-bold text-[#49332b] text-sm mb-2 border-b pb-1">Giỏ hàng ({cart.length})</h3>
                                {cart.length === 0 ? (
                                    <p className="text-sm text-[#958981] text-center mt-4">Chưa có món nào được chọn.</p>
                                ) : (
                                    <ul className="space-y-3">
                                        {cart.map((item) => (
                                            <li key={item.product_id} className="rounded-lg border border-gray-100 p-2 text-sm bg-gray-50">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-semibold text-[#49332b]">{item.product_name}</span>
                                                    <span className="font-bold text-[#604238]">{Number(item.price * item.quantity).toLocaleString()} ₫</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => updateQuantity(item.product_id, -1)} className="rounded bg-white border border-gray-300 p-0.5 text-gray-500 hover:bg-gray-100">
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className="font-semibold text-sm w-4 text-center">{item.quantity}</span>
                                                        <button onClick={() => updateQuantity(item.product_id, 1)} className="rounded bg-white border border-gray-300 p-0.5 text-gray-500 hover:bg-gray-100">
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                    <button onClick={() => removeFromCart(item.product_id)} className="text-red-500 hover:bg-red-50 p-1 rounded transition">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                                <input 
                                                    type="text" 
                                                    placeholder="Ghi chú (tùy chọn)..." 
                                                    value={item.note}
                                                    onChange={(e) => updateNote(item.product_id, e.target.value)}
                                                    className="w-full mt-2 rounded border border-gray-200 px-2 py-1 text-xs outline-none focus:border-gray-400"
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="pt-4 border-t border-[#E9DFD8]">
                                <div className="flex justify-between mb-4 font-bold text-[#49332b] text-lg">
                                    <span>Tổng ước tính:</span>
                                    <span className="text-[#9c513d]">
                                        {cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()} ₫
                                    </span>
                                </div>
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="w-full flex justify-center items-center rounded-lg bg-[#604238] py-3 text-sm font-bold text-white transition hover:bg-[#49332b] disabled:opacity-70"
                                >
                                    {submitting ? <Loader2 size={18} className="animate-spin" /> : "Tạo Đơn Hàng"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
