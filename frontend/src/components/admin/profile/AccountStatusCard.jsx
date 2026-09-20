import React from 'react';

const AccountStatusCard = ({ admin }) => {
    return (
        <div className="rounded-2xl border border-[#e9dfd8] bg-white p-5">
            <h3 className="font-bold text-[#302723]">Tình trạng tài khoản</h3>
            
            <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#958981]">Trạng thái</span>
                    {admin.status === 'ACTIVE' ? (
                        <span className="rounded bg-green-50 px-2 py-1 text-[10px] font-bold text-green-700">ACTIVE</span>
                    ) : admin.status === 'LOCKED' ? (
                        <span className="rounded bg-red-50 px-2 py-1 text-[10px] font-bold text-red-700">LOCKED</span>
                    ) : (
                        <span className="rounded bg-orange-50 px-2 py-1 text-[10px] font-bold text-orange-700">INACTIVE</span>
                    )}
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#958981]">Vai trò</span>
                    <span className="text-sm font-semibold text-[#302723]">Quản trị viên</span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#958981]">Mã tài khoản</span>
                    <span className="font-mono text-sm font-semibold text-[#302723]">{admin.admin_code || "N/A"}</span>
                </div>

                <div className="flex items-center justify-between border-b border-[#e9dfd8] pb-4">
                    <span className="text-xs font-semibold text-[#958981]">Xác thực 2 bước</span>
                    <span className="text-sm font-semibold text-[#958981]">Chưa cấu hình</span>
                </div>
            </div>

            <div className="mt-4 rounded-xl bg-[#faf8f6] p-4">
                <p className="text-xs font-bold text-[#302723]">Bảo mật tài khoản</p>
                <p className="mt-1 text-xs text-[#958981] leading-relaxed">
                    Thay đổi mật khẩu định kỳ và đăng xuất các phiên không còn sử dụng.
                </p>
            </div>
        </div>
    );
};

export default AccountStatusCard;
