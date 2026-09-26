import React from 'react';
import { useCustomerCart } from '../../contexts/CustomerCartContext';
import { showSuccess } from '../../utils/toast';
import { Plus } from 'lucide-react';

const ProductCard = ({ product }) => {
    const { addItem } = useCustomerCart();

    const isAvailable = product.status === 'ACTIVE' && product.recipe_configured && product.inventory_available;
    
    // Status text logic based on rule 12
    let statusBadge = null;
    let badgeColor = "";
    if (product.status !== 'ACTIVE') {
        statusBadge = "Ngừng bán";
        badgeColor = "bg-red-500 text-white";
    } else if (!product.recipe_configured) {
        statusBadge = "Tạm ngừng bán";
        badgeColor = "bg-orange-500 text-white";
    } else if (!product.inventory_available) {
        statusBadge = "Hết nguyên liệu";
        badgeColor = "bg-gray-500 text-white";
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const handleAddToCart = () => {
        if (!isAvailable) return;
        addItem(product, 1, '');
        showSuccess(`Đã thêm ${product.name} vào giỏ hàng`);
    };

    return (
        <div className="group bg-white rounded-3xl shadow-sm hover:shadow-xl overflow-hidden border border-[#E9DFD8] flex flex-col h-full transition-all duration-300 transform hover:-translate-y-2">
            <div className="relative h-56 bg-[#F7F4F1] overflow-hidden">
                <img 
                    src={product.image || '/placeholder-drink.png'} 
                    alt={product.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => { e.target.src = '/placeholder-drink.png'; }}
                />
                {statusBadge && (
                    <div className={`absolute top-4 left-4 text-[11px] px-3 py-1.5 rounded-full font-bold shadow-md tracking-wider uppercase ${badgeColor}`}>
                        {statusBadge}
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            
            <div className="p-5 flex flex-col flex-grow bg-white">
                <div className="flex justify-between items-start mb-2">
                    <div className="text-xs font-bold text-[#a2755f] tracking-wider uppercase bg-[#F7F4F1] px-2 py-1 rounded-md inline-block">
                        {product.category?.name}
                    </div>
                </div>
                
                <h3 className="text-xl font-bold text-[#302723] mb-2 leading-tight group-hover:text-[#604238] transition-colors">{product.name}</h3>
                
                <p className="text-sm text-[#958981] line-clamp-2 mb-6 flex-grow leading-relaxed">{product.description}</p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#E9DFD8]/50">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-[#958981] uppercase tracking-wider font-semibold mb-0.5">Giá bán</span>
                        <span className="text-[#604238] font-black text-lg">{formatPrice(product.price)}</span>
                    </div>
                    
                    <button 
                        onClick={handleAddToCart}
                        disabled={!isAvailable}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                            isAvailable 
                                ? 'bg-[#604238] text-white hover:bg-[#4a332b] shadow-md hover:shadow-lg transform active:scale-95' 
                                : 'bg-[#E9DFD8] text-[#958981] cursor-not-allowed'
                        }`}
                        title={isAvailable ? "Thêm vào giỏ hàng" : statusBadge}
                    >
                        <Plus size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
