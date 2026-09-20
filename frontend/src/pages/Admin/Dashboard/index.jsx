import React from "react";

import {
    Armchair,
    BrainCircuit,
    ChevronRight,
    CircleDollarSign,
    Clock3,
    Coffee,
    Eye,
    PackageOpen,
    ShoppingBag,
    Sparkles,
    TrendingUp,
    TriangleAlert,
    UserRoundCheck,
    Users,
} from "lucide-react";

import {
    Area,
    AreaChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

/* ================================
   DATA
================================ */

const revenueData = [
    { time: "08:00", value: 4.5 },
    { time: "09:00", value: 6.8 },
    { time: "10:00", value: 8.2 },
    { time: "11:00", value: 5.9 },
    { time: "12:00", value: 4.7 },
    { time: "13:00", value: 5.4 },
    { time: "14:00", value: 6.3 },
    { time: "15:00", value: 7.1 },
    { time: "16:00", value: 6.2 },
    { time: "17:00", value: 5.8 },
    { time: "18:00", value: 6.7 },
    { time: "19:00", value: 7.5 },
];

const pieData = [
    {
        name: "Hoàn thành",
        value: 75,
        color: "#468263",
    },
    {
        name: "Đang pha chế",
        value: 25,
        color: "#d19961",
    },
    {
        name: "Chờ xác nhận",
        value: 16,
        color: "#d8c9bd",
    },
    {
        name: "Đã hủy",
        value: 10,
        color: "#cf6d64",
    },
];

const statistics = [
    {
        title: "Doanh thu hôm nay",
        value: "12.450.000 ₫",
        info: "+12,5%",
        icon: CircleDollarSign,
        type: "success",
    },
    {
        title: "Đơn hàng hôm nay",
        value: "126",
        info: "+8,2%",
        icon: ShoppingBag,
        type: "success",
    },
    {
        title: "Bàn đang trống",
        value: "18/25",
        info: "72%",
        icon: Armchair,
        type: "success",
    },
    {
        title: "Tổng khách hàng",
        value: "1.560",
        info: "+6,4%",
        icon: Users,
        type: "success",
    },
    {
        title: "Nguyên liệu sắp hết",
        value: "05",
        info: "Cần xử lý",
        icon: TriangleAlert,
        type: "danger",
    },
    {
        title: "Nhân viên đang làm",
        value: "08",
        info: "Hôm nay",
        icon: UserRoundCheck,
        type: "success",
    },
];

const tableData = [
    ["T01", "2 người", "Đang dùng", "occupied"],
    ["T02", "4 người", "Trống", "free"],
    ["T03", "4 người", "Đặt trước", "reserved"],
    ["T04", "2 người", "Đang dùng", "occupied"],
    ["T05", "6 người", "Trống", "free"],
    ["T06", "4 người", "Trống", "free"],
    ["T07", "2 người", "Đặt trước", "reserved"],
    ["T08", "4 người", "Đang dùng", "occupied"],
];

const orders = [
    [
        "#CF1024",
        "Nguyễn An",
        "T05",
        "185.000 ₫",
        "Hoàn thành",
        "success",
        "10:35",
    ],
    [
        "#CF1025",
        "Lê Minh Anh",
        "T02",
        "95.000 ₫",
        "Đang pha chế",
        "warning",
        "10:42",
    ],
    [
        "#CF1026",
        "Trần Thanh Hà",
        "Online",
        "220.000 ₫",
        "Chờ xác nhận",
        "pending",
        "10:46",
    ],
    [
        "#CF1027",
        "Phạm Quốc Bảo",
        "T08",
        "145.000 ₫",
        "Hoàn thành",
        "success",
        "10:51",
    ],
    [
        "#CF1028",
        "Hoàng Gia Huy",
        "T12",
        "310.000 ₫",
        "Đã hủy",
        "danger",
        "11:02",
    ],
];

const products = [
    ["Cà phê muối", "152 ly", "5.320.000 ₫"],
    ["Cà phê sữa", "131 ly", "3.930.000 ₫"],
    ["Matcha Latte", "109 ly", "4.360.000 ₫"],
    ["Trà đào cam sả", "97 ly", "3.395.000 ₫"],
];

const stocks = [
    ["Sữa tươi", "5 lít", 30],
    ["Hạt cà phê", "2.5 kg", 20],
    ["Bột Matcha", "800 g", 35],
];

const employees = [
    ["Nguyễn Văn An", "Barista", "08:02"],
    ["Lê Thanh Hương", "Thu ngân", "07:55"],
    ["Trần Gia Minh", "Phục vụ", "08:05"],
];

/* ================================
   CARD COMPONENT
================================ */

const Card = ({
    children,
    className = "",
}) => {
    return (
        <div
            className={`
        rounded-xl border border-[#e9dfd8]
        bg-white p-4
        shadow-[0_4px_18px_rgba(75,52,42,0.04)]
        ${className}
      `}
        >
            {children}
        </div>
    );
};

/* ================================
   DASHBOARD
================================ */

const Dashboard = () => {
    return (
        <div className="mx-auto max-w-[1600px]">

            {/* TITLE */}
            <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-xl font-bold text-[#302723]">
                        Tổng quan hoạt động
                    </h1>

                    <p className="mt-1 text-[11px] text-[#94877f]">
                        Theo dõi tình hình kinh doanh và vận hành quán Coffee hôm nay.
                    </p>
                </div>

                <div className="flex gap-2">
                    <button className="rounded-lg border border-[#e4dbd5] bg-white px-4 py-2 text-xs font-medium">
                        Hôm nay
                    </button>

                    <button className="flex items-center gap-2 rounded-lg bg-[#604238] px-4 py-2 text-xs font-semibold text-white">
                        <TrendingUp size={16} />
                        Xem báo cáo
                    </button>
                </div>
            </div>

            {/* STATISTICS */}
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                {statistics.map((item) => {
                    const Icon = item.icon;

                    return (
                        <Card key={item.title}>
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f2e7e1] text-[#684a3e]">
                                    <Icon size={18} />
                                </div>

                                <span
                                    className={`
                    rounded-md px-2 py-1 text-[8px] font-semibold
                    ${item.type === "danger"
                                            ? "bg-red-50 text-red-500"
                                            : "bg-emerald-50 text-emerald-700"
                                        }
                  `}
                                >
                                    {item.info}
                                </span>
                            </div>

                            <p className="text-[9px] text-[#978a82]">
                                {item.title}
                            </p>

                            <h3 className="mt-1 text-lg font-bold text-[#302723]">
                                {item.value}
                            </h3>
                        </Card>
                    );
                })}
            </div>

            {/* CHARTS */}
            <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-[2.2fr_0.8fr]">

                {/* REVENUE */}
                <Card>
                    <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row">
                        <div>
                            <h3 className="text-sm font-bold">
                                Tổng quan doanh thu
                            </h3>

                            <p className="mt-1 text-[9px] text-[#998c84]">
                                Biến động doanh thu theo thời gian.
                            </p>
                        </div>

                        <div className="flex self-start rounded-lg border border-[#e8ded8] p-1">
                            {["Ngày", "Tuần", "Tháng", "Năm"].map(
                                (item) => (
                                    <button
                                        key={item}
                                        className={`
                      rounded-md px-2.5 py-1 text-[9px]
                      ${item === "Tháng"
                                                ? "bg-[#604238] text-white"
                                                : "text-[#94877f]"
                                            }
                    `}
                                    >
                                        {item}
                                    </button>
                                )
                            )}
                        </div>
                    </div>

                    <div className="mb-4 flex flex-wrap gap-8">
                        <div>
                            <span className="text-[9px] text-[#968981]">
                                Doanh thu
                            </span>

                            <p className="mt-1 text-xs font-bold">
                                126.500.000 ₫
                            </p>
                        </div>

                        <div>
                            <span className="text-[9px] text-[#968981]">
                                Tổng đơn
                            </span>

                            <p className="mt-1 text-xs font-bold">
                                1.236
                            </p>
                        </div>

                        <div>
                            <span className="text-[9px] text-[#968981]">
                                TB / đơn
                            </span>

                            <p className="mt-1 text-xs font-bold">
                                102.346 ₫
                            </p>
                        </div>
                    </div>

                    <div className="h-[230px]">
                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient
                                        id="revenueColor"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="#765548"
                                            stopOpacity={0.25}
                                        />

                                        <stop
                                            offset="95%"
                                            stopColor="#765548"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>

                                <CartesianGrid
                                    vertical={false}
                                    stroke="#eee6e1"
                                    strokeDasharray="3 3"
                                />

                                <XAxis
                                    dataKey="time"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{
                                        fontSize: 9,
                                    }}
                                />

                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{
                                        fontSize: 9,
                                    }}
                                />

                                <Tooltip />

                                <Area
                                    dataKey="value"
                                    type="monotone"
                                    stroke="#765548"
                                    strokeWidth={2.5}
                                    fill="url(#revenueColor)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* ORDER STATUS */}
                <Card>
                    <h3 className="text-sm font-bold">
                        Trạng thái đơn hàng
                    </h3>

                    <p className="mt-1 text-[9px] text-[#998c84]">
                        Hôm nay
                    </p>

                    <div className="relative h-[180px]">
                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    dataKey="value"
                                    innerRadius={53}
                                    outerRadius={73}
                                    paddingAngle={3}
                                >
                                    {pieData.map((item) => (
                                        <Cell
                                            key={item.name}
                                            fill={item.color}
                                        />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>

                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                            <strong className="text-xl">
                                126
                            </strong>

                            <span className="text-[9px] text-[#978a82]">
                                Đơn hàng
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {pieData.map((item) => (
                            <div
                                key={item.name}
                                className="flex items-center justify-between border-b border-[#f0ebe8] pb-2 text-[9px]"
                            >
                                <div className="flex items-center gap-2">
                                    <span
                                        className="h-2 w-2 rounded-full"
                                        style={{
                                            backgroundColor: item.color,
                                        }}
                                    />

                                    {item.name}
                                </div>

                                <strong>
                                    {item.value}
                                </strong>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* AI */}
            <Card className="mb-4 bg-gradient-to-br from-white to-[#fcf7f4]">
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#604238] text-white">
                        <BrainCircuit size={21} />
                    </div>

                    <div>
                        <h3 className="text-sm font-bold">
                            AI Business Insights
                        </h3>

                        <p className="mt-1 text-[9px] text-[#958981]">
                            Phân tích và đề xuất tự động dựa trên dữ liệu kinh doanh.
                        </p>
                    </div>

                    <span className="ml-auto hidden items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-[8px] font-semibold text-emerald-700 md:flex">
                        <Sparkles size={12} />
                        AI đang hoạt động
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                    <div className="rounded-xl border border-[#eadfd8] bg-[#fbf8f6] p-4">
                        <p className="text-[9px] text-[#958981]">
                            Dự báo doanh thu ngày mai
                        </p>

                        <h3 className="mt-2 text-lg font-bold">
                            14.200.000 ₫
                        </h3>

                        <p className="mt-2 text-[9px] font-medium text-emerald-700">
                            ↑ 8,4% so với hôm nay
                        </p>
                    </div>

                    <div className="rounded-xl border border-[#eadfd8] bg-[#fbf8f6] p-4">
                        <p className="text-[9px] text-[#958981]">
                            Hành vi khách hàng
                        </p>

                        <h3 className="mt-2 text-lg font-bold">
                            Sinh viên · 42%
                        </h3>

                        <p className="mt-2 text-[9px] text-[#958981]">
                            Giờ cao điểm: 18:00 - 21:00
                        </p>
                    </div>

                    <div className="rounded-xl border border-red-100 bg-[#fff8f5] p-4">
                        <p className="text-[9px] text-[#958981]">
                            Dự báo kho
                        </p>

                        <h3 className="mt-2 text-sm font-bold">
                            Sữa có thể hết sau 2 ngày
                        </h3>

                        <p className="mt-2 text-[9px] text-red-500">
                            Đề xuất nhập thêm 20 lít.
                        </p>
                    </div>
                </div>
            </Card>

            {/* TABLE STATUS */}
            <Card className="mb-4">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold">
                            Trạng thái bàn phục vụ
                        </h3>

                        <p className="mt-1 text-[9px] text-[#958981]">
                            Theo dõi nhanh tình trạng bàn.
                        </p>
                    </div>

                    <button className="flex items-center text-[9px] font-semibold text-[#69483c]">
                        Xem tất cả
                        <ChevronRight size={15} />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
                    {tableData.map(
                        ([name, people, status, type]) => (
                            <div
                                key={name}
                                className={`
                  flex min-h-[100px]
                  flex-col items-center justify-center
                  gap-1 rounded-lg border
                  ${type === "free"
                                        ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                                        : type === "reserved"
                                            ? "border-amber-100 bg-amber-50 text-amber-700"
                                            : "border-[#eadbd3] bg-[#f6ece7] text-[#704b3f]"
                                    }
                `}
                            >
                                <Armchair size={20} />

                                <strong className="text-xs">
                                    {name}
                                </strong>

                                <span className="text-[8px]">
                                    {people}
                                </span>

                                <small className="text-[8px] font-semibold">
                                    {status}
                                </small>
                            </div>
                        )
                    )}
                </div>
            </Card>

            {/* ORDERS */}
            <Card className="mb-4">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold">
                            Đơn hàng / Hóa đơn gần đây
                        </h3>

                        <p className="mt-1 text-[9px] text-[#958981]">
                            Các giao dịch mới nhất hôm nay.
                        </p>
                    </div>

                    <button className="flex items-center text-[9px] font-semibold text-[#69483c]">
                        Xem tất cả
                        <ChevronRight size={15} />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-[760px] w-full border-collapse">
                        <thead>
                            <tr className="bg-[#faf7f5] text-left">
                                {[
                                    "Mã đơn",
                                    "Khách hàng",
                                    "Bàn",
                                    "Tổng tiền",
                                    "Trạng thái",
                                    "Thời gian",
                                    "",
                                ].map((item) => (
                                    <th
                                        key={item}
                                        className="border-b border-[#eae1dc] px-3 py-3 text-[9px] font-semibold text-[#94877f]"
                                    >
                                        {item}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {orders.map(
                                ([
                                    id,
                                    customer,
                                    table,
                                    total,
                                    status,
                                    type,
                                    time,
                                ]) => (
                                    <tr
                                        key={id}
                                        className="border-b border-[#f2ece8]"
                                    >
                                        <td className="px-3 py-3 text-[10px] font-bold">
                                            {id}
                                        </td>

                                        <td className="px-3 py-3 text-[10px]">
                                            {customer}
                                        </td>

                                        <td className="px-3 py-3 text-[10px]">
                                            {table}
                                        </td>

                                        <td className="px-3 py-3 text-[10px] font-semibold">
                                            {total}
                                        </td>

                                        <td className="px-3 py-3">
                                            <span
                                                className={`
                          rounded-full px-2 py-1
                          text-[8px] font-semibold
                          ${type === "success"
                                                        ? "bg-emerald-50 text-emerald-700"
                                                        : type === "warning"
                                                            ? "bg-amber-50 text-amber-700"
                                                            : type === "danger"
                                                                ? "bg-red-50 text-red-600"
                                                                : "bg-gray-100 text-gray-600"
                                                    }
                        `}
                                            >
                                                {status}
                                            </span>
                                        </td>

                                        <td className="px-3 py-3 text-[10px]">
                                            {time}
                                        </td>

                                        <td className="px-3 py-3">
                                            <button className="flex h-7 w-7 items-center justify-center rounded-md border border-[#e7ddd7] hover:bg-[#f8f4f1]">
                                                <Eye size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* BOTTOM */}
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">

                {/* PRODUCTS */}
                <Card>
                    <h3 className="text-sm font-bold">
                        Đồ uống bán chạy
                    </h3>

                    <p className="mt-1 text-[9px] text-[#958981]">
                        Top sản phẩm hôm nay.
                    </p>

                    <div className="mt-3">
                        {products.map(
                            ([name, sold, revenue], index) => (
                                <div
                                    key={name}
                                    className="flex items-center gap-3 border-b border-[#f0ebe8] py-3"
                                >
                                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#f2e6e0] text-[9px] font-bold text-[#65473c]">
                                        {index + 1}
                                    </div>

                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f8f3ef] text-[#68483c]">
                                        <Coffee size={17} />
                                    </div>

                                    <div className="flex-1">
                                        <p className="text-[10px] font-semibold">
                                            {name}
                                        </p>

                                        <p className="mt-0.5 text-[8px] text-[#968981]">
                                            {sold} đã bán
                                        </p>
                                    </div>

                                    <strong className="text-[9px]">
                                        {revenue}
                                    </strong>
                                </div>
                            )
                        )}
                    </div>
                </Card>

                {/* STOCK */}
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold">
                                Cảnh báo kho
                            </h3>

                            <p className="mt-1 text-[9px] text-[#958981]">
                                Nguyên liệu cần bổ sung.
                            </p>
                        </div>

                        <TriangleAlert
                            size={20}
                            className="text-red-500"
                        />
                    </div>

                    <div className="mt-3">
                        {stocks.map(
                            ([name, amount, percent]) => (
                                <div
                                    key={name}
                                    className="border-b border-[#f0ebe8] py-3"
                                >
                                    <div className="mb-2 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <PackageOpen size={16} />

                                            <strong className="text-[10px]">
                                                {name}
                                            </strong>
                                        </div>

                                        <span className="text-[8px] font-medium text-red-500">
                                            Còn {amount}
                                        </span>
                                    </div>

                                    <div className="h-1.5 overflow-hidden rounded-full bg-red-100">
                                        <div
                                            className="h-full rounded-full bg-red-400"
                                            style={{
                                                width: `${percent}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </Card>

                {/* EMPLOYEE */}
                <Card>
                    <h3 className="text-sm font-bold">
                        Nhân viên hôm nay
                    </h3>

                    <p className="mt-1 text-[9px] text-[#958981]">
                        8 nhân viên đang làm việc.
                    </p>

                    <div className="mt-3">
                        {employees.map(
                            ([name, role, time]) => (
                                <div
                                    key={name}
                                    className="flex items-center gap-3 border-b border-[#f0ebe8] py-3"
                                >
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eee3dd] text-xs font-bold text-[#65473c]">
                                        {name.split(" ").pop()[0]}
                                    </div>

                                    <div className="flex-1">
                                        <p className="text-[10px] font-semibold">
                                            {name}
                                        </p>

                                        <p className="mt-0.5 text-[8px] text-[#968981]">
                                            {role}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-1 text-[8px] font-medium text-emerald-700">
                                        <Clock3 size={13} />
                                        {time}
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;