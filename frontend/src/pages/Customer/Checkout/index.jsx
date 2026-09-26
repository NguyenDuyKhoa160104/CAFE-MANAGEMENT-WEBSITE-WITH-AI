import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerCart } from '../../../contexts/CustomerCartContext';
import { useCustomerAuth } from '../../../contexts/CustomerAuthContext';
import { customerOrderService } from '../../../services/customer/order.service';
import { showSuccess, showError } from '../../../utils/toast';
import { getApiErrorMessage } from '../../../utils/apiError';
import { ShoppingBag, MapPin, User, FileText, CheckCircle } from 'lucide-react';

const Checkout = () => {
    const { cart, cartTotal, clearCart } = useCustomerCart();
    const { customer } = useCustomerAuth();
    const navigate = useNavigate();
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);

    if (cart.length === 0) {
        navigate('/cart');
        return null;
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const handleCheckout = async () => {
        setLoading(true);
        try {
            const payload = {
                items: cart.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    note: item.note
                })),
                note: note
            };

            const response = await customerOrderService.createOrder(payload);
            showSuccess("Đặt hàng thành công.");
            clearCart();
            // navigate to the newly created order detail
            const createdOrder = response.order || response.data?.order;
            if (createdOrder && createdOrder.id) {
                navigate(`/orders/${createdOrder.id}`);
            } else {
                navigate('/orders');
            }
        } catch (error) {
            showError(getApiErrorMessage(error) || "Đã xảy ra lỗi khi đặt hàng.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#F7F4F1] min-h-[calc(100vh-64px)] pt-24 pb-20">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="flex items-center gap-3 mb-10">
                    <CheckCircle className="text-[#604238]" size={32} />
                    <h1 className="text-4xl font-bold text-[#302723]">Thanh toán</h1>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Customer Info & Order Note */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-3xl shadow-sm p-8 border border-[#E9DFD8]">
                            <h2 className="text-xl font-bold text-[#302723] mb-6 flex items-center gap-2">
                                <User className="text-[#604238]" size={20} />
                                Thông tin người nhận
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#F7F4F1]/50 p-6 rounded-2xl border border-[#E9DFD8]/50">
                                <div>
                                    <span className="text-xs font-bold text-[#958981] uppercase tracking-wider block mb-1">Họ và tên</span>
                                    <span className="text-lg font-semibold text-[#302723]">{customer?.full_name}</span>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-[#958981] uppercase tracking-wider block mb-1">Số điện thoại</span>
                                    <span className="text-lg font-semibold text-[#302723]">{customer?.phone || 'Chưa cung cấp'}</span>
                                </div>
                                <div className="md:col-span-2">
                                    <span className="text-xs font-bold text-[#958981] uppercase tracking-wider block mb-1">Email liên hệ</span>
                                    <span className="text-lg font-semibold text-[#302723]">{customer?.email}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl shadow-sm p-8 border border-[#E9DFD8]">
                            <h2 className="text-xl font-bold text-[#302723] mb-6 flex items-center gap-2">
                                <MapPin className="text-[#604238]" size={20} />
                                Phương thức nhận hàng
                            </h2>
                            <div className="bg-[#EEF4E5]/50 border-2 border-[#6F8F3D]/20 p-6 rounded-2xl flex items-start space-x-4">
                                <div className="w-12 h-12 bg-[#6F8F3D]/10 rounded-full flex items-center justify-center text-[#6F8F3D] flex-shrink-0">
                                    <ShoppingBag size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-[#302723] mb-1">Đơn hàng mang đi (Takeaway)</h3>
                                    <p className="text-[#6d625d] leading-relaxed">Đơn hàng của bạn sẽ được chuẩn bị sẵn sàng. Vui lòng thanh toán trực tiếp tại quầy khi đến nhận đồ uống.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl shadow-sm p-8 border border-[#E9DFD8]">
                            <h2 className="text-xl font-bold text-[#302723] mb-6 flex items-center gap-2">
                                <FileText className="text-[#604238]" size={20} />
                                Lời nhắn cho quán
                            </h2>
                            <textarea 
                                className="w-full p-5 border border-[#E9DFD8] bg-[#F7F4F1] rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#604238]/20 focus:border-[#604238] transition-all resize-none"
                                rows="4"
                                placeholder="Bạn có yêu cầu gì thêm không? (Ít đá, ít đường, v.v.)"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            ></textarea>
                        </div>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl shadow-sm p-8 border border-[#E9DFD8] sticky top-24">
                            <h2 className="text-xl font-bold text-[#302723] mb-6 border-b border-[#E9DFD8] pb-4">Đơn hàng của bạn</h2>
                            
                            <div className="space-y-4 max-h-80 overflow-y-auto mb-6 pr-2 custom-scrollbar">
                                {cart.map((item, index) => (
                                    <div key={index} className="flex gap-4 text-sm bg-[#F7F4F1]/50 p-3 rounded-xl">
                                        <div className="font-black text-[#604238] w-6 flex-shrink-0 text-right">{item.quantity}x</div>
                                        <div className="flex-1">
                                            <span className="font-bold text-[#302723]">{item.name}</span>
                                            {item.note && <div className="text-[#958981] text-xs mt-1 italic leading-tight">Ghi chú: {item.note}</div>}
                                        </div>
                                        <div className="font-bold text-[#604238] whitespace-nowrap text-right">
                                            {formatPrice(item.price * item.quantity)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="border-t border-[#E9DFD8] pt-6 mb-8">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[#958981]">Tạm tính</span>
                                    <span className="font-medium text-[#302723]">{formatPrice(cartTotal)}</span>
                                </div>
                                <div className="flex justify-between items-end mt-4">
                                    <span className="text-lg font-bold text-[#302723]">Tổng thanh toán</span>
                                    <span className="text-3xl font-black text-[#604238]">{formatPrice(cartTotal)}</span>
                                </div>
                            </div>

                            <button 
                                onClick={handleCheckout}
                                disabled={loading}
                                className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-md flex justify-center items-center gap-2 ${
                                    loading 
                                    ? 'bg-[#E9DFD8] text-[#958981] cursor-not-allowed' 
                                    : 'bg-[#604238] hover:bg-[#4a332b] text-white hover:shadow-lg transform active:scale-[0.98]'
                                }`}
                            >
                                {loading ? (
                                    <><div className="animate-spin rounded-full h-5 w-5 border-2 border-[#958981] border-t-transparent"></div> Đang xử lý...</>
                                ) : (
                                    'Đặt hàng ngay'
                                )}
                            </button>
                            <p className="text-center text-xs text-[#958981] mt-4">
                                Bằng việc đặt hàng, bạn đồng ý với điều khoản dịch vụ của CafeFlow.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
