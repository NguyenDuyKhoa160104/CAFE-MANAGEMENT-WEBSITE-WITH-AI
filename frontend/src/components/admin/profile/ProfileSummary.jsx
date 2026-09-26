import React, { useState } from 'react';
import { Monitor, ShieldCheck } from 'lucide-react';
import AvatarUploader from '../../common/AvatarUploader';
import { uploadAdminAvatar, removeAdminAvatar } from '../../../services/admin/profile.service';
import { showSuccess, showError } from '../../../utils/toast';
import { getApiErrorMessage } from '../../../utils/apiError';

const ProfileSummary = ({ admin, onUpdate }) => {
    const [loading, setLoading] = useState(false);

    const isMac = navigator.userAgent.toLowerCase().includes('mac');
    const isWindows = navigator.userAgent.toLowerCase().includes('windows');
    let deviceName = "Thiết bị không xác định";
    if (isMac) deviceName = "Apple Mac";
    if (isWindows) deviceName = "Windows PC";

    const handleUpload = async (file) => {
        try {
            setLoading(true);
            const response = await uploadAdminAvatar(file);
            showSuccess(response.message);
            if (onUpdate) onUpdate(response.data);
        } catch (error) {
            showError(getApiErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async () => {
        try {
            setLoading(true);
            const response = await removeAdminAvatar();
            showSuccess(response.message);
            if (onUpdate) onUpdate(response.data);
        } catch (error) {
            showError(getApiErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 rounded-2xl border border-[#e9dfd8] bg-white p-6 md:flex-row md:items-center justify-between">
            {/* LEFT SIDE */}
            <div className="flex items-center gap-5">
                <div className="shrink-0">
                    <AvatarUploader 
                        avatarUrl={admin.avatar_url || admin.avatar}
                        name={admin.full_name}
                        loading={loading}
                        onUpload={handleUpload}
                        onRemove={handleRemove}
                        size="md"
                    />
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
