import React, { useMemo, useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function CartModal({ isOpen, onClose, items = [], onRemoveItem, isLoading }) {
    const router = useRouter();
    const { currentUser } = useAuth();

    const [orders, setOrders] = useState([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);
    const [ordersError, setOrdersError] = useState(null);

    const subtotal = useMemo(() => {
        if (!items || !Array.isArray(items)) return 0;
        return items.reduce((sum, item) => sum + (item.price || 0), 0);
    }, [items]);

    const shippingCost = 10.00;
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
                    if (!res.ok) throw new Error('Failed to fetch orders');
                    const data = await res.json();
                    setOrders(data);
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
             // Clear orders data when the modal closes
            setOrders([]);
            setOrdersError(null);
        }
    }, [isOpen, currentUser]);

    const handleCheckout = () => {
        if (!currentUser) {
            toast.error('Please login to proceed to checkout');
            router.push('/auth');
            onClose();
            return;
        }
        onClose();
        router.push('/checkout');
    };

    const handleViewOrder = (orderId) => {
         onClose(); // Close the modal before navigating
         router.push(`/orders/${orderId}`);
    };

    if (isLoading) {
        return (
            <Dialog open={isOpen} onClose={onClose} className="relative z-50">
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    {/* Increased max-w to max-w-3xl for more space */}
                    <Dialog.Panel className="mx-auto max-w-3xl w-full bg-white rounded-xl shadow-lg p-6">
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    </Dialog.Panel>
                </div>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                {/* Increased max-w to max-w-3xl for more space */}
                <Dialog.Panel className="mx-auto max-w-[90vw] w-full bg-white rounded-xl shadow-lg overflow-y-auto">
                    <div className="flex items-center justify-between p-4 border-b">
                        <Dialog.Title className="text-lg font-semibold text-gray-900">
                            Shopping Cart & Orders
                        </Dialog.Title>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Shopping Cart Section */}
                    <div className="p-4 border-b">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center"><Icon name="shoppingBag" className="w-5 h-5 mr-2 text-blue-500" /> Your Cart</h2>
                        {items && items.length > 0 ? (
                            <ul className="divide-y divide-gray-200">
                                {items.map((item, index) => (
                                    <li key={`${item.productId}-${index}`} className="py-4 flex">
                                        <img
                                            src={item.imageUrl || 'https://placehold.co/80x80/gray/ffffff?text=No+Image'}
                                            alt={item.name}
                                            className="h-20 w-20 rounded-lg object-cover"
                                        />
                                        <div className="ml-4 flex-1">
                                            <h3 className="text-sm font-medium text-gray-900">
                                                {item.name || 'Unnamed Item'}
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                ${(item.price || 0).toFixed(2)}
                                            </p>
                                            <div className="mt-2 flex items-center">
                                                <button
                                                    onClick={() => onRemoveItem(item.productId)}
                                                    className="ml-0 text-red-400 hover:text-red-500"
                                                    title="Remove item"
                                                >
                                                    <Icon name="trash" className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-8">
                                <Icon name="shoppingBag" className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Your cart is empty</h3>
                                <p className="mt-1 text-sm text-gray-500">Start adding some items to your cart.</p>
                            </div>
                        )}
                    </div>

                    {items && items.length > 0 && (
                        <div className="border-t border-gray-200 p-4">
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600 mb-4">
                                <span>Shipping</span>
                                <span>${shippingCost.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-base font-medium text-gray-900">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                            <Button
                                onClick={handleCheckout}
                                className="w-full mt-4"
                            >
                                Proceed to Checkout
                            </Button>
                        </div>
                    )}

                    {/* Orders Section */}
                    <div className="p-4">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center"><Icon name="package" className="w-5 h-5 mr-2 text-green-500" /> Your Orders</h2>
                        {isLoadingOrders ? (
                            <div className="flex justify-center items-center h-24">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                            </div>
                        ) : ordersError ? (
                             <div className="text-center text-red-600">
                                 <p>{ordersError}</p>
                             </div>
                        ) : orders && orders.length > 0 ? (
                            <ul className="divide-y divide-gray-200">
                                {orders.map(order => (
                                    <li key={order._id} className="py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50" onClick={() => handleViewOrder(order._id)}>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{order.items?.[0]?.name || `Order #${order._id?.slice(-6).toUpperCase() || 'N/A'}`}</p>
                                            <p className="text-xs text-gray-500">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</p>
                                        </div>
                                        <div className="flex items-center">
                                             <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full mr-2
                                                 ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                   order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                   order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                   order.status === 'returned' ? 'bg-purple-100 text-purple-800' :
                                                   'bg-gray-100 text-gray-800'}`}>
                                                 {order.status || 'N/A'}
                                             </span>
                                             <span className="text-sm font-semibold text-gray-900">${order.totals?.total?.toFixed(2) || '0.00'}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center text-gray-500">
                                <p>No past orders found.</p>
                            </div>
                        )}
                    </div>

                </Dialog.Panel>
            </div>
        </Dialog>
    );
} 