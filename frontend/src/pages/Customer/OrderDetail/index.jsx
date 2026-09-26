import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { customerOrderService } from '../../../services/customer/order.service';

import { showSuccess, showError } from '../../../utils/toast';
import { getApiErrorMessage } from '../../../utils/apiError';
import { RefreshCw, ArrowLeft, Package, Receipt, Info, Clock, CheckCircle, XCircle } from 'lucide-react';

const OrderDetail = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchOrder = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        try {
            const response = await customerOrderService.getOrderDetail(id);
            setOrder(response.data || response || null);
        } catch (error) {
            showError(getApiErrorMessage(error) || "Không tìm thấy đơn hàng");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const handleCancelOrder = async () => {
        if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;
        try {
            await customerOrderService.cancelOrder(id);
            showSuccess("Hủy đơn hàng thành công");
            fetchOrder();
        } catch (error) {
            showError(getApiErrorMessage(error) || "Lỗi hủy đơn");
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'PENDING': return 'Chờ xác nhận';
            case 'CONFIRMED': return 'Đã xác nhận';
            case 'PREPARING': return 'Đang pha chế';
            case 'READY': return 'Sẵn sàng nhận';
            case 'SERVED': return 'Đã giao';
            case 'COMPLETED': return 'Hoàn tất';
            case 'CANCELLED': return 'Đã hủy';
            default: return status;
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

    if (loading) {
        return (
            <div className="bg-[#F7F4F1] min-h-[calc(100vh-64px)] flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#E9DFD8] border-t-[#604238]"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="bg-[#F7F4F1] min-h-[calc(100vh-64px)] py-20 flex items-center justify-center">
                <div className="bg-white p-12 rounded-3xl shadow-sm border border-[#E9DFD8] text-center max-w-md w-full mx-4">
                    <div className="w-20 h-20 bg-[#F7F4F1] rounded-full flex items-center justify-center mx-auto mb-6 text-[#958981]">
                        <Package size={40} />
                    </div>
                    <h2 className="text-2xl font-bold mb-4 text-[#302723]">Không tìm thấy đơn hàng</h2>
                    <p className="text-[#958981] mb-8">Đơn hàng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
                    <Link to="/orders" className="inline-flex items-center justify-center gap-2 bg-[#604238] hover:bg-[#4a332b] text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1">
                        <ArrowLeft size={18} /> Quay lại danh sách
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#F7F4F1] min-h-[calc(100vh-64px)] pt-24 pb-20">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                    <div>
                        <Link to="/orders" className="inline-flex items-center gap-2 text-[#958981] hover:text-[#604238] font-medium mb-2 transition-colors">
                            <ArrowLeft size={16} /> Quay lại
                        </Link>
                        <h1 className="text-3xl md:text-4xl font-bold text-[#302723] flex items-center gap-3">
                            Đơn hàng <span className="bg-white px-4 py-1 rounded-xl shadow-sm border border-[#E9DFD8] text-[#604238]">#{order.order_code}</span>
                        </h1>
                    </div>
                    <button 
                        onClick={() => fetchOrder(true)}
                        disabled={refreshing}
                        className={`px-6 py-3 bg-white border border-[#E9DFD8] rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 hover:bg-[#F7F4F1] transition-colors text-[#302723] ${refreshing ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                        {refreshing ? 'Đang làm mới...' : 'Làm mới'}
                    </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Status Timeline */}
                        <div className="bg-white rounded-3xl shadow-sm p-8 border border-[#E9DFD8]">
                            <h2 className="text-xl font-bold text-[#302723] mb-8 flex items-center gap-2 border-b border-[#E9DFD8] pb-4">
                                <Clock className="text-[#604238]" size={20} />
                                Trạng thái đơn hàng
                            </h2>
                            
                            <div className="relative border-l-2 border-[#E9DFD8] ml-4 md:ml-8 space-y-8 py-2">
                                {['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED'].map((step, idx) => {
                                    const allStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED'];
                                    const currentIdx = allStatuses.indexOf(order.status === 'SERVED' ? 'COMPLETED' : order.status);
                                    let isPast = currentIdx >= idx;
                                    let isCurrent = currentIdx === idx;
                                    
                                    if (order.status === 'CANCELLED') {
                                        isPast = false;
                                        isCurrent = false;
                                    }

                                    return (
                                        <div key={step} className="relative pl-8">
                                            <div className={`absolute -left-[25px] top-0 w-12 h-12 rounded-full border-4 flex items-center justify-center bg-white ${
                                                isCurrent 
                                                ? 'border-[#604238] text-[#604238] shadow-md' 
                                                : isPast 
                                                    ? 'border-[#6F8F3D] text-[#6F8F3D]' 
                                                    : 'border-[#E9DFD8] text-[#E9DFD8]'
                                            }`}>
                                                {isPast && !isCurrent ? <CheckCircle size={20} /> : <div className={`w-3 h-3 rounded-full ${isCurrent ? 'bg-[#604238]' : 'bg-transparent'}`}></div>}
                                            </div>
                                            <div className="pt-2">
                                                <h4 className={`text-lg font-bold ${isCurrent ? 'text-[#604238]' : isPast ? 'text-[#302723]' : 'text-[#958981]'}`}>{getStatusText(step)}</h4>
                                                {isCurrent && <p className="text-sm text-[#958981] mt-1">Đơn hàng của bạn đang ở trạng thái này</p>}
                                            </div>
                                        </div>
                                    );
                                })}
                                {order.status === 'CANCELLED' && (
                                    <div className="relative pl-8">
                                        <div className="absolute -left-[25px] top-0 w-12 h-12 rounded-full border-4 border-red-500 bg-white text-red-500 flex items-center justify-center shadow-md">
                                            <XCircle size={24} />
                                        </div>
                                        <div className="pt-2">
                                            <h4 className="text-lg font-bold text-red-500">Đã hủy</h4>
                                            <p className="text-sm text-red-400 mt-1">Đơn hàng này đã bị hủy bỏ</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-white rounded-3xl shadow-sm p-8 border border-[#E9DFD8]">
                            <h2 className="text-xl font-bold text-[#302723] mb-6 flex items-center gap-2 border-b border-[#E9DFD8] pb-4">
                                <Package className="text-[#604238]" size={20} />
                                Danh sách sản phẩm
                            </h2>
                            <div className="space-y-4">
                                {order.items?.map((item) => (
                                    <div key={item.id} className="flex gap-4 p-4 bg-[#F7F4F1]/50 rounded-2xl items-center border border-[#E9DFD8]/50">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-black text-xl text-[#604238] shadow-sm flex-shrink-0">
                                            {item.quantity}x
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-lg text-[#302723]">{item.product_name}</div>
                                            <div className="text-sm text-[#958981] font-medium mt-1">{formatPrice(item.unit_price)} / món</div>
                                            {item.note && <div className="text-sm text-[#604238] mt-2 italic bg-[#E9DFD8]/30 px-3 py-1.5 rounded-lg inline-block">Ghi chú: {item.note}</div>}
                                        </div>
                                        <div className="font-black text-[#604238] text-lg text-right">
                                            {formatPrice(item.line_total)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-8">
                            {/* Summary */}
                            <div className="bg-white rounded-3xl shadow-sm p-8 border border-[#E9DFD8]">
                                <h2 className="text-xl font-bold text-[#302723] mb-6 flex items-center gap-2 border-b border-[#E9DFD8] pb-4">
                                    <Info className="text-[#604238]" size={20} />
                                    Thông tin đơn
                                </h2>
                                <div className="space-y-4 text-sm mb-8 bg-[#F7F4F1]/50 p-5 rounded-2xl border border-[#E9DFD8]/50">
                                    <div>
                                        <span className="text-xs font-bold text-[#958981] uppercase tracking-wider block mb-1">Loại đơn</span>
                                        <span className="font-bold text-[#302723] text-base">{order.order_type === 'TAKEAWAY' ? 'Mang đi (Takeaway)' : order.order_type}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-[#958981] uppercase tracking-wider block mb-1">Ngày tạo</span>
                                        <span className="font-bold text-[#302723] text-base">{formatDateTime(order.created_at)}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-[#958981] uppercase tracking-wider block mb-1">Ghi chú</span>
                                        <span className="font-medium text-[#302723] italic">{order.note || 'Không có ghi chú'}</span>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-sm text-[#958981] font-medium">
                                        <span>Tạm tính:</span>
                                        <span>{formatPrice(order.subtotal || 0)}</span>
                                    </div>
                                    {Number(order.discount) > 0 && (
                                        <div className="flex justify-between text-sm text-[#6F8F3D] font-medium">
                                            <span>Giảm giá:</span>
                                            <span>-{formatPrice(order.discount || 0)}</span>
                                        </div>
                                    )}
                                </div>
                            
                            <div className="border-t border-[#E9DFD8] pt-6 mb-8">
                                <div className="flex justify-between items-end">
                                    <span className="text-lg font-bold text-[#302723]">Tổng cộng</span>
                                    <span className="text-3xl font-black text-[#604238]">{formatPrice(order.total_amount)}</span>
                                </div>
                            </div>

                            {order.status === 'PENDING' && (
                                <button 
                                    onClick={handleCancelOrder}
                                    className="w-full py-4 border-2 border-red-500/20 text-red-600 rounded-xl font-bold hover:bg-red-50 hover:border-red-500/50 transition-all flex justify-center items-center gap-2"
                                >
                                    <XCircle size={18} /> Hủy đơn hàng
                                </button>
                            )}
                        </div>

                        {/* Invoice Info */}
                        <div className="bg-white rounded-3xl shadow-sm p-8 border border-[#E9DFD8]">
                            <h2 className="text-xl font-bold text-[#302723] mb-6 flex items-center gap-2 border-b border-[#E9DFD8] pb-4">
                                <Receipt className="text-[#604238]" size={20} />
                                Hóa đơn
                            </h2>
                            {order.invoice ? (
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-[#EEF4E5] text-[#6F8F3D] rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle size={32} />
                                    </div>
                                    <p className="text-sm text-[#302723] font-medium mb-6">Đơn hàng đã được thanh toán và xuất hóa đơn thành công.</p>
                                    <Link to={`/invoices/${order.invoice.id}`} className="inline-flex items-center justify-center w-full py-3 bg-white border-2 border-[#604238] text-[#604238] rounded-xl font-bold hover:bg-[#F7F4F1] transition-all">
                                        Xem chi tiết hóa đơn
                                    </Link>
                                </div>
                            ) : (
                                <div className="text-center py-6 bg-[#F7F4F1]/50 rounded-2xl border border-[#E9DFD8]/50">
                                    <Receipt size={32} className="mx-auto text-[#958981] mb-3 opacity-50" />
                                    <p className="text-sm text-[#958981] font-medium">Đơn hàng này chưa được xuất hóa đơn.</p>
                                </div>
                            )}
                        </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
