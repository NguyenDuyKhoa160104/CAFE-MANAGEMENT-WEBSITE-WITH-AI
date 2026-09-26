import React, { useEffect, useState } from 'react';
import { customerMenuService } from '../../../services/customer/menu.service';
import ProductCard from '../../../components/customer/ProductCard';
import { Search, SearchX, Coffee } from 'lucide-react';

const Menu = () => {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchMenuData = async () => {
            try {
                const [catRes, prodRes] = await Promise.all([
                    customerMenuService.getCategories(),
                    customerMenuService.getProducts()
                ]);
                
                // Handle unwrapped response from axios
                const catData = catRes.data || catRes || [];
                const prodData = prodRes.data || prodRes || [];
                
                setCategories(Array.isArray(catData) ? catData : (catData.data || []));
                setProducts(Array.isArray(prodData) ? prodData : (prodData.data || []));
            } catch (error) {
                console.error("Failed to load menu", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMenuData();
    }, []);

    const filteredProducts = products.filter(product => {
        const matchCategory = activeCategory === 'all' || product.category_id === activeCategory;
        const matchSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCategory && matchSearch;
    });

    return (
        <div className="bg-[#F7F4F1] min-h-screen pt-24 pb-16">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-[#302723] mb-4">Khám phá Thực đơn</h1>
                    <p className="text-[#958981] mb-8 max-w-2xl mx-auto">
                        Từ những tách cà phê đậm vị đến các loại trà thanh mát, mỗi thức uống đều được chúng tôi chăm chút bằng cả đam mê.
                    </p>
                    
                    <div className="max-w-xl mx-auto relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#958981] group-focus-within:text-[#604238] transition-colors">
                            <Search size={20} />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm đồ uống yêu thích của bạn..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl border-none bg-white shadow-sm focus:ring-2 focus:ring-[#604238]/20 text-[#302723] transition-all"
                        />
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Sidebar Categories */}
                    <div className="w-full lg:w-1/4 sticky top-24 z-10">
                        <div className="bg-white rounded-3xl shadow-sm p-6 border border-[#E9DFD8]">
                            <h3 className="font-bold text-[#302723] text-lg mb-4 flex items-center gap-2">
                                <Coffee size={20} className="text-[#604238]" />
                                Danh mục
                            </h3>
                            
                            <ul className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-2 pb-2 lg:pb-0 hide-scrollbar">
                                <li>
                                    <button 
                                        onClick={() => setActiveCategory('all')}
                                        className={`w-full whitespace-nowrap text-left px-5 py-3 rounded-xl transition-all text-sm font-semibold ${
                                            activeCategory === 'all' 
                                            ? 'bg-[#604238] text-white shadow-md' 
                                            : 'bg-[#F7F4F1] hover:bg-[#E9DFD8] text-[#6d625d]'
                                        }`}
                                    >
                                        Tất cả
                                    </button>
                                </li>
                                {categories.map(cat => (
                                    <li key={cat.id}>
                                        <button 
                                            onClick={() => setActiveCategory(cat.id)}
                                            className={`w-full whitespace-nowrap text-left px-5 py-3 rounded-xl transition-all text-sm font-semibold ${
                                                activeCategory === cat.id 
                                                ? 'bg-[#604238] text-white shadow-md' 
                                                : 'bg-[#F7F4F1] hover:bg-[#E9DFD8] text-[#6d625d]'
                                            }`}
                                        >
                                            {cat.name}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="w-full lg:w-3/4">
                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#E9DFD8] border-t-[#604238]"></div>
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredProducts.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl shadow-sm p-16 text-center border border-[#E9DFD8] flex flex-col items-center">
                                <div className="w-24 h-24 bg-[#F7F4F1] rounded-full flex items-center justify-center mb-6 text-[#958981]">
                                    <SearchX size={48} />
                                </div>
                                <h3 className="text-2xl font-bold text-[#302723] mb-2">Không tìm thấy sản phẩm</h3>
                                <p className="text-[#958981] max-w-sm">
                                    Rất tiếc, chúng tôi không tìm thấy đồ uống nào phù hợp với tìm kiếm của bạn. Hãy thử lại bằng từ khóa khác.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Menu;
