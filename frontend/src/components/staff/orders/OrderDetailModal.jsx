
import React, { useState, useEffect } from "react";
import { X, Loader2, Plus, Minus, Trash2, Clock, CheckCircle2, Package, Check, Coffee, Banknote, Receipt } from "lucide-react";
import { staffOrderService } from "../../../services/staff/order.service";
import { staffMenuService } from "../../../services/staff/menu.service";
import { showError, showSuccess } from "../../../utils/toast";
import { getApiErrorMessage } from "../../../utils/apiError";
import CheckoutModal from "./CheckoutModal";

export default function OrderDetailModal({ isOpen, orderId, onClose, onUpdate }) {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusLoading, setStatusLoading] = useState(false);
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

    // Add item state
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const response = await staffOrderService.getOrderDetail(orderId);
            setOrder(response); // response is already the data object
        } catch (error) {
            showError(getApiErrorMessage(error));
            onClose();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && orderId) {
            fetchOrder();
        }
    }, [isOpen, orderId]);

    const handleStatusUpdate = async (newStatus) => {
        try {
            setStatusLoading(true);
            await staffOrderService.updateStatus(orderId, newStatus);
            showSuccess("Cập nhật trạng thái thành công");
            await fetchOrder();
            if (onUpdate) onUpdate();
        } catch (error) {
            showError(getApiErrorMessage(error));
        } finally {
            setStatusLoading(false);
        }
    };

    const handleCancel = async () => {
        const reason = window.prompt("Lý do hủy đơn hàng:");
        if (reason === null) return;

        try {
            setStatusLoading(true);
            await staffOrderService.cancelOrder(orderId, reason || "Hủy theo yêu cầu");
            showSuccess("Đã hủy đơn hàng");
            await fetchOrder();
            if (onUpdate) onUpdate();
        } catch (error) {
            showError(getApiErrorMessage(error));
        } finally {
            setStatusLoading(false);
        }
    };

    const handleUpdateItem = async (itemId, currentQty, delta) => {
        const newQty = currentQty + delta;
        if (newQty < 1) return handleRemoveItem(itemId);
        try {
            await staffOrderService.updateItem(orderId, itemId, { quantity: newQty });
            await fetchOrder();
            if (onUpdate) onUpdate();
        } catch (error) {
            showError(getApiErrorMessage(error));
        }
    };

    const handleRemoveItem = async (itemId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa món này?")) return;
        try {
            await staffOrderService.removeItem(orderId, itemId);
            await fetchOrder();
            if (onUpdate) onUpdate();
        } catch (error) {
            showError(getApiErrorMessage(error));
        }
    };

    const loadProductsForAdd = async () => {
        setIsAddingItem(true);
        if (products.length === 0) {
            try {
                setLoadingProducts(true);
                const res = await staffMenuService.getProducts();
                setProducts(Array.isArray(res) ? res : res.data || []);
            } catch (error) {
                showError(getApiErrorMessage(error));
            } finally {
                setLoadingProducts(false);
            }
        }
    };

    const handleAddItem = async (product) => {
        try {
            await staffOrderService.addItem(orderId, {
                product_id: product.id,
                quantity: 1,
                note: ""
            });
            showSuccess("Đã thêm món");
            setIsAddingItem(false);
            await fetchOrder();
            if (onUpdate) onUpdate();
        } catch (error) {
            showError(getApiErrorMessage(error));
        }
    };

    if (!isOpen) return null;

    const statusFlow = [
        { status: "PENDING", label: "Chờ xác nhận", action: "Xác nhận đơn", next: "CONFIRMED" },
        { status: "CONFIRMED", label: "Đã xác nhận", action: "Bắt đầu pha chế", next: "PREPARING" },
        { status: "PREPARING", label: "Đang pha chế", action: "Đã pha xong", next: "READY" },
        { status: "READY", label: "Sẵn sàng", action: "Đã phục vụ", next: "SERVED" },
        { status: "SERVED", label: "Đã phục vụ", action: "Hoàn tất đơn", next: "COMPLETED" },
    ];

    const currentFlowIndex = statusFlow.findIndex(s => s.status === order?.status);
    const nextAction = currentFlowIndex >= 0 && currentFlowIndex < statusFlow.length - 1 ? statusFlow[currentFlowIndex] : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-xl overflow-hidden">
                <div className="flex items-center justify-between border-b border-[#E9DFD8] px-6 py-4">
                    <h2 className="text-xl font-bold text-[#49332b]">
                        Chi tiết đơn hàng #{order?.order_code}
                    </h2>
                    <button onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 transition">
                        <X size={20} />
                    </button>
                </div>

                {loading || !order ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="animate-spin text-[#9c513d]" size={32} />
                    </div>
                ) : (
                    <div className="flex flex-1 overflow-y-auto bg-[#fbfaf9]">
                        <div className="w-full flex flex-col md:flex-row gap-4 p-4">
                            {/* LEFT INFO */}
                            <div className="flex-1 space-y-4">
                                <div className="rounded-xl border border-[#E9DFD8] bg-white p-4 shadow-sm">
                                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                                        <h3 className="font-bold text-[#49332b]">Thông tin chung</h3>
                                        <span className="rounded bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700">
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className="space-y-2 text-sm text-[#49332b]">
                                        <div className="flex justify-between">
                                            <span className="text-[#958981]">Loại đơn:</span>
                                            <span className="font-semibold">{order.order_type === 'DINE_IN' ? 'Tại bàn' : 'Mang đi'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-[#958981]">Bàn phục vụ:</span>
                                            <span className="font-semibold">{order.table ? order.table.name : 'Không có (Takeaway)'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-[#958981]">Nhân viên tạo:</span>
                                            <span className="font-semibold">{order.staff?.full_name || 'Hệ thống'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-[#958981]">Thời gian:</span>
                                            <span>{new Date(order.created_at).toLocaleString('vi-VN')}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* ITEMS LIST */}
                                <div className="rounded-xl border border-[#E9DFD8] bg-white p-4 shadow-sm">
                                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                                        <h3 className="font-bold text-[#49332b]">Danh sách món ({order.items?.length || 0})</h3>
                                        {['PENDING', 'CONFIRMED'].includes(order.status) && !isAddingItem && (
                                            <button
                                                onClick={loadProductsForAdd}
                                                className="text-xs font-bold text-[#9c513d] hover:underline"
                                            >
                                                + Thêm món
                                            </button>
                                        )}
                                    </div>

                                    {isAddingItem && (
                                        <div className="mb-4 p-3 border border-dashed border-[#9c513d] rounded-lg bg-[#f4ddd3]/30">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-bold text-[#9c513d]">Chọn món để thêm:</span>
                                                <button onClick={() => setIsAddingItem(false)} className="text-gray-500 hover:text-red-500"><X size={14} /></button>
                                            </div>
                                            {loadingProducts ? (
                                                <Loader2 className="animate-spin text-[#9c513d] mx-auto" size={20} />
                                            ) : (
                                                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                                                    {products.filter(p => p.status === 'ACTIVE').map(p => (
                                                        <button
                                                            key={p.id}
                                                            onClick={() => handleAddItem(p)}
                                                            className="text-left text-xs p-2 border border-white bg-white rounded hover:border-[#9c513d] truncate shadow-sm"
                                                        >
                                                            {p.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <ul className="space-y-3">
                                        {order.items?.map((item) => (
                                            <li key={item.id} className="flex justify-between items-center border-b border-gray-100 pb-2 last:border-0">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-[#49332b] text-sm">{item.product_name}</p>
                                                    {item.note && <p className="text-[10px] text-[#958981] italic">Ghi chú: {item.note}</p>}
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    {['PENDING', 'CONFIRMED'].includes(order.status) ? (
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => handleUpdateItem(item.id, item.quantity, -1)} className="rounded bg-gray-100 p-0.5 text-gray-600 hover:bg-gray-200"><Minus size={12} /></button>
                                                            <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                                            <button onClick={() => handleUpdateItem(item.id, item.quantity, 1)} className="rounded bg-gray-100 p-0.5 text-gray-600 hover:bg-gray-200"><Plus size={12} /></button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs font-bold text-gray-600">x{item.quantity}</span>
                                                    )}
                                                    <span className="font-bold text-[#604238] text-sm w-16 text-right">
                                                        {Number(item.line_total).toLocaleString()} ₫
                                                    </span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* RIGHT ACTION */}
                            <div className="w-full md:w-64 space-y-4">
                                <div className="rounded-xl border border-[#E9DFD8] bg-white p-4 shadow-sm">
                                    <h3 className="font-bold text-[#49332b] border-b pb-2 mb-3">Thanh toán</h3>
                                    <div className="flex justify-between text-sm mb-2 text-[#625751]">
                                        <span>Tạm tính</span>
                                        <span>{Number(order.subtotal).toLocaleString()} ₫</span>
                                    </div>
                                    <div className="flex justify-between text-sm mb-3 text-[#625751]">
                                        <span>Giảm giá</span>
                                        <span>- {Number(order.discount_amount).toLocaleString()} ₫</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg text-[#9c513d] border-t pt-2">
                                        <span>Tổng cộng</span>
                                        <span>{Number(order.total_amount).toLocaleString()} ₫</span>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-[#E9DFD8] bg-white p-4 shadow-sm space-y-2">
                                    <h3 className="font-bold text-[#49332b] mb-3">Thao tác đơn hàng</h3>

                                    {nextAction && (
                                        <button
                                            disabled={statusLoading}
                                            onClick={() => handleStatusUpdate(nextAction.next)}
                                            className="w-full flex justify-center items-center gap-2 rounded bg-[#604238] py-2 text-sm font-bold text-white transition hover:bg-[#49332b] disabled:opacity-70"
                                        >
                                            {statusLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                            {nextAction.action}
                                        </button>
                                    )}

                                    {order.status === 'SERVED' && (
                                        <button
                                            onClick={() => setIsCheckoutModalOpen(true)}
                                            className="w-full flex justify-center items-center gap-2 rounded bg-[#9c513d] py-3 text-sm font-bold text-white transition hover:bg-[#8a4634] shadow-md"
                                        >
                                            <Banknote size={18} />
                                            Thanh toán đơn hàng
                                        </button>
                                    )}

                                    {order.status === 'COMPLETED' && (
                                        <div className="flex flex-col gap-2">
                                            <div className="p-2 bg-gray-100 rounded text-center text-xs font-bold text-gray-500">
                                                Đơn hàng đã hoàn tất
                                            </div>
                                            <button className="w-full flex justify-center items-center gap-2 rounded border border-[#E9DFD8] py-2 text-sm font-bold text-[#604238] transition hover:bg-gray-50">
                                                <Receipt size={16} /> Xem hóa đơn
                                            </button>
                                        </div>
                                    )}

                                    {!['SERVED', 'COMPLETED', 'CANCELLED'].includes(order.status) && (
                                        <button
                                            disabled={statusLoading}
                                            onClick={handleCancel}
                                            className="w-full rounded bg-white border border-red-200 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-70 mt-2"
                                        >
                                            Hủy đơn hàng
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {isCheckoutModalOpen && (
                <CheckoutModal
                    isOpen={isCheckoutModalOpen}
                    order={order}
                    onClose={() => setIsCheckoutModalOpen(false)}
                    onSuccess={() => {
                        setIsCheckoutModalOpen(false);
                        fetchOrder();
                        if (onUpdate) onUpdate();
                    }}
                />
            )}
        </div>
    );
}
