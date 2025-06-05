import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router'; // Assuming this is in a Next.js project
import { useAuth } from '../context/AuthContext'; // Adjust path as needed
import Button from '../components/ui/Button'; // Adjust path as needed
import Input from '../components/ui/Input';   // Adjust path as needed
import Select from '../components/ui/Select'; // Adjust path as needed
import TextArea from '../components/ui/TextArea'; // Adjust path as needed
import Icon from '../components/ui/Icon';     // Adjust path as needed
// Using lucide-react directly for self-contained example if Icon component is not fully defined
import { FileText, MapPin, User, Mail, Phone, Lock, DollarSign, ShoppingBag, Edit2, ChevronLeft, CreditCard, Truck, Tag, Home as HomeIcon, Package, Star, Image as ImageIcon, Search, Filter, XCircle, ChevronDown, ChevronUp, Menu, X as XIcon, Plus, Minus, Trash } from 'lucide-react';


// --- Minimal Inlined UI Components (if not using separate files) ---
// If Button, Input, Select, TextArea, Icon are in separate files and working, you don't need these minimal versions.
// These are here to make the example runnable if those components are not fully defined in the context.

const MinimalIcon = ({ name, className, ...props }) => {
    const icons = {
        fileText: FileText, mapPin: MapPin, user: User, mail: Mail, phone: Phone, lock: Lock,
        dollarSign: DollarSign, shoppingBag: ShoppingBag, edit: Edit2, chevronLeft: ChevronLeft,
        creditCard: CreditCard, truck: Truck, tag: Tag, home: HomeIcon, package: Package, star: Star,
        image: ImageIcon, search: Search, filter: Filter, xCircle: XCircle, chevronDown: ChevronDown,
        chevronUp: ChevronUp, menu: Menu, x: XIcon, plus: Plus, minus: Minus, trash: Trash
    };
    const LucideComponent = icons[name];
    return LucideComponent ? <LucideComponent className={className || "w-5 h-5"} {...props} /> : null;
};

// Fallback UI components if the imported ones are not available in this specific context
const FallbackButton = ({ children, onClick, variant = 'primary', size = 'md', className = '', type = 'button', disabled = false, iconLeft }) => {
    const baseStyle = "font-semibold focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-all duration-150 ease-in-out flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md";
    const sizeStyles = { sm: "px-3 py-1.5 text-xs rounded-md", md: "px-4 py-2 text-sm rounded-lg", lg: "px-6 py-3 text-base rounded-lg" };
    const variantStyles = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
        secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-400",
    };
    return <button type={type} onClick={onClick} className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`} disabled={disabled}> {iconLeft && <MinimalIcon name={iconLeft} className="mr-2 w-4 h-4"/>} {children} </button>;
};
const FallbackInput = React.forwardRef(({ type = 'text', placeholder, value, onChange, name, label, required = false, className = '', error, iconLeft }, ref) => (
    <div className="mb-4 w-full">
        {label && <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>}
        <div className="relative">
            {iconLeft && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><MinimalIcon name={iconLeft} className="text-gray-400 w-5 h-5" /></div>}
            <input ref={ref} type={type} id={name} name={name} placeholder={placeholder} value={value} onChange={onChange} required={required} className={`w-full px-3 py-2.5 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500' : 'focus:ring-blue-500'} focus:border-transparent ${iconLeft ? 'pl-10' : ''} ${className}`} />
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
));
const FallbackSelect = React.forwardRef(({ options, value, onChange, name, label, required = false, className = '', error }, ref) => (
    <div className="mb-4 w-full">
        {label && <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>}
        <select ref={ref} id={name} name={name} value={value} onChange={onChange} required={required} className={`w-full px-3 py-2.5 border ${error ? 'border-red-500' : 'border-gray-300'} bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500' : 'focus:ring-blue-500'} focus:border-transparent ${className}`}>
            {options.map(option => (<option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>))}
        </select>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
));
const FallbackTextArea = React.forwardRef(({ placeholder, value, onChange, name, label, rows = 3, className = '', error }, ref) => (
    <div className="mb-4 w-full">
        {label && <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
        <textarea ref={ref} name={name} placeholder={placeholder} value={value} onChange={onChange} rows={rows} className={`w-full px-3 py-2.5 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500' : 'focus:ring-blue-500'} focus:border-transparent ${className}`} />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
));

// Use imported components if available, otherwise fallbacks
const ActualButton = Button || FallbackButton;
const ActualInput = Input || FallbackInput;
const ActualSelect = Select || FallbackSelect;
const ActualTextArea = TextArea || FallbackTextArea;
const ActualIcon = Icon || MinimalIcon;
// --- End Fallback UI Components ---


const algerianWilayas = [
    { value: '', label: 'Select Wilaya', disabled: true },
    { value: '16', label: 'Alger (16)' }, { value: '31', label: 'Oran (31)' },
    { value: '25', label: 'Constantine (25)' }, { value: '23', label: 'Annaba (23)' },
    { value: '19', label: 'Sétif (19)' }, { value: '15', label: 'Tizi Ouzou (15)' },
    { value: '09', label: 'Blida (09)' }, { value: '13', label: 'Tlemcen (13)' },
    // Add all 58 Wilayas here for a complete list
];

const FIXED_SHIPPING_COST = 500.00; // Set shipping cost to 500 DA

const CheckoutSection = ({ title, icon, children }) => ( // Removed onEdit, editStep, currentStep for simplicity in this version
    <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
        <div className="flex items-center mb-4">
            <ActualIcon name={icon} className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        </div>
        {children}
    </div>
);

CheckoutSection.displayName = 'CheckoutSection';

const OrderSummaryItem = ({ item }) => (
    <li className="flex py-4 border-b border-gray-200 last:border-b-0">
        <img src={item.imageUrl || `https://placehold.co/80x80/e0e0e0/757575?text=${item.name.substring(0,1)}`} alt={item.name} className="h-20 w-20 rounded-lg object-cover border border-gray-200" />
        <div className="ml-4 flex-1 flex flex-col justify-center">
            <h3 className="text-sm font-medium text-gray-800 leading-tight">{item.name}</h3>
            {item.attributes && <p className="text-xs text-gray-500">{item.attributes}</p>}
            <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity || 0}</p>
        </div>
        <p className="text-sm font-semibold text-gray-900 ml-4 shrink-0">${(((item.price || 0) * (item.quantity || 0))).toFixed(2)}</p>
    </li>
);
OrderSummaryItem.displayName = 'OrderSummaryItem';

const CheckoutForm = React.forwardRef((props, ref) => {
    // ... existing code ...
});
CheckoutForm.displayName = 'CheckoutForm';

const PaymentForm = React.forwardRef((props, ref) => {
    // ... existing code ...
});
PaymentForm.displayName = 'PaymentForm';

const OrderSummary = React.forwardRef((props, ref) => {
    // ... existing code ...
});
OrderSummary.displayName = 'OrderSummary';

export default function CheckoutPage() {
    const router = useRouter();
    const { currentUser, isLoading: authLoading } = useAuth(); // Get auth loading state
    const [cartItems, setCartItems] = useState([]);
    const [isLoadingCart, setIsLoadingCart] = useState(true); // Separate loading for cart

    const [contactInfo, setContactInfo] = useState({ email: '', fullName: '', phone: '' });
    const [deliveryAddress, setDeliveryAddress] = useState({
        address: '', aptSuite: '', wilaya: '', city: '',
    });
    const [orderNotes, setOrderNotes] = useState('');
    
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [taxRate] = useState(0.00); // Assuming 0% tax for simplicity

    const [formErrors, setFormErrors] = useState({});
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    useEffect(() => {
        if (authLoading) return; // Wait for auth to load

        if (!currentUser) {
            toast.error('Please log in to checkout.');
            router.push('/auth');
            return;
        }

        const fetchCartItems = async () => {
            setIsLoadingCart(true);
            try {
                const res = await fetch('/api/cart', { headers: { 'user-id': currentUser.id } });
                if (!res.ok) {
                    if (res.status === 404) { // Cart might be empty
                        setCartItems([]); 
                        // toast('Your cart is empty. Add some items!', { icon: '🛒' });
                        // router.push('/products'); // Optionally redirect if cart is empty
                        return;
                    }
                    throw new Error('Failed to fetch cart');
                }
                const data = await res.json();
                if (!data.items || data.items.length === 0) {
                    // toast('Your cart is empty. Add some items!', { icon: '🛒' });
                    // router.push('/products'); // Optionally redirect
                    setCartItems([]);
                } else {
                    setCartItems(data.items);
                }
            } catch (err) {
                console.error('Error fetching cart:', err);
                toast.error('Failed to load cart items. Please try again.');
                // router.push('/products'); // Redirect on critical error
            } finally {
                setIsLoadingCart(false);
            }
        };
        fetchCartItems();
    }, [currentUser, router, authLoading]);

    const handleInputChange = (setter, field) => (e) => {
        setter(prev => ({ ...prev, [field]: e.target.value }));
        if (formErrors[field]) {
            setFormErrors(prev => ({...prev, [field]: null}));
        }
    };
    
    const subtotal = useMemo(() => {
        if (!Array.isArray(cartItems)) return 0;
        return cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
    }, [cartItems]);

    const shippingCost = cartItems.length > 0 ? FIXED_SHIPPING_COST : 0; // No shipping cost if cart is empty
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
    
    const validateForm = () => { // Renamed from validateStep1
        const errors = {};
        if (!contactInfo.fullName.trim()) errors.fullName = 'Full name is required.';
        if (!contactInfo.email.trim() || !/\S+@\S+\.\S+/.test(contactInfo.email)) errors.email = 'Valid email is required.';
        if (!contactInfo.phone.trim()) errors.phone = 'Phone number is required.';
        else if (!/^(05|06|07)\d{8}$/.test(contactInfo.phone.replace(/\s/g, ''))) errors.phone = 'Valid Algerian phone number required (e.g., 05 XX XX XX XX).';


        if (!deliveryAddress.address.trim()) errors.address = 'Full address is required.';
        if (!deliveryAddress.wilaya) errors.wilaya = 'Wilaya is required.';
        if (!deliveryAddress.city.trim()) errors.city = 'City / Commune is required.';


        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handlePlaceOrder = async () => {
        if (!validateForm()) {
            toast.error('Please complete all required fields correctly.');
            return;
        }
        if (cartItems.length === 0) {
            toast.error("Your cart is empty. Please add items before placing an order.");
            return;
        }
        
        setIsPlacingOrder(true);
        const loadingToast = toast.loading('Placing your order...');

        try {
            const orderData = {
                userId: currentUser.id, // Make sure currentUser and its id is available
                items: cartItems.map(item => ({
                    productId: item.productId || item._id, // Prefer productId, fallback to _id
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    imageUrl: item.imageUrl,
                    attributes: item.attributes || null
                })),
                contactInfo,
                deliveryAddress,
                orderNotes,
                paymentMethod: 'cash_on_delivery', // Defaulting to cash on delivery
                totals: { subtotal, shippingCost, taxes, discount, total },
                status: 'Pending Confirmation', // Initial status
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'user-id': currentUser.id // Pass user-id if your API needs it for auth/association
                },
                body: JSON.stringify(orderData)
            });
            
            const contentType = res.headers.get('content-type');
            let resultData = null;
            if (contentType && contentType.includes('application/json')) {
                resultData = await res.json();
            }

            if (!res.ok) {
                const errorMessage = resultData?.error || `Failed to place order (Status: ${res.status})`;
                throw new Error(errorMessage);
            }

            toast.dismiss(loadingToast);
            toast.success(resultData?.message || 'Order placed successfully! Payment on delivery.');
            
            if (resultData && resultData._id) {
                router.push(`/orders/${resultData._id}`); // Navigate to order confirmation
            } else {
                console.warn('Order _id not returned from API, redirecting to generic confirmation.');
                router.push('/orders/confirmation'); // Fallback confirmation
            }
        } catch (err) {
            console.error('Error placing order:', err);
            toast.dismiss(loadingToast);
            toast.error(err.message || 'Failed to place order. Please try again.\'');
        } finally {
            setIsPlacingOrder(false);
        }
    };
    
    if (authLoading || isLoadingCart) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="ml-3 text-gray-600">Loading checkout...</p>
            </div>
        );
    }

    if (!currentUser) { // Should be caught by useEffect, but as a safeguard
        return (
             <div className="min-h-screen flex items-center justify-center text-center p-4">
                <div>
                    <ActualIcon name="lock" className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-xl text-gray-700">Please log in to proceed.</p>
                </div>
            </div>
        );
    }
    
    if (cartItems.length === 0 && !isLoadingCart) { // Show if cart is definitively empty after loading
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
                <ActualIcon name="shoppingBag" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Your Cart is Empty</h1>
                <p className="text-gray-600 mb-6">Looks like you haven&apos;t added any items to your cart yet.</p>
                <ActualButton onClick={() => router.push('/products')} variant="primary" size="lg">
                    Continue Shopping
                </ActualButton>
            </div>
        );
    }


    return (
        <div className="bg-gray-100 min-h-screen py-8 sm:py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Finalize Your Order</h1>
                    <p className="text-gray-600 mt-2">Review your details and complete your purchase.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    <div className="lg:w-[60%] w-full">
                        <CheckoutSection 
                            title="Contact & Delivery Information" 
                            icon="mapPin"
                        >
                            <ActualInput label="Full Name" name="fullName" value={contactInfo.fullName} onChange={handleInputChange(setContactInfo, 'fullName')} error={formErrors.fullName} required iconLeft="user" />
                            <ActualInput label="Email Address" name="email" type="email" value={contactInfo.email} onChange={handleInputChange(setContactInfo, 'email')} error={formErrors.email} required iconLeft="mail" />
                            <ActualInput label="Phone Number (for delivery & confirmation)" name="phone" type="tel" value={contactInfo.phone} onChange={handleInputChange(setContactInfo, 'phone')} error={formErrors.phone} required iconLeft="phone" placeholder="05 XX XX XX XX" />
                            
                            <h3 className="text-md font-semibold text-gray-700 mt-6 mb-3">Delivery Address</h3>
                            <ActualSelect label="Wilaya" name="wilaya" options={algerianWilayas} value={deliveryAddress.wilaya} onChange={handleInputChange(setDeliveryAddress, 'wilaya')} error={formErrors.wilaya} required />
                            <ActualInput label="City / Commune" name="city" value={deliveryAddress.city} onChange={handleInputChange(setDeliveryAddress, 'city')} error={formErrors.city} placeholder="e.g., Alger Centre, Bab Ezzouar" required/>
                            <ActualInput label="Full Address (Street, Building, etc.)" name="address" value={deliveryAddress.address} onChange={handleInputChange(setDeliveryAddress, 'address')} error={formErrors.address} required iconLeft="home" placeholder="e.g., 123 Rue Didouche Mourad, Immeuble A, Cité XYZ" />
                            <ActualInput label="Apartment, Suite, Floor (Optional)" name="aptSuite" value={deliveryAddress.aptSuite} onChange={handleInputChange(setDeliveryAddress, 'aptSuite')} placeholder="e.g., Apt 5B, Etage 3" />
                            <ActualTextArea label="Order Notes (Optional)" name="orderNotes" value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} placeholder="Any special instructions for delivery or product specifics..." />

                            <div className="mt-8 p-4 bg-yellow-50 rounded-lg text-yellow-800 flex items-start">
                                <ActualIcon name="dollarSign" className="w-6 h-6 mr-3 shrink-0 mt-1" />
                                <div>
                                    <p className="text-sm font-semibold">Payment on Delivery (الدفع عند الاستلام)</p>
                                    <p className="text-xs">You will pay in cash when your order is delivered. Please have the exact amount ready.</p>
                                </div>
                            </div>

                            <ActualButton onClick={handlePlaceOrder} size="lg" className="w-full mt-8" disabled={isPlacingOrder || cartItems.length === 0} iconLeft={isPlacingOrder ? null : "lock"}>
                                {isPlacingOrder ? 'Processing...' : `Confirm Order`}
                            </ActualButton>
                        </CheckoutSection>
                    </div>

                    <div className="lg:w-[40%] w-full lg:sticky lg:top-24 self-start">
                        <div className="bg-white p-5 rounded-xl shadow-xl">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                <ActualIcon name="fileText" className="w-6 h-6 text-blue-600 mr-2" /> Order Summary
                            </h2>
                            {cartItems.length > 0 ? (
                                <ul className="max-h-72 overflow-y-auto divide-y divide-gray-200 pr-1 mb-4 custom-scrollbar">
                                    {cartItems.map(item => (
                                        <OrderSummaryItem key={item.productId || item._id} item={item} />
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 text-sm py-4 text-center">Your cart appears to be empty.</p>
                            )}

                            <div className="space-y-1.5 text-sm text-gray-700 pt-4 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                    <span>Subtotal</span>
                                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                                </div>
                                {/* Coupon Input and Apply Button - Corrected Alignment */}
                                <div className="flex items-stretch mt-3 mb-2"> {/* Use items-stretch or items-end */}
                                    <div className="flex-grow">
                                        <ActualInput 
                                            type="text" 
                                            name="coupon" 
                                            placeholder="Discount code" 
                                            value={couponCode} 
                                            onChange={(e) => setCouponCode(e.target.value)} 
                                            className="!mb-0 !py-2 text-sm rounded-l-lg rounded-r-none border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-full" // Added h-full
                                            disabled={isPlacingOrder}
                                        />
                                    </div>
                                    <ActualButton 
                                        onClick={applyCoupon} 
                                        variant="secondary" 
                                        className="!py-2 text-sm rounded-r-lg rounded-l-none px-3 !bg-gray-200 hover:!bg-gray-300 border border-l-0 border-gray-300 h-full" // Added h-full
                                        disabled={!couponCode.trim() || isPlacingOrder}
                                    >
                                        Apply
                                    </ActualButton>
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
                        </div>
                        <p className="text-xs text-gray-500 mt-4 text-center">
                            By placing your order, you agree to our terms and conditions.
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

CheckoutPage.displayName = 'CheckoutPage';