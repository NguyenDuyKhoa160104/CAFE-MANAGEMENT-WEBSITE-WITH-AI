import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    CircleCheck,
    Coffee,
    ReceiptText,
    CircleCheckBig,
    Armchair,
    UserCircle,
    Info,
    TrendingUp,
} from "lucide-react";
import useStaffAuth from "../../../hooks/useStaffAuth";
import { dashboardService } from "../../../services/staff/dashboard.service";
import { toast } from "react-hot-toast";

export default function StaffDashboard() {
    const navigate = useNavigate();
    const { staff, hasPermission } = useStaffAuth();
    
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [elapsedTime, setElapsedTime] = useState("");

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await dashboardService.getDashboard();
            setData(res.data);
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi tải dashboard");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        let timer;
        if (data?.attendance && data.attendance.check_in_at && !data.attendance.check_out_at) {
            const calculateElapsed = () => {
                const start = new Date(data.attendance.check_in_at).getTime();
                const now = new Date().getTime();
                const diff = Math.max(0, now - start);
                
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                setElapsedTime(`${hours} giờ ${minutes} phút`);
            };
            
            calculateElapsed();
            timer = setInterval(calculateElapsed, 60000); // update every minute
        } else if (data?.attendance && data.attendance.check_out_at) {
            const hours = Math.floor(data.attendance.worked_minutes / 60);
            const minutes = data.attendance.worked_minutes % 60;
            setElapsedTime(`${hours} giờ ${minutes} phút`);
        }
        
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [data?.attendance]);

    const handleCheckIn = async () => {
        try {
            await dashboardService.checkIn({ assignment_id: data?.shift?.assignment_id });
            toast.success("Chấm công vào thành công");
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi chấm công");
        }
    };

    const handleCheckOut = async () => {
        if (!window.confirm("Bạn có chắc muốn chấm công ra? Hành động này không thể hoàn tác trong ca này.")) return;
        try {
            await dashboardService.checkOut({ assignment_id: data?.shift?.assignment_id });
            toast.success("Chấm công ra thành công");
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi chấm công");
        }
    };

    if (loading) {
        return <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9c513d]"></div></div>;
    }

    if (!data) {
        return (
            <div className="p-4 sm:p-6 pb-20 text-center">
                <p className="text-red-500 mb-4">Không thể tải dữ liệu Dashboard.</p>
                <button onClick={fetchData} className="px-4 py-2 bg-[#9c513d] text-white rounded-lg">Thử lại</button>
            </div>
        );
    }

    const formatTime = (timeString) => {
        if (!timeString) return "-";
        return new Date(timeString).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div className="p-4 sm:p-6 pb-20">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#49332b]">
                    Xin chào, {staff?.full_name?.split(" ").pop() || "Nhân viên"} 👋
                </h1>
                <p className="mt-1 text-sm text-[#958981]">
                    {staff?.role?.name || staff?.position || "Nhân viên"}
                </p>
            </div>

            {/* CURRENT SHIFT CARD */}
            <div className="mb-6 flex flex-col md:flex-row gap-4 rounded-xl border border-[#E9DFD8] bg-white p-5 shadow-sm">
                <div className="flex-1">
                    <h3 className="font-bold text-[#49332b] mb-1">Ca làm việc hiện tại</h3>
                    {data.shift ? (
                        <div className="flex items-center gap-3">
                            <span className="text-lg font-semibold text-[#604238]">
                                {data.shift.name} ({data.shift.start_time?.slice(0,5)} - {data.shift.end_time?.slice(0,5)})
                            </span>
                            {!data.attendance ? (
                                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">Chưa bắt đầu</span>
                            ) : !data.attendance.check_out_at ? (
                                <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">Đang trong ca</span>
                            ) : (
                                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">Đã hoàn thành</span>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-500">Chưa có lịch làm việc hôm nay.</p>
                    )}
                </div>
                
                {data.shift && (
                    <div className="flex flex-1 md:justify-end gap-6 text-sm text-[#625751] items-center">
                        {data.attendance && (
                            <>
                                <div>
                                    <p className="text-[11px] font-semibold text-[#958981] uppercase tracking-wider">Check-in</p>
                                    <p className="font-medium text-[#49332b]">{formatTime(data.attendance.check_in_at)}</p>
                                </div>
                                {data.attendance.check_out_at && (
                                    <div>
                                        <p className="text-[11px] font-semibold text-[#958981] uppercase tracking-wider">Check-out</p>
                                        <p className="font-medium text-[#49332b]">{formatTime(data.attendance.check_out_at)}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-[11px] font-semibold text-[#958981] uppercase tracking-wider">Thời gian</p>
                                    <p className="font-medium text-[#49332b]">{elapsedTime || "-"}</p>
                                </div>
                            </>
                        )}
                        
                        <div>
                            {!data.attendance && hasPermission('attendance.check_in') && (
                                <button onClick={handleCheckIn} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition">
                                    Chấm công vào
                                </button>
                            )}
                            {data.attendance && !data.attendance.check_out_at && hasPermission('attendance.check_out') && (
                                <button onClick={handleCheckOut} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 transition">
                                    Chấm công ra
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* SUMMARY CARDS */}
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="rounded-xl border border-[#E9DFD8] bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#958981]">Bàn trống</p>
                            <h3 className="mt-1 text-2xl font-bold text-[#49332b]">{data.table_summary?.available || 0}</h3>
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
                            <h3 className="mt-1 text-2xl font-bold text-[#49332b]">{data.table_summary?.occupied || 0}</h3>
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
                            <h3 className="mt-1 text-2xl font-bold text-[#49332b]">{data.order_summary?.active_count || 0}</h3>
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
                            <h3 className="mt-1 text-2xl font-bold text-[#49332b]">{data.order_summary?.completed_in_shift || 0}</h3>
                            <p className="mt-1 text-xs text-[#958981] font-medium">{data.attendance ? "Trong ca hiện tại" : "Hôm nay"}</p>
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
                    {hasPermission('tables.view') ? (
                        <button onClick={() => navigate("/staff/tables")} className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white p-4 border border-[#E9DFD8] hover:border-[#604238] hover:shadow-sm transition">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4ddd3] text-[#9c513d]">
                                <Armchair size={20} />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-[#49332b]">Sơ đồ bàn</p>
                                <p className="text-[10px] text-[#958981] mt-0.5">Xem & điều phối</p>
                            </div>
                        </button>
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-gray-50 p-4 border border-gray-200 opacity-50 cursor-not-allowed" title="Bạn chưa được cấp quyền">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-500">
                                <Armchair size={20} />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-gray-500">Sơ đồ bàn</p>
                            </div>
                        </div>
                    )}

                    {/* Menu view does not strictly need permission in API, but let's assume it's always accessible or check menu.view if you have it */}
                    <button onClick={() => navigate("/staff/menu")} className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white p-4 border border-[#E9DFD8] hover:border-[#604238] hover:shadow-sm transition">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4ddd3] text-[#9c513d]">
                            <Coffee size={20} />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-[#49332b]">Thực đơn</p>
                            <p className="text-[10px] text-[#958981] mt-0.5">Món đang phục vụ</p>
                        </div>
                    </button>

                    {hasPermission('orders.view') ? (
                        <button onClick={() => navigate("/staff/orders")} className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white p-4 border border-[#E9DFD8] hover:border-[#604238] hover:shadow-sm transition">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4ddd3] text-[#9c513d]">
                                <ReceiptText size={20} />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-[#49332b]">Đơn hàng</p>
                                <p className="text-[10px] text-[#958981] mt-0.5">Quản lý đơn xử lý</p>
                            </div>
                        </button>
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-gray-50 p-4 border border-gray-200 opacity-50 cursor-not-allowed" title="Bạn chưa được cấp quyền xem đơn hàng">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-500">
                                <ReceiptText size={20} />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-gray-500">Đơn hàng</p>
                            </div>
                        </div>
                    )}

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
                            {hasPermission('tables.view') && (
                                <button onClick={() => navigate("/staff/tables")} className="text-xs font-semibold text-[#604238] hover:underline">
                                    Xem tất cả
                                </button>
                            )}
                        </div>
                        <div className="p-5 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                            {data.table_summary?.tables?.slice(0, 8).map((table) => {
                                const statusMap = {
                                    AVAILABLE: { label: "Bàn trống", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
                                    OCCUPIED: { label: "Đang phục vụ", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
                                    RESERVED: { label: "Đã đặt", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
                                    INACTIVE: { label: "Tạm ngưng", bg: "bg-gray-50", text: "text-gray-500", border: "border-gray-200" },
                                };
                                const st = statusMap[table.status] || statusMap['AVAILABLE'];

                                return (
                                    <div key={table.id} className={`rounded-xl border p-3 flex flex-col items-center text-center justify-between h-[120px] ${st.bg} ${st.border}`}>
                                        <div className="w-full text-center">
                                            <p className="font-bold text-[#49332b]">{table.name}</p>
                                            <p className="text-[10px] text-[#625751] mt-0.5">{table.capacity} chỗ</p>
                                        </div>
                                        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold mt-2 ${st.text} bg-white bg-opacity-60`}>
                                            {st.label}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* RIGHT 1/3 */}
                <div className="space-y-6">
                    {/* DAILY PERFORMANCE */}
                    <div className="rounded-xl border border-[#E9DFD8] bg-white shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp size={18} className="text-[#604238]" />
                            <h3 className="font-bold text-[#49332b]">Hiệu suất {data.attendance ? "ca làm" : "hôm nay"}</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-[#625751]">Đã xử lý</span>
                                    <span className="font-bold text-[#49332b]">{data.performance?.processed_orders || 0} đơn</span>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-[#625751]">Bàn đã phục vụ</span>
                                    <span className="font-bold text-[#49332b]">{data.performance?.served_tables || 0} bàn</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* STAFF NOTICE */}
                    <div className="rounded-xl border border-[#E9DFD8] bg-[#fbfaf9] shadow-sm overflow-hidden">
                        <div className="border-b border-[#E9DFD8] bg-[#f4ddd3] px-5 py-3 flex items-center gap-2 text-[#9c513d]">
                            <Info size={18} />
                            <h3 className="font-bold">Lưu ý</h3>
                        </div>
                        <div className="p-5">
                            <ul className="space-y-3 text-sm text-[#49332b]">
                                <li className="flex items-start gap-2">
                                    <span className="mt-1.5 block h-1.5 w-1.5 rounded-full bg-[#9c513d] flex-shrink-0"></span>
                                    <span>Luôn đảm bảo thái độ phục vụ chuyên nghiệp.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1.5 block h-1.5 w-1.5 rounded-full bg-[#9c513d] flex-shrink-0"></span>
                                    <span>Kiểm tra lại order cẩn thận trước khi lên món.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
