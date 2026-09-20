import React, { useState } from 'react';
import { LockKeyhole, LogOut } from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';
import LogoutAllModal from './LogoutAllModal';

const SecurityCard = () => {
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    return (
        <>
            <div className="rounded-2xl border border-[#e9dfd8] bg-white">
                <div className="border-b border-[#e9dfd8] p-5">
                    <h3 className="font-bold text-[#302723]">Bảo mật tài khoản</h3>
                    <p className="mt-1 text-xs text-[#958981]">Quản lý mật khẩu và các phiên đăng nhập.</p>
                </div>

                <div className="divide-y divide-[#e9dfd8]">
                    {/* MẬT KHẨU */}
                    <div className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f7f4f1] text-[#604238]">
                                <LockKeyhole size={18} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-[#302723]">Mật khẩu</h4>
                                <p className="mt-1 text-xs text-[#958981]">
                                    Thay đổi mật khẩu định kỳ để bảo vệ tài khoản quản trị hệ thống.
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsPasswordModalOpen(true)}
                            className="mt-4 w-full rounded-lg border border-[#e9dfd8] bg-white px-4 py-2 text-sm font-semibold text-[#604238] transition hover:bg-[#faf8f6]"
                        >
                            Đổi mật khẩu
                        </button>
                    </div>

                    {/* PHIÊN ĐĂNG NHẬP */}
                    <div className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                                <LogOut size={18} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-[#302723]">Phiên đăng nhập</h4>
                                <p className="mt-1 text-xs text-[#958981]">
                                    Đăng xuất tài khoản khỏi tất cả các thiết bị mà bạn không còn sử dụng.
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsLogoutModalOpen(true)}
                            className="mt-4 w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                        >
                            Đăng xuất tất cả thiết bị
                        </button>
                    </div>
                </div>
            </div>

            <ChangePasswordModal 
                isOpen={isPasswordModalOpen} 
                onClose={() => setIsPasswordModalOpen(false)} 
            />

            <LogoutAllModal 
                isOpen={isLogoutModalOpen} 
                onClose={() => setIsLogoutModalOpen(false)} 
            />
        </>
    );
};

export default SecurityCard;
