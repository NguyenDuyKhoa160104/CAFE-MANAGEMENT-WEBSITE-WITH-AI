import React from "react";
import { useNavigate } from "react-router-dom";
import {
    CircleCheck,
    Coffee,
    ReceiptText,
    CircleCheckBig,
    Armchair,
    UserCircle,
    Info,
    Clock,
    TrendingUp,
} from "lucide-react";
import { mockStaff, mockTables, mockOrders } from "../../../data/staff.mock";

export default function StaffDashboard() {
    const navigate = useNavigate();

    const availableTablesCount = mockTables.filter((t) => t.status === "AVAILABLE").length;
    const occupiedTablesCount = mockTables.filter((t) => t.status === "OCCUPIED").length;

    return (
        <div className="p-4 sm:p-6 pb-20">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#49332b]">
                    Xin chào, {mockStaff.full_name.split(" ").pop()} 👋
                </h1>
                <p className="mt-1 text-sm text-[#958981]">
                    Chúc bạn có một ca làm việc hiệu quả tại CafeFlow.
                </p>
            </div>

            {/* CURRENT SHIFT CARD */}
            <div className="mb-6 flex flex-col md:flex-row gap-4 rounded-xl border border-[#E9DFD8] bg-white p-5 shadow-sm">
                <div className="flex-1">
                    <h3 className="font-bold text-[#49332b] mb-1">Ca làm việc hiện tại</h3>
                    <div className="flex items-center gap-3">
                        <span className="text-lg font-semibold text-[#604238]">Ca sáng (08:00 - 16:00)</span>
                        <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                            Đang trong ca
                        </span>
                    </div>
                </div>
                <div className="flex flex-1 md:justify-end gap-6 text-sm text-[#625751]">
                    <div>
                        <p className="text-[11px] font-semibold text-[#958981] uppercase tracking-wider">Check-in</p>
                        <p className="font-medium text-[#49332b]">07:55</p>
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-[#958981] uppercase tracking-wider">Thời gian</p>
                        <p className="font-medium text-[#49332b]">3 giờ 42 phút</p>
                    </div>
                    <div className="hidden sm:block">
                        <button className="rounded-lg border border-[#E9DFD8] bg-gray-50 px-3 py-1.5 text-xs font-semibold text-[#625751] hover:bg-gray-100 transition">
                            Xem chi tiết ca
                        </button>
                    </div>
                </div>
            </div>

            {/* SUMMARY CARDS */}
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="rounded-xl border border-[#E9DFD8] bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#958981]">Bàn trống</p>
                            <h3 className="mt-1 text-2xl font-bold text-[#49332b]">{availableTablesCount}</h3>
                            <p className="mt-1 text-xs text-green-600 font-medium">Sẵn sàng phục vụ</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                            <CircleCheck size={20} />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-[#E9DFD8] bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#958981]">Đang phục vụ</p>
                            <h3 className="mt-1 text-2xl font-bold text-[#49332b]">{occupiedTablesCount}</h3>
                            <p className="mt-1 text-xs text-blue-600 font-medium">Có khách tại bàn</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                            <Coffee size={20} />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-[#E9DFD8] bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#958981]">Đơn đang xử lý</p>
                            <h3 className="mt-1 text-2xl font-bold text-[#49332b]">5</h3>
                            <p className="mt-1 text-xs text-amber-600 font-medium">Cần hoàn thiện</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                            <ReceiptText size={20} />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-[#E9DFD8] bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#958981]">Đơn hoàn thành</p>
                            <h3 className="mt-1 text-2xl font-bold text-[#49332b]">28</h3>
                            <p className="mt-1 text-xs text-[#958981] font-medium">Trong ca hiện tại</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3efec] text-[#604238]">
                            <CircleCheckBig size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="mb-6">
                <h3 className="mb-3 text-sm font-bold text-[#49332b] uppercase tracking-wide">Thao tác nhanh</h3>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <button onClick={() => navigate("/staff/tables")} className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white p-4 border border-[#E9DFD8] hover:border-[#604238] hover:shadow-sm transition">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4ddd3] text-[#9c513d]">
                            <Armchair size={20} />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-[#49332b]">Sơ đồ bàn</p>
                            <p className="text-[10px] text-[#958981] mt-0.5">Xem & điều phối</p>
                        </div>
                    </button>

                    <button onClick={() => navigate("/staff/menu")} className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white p-4 border border-[#E9DFD8] hover:border-[#604238] hover:shadow-sm transition">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4ddd3] text-[#9c513d]">
                            <Coffee size={20} />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-[#49332b]">Thực đơn</p>
                            <p className="text-[10px] text-[#958981] mt-0.5">Món đang phục vụ</p>
                        </div>
                    </button>

                    <button disabled className="flex flex-col items-center justify-center gap-2 rounded-xl bg-gray-50 p-4 border border-gray-200 opacity-70 cursor-not-allowed">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-500">
                            <ReceiptText size={20} />
                        </div>
                        <div className="text-center relative">
                            <p className="text-sm font-bold text-gray-500">Đơn hàng</p>
                            <span className="absolute -top-7 left-1/2 -translate-x-1/2 rounded bg-gray-200 px-1.5 py-0.5 text-[8px] font-bold text-gray-600 uppercase">Sắp có</span>
                            <p className="text-[10px] text-gray-400 mt-0.5">Quản lý đơn xử lý</p>
                        </div>
                    </button>

                    <button onClick={() => navigate("/staff/profile")} className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white p-4 border border-[#E9DFD8] hover:border-[#604238] hover:shadow-sm transition">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4ddd3] text-[#9c513d]">
                            <UserCircle size={20} />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-[#49332b]">Hồ sơ</p>
                            <p className="text-[10px] text-[#958981] mt-0.5">Cá nhân & bảo mật</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* MAIN GRID */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                
                {/* LEFT 2/3 */}
                <div className="lg:col-span-2 space-y-6">
                    {/* TABLE OVERVIEW */}
                    <div className="rounded-xl border border-[#E9DFD8] bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-[#E9DFD8] px-5 py-4 flex justify-between items-center bg-[#fbfaf9]">
                            <h3 className="font-bold text-[#49332b]">Tình trạng bàn (Tóm tắt)</h3>
                            <button onClick={() => navigate("/staff/tables")} className="text-xs font-semibold text-[#604238] hover:underline">
                                Xem tất cả
                            </button>
                        </div>
                        <div className="p-5 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                            {mockTables.slice(0, 6).map((table) => {
                                const statusMap = {
                                    AVAILABLE: { label: "Bàn trống", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
                                    OCCUPIED: { label: "Đang phục vụ", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
                                    RESERVED: { label: "Đã đặt", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
                                    INACTIVE: { label: "Tạm ngưng", bg: "bg-gray-50", text: "text-gray-500", border: "border-gray-200" },
                                };
                                const st = statusMap[table.status];

                                return (
                                    <div key={table.id} className={`rounded-xl border p-3 flex flex-col items-center text-center justify-between h-[120px] ${st.bg} ${st.border}`}>
                                        <div className="w-full text-center">
                                            <p className="font-bold text-[#49332b]">{table.table_name}</p>
                                            <p className="text-[10px] text-[#625751] mt-0.5">{table.area_name} • {table.capacity} chỗ</p>
                                        </div>
                                        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold mt-2 ${st.text} bg-white bg-opacity-60`}>
                                            {st.label}
                                        </span>
                                        <button className="mt-2 w-full rounded bg-white py-1 text-[11px] font-bold text-[#625751] shadow-sm hover:bg-gray-50">
                                            {table.status === 'AVAILABLE' ? 'Mở bàn' : 'Xem bàn'}
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* PENDING ORDERS */}
                    <div className="rounded-xl border border-[#E9DFD8] bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-[#E9DFD8] px-5 py-4 flex justify-between items-center bg-[#fbfaf9]">
                            <h3 className="font-bold text-[#49332b]">Đơn hàng cần xử lý</h3>
                            <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">Sắp có</span>
                        </div>
                        <div className="p-0">
                            <ul className="divide-y divide-[#E9DFD8]">
                                {mockOrders.map(order => (
                                    <li key={order.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-[#49332b]">{order.table_name} <span className="text-xs text-[#958981] font-normal ml-2">#{order.id}</span></p>
                                            <p className="text-xs text-[#625751] mt-1">{order.items_count} món • {order.total_amount.toLocaleString()} ₫</p>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-2">
                                            <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                                                order.status === 'PREPARING' ? 'bg-amber-100 text-amber-700' :
                                                order.status === 'PENDING' ? 'bg-blue-100 text-blue-700' :
                                                'bg-emerald-100 text-emerald-700'
                                            }`}>
                                                {order.status === 'PREPARING' ? 'Đang pha chế' : order.status === 'PENDING' ? 'Chờ xác nhận' : 'Sẵn sàng'}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* RIGHT 1/3 */}
                <div className="space-y-6">
                    {/* DAILY PERFORMANCE */}
                    <div className="rounded-xl border border-[#E9DFD8] bg-white shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp size={18} className="text-[#604238]" />
                            <h3 className="font-bold text-[#49332b]">Hiệu suất ca làm</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-[#625751]">Đã xử lý</span>
                                    <span className="font-bold text-[#49332b]">18 đơn</span>
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-gray-100">
                                    <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: '75%' }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-[#625751]">Bàn đã phục vụ</span>
                                    <span className="font-bold text-[#49332b]">12 bàn</span>
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-gray-100">
                                    <div className="h-1.5 rounded-full bg-blue-500" style={{ width: '60%' }}></div>
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center rounded-lg bg-gray-50 p-3 mt-4">
                                <div className="flex items-center gap-2">
                                    <Clock size={16} className="text-[#958981]" />
                                    <span className="text-xs text-[#625751]">T.gian xử lý TB</span>
                                </div>
                                <span className="font-bold text-[#49332b]">7 phút</span>
                            </div>
                        </div>
                    </div>

                    {/* STAFF NOTICE */}
                    <div className="rounded-xl border border-[#E9DFD8] bg-[#fbfaf9] shadow-sm overflow-hidden">
                        <div className="border-b border-[#E9DFD8] bg-[#f4ddd3] px-5 py-3 flex items-center gap-2 text-[#9c513d]">
                            <Info size={18} />
                            <h3 className="font-bold">Lưu ý trong ca</h3>
                        </div>
                        <div className="p-5">
                            <ul className="space-y-3 text-sm text-[#49332b]">
                                <li className="flex items-start gap-2">
                                    <span className="mt-1.5 block h-1.5 w-1.5 rounded-full bg-[#9c513d] flex-shrink-0"></span>
                                    <span>12:00 - 13:30 dự kiến đông khách. Hãy chuẩn bị sẵn đá và ly.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1.5 block h-1.5 w-1.5 rounded-full bg-[#9c513d] flex-shrink-0"></span>
                                    <span>Bàn T06 đang tạm ngưng sử dụng để sửa ghế.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1.5 block h-1.5 w-1.5 rounded-full bg-[#9c513d] flex-shrink-0"></span>
                                    <span>Kiểm tra dọn dẹp khu vực sân vườn trước 14:00.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1.5 block h-1.5 w-1.5 rounded-full bg-[#9c513d] flex-shrink-0"></span>
                                    <span>Trà đào cam sả đang tạm hết, thông báo khách khi order.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
