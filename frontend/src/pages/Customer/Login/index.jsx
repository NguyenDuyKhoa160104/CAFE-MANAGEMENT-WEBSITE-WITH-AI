import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { customerAuthService } from '../../../services/customer/auth.service';
import { useCustomerAuth } from '../../../contexts/CustomerAuthContext';
import { showSuccess, showError } from '../../../utils/toast';
import { getApiErrorMessage } from '../../../utils/apiError';
import BrandLogo from '../../../components/common/BrandLogo';
import { Mail, LockKeyhole, ArrowRight, ShieldCheck } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { loginCustomer } = useCustomerAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from || '/';

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await customerAuthService.login({ email, password });
            loginCustomer(response.customer, response.token);
            showSuccess(response.message || "Đăng nhập thành công!");
            navigate(from, { replace: true });
        } catch (error) {
            showError(getApiErrorMessage(error) || "Đăng nhập thất bại");
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
                    <h2 className="text-4xl font-bold text-white mb-4">Trải nghiệm cà phê đích thực</h2>
                    <p className="text-white/80 text-lg max-w-md mx-auto">
                        Đăng nhập để đặt bàn, theo dõi đơn hàng và nhận nhiều ưu đãi đặc quyền từ CafeFlow.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-[440px] bg-white rounded-3xl shadow-xl p-8 sm:p-10">
                    <div className="text-center mb-8">
                        <div className="lg:hidden bg-[#F7F4F1] rounded-2xl p-3 inline-block mb-6">
                            <BrandLogo className="h-10" />
                        </div>
                        <h2 className="text-3xl font-bold text-[#302723]">Chào mừng trở lại</h2>
                        <p className="mt-3 text-sm text-[#958981]">
                            Vui lòng đăng nhập để tiếp tục
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleLogin}>
                        <div>
                            <label className="block text-sm font-semibold text-[#302723] mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#958981]" size={20} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-12 pl-12 pr-4 bg-[#F7F4F1] border border-[#E9DFD8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#604238]/20 focus:border-[#604238] transition-all"
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-[#302723] mb-2">Mật khẩu</label>
                            <div className="relative">
                                <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-[#958981]" size={20} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-12 pl-12 pr-4 bg-[#F7F4F1] border border-[#E9DFD8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#604238]/20 focus:border-[#604238] transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        
                        <div className="pt-2">
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
                                        Đăng nhập <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                    
                    <div className="mt-8 pt-6 border-t border-[#E9DFD8] text-center">
                        <p className="text-sm text-[#958981]">
                            Chưa có tài khoản?{' '}
                            <Link to="/register" className="font-bold text-[#604238] hover:text-[#4a332b] hover:underline">
                                Đăng ký ngay
                            </Link>
                        </p>
                    </div>
                    
                    <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[#958981]">
                        <ShieldCheck size={16} className="text-[#6F8F3D]" />
                        <span>Thông tin của bạn được bảo mật tuyệt đối</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
