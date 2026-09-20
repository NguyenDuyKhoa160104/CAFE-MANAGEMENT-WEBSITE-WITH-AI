import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { categoryService } from '../../../services/admin/category.service';
import { showSuccess, showError } from '../../../utils/toast';

const DeleteCategoryModal = ({ isOpen, onClose, onSuccess, category }) => {
    const [loading, setLoading] = useState(false);

    if (!isOpen || !category) return null;

    const productsCount = category.products_count ?? category.productsCount ?? 0;
    const hasProducts = productsCount > 0;

    const handleDelete = async () => {
        if (hasProducts) return;

        setLoading(true);
        try {
            const response = await categoryService.delete(category.id);
            showSuccess(response?.message || 'Xóa danh mục thành công');
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
                    <h3 className="text-lg font-bold text-[#302723]">Xóa danh mục?</h3>
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
                        Bạn có chắc chắn muốn xóa danh mục <span className="font-bold text-[#302723]">"{category.name}"</span>?
                    </p>

                    {hasProducts && (
                        <div className="mt-4 flex gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4">
                            <AlertTriangle size={20} className="shrink-0 text-orange-500" />
                            <div>
                                <p className="text-sm font-semibold text-orange-800">
                                    Danh mục này hiện có {productsCount} sản phẩm.
                                </p>
                                <p className="mt-1 text-xs text-orange-700">
                                    Không thể xóa danh mục đang có sản phẩm. Hãy chuyển hoặc xóa các sản phẩm thuộc danh mục trước.
                                </p>
                            </div>
                        </div>
                    )}

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
                            disabled={loading || hasProducts}
                            className="flex min-w-[120px] items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 disabled:hover:bg-red-600"
                        >
                            {loading ? 'Đang xóa...' : 'Xóa danh mục'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteCategoryModal;
