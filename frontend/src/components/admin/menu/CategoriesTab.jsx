import React, { useState, useEffect, useMemo } from "react";
import { Coffee, EyeOff, Grid2X2, Plus, RefreshCw, Search, Eye, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import CategoryStatusBadge from "./CategoryStatusBadge";
import CategoryFormModal from "./CategoryFormModal";
import CategoryDetailModal from "./CategoryDetailModal";
import DeleteCategoryModal from "./DeleteCategoryModal";
import { categoryService } from "../../../services/admin/category.service";
import { showSuccess, showError } from "../../../utils/toast";

const SummaryCard = ({ icon, label, value, text }) => (
    <div className="flex items-center gap-4 rounded-xl border border-[#eee5df] bg-white p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f4ece7] text-[#604238]">
            {icon}
        </div>
        <div>
            <p className="text-[9px] font-bold tracking-wide text-[#958981]">{label}</p>
            <p className="mt-1 text-xl font-bold text-[#302723]">{value}</p>
            <p className="text-[10px] text-[#958981]">{text}</p>
        </div>
    </div>
);

const Th = ({ children }) => (
    <th className="px-4 py-3 text-left text-[9px] font-bold tracking-wide text-[#776a63]">
        {children}
    </th>
);

const CategoriesTab = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0, from: 0, to: 0 });

    const [searchInput, setSearchInput] = useState(""); // For the input field
    const [search, setSearch] = useState(""); // For the actual API call
    const [status, setStatus] = useState("ALL");
    const [sort, setSort] = useState("sort_order_asc");
    const [page, setPage] = useState(1);

    // Modals state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

    // Status loading tracking
    const [statusLoadingMap, setStatusLoadingMap] = useState({});

    // Debounce search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setSearch(searchInput);
            setPage(1); // Reset page on search
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchInput]);

    useEffect(() => {
        fetchCategories();
    }, [page, search, status, sort]);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                sort
            };
            if (search) params.search = search;
            if (status !== "ALL") params.status = status;

            const response = await categoryService.getAll(params);
            
            // Backend returns { message: "...", data: { current_page: 1, data: [...], total: ... } }
            // So categories array is response.data.data
            let data = [];
            let meta = { current_page: 1, last_page: 1, total: 0, from: 0, to: 0 };
            
            if (response.data && Array.isArray(response.data.data)) {
                data = response.data.data;
                meta = response.data;
            } else if (Array.isArray(response.data)) {
                data = response.data;
            } else if (Array.isArray(response)) {
                data = response;
            }
            
            setCategories(data);
            setPagination({
                current_page: meta.current_page || 1,
                last_page: meta.last_page || 1,
                total: meta.total || data.length,
                from: meta.from || (data.length > 0 ? 1 : 0),
                to: meta.to || data.length
            });
        } catch (error) {
            console.error("Fetch categories error:", error);
            showError("Không thể tải danh sách danh mục");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (category) => {
        if (statusLoadingMap[category.id]) return;

        const newStatus = category.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
        
        setStatusLoadingMap(prev => ({ ...prev, [category.id]: true }));
        try {
            const response = await categoryService.updateStatus(category.id, newStatus);
            showSuccess(response?.message || "Cập nhật trạng thái thành công");
            
            // Update local state to reflect UI instantly
            setCategories(prev => prev.map(c => c.id === category.id ? { ...c, status: newStatus } : c));
        } catch (error) {
            const message = error.response?.data?.message || "Lỗi cập nhật trạng thái";
            showError(message);
        } finally {
            setStatusLoadingMap(prev => ({ ...prev, [category.id]: false }));
        }
    };

    const handleRefresh = () => {
        setSearchInput("");
        setSearch("");
        setStatus("ALL");
        setSort("sort_order_asc");
        setPage(1);
        fetchCategories();
    };

    // Calculate active/inactive based on fetched data, 
    // or if you want real global counts, the backend should return them.
    // For now we use current page data as fallback if not provided globally.
    const activeCount = categories.filter(item => item.status === "ACTIVE").length;
    const inactiveCount = categories.filter(item => item.status === "INACTIVE").length;
    const totalProducts = categories.reduce((total, item) => total + (item.products_count ?? item.productsCount ?? 0), 0);

    return (
        <div className="space-y-4">
            {/* SECTION HEADER */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-base font-bold text-[#302723]">Danh mục sản phẩm</h2>
                    <p className="mt-1 text-xs text-[#958981]">Phân nhóm sản phẩm trong thực đơn.</p>
                </div>
                <button 
                    onClick={() => {
                        setSelectedCategory(null);
                        setIsFormOpen(true);
                    }}
                    className="flex h-10 items-center gap-2 rounded-lg bg-[#604238] px-4 text-xs font-semibold text-white hover:bg-[#50362f]"
                >
                    <Plus size={16} />
                    Thêm danh mục
                </button>
            </div>

            {/* SUMMARY */}
            <div className="grid gap-3 md:grid-cols-3">
                <SummaryCard
                    icon={<Grid2X2 size={18} />}
                    label="TỔNG DANH MỤC"
                    value={categories.length}
                    text={`${totalProducts} sản phẩm`}
                />
                <SummaryCard
                    icon={<Coffee size={18} />}
                    label="ĐANG HOẠT ĐỘNG"
                    value={activeCount}
                    text="Đang hiển thị"
                />
                <SummaryCard
                    icon={<EyeOff size={18} />}
                    label="ĐANG ẨN / LƯU TRỮ"
                    value={inactiveCount}
                    text="Tạm ngừng hiển thị"
                />
            </div>

            {/* TOOLBAR */}
            <div className="flex flex-col gap-3 rounded-xl border border-[#eee5df] bg-white p-3 lg:flex-row">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9c918a]" />
                    <input
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Tìm kiếm danh mục theo tên, mã..."
                        className="h-10 w-full rounded-lg border border-[#e8dfd9] bg-[#faf8f6] pl-10 pr-3 text-xs outline-none focus:border-[#604238]"
                    />
                </div>

                <select
                    value={status}
                    onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                    className="h-10 rounded-lg border border-[#e8dfd9] bg-white px-3 text-xs outline-none focus:border-[#604238]"
                >
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="ACTIVE">Hoạt động</option>
                    <option value="INACTIVE">Đang ẩn</option>
                </select>
                
                <select
                    value={sort}
                    onChange={(e) => { setSort(e.target.value); setPage(1); }}
                    className="h-10 rounded-lg border border-[#e8dfd9] bg-white px-3 text-xs outline-none focus:border-[#604238]"
                >
                    <option value="sort_order_asc">Thứ tự POS tăng dần</option>
                    <option value="sort_order_desc">Thứ tự POS giảm dần</option>
                    <option value="name_asc">Tên A-Z</option>
                    <option value="name_desc">Tên Z-A</option>
                    <option value="created_at_newest">Mới nhất</option>
                    <option value="created_at_oldest">Cũ nhất</option>
                </select>

                <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={loading}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#e8dfd9] hover:bg-[#faf8f6] disabled:opacity-50"
                >
                    <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            {/* TABLE */}
            <div className="overflow-hidden rounded-xl border border-[#eee5df] bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px]">
                        <thead className="bg-[#faf8f6]">
                            <tr className="border-b border-[#eee5df]">
                                <Th>#</Th>
                                <Th>DANH MỤC</Th>
                                <Th>MÃ ĐỊNH DANH</Th>
                                <Th>SỐ SẢN PHẨM</Th>
                                <Th>THỨ TỰ POS</Th>
                                <Th>TRẠNG THÁI</Th>
                                <Th>NGÀY TẠO</Th>
                                <Th>THAO TÁC</Th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="py-10 text-center text-sm text-[#958981]">
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : categories.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-10">
                                        <div className="flex flex-col items-center justify-center text-center">
                                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f4ece7] text-[#958981]">
                                                <Grid2X2 size={24} />
                                            </div>
                                            <p className="text-sm font-semibold text-[#302723]">
                                                {search || status !== "ALL" ? "Không tìm thấy danh mục phù hợp" : "Chưa có danh mục nào"}
                                            </p>
                                            <p className="mt-1 text-xs text-[#958981]">
                                                {search || status !== "ALL" 
                                                    ? "Hãy thử thay đổi từ khóa hoặc bộ lọc."
                                                    : "Hãy tạo danh mục đầu tiên để bắt đầu xây dựng thực đơn."}
                                            </p>
                                            {!search && status === "ALL" && (
                                                <button 
                                                    onClick={() => setIsFormOpen(true)}
                                                    className="mt-4 flex h-9 items-center gap-2 rounded-lg border border-[#e8dfd9] px-4 text-xs font-semibold text-[#574943] hover:bg-[#faf8f6]"
                                                >
                                                    <Plus size={14} /> Thêm danh mục
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                categories.map((category, index) => (
                                    <tr key={category.id} className="border-b border-[#f1ebe7] last:border-0 hover:bg-[#fdfbf9]">
                                        <td className="px-4 py-3 text-xs text-[#80736c]">{pagination.from + index}</td>
                                        
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#e8dfd9] bg-[#f4ece7] text-[#604238]">
                                                    {category.image ? (
                                                        <img src={category.image} alt={category.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <ImageIcon size={18} />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-[#302723]">{category.name}</p>
                                                    <p className="mt-0.5 max-w-[200px] truncate text-[10px] text-[#958981]" title={category.description}>
                                                        {category.description || "Không có mô tả"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3">
                                            <span className="rounded-md bg-[#f1ece9] px-2 py-1 font-mono text-[10px] text-[#574943]">
                                                {category.category_code || category.code}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3">
                                            <span className="rounded-full border border-[#e8dfd9] bg-[#faf8f6] px-2.5 py-1 text-[10px] font-semibold text-[#574943]">
                                                {category.products_count ?? category.productsCount ?? 0} món
                                            </span>
                                        </td>

                                        <td className="px-4 py-3">
                                            <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-md bg-[#faf8f6] px-1.5 text-xs font-semibold text-[#574943]">
                                                {category.sort_order ?? category.sortOrder ?? 0}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <CategoryStatusBadge status={category.status} />
                                                
                                                {/* Toggle Switch */}
                                                <button
                                                    type="button"
                                                    disabled={statusLoadingMap[category.id]}
                                                    onClick={() => handleToggleStatus(category)}
                                                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                                                        category.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-300'
                                                    }`}
                                                >
                                                    <span
                                                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                            category.status === 'ACTIVE' ? 'translate-x-4' : 'translate-x-0'
                                                        }`}
                                                    />
                                                </button>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-[11px] text-[#574943]">
                                            {category.created_at || category.createdAt 
                                                ? new Date(category.created_at || category.createdAt).toLocaleDateString('vi-VN') 
                                                : "N/A"}
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <button 
                                                    onClick={() => {
                                                        setSelectedCategory(category);
                                                        setIsDetailOpen(true);
                                                    }}
                                                    className="flex h-7 w-7 items-center justify-center rounded-md text-[#958981] hover:bg-[#f4ece7] hover:text-[#604238]"
                                                    title="Chi tiết"
                                                >
                                                    <Eye size={14} />
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        setSelectedCategory(category);
                                                        setIsFormOpen(true);
                                                    }}
                                                    className="flex h-7 w-7 items-center justify-center rounded-md text-[#958981] hover:bg-[#eaf1ff] hover:text-blue-600"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        setSelectedCategory(category);
                                                        setIsDeleteOpen(true);
                                                    }}
                                                    className="flex h-7 w-7 items-center justify-center rounded-md text-[#958981] hover:bg-[#ffeeec] hover:text-red-600"
                                                    title="Xóa"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && categories.length > 0 && (
                    <div className="flex items-center justify-between border-t border-[#eee5df] px-4 py-3">
                        <p className="text-[10px] text-[#847770]">
                            Hiển thị <b className="text-[#4e433d]">{pagination.from}–{pagination.to}</b> trên <b className="text-[#4e433d]">{pagination.total}</b> danh mục
                        </p>
                        <div className="flex items-center gap-1">
                            <button 
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="flex h-7 items-center gap-1 rounded-md border border-[#ece4df] px-2 text-[10px] text-[#958981] hover:bg-[#faf8f6] disabled:opacity-50"
                            >
                                Trước
                            </button>
                            <button className="h-7 w-7 rounded-md bg-[#604238] text-[10px] font-semibold text-white">
                                {page}
                            </button>
                            <button 
                                onClick={() => setPage(p => Math.min(pagination.last_page, p + 1))}
                                disabled={page === pagination.last_page}
                                className="flex h-7 items-center gap-1 rounded-md border border-[#ece4df] px-2 text-[10px] text-[#958981] hover:bg-[#faf8f6] disabled:opacity-50"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <CategoryFormModal 
                isOpen={isFormOpen} 
                onClose={() => setIsFormOpen(false)} 
                initialData={selectedCategory}
                onSuccess={() => {
                    setIsFormOpen(false);
                    fetchCategories();
                }}
            />

            <CategoryDetailModal 
                isOpen={isDetailOpen} 
                onClose={() => setIsDetailOpen(false)} 
                category={selectedCategory}
                onEdit={(cat) => {
                    setSelectedCategory(cat);
                    setIsFormOpen(true);
                }}
            />

            <DeleteCategoryModal 
                isOpen={isDeleteOpen} 
                onClose={() => setIsDeleteOpen(false)} 
                category={selectedCategory}
                onSuccess={() => {
                    setIsDeleteOpen(false);
                    fetchCategories();
                }}
            />
        </div>
    );
};

export default CategoriesTab;
