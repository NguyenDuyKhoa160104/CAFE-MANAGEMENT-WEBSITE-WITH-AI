import React, { useState } from "react";
import { X, Loader2, Banknote, CreditCard, Receipt } from "lucide-react";
import { staffOrderService } from "../../../services/staff/order.service";
import { showError, showSuccess } from "../../../utils/toast";
import { getApiErrorMessage } from "../../../utils/apiError";

export default function CheckoutModal({ isOpen, order, onClose, onSuccess }) {
    const [paymentMethod, setPaymentMethod] = useState("CASH");
    const [note, setNote] = useState("");
    const [transferConfirmed, setTransferConfirmed] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleCheckout = async () => {
        if (paymentMethod === "BANK_TRANSFER" && !transferConfirmed) {
            return showError("Vui lòng xác nhận đã nhận được tiền chuyển khoản.");
        }

        try {
            setSubmitting(true);
            const payload = {
                payment_method: paymentMethod,
                note: note,
                ...(paymentMethod === "BANK_TRANSFER" && { transfer_confirmed: true })
            };
            
            const res = await staffOrderService.checkoutOrder(order.id, payload);
            showSuccess(res.message || "Thanh toán thành công");
            onSuccess();
        } catch (error) {
            showError(getApiErrorMessage(error));
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen || !order) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-xl flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between border-b border-[#E9DFD8] px-6 py-4">
                    <h2 className="text-xl font-bold text-[#49332b] flex items-center gap-2">
                        <Receipt size={24} className="text-[#9c513d]" />
                        Thanh toán đơn hàng
                    </h2>
                    <button onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 transition">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="mb-6 rounded-xl bg-[#fbfaf9] p-4 border border-[#E9DFD8]">
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-semibold text-[#958981]">Mã đơn:</span>
                            <span className="text-sm font-bold text-[#49332b]">#{order.order_code}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-semibold text-[#958981]">Loại đơn:</span>
                            <span className="text-sm font-bold text-[#49332b]">
                                {order.order_type === 'DINE_IN' ? (order.table?.name || 'Tại bàn') : 'Mang đi'}
                            </span>
                        </div>
                        <div className="flex justify-between pt-2 mt-2 border-t border-[#E9DFD8]">
                            <span className="font-bold text-[#49332b]">Tổng thanh toán:</span>
                            <span className="text-xl font-bold text-[#9c513d]">{Number(order.total_amount).toLocaleString()} ₫</span>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-bold text-[#49332b] mb-3">Phương thức thanh toán</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => { setPaymentMethod("CASH"); setTransferConfirmed(false); }}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition ${
                                    paymentMethod === "CASH" 
                                    ? "border-[#604238] bg-[#f4ddd3]/20 text-[#604238]" 
                                    : "border-[#E9DFD8] bg-white text-[#958981] hover:border-gray-300"
                                }`}
                            >
                                <Banknote size={24} className="mb-2" />
                                <span className="text-xs font-bold">Tiền mặt</span>
                            </button>
                            <button
                                onClick={() => setPaymentMethod("BANK_TRANSFER")}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition ${
                                    paymentMethod === "BANK_TRANSFER" 
                                    ? "border-[#604238] bg-[#f4ddd3]/20 text-[#604238]" 
                                    : "border-[#E9DFD8] bg-white text-[#958981] hover:border-gray-300"
                                }`}
                            >
                                <CreditCard size={24} className="mb-2" />
                                <span className="text-xs font-bold">Chuyển khoản</span>
                            </button>
                        </div>
                    </div>

                    {paymentMethod === "BANK_TRANSFER" && (
                        <div className="mb-6 rounded-lg bg-orange-50 border border-orange-200 p-4">
                            <p className="text-xs text-orange-800 mb-3 font-semibold">
                                Khách chuyển trực tiếp vào tài khoản của quán. Vui lòng chỉ xác nhận sau khi đã kiểm tra tiền đã vào tài khoản.
                            </p>
                            <label className="flex items-start gap-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="mt-1 w-4 h-4 text-[#9c513d] rounded border-gray-300 focus:ring-[#9c513d]" 
                                    checked={transferConfirmed}
                                    onChange={(e) => setTransferConfirmed(e.target.checked)}
                                />
                                <span className="text-sm font-bold text-orange-900">
                                    Tôi xác nhận quán đã nhận được tiền.
                                </span>
                            </label>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-[#49332b] mb-2">Ghi chú (Tùy chọn)</label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Nhập ghi chú thanh toán..."
                            className="w-full rounded-lg border border-[#E9DFD8] p-3 text-sm focus:border-[#604238] focus:outline-none focus:ring-1 focus:ring-[#604238]"
                            rows="2"
                        ></textarea>
                    </div>
                </div>

                <div className="border-t border-[#E9DFD8] p-4 bg-gray-50 rounded-b-2xl">
                    <button
                        onClick={handleCheckout}
                        disabled={submitting || (paymentMethod === "BANK_TRANSFER" && !transferConfirmed)}
                        className="w-full flex justify-center items-center gap-2 rounded-lg bg-[#9c513d] py-3 text-sm font-bold text-white transition hover:bg-[#8a4634] disabled:opacity-50"
                    >
                        {submitting ? <Loader2 size={18} className="animate-spin" /> : "Xác nhận thanh toán"}
                    </button>
                </div>
            </div>
        </div>
    );
}
