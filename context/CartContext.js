import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const CartContext = createContext();

export function CartProvider({ children }) {
    const { currentUser } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load cart data on mount
    useEffect(() => {
        if (currentUser) {
            fetchCartItems();
        } else {
            // Load guest cart from localStorage
            const guestCart = localStorage.getItem('guestCart');
            if (guestCart) {
                try {
                    const parsedCart = JSON.parse(guestCart);
                    setCartItems(parsedCart);
                } catch (error) {
                    console.error('Error parsing guest cart:', error);
                    localStorage.removeItem('guestCart');
                    setCartItems([]);
                }
            } else {
                setCartItems([]);
            }
            setIsLoading(false);
        }
    }, [currentUser]);

    const fetchCartItems = async () => {
        if (!currentUser) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
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
            setIsLoading(false);
        }
    };

    const addToCart = async (product) => {
        if (product.stock <= 0) {
            toast.error('This product is currently out of stock.');
            return;
        }

        const loadingToast = toast.loading('Adding to cart...');
        try {
            if (currentUser) {
                // Handle logged-in user
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
            } else {
                // Handle guest user
                const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
                const existingItemIndex = guestCart.findIndex(item => item._id === product._id);

                if (existingItemIndex !== -1) {
                    // Check if adding one more would exceed stock
                    if (guestCart[existingItemIndex].quantity + 1 > product.stock) {
                        toast.error(`Only ${product.stock} items available in stock.`);
                        return;
                    }
                    guestCart[existingItemIndex].quantity = (guestCart[existingItemIndex].quantity || 1) + 1;
                } else {
                    guestCart.push({
                        _id: product._id,
                        productId: product._id,
                        name: product.name,
                        price: product.price,
                        imageUrl: product.images?.[0] || product.imageUrl,
                        stock: product.stock,
                        quantity: 1
                    });
                }

                localStorage.setItem('guestCart', JSON.stringify(guestCart));
                setCartItems(guestCart);
            }

            toast.dismiss(loadingToast);
            toast.success(`${product.name || 'Item'} added to cart!`);
        } catch (err) {
            console.error('Error adding to cart:', err);
            toast.dismiss(loadingToast);
            toast.error('Failed to add item to cart');
        }
    };

    const removeFromCart = async (productId) => {
        const loadingToast = toast.loading('Removing item...');
        try {
            if (currentUser) {
                // Handle logged-in user
                const res = await fetch('/api/cart', {
                    method: 'DELETE',
                    headers: {
                        'user-id': currentUser.id,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ productId })
                });

                if (!res.ok) throw new Error('Failed to remove from cart');
                
                const data = await res.json();
                setCartItems(data.items || []);
            } else {
                // Handle guest user
                const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
                // Keep all items EXCEPT the one we want to remove
                const updatedCart = guestCart.filter(item => item._id !== productId);
                localStorage.setItem('guestCart', JSON.stringify(updatedCart));
                setCartItems(updatedCart);
            }

            toast.dismiss(loadingToast);
            toast.success('Item removed from cart');
        } catch (err) {
            console.error('Error removing from cart:', err);
            toast.dismiss(loadingToast);
            toast.error('Failed to remove item from cart');
        }
    };

    const updateQuantity = async (productId, newQuantity) => {
        if (newQuantity < 1) return;

        const loadingToast = toast.loading('Updating quantity...');
        try {
            if (currentUser) {
                // Handle logged-in user
                const res = await fetch('/api/cart', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'user-id': currentUser.id
                    },
                    body: JSON.stringify({ productId, quantity: newQuantity })
                });

                if (!res.ok) throw new Error('Failed to update quantity');
                
                const data = await res.json();
                setCartItems(data.items || []);
            } else {
                // Handle guest user
                const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
                const itemIndex = guestCart.findIndex(item => item._id === productId);
                
                if (itemIndex !== -1) {
                    // Check if new quantity exceeds stock
                    if (newQuantity > guestCart[itemIndex].stock) {
                        toast.error(`Only ${guestCart[itemIndex].stock} items available in stock.`);
                        return;
                    }
                    
                    guestCart[itemIndex].quantity = newQuantity;
                    localStorage.setItem('guestCart', JSON.stringify(guestCart));
                    setCartItems(guestCart);
                }
            }

            toast.dismiss(loadingToast);
        } catch (err) {
            console.error('Error updating quantity:', err);
            toast.dismiss(loadingToast);
            toast.error('Failed to update quantity');
        }
    };

    const clearCart = async () => {
        try {
            if (currentUser) {
                const res = await fetch('/api/cart', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'user-id': currentUser.id
                    }
                });
                if (!res.ok) throw new Error('Failed to clear cart');
            } else {
                localStorage.removeItem('guestCart');
            }
            setCartItems([]);
        } catch (err) {
            console.error('Error clearing cart:', err);
            toast.error('Failed to clear cart');
        }
    };

    // Function to transfer guest cart to user cart after login
    const transferGuestCart = async () => {
        if (!currentUser) return;

        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        if (guestCart.length === 0) return;

        try {
            // Add each guest cart item to the user's cart
            for (const item of guestCart) {
                await fetch('/api/cart', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'user-id': currentUser.id
                    },
                    body: JSON.stringify({ 
                        productId: item._id,
                        quantity: item.quantity 
                    })
                });
            }

            // Clear guest cart
            localStorage.removeItem('guestCart');
            
            // Refresh user's cart
            await fetchCartItems();
        } catch (err) {
            console.error('Error transferring guest cart:', err);
            toast.error('Failed to transfer cart items');
        }
    };

    // Transfer guest cart when user logs in
    useEffect(() => {
        if (currentUser) {
            transferGuestCart();
        }
    }, [currentUser]);

    return (
        <CartContext.Provider value={{
            cartItems,
            isLoading,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
} 