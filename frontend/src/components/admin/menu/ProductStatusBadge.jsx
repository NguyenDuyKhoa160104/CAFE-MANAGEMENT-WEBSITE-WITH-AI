import React from 'react';

const ProductStatusBadge = ({ status }) => {
    switch (status) {
        case 'ACTIVE':
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-semibold text-green-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    Đang bán
                </span>
            );
        case 'INACTIVE':
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-semibold text-gray-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />
                    Đang ẩn
                </span>
            );
        case 'OUT_OF_STOCK':
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-semibold text-orange-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                    Hết hàng
                </span>
            );
        default:
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-semibold text-gray-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />
                    Không xác định
                </span>
            );
    }
};

export default ProductStatusBadge;
