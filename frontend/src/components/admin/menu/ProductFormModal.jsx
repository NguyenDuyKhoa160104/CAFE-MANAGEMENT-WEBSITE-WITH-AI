import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { productService } from '../../../services/admin/product.service';
import { categoryService } from '../../../services/admin/category.service';
import { showSuccess, showError } from '../../../utils/toast';

const ProductFormModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
    const isEdit = !!initialData;
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    
    const [formData, setFormData] = useState({
        name: '',
        product_code: '',
        category_id: '',
        description: '',
        price: 0,
        cost_price: 0,
        sort_order: 0,
        status: 'ACTIVE',
        is_featured: false
    });
    
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
            if (initialData) {
                setFormData({
                    name: initialData.name || '',
                    product_code: initialData.product_code || initialData.code || '',
                    category_id: initialData.category_id || (initialData.category && initialData.category.id) || '',
                    description: initialData.description || '',
                    price: initialData.price || 0,
                    cost_price: initialData.cost_price || 0,
                    sort_order: initialData.sort_order || initialData.sortOrder || 0,
                    status: initialData.status || 'ACTIVE',
                    is_featured: initialData.is_featured || false
                });
                setImagePreview(initialData.image || null);
            } else {
                setFormData({
                    name: '',
                    product_code: '',
                    category_id: '',
                    description: '',
                    price: 0,
                    cost_price: 0,
                    sort_order: 0,
                    status: 'ACTIVE',
                    is_featured: false
                });
                setImagePreview(null);
            }
            setImageFile(null);
        }
    }, [isOpen, initialData]);

    const fetchCategories = async () => {
        try {
            // Fetch without pagination/search params to get all active categories for dropdown
            // or fetch with large limit depending on backend implementation.
            // Assuming getting all or up to 100 for now.
            const response = await categoryService.getAll({ status: 'ACTIVE', sort: 'name_asc' });
            let data = [];
            if (response.data && Array.isArray(response.data.data)) {
                data = response.data.data;
            } else if (Array.isArray(response.data)) {
                data = response.data;
            } else if (Array.isArray(response)) {
                data = response;
            }
            // For paginated results, we might need a dedicated endpoint to list all without pagination, 
            // but this will suffice for most normal cases if per_page is reasonably large or we use the data we got.
            setCategories(data);
        } catch (error) {
            console.error(error);
        }
    };

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
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name.trim()) return showError('Vui lòng nhập tên sản phẩm');
        if (!formData.product_code.trim()) return showError('Vui lòng nhập mã sản phẩm');
        if (!formData.category_id) return showError('Vui lòng chọn danh mục');
        if (formData.price < 0) return showError('Giá bán không hợp lệ');
        if (formData.cost_price < 0) return showError('Giá vốn không hợp lệ');
        if (formData.sort_order < 0) return showError('Thứ tự POS không hợp lệ');

        setLoading(true);
        
        try {
            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('product_code', formData.product_code);
            submitData.append('category_id', formData.category_id);
            submitData.append('description', formData.description || '');
            submitData.append('price', formData.price);
            submitData.append('cost_price', formData.cost_price);
            submitData.append('sort_order', formData.sort_order);
            submitData.append('status', formData.status);
            submitData.append('is_featured', formData.is_featured ? 1 : 0);
            
            if (imageFile) {
                submitData.append('image', imageFile);
            } else if (!imagePreview && isEdit) {
                submitData.append('remove_image', 1);
            }

            let response;
            if (isEdit) {
                response = await productService.update(initialData.id, submitData);
            } else {
                response = await productService.create(submitData);
            }
            
            showSuccess(response?.message || (isEdit ? 'Cập nhật sản phẩm thành công' : 'Thêm sản phẩm thành công'));
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
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#eee5df] px-6 py-4">
                    <h3 className="text-lg font-bold text-[#302723]">
                        {isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm'}
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
                                <label className="text-sm font-semibold text-[#302723]">Tên sản phẩm *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Nhập tên sản phẩm..."
                                    className="h-10 w-full rounded-lg border border-[#e8dfd9] bg-[#faf8f6] px-3 text-sm outline-none focus:border-[#604238] focus:bg-white"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-[#302723]">Mã định danh *</label>
                                <input
                                    type="text"
                                    name="product_code"
                                    value={formData.product_code}
                                    onChange={handleChange}
                                    placeholder="Ví dụ: CF001"
                                    className="h-10 w-full rounded-lg border border-[#e8dfd9] bg-[#faf8f6] px-3 text-sm font-mono outline-none focus:border-[#604238] focus:bg-white"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-[#302723]">Danh mục *</label>
                                <select
                                    name="category_id"
                                    value={formData.category_id}
                                    onChange={handleChange}
                                    className="h-10 w-full rounded-lg border border-[#e8dfd9] bg-[#faf8f6] px-3 text-sm outline-none focus:border-[#604238] focus:bg-white"
                                >
                                    <option value="">Chọn danh mục</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-[#302723]">Trạng thái</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="h-10 w-full rounded-lg border border-[#e8dfd9] bg-[#faf8f6] px-3 text-sm outline-none focus:border-[#604238] focus:bg-white"
                                >
                                    <option value="ACTIVE">Đang bán</option>
                                    <option value="INACTIVE">Đang ẩn</option>
                                    <option value="OUT_OF_STOCK">Hết hàng</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-[#302723]">Giá bán *</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    min={0}
                                    className="h-10 w-full rounded-lg border border-[#e8dfd9] bg-[#faf8f6] px-3 text-sm outline-none focus:border-[#604238] focus:bg-white"
                                />
                            </div>
                            
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-[#302723]">Giá vốn (tùy chọn)</label>
                                <input
                                    type="number"
                                    name="cost_price"
                                    value={formData.cost_price}
                                    onChange={handleChange}
                                    min={0}
                                    className="h-10 w-full rounded-lg border border-[#e8dfd9] bg-[#faf8f6] px-3 text-sm outline-none focus:border-[#604238] focus:bg-white"
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
                                placeholder="Nhập mô tả sản phẩm..."
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
                            
                            <div className="flex items-center mt-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        name="is_featured" 
                                        checked={formData.is_featured} 
                                        onChange={handleChange}
                                        className="h-4 w-4 rounded border-gray-300 text-[#604238] focus:ring-[#604238]"
                                    />
                                    <span className="text-sm font-semibold text-[#302723]">Sản phẩm nổi bật</span>
                                </label>
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
                            {loading ? (isEdit ? 'Đang lưu...' : 'Đang thêm...') : (isEdit ? 'Lưu thay đổi' : 'Thêm sản phẩm')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductFormModal;
