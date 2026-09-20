import React, { useState } from 'react';
import { X, Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { showSuccess, showError } from '../../../utils/toast';
import { changeAdminPassword } from '../../../services/admin/profile.service';
import { getApiErrorMessage } from '../../../utils/apiError';

const ChangePasswordModal = ({ isOpen, onClose }) => {
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
        if (errors[e.target.name] || errors.password || errors.current_password) {
            setErrors({});
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.newPassword !== formData.confirmPassword) {
            setErrors({ password: ['Mật khẩu xác nhận không khớp.'] });
            return;
        }

        try {
            setLoading(true);
            setErrors({});
            const data = {
                current_password: formData.currentPassword,
                password: formData.newPassword,
                password_confirmation: formData.confirmPassword
            };
            const response = await changeAdminPassword(data);
            showSuccess(response.message);
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
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

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-[#eee5df] px-6 py-4">
                    <h3 className="text-lg font-bold text-[#302723]">Đổi mật khẩu</h3>
                    <button 
                        onClick={onClose}
                        className="rounded-lg p-2 text-[#958981] hover:bg-[#f4efec] hover:text-[#302723]"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-[#302723]">Mật khẩu hiện tại *</label>
                            <div className="relative">
                                <input
                                    type={showCurrent ? "text" : "password"}
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    required
                                    placeholder="Nhập mật khẩu hiện tại"
                                    className={`h-10 w-full rounded-lg border bg-[#faf8f6] px-3 pr-10 text-sm outline-none focus:bg-white ${
                                        errors.current_password ? 'border-red-500 focus:border-red-500' : 'border-[#e8dfd9] focus:border-[#604238]'
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrent(!showCurrent)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#958981] hover:text-[#302723]"
                                >
                                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.current_password && <p className="text-xs text-red-500">{errors.current_password[0]}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-[#302723]">Mật khẩu mới *</label>
                            <div className="relative">
                                <input
                                    type={showNew ? "text" : "password"}
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    required
                                    minLength={8}
                                    placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
                                    className={`h-10 w-full rounded-lg border bg-[#faf8f6] px-3 pr-10 text-sm outline-none focus:bg-white ${
                                        errors.password ? 'border-red-500 focus:border-red-500' : 'border-[#e8dfd9] focus:border-[#604238]'
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew(!showNew)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#958981] hover:text-[#302723]"
                                >
                                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && <p className="text-xs text-red-500">{errors.password[0]}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-[#302723]">Xác nhận mật khẩu mới *</label>
                            <div className="relative">
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    placeholder="Nhập lại mật khẩu mới"
                                    className={`h-10 w-full rounded-lg border bg-[#faf8f6] px-3 pr-10 text-sm outline-none focus:bg-white ${
                                        formData.confirmPassword && formData.confirmPassword !== formData.newPassword 
                                        ? 'border-red-300 focus:border-red-500' 
                                        : 'border-[#e8dfd9] focus:border-[#604238]'
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#958981] hover:text-[#302723]"
                                >
                                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {formData.confirmPassword && formData.confirmPassword !== formData.newPassword && (
                                <p className="text-xs text-red-500">Mật khẩu xác nhận không khớp.</p>
                            )}
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
                            {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
