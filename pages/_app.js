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
import { useRouter } from 'next/router';

// Create a separate component for the app content
function AppContent({ Component, pageProps }) {
    const [isCartModalOpen, setIsCartModalOpen] = useState(false);
    const { cartItems } = useCart();
    const [isMounted, setIsMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Handle mounting state
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Show loading indicator on route change
    useEffect(() => {
        const handleStart = () => setIsLoading(true);
        const handleStop = () => setIsLoading(false);
        router.events.on('routeChangeStart', handleStart);
        router.events.on('routeChangeComplete', handleStop);
        router.events.on('routeChangeError', handleStop);
        return () => {
            router.events.off('routeChangeStart', handleStart);
            router.events.off('routeChangeComplete', handleStop);
            router.events.off('routeChangeError', handleStop);
        };
    }, [router]);

    if (!isMounted) {
        return (
            <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
                <span className="text-4xl font-extrabold font-serif tracking-widest mb-8 text-primary-500 animate-fadeIn">Elbahdja Phone</span>
                <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <>
            <Toaster position="top-center" />
            {isLoading && (
                <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/60">
                    <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <span className="text-xl font-bold text-primary-500">Chargement...</span>
                </div>
            )}
            <div className="min-h-screen flex flex-col">
                <Navbar 
                    onCartClick={() => setIsCartModalOpen(true)} 
                    cartItemCount={Array.isArray(cartItems) ? cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0}
                />
                <main className="flex-grow">
                    <Component {...pageProps} setGlobalLoading={setIsLoading} />
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