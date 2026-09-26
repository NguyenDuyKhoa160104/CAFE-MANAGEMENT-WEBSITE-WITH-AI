import React from 'react';
import { Outlet } from 'react-router-dom';
import CustomerHeader from '../components/customer/CustomerHeader';
import CustomerFooter from '../components/customer/CustomerFooter';

const CustomerLayout = () => {
    return (
        <div className="flex flex-col min-h-screen bg-[#F7F4F1] text-[#302723]">
            <CustomerHeader />
            <main className="flex-grow pt-16">
                <Outlet />
            </main>
            <CustomerFooter />
        </div>
    );
};

export default CustomerLayout;
