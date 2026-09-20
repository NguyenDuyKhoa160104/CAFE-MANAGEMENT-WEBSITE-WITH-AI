import React, { useState } from "react";
import { Search, Info, Armchair } from "lucide-react";
import { mockTables } from "../../../data/staff.mock";

export default function StaffTableOperation() {
    const [filterArea, setFilterArea] = useState("");
    const [filterStatus, setFilterStatus] = useState("");

    const filteredTables = mockTables.filter((t) => {
        if (filterArea && t.area_name !== filterArea) return false;
        if (filterStatus && t.status !== filterStatus) return false;
        return true;
    });

    const statusMap = {
        AVAILABLE: { label: "Bàn trống", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
        OCCUPIED: { label: "Đang phục vụ", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
        RESERVED: { label: "Đã đặt", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
        INACTIVE: { label: "Tạm ngưng", bg: "bg-gray-50", text: "text-gray-500", border: "border-gray-200" },
    };

    return (
        <div className="p-4 sm:p-6 pb-20">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#49332b]">Sơ đồ bàn</h1>
                <p className="mt-1 text-sm text-[#958981]">
                    Theo dõi trạng thái và điều phối bàn phục vụ.
                </p>
            </div>

            {/* TOOLBAR */}
            <div className="mb-6 flex flex-col sm:flex-row gap-3">
                <select
                    value={filterArea}
                    onChange={(e) => setFilterArea(e.target.value)}
                    className="rounded-lg border border-[#E9DFD8] bg-white px-3 py-2 text-sm text-[#49332b] focus:border-[#604238] focus:outline-none focus:ring-1 focus:ring-[#604238]"
                >
                    <option value="">Tất cả khu vực</option>
                    <option value="Tầng 1">Tầng 1</option>
                    <option value="Tầng 2">Tầng 2</option>
                    <option value="Sân vườn">Sân vườn</option>
                </select>

                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="rounded-lg border border-[#E9DFD8] bg-white px-3 py-2 text-sm text-[#49332b] focus:border-[#604238] focus:outline-none focus:ring-1 focus:ring-[#604238]"
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="AVAILABLE">Bàn trống</option>
                    <option value="OCCUPIED">Đang phục vụ</option>
                    <option value="RESERVED">Đã đặt</option>
                    <option value="INACTIVE">Tạm ngưng</option>
                </select>
            </div>

            {/* TABLE GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredTables.map((table) => {
                    const st = statusMap[table.status];
                    return (
                        <div key={table.id} className={`rounded-xl border p-4 flex flex-col items-center text-center justify-between h-[160px] bg-white hover:shadow-md transition relative overflow-hidden`}>
                            {/* Color strip at top */}
                            <div className={`absolute top-0 left-0 right-0 h-1.5 ${st.bg.replace('50', '400')}`}></div>
                            
                            <div className="w-full text-center mt-1">
                                <p className="font-bold text-[#49332b] text-lg">{table.table_name}</p>
                                <p className="text-xs text-[#958981] mt-0.5">{table.area_name} • {table.capacity} chỗ</p>
                            </div>
                            <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold mt-2 ${st.text} ${st.bg}`}>
                                {st.label}
                            </span>
                            <button 
                                onClick={() => alert("Chức năng đơn hàng sẽ được tích hợp sau.")}
                                className={`mt-3 w-full rounded border py-1.5 text-xs font-bold transition shadow-sm
                                    ${table.status === 'AVAILABLE' 
                                        ? 'bg-[#604238] text-white hover:bg-[#49332b] border-[#604238]' 
                                        : 'bg-white text-[#625751] hover:bg-gray-50 border-[#E9DFD8]'
                                    }`}
                            >
                                {table.status === 'AVAILABLE' ? 'Mở bàn' : 'Xem bàn'}
                            </button>
                        </div>
                    );
                })}
            </div>

            {filteredTables.length === 0 && (
                <div className="py-20 text-center rounded-xl border border-dashed border-[#E9DFD8] bg-white">
                    <Armchair size={48} className="mx-auto text-[#d8c8bd] mb-3" />
                    <p className="font-semibold text-[#49332b]">Không tìm thấy bàn phù hợp</p>
                </div>
            )}
        </div>
    );
}
