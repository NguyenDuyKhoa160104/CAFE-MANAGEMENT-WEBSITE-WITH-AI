import React, { useState, useEffect } from 'react';
import { adminInvoiceService } from '../../../services/admin/invoice.service';
import { showError } from '../../../utils/toast';
import { Receipt, Search, Loader2, Eye, Banknote, CreditCard } from 'lucide-react';
import AdminInvoiceDetailModal from '../../../components/admin/invoices/AdminInvoiceDetailModal';

export default function AdminInvoices() {
    const [invoices, setInvoices] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, perPage: 15, total: 0 });
    const [summaryData, setSummaryData] = useState({ total_revenue: 0, total_orders: 0, cash_revenue: 0, transfer_revenue: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [invoicesRes, summaryRes] = await Promise.all([
                adminInvoiceService.getInvoices(),
                adminInvoiceService.getSummary()
            ]);
            setInvoices(invoicesRes.invoices);
            setPagination(invoicesRes.pagination);
            if (summaryRes) {
                setSummaryData(summaryRes);
            }
        } catch (error) {
            showError("Không thể tải danh sách hóa đơn");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
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

    return (
        <div className="p-6">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý hóa đơn</h1>
                    <p className="mt-1 text-sm text-gray-500">Giám sát các hóa đơn đã thanh toán thành công.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Doanh thu hôm nay</p>
                    <p className="text-2xl font-bold text-blue-600">{Number(summaryData.total_revenue).toLocaleString()} ₫</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Số hóa đơn hôm nay</p>
                    <p className="text-2xl font-bold text-gray-900">{summaryData.total_orders}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Tiền mặt</p>
                    <p className="text-2xl font-bold text-green-600">{Number(summaryData.cash_revenue).toLocaleString()} ₫</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Chuyển khoản</p>
                    <p className="text-2xl font-bold text-indigo-600">{Number(summaryData.transfer_revenue).toLocaleString()} ₫</p>
                </div>
            </div>

            <div className="mb-6 rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-gray-200 p-4 sm:flex-row sm:items-center justify-between">
                    <div className="relative w-full max-w-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search size={18} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Tìm mã HĐ, Đơn, Khách hàng..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="block w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="block w-full rounded-lg border border-gray-300 py-2 pl-3 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="">Tất cả phương thức</option>
                            <option value="CASH">Tiền mặt</option>
                            <option value="BANK_TRANSFER">Chuyển khoản</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="animate-spin text-blue-500" size={32} />
                    </div>
                ) : filteredInvoices.length === 0 ? (
                    <div className="flex h-64 flex-col items-center justify-center text-gray-500">
                        <Receipt size={48} className="mb-4 text-gray-300" />
                        <p>Không tìm thấy hóa đơn nào</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Mã HĐ</th>
                                    <th className="px-4 py-3 font-medium">Mã đơn</th>
                                    <th className="px-4 py-3 font-medium">Khách hàng</th>
                                    <th className="px-4 py-3 font-medium">Phương thức</th>
                                    <th className="px-4 py-3 font-medium">Tổng tiền</th>
                                    <th className="px-4 py-3 font-medium">Thời gian</th>
                                    <th className="px-4 py-3 font-medium text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {filteredInvoices.map((inv) => {
                                    return (
                                        <tr key={inv.id} className="hover:bg-gray-50 transition">
                                            <td className="px-4 py-3 font-medium text-gray-900">{inv.invoice_code}</td>
                                            <td className="px-4 py-3 text-gray-500">#{inv.order?.order_code}</td>
                                            <td className="px-4 py-3">{inv.customer_name || 'Khách vãng lai'}</td>
                                            <td className="px-4 py-3">
                                                {inv.payment_method === 'CASH' ? (
                                                    <span className="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                                                        <Banknote size={12} /> Tiền mặt
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700">
                                                        <CreditCard size={12} /> Chuyển khoản
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-gray-900">{Number(inv.total_amount).toLocaleString()} ₫</td>
                                            <td className="px-4 py-3 text-xs">{new Date(inv.issued_at).toLocaleString('vi-VN')}</td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => setSelectedInvoiceId(inv.id)}
                                                    className="inline-flex items-center gap-1 rounded px-2 py-1 text-blue-600 hover:bg-blue-50 transition"
                                                >
                                                    <Eye size={16} /> Xem
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
                <AdminInvoiceDetailModal 
                    isOpen={!!selectedInvoiceId}
                    invoiceId={selectedInvoiceId}
                    onClose={() => setSelectedInvoiceId(null)}
                />
            )}
        </div>
    );
}
