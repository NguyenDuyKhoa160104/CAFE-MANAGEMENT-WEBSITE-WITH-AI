import React, { useState, useEffect } from "react";
import { ReceiptText, Search, Loader2, Calendar, LayoutDashboard, Banknote, CreditCard, ChevronLeft, ChevronRight } from "lucide-react";
import { adminOrderService } from "../../../services/admin/order.service";
import { showError } from "../../../utils/toast";

const STATUS_MAP = {
    PENDING: { label: "Chờ xác nhận", bg: "bg-blue-100", text: "text-blue-700" },
    CONFIRMED: { label: "Đã xác nhận", bg: "bg-indigo-100", text: "text-indigo-700" },
    PREPARING: { label: "Đang chuẩn bị", bg: "bg-amber-100", text: "text-amber-700" },
    READY: { label: "Sẵn sàng", bg: "bg-emerald-100", text: "text-emerald-700" },
    SERVED: { label: "Đã phục vụ", bg: "bg-purple-100", text: "text-purple-700" },
    COMPLETED: { label: "Hoàn tất", bg: "bg-gray-100", text: "text-gray-700" },
    CANCELLED: { label: "Đã hủy", bg: "bg-red-100", text: "text-red-700" },
};

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, perPage: 15, total: 0 });
    const [summary, setSummary] = useState({
        total_revenue: 0,
        completed_orders: 0,
        processing_orders: 0,
        cancelled_orders: 0,
        avg_order_value: 0,
        revenue_dine_in: 0,
        revenue_takeaway: 0,
        payment_cash: 0,
        payment_transfer: 0
    });
    const [loading, setLoading] = useState(true);

    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const fetchData = async (page = 1) => {
        try {
            setLoading(true);
            const params = {
                page,
                per_page: 15,
                search: search || undefined,
                status: statusFilter || undefined,
                order_type: typeFilter || undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined
            };

            const [ordersResult, summaryResult] = await Promise.all([
                adminOrderService.getOrders(params),
                adminOrderService.getSummary(params)
            ]);

            setOrders(ordersResult.orders);
            setPagination(ordersResult.pagination);
            setSummary(summaryResult);
        } catch (error) {
            showError("Không thể tải danh sách đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFilter = () => {
        fetchData(1);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.lastPage) {
            fetchData(newPage);
        }
    };

    return (
        <div className="p-4 sm:p-6 pb-20">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Theo dõi doanh thu và tình hình đơn hàng của CafeFlow.
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm hover:shadow-md transition">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Doanh thu</p>
                    <p className="text-2xl font-bold text-blue-600">{Number(summary.total_revenue).toLocaleString()} ₫</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm hover:shadow-md transition">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Đơn hoàn tất</p>
                    <p className="text-2xl font-bold text-gray-900">{summary.completed_orders}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm hover:shadow-md transition">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Đang xử lý</p>
                    <p className="text-2xl font-bold text-amber-600">{summary.processing_orders}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm hover:shadow-md transition">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Đơn đã hủy</p>
                    <p className="text-2xl font-bold text-red-600">{summary.cancelled_orders}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm hover:shadow-md transition">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Giá trị đơn TB</p>
                    <p className="text-2xl font-bold text-indigo-600">{Number(summary.avg_order_value).toLocaleString()} ₫</p>
                </div>
            </div>

            {/* Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                            <LayoutDashboard size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">Tại bàn vs Mang đi</p>
                            <p className="text-xs text-gray-500">Phân bổ doanh thu theo loại đơn</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm"><span className="text-gray-500">Tại bàn:</span> <span className="font-semibold">{Number(summary.revenue_dine_in).toLocaleString()} ₫</span></p>
                        <p className="text-sm"><span className="text-gray-500">Mang đi:</span> <span className="font-semibold">{Number(summary.revenue_takeaway).toLocaleString()} ₫</span></p>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                            <Banknote size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">Phương thức thanh toán</p>
                            <p className="text-xs text-gray-500">Tiền mặt vs Chuyển khoản</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm"><span className="text-gray-500">Tiền mặt:</span> <span className="font-semibold">{Number(summary.payment_cash).toLocaleString()} ₫</span></p>
                        <p className="text-sm"><span className="text-gray-500">CK:</span> <span className="font-semibold">{Number(summary.payment_transfer).toLocaleString()} ₫</span></p>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                {/* Filters */}
                <div className="border-b border-gray-200 p-4 bg-gray-50 grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-3 relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search size={16} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Mã đơn..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                            className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        >
                            <option value="">Loại đơn: Tất cả</option>
                            <option value="DINE_IN">Tại bàn</option>
                            <option value="TAKEAWAY">Mang đi</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        >
                            <option value="">Trạng thái: Tất cả</option>
                            <option value="PENDING">Chờ xác nhận</option>
                            <option value="CONFIRMED">Đã xác nhận</option>
                            <option value="PREPARING">Đang chuẩn bị</option>
                            <option value="READY">Sẵn sàng</option>
                            <option value="SERVED">Đã phục vụ</option>
                            <option value="COMPLETED">Hoàn tất</option>
                            <option value="CANCELLED">Đã hủy</option>
                        </select>
                    </div>
                    <div className="md:col-span-2 flex items-center">
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                            placeholder="Từ ngày"
                        />
                    </div>
                    <div className="md:col-span-2 flex items-center">
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                            placeholder="Đến ngày"
                        />
                    </div>
                    <div className="md:col-span-1">
                        <button
                            onClick={handleFilter}
                            className="w-full flex items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
                        >
                            Lọc
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="animate-spin text-blue-500" size={32} />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="py-20 text-center">
                        <ReceiptText size={48} className="mx-auto text-gray-300 mb-3" />
                        <p className="font-semibold text-gray-500">Không tìm thấy đơn hàng</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Mã đơn</th>
                                        <th className="px-4 py-3 font-semibold">Loại</th>
                                        <th className="px-4 py-3 font-semibold">Bàn/Mang đi</th>
                                        <th className="px-4 py-3 font-semibold">Nhân viên</th>
                                        <th className="px-4 py-3 font-semibold">Tổng tiền</th>
                                        <th className="px-4 py-3 font-semibold">Trạng thái</th>
                                        <th className="px-4 py-3 font-semibold">Thời gian</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {orders.map(order => {
                                        const st = STATUS_MAP[order.status] || STATUS_MAP['PENDING'];
                                        const time = new Date(order.created_at).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
                                        return (
                                            <tr key={order.id} className="hover:bg-gray-50 transition">
                                                <td className="px-4 py-3 font-bold text-gray-900">#{order.order_code}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${order.order_type === 'DINE_IN' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                                        {order.order_type === 'DINE_IN' ? 'Tại bàn' : 'Mang đi'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 font-semibold text-gray-700">
                                                    {order.order_type === 'DINE_IN' ? order.table?.name || 'Mang đi' : 'Mang đi'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {order.staff?.full_name || 'Hệ thống'}
                                                </td>
                                                <td className="px-4 py-3 font-bold text-gray-900">
                                                    {Number(order.total_amount).toLocaleString()} ₫
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold whitespace-nowrap ${st.bg} ${st.text}`}>
                                                        {st.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-xs">{time}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                            <div className="flex flex-1 justify-between sm:hidden">
                                <button
                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                    disabled={pagination.currentPage === 1}
                                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Trước
                                </button>
                                <button
                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                    disabled={pagination.currentPage === pagination.lastPage}
                                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Sau
                                </button>
                            </div>
                            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Hiển thị <span className="font-medium">{(pagination.currentPage - 1) * pagination.perPage + 1}</span> đến <span className="font-medium">{Math.min(pagination.currentPage * pagination.perPage, pagination.total)}</span> trong số <span className="font-medium">{pagination.total}</span> kết quả
                                    </p>
                                </div>
                                <div>
                                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                        <button
                                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                                            disabled={pagination.currentPage === 1}
                                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                        >
                                            <span className="sr-only">Previous</span>
                                            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                                        </button>
                                        <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                                            Trang {pagination.currentPage} / {pagination.lastPage}
                                        </span>
                                        <button
                                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                                            disabled={pagination.currentPage === pagination.lastPage}
                                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                        >
                                            <span className="sr-only">Next</span>
                                            <ChevronRight className="h-5 w-5" aria-hidden="true" />
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
