import React, { useState } from 'react';
import { X, LoaderCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../../config/axios.config';
import { showSuccess, showError } from '../../../utils/toast';
import { getApiErrorMessage } from '../../../utils/apiError';

const LogoutAllModal = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleLogoutAll = async () => {
        setLoading(true);
        try {
            const response = await adminApi.post("/logout-all");
            
            showSuccess(response?.message || "Đã đăng xuất khỏi tất cả thiết bị");
            
            localStorage.removeItem("admin_token");
            localStorage.removeItem("admin_data");
            
            navigate("/admin/login", { replace: true });
        } catch (error) {
            showError(getApiErrorMessage(error));
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-[#eee5df] px-6 py-4">
                    <h3 className="text-lg font-bold text-red-600">Đăng xuất khỏi tất cả thiết bị?</h3>
                    <button 
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-lg p-2 text-[#958981] hover:bg-[#f4efec] hover:text-[#302723] disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-sm text-[#574943]">
                        Tất cả phiên đăng nhập của tài khoản sẽ bị kết thúc. Bạn sẽ cần đăng nhập lại.
                    </p>

                    <div className="mt-8 flex justify-end gap-3 border-t border-[#eee5df] pt-4">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-lg px-4 py-2 text-sm font-semibold text-[#574943] hover:bg-[#f4efec] disabled:opacity-50"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleLogoutAll}
                            disabled={loading}
                            className="flex min-w-[150px] items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                        >
                            {loading && <LoaderCircle size={16} className="animate-spin" />}
                            {loading ? "Đang đăng xuất..." : "Đăng xuất tất cả"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogoutAllModal;
