import React from "react";

const AdminFooter = () => {
    return (
        <footer className="flex min-h-[56px] flex-col items-center justify-between gap-2 border-t border-[#ebe3dd] bg-white px-6 py-4 text-[10px] text-[#968981] sm:flex-row">
            <p>
                © 2026{" "}
                <strong className="text-[#604238]">
                    CafeFlow
                </strong>
                . Website quản lý và kinh doanh quán Coffee thông minh.
            </p>

            <span>Version 1.0.0</span>
        </footer>
    );
};

export default AdminFooter;