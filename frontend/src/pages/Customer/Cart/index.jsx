import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCustomerCart } from '../../../contexts/CustomerCartContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

const Cart = () => {
    const { cart, removeItem, updateQuantity, clearCart, cartTotal } = useCustomerCart();
    const navigate = useNavigate();

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    if (cart.length === 0) {
        return (
            <div className="bg-[#F7F4F1] min-h-[calc(100vh-64px)] py-20 px-4 flex items-center justify-center">
                <div className="max-w-lg w-full bg-white rounded-3xl shadow-md p-12 text-center border border-[#E9DFD8]">
                    <div className="w-24 h-24 bg-[#F7F4F1] rounded-full flex items-center justify-center mx-auto mb-6 text-[#958981]">
                        <ShoppingBag size={48} />
                    </div>
                    <h2 className="text-2xl font-bold text-[#302723] mb-4">Giỏ hàng trống</h2>
                    <p className="text-[#958981] mb-8 leading-relaxed">Bạn chưa chọn món nào. Hãy khám phá thực đơn của CafeFlow và tìm cho mình hương vị yêu thích nhé!</p>
                    <Link to="/menu" className="inline-flex items-center justify-center gap-2 bg-[#604238] hover:bg-[#4a332b] text-white px-8 py-4 rounded-xl font-bold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1">
                        Khám phá Thực đơn <ArrowRight size={20} />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#F7F4F1] min-h-[calc(100vh-64px)] pt-24 pb-20">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="flex items-center gap-3 mb-10">
                    <ShoppingBag className="text-[#604238]" size={32} />
                    <h1 className="text-4xl font-bold text-[#302723]">Giỏ hàng của bạn</h1>
                </div>
                
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart Items */}
                    <div className="w-full lg:w-2/3">
                        <div className="bg-white rounded-3xl shadow-sm p-2 sm:p-6 border border-[#E9DFD8]">
                            <div className="hidden sm:grid grid-cols-12 gap-4 text-xs tracking-wider uppercase font-bold text-[#958981] mb-4 pb-4 border-b border-[#E9DFD8] px-4">
                                <div className="col-span-6">Sản phẩm</div>
                                <div className="col-span-2 text-center">Đơn giá</div>
                                <div className="col-span-2 text-center">Số lượng</div>
                                <div className="col-span-2 text-right">Tổng</div>
                            </div>
                            
                            <div className="space-y-4">
                                {cart.map((item, index) => (
                                    <div key={`${item.product_id}-${index}`} className="flex flex-col sm:grid sm:grid-cols-12 gap-4 items-center bg-[#F7F4F1] sm:bg-transparent rounded-2xl p-4 sm:p-2 sm:border-b sm:border-[#E9DFD8] last:border-0 hover:bg-[#F7F4F1]/50 transition-colors">
                                        <div className="col-span-6 flex w-full items-center space-x-4">
                                            <div className="w-20 h-20 sm:w-16 sm:h-16 bg-white rounded-xl overflow-hidden flex-shrink-0 shadow-sm border border-[#E9DFD8]">
                                                <img src={item.image || '/placeholder-drink.png'} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-grow">
                                                <h3 className="font-bold text-[#302723] leading-tight">{item.name}</h3>
                                                {item.note && <p className="text-xs text-[#958981] mt-1 italic">Ghi chú: {item.note}</p>}
                                                <button 
                                                    onClick={() => removeItem(item.product_id, item.note)}
                                                    className="text-red-500/80 text-xs mt-2 flex items-center font-medium hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 className="mr-1 w-3 h-3" /> Bỏ món
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="col-span-2 text-center w-full sm:w-auto flex justify-between sm:block items-center">
                                            <span className="sm:hidden text-xs text-[#958981] font-medium uppercase">Đơn giá</span>
                                            <span className="font-semibold text-[#302723]">{formatPrice(item.price)}</span>
                                        </div>
                                        
                                        <div className="col-span-2 flex justify-center w-full sm:w-auto my-2 sm:my-0">
                                            <div className="flex items-center bg-white border border-[#E9DFD8] rounded-xl overflow-hidden shadow-sm">
                                                <button 
                                                    onClick={() => updateQuantity(item.product_id, item.note, item.quantity - 1)}
                                                    className="w-8 h-8 flex items-center justify-center text-[#604238] hover:bg-[#F7F4F1] transition-colors disabled:opacity-30"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus size={14} strokeWidth={3} />
                                                </button>
                                                <span className="w-8 text-center font-bold text-[#302723]">{item.quantity}</span>
                                                <button 
                                                    onClick={() => updateQuantity(item.product_id, item.note, item.quantity + 1)}
                                                    className="w-8 h-8 flex items-center justify-center text-[#604238] hover:bg-[#F7F4F1] transition-colors disabled:opacity-30"
                                                    disabled={item.quantity >= item.max_producible_quantity}
                                                >
                                                    <Plus size={14} strokeWidth={3} />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="col-span-2 text-right w-full sm:w-auto flex justify-between sm:block items-center">
                                            <span className="sm:hidden text-xs text-[#958981] font-medium uppercase">Tổng cộng</span>
                                            <span className="font-black text-[#604238]">{formatPrice(item.price * item.quantity)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 pt-4 border-t border-[#E9DFD8] flex justify-end px-4">
                                <button 
                                    onClick={clearCart}
                                    className="text-[#958981] hover:text-red-500 text-sm font-medium flex items-center gap-2 transition-colors"
                                >
                                    <Trash2 size={16} /> Xóa toàn bộ
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="w-full lg:w-1/3">
                        <div className="bg-white rounded-3xl shadow-sm p-8 border border-[#E9DFD8] sticky top-24">
                            <h3 className="text-xl font-bold text-[#302723] mb-6 border-b border-[#E9DFD8] pb-4">Tổng quan đơn hàng</h3>
                            
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center text-[#958981]">
                                    <span>Tạm tính</span>
                                    <span className="font-medium text-[#302723]">{formatPrice(cartTotal)}</span>
                                </div>
                                <div className="flex justify-between items-center text-[#958981]">
                                    <span>Phí giao hàng / Phục vụ</span>
                                    <span className="text-sm italic">Sẽ được tính khi thanh toán</span>
                                </div>
                            </div>
                            
                            <div className="border-t border-[#E9DFD8] pt-6 mb-8">
                                <div className="flex justify-between items-end">
                                    <span className="text-lg font-semibold text-[#302723]">Tổng cộng</span>
                                    <span className="text-3xl font-black text-[#604238]">{formatPrice(cartTotal)}</span>
                                </div>
                                <p className="text-xs text-[#958981] text-right mt-1">(Đã bao gồm VAT)</p>
                            </div>
                            
                            <button 
                                onClick={() => navigate('/checkout')}
                                className="w-full bg-[#604238] hover:bg-[#4a332b] text-white py-4 rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-lg transform active:scale-[0.98] flex justify-center items-center gap-2"
                            >
                                Thanh toán <ArrowRight size={20} />
                            </button>
                            
                            <Link to="/menu" className="block text-center w-full mt-4 text-[#604238] font-medium hover:underline">
                                Chọn thêm món khác
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
