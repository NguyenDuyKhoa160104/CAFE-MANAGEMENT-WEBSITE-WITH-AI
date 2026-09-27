import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Armchair, ArrowUpRight, BadgePercent, Bot, CalendarCheck, CircleDollarSign, Clock3, PackageSearch, ReceiptText, RefreshCw, ShoppingBag, TriangleAlert, Users, WalletCards } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import useAdminAuth from '../../../hooks/useAdminAuth';
import { getDashboard } from '../../../services/admin/dashboard.service';

const money = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
const number = (value) => new Intl.NumberFormat('vi-VN').format(value);
const time = (value) => new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
const orderLabels = { PENDING: 'Chờ xác nhận', CONFIRMED: 'Đã xác nhận', PREPARING: 'Đang pha chế', READY: 'Sẵn sàng', SERVED: 'Đã phục vụ', COMPLETED: 'Hoàn thành', CANCELLED: 'Đã hủy' };
const reservationLabels = { PENDING: 'Chờ xử lý', CONFIRMED: 'Đã xác nhận', CHECKED_IN: 'Đã nhận bàn', COMPLETED: 'Hoàn thành', CANCELLED: 'Đã hủy', NO_SHOW: 'Không đến' };
const statusColors = { PENDING: '#c9b9ac', CONFIRMED: '#b19c83', PREPARING: '#c19262', READY: '#8c8070', SERVED: '#776658', COMPLETED: '#468263', CANCELLED: '#b6665d' };
const rangeOptions = { TODAY: 'Hôm nay', '7_DAYS': '7 ngày qua', '30_DAYS': '30 ngày qua', THIS_MONTH: 'Tháng này', CUSTOM: 'Tùy chọn' };
const inputClass = 'rounded-lg border border-[#E9DFD8] bg-white px-3 py-2 text-sm focus:outline-[#604238]';

function Card({ children, className = '' }) {
    return <section className={`min-w-0 rounded-xl border border-[#E9DFD8] bg-white p-4 shadow-[0_4px_18px_rgba(75,52,42,0.04)] ${className}`}>{children}</section>;
}
function Title({ icon: Icon, children, to, link = 'Xem tất cả', note }) {
    return <div className="mb-4 flex items-start justify-between gap-3"><div><h2 className="flex items-center gap-2 text-sm font-bold"><Icon size={17} className="shrink-0 text-[#604238]" />{children}</h2>{note && <p className="mt-1 text-xs text-[#958981]">{note}</p>}</div>{to && <Link to={to} className="flex shrink-0 items-center gap-1 text-xs text-[#604238] hover:underline">{link}<ArrowUpRight size={13} /></Link>}</div>;
}
function Counts({ data, labels }) {
    return <dl className="space-y-2">{Object.entries(labels).map(([key, label]) => <div key={key} className="flex justify-between gap-3 border-b border-[#F7F4F1] pb-2 text-xs"><dt className="text-[#958981]">{label}</dt><dd className="font-semibold">{number(data[key])}</dd></div>)}</dl>;
}
function Empty({ children = 'Chưa có dữ liệu trong khoảng thời gian này.' }) {
    return <p className="rounded-lg bg-[#F7F4F1] p-5 text-center text-sm text-[#958981]">{children}</p>;
}
function RevenueTooltip({ active, payload }) {
    if (!active || !payload?.length) return null;
    const point = payload[0].payload;
    return <div className="rounded-lg border border-[#E9DFD8] bg-white p-3 text-xs shadow"><p className="font-semibold">{point.date}</p><p className="mt-1">Doanh thu: {money(point.revenue)}</p><p>Số đơn: {number(point.orders)}</p></div>;
}
function Skeleton() {
    return <div role="status" aria-label="Đang tải Dashboard" className="animate-pulse space-y-4"><div className="grid grid-cols-2 gap-4 xl:grid-cols-4">{Array.from({ length: 4 }, (_, i) => <div key={i} className="h-32 rounded-xl bg-[#E9DFD8]" />)}</div><div className="h-80 rounded-xl bg-[#E9DFD8]" /><div className="h-64 rounded-xl bg-[#E9DFD8]" /><span className="sr-only">Đang tải dữ liệu</span></div>;
}

export default function Dashboard() {
    const { admin } = useAdminAuth();
    const [filters, setFilters] = useState({ range: 'TODAY' });
    const [draft, setDraft] = useState({ range: 'TODAY', from: '', to: '' });
    const [refresh, setRefresh] = useState(0);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
        const controller = new AbortController();
        getDashboard(filters, controller.signal).then((response) => {
            if (!controller.signal.aborted) { setData(response.data); setError(''); }
        }).catch((err) => {
            if (!controller.signal.aborted) setError(err.response?.status === 422 ? Object.values(err.response.data.errors ?? {}).flat().join(' ') : 'Không thể tải dữ liệu Dashboard.');
        }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => controller.abort();
    }, [filters, refresh]);
    const reload = () => { setLoading(true); setError(''); setRefresh((n) => n + 1); };
    const selectRange = (value) => {
        setDraft((current) => ({ ...current, range: value }));
        if (value !== 'CUSTOM') { setLoading(true); setError(''); setFilters({ range: value }); }
    };
    const applyCustom = (event) => {
        event.preventDefault(); setLoading(true); setError(''); setFilters({ ...draft });
    };
    const pie = data ? Object.entries(data.orders.statuses).map(([key, value]) => ({ name: orderLabels[key], value, color: statusColors[key] })) : [];
    const cards = data ? [
        { title: 'Doanh thu', value: money(data.summary.revenue), icon: CircleDollarSign, to: '/admin/orders', note: 'Thanh toán thành công trong kỳ' },
        { title: 'Đơn hàng', value: number(data.summary.orders), icon: ShoppingBag, to: '/admin/orders', note: 'Đơn được tạo trong kỳ' },
        { title: 'Khách hàng mới', value: number(data.summary.new_customers), icon: Users, to: '/admin/customers', note: 'Đăng ký trong kỳ' },
        { title: 'Giá trị đơn trung bình', value: money(data.summary.average_order_value), icon: ReceiptText, to: '/admin/orders', note: `${number(data.summary.paid_orders)} đơn thanh toán thành công` },
    ] : [];

    return <div className="mx-auto max-w-[1600px] space-y-4 text-[#302723]">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-xl font-bold">Tổng quan hoạt động</h1><p className="mt-1 text-sm text-[#958981]">Xin chào{admin?.full_name ? `, ${admin.full_name}` : ''}. {new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', dateStyle: 'full' }).format(new Date())}</p></div><div className="flex flex-wrap gap-2"><label className="sr-only" htmlFor="dashboard-range">Khoảng thời gian</label><select id="dashboard-range" value={draft.range} onChange={(e) => selectRange(e.target.value)} className={inputClass}>{Object.entries(rangeOptions).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select><button type="button" onClick={reload} disabled={loading} className={`${inputClass} flex items-center gap-2 disabled:opacity-50`}><RefreshCw size={16} className={loading ? 'animate-spin' : ''} />Làm mới</button></div></div>
        {draft.range === 'CUSTOM' && <form onSubmit={applyCustom} className="flex flex-wrap items-end gap-3"><label className="text-xs">Từ ngày<input type="date" required value={draft.from} onChange={(e) => setDraft({ ...draft, from: e.target.value })} className={`${inputClass} mt-1 block`} /></label><label className="text-xs">Đến ngày<input type="date" required min={draft.from} value={draft.to} onChange={(e) => setDraft({ ...draft, to: e.target.value })} className={`${inputClass} mt-1 block`} /></label><button className="rounded-lg bg-[#604238] px-4 py-2 text-sm text-white">Áp dụng</button><span className="text-xs text-[#958981]">Tối đa 366 ngày</span></form>}
        {loading ? <Skeleton /> : error ? <Card><div role="alert" className="flex flex-col items-center gap-3 py-10"><TriangleAlert className="text-[#b6665d]" /><p>{error}</p><button onClick={reload} className="rounded-lg bg-[#604238] px-4 py-2 text-sm text-white">Thử lại</button></div></Card> : data && <>
            <div className="flex flex-wrap justify-between gap-2 text-xs text-[#958981]"><p>Trong khoảng thời gian đã chọn: {data.range.from} — {data.range.to} · Giờ Việt Nam</p><p>Cập nhật lúc {time(data.generated_at)}</p></div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ title, value, icon: Icon, to, note }) => <Link key={title} to={to} className="rounded-xl transition-shadow hover:shadow-md focus-visible:outline-[#604238]"><Card className="h-full"><div className="mb-3 flex justify-between"><Icon size={20} className="text-[#604238]" /><ArrowUpRight size={15} className="text-[#958981]" /></div><p className="text-xs text-[#958981]">{title}</p><p className="mt-1 break-words text-xl font-bold">{value}</p><p className="mt-2 text-xs text-[#958981]">{note}</p></Card></Link>)}</div>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
                <Card><Title icon={CircleDollarSign} note="Thanh toán thành công theo giờ thanh toán; số đơn theo ngày tạo.">Tổng quan doanh thu</Title><div className="mb-4 text-xs text-[#958981]">{data.revenue.comparison_percent === null ? 'Chưa có doanh thu kỳ trước để tính tỷ lệ so sánh.' : <><strong className="text-[#604238]">{data.revenue.comparison_percent > 0 ? '+' : ''}{number(data.revenue.comparison_percent)}%</strong> so với {data.revenue.previous_range.from} — {data.revenue.previous_range.to}</>}</div><div className="h-[260px] w-full min-w-0"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data.charts.revenue} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}><defs><linearGradient id="dashboardRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#765548" stopOpacity={0.25} /><stop offset="100%" stopColor="#765548" stopOpacity={0.02} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#E9DFD8" strokeDasharray="3 3" /><XAxis dataKey="label" tick={{ fontSize: 11 }} minTickGap={24} /><YAxis width={65} tick={{ fontSize: 10 }} tickFormatter={(v) => new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(v)} /><Tooltip content={<RevenueTooltip />} /><Area type="monotone" dataKey="revenue" stroke="#604238" fill="url(#dashboardRevenue)" strokeWidth={2} /></AreaChart></ResponsiveContainer></div>{data.summary.revenue === 0 && <p className="mt-2 text-xs text-[#958981]">Chưa có thanh toán thành công trong kỳ.</p>}</Card>
                <Card><Title icon={ShoppingBag}>Trạng thái đơn hàng</Title>{data.summary.orders > 0 ? <div className="h-[190px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pie.filter((p) => p.value > 0)} dataKey="value" innerRadius={52} outerRadius={75} paddingAngle={2}>{pie.filter((p) => p.value > 0).map((p) => <Cell key={p.name} fill={p.color} />)}</Pie><Tooltip formatter={(value) => number(value)} /></PieChart></ResponsiveContainer></div> : <Empty>Chưa có đơn hàng.</Empty>}<Counts data={data.orders.statuses} labels={orderLabels} /><div className="mt-3 flex flex-wrap gap-3 text-xs text-[#958981]"><span>Tại quán: {number(data.orders.types.DINE_IN)}</span><span>Mang đi: {number(data.orders.types.TAKEAWAY)}</span></div></Card>
            </div>
            <p className="pt-2 text-sm font-semibold">Vận hành · Hiện tại</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Card><Title icon={Armchair} to="/admin/tables" note="Trạng thái bàn hiện tại">Bàn tại quán</Title><Counts data={data.tables} labels={{ AVAILABLE: 'Bàn trống', OCCUPIED: 'Đang phục vụ', RESERVED: 'Đã đặt trước', INACTIVE: 'Ngừng hoạt động' }} /><div className="mt-4 border-t border-[#E9DFD8] pt-4"><Title icon={Users} to="/admin/customers">Khách hàng</Title><Counts data={data.customers} labels={{ total: 'Tổng khách hàng hiện tại', active: 'Đang hoạt động', new: 'Khách mới trong kỳ' }} /></div></Card>
                <Card><Title icon={PackageSearch} to="/admin/inventory" link="Xem kho" note="Tồn kho hiện tại · tất cả nguyên liệu">Cảnh báo nguyên liệu</Title><div className="mb-3 flex flex-wrap gap-3 text-xs"><span className="text-[#b6665d]">Hết hàng: {number(data.inventory.out_of_stock_count)}</span><span>Sắp hết: {number(data.inventory.low_stock_count)}</span><span>Bình thường: {number(data.inventory.normal_stock_count)}</span></div>{data.inventory.low_stock.length ? <ul className="space-y-3">{data.inventory.low_stock.map((item) => <li key={item.id} className="rounded-lg bg-[#F7F4F1] p-3 text-xs"><div className="flex justify-between gap-2"><strong>{item.name}</strong><span className={item.inventory_status === 'OUT' ? 'text-[#b6665d]' : 'text-[#956b3e]'}>{item.inventory_status === 'OUT' ? 'Hết hàng' : 'Sắp hết'}</span></div><p className="mt-1 text-[#958981]">{number(item.current_stock)} / tối thiểu {number(item.minimum_stock)} {({ GRAM: 'g', MILLILITER: 'ml', PIECE: 'cái' })[item.unit]}</p></li>)}</ul> : <Empty>Không có nguyên liệu cần cảnh báo.</Empty>}<div className="mt-4"><Counts data={data.inventory.products} labels={{ selling: 'Sản phẩm đang bán', unavailable: 'Sản phẩm thiếu nguyên liệu', no_recipe: 'Chưa có công thức' }} /></div></Card>
                <Card><Title icon={Clock3} to="/admin/roles?tab=attendance" note={`Hôm nay ${data.attendance.date} · số bản ghi theo ca`}>Chấm công</Title><Counts data={data.attendance.statuses} labels={{ PRESENT: 'Có mặt', LATE: 'Đi trễ', ABSENT: 'Vắng', LEAVE: 'Nghỉ' }} /><p className="mt-3 text-xs text-[#958981]">Ca chưa có bản ghi: {number(data.attendance.unrecorded_assignments)}</p><p className="mt-2 text-xs">Đang trong ca: <strong>{number(data.attendance.working_now)}</strong> / {number(data.attendance.scheduled_now)} nhân viên được xếp ca</p><div className="mt-4 border-t border-[#E9DFD8] pt-3"><Title icon={Users} to="/admin/staffs">Nhân viên · {number(Object.values(data.staff).reduce((a, b) => a + b, 0))}</Title><Counts data={data.staff} labels={{ ACTIVE: 'Đang hoạt động', INACTIVE: 'Ngừng hoạt động', LOCKED: 'Đã khóa' }} /></div></Card>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Card><Title icon={CalendarCheck} to="/admin/reservations" note="Theo ngày đặt bàn trong khoảng đã chọn">Đặt bàn chờ xử lý · {number(data.reservations.statuses.PENDING)}</Title><Counts data={data.reservations.statuses} labels={reservationLabels} />{data.reservations.recent.length > 0 && <ul className="mt-3 space-y-2">{data.reservations.recent.slice(0, 3).map((r) => <li key={r.id} className="text-xs"><Link to="/admin/reservations" className="text-[#604238] hover:underline">{r.reservation_code} · {r.customer_name || 'Chưa có tên'}</Link><p className="text-[#958981]">{r.reservation_at.slice(0, 16)} · {number(r.party_size)} khách · {reservationLabels[r.status]}</p></li>)}</ul>}</Card>
                <Card><Title icon={ShoppingBag} to="/admin/menus" note="Số lượng từ đơn thanh toán trong kỳ, không gồm đơn hủy">Sản phẩm bán chạy</Title>{data.orders.top_products.length ? <ol className="space-y-3">{data.orders.top_products.map((p, i) => <li key={`${p.product_id}-${p.product_name}`} className="flex items-center gap-3 rounded-lg bg-[#F7F4F1] p-3 text-sm"><span className="text-[#958981]">{i + 1}</span><span className="min-w-0 flex-1">{p.product_name}</span><strong>{number(p.quantity)}</strong></li>)}</ol> : <Empty>Chưa có sản phẩm bán ra.</Empty>}</Card>
                <Card><Title icon={BadgePercent} to="/admin/promotions" note="Trạng thái chiến dịch hiện tại">Khuyến mãi</Title><Counts data={data.promotions.statuses} labels={{ RUNNING: 'Đang diễn ra', UPCOMING: 'Sắp diễn ra', ENDED: 'Đã kết thúc', INACTIVE: 'Ngừng hoạt động' }} /><p className="mt-3 text-sm">Tổng tiền giảm: <strong>{money(data.promotions.discount_total)}</strong></p><p className="mt-1 text-xs text-[#958981]">Đơn thanh toán thành công trong kỳ, không gồm đơn hủy.</p><details className="mt-4 text-xs"><summary className="cursor-pointer font-semibold">Voucher khách hàng · Hiện tại</summary><div className="mt-3"><Counts data={data.customer_vouchers} labels={{ UNUSED: 'Chưa sử dụng', RESERVED: 'Đang giữ', USED: 'Đã dùng', EXPIRED: 'Hết hạn', REVOKED: 'Đã thu hồi' }} /></div></details></Card>
                <Card><Title icon={WalletCards} to="/admin/payroll" note="Kỳ lương chứa ngày hôm nay">Bảng lương hiện tại</Title>{data.payroll ? <><p className="font-semibold">{data.payroll.name}</p><p className="mt-1 text-xs text-[#958981]">{({ DRAFT: 'Bản nháp', CONFIRMED: 'Đã xác nhận', PAID: 'Đã trả lương' })[data.payroll.status]}</p><p className="mt-3 text-xl font-bold">{money(data.payroll.net_salary)}</p><p className="mt-1 text-xs text-[#958981]">Tổng thực nhận · {number(data.payroll.staff_count)} nhân viên</p></> : <Empty>Chưa có kỳ lương hiện tại.</Empty>}</Card>
                <Card><Title icon={Bot} to="/admin/ai" link="Quản lý AI" note="Lượt sử dụng trong khoảng đã chọn">{data.ai.assistant_name || 'CafeFlow Assistant'}</Title><p className={`mb-3 text-sm font-semibold ${data.ai.enabled ? 'text-[#468263]' : 'text-[#958981]'}`}>{data.ai.enabled === null ? 'Chưa có cấu hình' : data.ai.enabled ? 'Đang bật' : 'Tạm tắt'}</p><Counts data={data.ai} labels={{ conversations: 'Cuộc hội thoại', messages: 'Tin nhắn', fallback_count: 'Phản hồi dự phòng', error_count: 'Lỗi' }} /><p className="mt-3 text-xs text-[#958981]">Ý định phổ biến: {data.ai.top_intent ? `${data.ai.top_intent.intent} (${number(data.ai.top_intent.total)})` : 'Chưa có dữ liệu'}</p></Card>
                <Card><Title icon={ArrowUpRight}>Truy cập nhanh</Title><nav className="grid gap-2">{[['Quản lý nhân viên', '/admin/staffs'], ['Quản lý thực đơn', '/admin/menus'], ['Xem đơn hàng', '/admin/orders'], ['Nhập kho', '/admin/inventory'], ['Quản lý khuyến mãi', '/admin/promotions']].map(([label, to]) => <Link key={to} to={to} className="flex items-center justify-between rounded-lg bg-[#F7F4F1] px-3 py-2 text-sm hover:bg-[#E9DFD8]">{label}<ArrowUpRight size={15} /></Link>)}</nav></Card>
            </div>
            <Card><Title icon={ReceiptText} to="/admin/orders" note="8 đơn được tạo gần nhất trong khoảng đã chọn">Đơn hàng gần đây</Title>{data.orders.recent.length ? <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-xs"><thead className="bg-[#F7F4F1] text-[#958981]"><tr>{['Mã', 'Loại', 'Khách', 'Tổng', 'Trạng thái', 'Thời gian'].map((label) => <th key={label} className="p-3 font-medium">{label}</th>)}</tr></thead><tbody>{data.orders.recent.map((order) => <tr key={order.id} className="border-b border-[#F7F4F1] hover:bg-[#F7F4F1]/60"><td className="p-3"><Link to="/admin/orders" className="font-semibold text-[#604238] hover:underline">{order.order_code}</Link></td><td className="p-3">{order.order_type === 'DINE_IN' ? 'Tại quán' : 'Mang đi'}</td><td className="max-w-[180px] break-words p-3">{order.customer_type === 'WALK_IN' ? 'Khách vãng lai' : order.customer_name || 'Khách thành viên'}</td><td className="whitespace-nowrap p-3 font-semibold">{money(order.total_amount)}</td><td className="p-3"><span className="whitespace-nowrap rounded-md bg-[#F7F4F1] px-2 py-1" style={{ color: statusColors[order.status] }}>{orderLabels[order.status]}</span></td><td className="whitespace-nowrap p-3 text-[#958981]">{time(order.created_at)}</td></tr>)}</tbody></table></div> : <Empty>Chưa có đơn hàng trong khoảng thời gian này.</Empty>}</Card>
        </>}
    </div>;
}
