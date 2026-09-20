import React from 'react';
import { BadgeCheck, CalendarDays, Clock3, Mail, Phone, ShieldCheck, User } from 'lucide-react';

const InfoField = ({ icon, label, value, readOnly }) => (
    <div className="space-y-1">
        <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-[#958981] flex items-center gap-1.5">
                {icon}
                {label}
            </p>
            {readOnly && (
                <span className="rounded bg-[#f7f4f1] px-1.5 py-0.5 text-[9px] font-bold text-[#958981]">
                    Chỉ đọc
                </span>
            )}
        </div>
        <p className="text-sm font-semibold text-[#302723] truncate bg-[#faf8f6] p-2.5 rounded-lg border border-[#f7f4f1]">
            {value || "Chưa cập nhật"}
        </p>
    </div>
);

const PersonalInformation = ({ admin, onEdit }) => {
    const formatDate = (dateString, includeTime = false) => {
        if (!dateString) return "Chưa có dữ liệu";
        try {
            const date = new Date(dateString);
            const formatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
            if (includeTime) {
                formatOptions.hour = '2-digit';
                formatOptions.minute = '2-digit';
            }
            return new Intl.DateTimeFormat('vi-VN', formatOptions).format(date);
        } catch {
            return "Định dạng không hợp lệ";
        }
    };

    return (
        <div className="rounded-2xl border border-[#e9dfd8] bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#e9dfd8] p-6 gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-[#302723]">Thông tin cá nhân</h3>
                        <div className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                            <BadgeCheck size={12} />
                            Đã xác minh
                        </div>
                    </div>
                    <p className="mt-1 text-xs text-[#958981]">Thông tin cơ bản của tài khoản quản trị viên.</p>
                </div>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    <InfoField 
                        icon={<User size={14} />} 
                        label="Họ và tên" 
                        value={admin.full_name} 
                    />
                    
                    <InfoField 
                        icon={<ShieldCheck size={14} />} 
                        label="Mã quản trị viên" 
                        value={admin.admin_code} 
                        readOnly={true}
                    />

                    <InfoField 
                        icon={<Mail size={14} />} 
                        label="Địa chỉ Email" 
                        value={admin.email} 
                    />

                    <InfoField 
                        icon={<Phone size={14} />} 
                        label="Số điện thoại" 
                        value={admin.phone} 
                    />

                    <InfoField 
                        icon={<BadgeCheck size={14} />} 
                        label="Loại tài khoản" 
                        value="Quản trị viên hệ thống" 
                        readOnly={true}
                    />

                    <InfoField 
                        icon={<ShieldCheck size={14} />} 
                        label="Trạng thái tài khoản" 
                        value={admin.status === 'ACTIVE' ? "Hoạt động bình thường" : (admin.status === 'LOCKED' ? "Tài khoản bị khóa" : "Ngừng hoạt động")} 
                        readOnly={true}
                    />
                    
                    <InfoField 
                        icon={<CalendarDays size={14} />} 
                        label="Ngày tạo tài khoản" 
                        value={formatDate(admin.created_at || admin.createdAt)} 
                        readOnly={true}
                    />

                    <InfoField 
                        icon={<Clock3 size={14} />} 
                        label="Cập nhật lần cuối" 
                        value={formatDate(admin.updated_at || admin.updatedAt, true)} 
                        readOnly={true}
                    />
                </div>

                <div className="mt-8 flex justify-end">
                    <button 
                        onClick={onEdit}
                        className="rounded-lg border border-[#e9dfd8] bg-white px-4 py-2 text-sm font-semibold text-[#604238] transition hover:bg-[#faf8f6]"
                    >
                        Chỉnh sửa thông tin
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PersonalInformation;
