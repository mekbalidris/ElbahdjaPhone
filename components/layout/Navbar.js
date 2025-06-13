import React, { useState, useEffect, Fragment, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';
import { Search, ChevronDown, ShoppingCart, UserCircle, LogOut, LayoutDashboard, User, Menu, X, ArrowRight, Mail, MapPin, Phone } from 'lucide-react';
import Icon from '../ui/Icon';
import Button from '../ui/Button';

// --- Color Palette (Client Inspired) ---
const brandOrange = { text: 'text-red-600', bg: 'bg-red-600', hoverBg: 'hover:bg-red-700', ring: 'focus:ring-red-500' };
const brandPurple = { text: 'text-slate-800', hoverText: 'hover:text-slate-900', ring: 'focus:ring-slate-500', bg: 'bg-slate-800' };

// --- Sub-Components for Navbar ---
const NavLink = ({ href, children }) => {
    const router = useRouter();
    const isActive = router.pathname === href;
    return (
        <Link href={href} legacyBehavior>
            <a className={`group relative py-2 text-sm font-medium transition-colors duration-200 ease-in-out ${isActive ? brandOrange.text : `text-slate-700 hover:${brandOrange.text}`}`}>
                {children}
                <span className={`absolute bottom-0 left-0 block h-0.5 ${brandOrange.bg} transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </a>
        </Link>
    );
};

const MegaMenu = ({ closeMobileMenu }) => {
    const router = useRouter();
    const [featuredProduct, setFeaturedProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFeaturedProduct = async () => {
            try {
                const response = await fetch('/api/products');
                if (!response.ok) throw new Error('Failed to fetch products');
                const products = await response.json();
                const featuredProducts = products.filter(p => p.featured);
                if (featuredProducts.length > 0) {
                    setFeaturedProduct(featuredProducts[featuredProducts.length - 1]); // Get the last featured product
                }
            } catch (error) {
                console.error('Error fetching featured product:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFeaturedProduct();
    }, []);

    const categories = [
        { name: 'Phones', href: '/products?category=phones' },
        { name: 'Laptops', href: '/products?category=laptops' },
        { name: 'Accessories', href: '/products?category=accessories' },
        { name: 'Watches', href: '/products?category=watches' }
    ];
    const brands = [
        { name: 'Apple', href: '/products?brand=apple' },
        { name: 'Samsung', href: '/products?brand=samsung' },
        { name: 'Xiaomi', href: '/products?brand=xiaomi' }
    ];
    
    const handleLinkClick = (href) => {
        router.push(href);
        if (closeMobileMenu) closeMobileMenu();
    };

    return (
        <div className="absolute -left-1/2 top-full mt-1 w-screen max-w-4xl transform -translate-x-1/4">
            <div className="bg-white rounded-2xl shadow-2xl ring-1 ring-black ring-opacity-5 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">
                    <div className="col-span-2 grid grid-cols-2 gap-y-8 gap-x-8">
                        <div>
                            <p className={`font-bold ${brandPurple.text}`}>Shop by Category</p>
                            <div className="mt-4 flex flex-col space-y-3">
                                {categories.map(item => (
                                    <a 
                                        key={item.name} 
                                        href={item.href} 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleLinkClick(item.href);
                                        }} 
                                        className="text-slate-600 hover:text-red-600 transition-colors"
                                    >
                                        {item.name}
                                    </a>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className={`font-bold ${brandPurple.text}`}>Shop by Brand</p>
                            <div className="mt-4 flex flex-col space-y-3">
                                {brands.map(item => (
                                    <a 
                                        key={item.name} 
                                        href={item.href} 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleLinkClick(item.href);
                                        }} 
                                        className="text-slate-600 hover:text-red-600 transition-colors"
                                    >
                                        {item.name}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                    {isLoading ? (
                        <div className="bg-gray-100 rounded-xl p-6 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                        </div>
                    ) : featuredProduct ? (
                        <a 
                            href={`/products/${featuredProduct._id}`} 
                            onClick={(e) => {
                                e.preventDefault();
                                handleLinkClick(`/products/${featuredProduct._id}`);
                            }} 
                            className="group relative bg-gray-100 rounded-xl p-6 flex flex-col justify-end overflow-hidden"
                        >
                            <img 
                                src={featuredProduct.images?.[0] || featuredProduct.imageUrl || 'https://placehold.co/600x600/FF8C00/FFFFFF?text=Featured'} 
                                className="absolute inset-0 w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105" 
                                alt={featuredProduct.name}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                            <div className="relative z-10">
                                <h3 className="text-white text-lg font-bold">{featuredProduct.name}</h3>
                                <p className="text-gray-300 text-sm mt-1">{featuredProduct.price?.toFixed(2)} DA</p>
                                <div className={`mt-4 inline-block text-sm font-bold ${brandOrange.text} hover:text-amber-400`}>
                                    Shop Now <ArrowRight className="inline w-4 h-4"/>
                                </div>
                            </div>
                        </a>
                    ) : (
                        <div className="bg-gray-100 rounded-xl p-6 flex flex-col justify-center items-center text-center">
                            <p className="text-gray-500">No featured product available</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const Navbar = ({ onCartClick, cartItemCount = 0 }) => {
    const router = useRouter();
    const { currentUser, logout, isLoading: authLoading } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const profileMenuRef = useRef(null);
    const profileButtonRef = useRef(null);

    const navItems = useMemo(() => {
        const items = [{ label: 'Home', href: '/' }];
        if (currentUser?.role === 'seller' || currentUser?.role === 'admin') {
            items.push({ label: 'Dashboard', href: '/dashboard' });
        }
        return items;
    }, [currentUser]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuOpen && 
                profileMenuRef.current && !profileMenuRef.current.contains(event.target) &&
                profileButtonRef.current && !profileButtonRef.current.contains(event.target)) {
                setProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [profileMenuOpen]);

    // Add scroll event listener
    useEffect(() => {
        const controlNavbar = () => {
            const currentScrollY = window.scrollY;
            
            // Show navbar if scrolling up or at the top
            if (currentScrollY < lastScrollY || currentScrollY < 100) {
                setIsVisible(true);
            } 
            // Hide navbar if scrolling down and not at the top
            else if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false);
            }
            
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', controlNavbar);

        // Cleanup
        return () => {
            window.removeEventListener('scroll', controlNavbar);
        };
    }, [lastScrollY]);

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        
        // Update URL with search parameter
        const params = new URLSearchParams(router.query);
        if (value) {
            params.set('search', value);
        } else {
            params.delete('search');
            // Reset all filters when search is cleared
            params.delete('brand');
            params.delete('category');
            params.delete('minPrice');
            params.delete('maxPrice');
            params.delete('sort');
        }
        router.push(`/products?${params.toString()}`, undefined, { shallow: true });
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            // If search is empty, reset all filters
            if (!searchQuery) {
                const params = new URLSearchParams(router.query);
                params.delete('search');
                params.delete('brand');
                params.delete('category');
                params.delete('minPrice');
                params.delete('maxPrice');
                params.delete('sort');
                router.push(`/products?${params.toString()}`, undefined, { shallow: true });
            }
            router.push('/products');
        }
    };

    const handleLogout = async () => {
        setProfileMenuOpen(false);
        setMobileMenuOpen(false);
        try {
            await logout();
            router.push('/');
            toast.success('Logged out successfully');
        } catch (error) {
            toast.error('Logout failed. Please try again.');
        }
    };

    return (
        <nav className={`bg-white/80 backdrop-blur-lg shadow-sm font-sans z-50 transition-transform duration-300 fixed top-0 left-0 right-0 ${
            !isVisible ? '-translate-y-full' : 'translate-y-0'
        }`}>
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-8">
                        <Link href="/" legacyBehavior>
                            <a className="flex-shrink-0 flex items-center">
                                <img src="/logo.png" alt="Logo" className="h-8 w-auto mr-2" onError={(e) => e.target.style.display='none'}/>
                                <span className={`text-xl font-extrabold ${brandOrange.text}`}>Walid</span>
                                <span className={`text-xl font-extrabold ${brandPurple.text} ml-1`}>Phone</span>
                            </a>
                        </Link>
                        <div className="hidden md:flex items-center space-x-6">
                            {navItems.map((item) => (
                                <NavLink key={item.label} href={item.href}>{item.label}</NavLink>
                            ))}
                            <div className="relative group">
                                <Link href="/products" legacyBehavior>
                                    <a className={`flex items-center py-2 text-sm font-medium transition-colors duration-200 ease-in-out ${router.pathname.startsWith('/products') ? brandOrange.text : `text-slate-700 hover:${brandOrange.text}`}`}>
                                        Products <ChevronDown className="w-4 h-4 ml-1 transition-transform group-hover:rotate-180" />
                                    </a>
                                </Link>
                                <div className="absolute top-0 left-0 pt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
                                    <MegaMenu />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <div className="relative flex-1 max-w-xl hidden md:block">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearch}
                                onKeyPress={handleKeyPress}
                                placeholder="Search products..."
                                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            />
                            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            {searchQuery && (
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        const params = new URLSearchParams(router.query);
                                        params.delete('search');
                                        params.delete('brand');
                                        params.delete('category');
                                        params.delete('minPrice');
                                        params.delete('maxPrice');
                                        params.delete('sort');
                                        router.push(`/products?${params.toString()}`, undefined, { shallow: true });
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <Icon name="x" className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                        <button 
                            onClick={onCartClick}
                            className={`relative p-2 rounded-full text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors`} 
                            aria-label="Cart"
                        >
                            <Icon name="cart" className="w-6 h-6" />
                            {cartItemCount > 0 && (
                                <span className={`absolute -top-1.5 -right-1.5 inline-flex items-center justify-center px-1.5 text-[0.65rem] font-bold ${brandOrange.bg} text-white rounded-full ring-2 ring-white`}>
                                    {cartItemCount}
                                </span>
                            )}
                        </button>
                        
                        <div className="hidden md:block">
                            {authLoading ? (
                                <div className="px-3 py-2">
                                    <div className={`animate-spin rounded-full h-5 w-5 border-b-2 ${brandPurple.border}`}></div>
                                </div>
                            ) : currentUser ? (
                                <div className="relative" ref={profileButtonRef}>
                                    <button 
                                        onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                        className={`p-1.5 rounded-full text-slate-600 hover:${brandOrange.text} hover:bg-amber-500/10 focus:outline-none focus:ring-2 ${brandPurple.ring} focus:ring-offset-1 transition-colors`}
                                    >
                                        <Icon name="userCircle" className="w-7 h-7" />
                                    </button>
                                    {profileMenuOpen && (
                                        <div ref={profileMenuRef} className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl py-1 z-20 border border-gray-200/70">
                                            <div className="px-4 py-3 border-b border-gray-200/80">
                                                <p className="text-sm text-slate-800 font-semibold">Signed in as</p>
                                                <p className={`text-sm ${brandPurple.text} truncate font-medium`}>
                                                    {currentUser.name || currentUser.email || "User"}
                                                </p>
                                            </div>
                                            {(currentUser.role === 'seller' || currentUser.role === 'admin') && (
                                                <>
                                                    <Link href="/dashboard" legacyBehavior>
                                                        <a onClick={() => setProfileMenuOpen(false)} className={`flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-amber-500/10 hover:${brandOrange.text}`}>
                                                            <Icon name="dashboard" className="w-4 h-4 mr-2"/>Admin Dashboard
                                                        </a>
                                                    </Link>
                                                    <Link href="/admin/homepage-management" legacyBehavior>
                                                        <a onClick={() => setProfileMenuOpen(false)} className={`flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-amber-500/10 hover:${brandOrange.text}`}>
                                                            <Icon name="home" className="w-4 h-4 mr-2"/>Manage Homepage
                                                        </a>
                                                    </Link>
                                                    <Link href="/admin/support-messages" legacyBehavior>
                                                        <a onClick={() => setProfileMenuOpen(false)} className={`flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-amber-500/10 hover:${brandOrange.text}`}>
                                                            <Icon name="mail" className="w-4 h-4 mr-2"/>Support Messages
                                                        </a>
                                                    </Link>
                                                </>
                                            )}
                                            <Link href="/profile" legacyBehavior>
                                                <a onClick={() => setProfileMenuOpen(false)} className={`flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-amber-500/10 hover:${brandOrange.text}`}>
                                                    <Icon name="user" className="w-4 h-4 mr-2"/>My Profile
                                                </a>
                                            </Link>
                                            <button 
                                                onClick={handleLogout} 
                                                className={`flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-500/10 hover:text-red-700`}
                                            >
                                                <Icon name="logout" className="w-4 h-4 mr-2"/>Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link href="/auth" legacyBehavior>
                                    <a className={`ml-2 px-4 py-2 rounded-xl font-semibold text-sm ${brandOrange.bg} text-white hover:bg-amber-600 transition`}>Login / Signup</a>
                                </Link>
                            )}
                        </div>
                        <div className="md:hidden">
                            <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-slate-600">
                                <Menu className="w-6 h-6"/>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <Transition show={mobileMenuOpen} as={Fragment}>
                <Dialog as="div" className="md:hidden" onClose={setMobileMenuOpen}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black/30 z-40" />
                    </Transition.Child>
                    <Transition.Child as={Fragment} enter="transition ease-in-out duration-300 transform" enterFrom="-translate-x-full" enterTo="translate-x-0" leave="transition ease-in-out duration-300 transform" leaveFrom="translate-x-0" leaveTo="-translate-x-full">
                        <Dialog.Panel className="fixed top-0 bottom-0 left-0 w-full max-w-xs bg-white z-50 p-6">
                            <div className="flex items-center justify-between mb-8">
                                <Link href="/" legacyBehavior>
                                    <a onClick={() => setMobileMenuOpen(false)} className="flex items-center">
                                        <img src="/logo.png" alt="Logo" className="h-8 w-auto"/>
                                    </a>
                                </Link>
                                <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-slate-500 hover:text-slate-800">
                                    <X className="w-6 h-6"/>
                                </button>
                            </div>

                            <form onSubmit={handleSearch} className="mb-6">
                                <div className="relative">
                                    <input 
                                        type="search" 
                                        placeholder="Search..." 
                                        value={searchQuery} 
                                        onChange={(e) => setSearchQuery(e.target.value)} 
                                        className="w-full rounded-full py-2 pl-10 pr-4 bg-gray-100 border-transparent focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm"
                                    />
                                    <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                </div>
                            </form>

                            <nav className="space-y-1">
                                {navItems.map((item) => (
                                    <Link key={item.label} href={item.href} legacyBehavior>
                                        <a 
                                            onClick={() => setMobileMenuOpen(false)} 
                                            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-red-50 hover:text-red-600"
                                        >
                                            {item.label}
                                        </a>
                                    </Link>
                                ))}
                                <Link href="/products" legacyBehavior>
                                    <a 
                                        onClick={() => setMobileMenuOpen(false)} 
                                        className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-red-50 hover:text-red-600"
                                    >
                                        Products
                                    </a>
                                </Link>
                            </nav>

                            <div className="mt-6 pt-6 border-t border-gray-200">
                                {currentUser ? (
                                    <>
                                        <div className="flex items-center px-3 mb-3">
                                            <div className="flex-shrink-0">
                                                <Icon name="userCircle" className={`h-10 w-10 rounded-full ${brandPurple.text}`} />
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-base font-medium text-slate-800">
                                                    {currentUser.name || "User"}
                                                </div>
                                                {currentUser.email && (
                                                    <div className="text-sm font-medium text-slate-500">
                                                        {currentUser.email}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            {(currentUser.role === 'seller' || currentUser.role === 'admin') && (
                                                <>
                                                    <Link href="/dashboard" legacyBehavior>
                                                        <a onClick={() => setMobileMenuOpen(false)} className="flex items-center px-3 py-2 text-base font-medium text-slate-700 hover:bg-amber-500/10 hover:text-amber-600">
                                                            <Icon name="dashboard" className="w-5 h-5 mr-3"/>Admin Dashboard
                                                        </a>
                                                    </Link>
                                                    <Link href="/admin/orders" legacyBehavior>
                                                        <a onClick={() => setMobileMenuOpen(false)} className="flex items-center px-3 py-2 text-base font-medium text-slate-700 hover:bg-amber-500/10 hover:text-amber-600">
                                                            <Icon name="package" className="w-5 h-5 mr-3"/>Manage Orders
                                                        </a>
                                                    </Link>
                                                    <Link href="/admin/homepage-management" legacyBehavior>
                                                        <a onClick={() => setMobileMenuOpen(false)} className="flex items-center px-3 py-2 text-base font-medium text-slate-700 hover:bg-amber-500/10 hover:text-amber-600">
                                                            <Icon name="home" className="w-5 h-5 mr-3"/>Manage Homepage
                                                        </a>
                                                    </Link>
                                                    <Link href="/admin/support-messages" legacyBehavior>
                                                        <a onClick={() => setMobileMenuOpen(false)} className="flex items-center px-3 py-2 text-base font-medium text-slate-700 hover:bg-amber-500/10 hover:text-amber-600">
                                                            <Icon name="mail" className="w-5 h-5 mr-3"/>Support Messages
                                                        </a>
                                                    </Link>
                                                </>
                                            )}
                                            <Link href="/profile" legacyBehavior>
                                                <a onClick={() => setMobileMenuOpen(false)} className="flex items-center px-3 py-2 text-base font-medium text-slate-700 hover:bg-amber-500/10 hover:text-amber-600">
                                                    <Icon name="user" className="w-5 h-5 mr-3"/>My Profile
                                                </a>
                                            </Link>
                                            <button 
                                                onClick={handleLogout} 
                                                className="flex items-center w-full px-3 py-2 text-base font-medium text-red-600 hover:bg-red-500/10 hover:text-red-700"
                                            >
                                                <Icon name="logout" className="w-5 h-5 mr-3"/>Logout
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-3">
                                        <Button 
                                            onClick={() => {
                                                router.push('/auth');
                                                setMobileMenuOpen(false);
                                            }} 
                                            variant="primary" 
                                            size="lg" 
                                            className="w-full"
                                        >
                                            Login / Sign Up
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </Dialog.Panel>
                    </Transition.Child>
                </Dialog>
            </Transition>
        </nav>
    );
};

export default Navbar; 