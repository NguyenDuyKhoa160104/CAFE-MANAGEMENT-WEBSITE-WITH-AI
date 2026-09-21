import React, { useState, useEffect } from "react";
import { X, Loader2, Printer, CheckCircle2, Banknote, CreditCard, Coffee } from "lucide-react";
import { staffInvoiceService } from "../../../services/staff/invoice.service";
import { showError } from "../../../utils/toast";
import { getApiErrorMessage } from "../../../utils/apiError";

export default function InvoiceDetailModal({ isOpen, invoiceId, onClose }) {
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchInvoice = async () => {
        try {
            setLoading(true);
            const response = await staffInvoiceService.getInvoiceDetail(invoiceId);
            setInvoice(response);
        } catch (error) {
            showError(getApiErrorMessage(error));
            onClose();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && invoiceId) {
            fetchInvoice();
        }
    }, [isOpen, invoiceId]);

    const handlePrint = () => {
        window.print();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 print:bg-white print:p-0">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-xl flex flex-col max-h-[90vh] print:shadow-none print:max-w-full print:h-auto">
                <div className="flex items-center justify-between border-b border-[#E9DFD8] px-6 py-4 print:hidden">
                    <h2 className="text-xl font-bold text-[#49332b]">Chi tiết hóa đơn</h2>
                    <button onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 transition">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 print:overflow-visible print:p-4">
                    {loading || !invoice ? (
                        <div className="flex h-64 items-center justify-center print:hidden">
                            <Loader2 className="animate-spin text-[#9c513d]" size={32} />
                        </div>
                    ) : (
                        <div id="printable-invoice">
                            {/* Invoice Header */}
                            <div className="text-center mb-6">
                                <h1 className="text-2xl font-bold text-[#49332b]">CAFEFLOW</h1>
                                <p className="text-sm text-[#958981]">123 Đường Cà Phê, Quận 1, TP.HCM</p>
                                <p className="text-sm text-[#958981]">ĐT: 0123 456 789</p>
                            </div>

                            <div className="text-center mb-6 border-b border-dashed border-[#E9DFD8] pb-4">
                                <h2 className="text-lg font-bold text-[#49332b] uppercase mb-2">Hóa đơn thanh toán</h2>
                                <p className="text-xs text-[#625751]">Số: {invoice.invoice_code}</p>
                                <p className="text-xs text-[#625751]">Ngày: {new Date(invoice.issued_at).toLocaleString('vi-VN')}</p>
                                <p className="text-xs text-[#625751]">Thu ngân: {invoice.staff?.full_name || 'Hệ thống'}</p>
                            </div>

                            {/* Customer & Order Info */}
                            <div className="mb-4 text-sm text-[#49332b]">
                                <div className="flex justify-between mb-1">
                                    <span>Khách hàng:</span>
                                    <span className="font-semibold">{invoice.customer_name || 'Khách vãng lai'}</span>
                                </div>
                                <div className="flex justify-between mb-1">
                                    <span>Loại đơn:</span>
                                    <span className="font-semibold">{invoice.order?.order_type === 'DINE_IN' ? 'Tại bàn' : 'Mang đi'}</span>
                                </div>
                                {invoice.order?.order_type === 'DINE_IN' && (
                                    <div className="flex justify-between mb-1">
                                        <span>Bàn:</span>
                                        <span className="font-semibold">{invoice.order?.table?.name || 'Không xác định'}</span>
                                    </div>
                                )}
                            </div>

                            {/* Items Table */}
                            <div className="mb-4 border-t border-b border-dashed border-[#E9DFD8] py-4">
                                <table className="w-full text-sm text-[#49332b]">
                                    <thead>
                                        <tr className="border-b border-[#E9DFD8]">
                                            <th className="text-left font-bold pb-2">Tên món</th>
                                            <th className="text-center font-bold pb-2 w-12">SL</th>
                                            <th className="text-right font-bold pb-2 w-24">Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {invoice.order?.items?.map((item) => (
                                            <tr key={item.id}>
                                                <td className="py-2">
                                                    <div className="font-semibold">{item.product_name}</div>
                                                    {item.note && <div className="text-[10px] text-[#958981] italic">({item.note})</div>}
                                                </td>
                                                <td className="py-2 text-center">{item.quantity}</td>
                                                <td className="py-2 text-right">{Number(item.line_total).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Totals */}
                            <div className="space-y-1 mb-6 text-sm text-[#49332b]">
                                <div className="flex justify-between">
                                    <span>Tạm tính:</span>
                                    <span>{Number(invoice.subtotal).toLocaleString()} ₫</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Giảm giá:</span>
                                    <span>- {Number(invoice.discount_amount).toLocaleString()} ₫</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-dashed border-[#E9DFD8]">
                                    <span>Tổng cộng:</span>
                                    <span>{Number(invoice.total_amount).toLocaleString()} ₫</span>
                                </div>
                            </div>

                            <div className="text-center mb-6">
                                <p className="text-sm font-semibold flex items-center justify-center gap-1">
                                    {invoice.payment_method === 'CASH' ? <Banknote size={16}/> : <CreditCard size={16}/>}
                                    Đã thanh toán bằng {invoice.payment_method === 'CASH' ? 'tiền mặt' : 'chuyển khoản'}
                                </p>
                            </div>

                            <div className="text-center text-xs text-[#958981] italic">
                                Cảm ơn quý khách và hẹn gặp lại!
                            </div>
                        </div>
                    )}
                </div>

                <div className="border-t border-[#E9DFD8] p-4 bg-gray-50 rounded-b-2xl print:hidden">
                    <button
                        onClick={handlePrint}
                        className="w-full flex justify-center items-center gap-2 rounded-lg bg-[#604238] py-3 text-sm font-bold text-white transition hover:bg-[#49332b]"
                    >
                        <Printer size={18} /> In hóa đơn
                    </button>
                </div>
            </div>
            
            {/* Global print styles for this component */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #printable-invoice, #printable-invoice * {
                        visibility: visible;
                    }
                    #printable-invoice {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        padding: 20px;
                        margin: 0;
                        background: white;
                    }
                }
            `}</style>
        </div>
    );
}
