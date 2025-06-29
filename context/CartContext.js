import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const CartContext = createContext();

export function CartProvider({ children }) {
    const { currentUser } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Creates a unique ID for a cart item based on product ID, size, and color
    const getCartItemId = (productId, size, color) => {
        return `${productId}${size ? `-${size}` : ''}${color ? `-${color}` : ''}`;
    };
    
    useEffect(() => {
        const loadCart = async () => {
            setIsLoading(true);
            let initialCart = [];
            if (currentUser) {
                try {
                    const res = await fetch('/api/cart', { headers: { 'user-id': currentUser.id } });
                    if (res.ok) {
                        const data = await res.json();
                        initialCart = data.items || [];
                    } else {
                        throw new Error('Failed to fetch cart from server.');
                    }
                } catch (err) {
                    console.error('Error fetching cart:', err);
                    toast.error('Could not load your cart.');
                }
            } else {
                // Load guest cart from localStorage
                const guestCartJson = localStorage.getItem('guestCart');
                if (guestCartJson) {
                    try {
                        initialCart = JSON.parse(guestCartJson);
                    } catch {
                        localStorage.removeItem('guestCart');
                    }
                }
            }
            setCartItems(initialCart);
            setIsLoading(false);
        };
        loadCart();
    }, [currentUser]);
    
    const saveCart = async (newCartItems) => {
        setCartItems(newCartItems);
        if (currentUser) {
            try {
                await fetch('/api/cart', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'user-id': currentUser.id },
                    body: JSON.stringify({ items: newCartItems }),
                });
            } catch (error) {
                console.error("Failed to save cart to backend:", error);
                toast.error("Could not sync your cart with the server.");
            }
        } else {
            localStorage.setItem('guestCart', JSON.stringify(newCartItems));
        }
    };

    const addToCart = (product, quantity, size, color) => {
        if (product.stock <= 0) {
            toast.error('This product is out of stock.');
            return;
        }

        const newCartItems = [...cartItems];
        const cartItemId = getCartItemId(product._id, size, color);
        const existingItemIndex = newCartItems.findIndex(item => getCartItemId(item._id, item.size, item.color) === cartItemId);

        if (existingItemIndex !== -1) {
            newCartItems[existingItemIndex].quantity += quantity;
        } else {
            newCartItems.push({ ...product, quantity, size, color });
        }
        
        saveCart(newCartItems);
        toast.success(`${product.name} added to cart!`);
    };

    const removeFromCart = (productId, size, color) => {
        const cartItemId = getCartItemId(productId, size, color);
        const newCartItems = cartItems.filter(item => getCartItemId(item._id, item.size, item.color) !== cartItemId);
        saveCart(newCartItems);
        toast.success('Item removed from cart.');
    };

    const updateQuantity = (productId, newQuantity, size, color) => {
        if (newQuantity < 1) {
            removeFromCart(productId, size, color);
            return;
        }

        const cartItemId = getCartItemId(productId, size, color);
        const newCartItems = cartItems.map(item =>
            getCartItemId(item._id, item.size, item.color) === cartItemId
                ? { ...item, quantity: newQuantity }
                : item
        );
        saveCart(newCartItems);
    };

    const updateCartItemOptions = (productId, oldSize, oldColor, newSize, newColor) => {
        // Find the item with old options
        const oldCartItemId = getCartItemId(productId, oldSize, oldColor);
        const itemIndex = cartItems.findIndex(item => getCartItemId(item._id, item.size, item.color) === oldCartItemId);

        if (itemIndex === -1) {
            toast.error('Item not found in cart.');
            return;
        }

        const item = cartItems[itemIndex];
        const newCartItemId = getCartItemId(productId, newSize, newColor);

        // Check if the new combination already exists
        const existingItemIndex = cartItems.findIndex(item => getCartItemId(item._id, item.size, item.color) === newCartItemId);
        
        if (existingItemIndex !== -1 && existingItemIndex !== itemIndex) {
            // If the new combination exists, merge quantities
            const newCartItems = [...cartItems];
            newCartItems[existingItemIndex].quantity += item.quantity;
            newCartItems.splice(itemIndex, 1); // Remove the old item
            saveCart(newCartItems);
            toast.success('Options updated and quantities merged!');
        } else {
            // Update the existing item with new options
            const newCartItems = cartItems.map((cartItem, index) =>
                index === itemIndex
                    ? { ...cartItem, size: newSize, color: newColor }
                    : cartItem
            );
            saveCart(newCartItems);
            toast.success('Options updated successfully!');
        }
    };
    
    const getCartSubtotal = () => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const clearCart = () => {
        saveCart([]);
    };
    
    // This function can be expanded for more complex cart merging logic
    const transferGuestCartToUser = async () => {
        const guestCartJson = localStorage.getItem('guestCart');
        if (guestCartJson) {
            const guestCart = JSON.parse(guestCartJson);
            if (guestCart.length > 0) {
                // A simple overwrite, but you could merge instead
                await saveCart(guestCart);
                localStorage.removeItem('guestCart');
                 toast.success('Your guest cart has been moved to your account.');
            }
        }
    };
    
    useEffect(() => {
        if(currentUser) {
            transferGuestCartToUser();
        }
    }, [currentUser]);


    return (
        <CartContext.Provider
            value={{
                cartItems,
                isLoading,
                addToCart,
                removeFromCart,
                updateQuantity,
                updateCartItemOptions,
                getCartSubtotal,
                clearCart,
            }}
        >
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