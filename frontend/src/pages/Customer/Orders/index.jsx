import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { customerOrderService } from '../../../services/customer/order.service';
import { ClipboardList, ShoppingBag, Clock, Package, CheckCircle, XCircle, ArrowRight } from 'lucide-react';


const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await customerOrderService.getOrders();
                setOrders(response.data || response || []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING': return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1"><Clock size={12}/> Chờ xác nhận</span>;
            case 'CONFIRMED': return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1"><CheckCircle size={12}/> Đã xác nhận</span>;
            case 'PREPARING': return <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1"><Package size={12}/> Đang pha chế</span>;
            case 'READY': return <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1"><ShoppingBag size={12}/> Sẵn sàng nhận</span>;
            case 'SERVED': return <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1"><CheckCircle size={12}/> Đã giao</span>;
            case 'COMPLETED': return <span className="px-3 py-1 bg-[#EEF4E5] text-[#6F8F3D] rounded-full text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1"><CheckCircle size={12}/> Hoàn tất</span>;
            case 'CANCELLED': return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1"><XCircle size={12}/> Đã hủy</span>;
            default: return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">{status}</span>;
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const pad = (n) => n.toString().padStart(2, '0');
        return `${pad(date.getHours())}:${pad(date.getMinutes())} - ${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
    };

    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true;
        if (filter === 'active') return ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED'].includes(order.status);
        if (filter === 'completed') return order.status === 'COMPLETED';
        if (filter === 'cancelled') return order.status === 'CANCELLED';
        return true;
    });

    return (
        <div className="bg-[#F7F4F1] min-h-[calc(100vh-64px)] pt-24 pb-20">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="flex items-center gap-3 mb-10">
                    <ClipboardList className="text-[#604238]" size={36} />
                    <h1 className="text-4xl font-bold text-[#302723]">Đơn hàng của tôi</h1>
                </div>
                
                <div className="bg-white rounded-2xl shadow-sm border border-[#E9DFD8] overflow-hidden mb-8 p-2">
                    <div className="flex overflow-x-auto space-x-2 pb-2 sm:pb-0 hide-scrollbar">
                        <button onClick={() => setFilter('all')} className={`px-6 py-3 rounded-xl whitespace-nowrap text-sm font-bold transition-all flex-1 text-center ${filter === 'all' ? 'bg-[#604238] text-white shadow-md' : 'bg-transparent text-[#958981] hover:bg-[#F7F4F1] hover:text-[#604238]'}`}>Tất cả đơn</button>
                        <button onClick={() => setFilter('active')} className={`px-6 py-3 rounded-xl whitespace-nowrap text-sm font-bold transition-all flex-1 text-center ${filter === 'active' ? 'bg-[#604238] text-white shadow-md' : 'bg-transparent text-[#958981] hover:bg-[#F7F4F1] hover:text-[#604238]'}`}>Đang xử lý</button>
                        <button onClick={() => setFilter('completed')} className={`px-6 py-3 rounded-xl whitespace-nowrap text-sm font-bold transition-all flex-1 text-center ${filter === 'completed' ? 'bg-[#604238] text-white shadow-md' : 'bg-transparent text-[#958981] hover:bg-[#F7F4F1] hover:text-[#604238]'}`}>Đã hoàn tất</button>
                        <button onClick={() => setFilter('cancelled')} className={`px-6 py-3 rounded-xl whitespace-nowrap text-sm font-bold transition-all flex-1 text-center ${filter === 'cancelled' ? 'bg-[#604238] text-white shadow-md' : 'bg-transparent text-[#958981] hover:bg-[#F7F4F1] hover:text-[#604238]'}`}>Đã hủy</button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-[#E9DFD8] border-t-[#604238]"></div></div>
                ) : filteredOrders.length > 0 ? (
                    <div className="space-y-6">
                        {filteredOrders.map(order => (
                            <div key={order.id} className="bg-white border border-[#E9DFD8] rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-1 group">
                                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 border-b border-[#E9DFD8] pb-6 mb-6">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-3 mb-2">
                                            <span className="font-black text-xl text-[#302723] bg-[#F7F4F1] px-3 py-1 rounded-lg tracking-wider">#{order.order_code}</span>
                                            {getStatusBadge(order.status)}
                                            {order.order_type === 'TAKEAWAY' && <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1"><ShoppingBag size={12}/> Mang đi</span>}
                                        </div>
                                        <div className="flex items-center text-[#958981] text-sm mt-2 font-medium">
                                            <Clock size={16} className="mr-2" /> 
                                            Ngày đặt: {formatDateTime(order.created_at)}
                                        </div>
                                    </div>
                                    <div className="text-left md:text-right bg-[#F7F4F1]/50 p-4 rounded-xl border border-[#E9DFD8]/50">
                                        <div className="text-[#958981] text-xs font-bold uppercase tracking-wider mb-1">Tổng thanh toán</div>
                                        <div className="font-black text-[#604238] text-2xl">{formatPrice(order.total_amount)}</div>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="flex items-center gap-3 text-[#302723] font-medium">
                                        <div className="w-10 h-10 rounded-full bg-[#F7F4F1] flex items-center justify-center text-[#604238]">
                                            <Package size={20} />
                                        </div>
                                        <span><strong className="text-lg">{order.items?.length || 0}</strong> sản phẩm trong đơn</span>
                                    </div>
                                    <Link to={`/orders/${order.id}`} className="w-full sm:w-auto px-8 py-3 bg-white border-2 border-[#E9DFD8] text-[#302723] hover:border-[#604238] hover:text-[#604238] rounded-xl font-bold transition-all flex items-center justify-center gap-2 group-hover:bg-[#F7F4F1]">
                                        Xem chi tiết <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-sm p-16 text-center border border-[#E9DFD8] flex flex-col items-center">
                        <div className="w-24 h-24 bg-[#F7F4F1] rounded-full flex items-center justify-center mb-6 text-[#958981]">
                            <ClipboardList size={48} />
                        </div>
                        <h3 className="text-2xl font-bold text-[#302723] mb-3">Bạn chưa có đơn hàng nào</h3>
                        <p className="text-[#958981] mb-8 max-w-sm leading-relaxed">Hãy khám phá thực đơn đa dạng của CafeFlow và trải nghiệm những hương vị tuyệt vời ngay hôm nay.</p>
                        <Link to="/menu" className="inline-flex items-center justify-center gap-2 bg-[#604238] hover:bg-[#4a332b] text-white px-8 py-4 rounded-xl font-bold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1">
                            Khám phá Thực đơn <ArrowRight size={20} />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
