import React, { useState, useEffect, useRef } from "react";
import {
    Users,
    Search,
    Plus,
    Download,
    RefreshCw,
    Eye,
    Pencil,
    Trash2,
    KeyRound,
    ImagePlus,
    X,
    ChevronLeft,
    ChevronRight,
    LoaderCircle,
    UserCircle2,
    MoreVertical,
} from "lucide-react";
import { adminStaffService } from "../../../services/adminStaff.service";
import {
    showSuccess,
    showError,
} from "../../../utils/toast";
import { getApiErrorMessage } from "../../../utils/apiError";

const POSITIONS = {
    MANAGER: { label: "Quản lý", color: "bg-purple-100 text-purple-700" },
    CASHIER: { label: "Thu ngân", color: "bg-blue-100 text-blue-700" },
    BARISTA: { label: "Pha chế", color: "bg-amber-100 text-amber-700" },
    SERVER: { label: "Phục vụ", color: "bg-emerald-100 text-emerald-700" },
};

const STATUSES = {
    ACTIVE: { label: "Đang làm việc", color: "bg-green-100 text-green-700" },
    INACTIVE: { label: "Ngừng hoạt động", color: "bg-gray-100 text-gray-700" },
    LOCKED: { label: "Bị khóa", color: "bg-red-100 text-red-700" },
};

const SORTS = [
    { value: "created_at_desc", label: "Mới nhất" },
    { value: "created_at_oldest", label: "Cũ nhất" },
    { value: "full_name_asc", label: "Tên A-Z" },
    { value: "full_name_desc", label: "Tên Z-A" },
    { value: "staff_code_asc", label: "Mã nhân viên tăng dần" },
    { value: "staff_code_desc", label: "Mã nhân viên giảm dần" },
    { value: "hire_date_newest", label: "Ngày vào làm mới nhất" },
    { value: "hire_date_oldest", label: "Ngày vào làm cũ nhất" },
];

const formatCurrency = (amount) => {
    if (amount == null) return "Chưa thiết lập";
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);
};

const formatDate = (dateString) => {
    if (!dateString) return "Chưa thiết lập";
    return new Date(dateString).toLocaleDateString("vi-VN");
};

export default function StaffManagement() {
    // ----------------------------------------------------------------------
    // STATE
    // ----------------------------------------------------------------------
    const [staffs, setStaffs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalItems, setTotalItems] = useState(0);
    const [summary, setSummary] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        locked: 0,
    });

    // Filters
    const [search, setSearch] = useState("");
    const [position, setPosition] = useState("");
    const [status, setStatus] = useState("");
    const [sort, setSort] = useState("created_at_desc");
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    
    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);

    const [selectedStaff, setSelectedStaff] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ----------------------------------------------------------------------
    // FETCH DATA
    // ----------------------------------------------------------------------
    const fetchStaffs = async (currentPage = page) => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                sort,
            };
            if (search) params.search = search;
            if (position) params.position = position;
            if (status) params.status = status;

            const res = await adminStaffService.getStaffs(params);
            const paginator = res.data; 
            setStaffs(paginator.data || []);
            setPage(paginator.current_page || 1);
            setLastPage(paginator.last_page || 1);
            setTotalItems(paginator.total || 0);
            
            // Temporary simple summary calculation based on current page
            // A real app would get this from backend.
            const allRes = await adminStaffService.getStaffs({ per_page: 1000 });
            if (allRes.data?.data) {
                 const allStaffs = allRes.data.data;
                 setSummary({
                     total: allStaffs.length,
                     active: allStaffs.filter(s => s.status === 'ACTIVE').length,
                     inactive: allStaffs.filter(s => s.status === 'INACTIVE').length,
                     locked: allStaffs.filter(s => s.status === 'LOCKED').length,
                 });
            }
        } catch (error) {
            showError(getApiErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchStaffs(1);
        }, 300);
        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, position, status, sort]);

    // ----------------------------------------------------------------------
    // HANDLERS
    // ----------------------------------------------------------------------
    const handleDelete = async () => {
        if (!selectedStaff) return;
        try {
            setIsSubmitting(true);
            const res = await adminStaffService.deleteStaff(selectedStaff.id);
            showSuccess(res.message);
            setShowDeleteModal(false);
            fetchStaffs();
        } catch (error) {
            showError(getApiErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStatusChange = async (staffId, newStatus) => {
        try {
            const res = await adminStaffService.updateStaffStatus(staffId, newStatus);
            showSuccess(res.message);
            fetchStaffs();
        } catch (error) {
            showError(getApiErrorMessage(error));
        }
    };

    // ----------------------------------------------------------------------
    // UI COMPONENTS
    // ----------------------------------------------------------------------
    return (
        <div className="min-h-screen bg-[#F7F4F1] p-6 font-sans">
            {/* HEADER */}
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                    <h1 className="text-2xl font-bold text-[#49332b]">
                        Quản lý nhân viên
                    </h1>
                    <p className="mt-1 text-sm text-[#958981]">
                        Quản lý hồ sơ, tài khoản và trạng thái làm việc của nhân viên CafeFlow.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 rounded-lg border border-[#E9DFD8] bg-white px-4 py-2 text-sm font-semibold text-[#625751] transition hover:bg-gray-50 hover:text-[#49332b]">
                        <Download size={16} />
                        Xuất dữ liệu
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 rounded-lg bg-[#604238] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#49332b] shadow-sm"
                    >
                        <Plus size={16} />
                        Thêm nhân viên
                    </button>
                </div>
            </div>

            {/* SUMMARY CARDS */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-[#E9DFD8] bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-[#958981]">
                                Tổng nhân viên
                            </p>
                            <h3 className="mt-2 text-2xl font-bold text-[#49332b]">
                                {summary.total}
                            </h3>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3efec] text-[#604238]">
                            <Users size={20} />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-[#E9DFD8] bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-[#958981]">
                                Đang làm việc
                            </p>
                            <h3 className="mt-2 text-2xl font-bold text-green-600">
                                {summary.active}
                            </h3>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600">
                            <Users size={20} />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-[#E9DFD8] bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-[#958981]">
                                Ngừng hoạt động
                            </p>
                            <h3 className="mt-2 text-2xl font-bold text-gray-600">
                                {summary.inactive}
                            </h3>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-600">
                            <Users size={20} />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-[#E9DFD8] bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-[#958981]">
                                Bị khóa
                            </p>
                            <h3 className="mt-2 text-2xl font-bold text-red-600">
                                {summary.locked}
                            </h3>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
                            <Users size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN CARD */}
            <div className="rounded-xl border border-[#E9DFD8] bg-white shadow-sm">
                {/* TOOLBAR */}
                <div className="flex flex-col gap-3 border-b border-[#E9DFD8] p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-1 items-center gap-3">
                        <div className="relative w-full max-w-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Search size={16} className="text-[#958981]" />
                            </div>
                            <input
                                type="text"
                                placeholder="Tìm theo tên, mã NV, email, SĐT..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="block w-full rounded-lg border border-[#E9DFD8] bg-[#fbfaf9] py-2 pl-10 pr-3 text-sm text-[#49332b] focus:border-[#604238] focus:outline-none focus:ring-1 focus:ring-[#604238]"
                            />
                        </div>

                        <select
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                            className="rounded-lg border border-[#E9DFD8] bg-[#fbfaf9] px-3 py-2 text-sm text-[#49332b] focus:border-[#604238] focus:outline-none focus:ring-1 focus:ring-[#604238]"
                        >
                            <option value="">Tất cả chức vụ</option>
                            <option value="MANAGER">Quản lý</option>
                            <option value="CASHIER">Thu ngân</option>
                            <option value="BARISTA">Pha chế</option>
                            <option value="SERVER">Phục vụ</option>
                        </select>

                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="rounded-lg border border-[#E9DFD8] bg-[#fbfaf9] px-3 py-2 text-sm text-[#49332b] focus:border-[#604238] focus:outline-none focus:ring-1 focus:ring-[#604238]"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="ACTIVE">Đang làm việc</option>
                            <option value="INACTIVE">Ngừng hoạt động</option>
                            <option value="LOCKED">Bị khóa</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-3">
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="rounded-lg border border-[#E9DFD8] bg-[#fbfaf9] px-3 py-2 text-sm text-[#49332b] focus:border-[#604238] focus:outline-none focus:ring-1 focus:ring-[#604238]"
                        >
                            {SORTS.map((s) => (
                                <option key={s.value} value={s.value}>
                                    {s.label}
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={() => fetchStaffs()}
                            className="flex h-[38px] w-[38px] items-center justify-center rounded-lg border border-[#E9DFD8] bg-white text-[#625751] transition hover:bg-gray-50 hover:text-[#49332b]"
                            title="Tải lại"
                        >
                            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        </button>
                    </div>
                </div>

                {/* TABLE */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-[#625751]">
                        <thead className="bg-[#fbfaf9] text-xs uppercase text-[#958981]">
                            <tr className="border-b border-[#E9DFD8]">
                                <th className="px-4 py-3 font-semibold">#</th>
                                <th className="px-4 py-3 font-semibold">Nhân viên</th>
                                <th className="px-4 py-3 font-semibold">Mã NV</th>
                                <th className="px-4 py-3 font-semibold">Chức vụ</th>
                                <th className="px-4 py-3 font-semibold">Liên hệ</th>
                                <th className="px-4 py-3 font-semibold">Ngày vào làm</th>
                                <th className="px-4 py-3 font-semibold">Lương cơ bản</th>
                                <th className="px-4 py-3 font-semibold">Trạng thái</th>
                                <th className="px-4 py-3 font-semibold text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E9DFD8]">
                            {loading ? (
                                <tr>
                                    <td colSpan="9" className="py-10 text-center">
                                        <div className="flex items-center justify-center gap-2 text-[#958981]">
                                            <LoaderCircle className="animate-spin" size={20} />
                                            <span>Đang tải dữ liệu...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : staffs.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="py-16 text-center">
                                        <div className="flex flex-col items-center">
                                            <Users size={48} className="mb-4 text-[#d8c8bd]" />
                                            <p className="text-base font-semibold text-[#49332b]">
                                                {search || position || status
                                                    ? "Không tìm thấy nhân viên phù hợp"
                                                    : "Chưa có nhân viên nào"}
                                            </p>
                                            <p className="mt-1 text-sm text-[#958981]">
                                                {search || position || status
                                                    ? "Vui lòng thử lại với từ khóa hoặc bộ lọc khác."
                                                    : "Hãy thêm nhân viên đầu tiên để bắt đầu thiết lập đội ngũ CafeFlow."}
                                            </p>
                                            {!(search || position || status) && (
                                                <button
                                                    onClick={() => setShowCreateModal(true)}
                                                    className="mt-4 flex items-center gap-2 rounded-lg bg-[#604238] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#49332b]"
                                                >
                                                    <Plus size={16} />
                                                    Thêm nhân viên
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                staffs.map((staff, idx) => (
                                    <tr key={staff.id} className="hover:bg-[#fbfaf9]">
                                        <td className="px-4 py-3">{(page - 1) * 10 + idx + 1}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {staff.avatar_url ? (
                                                    <img
                                                        src={staff.avatar_url}
                                                        alt={staff.full_name}
                                                        className="h-9 w-9 rounded-full object-cover shadow-sm"
                                                    />
                                                ) : (
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f3efec] text-sm font-bold text-[#604238]">
                                                        {staff.full_name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-semibold text-[#49332b]">
                                                        {staff.full_name}
                                                    </p>
                                                    <p className="text-[11px] text-[#958981]">
                                                        {staff.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-sm text-[#49332b]">
                                            {staff.staff_code}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col gap-1">
                                                <span
                                                    className={`w-max rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                                                        POSITIONS[staff.position]?.color
                                                    }`}
                                                >
                                                    {POSITIONS[staff.position]?.label}
                                                </span>
                                                <span className="text-[10px] text-gray-500 font-medium">
                                                    {staff.role ? staff.role.name : 'Chưa phân quyền'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {staff.phone || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            {formatDate(staff.hire_date)}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-[#49332b]">
                                            {formatCurrency(staff.base_salary)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={staff.status}
                                                onChange={(e) => handleStatusChange(staff.id, e.target.value)}
                                                className={`rounded-full px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                                                    STATUSES[staff.status]?.color
                                                }`}
                                            >
                                                <option value="ACTIVE">Đang làm việc</option>
                                                <option value="INACTIVE">Ngừng hoạt động</option>
                                                <option value="LOCKED">Khóa tài khoản</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => {
                                                        setSelectedStaff(staff);
                                                        setShowDetailModal(true);
                                                    }}
                                                    className="flex h-8 w-8 items-center justify-center rounded-md text-blue-600 hover:bg-blue-50"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedStaff(staff);
                                                        setShowEditModal(true);
                                                    }}
                                                    className="flex h-8 w-8 items-center justify-center rounded-md text-emerald-600 hover:bg-emerald-50"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedStaff(staff);
                                                        setShowResetModal(true);
                                                    }}
                                                    className="flex h-8 w-8 items-center justify-center rounded-md text-amber-600 hover:bg-amber-50"
                                                    title="Đặt lại mật khẩu"
                                                >
                                                    <KeyRound size={16} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedStaff(staff);
                                                        setShowDeleteModal(true);
                                                    }}
                                                    className="flex h-8 w-8 items-center justify-center rounded-md text-red-600 hover:bg-red-50"
                                                    title="Xóa nhân viên"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                {!loading && staffs.length > 0 && (
                    <div className="flex items-center justify-between border-t border-[#E9DFD8] p-4">
                        <p className="text-sm text-[#958981]">
                            Hiển thị <span className="font-medium text-[#49332b]">{(page - 1) * 10 + 1}</span> đến <span className="font-medium text-[#49332b]">{Math.min(page * 10, totalItems)}</span> trên tổng số <span className="font-medium text-[#49332b]">{totalItems}</span> nhân viên
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => fetchStaffs(page - 1)}
                                disabled={page === 1}
                                className="flex h-8 w-8 items-center justify-center rounded border border-[#E9DFD8] text-[#625751] hover:bg-gray-50 disabled:opacity-50"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            {Array.from({ length: lastPage }, (_, i) => i + 1).map(p => (
                                <button
                                    key={p}
                                    onClick={() => fetchStaffs(p)}
                                    className={`flex h-8 w-8 items-center justify-center rounded border ${
                                        page === p
                                            ? "border-[#604238] bg-[#604238] text-white"
                                            : "border-[#E9DFD8] text-[#625751] hover:bg-gray-50"
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                            <button
                                onClick={() => fetchStaffs(page + 1)}
                                disabled={page === lastPage}
                                className="flex h-8 w-8 items-center justify-center rounded border border-[#E9DFD8] text-[#625751] hover:bg-gray-50 disabled:opacity-50"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* MODALS */}
            {showCreateModal && <StaffFormModal onClose={() => setShowCreateModal(false)} onSuccess={fetchStaffs} />}
            {showEditModal && selectedStaff && <StaffFormModal staff={selectedStaff} onClose={() => setShowEditModal(false)} onSuccess={fetchStaffs} />}
            {showDetailModal && selectedStaff && <StaffDetailModal staff={selectedStaff} onClose={() => setShowDetailModal(false)} onEdit={() => { setShowDetailModal(false); setShowEditModal(true); }} />}
            {showDeleteModal && selectedStaff && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
                        <div className="p-6">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                                <Trash2 size={24} className="text-red-600" />
                            </div>
                            <h3 className="mt-4 text-center text-lg font-bold text-[#49332b]">
                                Xóa nhân viên?
                            </h3>
                            <p className="mt-2 text-center text-sm text-[#625751]">
                                Bạn có chắc chắn muốn xóa nhân viên <span className="font-bold">"{selectedStaff.full_name}"</span>?
                            </p>
                            <p className="mt-2 rounded-lg bg-red-50 p-3 text-center text-xs text-red-600 font-medium border border-red-100">
                                Tài khoản nhân viên và các phiên đăng nhập hiện tại sẽ bị xóa vĩnh viễn.
                            </p>
                        </div>
                        <div className="flex gap-3 bg-gray-50 p-4 rounded-b-2xl">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isSubmitting}
                                className="flex-1 rounded-lg border border-[#E9DFD8] bg-white py-2.5 text-sm font-semibold text-[#625751] transition hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isSubmitting}
                                className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50 flex justify-center items-center gap-2"
                            >
                                {isSubmitting && <LoaderCircle size={16} className="animate-spin" />}
                                Xóa nhân viên
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showResetModal && selectedStaff && <ResetPasswordModal staff={selectedStaff} onClose={() => setShowResetModal(false)} />}
        </div>
    );
}

// ----------------------------------------------------------------------
// FORM MODAL (CREATE/EDIT)
// ----------------------------------------------------------------------
function StaffFormModal({ staff, onClose, onSuccess }) {
    const isEdit = !!staff;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    
    const [formData, setFormData] = useState({
        staff_code: staff?.staff_code || "",
        full_name: staff?.full_name || "",
        email: staff?.email || "",
        phone: staff?.phone || "",
        position: staff?.position || "SERVER",
        hire_date: staff?.hire_date || "",
        base_salary: staff?.base_salary || "",
        status: staff?.status || "ACTIVE",
        password: "",
        password_confirmation: "",
    });

    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(staff?.avatar_url || null);
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic frontend validation
        const newErrors = {};
        if (!formData.staff_code) newErrors.staff_code = "Vui lòng nhập mã NV";
        if (!formData.full_name) newErrors.full_name = "Vui lòng nhập họ tên";
        if (!formData.email) newErrors.email = "Vui lòng nhập email";
        if (!isEdit && !formData.password) newErrors.password = "Vui lòng nhập mật khẩu";
        if (!isEdit && formData.password !== formData.password_confirmation) {
            newErrors.password_confirmation = "Mật khẩu xác nhận không khớp";
        }
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const payload = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== "") {
                payload.append(key, formData[key]);
            }
        });
        if (avatarFile) {
            payload.append("avatar", avatarFile);
        }

        try {
            setIsSubmitting(true);
            let res;
            if (isEdit) {
                res = await adminStaffService.updateStaff(staff.id, payload);
            } else {
                res = await adminStaffService.createStaff(payload);
            }
            showSuccess(res.message);
            onSuccess();
            onClose();
        } catch (error) {
            if (error.response?.data?.errors) {
                const apiErrors = {};
                for (const [key, val] of Object.entries(error.response.data.errors)) {
                    apiErrors[key] = val[0];
                }
                setErrors(apiErrors);
            } else {
                showError(getApiErrorMessage(error));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6">
            <div className="flex w-full max-w-2xl flex-col rounded-2xl bg-white shadow-xl max-h-[90vh]">
                <div className="flex items-center justify-between border-b border-[#E9DFD8] p-5">
                    <h3 className="text-lg font-bold text-[#49332b]">
                        {isEdit ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
                    </h3>
                    <button onClick={onClose} className="rounded-lg p-2 text-[#958981] hover:bg-gray-100">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <form id="staff-form" onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Avatar */}
                        <div className="flex flex-col items-center justify-center">
                            <div className="relative mb-3 h-24 w-24">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Avatar" className="h-24 w-24 rounded-full object-cover shadow-sm border-2 border-white outline outline-1 outline-gray-200" />
                                ) : (
                                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 text-gray-400 border-2 border-dashed border-gray-300">
                                        <UserCircle2 size={40} />
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow border border-gray-200 text-[#604238] hover:bg-gray-50"
                                >
                                    <ImagePlus size={14} />
                                </button>
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                            {avatarPreview && (
                                <button type="button" onClick={() => { setAvatarPreview(null); setAvatarFile(null); }} className="text-xs text-red-500 hover:underline">
                                    Xóa ảnh
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-[#49332b]">Mã nhân viên <span className="text-red-500">*</span></label>
                                <input type="text" name="staff_code" value={formData.staff_code} onChange={handleChange} className={`block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${errors.staff_code ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-[#E9DFD8] focus:border-[#604238] focus:ring-[#604238]'}`} />
                                {errors.staff_code && <p className="mt-1 text-xs text-red-500">{errors.staff_code}</p>}
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-[#49332b]">Họ và tên <span className="text-red-500">*</span></label>
                                <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className={`block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${errors.full_name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-[#E9DFD8] focus:border-[#604238] focus:ring-[#604238]'}`} />
                                {errors.full_name && <p className="mt-1 text-xs text-red-500">{errors.full_name}</p>}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-[#49332b]">Email <span className="text-red-500">*</span></label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className={`block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-[#E9DFD8] focus:border-[#604238] focus:ring-[#604238]'}`} />
                                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-[#49332b]">Số điện thoại</label>
                                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="block w-full rounded-lg border border-[#E9DFD8] px-3 py-2 text-sm focus:border-[#604238] focus:outline-none focus:ring-1 focus:ring-[#604238]" />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-[#49332b]">Chức vụ <span className="text-red-500">*</span></label>
                                <select name="position" value={formData.position} onChange={handleChange} className="block w-full rounded-lg border border-[#E9DFD8] px-3 py-2 text-sm focus:border-[#604238] focus:outline-none focus:ring-1 focus:ring-[#604238]">
                                    <option value="MANAGER">Quản lý</option>
                                    <option value="CASHIER">Thu ngân</option>
                                    <option value="BARISTA">Pha chế</option>
                                    <option value="SERVER">Phục vụ</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-[#49332b]">Ngày vào làm</label>
                                <input type="date" name="hire_date" value={formData.hire_date} onChange={handleChange} className="block w-full rounded-lg border border-[#E9DFD8] px-3 py-2 text-sm focus:border-[#604238] focus:outline-none focus:ring-1 focus:ring-[#604238]" />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-[#49332b]">Lương cơ bản (VNĐ)</label>
                                <input type="number" min="0" name="base_salary" value={formData.base_salary} onChange={handleChange} className="block w-full rounded-lg border border-[#E9DFD8] px-3 py-2 text-sm focus:border-[#604238] focus:outline-none focus:ring-1 focus:ring-[#604238]" />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-[#49332b]">Trạng thái <span className="text-red-500">*</span></label>
                                <select name="status" value={formData.status} onChange={handleChange} className="block w-full rounded-lg border border-[#E9DFD8] px-3 py-2 text-sm focus:border-[#604238] focus:outline-none focus:ring-1 focus:ring-[#604238]">
                                    <option value="ACTIVE">Đang làm việc</option>
                                    <option value="INACTIVE">Ngừng hoạt động</option>
                                    <option value="LOCKED">Bị khóa</option>
                                </select>
                            </div>

                            {!isEdit && (
                                <>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-semibold text-[#49332b]">Mật khẩu <span className="text-red-500">*</span></label>
                                        <input type="password" name="password" value={formData.password} onChange={handleChange} className={`block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-[#E9DFD8] focus:border-[#604238] focus:ring-[#604238]'}`} />
                                        {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-semibold text-[#49332b]">Xác nhận mật khẩu <span className="text-red-500">*</span></label>
                                        <input type="password" name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} className={`block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${errors.password_confirmation ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-[#E9DFD8] focus:border-[#604238] focus:ring-[#604238]'}`} />
                                        {errors.password_confirmation && <p className="mt-1 text-xs text-red-500">{errors.password_confirmation}</p>}
                                    </div>
                                </>
                            )}
                        </div>
                    </form>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-[#E9DFD8] p-5">
                    <button onClick={onClose} disabled={isSubmitting} className="rounded-lg border border-[#E9DFD8] px-5 py-2.5 text-sm font-semibold text-[#625751] hover:bg-gray-50">
                        Hủy
                    </button>
                    <button type="submit" form="staff-form" disabled={isSubmitting} className="flex items-center gap-2 rounded-lg bg-[#604238] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#49332b] disabled:opacity-70">
                        {isSubmitting && <LoaderCircle size={16} className="animate-spin" />}
                        {isEdit ? "Cập nhật" : "Thêm mới"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// DETAIL MODAL
// ----------------------------------------------------------------------
function StaffDetailModal({ staff, onClose, onEdit }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
                <div className="relative h-24 bg-[#604238]">
                    <button onClick={onClose} className="absolute right-4 top-4 rounded-full bg-black/20 p-1.5 text-white hover:bg-black/40">
                        <X size={18} />
                    </button>
                </div>
                <div className="px-6 pb-6">
                    <div className="relative -mt-12 flex justify-center">
                        {staff.avatar_url ? (
                            <img src={staff.avatar_url} alt="Avatar" className="h-24 w-24 rounded-full border-4 border-white bg-white object-cover shadow-sm" />
                        ) : (
                            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gray-100 text-3xl font-bold text-[#604238] shadow-sm">
                                {staff.full_name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-3 text-center">
                        <h2 className="text-xl font-bold text-[#49332b]">{staff.full_name}</h2>
                        <p className="text-sm text-[#958981]">{staff.email}</p>
                        <div className="mt-2 flex justify-center gap-2">
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${POSITIONS[staff.position]?.color}`}>
                                {POSITIONS[staff.position]?.label}
                            </span>
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${STATUSES[staff.status]?.color}`}>
                                {STATUSES[staff.status]?.label}
                            </span>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-y-4 rounded-xl bg-gray-50 p-4 border border-gray-100">
                        <div>
                            <p className="text-[11px] font-semibold uppercase text-[#958981]">Mã nhân viên</p>
                            <p className="mt-0.5 font-mono text-sm font-medium text-[#49332b]">{staff.staff_code}</p>
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold uppercase text-[#958981]">Số điện thoại</p>
                            <p className="mt-0.5 text-sm font-medium text-[#49332b]">{staff.phone || "Chưa cập nhật"}</p>
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold uppercase text-[#958981]">Ngày vào làm</p>
                            <p className="mt-0.5 text-sm font-medium text-[#49332b]">{formatDate(staff.hire_date)}</p>
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold uppercase text-[#958981]">Lương cơ bản</p>
                            <p className="mt-0.5 text-sm font-medium text-[#49332b]">{formatCurrency(staff.base_salary)}</p>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                        <button onClick={onClose} className="flex-1 rounded-lg border border-[#E9DFD8] px-4 py-2 text-sm font-semibold text-[#625751] hover:bg-gray-50">
                            Đóng
                        </button>
                        <button onClick={onEdit} className="flex-1 rounded-lg bg-[#604238] px-4 py-2 text-sm font-semibold text-white flex items-center justify-center gap-2 hover:bg-[#49332b]">
                            <Pencil size={16} />
                            Chỉnh sửa
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// RESET PASSWORD MODAL
// ----------------------------------------------------------------------
function ResetPasswordModal({ staff, onClose }) {
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const newErrors = {};
        if (!password) newErrors.password = "Vui lòng nhập mật khẩu mới";
        if (password && password.length < 8) newErrors.password = "Mật khẩu tối thiểu 8 ký tự";
        if (password !== passwordConfirmation) newErrors.password_confirmation = "Mật khẩu xác nhận không khớp";
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setIsSubmitting(true);
            const res = await adminStaffService.resetStaffPassword(staff.id, {
                password,
                password_confirmation: passwordConfirmation,
            });
            showSuccess(res.message);
            onClose();
        } catch (error) {
            if (error.response?.data?.errors) {
                const apiErrors = {};
                for (const [key, val] of Object.entries(error.response.data.errors)) {
                    apiErrors[key] = val[0];
                }
                setErrors(apiErrors);
            } else {
                showError(getApiErrorMessage(error));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-[#E9DFD8] p-5">
                    <h3 className="text-lg font-bold text-[#49332b]">Đặt lại mật khẩu</h3>
                    <button onClick={onClose} className="rounded-lg p-2 text-[#958981] hover:bg-gray-100">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-5">
                    <div className="mb-4 rounded-lg bg-gray-50 p-3 text-sm">
                        <p className="text-[#625751]">Nhân viên: <span className="font-bold text-[#49332b]">{staff.full_name}</span></p>
                        <p className="text-[#625751]">Mã NV: <span className="font-mono font-medium text-[#49332b]">{staff.staff_code}</span></p>
                    </div>

                    <form id="reset-password-form" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-[#49332b]">Mật khẩu mới <span className="text-red-500">*</span></label>
                            <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({...prev, password: null}))}} className={`block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-[#E9DFD8] focus:border-[#604238] focus:ring-[#604238]'}`} />
                            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-[#49332b]">Xác nhận mật khẩu <span className="text-red-500">*</span></label>
                            <input type="password" value={passwordConfirmation} onChange={(e) => { setPasswordConfirmation(e.target.value); setErrors(prev => ({...prev, password_confirmation: null}))}} className={`block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${errors.password_confirmation ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-[#E9DFD8] focus:border-[#604238] focus:ring-[#604238]'}`} />
                            {errors.password_confirmation && <p className="mt-1 text-xs text-red-500">{errors.password_confirmation}</p>}
                        </div>
                    </form>
                </div>
                <div className="flex gap-3 border-t border-[#E9DFD8] p-5">
                    <button onClick={onClose} disabled={isSubmitting} className="flex-1 rounded-lg border border-[#E9DFD8] py-2.5 text-sm font-semibold text-[#625751] hover:bg-gray-50">
                        Hủy
                    </button>
                    <button type="submit" form="reset-password-form" disabled={isSubmitting} className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-[#604238] py-2.5 text-sm font-semibold text-white hover:bg-[#49332b] disabled:opacity-50">
                        {isSubmitting && <LoaderCircle size={16} className="animate-spin" />}
                        Đổi mật khẩu
                    </button>
                </div>
            </div>
        </div>
    );
}
