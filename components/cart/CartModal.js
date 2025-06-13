import React, { useMemo, useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast'; // For notifications
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
//import { useLanguage } from '../../context/LanguageContext';
import { X, Plus, Minus, Trash2, Package } from 'lucide-react';

export default function CartModal({ isOpen, onClose, isLoading: initialLoading }) {
    const router = useRouter();
    const { currentUser } = useAuth();
    const { cartItems, updateQuantity, removeFromCart } = useCart();
    const [orders, setOrders] = useState([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);
    const [activeTab, setActiveTab] = useState('cart'); // 'cart' or 'orders'
    //const { t } = useLanguage();

    const [isOverallLoading, setIsOverallLoading] = useState(initialLoading);
    useEffect(() => {
        setIsOverallLoading(initialLoading);
    }, [initialLoading]);

    // Fetch orders when the modal opens
    useEffect(() => {
        if (isOpen) {
            fetchOrders();
        }
    }, [isOpen]);

    const fetchOrders = async () => {
        setIsLoadingOrders(true);
        try {
            let orders = [];
            
            if (currentUser) {
                // For logged-in users, fetch their orders from the API
                const response = await fetch('/api/orders', {
                    headers: {
                        'user-id': currentUser.id
                    }
                });
                if (!response.ok) throw new Error('Failed to fetch orders');
                orders = await response.json();
            } else {
                // For guests, fetch their orders from localStorage
                const guestUserId = localStorage.getItem('guestUserId');
                if (guestUserId) {
                    const response = await fetch('/api/orders', {
                        headers: {
                            'user-id': guestUserId
                        }
                    });
                    if (response.ok) {
                        orders = await response.json();
                    }
                }
            }
            
            // Filter orders to only show the current user's orders
            orders = orders.filter(order => 
                (currentUser && order.userId === currentUser.id) || 
                (!currentUser && order.userId === localStorage.getItem('guestUserId'))
            );
            
            setOrders(orders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setIsLoadingOrders(false);
        }
    };

    const subtotal = useMemo(() => {
        if (!cartItems || !Array.isArray(cartItems)) return 0;
        return cartItems.reduce((sum, item) => {
            const quantity = item.quantity || 1;
            return sum + ((item.price || 0) * quantity);
        }, 0);
    }, [cartItems]);

    const shippingCost = 500.00;
    const total = subtotal + shippingCost;

    const handleCheckout = () => {
        onClose();
        router.push('/checkout');
    };

    const handleViewOrder = (orderId) => {
        onClose();
        router.push(`/orders/${orderId}`);
    };

    // Simulate items for testing if not provided by props.
    // Keep this empty by default, or add items if you want them to appear when `items` prop is not passed or empty.
    const displayItems = cartItems && cartItems.length > 0 ? cartItems : [
        // Example:
        // { productId: 'sample001', name: 'Sample Item A (Cart)', price: 19.99, imageUrl: 'https://placehold.co/80x80/7B68EE/FFFFFF?text=Shirt' },
        // { productId: 'sample002', name: 'Awesome Mug', price: 12.50, imageUrl: 'https://placehold.co/80x80/6495ED/FFFFFF?text=Mug' },
        // { productId: 'sample003', name: 'Fancy Hat', price: 35.00, imageUrl: 'https://placehold.co/80x80/4682B4/FFFFFF?text=Hat' },
    ];

    const handleQuantityChange = async (productId, currentQuantity, change) => {
        const newQuantity = currentQuantity + change;
        if (newQuantity > 0) {
            try {
                const idToUse = currentUser ? productId : productId;
                await updateQuantity(idToUse, newQuantity);
            } catch (error) {
                console.error('Error updating quantity:', error);
                toast.error('Failed to update quantity');
            }
        }
    };

    const handleRemoveItem = async (productId) => {
        try {
            await removeFromCart(productId);
        } catch (error) {
            console.error('Error removing item:', error);
            toast.error('Failed to remove item');
        }
    };

    if (isOverallLoading) {
        return (
            <Dialog open={isOpen} onClose={onClose} className="relative z-50">
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="mx-auto w-[95vw] sm:w-[85vw] md:w-[70vw] lg:w-[60vw] xl:max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden p-6">
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            <p className="ml-3 text-gray-700">Loading...</p>
                        </div>
                    </Dialog.Panel>
                </div>
            </Dialog>
        );
    }

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            className="relative z-50"
            data-cart-modal
        >
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
            
            {/* Modal Panel Container */}
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="mx-auto w-[95vw] sm:w-[85vw] md:w-[70vw] lg:w-[60vw] xl:max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
                    {/* Header: Sticky */}
                    <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10 flex-shrink-0">
                        <Dialog.Title className="text-xl font-semibold text-gray-800">
                            {activeTab === 'cart' ? 'Shopping Cart' : 'My Orders'}
                        </Dialog.Title>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                            aria-label="close"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex border-b">
                        <button
                            onClick={() => setActiveTab('cart')}
                            className={`flex-1 py-3 text-center font-medium transition-colors ${
                                activeTab === 'cart'
                                    ? 'text-amber-500 border-b-2 border-amber-500'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Cart
                        </button>
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`flex-1 py-3 text-center font-medium transition-colors ${
                                activeTab === 'orders'
                                    ? 'text-amber-500 border-b-2 border-amber-500'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            My Orders
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {activeTab === 'cart' ? (
                            // Shopping Cart Section
                            <div className="p-4 md:p-6">
                                <h2 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
                                    <Icon name="shoppingBag" className="w-5 h-5 mr-2 text-blue-600" /> Shopping Cart
                                </h2>
                                {displayItems && displayItems.length > 0 ? (
                                    <div className="mt-4 space-y-4">
                                        {displayItems.map((item) => (
                                            <div key={`${item.productId}-${item._id}`} className="flex items-center space-x-4 py-4 border-b border-gray-200">
                                                <div className="flex-shrink-0 w-20 h-20">
                                                    <img
                                                        src={item.images?.[0] || item.imageUrl || 'https://placehold.co/200x200'}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover rounded-lg"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                                                    <p className="text-sm text-gray-500">{item.price.toFixed(2)} DA</p>
                                                    <div className="flex items-center space-x-2 mt-2">
                                                        <button
                                                            onClick={() => handleQuantityChange(item._id || item.productId, item.quantity || 1, -1)}
                                                            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                                                        >
                                                            <Minus className="h-4 w-4 text-gray-500" />
                                                        </button>
                                                        <span className="text-sm font-medium w-8 text-center">{item.quantity || 1}</span>
                                                        <button
                                                            onClick={() => handleQuantityChange(item._id || item.productId, item.quantity || 1, 1)}
                                                            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                                                        >
                                                            <Plus className="h-4 w-4 text-gray-500" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end space-y-2">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {((item.price * (item.quantity || 1)).toFixed(2))} DA
                                                    </p>
                                                    <button
                                                        onClick={() => handleRemoveItem(item.productId)}
                                                        className="text-red-500 hover:text-red-600"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10">
                                        <Icon name="shoppingBag" className="mx-auto h-16 w-16 text-gray-300" />
                                        <h3 className="mt-3 text-md font-medium text-gray-800">Your cart is empty</h3>
                                        <p className="mt-1 text-sm text-gray-500">Add some items to your cart to get started</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Orders Section
                            <div className="p-4 md:p-6">
                                <h2 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
                                    <Package className="w-5 h-5 mr-2 text-blue-600" /> My Orders
                                </h2>
                                {isLoadingOrders ? (
                                    <div className="flex justify-center items-center py-8">
                                        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : orders.length > 0 ? (
                                    <div className="space-y-4">
                                        {orders.map((order) => (
                                            <div
                                                key={order._id}
                                                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                                                onClick={() => handleViewOrder(order._id)}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <p className="font-medium text-gray-900">Order #{order._id.slice(-6).toUpperCase()}</p>
                                                        <p className="text-sm text-gray-500">
                                                            {new Date(order.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <p className="text-sm text-gray-600">
                                                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                                    </p>
                                                    <p className="font-medium text-gray-900">
                                                        {order.totals.total.toFixed(2)} DA
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10">
                                        <Package className="mx-auto h-16 w-16 text-gray-300" />
                                        <h3 className="mt-3 text-md font-medium text-gray-800">No orders yet</h3>
                                        <p className="mt-1 text-sm text-gray-500">Your order history will appear here</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Cart Summary & Checkout Button (Only if cart has items and cart tab is active) */}
                    {activeTab === 'cart' && displayItems && displayItems.length > 0 && (
                        <div className="border-t border-gray-200 p-4 md:p-6 bg-gray-50">
                            <div className="space-y-2 text-sm mb-4">
                                <div className="flex justify-between text-gray-700">
                                    <span>Subtotal</span>
                                    <span className="font-medium">{subtotal.toFixed(2)} DA</span>
                                </div>
                                <div className="flex justify-between text-gray-700">
                                    <span>Shipping</span>
                                    <span className="font-medium">{shippingCost.toFixed(2)} DA</span>
                                </div>
                            </div>
                            <div className="flex justify-between text-lg font-semibold text-gray-900 mb-5">
                                <span>Total</span>
                                <span>{total.toFixed(2)} DA</span>
                            </div>
                            <Button
                                onClick={handleCheckout}
                                className="w-full py-3 text-base"
                                disabled={isOverallLoading}
                            >
                                Proceed to Checkout
                            </Button>
                        </div>
                    )}
                </Dialog.Panel>
            </div>
        </Dialog>
    );
}