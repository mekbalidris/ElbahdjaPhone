import React, { useState, useEffect, Fragment, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

// --- Color Palette (Client Inspired - Tailwind classes) ---
const brandOrange = {
    bg: 'bg-amber-500',
    text: 'text-amber-500',
    border: 'border-amber-500',
    hoverBg: 'hover:bg-amber-600',
    ring: 'focus:ring-amber-500',
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-orange-600',
};

const brandPurple = {
    bg: 'bg-purple-600',
    text: 'text-purple-600',
    border: 'border-purple-600',
    hoverBg: 'hover:bg-purple-700',
    ring: 'focus:ring-purple-500',
    gradientFrom: 'from-purple-600',
    gradientTo: 'to-indigo-700',
};

const NavLink = ({ href, children }) => {
    const router = useRouter();
    const isActive = router.pathname === href;
    return (
        <Link href={href} legacyBehavior>
            <a className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ease-in-out
                ${isActive 
                    ? `${brandOrange.bg} text-white shadow-sm` 
                    : `text-slate-700 hover:${brandOrange.text} hover:bg-amber-500/10`} 
            `}>
                {children}
            </a>
        </Link>
    );
};

const MobileNavLink = ({ href, children, onClick }) => {
    const router = useRouter();
    const isActive = router.pathname === href;
    const handleClick = (e) => {
        e.preventDefault();
        router.push(href);
        if(onClick) onClick();
    };
    return (
         <Link href={href} legacyBehavior>
            <a onClick={handleClick} className={`block px-3 py-3 rounded-md text-base font-medium
                ${isActive 
                    ? `${brandOrange.bg} text-white` 
                    : `text-slate-700 hover:bg-amber-500/10 hover:${brandOrange.text}`}
            `}>
                {children}
            </a>
        </Link>
    );
};

const Navbar = ({ onCartClick, cartItemCount = 0 }) => { // Default cartItemCount to 0
    const router = useRouter();
    const { currentUser, logout, isLoading: authLoading } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef(null);
    const profileButtonRef = useRef(null);


    const navItems = useMemo(() => {
        const items = [
            { label: 'Home', href: '/' },
            { label: 'Products', href: '/products' },
        ];
        if (currentUser?.role === 'seller') {
            items.push({ label: 'Dashboard', href: '/dashboard' }); // Corrected path for admin
        }
        return items;
    }, [currentUser]);

    // Close profile menu on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuOpen && 
                profileMenuRef.current && !profileMenuRef.current.contains(event.target) &&
                profileButtonRef.current && !profileButtonRef.current.contains(event.target)) {
                setProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [profileMenuOpen]);


    const handleLogout = async () => {
        setProfileMenuOpen(false); // Close menu on logout
        setMobileMenuOpen(false); // Close mobile menu if open
        try {
            await logout();
            router.push('/');
            toast.success('Logged out successfully');
        } catch (error) {
            toast.error("Logout failed. Please try again.");
        }
    };

    return (
        <>
            <nav className={`bg-white shadow-sm z-50 font-sans ${router.pathname === '/' ? 'fixed top-0 left-0 right-0' : 'sticky top-0'}`}>
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <Link href="/" legacyBehavior>
                                <a className="flex items-center">
                                    {/* Store Logo */}
                                    <img src="/logo.png" alt="Store Logo" className="h-8 w-auto mr-2" />
                                    <span className={`text-2xl font-extrabold ${brandOrange.text}`}>EL Bahdja</span>
                                    <span className={`text-2xl font-extrabold ${brandPurple.text} ml-1`}>Phone</span>
                                </a>
                            </Link>
                        </div>

                        {/* Desktop Navigation Links - Centered within the available space */}
                        <div className="hidden md:flex flex-1 items-center justify-center mr-[5rem]"> {/* flex-1 and justify-center for centering */}
                            <div className="flex space-x-2 lg:space-x-4">
                                {navItems.map((item) => (
                                    <NavLink key={item.label} href={item.href}>
                                        {item.label}
                                    </NavLink>
                                ))}
                            </div>
                        </div>

                        {/* Right side icons - Desktop */}
                        <div className="hidden md:flex items-center space-x-6">
                            {/* Delivery Info */}
                            <div className="flex items-center space-x-2 text-slate-700 hover:text-amber-500 transition-colors cursor-pointer">
                                <Icon name="mapPin" className="w-5 h-5" />
                                <span className="text-sm font-medium">Delivery to 58 Wilayas</span>
                                <span className="ml-1 text-lg">🇩🇿</span>
                            </div>

                            {/* Contact Info */}
                            <div className="flex items-center space-x-2 text-slate-700 hover:text-amber-500 transition-colors">
                                <Icon name="phone" className="w-5 h-5" />
                                <a href="tel:0552408449" className="text-sm font-medium">0552408449</a>
                            </div>

                            {/* Cart Button */}
                            <button 
                                onClick={onCartClick}
                                className={`relative p-2 rounded-full text-black hover:text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-1 transition-colors`}
                                aria-label="Open shopping cart"
                            >
                                <Icon name="cart" className="w-6 h-6" />
                                {cartItemCount > 0 && (
                                    <span className={`absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 text-xs font-bold leading-none ${brandOrange.bg} text-white rounded-full ring-2 ring-white`}>
                                        {cartItemCount}
                                    </span>
                                )}
                            </button>
                            
                            {authLoading ? (
                                <div className="px-3 py-2">
                                    <div className={`animate-spin rounded-full h-5 w-5 border-b-2 ${brandPurple.border}`}></div>
                                </div>
                            ) : currentUser ? (
                                <div className="relative" ref={profileButtonRef}>
                                    <button 
                                        onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                        className={`p-1.5 rounded-full text-slate-600 hover:${brandPurple.text} hover:bg-purple-500/10 focus:outline-none focus:ring-2 ${brandPurple.ring} focus:ring-offset-1 transition-colors`}
                                    >
                                        <Icon name="userCircle" className="w-7 h-7" />
                                    </button>
                                    {profileMenuOpen && (
                                        <div ref={profileMenuRef} className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl py-1 z-20 border border-gray-200/70">
                                            <div className="px-4 py-3 border-b border-gray-200/80">
                                                <p className="text-sm text-slate-800 font-semibold">Signed in as</p>
                                                <p className={`text-sm ${brandPurple.text} truncate font-medium`}>{currentUser.name || currentUser.email || "User"}</p>
                                            </div>
                                            {currentUser.role === 'seller' && (
                                                <Link href="/dashboard" legacyBehavior><a onClick={() => setProfileMenuOpen(false)} className={`block px-4 py-2 text-sm text-slate-700 hover:bg-amber-500/10 hover:${brandOrange.text}`}>Admin Dashboard</a></Link>
                                            )}
                                            {currentUser.role === 'seller' && (
                                                <Link href="/admin/support-messages" legacyBehavior><a onClick={() => setProfileMenuOpen(false)} className={`block px-4 py-2 text-sm text-slate-700 hover:bg-amber-500/10 hover:${brandOrange.text}`}>Support Messages</a></Link>
                                            )}
                                            <Link href="/profile" legacyBehavior><a onClick={() => setProfileMenuOpen(false)} className={`block px-4 py-2 text-sm text-slate-700 hover:bg-amber-500/10 hover:${brandOrange.text}`}>My Profile</a></Link>
                                            <button onClick={handleLogout} className={`block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-500/10 hover:text-red-700`}>
                                                <Icon name="logout" className="w-4 h-4 inline mr-2 align-middle"/>Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Button onClick={() => router.push('/auth')} variant="primary" size="sm">
                                    Login
                                </Button>
                            )}
                        </div>

                        {/* Mobile Menu Button & Cart */}
                        <div className="md:hidden flex items-center">
                             <button 
                                onClick={onCartClick}
                                className={`relative p-2 mr-1 rounded-full text-black hover:text-gray-700 hover:bg-gray-300 focus:outline-none`}
                                aria-label="Open shopping cart"
                            >
                                <Icon name="cart" className="w-6 h-6" />
                                {cartItemCount > 0 && (
                                    <span className={`absolute -top-0.1 -right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none ${brandOrange.bg} text-white rounded-full`}>
                                        {cartItemCount}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                type="button"
                                className={`inline-flex items-center justify-center p-2 rounded-md text-slate-600 hover:${brandOrange.text} hover:bg-amber-500/10 focus:outline-none focus:ring-2 ${brandOrange.ring} focus:ring-offset-0`}
                                aria-controls="mobile-menu"
                                aria-expanded={mobileMenuOpen}
                            >
                                <span className="sr-only">Open main menu</span>
                                <Icon name={mobileMenuOpen ? "xMark" : "menu"} className="block h-6 w-6" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden absolute top-16 inset-x-0 z-40 transform origin-top shadow-lg" id="mobile-menu">
                        <div className="rounded-b-lg bg-white ring-1 ring-black ring-opacity-5 overflow-hidden">
                            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                                {navItems.map((item) => (
                                    <MobileNavLink key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                                        {item.label}
                                    </MobileNavLink>
                                ))}
                                
                                {/* Mobile Delivery Info */}
                                <div className="flex items-center px-3 py-3 text-slate-700">
                                    <Icon name="mapPin" className="w-5 h-5 mr-2" />
                                    <span className="text-base font-medium">Delivery to 58 Wilayas</span>
                                    <span className="ml-2 text-lg">🇩🇿</span>
                                </div>

                                {/* Mobile Contact Info */}
                                <div className="flex items-center px-3 py-3 text-slate-700">
                                    <Icon name="phone" className="w-5 h-5 mr-2" />
                                    <a href="tel:0552408449" className="text-base font-medium">0552408449</a>
                                </div>
                            </div>
                            <div className="pt-4 pb-3 border-t border-gray-200">
                                {authLoading ? (
                                    <div className="px-5 py-3"><div className={`animate-spin rounded-full h-5 w-5 border-b-2 ${brandPurple.border}`}></div></div>
                                ) : currentUser ? (
                                    <>
                                        <div className="flex items-center px-5 mb-3">
                                            <div className="flex-shrink-0">
                                                <Icon name="userCircle" className={`h-10 w-10 rounded-full ${brandPurple.text}`} />
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-base font-medium text-slate-800">{currentUser.name || "User"}</div>
                                                {currentUser.email && <div className="text-sm font-medium text-slate-500">{currentUser.email}</div>}
                                            </div>
                                        </div>
                                        <div className="px-2 space-y-1">
                                            {currentUser.role === 'seller' && (
                                                <MobileNavLink href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                                                    <Icon name="dashboard" className="w-5 h-5 inline mr-2"/>Admin Dashboard
                                                </MobileNavLink>
                                            )}
                                            {currentUser.role === 'seller' && (
                                                <MobileNavLink href="/admin/support-messages" onClick={() => setMobileMenuOpen(false)}>
                                                    <Icon name="mail" className="w-5 h-5 inline mr-2"/>Support Messages
                                                </MobileNavLink>
                                            )}
                                            <MobileNavLink href="/profile" onClick={() => setMobileMenuOpen(false)}><Icon name="user" className="w-5 h-5 inline mr-2"/>My Profile</MobileNavLink>
                                            <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} 
                                                className="block px-3 py-3 rounded-md text-base font-medium text-red-600 hover:bg-red-500/10 hover:text-red-700">
                                               <Icon name="logout" className="w-5 h-5 inline mr-2"/> Logout
                                            </a>
                                        </div>
                                    </>
                                ) : (
                                    <div className="px-5 space-y-3">
                                        <Button onClick={() => {router.push('/auth'); setMobileMenuOpen(false);}} variant="primary" size="lg" className="w-full">Login</Button>
                                        <p className="text-center text-sm">
                                            <Link href="/auth?register=true" legacyBehavior>
                                                <a onClick={()=> setMobileMenuOpen(false)} className={`${brandPurple.text} font-medium hover:underline`}>
                                                    Don&apos;t have an account? Sign Up
                                                </a>
                                            </Link>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </nav>
            {/* <CartModal isOpen={cartOpen} onClose={() => setCartOpen(false)} /> */}
             <style jsx global>{`
                .font-sans {
                     font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
                }
            `}</style>
            {/* Add an overlay for mobile menu */}
            {mobileMenuOpen && <div className="fixed inset-0 bg-black bg-opacity-25 z-30 md:hidden" onClick={() => setMobileMenuOpen(false)}></div>}
        </>
    );
};

export default Navbar; 