import React, { useState, useEffect } from "react";
import { Search, Coffee, Loader2, Plus } from "lucide-react";
import { staffMenuService } from "../../../services/staff/menu.service";
import { showError } from "../../../utils/toast";
import { getApiErrorMessage } from "../../../utils/apiError";
import CreateOrderModal from "../../../components/staff/orders/CreateOrderModal";

export default function StaffMenu() {
    const [search, setSearch] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [categoriesRes, productsRes] = await Promise.all([
                staffMenuService.getCategories(),
                staffMenuService.getProducts()
            ]);
            setCategories(Array.isArray(categoriesRes) ? categoriesRes : []);
            setProducts(Array.isArray(productsRes) ? productsRes : []);
        } catch (error) {
            showError(getApiErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredMenu = products.filter((item) => {
        if (selectedCategoryId && item.category_id !== selectedCategoryId) return false;
        if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="p-4 sm:p-6 pb-20">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#49332b]">Thực đơn</h1>
                    <p className="mt-1 text-sm text-[#958981]">
                        Xem danh sách các món đang phục vụ tại CafeFlow.
                    </p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-[#604238] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#49332b]"
                >
                    <Plus size={18} />
                    Tạo đơn mới
                </button>
            </div>

            {/* TOOLBAR */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex overflow-x-auto pb-2 sm:pb-0 hide-scrollbar gap-2">
                    <button
                        onClick={() => setSelectedCategoryId("")}
                        className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                            selectedCategoryId === ""
                                ? "bg-[#604238] text-white"
                                : "bg-white text-[#625751] border border-[#E9DFD8] hover:bg-gray-50"
                        }`}
                    >
                        Tất cả
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategoryId(cat.id)}
                            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                                selectedCategoryId === cat.id
                                    ? "bg-[#604238] text-white"
                                    : "bg-white text-[#625751] border border-[#E9DFD8] hover:bg-gray-50"
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
                
                <div className="relative w-full sm:w-64">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search size={16} className="text-[#958981]" />
                    </div>
                    <input
                        type="text"
                        placeholder="Tìm món..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="block w-full rounded-full border border-[#E9DFD8] bg-white py-2 pl-10 pr-4 text-sm text-[#49332b] focus:border-[#604238] focus:outline-none focus:ring-1 focus:ring-[#604238]"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex h-40 items-center justify-center">
                    <Loader2 className="animate-spin text-[#9c513d]" size={32} />
                </div>
            ) : (
                <>
                    {/* MENU GRID */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filteredMenu.map((item) => (
                            <div key={item.id} className="rounded-xl border border-[#E9DFD8] bg-white overflow-hidden hover:shadow-md transition flex flex-col">
                                <div className="h-32 bg-[#f3efec] flex items-center justify-center relative">
                                    {item.image_url ? (
                                        <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <Coffee size={32} className="text-[#d8c8bd]" />
                                    )}
                                    {item.status === 'INACTIVE' && (
                                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-200 shadow-sm backdrop-blur-sm">
                                                Ngừng bán
                                            </span>
                                        </div>
                                    )}
                                    {item.status === 'OUT_OF_STOCK' && (
                                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-200 shadow-sm backdrop-blur-sm">
                                                Hết món
                                            </span>
                                        </div>
                                    )}
                                    {item.status === 'ACTIVE' && item.recipe_configured === false && (
                                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[10px] font-bold border border-gray-200 shadow-sm backdrop-blur-sm">
                                                Chưa có công thức
                                            </span>
                                        </div>
                                    )}
                                    {item.status === 'ACTIVE' && item.recipe_configured !== false && item.inventory_available === false && (
                                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                            <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[10px] font-bold border border-orange-200 shadow-sm backdrop-blur-sm">
                                                Hết nguyên liệu
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <span className="text-[10px] font-semibold text-[#958981] uppercase tracking-wider mb-1">{item.category?.name}</span>
                                    <h3 className="font-bold text-[#49332b] text-sm mb-2 leading-tight flex-1">{item.name}</h3>
                                    <p className="font-bold text-[#604238]">{Number(item.price).toLocaleString()} ₫</p>
                                    
                                    <button 
                                        disabled={item.status !== 'ACTIVE' || item.recipe_configured === false || item.inventory_available === false}
                                        onClick={() => setIsCreateModalOpen(true)}
                                        className={`mt-3 w-full rounded-lg py-2 text-xs font-bold transition shadow-sm
                                            ${(item.status === 'ACTIVE' && item.recipe_configured !== false && item.inventory_available !== false)
                                                ? 'bg-[#f4ddd3] text-[#9c513d] hover:bg-[#ebc4b5]' 
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        Tạo đơn
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredMenu.length === 0 && (
                        <div className="py-20 text-center rounded-xl border border-dashed border-[#E9DFD8] bg-white">
                            <Coffee size={48} className="mx-auto text-[#d8c8bd] mb-3" />
                            <p className="font-semibold text-[#49332b]">Không tìm thấy món phù hợp</p>
                        </div>
                    )}
                </>
            )}

            {isCreateModalOpen && (
                <CreateOrderModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={() => {
                        setIsCreateModalOpen(false);
                        // Can refresh table/orders state here if needed, but menu doesn't need to refresh products unless they changed
                    }}
                    initialOrderType="DINE_IN"
                />
            )}
        </div>
    );
}
