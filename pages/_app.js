import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import CartModal from '../components/cart/CartModal';
import '../styles/globals.css';
import { AuthProvider, useAuth } from '../context/AuthContext';

// Create a separate component for the app content
function AppContent({ Component, pageProps }) {
    const [isCartModalOpen, setIsCartModalOpen] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [isLoadingCart, setIsLoadingCart] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const { currentUser } = useAuth();

    // Handle mounting state
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Fetch cart items when user changes
    useEffect(() => {
        if (currentUser && isMounted) {
            fetchCartItems();
        } else {
            setCartItems([]);
            setIsLoadingCart(false);
        }
    }, [currentUser, isMounted]);

    const fetchCartItems = async () => {
        if (!currentUser) return;
        
        setIsLoadingCart(true);
        try {
            const res = await fetch('/api/cart', {
                headers: {
                    'user-id': currentUser.id
                }
            });
            if (!res.ok) throw new Error('Failed to fetch cart');
            const data = await res.json();
            setCartItems(data.items || []);
        } catch (err) {
            console.error('Error fetching cart:', err);
            toast.error('Failed to load cart items');
        } finally {
            setIsLoadingCart(false);
        }
    };

    const handleAddToCart = async (product) => {
        if (!currentUser) {
            toast.error('Please log in to add items to cart');
            return;
        }

        if (product.stock <= 0) {
            toast.error('This product is currently out of stock.');
            return;
        }

        try {
            const res = await fetch('/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'user-id': currentUser.id
                },
                body: JSON.stringify({ productId: product._id })
            });

            if (!res.ok) throw new Error('Failed to add to cart');
            
            const data = await res.json();
            setCartItems(data.items || []);
            toast.success(`${product.name || 'Item'} added to cart!`);
            setIsCartModalOpen(true);
        } catch (err) {
            console.error('Error adding to cart:', err);
            toast.error('Failed to add item to cart');
        }
    };

    const handleRemoveFromCart = async (productId) => {
        if (!currentUser) return;

        try {
            const res = await fetch('/api/cart', {
                method: 'DELETE',
                headers: {
                    'user-id': currentUser.id,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productId: productId })
            });

            if (!res.ok) throw new Error('Failed to remove from cart');
            
            const data = await res.json();
            setCartItems(data.items || []);
            toast.success('Item removed from cart');
        } catch (err) {
            console.error('Error removing from cart:', err);
            toast.error('Failed to remove item from cart');
        }
    };

    if (!isMounted) {
        return null;
    }

    return (
        <>
            <Toaster position="top-center" />
            <div className="min-h-screen flex flex-col">
                <Navbar 
                    onCartClick={() => setIsCartModalOpen(true)} 
                    cartItemCount={cartItems.length}
                />
                <main className="flex-grow">
                    <Component 
                        {...pageProps} 
                        handleAddToCart={handleAddToCart}
                    />
                </main>
                <Footer />
                <CartModal
                    isOpen={isCartModalOpen}
                    onClose={() => setIsCartModalOpen(false)}
                    items={cartItems}
                    onRemoveItem={handleRemoveFromCart}
                    isLoading={isLoadingCart}
                />
            </div>
        </>
    );
}

// Main App component that wraps everything with AuthProvider
function MyApp({ Component, pageProps }) {
    return (
        <AuthProvider>
            <AppContent Component={Component} pageProps={pageProps} />
        </AuthProvider>
    );
}

export default MyApp; 