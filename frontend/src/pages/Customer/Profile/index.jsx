import React, { useState, useEffect } from 'react';
import { useCustomerAuth } from '../../../contexts/CustomerAuthContext';
import { customerProfileService } from '../../../services/customer/profile.service';
import { showSuccess, showError } from '../../../utils/toast';
import { getApiErrorMessage } from '../../../utils/apiError';
import AvatarUploader from '../../../components/common/AvatarUploader';
import { User, Lock, Mail, Phone, Save, Shield } from 'lucide-react';

const Profile = () => {
    const { customer, updateCustomerProfile } = useCustomerAuth();
    
    // Profile Edit State
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: ''
    });
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [loadingAvatar, setLoadingAvatar] = useState(false);

    // Password State
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        password: '',
        password_confirmation: ''
    });
    const [loadingPassword, setLoadingPassword] = useState(false);

    useEffect(() => {
        if (customer) {
            setFormData({
                full_name: customer.full_name || '',
                email: customer.email || '',
                phone: customer.phone || ''
            });
        }
    }, [customer]);

    const handleAvatarUpload = async (file) => {
        setLoadingAvatar(true);
        try {
            const response = await customerProfileService.uploadAvatar(file);
            const updatedCustomer = response.customer || response.data?.customer || response;
            updateCustomerProfile(updatedCustomer);
            showSuccess("Cập nhật ảnh đại diện thành công!");
        } catch (error) {
            showError(getApiErrorMessage(error) || "Lỗi tải ảnh lên");
        } finally {
            setLoadingAvatar(false);
        }
    };

    const handleAvatarRemove = async () => {
        setLoadingAvatar(true);
        try {
            const response = await customerProfileService.removeAvatar();
            const updatedCustomer = response.customer || response.data?.customer || response;
            updateCustomerProfile(updatedCustomer);
            showSuccess("Đã xóa ảnh đại diện!");
        } catch (error) {
            showError(getApiErrorMessage(error) || "Lỗi xóa ảnh");
        } finally {
            setLoadingAvatar(false);
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoadingProfile(true);
        try {
            const response = await customerProfileService.updateProfile(formData);
            const updatedCustomer = response.customer || response.data?.customer || response;
            updateCustomerProfile(updatedCustomer);
            showSuccess("Cập nhật hồ sơ thành công!");
        } catch (error) {
            showError(getApiErrorMessage(error) || "Lỗi cập nhật hồ sơ");
        } finally {
            setLoadingProfile(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setLoadingPassword(true);
        try {
            await customerProfileService.changePassword(passwordData);
            showSuccess("Đổi mật khẩu thành công!");
            setPasswordData({ current_password: '', password: '', password_confirmation: '' });
        } catch (error) {
            showError(getApiErrorMessage(error) || "Lỗi đổi mật khẩu");
        } finally {
            setLoadingPassword(false);
        }
    };

    return (
        <div className="bg-[#F7F4F1] min-h-[calc(100vh-64px)] pt-24 pb-20">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-[#302723] mb-4">Hồ sơ cá nhân</h1>
                    <p className="text-[#958981] max-w-xl mx-auto">Quản lý thông tin cá nhân và bảo mật tài khoản của bạn tại CafeFlow.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Avatar */}
                    <div className="md:col-span-1 space-y-8">
                        <div className="bg-white rounded-3xl shadow-sm p-8 border border-[#E9DFD8] flex flex-col items-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-[#604238] to-[#302723] rounded-t-3xl"></div>
                            <div className="relative z-10 mt-6 mb-4">
                                <div className="ring-4 ring-white rounded-full bg-white shadow-lg">
                                    <AvatarUploader
                                        avatarUrl={customer?.avatar_url || customer?.avatar}
                                        name={customer?.full_name}
                                        loading={loadingAvatar}
                                        onUpload={handleAvatarUpload}
                                        onRemove={handleAvatarRemove}
                                        size="xl"
                                    />
                                </div>
                            </div>
                            <h3 className="font-bold text-xl text-[#302723] text-center mb-1">{customer?.full_name || 'Khách hàng'}</h3>
                            <p className="text-sm text-[#958981] text-center mb-6">{customer?.email}</p>
                            
                            <div className="w-full bg-[#F7F4F1]/50 rounded-2xl p-4 border border-[#E9DFD8]/50">
                                <div className="flex justify-between items-center text-sm mb-2">
                                    <span className="text-[#958981] font-medium">Hạng thành viên</span>
                                    <span className="font-bold text-[#604238]">Thành viên</span>
                                </div>
                                <div className="w-full bg-[#E9DFD8] rounded-full h-1.5 mb-1">
                                    <div className="bg-[#604238] h-1.5 rounded-full" style={{ width: '20%' }}></div>
                                </div>
                                <p className="text-[10px] text-right text-[#958981]">Chi tiêu thêm để nâng hạng</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Forms */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Basic Info Form */}
                        <div className="bg-white rounded-3xl shadow-sm p-8 border border-[#E9DFD8]">
                            <h2 className="text-xl font-bold text-[#302723] mb-6 flex items-center gap-2 border-b border-[#E9DFD8] pb-4">
                                <User className="text-[#604238]" size={20} />
                                Thông tin chung
                            </h2>
                            
                            <form onSubmit={handleProfileSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-[#958981] uppercase tracking-wider mb-2">Họ và tên</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            required
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                            className="w-full pl-12 pr-4 py-4 border border-[#E9DFD8] bg-[#F7F4F1] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#604238]/20 focus:border-[#604238] transition-all font-medium text-[#302723]"
                                            placeholder="Nhập họ và tên của bạn"
                                        />
                                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#958981]" size={20} />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-bold text-[#958981] uppercase tracking-wider mb-2">Email</label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                className="w-full pl-12 pr-4 py-4 border border-[#E9DFD8] bg-[#F7F4F1] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#604238]/20 focus:border-[#604238] transition-all font-medium text-[#302723]"
                                                placeholder="example@email.com"
                                            />
                                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#958981]" size={20} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-[#958981] uppercase tracking-wider mb-2">Số điện thoại</label>
                                        <div className="relative">
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                                className="w-full pl-12 pr-4 py-4 border border-[#E9DFD8] bg-[#F7F4F1] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#604238]/20 focus:border-[#604238] transition-all font-medium text-[#302723]"
                                                placeholder="0912345678"
                                            />
                                            <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#958981]" size={20} />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="pt-4 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={loadingProfile}
                                        className={`px-8 py-4 rounded-xl font-bold text-white transition-all shadow-md hover:shadow-lg flex items-center gap-2 transform active:scale-[0.98] ${loadingProfile ? 'bg-[#958981] cursor-not-allowed' : 'bg-[#604238] hover:bg-[#4a332b]'}`}
                                    >
                                        {loadingProfile ? (
                                            <><div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div> Đang lưu...</>
                                        ) : (
                                            <><Save size={18} /> Lưu thay đổi</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Change Password Form */}
                        <div className="bg-white rounded-3xl shadow-sm p-8 border border-[#E9DFD8]">
                            <h2 className="text-xl font-bold text-[#302723] mb-6 flex items-center gap-2 border-b border-[#E9DFD8] pb-4">
                                <Shield className="text-[#604238]" size={20} />
                                Đổi mật khẩu
                            </h2>
                            
                            <form onSubmit={handlePasswordSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-[#958981] uppercase tracking-wider mb-2">Mật khẩu hiện tại</label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            required
                                            value={passwordData.current_password}
                                            onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                                            className="w-full pl-12 pr-4 py-4 border border-[#E9DFD8] bg-[#F7F4F1] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#604238]/20 focus:border-[#604238] transition-all font-medium text-[#302723]"
                                            placeholder="••••••••"
                                        />
                                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#958981]" size={20} />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-bold text-[#958981] uppercase tracking-wider mb-2">Mật khẩu mới</label>
                                        <div className="relative">
                                            <input
                                                type="password"
                                                required
                                                value={passwordData.password}
                                                onChange={(e) => setPasswordData({...passwordData, password: e.target.value})}
                                                className="w-full pl-12 pr-4 py-4 border border-[#E9DFD8] bg-[#F7F4F1] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#604238]/20 focus:border-[#604238] transition-all font-medium text-[#302723]"
                                                placeholder="••••••••"
                                            />
                                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#958981]" size={20} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-[#958981] uppercase tracking-wider mb-2">Xác nhận mật khẩu mới</label>
                                        <div className="relative">
                                            <input
                                                type="password"
                                                required
                                                value={passwordData.password_confirmation}
                                                onChange={(e) => setPasswordData({...passwordData, password_confirmation: e.target.value})}
                                                className="w-full pl-12 pr-4 py-4 border border-[#E9DFD8] bg-[#F7F4F1] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#604238]/20 focus:border-[#604238] transition-all font-medium text-[#302723]"
                                                placeholder="••••••••"
                                            />
                                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#958981]" size={20} />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="pt-4 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={loadingPassword}
                                        className={`px-8 py-4 rounded-xl font-bold transition-all shadow-md flex items-center gap-2 transform active:scale-[0.98] ${loadingPassword ? 'bg-[#E9DFD8] text-[#958981] cursor-not-allowed' : 'bg-white border-2 border-[#604238] text-[#604238] hover:bg-[#F7F4F1]'}`}
                                    >
                                        {loadingPassword ? (
                                            <><div className="animate-spin rounded-full h-5 w-5 border-2 border-[#958981] border-t-transparent"></div> Đang xử lý...</>
                                        ) : (
                                            <><Shield size={18} /> Đổi mật khẩu</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
