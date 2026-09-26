import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { useCustomerCart } from '../../contexts/CustomerCartContext';
import { ShoppingCart, Menu as MenuIcon, User, X, ChevronDown, LogOut, ReceiptText, LockKeyhole } from 'lucide-react';
import BrandLogo from '../common/BrandLogo';

const CustomerHeader = () => {
    const { isAuthenticated, customer, logoutCustomer } = useCustomerAuth();
    const { cartCount } = useCustomerCart();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logoutCustomer();
            navigate('/');
            setIsDropdownOpen(false);
        } catch (error) {
            console.error(error);
        }
    };

    const navLinks = [
        { path: '/', label: 'Trang chủ' },
        { path: '/menu', label: 'Thực đơn' },
        { path: '/reservation', label: 'Đặt bàn' },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm h-16 text-[#302723]">
            <div className="container mx-auto px-4 h-full flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                    <BrandLogo className="h-10 md:h-12 scale-[1.1] md:scale-[1.2] origin-left" />
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex space-x-8">
                    {navLinks.map((link) => (
                        <NavLink 
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) => 
                                `hover:text-[#604238] transition-colors ${isActive ? 'font-semibold text-[#604238]' : ''}`
                            }
                        >
                            {link.label}
                        </NavLink>
                    ))}
                    <NavLink 
                        to="/orders"
                        className={({ isActive }) => 
                            `hover:text-[#604238] transition-colors ${isActive ? 'font-semibold text-[#604238]' : ''}`
                        }
                    >
                        Đơn hàng
                    </NavLink>
                </nav>

                {/* Right side actions */}
                <div className="flex items-center space-x-6">
                    <Link to="/cart" className="relative hover:text-[#604238]">
                        <ShoppingCart className="text-xl" />
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-[#604238] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    <div className="hidden md:block">
                        {isAuthenticated ? (
                            <div className="relative">
                                <button 
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center space-x-2 focus:outline-none hover:text-[#604238]"
                                >
                                    {customer?.avatar ? (
                                        <img src={customer.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                                    ) : (
                                        <User className="text-xl" />
                                    )}
                                    <span className="max-w-[100px] truncate">{customer?.full_name}</span>
                                </button>
                                
                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-100">
                                        <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsDropdownOpen(false)}>Hồ sơ cá nhân</Link>
                                        <Link to="/vouchers" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between" onClick={() => setIsDropdownOpen(false)}>
                                            <span>Ví Voucher</span>
                                        </Link>
                                        <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsDropdownOpen(false)}>Đơn hàng của tôi</Link>
                                        <Link to="/invoices" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsDropdownOpen(false)}>Hóa đơn</Link>
                                        <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Đăng xuất</button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-x-4">
                                <Link to="/login" className="hover:text-[#604238]">Đăng nhập</Link>
                                <Link to="/register" className="bg-[#604238] text-white px-4 py-2 rounded-full hover:bg-[#302723] transition-colors">Đăng ký</Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button 
                        className="md:hidden text-2xl"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X /> : <MenuIcon />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 absolute w-full left-0 shadow-md pb-4">
                    <nav className="flex flex-col space-y-4 pt-4 px-4">
                        {navLinks.map((link) => (
                            <NavLink 
                                key={link.path}
                                to={link.path}
                                className={({ isActive }) => `block ${isActive ? 'font-semibold text-[#604238]' : ''}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.label}
                            </NavLink>
                        ))}
                        <NavLink to="/orders" className={({ isActive }) => `block ${isActive ? 'font-semibold text-[#604238]' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>Đơn hàng</NavLink>
                        
                        <div className="border-t border-gray-100 pt-4">
                            {isAuthenticated ? (
                                <>
                                    <div className="font-semibold mb-2">{customer?.full_name}</div>
                                    <Link to="/profile" className="block py-2" onClick={() => setIsMobileMenuOpen(false)}>Hồ sơ</Link>
                                    <Link to="/vouchers" className="block py-2" onClick={() => setIsMobileMenuOpen(false)}>Ví Voucher</Link>
                                    <Link to="/invoices" className="block py-2" onClick={() => setIsMobileMenuOpen(false)}>Hóa đơn</Link>
                                    <button onClick={handleLogout} className="block py-2 w-full text-left text-red-600">Đăng xuất</button>
                                </>
                            ) : (
                                <div className="flex flex-col space-y-2">
                                    <Link to="/login" className="py-2" onClick={() => setIsMobileMenuOpen(false)}>Đăng nhập</Link>
                                    <Link to="/register" className="py-2 text-[#604238] font-semibold" onClick={() => setIsMobileMenuOpen(false)}>Đăng ký</Link>
                                </div>
                            )}
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default CustomerHeader;
