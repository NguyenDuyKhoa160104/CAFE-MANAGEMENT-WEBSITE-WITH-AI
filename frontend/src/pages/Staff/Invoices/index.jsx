import React, { useState, useEffect } from "react";
import { Receipt, Search, Loader2, Eye, Banknote, CreditCard } from "lucide-react";
import { staffInvoiceService } from "../../../services/staff/invoice.service";
import { showError } from "../../../utils/toast";
import { getApiErrorMessage } from "../../../utils/apiError";
import InvoiceDetailModal from "../../../components/staff/invoices/InvoiceDetailModal";

export default function StaffInvoices() {
    const [invoices, setInvoices] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, perPage: 15, total: 0 });
    const [loading, setLoading] = useState(true);
    const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

    const [search, setSearch] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const result = await staffInvoiceService.getInvoices();
            setInvoices(result.invoices);
            setPagination(result.pagination);
        } catch (error) {
            showError(getApiErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    const filteredInvoices = invoices.filter(inv => {
        if (paymentMethod && inv.payment_method !== paymentMethod) return false;
        if (search) {
            const term = search.toLowerCase();
            return (
                inv.invoice_code?.toLowerCase().includes(term) ||
                inv.order?.order_code?.toLowerCase().includes(term) ||
                inv.customer_name?.toLowerCase().includes(term)
            );
        }
        return true;
    });

    const getSummary = () => {
        const totalAmount = filteredInvoices.reduce((sum, inv) => sum + Number(inv.total_amount), 0);
        const cashAmount = filteredInvoices.filter(i => i.payment_method === 'CASH').reduce((sum, inv) => sum + Number(inv.total_amount), 0);
        const transferAmount = filteredInvoices.filter(i => i.payment_method === 'BANK_TRANSFER').reduce((sum, inv) => sum + Number(inv.total_amount), 0);
        return { totalAmount, cashAmount, transferAmount };
    };

    const summary = getSummary();

    return (
        <div className="p-4 sm:p-6 pb-20">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#49332b]">Hóa đơn</h1>
                    <p className="mt-1 text-sm text-[#958981]">
                        Quản lý hóa đơn đã thanh toán.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="rounded-xl border border-[#E9DFD8] bg-white p-4">
                    <p className="text-sm font-semibold text-[#958981] mb-1">Tổng doanh thu</p>
                    <p className="text-2xl font-bold text-[#9c513d]">{summary.totalAmount.toLocaleString()} ₫</p>
                    <p className="text-xs text-[#958981] mt-1">{filteredInvoices.length} hóa đơn</p>
                </div>
                <div className="rounded-xl border border-[#E9DFD8] bg-white p-4">
                    <p className="text-sm font-semibold text-[#958981] mb-1">Tiền mặt</p>
                    <p className="text-2xl font-bold text-[#49332b]">{summary.cashAmount.toLocaleString()} ₫</p>
                    <div className="text-xs font-bold text-gray-500 mt-1 flex items-center gap-1"><Banknote size={12}/> CASH</div>
                </div>
                <div className="rounded-xl border border-[#E9DFD8] bg-white p-4">
                    <p className="text-sm font-semibold text-[#958981] mb-1">Chuyển khoản</p>
                    <p className="text-2xl font-bold text-[#49332b]">{summary.transferAmount.toLocaleString()} ₫</p>
                    <div className="text-xs font-bold text-gray-500 mt-1 flex items-center gap-1"><CreditCard size={12}/> BANK_TRANSFER</div>
                </div>
            </div>

            <div className="rounded-xl border border-[#E9DFD8] bg-white shadow-sm overflow-hidden">
                <div className="border-b border-[#E9DFD8] p-4 bg-[#fbfaf9] flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search size={16} className="text-[#958981]" />
                        </div>
                        <input
                            type="text"
                            placeholder="Mã HĐ, Mã Đơn, Tên KH..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="block w-full rounded-lg border border-[#E9DFD8] bg-white py-2 pl-10 pr-4 text-sm text-[#49332b] focus:border-[#604238] focus:outline-none focus:ring-1 focus:ring-[#604238]"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="rounded-lg border border-[#E9DFD8] bg-white px-3 py-2 text-sm text-[#49332b] focus:border-[#604238] focus:outline-none"
                        >
                            <option value="">Thanh toán: Tất cả</option>
                            <option value="CASH">Tiền mặt</option>
                            <option value="BANK_TRANSFER">Chuyển khoản</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex h-40 items-center justify-center">
                        <Loader2 className="animate-spin text-[#9c513d]" size={32} />
                    </div>
                ) : filteredInvoices.length === 0 ? (
                    <div className="py-20 text-center">
                        <Receipt size={48} className="mx-auto text-[#d8c8bd] mb-3" />
                        <p className="font-semibold text-[#49332b]">Không tìm thấy hóa đơn</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-[#625751]">
                            <thead className="border-b border-[#E9DFD8] bg-[#fbfaf9] text-xs uppercase text-[#958981]">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Mã HĐ</th>
                                    <th className="px-4 py-3 font-semibold">Mã Đơn</th>
                                    <th className="px-4 py-3 font-semibold">Khách hàng</th>
                                    <th className="px-4 py-3 font-semibold">Phương thức</th>
                                    <th className="px-4 py-3 font-semibold">Tổng tiền</th>
                                    <th className="px-4 py-3 font-semibold">Thời gian</th>
                                    <th className="px-4 py-3 font-semibold text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E9DFD8] bg-white">
                                {filteredInvoices.map(inv => {
                                    const time = new Date(inv.issued_at).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
                                    return (
                                        <tr key={inv.id} className="hover:bg-gray-50 transition">
                                            <td className="px-4 py-3 font-bold text-[#49332b]">{inv.invoice_code}</td>
                                            <td className="px-4 py-3 text-gray-500">#{inv.order?.order_code}</td>
                                            <td className="px-4 py-3">{inv.customer_name || 'Khách vãng lai'}</td>
                                            <td className="px-4 py-3">
                                                {inv.payment_method === 'CASH' ? (
                                                    <span className="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
                                                        <Banknote size={12} /> Tiền mặt
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                                                        <CreditCard size={12} /> Chuyển khoản
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 font-bold text-[#49332b]">
                                                {Number(inv.total_amount).toLocaleString()} ₫
                                            </td>
                                            <td className="px-4 py-3 text-xs">{time}</td>
                                            <td className="px-4 py-3 text-center">
                                                <button 
                                                    onClick={() => setSelectedInvoiceId(inv.id)}
                                                    className="inline-flex items-center justify-center rounded p-1.5 text-blue-600 hover:bg-blue-50 transition"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {selectedInvoiceId && (
                <InvoiceDetailModal 
                    isOpen={!!selectedInvoiceId}
                    invoiceId={selectedInvoiceId}
                    onClose={() => setSelectedInvoiceId(null)}
                />
            )}
        </div>
    );
}
