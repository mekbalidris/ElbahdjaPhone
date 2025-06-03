import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Icon from '../components/ui/Icon';

// Sample list of Algerian Wilayas (Provinces)
const algerianWilayas = [
    { value: '', label: 'Select Wilaya', disabled: true },
    { value: '16', label: 'Alger (16)' },
    { value: '31', label: 'Oran (31)' },
    { value: '25', label: 'Constantine (25)' },
    { value: '23', label: 'Annaba (23)' },
    { value: '19', label: 'Sétif (19)' },
    { value: '15', label: 'Tizi Ouzou (15)' },
    { value: '09', label: 'Blida (09)' },
    { value: '13', label: 'Tlemcen (13)' },
];

const FIXED_SHIPPING_COST = 10.00;

const CheckoutSection = ({ title, icon, children, onEdit, editStep, currentStep }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
                <Icon name={icon} className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
            </div>
            {onEdit && currentStep > editStep && (
                <Button onClick={onEdit} variant="secondary" size="sm" iconLeft="edit" className="!bg-gray-100 hover:!bg-gray-200">Edit</Button>
            )}
        </div>
        {children}
    </div>
);

const OrderSummaryItem = ({ item }) => (
    <li className="flex py-4 border-b border-gray-200 last:border-b-0">
        <img src={item.imageUrl} alt={item.name} className="h-20 w-20 rounded-lg object-cover border border-gray-200" />
        <div className="ml-4 flex-1 flex flex-col justify-center">
            <h3 className="text-sm font-medium text-gray-800 leading-tight">{item.name}</h3>
            {item.attributes && <p className="text-xs text-gray-500">{item.attributes}</p>}
            <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
        </div>
        <p className="text-sm font-semibold text-gray-900 ml-4 shrink-0">${(item.price * item.quantity).toFixed(2)}</p>
    </li>
);

export default function CheckoutPage() {
    const router = useRouter();
    const { currentUser } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    const [contactInfo, setContactInfo] = useState({ email: '', fullName: '', phone: '' });
    const [deliveryAddress, setDeliveryAddress] = useState({
        address: '', aptSuite: '', wilaya: '', city: '',
    });
    const [orderNotes, setOrderNotes] = useState('');
    
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [taxRate] = useState(0.00);

    const [formErrors, setFormErrors] = useState({});
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    // Fetch cart items when component mounts
    useEffect(() => {
        if (!currentUser) {
            toast.error('Please log in to checkout.');
            router.push('/auth');
            return;
        }

        const fetchCartItems = async () => {
            try {
                const res = await fetch('/api/cart', {
                    headers: {
                        'user-id': currentUser.id
                    }
                });
                if (!res.ok) {
                    if (res.status === 404) {
                        toast('Your cart is empty!', { icon: '🛒' });
                        router.push('/products');
                        return;
                    }
                    throw new Error('Failed to fetch cart');
                }

                //nothing
                const data = await res.json();
                if (!data.items || data.items.length === 0) {
                    toast('Your cart is empty!', { icon: '🛒' });
                    router.push('/products');
                    return;
                }
                setCartItems(data.items);
            } catch (err) {
                console.error('Error fetching cart:', err);
                toast.error('Failed to load cart items');
                router.push('/products');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCartItems();
    }, [currentUser, router]);

    const handleInputChange = (setter, field) => (e) => {
        setter(prev => ({ ...prev, [field]: e.target.value }));
        if (formErrors[field]) {
            setFormErrors(prev => ({...prev, [field]: null}));
        }
    };
    
    const subtotal = useMemo(() => cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0), [cartItems]);
    const shippingCost = FIXED_SHIPPING_COST;
    const taxes = useMemo(() => (subtotal - discount) * taxRate, [subtotal, discount, taxRate]);
    const total = useMemo(() => subtotal + shippingCost + taxes - discount, [subtotal, shippingCost, taxes, discount]);

    const applyCoupon = () => {
        if (couponCode.toUpperCase() === 'SALE10') {
            const newDiscount = subtotal * 0.10;
            setDiscount(newDiscount);
            toast.success(`10% discount applied! -$${newDiscount.toFixed(2)}`);
        } else {
            toast.error('Invalid coupon code.');
            setDiscount(0);
        }
        setCouponCode('');
    };
    
    const validateStep1 = () => {
        const errors = {};
        if (!contactInfo.fullName.trim()) errors.fullName = 'Full name is required.';
        if (!contactInfo.email.trim() || !/\S+@\S+\.\S+/.test(contactInfo.email)) errors.email = 'Valid email is required.';
        if (!contactInfo.phone.trim()) errors.phone = 'Phone number is required.';

        if (!deliveryAddress.address.trim()) errors.address = 'Full address is required.';
        if (!deliveryAddress.wilaya) errors.wilaya = 'Wilaya is required.';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handlePlaceOrder = async () => {
        if (!validateStep1()) {
            toast.error('Please complete the contact and delivery information.');
            setCurrentStep(1);
            return;
        }
        
        setIsPlacingOrder(true);
        const loadingToast = toast.loading('Placing your order...');

        try {
            const orderData = {
                userId: currentUser.id,
                items: cartItems.map(item => ({
                    productId: item.productId,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    imageUrl: item.imageUrl,
                    attributes: item.attributes || null
                })),
                contactInfo,
                deliveryAddress,
                orderNotes,
                paymentMethod: 'cash_on_delivery',
                totals: { subtotal, shippingCost, taxes, discount, total },
                status: 'pending',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'user-id': currentUser.id
                },
                body: JSON.stringify(orderData)
            });

            const contentType = res.headers.get('content-type');
            let resultData = null;
            if (contentType && contentType.includes('application/json')) {
                resultData = await res.json();
            }

            if (!res.ok) {
                const errorMessage = resultData?.error || 'Failed to place order';
                throw new Error(errorMessage);
            }

            toast.dismiss(loadingToast);
            toast.success(`Order placed successfully! Payment on delivery.`);
            
            if (resultData && resultData._id) {
                router.push(`/orders/${resultData._id}`);
            } else {
                console.error('Order _id not returned from API');
                router.push('/orders/confirmation');
            }
        } catch (err) {
            console.error('Error placing order:', err);
            toast.dismiss(loadingToast);
            toast.error(err.message || 'Failed to place order. Please try again.');
        } finally {
            setIsPlacingOrder(false);
        }
    };

    const renderStepContent = () => {
        return (
            <>
                <Input label="Full Name" name="fullName" value={contactInfo.fullName} onChange={handleInputChange(setContactInfo, 'fullName')} error={formErrors.fullName} required iconLeft="user" />
                <Input label="Email Address" name="email" type="email" value={contactInfo.email} onChange={handleInputChange(setContactInfo, 'email')} error={formErrors.email} required iconLeft="mail" />
                <Input label="Phone Number (for delivery & confirmation)" name="phone" type="tel" value={contactInfo.phone} onChange={handleInputChange(setContactInfo, 'phone')} error={formErrors.phone} required iconLeft="phone" placeholder="05 XX XX XX XX" />
                
                <h3 className="text-md font-semibold text-gray-700 mt-6 mb-3">Delivery Address</h3>
                <Select label="Wilaya" name="wilaya" options={algerianWilayas} value={deliveryAddress.wilaya} onChange={handleInputChange(setDeliveryAddress, 'wilaya')} error={formErrors.wilaya} required />
                <Input label="City / Commune" name="city" value={deliveryAddress.city} onChange={handleInputChange(setDeliveryAddress, 'city')} error={formErrors.city} placeholder="e.g., Bouzareah" />
                <Input label="Full Address (Street, Building, etc.)" name="address" value={deliveryAddress.address} onChange={handleInputChange(setDeliveryAddress, 'address')} error={formErrors.address} required iconLeft="mapPin" placeholder="e.g., 123 Rue Didouche Mourad, Immeuble A" />
                <Input label="Apartment, Suite, Floor (Optional)" name="aptSuite" value={deliveryAddress.aptSuite} onChange={handleInputChange(setDeliveryAddress, 'aptSuite')} />
                <TextArea label="Order Notes (Optional)" name="orderNotes" value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} placeholder="Any special instructions for delivery..." />

                <Button onClick={handlePlaceOrder} size="lg" className="w-full mt-6" disabled={isPlacingOrder} iconLeft={isPlacingOrder ? null : "lock"}>
                    {isPlacingOrder ? 'Processing...' : `Place Order`}
                </Button>
            </>
        );
    };
    
    const currentSectionTitle = "Contact & Delivery";
    const currentSectionIcon = "mapPin";

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Icon name="shoppingBag" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h1>
                    <p className="text-gray-600 mb-6">Add some items to your cart before checking out.</p>
                    <Button onClick={() => router.push('/products')} variant="primary" size="lg">
                        Continue Shopping
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen py-8 sm:py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Finalize Your Order</h1>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    <div className="lg:w-[60%] w-full">
                        <CheckoutSection 
                            title={currentSectionTitle} 
                            icon={currentSectionIcon}
                            onEdit={false}
                            editStep={1}
                            currentStep={1}
                        >
                            {renderStepContent()}
                        </CheckoutSection>
                    </div>

                    <div className="lg:w-[40%] w-full lg:sticky lg:top-24 self-start">
                        <div className="bg-white p-5 rounded-xl shadow-xl">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                <Icon name="fileText" className="w-6 h-6 text-blue-600 mr-2" /> Order Details
                            </h2>
                            <ul className="max-h-72 overflow-y-auto divide-y divide-gray-200 pr-1 mb-4 custom-scrollbar">
                                {cartItems.map(item => (
                                    <OrderSummaryItem key={item.productId} item={item} />
                                ))}
                            </ul>

                            <div className="space-y-1.5 text-sm text-gray-700 pt-4 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                    <span>Subtotal</span>
                                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center mt-3 mb-2">
                                    <div className="flex-grow flex items-stretch">
                                        <Input 
                                            type="text" 
                                            name="coupon" 
                                            placeholder="Discount code" 
                                            value={couponCode} 
                                            onChange={(e) => setCouponCode(e.target.value)} 
                                            className="!mb-0 !py-2 text-sm rounded-l-lg rounded-r-none border border-gray-300 border-r-0 focus:border-blue-500 focus:ring-blue-500"
                                            disabled={isPlacingOrder}
                                        />
                                    </div>
                                    <Button 
                                        onClick={applyCoupon} 
                                        variant="secondary" 
                                        className="!py-2 text-sm rounded-r-lg rounded-l-none px-3 !bg-gray-200 hover:!bg-gray-300 border border-gray-300 border-l-0"
                                        disabled={!couponCode.trim() || isPlacingOrder}
                                    >
                                        Apply
                                    </Button>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount</span>
                                        <span>-${discount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span className="font-medium">${shippingCost.toFixed(2)}</span>
                                </div>
                                {taxRate > 0 && (
                                    <div className="flex justify-between">
                                        <span>Taxes ({(taxRate * 100).toFixed(0)}%)</span>
                                        <span>${taxes.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 mt-3 border-t-2 border-gray-300">
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="mt-6 p-4 bg-yellow-50 rounded-lg text-yellow-800 flex items-center">
                                <Icon name="dollarSign" className="w-6 h-6 mr-3 shrink-0" />
                                <p className="text-sm font-medium">Payment will be collected upon delivery.</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-4 text-center">
                            By placing your order, you agree to our terms.
                        </p>
                    </div>
                </div>
            </div>
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #edf2f7; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a0aec0; }
            `}</style>
        </div>
    );
} 