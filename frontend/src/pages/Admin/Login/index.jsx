import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowRight,
    Bot,
    Check,
    Coffee,
    Eye,
    EyeOff,
    Grid2X2,
    HelpCircle,
    LockKeyhole,
    Mail,
    ShieldCheck,
    TrendingUp,
    X,
} from "lucide-react";

import { adminApi } from "../../../config/axios.config";
import { showSuccess, showError } from "../../../utils/toast";
import { getApiErrorMessage } from "../../../utils/apiError";
import useAdminAuth from "../../../hooks/useAdminAuth";

const AdminLogin = () => {
    const navigate = useNavigate();
    const { login } = useAdminAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(true);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Xóa lỗi khi người dùng nhập lại
        if (error) {
            setError("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!formData.email.trim()) {
            setError("Vui lòng nhập email.");
            return;
        }

        if (!formData.password.trim()) {
            setError("Vui lòng nhập mật khẩu.");
            return;
        }

        try {
            setLoading(true);

            const response = await adminApi.post("/login", {
                email: formData.email,
                password: formData.password,
            });

            // axios.config đã return response.data
            showSuccess(response.message);

            login(response.token, response.admin);

            navigate("/admin/dashboard", { replace: true });
        } catch (err) {
            console.error("Admin login error:", err);

            const errorMessage = getApiErrorMessage(err);
            setError(errorMessage);
            showError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f5f2] lg:grid lg:grid-cols-[52%_48%]">
            {/* ================= LEFT SIDE ================= */}
            <section className="relative hidden min-h-screen overflow-hidden bg-[#604238] lg:block">
                {/* Decorative */}
                <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/5" />

                <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-white/5" />

                <div className="relative z-10 flex min-h-screen flex-col px-12 py-8 xl:px-16">
                    {/* Logo */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#604238] shadow">
                                <Coffee size={24} />
                            </div>

                            <div>
                                <h1 className="text-xl font-bold text-white">
                                    CafeFlow
                                </h1>

                                <p className="text-xs text-white/60">
                                    Admin Management System
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white">
                            <Bot size={14} />

                            AI SMART OPS
                        </div>
                    </div>

                    {/* Hero */}
                    <div className="mt-10 max-w-[700px]">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d8b29c]/30 bg-[#7a594e] px-4 py-2 text-[11px] font-semibold tracking-wide text-[#f5d6c4]">
                            <ShieldCheck size={14} />

                            NỀN TẢNG QUẢN TRỊ QUÁN CÀ PHÊ THẾ HỆ MỚI
                        </div>

                        <h2 className="max-w-[650px] text-[42px] font-bold leading-[1.15] tracking-tight text-white xl:text-[48px]">
                            Hệ thống quản lý
                            <br />
                            quán Coffee thông minh
                        </h2>

                        <p className="mt-5 max-w-[620px] text-sm leading-7 text-white/65">
                            Quản lý toàn bộ hoạt động kinh doanh,
                            nhân viên, doanh thu, kho nguyên liệu và
                            vận hành quán Coffee trên một nền tảng duy
                            nhất.
                        </p>

                        {/* Features */}
                        <div className="mt-8 grid gap-3">
                            <FeatureItem
                                icon={<Grid2X2 size={19} />}
                                title="Quản lý tập trung"
                                description="Theo dõi nhân viên, thực đơn, bàn, hóa đơn và kho nguyên liệu."
                            />

                            <FeatureItem
                                icon={<TrendingUp size={19} />}
                                title="Doanh thu theo thời gian thực"
                                description="Nắm bắt nhanh tình hình hoạt động và hiệu quả kinh doanh."
                            />

                            <FeatureItem
                                icon={<Bot size={19} />}
                                title="AI hỗ trợ kinh doanh"
                                description="Dự báo doanh thu, hành vi khách hàng và nhu cầu nguyên liệu."
                            />
                        </div>

                        {/* Fake mini dashboard */}
                        <div className="mt-8 rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-white/50">
                                        Tổng quan hôm nay
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-white">
                                        Hiệu suất kinh doanh
                                    </p>
                                </div>

                                <div className="flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-3 py-1 text-[11px] text-emerald-200">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />

                                    Hoạt động tốt
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <MiniCard
                                    label="Doanh thu"
                                    value="12.45M"
                                />

                                <MiniCard
                                    label="Đơn hàng"
                                    value="126"
                                />

                                <MiniCard
                                    label="Bàn trống"
                                    value="18/25"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto pt-8 text-xs text-white/40">
                        © 2026 CafeFlow. Smart Coffee Management.
                    </div>
                </div>
            </section>

            {/* ================= RIGHT SIDE ================= */}
            <section className="flex min-h-screen flex-col bg-[#fbfaf8]">
                {/* Top */}
                <div className="flex h-[72px] items-center justify-between border-b border-[#eee6e1] px-6 md:px-10">
                    <div className="flex items-center gap-2 text-xs text-[#756a64]">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />

                        Hệ thống ổn định
                    </div>

                    <button
                        type="button"
                        className="flex items-center gap-2 text-xs font-medium text-[#6d625d] transition hover:text-[#604238]"
                    >
                        <HelpCircle size={16} />

                        Hỗ trợ
                    </button>
                </div>

                {/* Form */}
                <div className="flex flex-1 items-start justify-center px-6 pb-8 pt-8 sm:px-8 lg:pt-10 xl:pt-12">
                    <div className="w-full max-w-[520px]">
                        {/* Mobile logo */}
                        <div className="mb-8 flex items-center gap-3 lg:hidden">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#604238] text-white">
                                <Coffee size={23} />
                            </div>

                            <div>
                                <h1 className="font-bold text-[#302723]">
                                    CafeFlow
                                </h1>

                                <p className="text-xs text-[#978b84]">
                                    Admin Management System
                                </p>
                            </div>
                        </div>

                        <div className="mb-2 text-xs font-bold tracking-[0.18em] text-[#a2755f]">
                            ADMIN PORTAL
                        </div>

                        <h2 className="text-[30px] font-bold tracking-tight text-[#302723] sm:text-[34px]">
                            Đăng nhập quản trị
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-[#958981]">
                            Đăng nhập vào hệ thống để quản lý và theo
                            dõi hoạt động của quán Coffee.
                        </p>

                        {/* ERROR */}
                        {error && (
                            <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-600">
                                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100">
                                    <X size={13} />
                                </div>

                                <span className="leading-5">
                                    {error}
                                </span>
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit}
                            className="mt-7 space-y-5"
                        >
                            {/* EMAIL */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-xs font-semibold text-[#4b403b]"
                                >
                                    Email quản trị
                                </label>

                                <div className="relative">
                                    <Mail
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#aa9f99]"
                                    />

                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="admin@cafeflow.vn"
                                        autoComplete="email"
                                        disabled={loading}
                                        className="h-[52px] w-full rounded-xl border border-[#e4dbd5] bg-white pl-12 pr-4 text-[13px] text-[#302723] outline-none transition placeholder:text-[#b9afaa] focus:border-[#8c6858] focus:ring-4 focus:ring-[#8c6858]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
                                    />
                                </div>
                            </div>

                            {/* PASSWORD */}
                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-2 block text-xs font-semibold text-[#4b403b]"
                                >
                                    Mật khẩu
                                </label>

                                <div className="relative">
                                    <LockKeyhole
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#aa9f99]"
                                    />

                                    <input
                                        id="password"
                                        name="password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Nhập mật khẩu"
                                        autoComplete="current-password"
                                        disabled={loading}
                                        className="h-[52px] w-full rounded-xl border border-[#e4dbd5] bg-white pl-12 pr-12 text-[13px] text-[#302723] outline-none transition placeholder:text-[#b9afaa] focus:border-[#8c6858] focus:ring-4 focus:ring-[#8c6858]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                (prev) => !prev
                                            )
                                        }
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#aa9f99] transition hover:text-[#604238]"
                                    >
                                        {showPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Remember */}
                            <div className="flex items-center justify-between">
                                <label className="flex cursor-pointer items-center gap-2 text-xs text-[#786d67]">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setRemember(
                                                (prev) => !prev
                                            )
                                        }
                                        className={`flex h-[18px] w-[18px] items-center justify-center rounded border transition ${remember
                                            ? "border-[#604238] bg-[#604238] text-white"
                                            : "border-[#d9cfc9] bg-white"
                                            }`}
                                    >
                                        {remember && (
                                            <Check size={12} />
                                        )}
                                    </button>

                                    Ghi nhớ đăng nhập
                                </label>

                                <button
                                    type="button"
                                    className="text-xs font-semibold text-[#7c584a] transition hover:text-[#4d332a]"
                                >
                                    Quên mật khẩu?
                                </button>
                            </div>

                            {/* LOGIN */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#604238] text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#50372f] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                                        Đang đăng nhập...
                                    </>
                                ) : (
                                    <>
                                        Đăng nhập

                                        <ArrowRight size={17} />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Security */}
                        <div className="mt-7 flex items-center justify-center gap-2 text-xs text-[#a29690]">
                            <ShieldCheck size={15} />

                            Phiên đăng nhập được bảo vệ bằng Laravel
                            Sanctum
                        </div>

                        <div className="my-7 h-px bg-[#eee7e3]" />

                        <div className="text-center text-xs leading-5 text-[#958981]">
                            Bạn gặp vấn đề khi đăng nhập?
                            <button className="ml-1 font-semibold text-[#68483d]">
                                Liên hệ quản trị hệ thống
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="border-t border-[#eee6e1] px-6 py-5 text-center text-[11px] text-[#aaa09b]">
                    © 2026 CafeFlow · Hệ thống quản lý Coffee thông
                    minh
                </footer>
            </section>
        </div>
    );
};

const FeatureItem = ({
    icon,
    title,
    description,
}) => {
    return (
        <div className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#f0cdb9]">
                {icon}
            </div>

            <div>
                <h3 className="text-sm font-semibold text-white">
                    {title}
                </h3>

                <p className="mt-1 text-xs leading-5 text-white/50">
                    {description}
                </p>
            </div>
        </div>
    );
};

const MiniCard = ({ label, value }) => {
    return (
        <div className="rounded-xl border border-white/10 bg-[#4f362e]/40 p-3">
            <p className="text-[10px] text-white/45">
                {label}
            </p>

            <p className="mt-1 text-lg font-bold text-white">
                {value}
            </p>
        </div>
    );
};

export default AdminLogin;