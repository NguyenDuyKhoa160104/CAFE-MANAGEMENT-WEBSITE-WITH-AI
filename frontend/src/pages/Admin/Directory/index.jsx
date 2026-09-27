import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../../config/axios.config';

const labels = { ACTIVE: 'Đang hoạt động', INACTIVE: 'Ngừng hoạt động', PENDING: 'Chờ xử lý', CONFIRMED: 'Đã xác nhận', CHECKED_IN: 'Đã nhận bàn', COMPLETED: 'Hoàn thành', CANCELLED: 'Đã hủy', NO_SHOW: 'Không đến' };
const control = 'rounded-lg border border-[#E9DFD8] bg-white px-3 py-2 text-sm disabled:opacity-40';

export default function Directory({ kind }) {
    const reservations = kind === 'reservations';
    const [search, setSearch] = useState('');
    const [params, setParams] = useState({ page: 1, search: '', status: '' });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [retry, setRetry] = useState(0);
    useEffect(() => {
        const abort = new AbortController();
        adminApi.get(`/${kind}`, { params, signal: abort.signal }).then((response) => {
            if (!abort.signal.aborted) { setResult(response.data); setError(false); }
        }).catch(() => { if (!abort.signal.aborted) setError(true); })
            .finally(() => { if (!abort.signal.aborted) setLoading(false); });
        return () => abort.abort();
    }, [kind, params, retry]);
    const change = (next) => { setLoading(true); setParams(next); };
    const columns = reservations ? ['Mã', 'Khách hàng', 'Điện thoại', 'Ngày đặt bàn (giờ VN)', 'Số khách', 'Trạng thái'] : ['Khách hàng', 'Email', 'Điện thoại', 'Trạng thái'];
    return <div className="space-y-4 text-[#302723]"><Link to="/admin/dashboard" className="text-sm text-[#604238] hover:underline">Về Dashboard</Link><h1 className="text-xl font-bold">{reservations ? 'Danh sách đặt bàn' : 'Danh sách khách hàng'}</h1>
        <form className="flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); change({ ...params, page: 1, search }); }}><input aria-label="Tìm kiếm" placeholder={reservations ? 'Mã đặt bàn, tên khách' : 'Tên, email, điện thoại'} value={search} onChange={(e) => setSearch(e.target.value)} className={control} /><button className={control}>Tìm kiếm</button>{reservations && <select aria-label="Trạng thái đặt bàn" value={params.status} onChange={(e) => change({ ...params, status: e.target.value, page: 1 })} className={control}><option value="">Tất cả trạng thái</option>{Object.entries(labels).filter(([key]) => !['ACTIVE', 'INACTIVE'].includes(key)).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>}</form>
        {loading ? <div role="status" className="h-60 animate-pulse rounded-xl bg-[#E9DFD8]" aria-label="Đang tải" /> : error ? <div role="alert">Không thể tải dữ liệu. <button className={control} onClick={() => { setLoading(true); setRetry((n) => n + 1); }}>Thử lại</button></div> : <div className="overflow-x-auto rounded-xl border border-[#E9DFD8] bg-white"><table className="w-full text-left text-sm"><thead className="bg-[#F7F4F1]"><tr>{columns.map((label) => <th key={label} className="whitespace-nowrap p-3">{label}</th>)}</tr></thead><tbody>{result?.data.map((row) => <tr key={row.id} className="border-t border-[#E9DFD8]">{(reservations ? [row.reservation_code, row.customer_name || 'Chưa có tên', row.customer_phone || '—', row.reservation_at, row.party_size, labels[row.status]] : [row.full_name, row.email, row.phone || '—', labels[row.status]]).map((value, i) => <td key={i} className="p-3">{value}</td>)}</tr>)}{!result?.data.length && <tr><td className="p-8 text-center text-[#958981]" colSpan={columns.length}>Không có dữ liệu phù hợp.</td></tr>}</tbody></table></div>}
        {!loading && !error && result && <div className="flex items-center gap-3 text-sm"><button disabled={result.current_page <= 1} onClick={() => change({ ...params, page: params.page - 1 })} className={control}>Trước</button><span>Trang {result.current_page} / {result.last_page}</span><button disabled={result.current_page >= result.last_page} onClick={() => change({ ...params, page: params.page + 1 })} className={control}>Sau</button></div>}
    </div>;
}
