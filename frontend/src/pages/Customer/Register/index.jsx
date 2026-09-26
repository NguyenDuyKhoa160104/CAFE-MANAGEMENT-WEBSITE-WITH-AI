import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { customerAuthService } from '../../../services/customer/auth.service';
import { useCustomerAuth } from '../../../contexts/CustomerAuthContext';
import { showSuccess, showError } from '../../../utils/toast';
import { getApiErrorMessage } from '../../../utils/apiError';
import BrandLogo from '../../../components/common/BrandLogo';
import { Mail, LockKeyhole, ArrowRight, ShieldCheck, User, Phone } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: ''
    });
    const [loading, setLoading] = useState(false);
    const { loginCustomer } = useCustomerAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await customerAuthService.register(formData);
            showSuccess(response.message || "Đăng ký thành công!");
            
            if (response.token) {
                // Auto login
                loginCustomer(response.customer, response.token);
                navigate('/');
            } else {
                navigate('/login');
            }
        } catch (error) {
            showError(getApiErrorMessage(error) || "Đăng ký thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#F7F4F1] lg:grid lg:grid-cols-2">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex flex-col justify-center items-center bg-[#604238] p-12 relative overflow-hidden text-center">
                <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/5" />
                <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-white/5" />
                <div className="relative z-10">
                    <div className="bg-white rounded-2xl p-4 inline-block mb-8 shadow-lg">
                        <BrandLogo className="h-16" />
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-4">Trở thành hội viên CafeFlow</h2>
                    <p className="text-white/80 text-lg max-w-md mx-auto">
                        Tích điểm, nhận ưu đãi độc quyền và theo dõi đơn hàng của bạn mọi lúc mọi nơi.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-[480px] bg-white rounded-3xl shadow-xl p-8 sm:p-10">
                    <div className="text-center mb-8">
                        <div className="lg:hidden bg-[#F7F4F1] rounded-2xl p-3 inline-block mb-6">
                            <BrandLogo className="h-10" />
                        </div>
                        <h2 className="text-3xl font-bold text-[#302723]">Đăng ký tài khoản</h2>
                        <p className="mt-3 text-sm text-[#958981]">
                            Điền thông tin bên dưới để tạo tài khoản mới
                        </p>
                    </div>

                    <form className="space-y-4" onSubmit={handleRegister}>
                        <div>
                            <label className="block text-sm font-semibold text-[#302723] mb-2">Họ và tên</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#958981]" size={20} />
                                <input
                                    type="text"
                                    name="full_name"
                                    required
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    className="w-full h-11 pl-12 pr-4 bg-[#F7F4F1] border border-[#E9DFD8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#604238]/20 focus:border-[#604238] transition-all"
                                    placeholder="Ví dụ: Nguyễn Văn A"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-semibold text-[#302723] mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#958981]" size={20} />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full h-11 pl-12 pr-4 bg-[#F7F4F1] border border-[#E9DFD8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#604238]/20 focus:border-[#604238] transition-all"
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-semibold text-[#302723] mb-2">Số điện thoại</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#958981]" size={20} />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full h-11 pl-12 pr-4 bg-[#F7F4F1] border border-[#E9DFD8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#604238]/20 focus:border-[#604238] transition-all"
                                    placeholder="0912345678"
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-[#302723] mb-2">Mật khẩu</label>
                                <div className="relative">
                                    <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-[#958981]" size={18} />
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full h-11 pl-10 pr-3 bg-[#F7F4F1] border border-[#E9DFD8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#604238]/20 focus:border-[#604238] transition-all text-sm"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[#302723] mb-2">Xác nhận</label>
                                <div className="relative">
                                    <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-[#958981]" size={18} />
                                    <input
                                        type="password"
                                        name="password_confirmation"
                                        required
                                        value={formData.password_confirmation}
                                        onChange={handleChange}
                                        className="w-full h-11 pl-10 pr-3 bg-[#F7F4F1] border border-[#E9DFD8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#604238]/20 focus:border-[#604238] transition-all text-sm"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full h-12 flex items-center justify-center gap-2 rounded-xl text-white font-semibold transition-all ${
                                    loading 
                                    ? 'bg-[#958981] cursor-not-allowed' 
                                    : 'bg-[#604238] hover:bg-[#4a332b] shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                                }`}
                            >
                                {loading ? 'Đang xử lý...' : (
                                    <>
                                        Tạo tài khoản <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                    
                    <div className="mt-8 pt-6 border-t border-[#E9DFD8] text-center">
                        <p className="text-sm text-[#958981]">
                            Đã có tài khoản?{' '}
                            <Link to="/login" className="font-bold text-[#604238] hover:text-[#4a332b] hover:underline">
                                Đăng nhập
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
