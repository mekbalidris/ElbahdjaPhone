import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const Navbar = ({ onCartClick, cartItemCount }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const router = useRouter();
    const { currentUser, logout, isLoading: authLoading } = useAuth();

    const navItems = [
        { name: 'Home', path: '/', icon: 'home' },
        { name: 'Products', path: '/products', icon: 'list' },
    ];

    // Only add Dashboard link for sellers
    if (currentUser?.role === 'seller') {
        navItems.push({ name: 'Dashboard', path: '/dashboard', icon: 'package' });
    }

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            toast.error("Logout failed. Please try again.");
        }
    };

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0 flex items-center text-blue-600 hover:text-blue-700 transition">
                            <Icon name="smartphone" className="w-8 h-8 mr-2" />
                            <span className="font-bold text-xl">PhoneVerse</span>
                        </Link>
                    </div>
                    <div className="hidden md:flex items-center space-x-1">
                        {navItems.map(item => (
                            <Button 
                                key={item.name}
                                variant="ghost" 
                                className={`text-gray-700 hover:text-blue-600 px-3 py-2 ${router.pathname === item.path ? 'text-blue-600 bg-blue-50' : ''}`}
                                onClick={() => router.push(item.path)}
                            >
                                <Icon name={item.icon} className="mr-1.5 w-4 h-4" /> {item.name}
                            </Button>
                        ))}
                        
                        <Button onClick={onCartClick} variant="ghost" className="relative text-gray-700 hover:text-blue-600 p-2">
                            <Icon name="shoppingBag" className="w-5 h-5" />
                            {cartItemCount > 0 && (
                                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 transform translate-x-1/2 -translate-y-1/2">
                                    {cartItemCount}
                                </span>
                            )}
                        </Button>
                        {authLoading ? (
                            <div className="px-3 py-2"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div></div>
                        ) : currentUser ? (
                            <Button onClick={handleLogout} variant="outline" size="md" iconLeft="logout" className="ml-2">Logout</Button>
                        ) : (
                            <Button onClick={() => router.push('/auth')} variant="primary" size="md" iconLeft="login" className="ml-2">Login</Button>
                        )}
                    </div>
                    
                    <div className="md:hidden flex items-center">
                        <Button onClick={onCartClick} variant="ghost" className="relative text-gray-700 hover:text-blue-600 mr-2 p-2">
                            <Icon name="shoppingBag" className="w-6 h-6" />
                            {cartItemCount > 0 && (
                                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] rounded-full px-1 py-0 transform translate-x-1/2 -translate-y-1/2">
                                    {cartItemCount}
                                </span>
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
                            <Button
                                key={item.name}
                                variant="ghost"
                                className={`w-full justify-start text-gray-700 hover:text-blue-600 hover:bg-gray-50 py-3 ${router.pathname === item.path ? 'text-blue-600 bg-blue-50' : ''}`}
                                onClick={() => {
                                    router.push(item.path);
                                    setMobileMenuOpen(false);
                                }}
                            >
                                <Icon name={item.icon} className="mr-3 w-5 h-5" /> {item.name}
                            </Button>
                        ))}
                        {authLoading ? (
                            <div className="w-full justify-start py-3 flex items-center text-gray-700">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400 mr-3"></div> Loading...
                            </div>
                        ) : currentUser ? (
                            <Button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} variant="outline" size="md" iconLeft="logout" className="w-full mt-2 py-3">Logout</Button>
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