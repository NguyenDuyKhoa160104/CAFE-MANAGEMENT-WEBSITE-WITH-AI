import React, { useState, useEffect } from "react";
import { Coffee, EyeOff, Package, Plus, RefreshCw, Search, Eye, Pencil, Trash2, Image as ImageIcon, Star } from "lucide-react";
import ProductStatusBadge from "./ProductStatusBadge";
import ProductFormModal from "./ProductFormModal";
import ProductDetailModal from "./ProductDetailModal";
import DeleteProductModal from "./DeleteProductModal";
import { productService } from "../../../services/admin/product.service";
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

const ProductsTab = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0, from: 0, to: 0 });

    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [categoryId, setCategoryId] = useState("ALL");
    const [status, setStatus] = useState("ALL");
    const [sort, setSort] = useState("sort_order_asc");
    const [page, setPage] = useState(1);

    // Modals state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Status loading tracking
    const [actionLoadingMap, setActionLoadingMap] = useState({});

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
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [page, search, categoryId, status, sort]);

    const fetchCategories = async () => {
        try {
            const response = await categoryService.getAll({ status: 'ACTIVE', sort: 'name_asc' });
            let data = [];
            if (response.data && Array.isArray(response.data.data)) {
                data = response.data.data;
            } else if (Array.isArray(response.data)) {
                data = response.data;
            } else if (Array.isArray(response)) {
                data = response;
            }
            setCategories(data);
        } catch (error) {
            console.error("Fetch categories error:", error);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                sort
            };
            if (search) params.search = search;
            if (categoryId !== "ALL") params.category_id = categoryId;
            if (status !== "ALL") params.status = status;

            const response = await productService.getAll(params);
            
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
            
            setProducts(data);
            setPagination({
                current_page: meta.current_page || 1,
                last_page: meta.last_page || 1,
                total: meta.total || data.length,
                from: meta.from || (data.length > 0 ? 1 : 0),
                to: meta.to || data.length
            });
        } catch (error) {
            console.error("Fetch products error:", error);
            showError("Không thể tải danh sách sản phẩm");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (product) => {
        const loadingKey = `status_${product.id}`;
        if (actionLoadingMap[loadingKey]) return;

        // Toggle logic: ACTIVE -> INACTIVE, INACTIVE/OUT_OF_STOCK -> ACTIVE
        const newStatus = product.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
        
        setActionLoadingMap(prev => ({ ...prev, [loadingKey]: true }));
        try {
            const response = await productService.updateStatus(product.id, newStatus);
            showSuccess(response?.message || "Cập nhật trạng thái thành công");
            setProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: newStatus } : p));
        } catch (error) {
            const message = error.response?.data?.message || "Lỗi cập nhật trạng thái";
            showError(message);
        } finally {
            setActionLoadingMap(prev => ({ ...prev, [loadingKey]: false }));
        }
    };

    const handleToggleFeatured = async (product) => {
        const loadingKey = `featured_${product.id}`;
        if (actionLoadingMap[loadingKey]) return;

        const newFeatured = !product.is_featured;
        
        setActionLoadingMap(prev => ({ ...prev, [loadingKey]: true }));
        try {
            const response = await productService.toggleFeatured(product.id, newFeatured);
            showSuccess(response?.message || "Cập nhật nổi bật thành công");
            setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_featured: newFeatured } : p));
        } catch (error) {
            const message = error.response?.data?.message || "Lỗi cập nhật nổi bật";
            showError(message);
        } finally {
            setActionLoadingMap(prev => ({ ...prev, [loadingKey]: false }));
        }
    };

    const handleRefresh = () => {
        setSearchInput("");
        setSearch("");
        setCategoryId("ALL");
        setStatus("ALL");
        setSort("sort_order_asc");
        setPage(1);
        fetchProducts();
    };

    const activeCount = products.filter(item => item.status === "ACTIVE").length;
    const inactiveCount = products.filter(item => item.status === "INACTIVE").length;

    return (
        <div className="space-y-4">
            {/* SECTION HEADER */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-base font-bold text-[#302723]">Danh sách sản phẩm</h2>
                    <p className="mt-1 text-xs text-[#958981]">Quản lý các món đang kinh doanh trong thực đơn.</p>
                </div>
                <button 
                    onClick={() => {
                        setSelectedProduct(null);
                        setIsFormOpen(true);
                    }}
                    className="flex h-10 items-center gap-2 rounded-lg bg-[#604238] px-4 text-xs font-semibold text-white hover:bg-[#50362f]"
                >
                    <Plus size={16} />
                    Thêm sản phẩm
                </button>
            </div>

            {/* SUMMARY */}
            <div className="grid gap-3 md:grid-cols-3">
                <SummaryCard
                    icon={<Coffee size={18} />}
                    label="TỔNG SẢN PHẨM"
                    value={pagination.total}
                    text="Sản phẩm trên hệ thống"
                />
                <SummaryCard
                    icon={<Package size={18} />}
                    label="ĐANG BÁN"
                    value={activeCount}
                    text="Sản phẩm hiển thị"
                />
                <SummaryCard
                    icon={<EyeOff size={18} />}
                    label="ĐANG ẨN"
                    value={inactiveCount}
                    text="Tạm ngừng bán"
                />
            </div>

            {/* TOOLBAR */}
            <div className="flex flex-col gap-3 rounded-xl border border-[#eee5df] bg-white p-3 lg:flex-row">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9c918a]" />
                    <input
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Tìm kiếm sản phẩm theo tên, mã..."
                        className="h-10 w-full rounded-lg border border-[#e8dfd9] bg-[#faf8f6] pl-10 pr-3 text-xs outline-none focus:border-[#604238]"
                    />
                </div>

                <select
                    value={categoryId}
                    onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
                    className="h-10 rounded-lg border border-[#e8dfd9] bg-white px-3 text-xs outline-none focus:border-[#604238]"
                >
                    <option value="ALL">Tất cả danh mục</option>
                    {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>

                <select
                    value={status}
                    onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                    className="h-10 rounded-lg border border-[#e8dfd9] bg-white px-3 text-xs outline-none focus:border-[#604238]"
                >
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="ACTIVE">Đang bán</option>
                    <option value="INACTIVE">Đang ẩn</option>
                    <option value="OUT_OF_STOCK">Hết hàng</option>
                </select>
                
                <select
                    value={sort}
                    onChange={(e) => { setSort(e.target.value); setPage(1); }}
                    className="h-10 rounded-lg border border-[#e8dfd9] bg-white px-3 text-xs outline-none focus:border-[#604238]"
                >
                    <option value="sort_order_asc">Thứ tự tăng dần</option>
                    <option value="sort_order_desc">Thứ tự giảm dần</option>
                    <option value="name_asc">Tên A-Z</option>
                    <option value="name_desc">Tên Z-A</option>
                    <option value="price_asc">Giá tăng dần</option>
                    <option value="price_desc">Giá giảm dần</option>
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
                                <Th>SẢN PHẨM</Th>
                                <Th>MÃ SP</Th>
                                <Th>DANH MỤC</Th>
                                <Th>GIÁ BÁN</Th>
                                <Th>NỔI BẬT</Th>
                                <Th>TRẠNG THÁI</Th>
                                <Th>NGÀY TẠO</Th>
                                <Th>THAO TÁC</Th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="py-10 text-center text-sm text-[#958981]">
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="py-10">
                                        <div className="flex flex-col items-center justify-center text-center">
                                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f4ece7] text-[#958981]">
                                                <Coffee size={24} />
                                            </div>
                                            <p className="text-sm font-semibold text-[#302723]">
                                                {search || status !== "ALL" || categoryId !== "ALL" ? "Không tìm thấy sản phẩm phù hợp" : "Chưa có sản phẩm nào"}
                                            </p>
                                            <p className="mt-1 text-xs text-[#958981]">
                                                {search || status !== "ALL" || categoryId !== "ALL" 
                                                    ? "Hãy thử thay đổi từ khóa hoặc bộ lọc."
                                                    : "Hãy thêm sản phẩm đầu tiên vào thực đơn."}
                                            </p>
                                            {!search && status === "ALL" && categoryId === "ALL" && (
                                                <button 
                                                    onClick={() => setIsFormOpen(true)}
                                                    className="mt-4 flex h-9 items-center gap-2 rounded-lg border border-[#e8dfd9] px-4 text-xs font-semibold text-[#574943] hover:bg-[#faf8f6]"
                                                >
                                                    <Plus size={14} /> Thêm sản phẩm
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                products.map((product, index) => (
                                    <tr key={product.id} className="border-b border-[#f1ebe7] last:border-0 hover:bg-[#fdfbf9]">
                                        <td className="px-4 py-3 text-xs text-[#80736c]">{pagination.from + index}</td>
                                        
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#e8dfd9] bg-[#f4ece7] text-[#604238]">
                                                    {product.image ? (
                                                        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <ImageIcon size={18} />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-[#302723]">{product.name}</p>
                                                    <p className="mt-0.5 max-w-[200px] truncate text-[10px] text-[#958981]" title={product.description}>
                                                        {product.description || "Không có mô tả"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3">
                                            <span className="rounded-md bg-[#f1ece9] px-2 py-1 font-mono text-[10px] text-[#574943]">
                                                {product.product_code || product.code}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3">
                                            <span className="rounded-full border border-[#e8dfd9] bg-[#faf8f6] px-2.5 py-1 text-[10px] font-semibold text-[#574943]">
                                                {product.category?.name || "Không có"}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3">
                                            <span className="text-xs font-bold text-[#604238]">
                                                {product.price ? product.price.toLocaleString("vi-VN") : 0} ₫
                                            </span>
                                        </td>
                                        
                                        <td className="px-4 py-3">
                                            <button 
                                                disabled={actionLoadingMap[`featured_${product.id}`]}
                                                onClick={() => handleToggleFeatured(product)}
                                                className={`flex h-7 w-7 items-center justify-center rounded-full disabled:opacity-50 transition-colors ${
                                                    product.is_featured 
                                                        ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100' 
                                                        : 'text-gray-300 hover:text-yellow-500 hover:bg-gray-50'
                                                }`}
                                            >
                                                <Star size={16} fill={product.is_featured ? "currentColor" : "none"} />
                                            </button>
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <ProductStatusBadge status={product.status} />
                                                
                                                {/* Toggle Switch - quick status toggle */}
                                                <button
                                                    type="button"
                                                    disabled={actionLoadingMap[`status_${product.id}`]}
                                                    onClick={() => handleToggleStatus(product)}
                                                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                                                        product.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-300'
                                                    }`}
                                                >
                                                    <span
                                                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                            product.status === 'ACTIVE' ? 'translate-x-4' : 'translate-x-0'
                                                        }`}
                                                    />
                                                </button>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-[11px] text-[#574943]">
                                            {product.created_at || product.createdAt 
                                                ? new Date(product.created_at || product.createdAt).toLocaleDateString('vi-VN') 
                                                : "N/A"}
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <button 
                                                    onClick={() => {
                                                        setSelectedProduct(product);
                                                        setIsDetailOpen(true);
                                                    }}
                                                    className="flex h-7 w-7 items-center justify-center rounded-md text-[#958981] hover:bg-[#f4ece7] hover:text-[#604238]"
                                                    title="Chi tiết"
                                                >
                                                    <Eye size={14} />
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        setSelectedProduct(product);
                                                        setIsFormOpen(true);
                                                    }}
                                                    className="flex h-7 w-7 items-center justify-center rounded-md text-[#958981] hover:bg-[#eaf1ff] hover:text-blue-600"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        setSelectedProduct(product);
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

                {!loading && products.length > 0 && (
                    <div className="flex items-center justify-between border-t border-[#eee5df] px-4 py-3">
                        <p className="text-[10px] text-[#847770]">
                            Hiển thị <b className="text-[#4e433d]">{pagination.from}–{pagination.to}</b> trên <b className="text-[#4e433d]">{pagination.total}</b> sản phẩm
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

            <ProductFormModal 
                isOpen={isFormOpen} 
                onClose={() => setIsFormOpen(false)} 
                initialData={selectedProduct}
                onSuccess={() => {
                    setIsFormOpen(false);
                    fetchProducts();
                }}
            />

            <ProductDetailModal 
                isOpen={isDetailOpen} 
                onClose={() => setIsDetailOpen(false)} 
                product={selectedProduct}
                onEdit={(p) => {
                    setSelectedProduct(p);
                    setIsFormOpen(true);
                }}
            />

            <DeleteProductModal 
                isOpen={isDeleteOpen} 
                onClose={() => setIsDeleteOpen(false)} 
                product={selectedProduct}
                onSuccess={() => {
                    setIsDeleteOpen(false);
                    fetchProducts();
                }}
            />
        </div>
    );
};

export default ProductsTab;
