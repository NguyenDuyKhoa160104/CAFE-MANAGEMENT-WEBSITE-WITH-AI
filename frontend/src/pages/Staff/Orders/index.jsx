import React, { useState, useEffect } from "react";
import { ReceiptText, Plus, Search, Loader2, Filter, Eye } from "lucide-react";
import { staffOrderService } from "../../../services/staff/order.service";
import { showError } from "../../../utils/toast";
import { getApiErrorMessage } from "../../../utils/apiError";
import CreateOrderModal from "../../../components/staff/orders/CreateOrderModal";
import OrderDetailModal from "../../../components/staff/orders/OrderDetailModal";

const STATUS_MAP = {
    PENDING: { label: "Chờ xác nhận", bg: "bg-blue-100", text: "text-blue-700" },
    CONFIRMED: { label: "Đã xác nhận", bg: "bg-indigo-100", text: "text-indigo-700" },
    PREPARING: { label: "Đang pha chế", bg: "bg-amber-100", text: "text-amber-700" },
    READY: { label: "Sẵn sàng", bg: "bg-emerald-100", text: "text-emerald-700" },
    SERVED: { label: "Đã phục vụ", bg: "bg-purple-100", text: "text-purple-700" },
    COMPLETED: { label: "Hoàn tất", bg: "bg-gray-100", text: "text-gray-700" },
    CANCELLED: { label: "Đã hủy", bg: "bg-red-100", text: "text-red-700" },
};

export default function StaffOrders() {
    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, perPage: 15, total: 0 });
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    // Filters
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const result = await staffOrderService.getOrders();
            setOrders(result.orders);
            setPagination(result.pagination);
        } catch (error) {
            showError(getApiErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const filteredOrders = orders.filter(order => {
        if (statusFilter && order.status !== statusFilter) return false;
        if (typeFilter && order.order_type !== typeFilter) return false;
        if (search) {
            const term = search.toLowerCase();
            return (
                order.order_code?.toLowerCase().includes(term) ||
                order.customer_name?.toLowerCase().includes(term) ||
                order.customer_phone?.toLowerCase().includes(term)
            );
        }
        return true;
    });

    const getSummary = () => {
        return {
            total: orders.length,
            pending: orders.filter(o => o.status === 'PENDING').length,
            preparing: orders.filter(o => o.status === 'PREPARING').length,
            served: orders.filter(o => o.status === 'SERVED').length,
            completed: orders.filter(o => o.status === 'COMPLETED').length,
        };
    };

    const summary = getSummary();

    return (
        <div className="p-4 sm:p-6 pb-20">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#49332b]">Đơn hàng</h1>
                    <p className="mt-1 text-sm text-[#958981]">
                        Theo dõi và xử lý các đơn hàng trong ca làm việc.
                    </p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center justify-center gap-2 rounded-lg bg-[#604238] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#49332b] transition"
                >
                    <Plus size={18} />
                    Tạo đơn
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                <div className="rounded-xl border border-[#E9DFD8] bg-white p-4 text-center">
                    <p className="text-xs font-semibold text-[#958981] mb-1">Tổng đơn hôm nay</p>
                    <p className="text-2xl font-bold text-[#49332b]">{summary.total}</p>
                </div>
                <div className="rounded-xl border border-[#E9DFD8] bg-blue-50 p-4 text-center">
                    <p className="text-xs font-semibold text-blue-700 mb-1">Chờ xác nhận</p>
                    <p className="text-2xl font-bold text-blue-800">{summary.pending}</p>
                </div>
                <div className="rounded-xl border border-[#E9DFD8] bg-amber-50 p-4 text-center">
                    <p className="text-xs font-semibold text-amber-700 mb-1">Đang chuẩn bị</p>
                    <p className="text-2xl font-bold text-amber-800">{summary.preparing}</p>
                </div>
                <div className="rounded-xl border border-[#E9DFD8] bg-purple-50 p-4 text-center">
                    <p className="text-xs font-semibold text-purple-700 mb-1">Đã phục vụ</p>
                    <p className="text-2xl font-bold text-purple-800">{summary.served}</p>
                </div>
                <div className="rounded-xl border border-[#E9DFD8] bg-gray-50 p-4 text-center">
                    <p className="text-xs font-semibold text-gray-700 mb-1">Hoàn tất</p>
                    <p className="text-2xl font-bold text-gray-800">{summary.completed}</p>
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
                            placeholder="Mã đơn, tên KH, SĐT..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="block w-full rounded-lg border border-[#E9DFD8] bg-white py-2 pl-10 pr-4 text-sm text-[#49332b] focus:border-[#604238] focus:outline-none focus:ring-1 focus:ring-[#604238]"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="rounded-lg border border-[#E9DFD8] bg-white px-3 py-2 text-sm text-[#49332b] focus:border-[#604238] focus:outline-none"
                        >
                            <option value="">Loại đơn: Tất cả</option>
                            <option value="DINE_IN">Tại bàn</option>
                            <option value="TAKEAWAY">Mang đi</option>
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="rounded-lg border border-[#E9DFD8] bg-white px-3 py-2 text-sm text-[#49332b] focus:border-[#604238] focus:outline-none"
                        >
                            <option value="">Trạng thái: Tất cả</option>
                            {Object.entries(STATUS_MAP).map(([key, val]) => (
                                <option key={key} value={key}>{val.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex h-40 items-center justify-center">
                        <Loader2 className="animate-spin text-[#9c513d]" size={32} />
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="py-20 text-center">
                        <ReceiptText size={48} className="mx-auto text-[#d8c8bd] mb-3" />
                        <p className="font-semibold text-[#49332b]">Không tìm thấy đơn hàng</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-[#625751]">
                            <thead className="border-b border-[#E9DFD8] bg-[#fbfaf9] text-xs uppercase text-[#958981]">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Mã đơn</th>
                                    <th className="px-4 py-3 font-semibold">Loại</th>
                                    <th className="px-4 py-3 font-semibold">Bàn/Mang đi</th>
                                    <th className="px-4 py-3 font-semibold">Khách hàng</th>
                                    <th className="px-4 py-3 font-semibold">Số món</th>
                                    <th className="px-4 py-3 font-semibold">Tổng tiền</th>
                                    <th className="px-4 py-3 font-semibold">Trạng thái</th>
                                    <th className="px-4 py-3 font-semibold">Thời gian</th>
                                    <th className="px-4 py-3 font-semibold text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E9DFD8] bg-white">
                                {filteredOrders.map(order => {
                                    const st = STATUS_MAP[order.status] || STATUS_MAP['PENDING'];
                                    const time = new Date(order.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                                    return (
                                        <tr key={order.id} className="hover:bg-gray-50 transition">
                                            <td className="px-4 py-3 font-bold text-[#49332b]">#{order.order_code}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${order.order_type === 'DINE_IN' ? 'bg-[#f4ddd3] text-[#9c513d]' : 'bg-orange-100 text-orange-700'}`}>
                                                    {order.order_type === 'DINE_IN' ? 'Tại bàn' : 'Mang đi'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-[#604238]">
                                                {order.order_type === 'DINE_IN' ? order.table?.name || '---' : 'Mang đi'}
                                            </td>
                                            <td className="px-4 py-3">
                                                {order.customer_name || 'Khách vãng lai'}
                                            </td>
                                            <td className="px-4 py-3">{order.items?.length || 0}</td>
                                            <td className="px-4 py-3 font-bold text-[#49332b]">
                                                {Number(order.total_amount).toLocaleString()} ₫
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold whitespace-nowrap ${st.bg} ${st.text}`}>
                                                    {st.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs">{time}</td>
                                            <td className="px-4 py-3 text-center">
                                                <button 
                                                    onClick={() => setSelectedOrderId(order.id)}
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

            {isCreateModalOpen && (
                <CreateOrderModal 
                    isOpen={isCreateModalOpen} 
                    onClose={() => setIsCreateModalOpen(false)} 
                    onSuccess={() => {
                        setIsCreateModalOpen(false);
                        fetchOrders();
                    }}
                />
            )}

            {selectedOrderId && (
                <OrderDetailModal 
                    isOpen={!!selectedOrderId}
                    orderId={selectedOrderId}
                    onClose={() => setSelectedOrderId(null)}
                    onUpdate={() => fetchOrders()}
                />
            )}
        </div>
    );
}
