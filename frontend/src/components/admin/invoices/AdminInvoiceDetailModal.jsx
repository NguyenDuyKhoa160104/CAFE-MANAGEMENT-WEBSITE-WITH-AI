import React, { useState, useEffect } from "react";
import { X, Loader2, Printer, Banknote, CreditCard } from "lucide-react";
import { adminInvoiceService } from "../../../services/admin/invoice.service";
import { showError } from "../../../utils/toast";

export default function AdminInvoiceDetailModal({ isOpen, invoiceId, onClose }) {
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchInvoice = async () => {
        try {
            setLoading(true);
            const response = await adminInvoiceService.getInvoiceDetail(invoiceId);
            setInvoice(response);
        } catch (error) {
            showError("Lỗi khi tải chi tiết hóa đơn");
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
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 print:hidden">
                    <h2 className="text-xl font-bold text-gray-900">Chi tiết hóa đơn</h2>
                    <button onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 transition">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 print:overflow-visible print:p-4">
                    {loading || !invoice ? (
                        <div className="flex h-64 items-center justify-center print:hidden">
                            <Loader2 className="animate-spin text-blue-500" size={32} />
                        </div>
                    ) : (
                        <div id="printable-invoice">
                            {/* Invoice Header */}
                            <div className="text-center mb-6">
                                <h1 className="text-2xl font-bold text-gray-900">CAFEFLOW</h1>
                                <p className="text-sm text-gray-500">123 Đường Cà Phê, Quận 1, TP.HCM</p>
                                <p className="text-sm text-gray-500">ĐT: 0123 456 789</p>
                            </div>

                            <div className="text-center mb-6 border-b border-dashed border-gray-300 pb-4">
                                <h2 className="text-lg font-bold text-gray-900 uppercase mb-2">Hóa đơn thanh toán</h2>
                                <p className="text-xs text-gray-600">Số: {invoice.invoice_code}</p>
                                <p className="text-xs text-gray-600">Ngày: {new Date(invoice.issued_at).toLocaleString('vi-VN')}</p>
                                <p className="text-xs text-gray-600">Thu ngân: {invoice.staff?.full_name || 'Hệ thống'}</p>
                            </div>

                            {/* Customer & Order Info */}
                            <div className="mb-4 text-sm text-gray-900">
                                <div className="flex justify-between mb-1">
                                    <span className="text-gray-500">Khách hàng:</span>
                                    <span className="font-semibold">{invoice.customer_name || 'Khách vãng lai'}</span>
                                </div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-gray-500">Loại đơn:</span>
                                    <span className="font-semibold">{invoice.order?.order_type === 'DINE_IN' ? 'Tại bàn' : 'Mang đi'}</span>
                                </div>
                                {invoice.order?.order_type === 'DINE_IN' && (
                                    <div className="flex justify-between mb-1">
                                        <span className="text-gray-500">Bàn:</span>
                                        <span className="font-semibold">{invoice.order?.table?.name || 'Không xác định'}</span>
                                    </div>
                                )}
                            </div>

                            {/* Items Table */}
                            <div className="mb-4 border-t border-b border-dashed border-gray-300 py-4">
                                <table className="w-full text-sm text-gray-900">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left font-bold pb-2 text-gray-500">Tên món</th>
                                            <th className="text-center font-bold pb-2 w-12 text-gray-500">SL</th>
                                            <th className="text-right font-bold pb-2 w-24 text-gray-500">Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {invoice.order?.items?.map((item) => (
                                            <tr key={item.id}>
                                                <td className="py-2">
                                                    <div className="font-medium">{item.product_name}</div>
                                                    {item.note && <div className="text-[10px] text-gray-400 italic">({item.note})</div>}
                                                </td>
                                                <td className="py-2 text-center text-gray-600">{item.quantity}</td>
                                                <td className="py-2 text-right font-medium">{Number(item.line_total).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Totals */}
                            <div className="space-y-1 mb-6 text-sm text-gray-900">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Tạm tính:</span>
                                    <span className="font-medium">{Number(invoice.subtotal).toLocaleString()} ₫</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Giảm giá:</span>
                                    <span className="font-medium">- {Number(invoice.discount_amount).toLocaleString()} ₫</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-dashed border-gray-300">
                                    <span>Tổng cộng:</span>
                                    <span className="text-blue-600">{Number(invoice.total_amount).toLocaleString()} ₫</span>
                                </div>
                            </div>

                            <div className="text-center mb-6">
                                <p className="text-sm font-semibold flex items-center justify-center gap-1 text-gray-600">
                                    {invoice.payment_method === 'CASH' ? <Banknote size={16} className="text-green-600"/> : <CreditCard size={16} className="text-indigo-600"/>}
                                    Đã thanh toán bằng {invoice.payment_method === 'CASH' ? 'tiền mặt' : 'chuyển khoản'}
                                </p>
                            </div>

                            <div className="text-center text-xs text-gray-400 italic">
                                Cảm ơn quý khách và hẹn gặp lại!
                            </div>
                        </div>
                    )}
                </div>

                <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-2xl print:hidden">
                    <button
                        onClick={handlePrint}
                        className="w-full flex justify-center items-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
                    >
                        <Printer size={18} /> In hóa đơn
                    </button>
                </div>
            </div>
            
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
