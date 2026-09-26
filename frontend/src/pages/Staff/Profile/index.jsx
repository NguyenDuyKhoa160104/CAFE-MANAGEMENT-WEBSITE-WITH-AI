import React, { useState } from "react";
import { UserCircle, Mail, Phone, Calendar, ShieldCheck, Briefcase } from "lucide-react";
import useStaffAuth from "../../../hooks/useStaffAuth";
import AvatarUploader from "../../../components/common/AvatarUploader";
import { staffProfileService } from "../../../services/staff/profile.service";
import { showSuccess, showError } from "../../../utils/toast";
import { getApiErrorMessage } from "../../../utils/apiError";

export default function StaffProfile() {
    const { staff, updateStaff } = useStaffAuth();
    const [loading, setLoading] = useState(false);

    const POSITIONS = {
        MANAGER: "Quản lý ca",
        CASHIER: "Thu ngân",
        BARISTA: "Pha chế",
        SERVER: "Phục vụ",
    };

    if (!staff) return null;

    const handleUploadAvatar = async (file) => {
        try {
            setLoading(true);
            const response = await staffProfileService.uploadAvatar(file);
            showSuccess(response.message);
            updateStaff(response.data);
        } catch (error) {
            showError(getApiErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveAvatar = async () => {
        try {
            setLoading(true);
            const response = await staffProfileService.removeAvatar();
            showSuccess(response.message);
            updateStaff(response.data);
        } catch (error) {
            showError(getApiErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 pb-20">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#49332b]">Hồ sơ cá nhân</h1>
                <p className="mt-1 text-sm text-[#958981]">
                    Thông tin tài khoản và phân quyền của bạn trên hệ thống.
                </p>
            </div>

            <div className="mx-auto max-w-3xl">
                {/* PROFILE HEADER */}
                <div className="overflow-hidden rounded-2xl border border-[#E9DFD8] bg-white shadow-sm mb-6">
                    <div className="h-32 bg-[#604238] relative"></div>
                    <div className="px-6 pb-6">
                        <div className="relative -mt-16 flex justify-between items-end mb-4">
                            <div className="shrink-0 mb-4 bg-white rounded-full p-1 border-4 border-white shadow-md">
                                <AvatarUploader
                                    avatarUrl={staff.avatar_url || staff.avatar}
                                    name={staff.full_name}
                                    loading={loading}
                                    onUpload={handleUploadAvatar}
                                    onRemove={handleRemoveAvatar}
                                    size="lg"
                                />
                            </div>
                            <div className="flex gap-2">
                                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 shadow-sm flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    Đang làm việc
                                </span>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-[#49332b]">{staff.full_name}</h2>
                            <p className="text-sm font-semibold text-[#958981] mt-1 flex items-center gap-2">
                                <span className="font-mono text-[#604238]">{staff.staff_code}</span> 
                                • {POSITIONS[staff.position]}
                            </p>
                        </div>
                    </div>
                </div>

                {/* PROFILE DETAILS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* INFO CARD */}
                    <div className="rounded-2xl border border-[#E9DFD8] bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-base font-bold text-[#49332b] flex items-center gap-2">
                            <UserCircle size={18} className="text-[#9c513d]" />
                            Thông tin liên hệ
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-500">
                                    <Mail size={16} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-[#958981] uppercase tracking-wider">Email</p>
                                    <p className="text-sm font-medium text-[#49332b]">{staff.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-500">
                                    <Phone size={16} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-[#958981] uppercase tracking-wider">Số điện thoại</p>
                                    <p className="text-sm font-medium text-[#49332b]">{staff.phone || 'Chưa cập nhật'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-500">
                                    <Calendar size={16} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-[#958981] uppercase tracking-wider">Ngày vào làm</p>
                                    <p className="text-sm font-medium text-[#49332b]">{staff.hire_date ? new Date(staff.hire_date).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PERMISSION CARD */}
                    <div className="rounded-2xl border border-[#E9DFD8] bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-base font-bold text-[#49332b] flex items-center gap-2">
                            <ShieldCheck size={18} className="text-[#9c513d]" />
                            Chức vụ & Quyền hạn
                        </h3>
                        
                        <div className="mb-5 rounded-xl bg-[#f4ddd3] p-4 border border-[#e8c9bb]">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#9c513d] shadow-sm">
                                    <Briefcase size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-[#9c513d] uppercase tracking-wider">Vị trí hiện tại</p>
                                    <p className="text-lg font-bold text-[#604238]">{POSITIONS[staff.position]}</p>
                                </div>
                            </div>
                            <p className="text-xs text-[#65473c] mt-3 bg-white/50 p-2 rounded-lg">
                                Bạn có quyền truy cập vào bảng điều khiển vận hành, sơ đồ bàn và thực đơn phục vụ.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
