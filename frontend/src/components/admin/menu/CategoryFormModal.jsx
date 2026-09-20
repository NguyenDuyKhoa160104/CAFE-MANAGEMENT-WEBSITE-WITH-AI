import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { categoryService } from '../../../services/admin/category.service';
import { showSuccess, showError } from '../../../utils/toast';

const CategoryFormModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
    const isEdit = !!initialData;
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        category_code: '',
        description: '',
        sort_order: 0,
        status: 'ACTIVE',
    });
    
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    name: initialData.name || '',
                    category_code: initialData.category_code || initialData.code || '',
                    description: initialData.description || '',
                    sort_order: initialData.sort_order || initialData.sortOrder || 0,
                    status: initialData.status || 'ACTIVE',
                });
                setImagePreview(initialData.image || null);
            } else {
                setFormData({
                    name: '',
                    category_code: '',
                    description: '',
                    sort_order: 0,
                    status: 'ACTIVE',
                });
                setImagePreview(null);
            }
            setImageFile(null);
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name.trim()) {
            return showError('Vui lòng nhập tên danh mục');
        }
        if (!formData.category_code.trim()) {
            return showError('Vui lòng nhập mã danh mục');
        }
        if (formData.sort_order < 0) {
            return showError('Thứ tự POS không hợp lệ');
        }

        setLoading(true);
        
        try {
            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('category_code', formData.category_code);
            submitData.append('description', formData.description || '');
            submitData.append('sort_order', formData.sort_order);
            submitData.append('status', formData.status);
            
            if (imageFile) {
                submitData.append('image', imageFile);
            } else if (!imagePreview && isEdit) {
                submitData.append('remove_image', 1);
            }

            let response;
            if (isEdit) {
                response = await categoryService.update(initialData.id, submitData);
            } else {
                response = await categoryService.create(submitData);
            }
            
            showSuccess(response?.message || (isEdit ? 'Cập nhật danh mục thành công' : 'Thêm danh mục thành công'));
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
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#eee5df] px-6 py-4">
                    <h3 className="text-lg font-bold text-[#302723]">
                        {isEdit ? 'Chỉnh sửa danh mục' : 'Thêm danh mục'}
                    </h3>
                    <button 
                        onClick={onClose}
                        className="rounded-lg p-2 text-[#958981] hover:bg-[#f4efec] hover:text-[#302723]"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-[#302723]">Tên danh mục *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Nhập tên danh mục..."
                                    className="h-10 w-full rounded-lg border border-[#e8dfd9] bg-[#faf8f6] px-3 text-sm outline-none focus:border-[#604238] focus:bg-white"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-[#302723]">Mã định danh *</label>
                                <input
                                    type="text"
                                    name="category_code"
                                    value={formData.category_code}
                                    onChange={handleChange}
                                    placeholder="Ví dụ: CAFE"
                                    className="h-10 w-full rounded-lg border border-[#e8dfd9] bg-[#faf8f6] px-3 text-sm font-mono outline-none focus:border-[#604238] focus:bg-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-[#302723]">Hình ảnh</label>
                            
                            <div className="flex items-center gap-4">
                                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-[#d5cec8] bg-[#faf8f6]">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <ImageIcon size={24} className="text-[#9c918a]" />
                                    )}
                                </div>
                                
                                <div>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        ref={fileInputRef}
                                        onChange={handleImageChange}
                                    />
                                    <div className="flex gap-2">
                                        <button 
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex h-9 items-center gap-2 rounded-lg border border-[#e8dfd9] bg-white px-3 text-xs font-semibold text-[#574943] hover:bg-[#faf6f3]"
                                        >
                                            <Upload size={14} />
                                            Chọn ảnh
                                        </button>
                                        
                                        {imagePreview && (
                                            <button 
                                                type="button"
                                                onClick={handleRemoveImage}
                                                className="flex h-9 items-center rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-600 hover:bg-red-100"
                                            >
                                                Xóa ảnh
                                            </button>
                                        )}
                                    </div>
                                    <p className="mt-1.5 text-[10px] text-[#9c918a]">Định dạng JPG, PNG. Kích thước tối đa 2MB.</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-[#302723]">Mô tả</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Nhập mô tả danh mục..."
                                rows={3}
                                className="w-full rounded-lg border border-[#e8dfd9] bg-[#faf8f6] p-3 text-sm outline-none focus:border-[#604238] focus:bg-white"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-[#302723]">Thứ tự POS</label>
                                <input
                                    type="number"
                                    name="sort_order"
                                    value={formData.sort_order}
                                    onChange={handleChange}
                                    min={0}
                                    className="h-10 w-full rounded-lg border border-[#e8dfd9] bg-[#faf8f6] px-3 text-sm outline-none focus:border-[#604238] focus:bg-white"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-[#302723]">Trạng thái</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="h-10 w-full rounded-lg border border-[#e8dfd9] bg-[#faf8f6] px-3 text-sm outline-none focus:border-[#604238] focus:bg-white"
                                >
                                    <option value="ACTIVE">Hoạt động</option>
                                    <option value="INACTIVE">Đang ẩn</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 flex justify-end gap-3 border-t border-[#eee5df] pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg px-4 py-2 text-sm font-semibold text-[#574943] hover:bg-[#f4efec]"
                            disabled={loading}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex min-w-[120px] items-center justify-center rounded-lg bg-[#604238] px-4 py-2 text-sm font-semibold text-white hover:bg-[#50362f] disabled:opacity-70"
                        >
                            {loading ? (isEdit ? 'Đang lưu...' : 'Đang thêm...') : (isEdit ? 'Lưu thay đổi' : 'Thêm danh mục')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryFormModal;
