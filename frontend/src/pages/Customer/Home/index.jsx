import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Coffee, ArrowRight, Store, Bike, Sparkles } from 'lucide-react';
import { customerMenuService } from '../../../services/customer/menu.service';
import ProductCard from '../../../components/customer/ProductCard';
import BrandLogo from '../../../components/common/BrandLogo';

const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                // If API doesn't support ?is_featured=1, we get all and filter
                const response = await customerMenuService.getProducts();
                const products = response.data || response; // Handle based on axios unwrap
                const featured = (Array.isArray(products) ? products : []).filter(p => p.is_featured);
                setFeaturedProducts(featured.slice(0, 4)); // Show max 4
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeatured();
    }, []);

    return (
        <div className="bg-[#F7F4F1] min-h-screen pt-16">
            {/* Hero Section */}
            <section className="relative bg-[#302723] text-white py-24 px-4 overflow-hidden">
                <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-[#604238]/20 blur-3xl" />
                <div className="absolute -right-32 -bottom-32 h-[500px] w-[500px] rounded-full bg-[#E9DFD8]/10 blur-3xl" />
                
                <div className="container mx-auto max-w-4xl relative z-10 flex flex-col items-center text-center">
                    <div className="mb-8 p-4 bg-white/5 rounded-3xl backdrop-blur-sm border border-white/10">
                        <BrandLogo className="h-20 md:h-24 brightness-0 invert opacity-90 drop-shadow-lg" />
                    </div>
                    
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-white tracking-tight">
                        Thưởng thức cà phê <br className="hidden md:block" />
                        <span className="text-[#E9DFD8]">theo cách của bạn</span>
                    </h1>
                    
                    <p className="text-lg md:text-xl mb-10 text-[#E9DFD8]/80 max-w-2xl font-light">
                        Không gian ấm cúng, hương vị đậm đà. Đặt trước, mang đi hoặc thư giãn tại không gian của chúng tôi.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
                        <Link to="/menu" className="flex items-center justify-center gap-2 bg-[#604238] hover:bg-[#4a332b] text-white px-8 py-4 rounded-full font-semibold transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-xl">
                            <Coffee size={20} />
                            Khám phá Thực đơn
                        </Link>
                        <Link to="/reservation" className="flex items-center justify-center gap-2 bg-transparent border-2 border-[#E9DFD8] hover:bg-[#E9DFD8] hover:text-[#302723] text-white px-8 py-4 rounded-full font-semibold transition-all transform hover:-translate-y-1">
                            <Store size={20} />
                            Đặt bàn ngay
                        </Link>
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-20 container mx-auto px-4">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 text-[#604238] font-semibold mb-3 bg-[#E9DFD8]/50 px-4 py-1.5 rounded-full text-sm">
                        <Sparkles size={16} />
                        Lựa chọn của chúng tôi
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-[#302723]">Món Nổi Bật</h2>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#E9DFD8] border-t-[#604238]"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {featuredProducts.length > 0 ? (
                            featuredProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))
                        ) : (
                            <p className="col-span-full text-center text-[#958981] py-8 bg-white rounded-2xl border border-[#E9DFD8] border-dashed">
                                Đang cập nhật món nổi bật. Vui lòng quay lại sau.
                            </p>
                        )}
                    </div>
                )}
                
                <div className="text-center mt-12">
                    <Link to="/menu" className="inline-flex items-center text-[#604238] font-semibold hover:text-[#4a332b] group">
                        Xem tất cả thực đơn 
                        <ArrowRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </section>

            {/* Features/Why us */}
            <section className="bg-white py-24 px-4 border-t border-[#E9DFD8]">
                <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-[#302723]">Vì sao chọn CafeFlow?</h2>
                        <p className="mt-4 text-[#958981] max-w-2xl mx-auto">Trải nghiệm dịch vụ tuyệt vời và chất lượng cà phê hảo hạng.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
                        <div className="flex flex-col items-center text-center group">
                            <div className="w-20 h-20 bg-[#F7F4F1] rounded-2xl flex items-center justify-center text-[#604238] mb-6 transform group-hover:-translate-y-2 transition-transform duration-300">
                                <Coffee className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-[#302723] mb-3">Cà Phê Nguyên Bản</h3>
                            <p className="text-[#958981] leading-relaxed">Chúng tôi sử dụng hạt cà phê được chọn lọc kỹ lưỡng, rang xay và pha chế với công thức chuẩn mực.</p>
                        </div>
                        
                        <div className="flex flex-col items-center text-center group">
                            <div className="w-20 h-20 bg-[#F7F4F1] rounded-2xl flex items-center justify-center text-[#604238] mb-6 transform group-hover:-translate-y-2 transition-transform duration-300">
                                <Store className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-[#302723] mb-3">Không Gian Cảm Hứng</h3>
                            <p className="text-[#958981] leading-relaxed">Nơi hoàn hảo để làm việc, gặp gỡ đối tác hay đơn giản là tận hưởng những phút giây thư giãn yên bình.</p>
                        </div>
                        
                        <div className="flex flex-col items-center text-center group">
                            <div className="w-20 h-20 bg-[#F7F4F1] rounded-2xl flex items-center justify-center text-[#604238] mb-6 transform group-hover:-translate-y-2 transition-transform duration-300">
                                <Bike className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-[#302723] mb-3">Tiện Lợi Tối Đa</h3>
                            <p className="text-[#958981] leading-relaxed">Đặt món dễ dàng qua website, nhận đồ uống nhanh chóng không cần chờ đợi. Hỗ trợ đặt bàn trước.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
