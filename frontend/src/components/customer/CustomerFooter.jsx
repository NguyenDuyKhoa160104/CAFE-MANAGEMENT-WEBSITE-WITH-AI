import React from 'react';
import BrandLogo from '../common/BrandLogo';

const CustomerFooter = () => {
    return (
        <footer className="bg-[#302723] text-[#E9DFD8] py-8 mt-auto">
            <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm">
                <div className="mb-4 md:mb-0">
                    <BrandLogo className="h-8 md:h-10 mb-3 brightness-0 invert opacity-90" />
                    <p className="opacity-90">123 Đường Cà Phê, Quận 1, TP. HCM</p>
                    <p className="opacity-90">Mở cửa: 07:00 - 22:30 hàng ngày</p>
                </div>
                <div className="flex space-x-6 text-sm">
                    <a href="/menu" className="hover:text-white transition-colors">Thực đơn</a>
                    <a href="/reservation" className="hover:text-white transition-colors">Đặt bàn</a>
                    <a href="#" className="hover:text-white transition-colors">Liên hệ</a>
                </div>
            </div>
            <div className="text-center text-xs mt-8 opacity-70">
                &copy; {new Date().getFullYear()} CafeFlow. All rights reserved.
            </div>
        </footer>
    );
};

export default CustomerFooter;
