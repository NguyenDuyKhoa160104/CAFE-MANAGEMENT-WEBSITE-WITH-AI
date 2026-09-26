import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, User as UserIcon, LoaderCircle } from 'lucide-react';
import { showSuccess, showError } from '../../../utils/toast';
import { updateAdminProfile, removeAdminAvatar } from '../../../services/admin/profile.service';
import { getApiErrorMessage } from '../../../utils/apiError';

const EditProfileModal = ({ isOpen, onClose, admin, onSuccess }) => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        admin_code: ''
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [removeImage, setRemoveImage] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isOpen && admin) {
            setFormData({
                full_name: admin.full_name || '',
                email: admin.email || '',
                phone: admin.phone || '',
                admin_code: admin.admin_code || ''
            });
            setErrors({});
        }
    }, [isOpen, admin]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
        if (errors[e.target.name]) {
            setErrors(prev => ({ ...prev, [e.target.name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setErrors({});
            
            const submitData = new FormData();
            submitData.append("full_name", formData.full_name);
            submitData.append("email", formData.email);
            submitData.append("phone", formData.phone || "");

            const response = await updateAdminProfile(submitData);
            showSuccess(response.message);
            if (onSuccess) onSuccess(response.data);
            onClose();
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                showError(getApiErrorMessage(error));
            }
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (name) => {
        if (!name) return "AD";
        const words = name.trim().split(/\s+/);
        if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
        return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-[#eee5df] px-6 py-4">
                    <h3 className="text-lg font-bold text-[#302723]">Chỉnh sửa hồ sơ</h3>
                    <button 
                        onClick={onClose}
                        className="rounded-lg p-2 text-[#958981] hover:bg-[#f4efec] hover:text-[#302723]"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-[#302723]">Họ và tên *</label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    required
                                    className={`h-10 w-full rounded-lg border bg-[#faf8f6] px-3 text-sm outline-none focus:bg-white ${
                                        errors.full_name ? 'border-red-500 focus:border-red-500' : 'border-[#e8dfd9] focus:border-[#604238]'
                                    }`}
                                />
                                {errors.full_name && <p className="text-xs text-red-500">{errors.full_name[0]}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-[#302723]">Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className={`h-10 w-full rounded-lg border bg-[#faf8f6] px-3 text-sm outline-none focus:bg-white ${
                                        errors.email ? 'border-red-500 focus:border-red-500' : 'border-[#e8dfd9] focus:border-[#604238]'
                                    }`}
                                />
                                {errors.email && <p className="text-xs text-red-500">{errors.email[0]}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-[#302723]">Số điện thoại</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className={`h-10 w-full rounded-lg border bg-[#faf8f6] px-3 text-sm outline-none focus:bg-white ${
                                        errors.phone ? 'border-red-500 focus:border-red-500' : 'border-[#e8dfd9] focus:border-[#604238]'
                                    }`}
                                />
                                {errors.phone && <p className="text-xs text-red-500">{errors.phone[0]}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-[#302723]">Mã quản trị viên</label>
                                <input
                                    type="text"
                                    name="admin_code"
                                    value={formData.admin_code}
                                    readOnly
                                    className="h-10 w-full rounded-lg border border-[#e8dfd9] bg-[#f0ebe8] px-3 text-sm font-mono text-[#958981] outline-none cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3 border-t border-[#eee5df] pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-lg px-4 py-2 text-sm font-semibold text-[#574943] hover:bg-[#f4efec] disabled:opacity-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 rounded-lg bg-[#604238] px-4 py-2 text-sm font-semibold text-white hover:bg-[#50362f] disabled:opacity-50"
                        >
                            {loading && <LoaderCircle size={16} className="animate-spin" />}
                            {loading ? "Đang lưu..." : "Lưu thay đổi"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;
