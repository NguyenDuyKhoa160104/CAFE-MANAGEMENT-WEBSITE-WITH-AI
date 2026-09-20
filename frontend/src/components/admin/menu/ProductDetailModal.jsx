import React from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import ProductStatusBadge from './ProductStatusBadge';

const ProductDetailModal = ({ isOpen, onClose, product, onEdit }) => {
    if (!isOpen || !product) return null;

    const formattedDate = product.created_at || product.createdAt 
        ? new Date(product.created_at || product.createdAt).toLocaleDateString('vi-VN')
        : 'N/A';
        
    const updatedDate = product.updated_at || product.updatedAt
        ? new Date(product.updated_at || product.updatedAt).toLocaleDateString('vi-VN')
        : 'N/A';

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#eee5df] px-6 py-4">
                    <h3 className="text-lg font-bold text-[#302723]">Chi tiết sản phẩm</h3>
                    <button 
                        onClick={onClose}
                        className="rounded-lg p-2 text-[#958981] hover:bg-[#f4efec] hover:text-[#302723]"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="flex flex-col items-center gap-4 border-b border-[#eee5df] pb-6">
                        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-[#e8dfd9] bg-[#faf8f6]">
                            {product.image ? (
                                <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                            ) : (
                                <ImageIcon size={32} className="text-[#9c918a]" />
                            )}
                        </div>
                        <div className="text-center">
                            <h4 className="text-xl font-bold text-[#302723]">{product.name}</h4>
                            <span className="mt-1 inline-block rounded-md bg-[#f1ece9] px-2.5 py-1 font-mono text-xs text-[#574943]">
                                {product.product_code || product.code}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4 pt-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-semibold text-[#958981]">Danh mục</p>
                                <p className="mt-1 text-sm text-[#302723]">
                                    {product.category?.name || product.category || 'Không xác định'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-[#958981]">Giá bán</p>
                                <p className="mt-1 text-sm font-bold text-[#604238]">
                                    {product.price ? product.price.toLocaleString("vi-VN") : 0} ₫
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-[#958981]">Giá vốn</p>
                                <p className="mt-1 text-sm font-bold text-[#604238]">
                                    {product.cost_price ? product.cost_price.toLocaleString("vi-VN") : 0} ₫
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-[#958981]">Sản phẩm nổi bật</p>
                                <p className="mt-1 text-sm text-[#302723]">
                                    {product.is_featured ? 'Có' : 'Không'}
                                </p>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-[#958981]">Mô tả</p>
                            <p className="mt-1 text-sm text-[#302723]">{product.description || 'Không có mô tả'}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-semibold text-[#958981]">Thứ tự POS</p>
                                <p className="mt-1 text-sm font-semibold text-[#302723]">
                                    {product.sort_order ?? product.sortOrder ?? 0}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold text-[#958981]">Trạng thái</p>
                                <div className="mt-1">
                                    <ProductStatusBadge status={product.status} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 rounded-xl bg-[#faf8f6] p-4">
                            <div>
                                <p className="text-[10px] font-semibold text-[#958981]">NGÀY TẠO</p>
                                <p className="mt-1 text-xs text-[#574943]">{formattedDate}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold text-[#958981]">CẬP NHẬT GẦN NHẤT</p>
                                <p className="mt-1 text-xs text-[#574943]">{updatedDate}</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 flex justify-end gap-3 border-t border-[#eee5df] pt-4">
                        <button
                            onClick={onClose}
                            className="rounded-lg px-4 py-2 text-sm font-semibold text-[#574943] hover:bg-[#f4efec]"
                        >
                            Đóng
                        </button>
                        <button
                            onClick={() => {
                                onClose();
                                onEdit(product);
                            }}
                            className="rounded-lg bg-[#604238] px-4 py-2 text-sm font-semibold text-white hover:bg-[#50362f]"
                        >
                            Chỉnh sửa
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailModal;
