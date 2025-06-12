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
import { X, Plus, Minus, Trash2 } from 'lucide-react';

export default function CartModal({ isOpen, onClose, isLoading: initialLoading }) {
    const router = useRouter();
    const { currentUser } = useAuth();
    const { cartItems, updateQuantity, removeFromCart } = useCart();
    //const { t } = useLanguage();

    const [isOverallLoading, setIsOverallLoading] = useState(initialLoading);
    useEffect(() => {
        setIsOverallLoading(initialLoading);
    }, [initialLoading]);

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
                // For guest users, we need to use _id instead of productId
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
                            Cart
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

                    {/* Scrollable Content Area */}
                    <div className="overflow-y-auto flex-grow">
                        {/* Shopping Cart Section */}
                        <div className="p-4 md:p-6 border-b">
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
                                            <div className="flex-grow">
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
                                    disabled={isOverallLoading}
                                >
                                    Proceed to Checkout
                                </Button>
                            </div>
                        )}
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
}