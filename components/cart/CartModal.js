import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import Button from '../ui/Button';
import { useRouter } from 'next/router';
import Image from 'next/image';

const CartModal = ({ isOpen, onClose }) => {
    const router = useRouter();
    const { cartItems, updateQuantity, removeFromCart, getCartSubtotal } = useCart();

    const subtotal = getCartSubtotal();
    const shippingFee = subtotal > 0 ? 500 : 0; // Example: 500 DZD shipping, free if cart is empty
    const total = subtotal + shippingFee;

    const handleCheckout = () => {
        onClose();
        router.push('/checkout');
    };

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-500"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                            <Transition.Child
                                as={Fragment}
                                enter="transform transition ease-in-out duration-500 sm:duration-700"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-500 sm:duration-700"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                                    <div className="flex h-full flex-col overflow-y-scroll bg-black shadow-xl">
                                        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                                            <div className="flex items-start justify-between">
                                                <Dialog.Title className="text-lg font-bold text-white">
                                                    Panier d'achat
                                                </Dialog.Title>
                                                <div className="ml-3 flex h-7 items-center">
                                                    <button
                                                        type="button"
                                                        className="-m-2 p-2 text-gray-300 hover:text-white"
                                                        onClick={onClose}
                                                    >
                                                        <span className="sr-only">Close panel</span>
                                                        <X className="h-6 w-6" aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="mt-8">
                                                <div className="flow-root">
                                                    {cartItems.length > 0 ? (
                                                        <ul role="list" className="-my-6 divide-y divide-gray-700">
                                                            {cartItems.map((item) => (
                                                                <li key={item._id + (item.size || '') + (item.color || '')} className="flex py-6">
                                                                    <button
                                                                        className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-600 p-0 bg-transparent"
                                                                        onClick={() => { onClose(); router.push(`/products/${item._id}`); }}
                                                                        aria-label={`Voir ${item.name}`}
                                                                    >
                                                                        <Image
                                                                            src={item.images?.[0] || item.imageUrl || `https://placehold.co/96x96/e2e8f0/94a3b8?text=${encodeURIComponent(item.name || "Product")}`}
                                                                            alt={item.name}
                                                                            width={96}
                                                                            height={96}
                                                                            className="h-full w-full object-cover object-center"
                                                                            onError={(e) => {
                                                                                e.target.src = `https://placehold.co/96x96/e2e8f0/94a3b8?text=${encodeURIComponent(item.name || "Product")}`;
                                                                            }}
                                                                        />
                                                                    </button>

                                                                    <div className="ml-4 flex flex-1 flex-col">
                                                                        <div>
                                                                            <div className="flex justify-between text-base font-medium text-white">
                                                                                <h3>
                                                                                    <button
                                                                                        className="text-left text-white font-bold hover:underline focus:outline-none bg-transparent"
                                                                                        onClick={() => { onClose(); router.push(`/products/${item._id}`); }}
                                                                                        aria-label={`Voir ${item.name}`}
                                                                                        style={{ background: 'none' }}
                                                                                    >
                                                                                        {item.name}
                                                                                    </button>
                                                                                </h3>
                                                                                <p className="ml-4">{item.price.toLocaleString()} DZD</p>
                                                                            </div>
                                                                            <p className="mt-1 text-sm text-white">
                                                                                {item.color && <span>{item.color}</span>}
                                                                                {item.size && item.color && <span className="mx-1">/</span>}
                                                                                {item.size && <span>{item.size}</span>}
                                                                            </p>
                                                                        </div>
                                                                        <div className="flex flex-1 items-end justify-between text-sm">
                                                                            <div className="flex items-center border border-gray-600 rounded">
                                                                                <button onClick={() => updateQuantity(item._id, item.quantity - 1, item.size, item.color)} className="p-1.5" disabled={item.quantity <= 1}><Minus size={14}/></button>
                                                                                <p className="px-2 text-white">Qty {item.quantity}</p>
                                                                                <button onClick={() => updateQuantity(item._id, item.quantity + 1, item.size, item.color)} className="p-1.5"><Plus size={14}/></button>
                                                                            </div>

                                                                            <div className="flex">
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => removeFromCart(item._id, item.size, item.color)}
                                                                                    className="font-medium text-red-600 hover:text-red-500"
                                                                                >
                                                                                    <Trash2 size={18}/>
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <div className="text-center py-10">
                                                            <p className="text-gray-400">Your cart is empty.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {cartItems.length > 0 && (
                                            <div className="border-t border-gray-700 px-4 py-6 sm:px-6">
                                                <div className="flex justify-between text-base font-medium text-white">
                                                    <p>Subtotal</p>
                                                    <p>{subtotal.toLocaleString()} DZD</p>
                                                </div>
                                                 <div className="flex justify-between mt-2 text-sm text-gray-400">
                                                    <p>Shipping</p>
                                                    <p>{shippingFee > 0 ? `${shippingFee.toLocaleString()} DZD` : 'FREE'}</p>
                                                </div>
                                                 <div className="flex justify-between mt-4 text-base font-bold text-white border-t border-gray-700 pt-4">
                                                    <p>Total</p>
                                                    <p>{total.toLocaleString()} DZD</p>
                                                </div>
                                                <p className="mt-0.5 text-sm text-gray-400">Shipping and taxes calculated at checkout.</p>
                                                <div className="mt-6">
                                                    <Button
                                                        onClick={handleCheckout}
                                                        className="w-full bg-gray-900 text-white hover:bg-black"
                                                    >
                                                        Checkout
                                                    </Button>
                                                </div>
                                                <div className="mt-6 flex justify-center text-center text-sm text-gray-400">
                                                    <p>
                                                        or{' '}
                                                        <button
                                                            type="button"
                                                            className="font-medium text-white hover:text-accent bg-transparent"
                                                            onClick={onClose}
                                                            style={{ background: 'none' }}
                                                        >
                                                            Continue Shopping
                                                            <span aria-hidden="true"> &rarr;</span>
                                                        </button>
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
};

export default CartModal;