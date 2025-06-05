import React, { useMemo, useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast'; // For notifications
import { useAuth } from '../../context/AuthContext';

export default function CartModal({ isOpen, onClose, items = [], onRemoveItem, isLoading: initialLoading }) {
    const router = useRouter(); // Now uses the mock useRouter defined above
    const { currentUser } = useAuth();

    const [orders, setOrders] = useState([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);
    const [ordersError, setOrdersError] = useState(null);
    
    const [isOverallLoading, setIsOverallLoading] = useState(initialLoading);
    useEffect(() => {
        setIsOverallLoading(initialLoading);
    }, [initialLoading]);


    const subtotal = useMemo(() => {
        if (!items || !Array.isArray(items)) return 0;
        return items.reduce((sum, item) => sum + (item.price || 0), 0);
    }, [items]);

    const shippingCost = 500.00;
    const total = subtotal + shippingCost;

    // Fetch user's orders when the modal opens and the user is logged in
    useEffect(() => {
        if (isOpen && currentUser) {
            const fetchOrders = async () => {
                setIsLoadingOrders(true);
                setOrdersError(null);
                try {
                    const res = await fetch('/api/orders', {
                        headers: {
                            'user-id': currentUser.id
                        }
                    });
                    if (!res.ok) {
                      // Handle empty orders specifically if API returns 404 or empty array
                      if(res.status === 404 || (res.headers.get('content-type')?.includes('application/json') && !(await res.clone().json()).length)){
                          setOrders([]);
                      } else {
                        throw new Error('Failed to fetch orders');
                      }
                    } else {
                       const data = await res.json();
                       setOrders(data);
                    }
                } catch (err) {
                    console.error('Error fetching orders:', err);
                    setOrdersError('Failed to load orders.');
                    toast.error('Failed to load orders.');
                } finally {
                    setIsLoadingOrders(false);
                }
            };
            fetchOrders();
        } else if (!isOpen) {
            setOrders([]);
            setOrdersError(null);
        }
    }, [isOpen, currentUser]);

    const handleCheckout = () => {
        if (!currentUser) {
            toast.error('Please login to proceed to checkout');
            router.push('/auth'); // Uses mock router
            onClose();
            return;
        }
        onClose();
        router.push('/checkout'); // Uses mock router
    };

    const handleViewOrder = (orderId) => {
        onClose(); 
        router.push(`/orders/${orderId}`); // Uses mock router
    };
    
    // Simulate items for testing if not provided by props.
    // Keep this empty by default, or add items if you want them to appear when `items` prop is not passed or empty.
    const displayItems = items && items.length > 0 ? items : [
        // Example:
        // { productId: 'sample001', name: 'Sample Item A (Cart)', price: 19.99, imageUrl: 'https://placehold.co/80x80/7B68EE/FFFFFF?text=Shirt' },
        // { productId: 'sample002', name: 'Awesome Mug', price: 12.50, imageUrl: 'https://placehold.co/80x80/6495ED/FFFFFF?text=Mug' },
        // { productId: 'sample003', name: 'Fancy Hat', price: 35.00, imageUrl: 'https://placehold.co/80x80/4682B4/FFFFFF?text=Hat' },
    ];


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
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
            
            {/* Modal Panel Container */}
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="mx-auto w-[95vw] sm:w-[85vw] md:w-[70vw] lg:w-[60vw] xl:max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
                    {/* Header: Sticky */}
                    <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10 flex-shrink-0">
                        <Dialog.Title className="text-xl font-semibold text-gray-800">
                            Shopping Cart & Orders
                        </Dialog.Title>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                            aria-label="Close cart modal"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Scrollable Content Area */}
                    <div className="overflow-y-auto flex-grow">
                        {/* Shopping Cart Section */}
                        <div className="p-4 md:p-6 border-b">
                            <h2 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
                                <Icon name="shoppingBag" className="w-5 h-5 mr-2 text-blue-600" /> Your Cart
                            </h2>
                            {displayItems && displayItems.length > 0 ? (
                                <ul className="divide-y divide-gray-200">
                                    {displayItems.map((item, index) => (
                                        <li key={`${item.productId || 'item'}-${index}`} className="py-4 flex">
                                            <img
                                                src={item.imageUrl || `https://placehold.co/80x80/EAEAEA/999999?text=${item.name ? item.name.charAt(0) : 'N'}`}
                                                alt={item.name || 'Product Image'}
                                                className="h-20 w-20 rounded-lg object-cover flex-shrink-0 border border-gray-200"
                                                onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/80x80/F0F0F0/AAAAAA?text=Error'; }}
                                            />
                                            <div className="ml-4 flex-1">
                                                <h3 className="text-base font-medium text-gray-800">
                                                    {item.name || 'Unnamed Item'}
                                                </h3>
                                                <p className="mt-1 text-sm text-gray-600">
                                                    {(item.price || 0).toFixed(2)} DA
                                                </p>
                                                {onRemoveItem && (
                                                    <div className="mt-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => onRemoveItem(item.productId)}
                                                            className="text-red-500 hover:text-red-700 p-1 rounded-md text-sm font-medium hover:bg-red-50 transition-colors flex items-center"
                                                            title="Remove item"
                                                            aria-label={`Remove ${item.name || 'item'}`}
                                                        >
                                                            <Icon name="trash" className="h-4 w-4 mr-1" /> Remove
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-10">
                                    <Icon name="shoppingBag" className="mx-auto h-16 w-16 text-gray-300" />
                                    <h3 className="mt-3 text-md font-medium text-gray-800">Your cart is empty</h3>
                                    <p className="mt-1 text-sm text-gray-500">Looks like you haven&apos;t added anything yet.</p>
                                </div>
                            )}
                        </div>

                        {/* Cart Summary & Checkout Button (Only if cart has items) */}
                        {displayItems && displayItems.length > 0 && (
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
                                    disabled={isLoadingOrders || isOverallLoading}
                                >
                                    {currentUser ? 'Proceed to Checkout' : 'Login to Checkout'}
                                </Button>
                            </div>
                        )}

                        {/* Orders Section (Only if user is logged in) */}
                        {currentUser && (
                            <div className="p-4 md:p-6 border-t">
                                <h2 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
                                    <Icon name="package" className="w-5 h-5 mr-2 text-green-600" /> Your Past Orders
                                </h2>
                                {isLoadingOrders ? (
                                    <div className="flex justify-center items-center h-24">
                                        <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600"></div>
                                        <p className="ml-3 text-gray-600">Loading your orders...</p>
                                    </div>
                                ) : ordersError ? (
                                    <div className="text-center text-red-700 bg-red-50 p-4 rounded-lg">
                                        <p className="font-medium">Oops! Something went wrong.</p>
                                        <p className="text-sm">{ordersError}</p>
                                    </div>
                                ) : orders && orders.length > 0 ? (
                                    <ul className="divide-y divide-gray-200 pr-1">
                                        {orders.map(order => (
                                            <li key={order._id} className="py-3 px-1 flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-md transition-colors group" onClick={() => handleViewOrder(order._id)}>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800 group-hover:text-blue-600">{order.items?.[0]?.name || `Order #${order._id?.slice(-6).toUpperCase() || 'N/A'}`}</p>
                                                    <p className="text-xs text-gray-500">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</p>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full
                                                        ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                        order.status === 'returned' ? 'bg-purple-100 text-purple-800' :
                                                        'bg-gray-100 text-gray-800'}`}>
                                                        {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'N/A'}
                                                    </span>
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {order.totals?.total?.toFixed(2) || '0.00'} DA
                                                    </span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-center text-gray-500 py-8">
                                        <Icon name="package" className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                                        <p className="text-md">No past orders found.</p>
                                        <p className="text-xs mt-1">Any orders you place will appear here.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {!currentUser && displayItems && displayItems.length > 0 && (
                            <div className="p-4 md:p-6 border-t text-center text-sm text-gray-600 bg-gray-50">
                                Please <button type="button" onClick={handleCheckout} className="text-blue-600 hover:underline font-semibold">login</button> to see your past orders or to complete your purchase.
                            </div>
                        )}
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
}