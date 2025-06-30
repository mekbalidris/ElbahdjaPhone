import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import CartModal from '../components/cart/CartModal';
import '../styles/globals.css';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { CartProvider, useCart } from '../context/CartContext';
import { FavoritesProvider } from '../context/FavoritesContext';
import ChatBot from '../components/chat/ChatBot';

// Create a separate component for the app content
function AppContent({ Component, pageProps }) {
    const [isCartModalOpen, setIsCartModalOpen] = useState(false);
    const { cartItems } = useCart();
    const [isMounted, setIsMounted] = useState(false);

    // Handle mounting state
    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
                <span className="text-4xl font-extrabold font-serif tracking-widest mb-8 text-yellow-700 animate-fadeIn">COSMOS</span>
                <div className="w-16 h-16 border-4 border-yellow-700 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <>
            <Toaster position="top-center" />
            <div className="min-h-screen flex flex-col">
                <Navbar 
                    onCartClick={() => setIsCartModalOpen(true)} 
                    cartItemCount={Array.isArray(cartItems) ? cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0}
                />
                <main className="flex-grow">
                    <Component {...pageProps} />
                </main>
                <Footer />
                <CartModal
                    isOpen={isCartModalOpen}
                    onClose={() => setIsCartModalOpen(false)}
                />
                <ChatBot />
            </div>
        </>
    );
}

export default function App({ Component, pageProps }) {
    return (
        <AuthProvider>
            <CartProvider>
                <FavoritesProvider>
                    <AppContent Component={Component} pageProps={pageProps} />
                </FavoritesProvider>
            </CartProvider>
        </AuthProvider>
    );
} 