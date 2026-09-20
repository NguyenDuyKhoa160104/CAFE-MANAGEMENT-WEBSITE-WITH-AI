import React from 'react';

const CategoryStatusBadge = ({ status }) => {
    if (status === "ACTIVE") {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-semibold text-green-600">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Hoạt động
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-semibold text-orange-500">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
            Đang ẩn
        </span>
    );
};

export default CategoryStatusBadge;
