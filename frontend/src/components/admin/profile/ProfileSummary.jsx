import React from 'react';
import { Camera, Monitor, ShieldCheck } from 'lucide-react';

const ProfileSummary = ({ admin }) => {
    const getInitials = (name) => {
        if (!name) return "AD";
        const words = name.trim().split(/\s+/);
        if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
        return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    };

    const isMac = navigator.userAgent.toLowerCase().includes('mac');
    const isWindows = navigator.userAgent.toLowerCase().includes('windows');
    let deviceName = "Thiết bị không xác định";
    if (isMac) deviceName = "Apple Mac";
    if (isWindows) deviceName = "Windows PC";

    return (
        <div className="flex flex-col gap-6 rounded-2xl border border-[#e9dfd8] bg-white p-6 md:flex-row md:items-center justify-between">
            {/* LEFT SIDE */}
            <div className="flex items-center gap-5">
                <div className="relative h-20 w-20 shrink-0">
                    {admin.avatar ? (
                        <img 
                            src={admin.avatar_url || admin.avatar} 
                            alt={admin.full_name} 
                            className="h-full w-full rounded-full object-cover shadow-sm border border-[#e9dfd8]" 
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-[#604238] text-2xl font-bold text-white shadow-sm">
                            {getInitials(admin.full_name)}
                        </div>
                    )}
                    <button className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#f7f4f1] text-[#604238] hover:bg-[#e9dfd8]">
                        <Camera size={14} />
                    </button>
                </div>

                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-[#302723]">{admin.full_name || "Chưa cập nhật"}</h2>
                        <span className="rounded bg-[#f7f4f1] px-2 py-0.5 text-[10px] font-bold text-[#604238]">
                            Quản trị viên
                        </span>
                    </div>
                    <p className="mt-1 text-sm text-[#958981]">{admin.email || "Chưa cập nhật email"}</p>
                    
                    <div className="mt-3 flex items-center gap-4 text-xs font-semibold">
                        <div className="flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-green-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            Đang hoạt động
                        </div>
                        <span className="text-[#958981]">
                            Mã quản trị: <span className="text-[#302723] font-mono">{admin.admin_code || "Chưa cập nhật"}</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex flex-col gap-4 sm:flex-row md:border-l md:border-[#e9dfd8] md:pl-6">
                <div className="flex items-start gap-3 rounded-xl bg-[#f7f4f1] p-3 sm:w-[220px]">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#604238]">
                        <Monitor size={18} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold tracking-wide text-[#958981]">PHIÊN ĐĂNG NHẬP HIỆN TẠI</p>
                        <p className="mt-1 text-sm font-bold text-[#302723]">{deviceName}</p>
                        <p className="mt-0.5 text-[10px] text-green-600">Phiên đăng nhập đang hoạt động</p>
                    </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl bg-[#f7f4f1] p-3 sm:w-[220px]">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#604238]">
                        <ShieldCheck size={18} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold tracking-wide text-[#958981]">CẤP BẬC QUYỀN HẠN</p>
                        <p className="mt-1 text-sm font-bold text-[#302723]">Toàn quyền hệ thống</p>
                        <span className="mt-1 inline-block rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-bold text-green-700">
                            Super Admin
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSummary;
