import React, { useMemo } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function CartModal({ isOpen, onClose, items = [], onUpdateQuantity, onRemoveItem, isLoading }) {
    const router = useRouter();
    const { currentUser } = useAuth();
    const subtotal = useMemo(() => {
        if (!items || !Array.isArray(items)) return 0;
        return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }, [items]);

    const shippingCost = 10.00;
    const total = subtotal + shippingCost;

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

    if (isLoading) {
        return (
            <Dialog open={isOpen} onClose={onClose} className="relative z-50">
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="mx-auto max-w-md w-full bg-white rounded-xl shadow-lg p-6">
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
                <Dialog.Panel className="mx-auto max-w-md w-full bg-white rounded-xl shadow-lg">
                    <div className="flex items-center justify-between p-4 border-b">
                        <Dialog.Title className="text-lg font-semibold text-gray-900">
                            Shopping Cart
                        </Dialog.Title>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="p-4 max-h-[60vh] overflow-y-auto">
                        {items && items.length > 0 ? (
                            <ul className="divide-y divide-gray-200">
                                {items.map((item) => (
                                    <li key={item.productId} className="py-4 flex">
                                        <img
                                            src={item.imageUrl}
                                            alt={item.name}
                                            className="h-20 w-20 rounded-lg object-cover"
                                        />
                                        <div className="ml-4 flex-1">
                                            <h3 className="text-sm font-medium text-gray-900">
                                                {item.name}
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                ${item.price.toFixed(2)}
                                            </p>
                                            <div className="mt-2 flex items-center">
                                                <button
                                                    onClick={() => onUpdateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                                                    className="text-gray-400 hover:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    disabled={item.quantity <= 1}
                                                    title="Decrease quantity"
                                                >
                                                    <Icon name="minus" className="h-4 w-4" />
                                                </button>
                                                <span className="mx-2 text-gray-600 min-w-[2rem] text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                                                    className="text-gray-400 hover:text-gray-500"
                                                    title="Increase quantity"
                                                >
                                                    <Icon name="plus" className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => onRemoveItem(item.productId)}
                                                    className="ml-4 text-red-400 hover:text-red-500"
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
                </Dialog.Panel>
            </div>
        </Dialog>
    );
} 