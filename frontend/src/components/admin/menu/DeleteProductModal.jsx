import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { productService } from '../../../services/admin/product.service';
import { showSuccess, showError } from '../../../utils/toast';

const DeleteProductModal = ({ isOpen, onClose, onSuccess, product }) => {
    const [loading, setLoading] = useState(false);

    if (!isOpen || !product) return null;

    const handleDelete = async () => {
        setLoading(true);
        try {
            const response = await productService.delete(product.id);
            showSuccess(response?.message || 'Xóa sản phẩm thành công');
            onSuccess();
        } catch (error) {
            const message = error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
            showError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#eee5df] px-6 py-4">
                    <h3 className="text-lg font-bold text-[#302723]">Xóa sản phẩm?</h3>
                    <button 
                        onClick={onClose}
                        className="rounded-lg p-2 text-[#958981] hover:bg-[#f4efec] hover:text-[#302723]"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-sm text-[#574943]">
                        Bạn có chắc chắn muốn xóa sản phẩm <span className="font-bold text-[#302723]">"{product.name}"</span>?
                    </p>

                    {/* Footer */}
                    <div className="mt-8 flex justify-end gap-3 border-t border-[#eee5df] pt-4">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-lg px-4 py-2 text-sm font-semibold text-[#574943] hover:bg-[#f4efec]"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="flex min-w-[120px] items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 disabled:hover:bg-red-600"
                        >
                            {loading ? 'Đang xóa...' : 'Xóa sản phẩm'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteProductModal;
