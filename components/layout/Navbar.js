import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onCartClick, cartItemCount }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const router = useRouter();
    const { currentUser, logout } = useAuth();

    const navItems = [
        { name: 'Home', path: '/', icon: 'home' },
        { name: 'Products', path: '/products', icon: 'list' },
    ];

    if (currentUser) {
        navItems.push({ name: 'Dashboard', path: '/dashboard', icon: 'package' });
    }

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" legacyBehavior>
                            <a className="flex-shrink-0 flex items-center text-blue-600 hover:text-blue-700 transition">
                                <Icon name="smartphone" className="w-8 h-8 mr-2" />
                                <span className="font-bold text-xl">PhoneVerse</span>
                            </a>
                        </Link>
                    </div>
                    <div className="hidden md:flex items-center space-x-4">
                        {navItems.map(item => (
                            <Link key={item.name} href={item.path} legacyBehavior>
                                <a>
                                    <Button variant="ghost" className="text-gray-700 hover:text-blue-600">
                                        <Icon name={item.icon} className="mr-2 w-4 h-4" /> {item.name}
                                    </Button>
                                </a>
                            </Link>
                        ))}
                        <Button onClick={onCartClick} variant="ghost" className="relative text-gray-700 hover:text-blue-600">
                            <Icon name="shoppingBag" className="w-5 h-5" />
                            {cartItemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{cartItemCount}</span>
                            )}
                        </Button>
                        {currentUser ? (
                            <Button onClick={logout} variant="outline" size="md" iconLeft="logout">Logout</Button>
                        ) : (
                            <Button onClick={() => router.push('/auth')} variant="primary" size="md" iconLeft="login">Login</Button>
                        )}
                    </div>
                    <div className="md:hidden flex items-center">
                         <Button onClick={onCartClick} variant="ghost" className="relative text-gray-700 hover:text-blue-600 mr-2">
                            <Icon name="shoppingBag" className="w-5 h-5" />
                            {cartItemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{cartItemCount}</span>
                            )}
                        </Button>
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-600 hover:text-gray-800 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                            <Icon name={mobileMenuOpen ? 'x' : 'menu'} className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white shadow-lg absolute top-16 inset-x-0 z-40 p-4 border-t border-gray-200">
                    <div className="space-y-1">
                        {navItems.map(item => (
                            <Link key={item.name} href={item.path} legacyBehavior>
                                <a onClick={() => setMobileMenuOpen(false)}>
                                    <Button variant="ghost" className="w-full justify-start text-gray-700 hover:text-blue-600 hover:bg-gray-50 py-3">
                                        <Icon name={item.icon} className="mr-3 w-5 h-5" /> {item.name}
                                    </Button>
                                </a>
                            </Link>
                        ))}
                        {currentUser ? (
                            <Button onClick={() => { logout(); setMobileMenuOpen(false); }} variant="outline" size="md" iconLeft="logout" className="w-full mt-2 py-3">Logout</Button>
                        ) : (
                            <Button onClick={() => { setMobileMenuOpen(false); router.push('/auth'); }} variant="primary" size="md" iconLeft="login" className="w-full mt-2 py-3">Login</Button>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar; 