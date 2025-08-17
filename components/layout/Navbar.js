import React, { useState, Fragment, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import { Dialog, Transition, Menu } from '@headlessui/react';
import { ShoppingBag, ShoppingCart, User, Menu as MenuIcon, X, LogOut, LayoutDashboard, Search as SearchIcon } from 'lucide-react';

const NavLink = ({ href, children }) => {
    const router = useRouter();
    const isActive = router.pathname === href || router.pathname.startsWith(`${href}/`);
    return (
        <Link href={href}>
            <span className={`inline-block relative py-2 text-sm font-medium transition-colors duration-200 ease-in-out cursor-pointer ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                {children}
                <span className={`absolute bottom-0 left-0 block h-0.5 bg-primary-500 transition-all duration-300 ${isActive ? 'w-full' : 'w-0'} group-hover:w-full`}></span>
            </span>
        </Link>
    );
};

const Navbar = ({ onCartClick, cartItemCount = 0 }) => {
    const router = useRouter();
    const { currentUser, logout, isLoading: authLoading } = useAuth();
    const { favoritesCount } = useFavorites();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    // Sticky reveal state
    const [showNavbar, setShowNavbar] = useState(true);
    const lastScrollY = useRef(0);
    const [showSearch, setShowSearch] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            // Always show navbar when at the top
            if (currentScrollY < 100) {
                setShowNavbar(true);
            } else if (currentScrollY > lastScrollY.current + 10) {
                // Scrolling down - hide navbar
                setShowNavbar(false);
            } else if (currentScrollY < lastScrollY.current - 10) {
                // Scrolling up - show navbar
                setShowNavbar(true);
            }
            lastScrollY.current = currentScrollY;
        };
        
        // Use passive listener for better performance
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    const handleFavoritesClick = () => {
        router.push('/favorites');
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
            setShowSearch(false);
            setSearchTerm('');
        }
    };

    const navLinks = [
        { name: 'Accueil', href: '/' },
        { name: 'Produits', href: '/products' },
        { name: 'À propos', href: '/about' },
        { name: 'Contact', href: '/contact' },
    ];

    return (
        <header className={`fixed top-0 z-50 w-full bg-black/80 backdrop-blur-md shadow-lg border-b border-gray-800 transition-all duration-300 ${showNavbar ? 'translate-y-0' : '-translate-y-full'}`}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Mobile Menu Button and Logo */}
                    <div className="flex items-center gap-3">
                        <div className="lg:hidden">
                            <button onClick={() => setMobileMenuOpen(true)} className="text-white p-2 rounded-md bg-transparent">
                                <MenuIcon size={24} />
                            </button>
                        </div>

                        {/* Logo and Brand Name */}
                        <div className="flex-shrink-0 flex items-center gap-3">
                            <Link href="/" className="flex items-center gap-3">
                                {/* Logo */}
                                <div className="rounded-lg overflow-hidden">
                                    <Image 
                                        src="/logo.png" 
                                        alt="Elbahdja Phone Logo" 
                                        width={24}
                                        height={40}
                                        className="w-6 h-10"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                    <div className="w-full h-full bg-gradient-to-br from-primary-500 to-accent-700 flex items-center justify-center" style={{ display: 'none' }}>
                                        <span className="text-white font-bold text-lg">EP</span>
                                    </div>
                                </div>
                                {/* Brand Name with two colors */}
                                <div className="hidden md:block text-2xl font-bold cursor-pointer">
                                    <span className="text-primary-500">Elbahdja</span>
                                    <span className="text-accent-500">Phone</span>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex lg:items-center lg:space-x-8">
                        {navLinks.map(link => (
                            <NavLink key={link.name} href={link.href}>{link.name}</NavLink>
                        ))}
                    </nav>

                    {/* Icons */}
                    <div className="relative flex items-center gap-4">
                        {/* Search Icon and Input */}
                        <div className="relative">
                            <button
                                onClick={() => setShowSearch((v) => !v)}
                                className={`text-white hover:text-primary-500 transition-colors duration-200 p-2 rounded-full bg-transparent`}
                                title="Rechercher un produit"
                            >
                                <SearchIcon className="w-6 h-6 text-white" />
                            </button>
                            <form
                                onSubmit={handleSearchSubmit}
                                className={`absolute right-0 top-10 bg-black/90 shadow-lg rounded-lg flex items-center transition-all duration-300 ${showSearch ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none -translate-y-2'} z-50`}
                                style={{ minWidth: 220 }}
                            >
                                <input
                                    type="text"
                                    className="px-4 py-2 rounded-l-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-black text-white placeholder:text-gray-400"
                                    placeholder="Rechercher un produit..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    autoFocus={showSearch}
                                />
                                <button type="submit" className="px-3 py-2 bg-primary-500 text-white rounded-r-lg hover:bg-primary-600 transition">Rechercher</button>
                            </form>
                        </div>
                        {/* Favorites Heart Icon */}
                        <button
                            onClick={handleFavoritesClick}
                            className="relative text-gray-300 transition-colors duration-200 bg-transparent p-0 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 hover:bg-primary-500"
                            title="Mes favoris"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 0 1 6.364 0L12 7.636l1.318-1.318a4.5 4.5 0 1 1 6.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 0 1 0-6.364z" />
                            </svg>
                            {favoritesCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-xs font-medium text-white">
                                    {favoritesCount}
                                </span>
                            )}
                        </button>
                        <button onClick={onCartClick} className="relative text-gray-300 hover:bg-gray-300 transition-colors duration-200 bg-transparent p-0 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 hover:bg-primary-500">
                            <ShoppingCart size={24} />
                            {cartItemCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-xs font-medium text-white">
                                    {cartItemCount}
                                </span>
                            )}
                        </button>

                        {authLoading ? (
                            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                        ) : currentUser ? (
                            <Menu as="div" className="relative">
                                <Menu.Button className="flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900">
                                    <span className="sr-only">Open user menu</span>
                                    <User size={24} className="text-white hover:text-gray-200 transition-colors" />
                                </Menu.Button>
                                <Transition
                                    as={Fragment}
                                    enter="transition ease-out duration-100"
                                    enterFrom="transform opacity-0 scale-95"
                                    enterTo="transform opacity-100 scale-100"
                                    leave="transition ease-in duration-75"
                                    leaveFrom="transform opacity-100 scale-100"
                                    leaveTo="transform opacity-0 scale-95"
                                >
                                    <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                                        {(currentUser.role === 'admin' || currentUser.role === 'seller') && (
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <Link href="/admin/support-messages" className={`${active ? 'bg-gray-100' : ''} flex items-center px-4 py-2 text-sm text-blue-700 font-semibold`}>
                                                        <User size={16} className="mr-2" />
                                                        Support Messages
                                                    </Link>
                                                )}
                                            </Menu.Item>
                                        )}
                                        {(currentUser.role === 'admin' || currentUser.role === 'seller') && (
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <Link href="/admin/comments-approving" className={`${active ? 'bg-gray-100' : ''} flex items-center px-4 py-2 text-xs text-yellow-700 font-semibold`}>
                                                        <User size={16} className="mr-2" />
                                                        Comments Approving
                                                    </Link>
                                                )}
                                            </Menu.Item>
                                        )}
                                        {(currentUser.role === 'admin' || currentUser.role === 'seller') && (
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <Link href="/dashboard" className={`${active ? 'bg-gray-100' : ''} flex items-center px-4 py-2 text-sm text-black`}>
                                                        <LayoutDashboard size={16} className="mr-2" />
                                                        Dashboard
                                                    </Link>
                                                )}
                                            </Menu.Item>
                                        )}
                                        <Menu.Item>
                                            {({ active }) => {
                                                const isActive = router.pathname === '/profile';
                                                return (
                                                    <Link href="/profile" className={`${isActive ? 'bg-primary-500 text-white' : active ? 'bg-gray-100' : ''} flex items-center px-4 py-2 text-sm font-semibold`}>
                                                        <User size={16} className="mr-2" />
                                                        Mon profil
                                                    </Link>
                                                );
                                            }}
                                        </Menu.Item>
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button onClick={handleLogout} className={`w-full text-left flex items-center px-4 py-2 text-sm font-semibold rounded-md bg-red-600 text-white ${active ? 'ring-2 ring-red-800' : ''}`}>
                                                    <LogOut size={16} className="mr-2" />
                                                    Se déconnecter
                                                </button>
                                            )}
                                        </Menu.Item>
                                    </Menu.Items>
                                </Transition>
                            </Menu>
                        ) : (
                            <Link href="/auth">
                                <span className="text-white hover:text-gray-200">
                                    <User size={24} />
                                </span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <Transition.Root show={mobileMenuOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50 lg:hidden" onClose={setMobileMenuOpen}>
                    <Transition.Child
                        as={Fragment}
                        enter="transition-opacity ease-linear duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity ease-linear duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>
                    
                    <div className="fixed inset-0 z-50 flex">
                        <Transition.Child
                            as={Fragment}
                            enter="transition ease-in-out duration-300 transform"
                            enterFrom="-translate-x-full"
                            enterTo="translate-x-0"
                            leave="transition ease-in-out duration-300 transform"
                            leaveFrom="translate-x-0"
                            leaveTo="-translate-x-full"
                        >
                            <Dialog.Panel className="relative mr-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-black py-4 pb-12 shadow-xl">
                                <div className="flex items-center justify-between px-4">
                                                                           <Link href="/" className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-lg overflow-hidden">
                                              <Image 
                                                  src="/logo.png" 
                                                  alt="Elbahdja Phone Logo" 
                                                  width={32}
                                                  height={32}
                                                  className="w-full h-full object-cover"
                                                  onError={(e) => {
                                                      e.target.style.display = 'none';
                                                      e.target.nextSibling.style.display = 'flex';
                                                  }}
                                              />
                                              <div className="w-full h-full bg-gradient-to-br from-primary-500 to-accent-700 flex items-center justify-center" style={{ display: 'none' }}>
                                                  <span className="text-white font-bold text-sm">EP</span>
                                              </div>
                                          </div>
                                        <div className="text-xl font-bold">
                                            <span className="text-primary-500">Elbahdja</span>
                                            <span className="text-accent-500">Phone</span>
                                        </div>
                                    </Link>
                                    <button
                                        type="button"
                                        className="-m-2 inline-flex items-center justify-center rounded-md p-2 text-white"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <nav className="mt-6 flex flex-col gap-4 px-4">
                                    {navLinks.map(link => {
                                        const isActive = router.pathname === link.href || router.pathname.startsWith(`${link.href}/`);
                                        return (
                                            <Link href={link.href} key={link.name}>
                                                <span
                                                    onClick={() => setMobileMenuOpen(false)}
                                                    className={`block py-2 text-lg font-medium rounded-md ${isActive ? 'bg-primary-500 text-white' : 'text-white hover:text-primary-500 hover:bg-black'}`}
                                                >
                                                    {link.name}
                                                </span>
                                            </Link>
                                        );
                                    })}
                                    <button
                                        onClick={() => {
                                            handleFavoritesClick();
                                            setMobileMenuOpen(false);
                                        }}
                                        className={`w-full text-left block py-2 text-lg font-medium rounded-md ${router.pathname === '/favorites' ? 'bg-primary-500 text-white' : 'text-white hover:text-primary-500 hover:bg-black'}`}
                                    >
                                        Mes favoris {favoritesCount > 0 && `(${favoritesCount})`}
                                    </button>
                                    <Link href="/profile">
                                        <span
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`block py-2 text-lg font-medium rounded-md ${router.pathname === '/profile' ? 'bg-primary-500 text-white' : 'text-white hover:text-primary-500 hover:bg-black'}`}
                                        >
                                            Mon profil
                                        </span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left block py-2 text-lg font-medium rounded-md bg-red-600 text-white flex items-center gap-2 mt-4"
                                    >
                                        <LogOut size={20} />
                                        Se déconnecter
                                    </button>
                                </nav>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>
        </header>
    );
};

export default Navbar; 