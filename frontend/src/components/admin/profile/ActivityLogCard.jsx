import React from 'react';
import { History } from 'lucide-react';

const ActivityLogCard = () => {
    return (
        <div className="rounded-2xl border border-[#e9dfd8] bg-white">
            <div className="border-b border-[#e9dfd8] p-6">
                <h3 className="text-lg font-bold text-[#302723]">Nhật ký tác vụ quản trị gần đây</h3>
            </div>

            <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#f7f4f1] text-[#958981]">
                    <History size={24} />
                </div>
                <p className="text-sm font-bold text-[#302723]">Chưa có dữ liệu hoạt động</p>
                <p className="mt-1 text-xs text-[#958981] max-w-sm">
                    Nhật ký quản trị sẽ hiển thị tại đây khi hệ thống ghi nhận hoạt động.
                </p>
            </div>
        </div>
    );
};

export default ActivityLogCard;
