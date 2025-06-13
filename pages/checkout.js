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
import { FileText, MapPin, User, Mail, Phone, Lock, DollarSign, ShoppingBag, Edit2, ChevronLeft, CreditCard, Truck, Tag, Home as HomeIcon, Package, Star, Image as ImageIcon, Search, Filter, XCircle, ChevronDown, ChevronUp, Menu, X as XIcon, Plus, Minus, Trash, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';


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
    { value: '16', label: '(16) Alger' },
    { value: '31', label: '(31) Oran' },
    { value: '19', label: '(19) Sétif' },
    { value: '6', label: '(6) Béjaïa' },
    { value: '17', label: '(17) Djelfa' },
    { value: '28', label: '(28) M\'sila' },
    { value: '5', label: '(5) Batna' },
    { value: '7', label: '(7) Biskra' },
    { value: '9', label: '(9) Blida' },
    { value: '10', label: '(10) Bouira' },
    { value: '12', label: '(12) Chlef' },
    { value: '13', label: '(13) Constantine' },
    { value: '14', label: '(14) El Oued' },
    { value: '15', label: '(15) El Tarf' },
    { value: '18', label: '(18) Jijel' },
    { value: '20', label: '(20) Saïda' },
    { value: '21', label: '(21) Skikda' },
    { value: '22', label: '(22) Sidi Bel Abbès' },
    { value: '23', label: '(23) Annaba' },
    { value: '24', label: '(24) Guelma' },
    { value: '25', label: '(25) Constantine' },
    { value: '26', label: '(26) Médéa' },
    { value: '27', label: '(27) Mostaganem' },
    { value: '29', label: '(29) Mascara' },
    { value: '30', label: '(30) Ouargla' },
    { value: '32', label: '(32) El Bayadh' },
    { value: '33', label: '(33) Illizi' },
    { value: '34', label: '(34) Bordj Bou Arréridj' },
    { value: '35', label: '(35) Boumerdès' },
    { value: '36', label: '(36) El Tarf' },
    { value: '37', label: '(37) Tindouf' },
    { value: '38', label: '(38) Tissemsilt' },
    { value: '39', label: '(39) El Oued' },
    { value: '40', label: '(40) Khenchela' },
    { value: '41', label: '(41) Souk Ahras' },
    { value: '42', label: '(42) Tipaza' },
    { value: '43', label: '(43) Mila' },
    { value: '44', label: '(44) Aïn Defla' },
    { value: '45', label: '(45) Naâma' },
    { value: '46', label: '(46) Aïn Témouchent' },
    { value: '47', label: '(47) Ghardaïa' },
    { value: '48', label: '(48) Relizane' },
    { value: '49', label: '(49) Timimoun' },
    { value: '50', label: '(50) Bordj Badji Mokhtar' },
    { value: '51', label: '(51) Ouled Djellal' },
    { value: '52', label: '(52) Béni Abbès' },
    { value: '53', label: '(53) In Salah' },
    { value: '54', label: '(54) In Guezzam' },
    { value: '55', label: '(55) Touggourt' },
    { value: '56', label: '(56) Djanet' },
    { value: '57', label: '(57) El M\'Ghair' },
    { value: '58', label: '(58) El Meniaa' },
];

const FIXED_SHIPPING_COST = 500.00; // Set shipping cost to 500 DA

const CheckoutSection = ({ title, iconName, children }) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200/80">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                <ActualIcon name={iconName} className="w-6 h-6 text-amber-500 mr-2" />
                {title}
            </h2>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );
};

const OrderSummaryItem = ({ item, onUpdateQuantity, onRemove }) => {
    const handleQuantityChange = (change) => {
        const newQuantity = (item.quantity || 1) + change;
        if (newQuantity >= 1) {
            onUpdateQuantity(item.productId, newQuantity);
        }
    };

    return (
        <div className="flex items-center space-x-4 py-4 border-b border-gray-200">
            <div className="flex-shrink-0 w-20 h-20">
                <img
                    src={item.images?.[0] || item.imageUrl || 'https://placehold.co/200x200'}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-lg"
                />
            </div>
            <div className="flex-grow">
                <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                <p className="text-sm text-gray-500">{item.price} DA</p>
                <div className="flex items-center space-x-2 mt-2">
                    <button
                        onClick={() => handleQuantityChange(-1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                    >
                        <Minus className="h-4 w-4 text-gray-500" />
                    </button>
                    <span className="text-sm font-medium w-8 text-center">{item.quantity || 1}</span>
                    <button
                        onClick={() => handleQuantityChange(1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                    >
                        <Plus className="h-4 w-4 text-gray-500" />
                    </button>
                </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
                <p className="text-sm font-medium text-gray-900">
                    {((item.price * (item.quantity || 1)))} DA
                </p>
                <button
                    onClick={() => onRemove(item.productId)}
                    className="text-red-500 hover:text-red-600"
                >
                    <Trash2 className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};

const LoadingSpinner = ({ size = "md" }) => {
    const sizeClasses = {
        sm: "w-5 h-5",
        md: "w-8 h-8",
        lg: "w-12 h-12"
    };
    return (
        <div className={`animate-spin rounded-full border-4 border-gray-200 border-t-amber-500 ${sizeClasses[size]}`} />
    );
};

const CheckoutPage = () => {
    const router = useRouter();
    const { currentUser } = useAuth();
    const { cartItems, isLoading: isLoadingCart, updateQuantity, removeFromCart, clearCart } = useCart();
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [contactInfo, setContactInfo] = useState({
        fullName: currentUser?.name || '',
        email: currentUser?.email || '',
        phone: '',
    });
    const [deliveryAddress, setDeliveryAddress] = useState({
        wilaya: '',
        city: '',
        address: '',
        aptSuite: '',
    });
    const [orderNotes, setOrderNotes] = useState('');

    const handleInputChange = (setter, field) => (e) => {
        setter(prev => ({ ...prev, [field]: e.target.value }));
        if (formErrors[field]) {
            setFormErrors(prev => ({...prev, [field]: null}));
        }
    };

    const subtotal = useMemo(() => cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0), [cartItems]);
    const shippingCost = cartItems.length > 0 ? FIXED_SHIPPING_COST : 0;
    const total = subtotal + shippingCost;

    const validateForm = () => {
        const errors = {};
        if (!contactInfo.fullName.trim()) errors.fullName = 'Full name is required.';
        if (!contactInfo.email.trim() || !/\S+@\S+\.\S+/.test(contactInfo.email)) errors.email = 'Valid email is required.';
        if (!contactInfo.phone.trim()) errors.phone = 'Phone number is required.';
        else if (!/^(05|06|07)\d{8}$/.test(contactInfo.phone.replace(/\s/g, ''))) errors.phone = 'Valid Algerian phone number is required (10 digits).';
        if (!deliveryAddress.wilaya) errors.wilaya = 'Wilaya is required.';
        if (!deliveryAddress.city.trim()) errors.city = 'City / Commune is required.';
        if (!deliveryAddress.address.trim()) errors.address = 'A detailed street address is required.';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handlePlaceOrder = async () => {
        if (!validateForm()) {
            toast.error('Please fix the errors in the form.');
            return;
        }
        setIsPlacingOrder(true);
        const loadingToast = toast.loading('Placing your order...');
        try {
            // Generate or get user ID
            let userId;
            if (currentUser) {
                userId = currentUser.id;
            } else {
                // For guests, generate a unique ID or get existing one from localStorage
                userId = localStorage.getItem('guestUserId') || `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                localStorage.setItem('guestUserId', userId);
            }

            const orderData = {
                items: cartItems.map(item => ({
                    productId: item.productId,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity || 1,
                    imageUrl: item.images?.[0] || item.imageUrl,
                    attributes: item.attributes || null
                })),
                contactInfo,
                deliveryAddress,
                orderNotes,
                totals: {
                    subtotal,
                    shippingCost,
                    total
                },
                paymentMethod: 'cash_on_delivery',
                isGuestOrder: !currentUser,
                userId: userId // Store the user ID in the order
            };

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'user-id': userId // Add user ID to headers
                },
                body: JSON.stringify(orderData)
            });

            const responseData = await response.json();

            if (!response.ok) {
                if (responseData.error.includes('Insufficient stock')) {
                    toast.dismiss(loadingToast);
                    toast.error(responseData.error);
                    return;
                }
                if (responseData.error.includes('Product not found')) {
                    toast.dismiss(loadingToast);
                    toast.error(responseData.error);
                    return;
                }
                throw new Error(responseData.error || 'Failed to place order');
            }

            // Store order ID in localStorage for guests
            if (!currentUser) {
                const guestOrders = JSON.parse(localStorage.getItem('guestOrders') || '[]');
                guestOrders.push(responseData._id);
                localStorage.setItem('guestOrders', JSON.stringify(guestOrders));
            }

            // Clear the cart after successful order placement
            await clearCart();
            
            toast.dismiss(loadingToast);
            toast.success('Order placed successfully!');
            router.push(`/orders/${responseData._id}`);
        } catch (error) {
            console.error('Error placing order:', error);
            toast.dismiss(loadingToast);
            toast.error(error.message || 'Failed to place order. Please try again.');
        } finally {
            setIsPlacingOrder(false);
        }
    };

    if (isLoadingCart) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (cartItems.length === 0 && !isLoadingCart) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-4">
                <ActualIcon name="shoppingBag" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Your Cart is Empty</h1>
                <p className="text-gray-600 mb-6">Add items to your cart to proceed to checkout.</p>
                <ActualButton onClick={() => router.push('/products')} variant="primary" size="lg">
                    Continue Shopping
                </ActualButton>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen py-8 sm:py-12 mt-[2.5rem]">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
                    {/* Left Column: Form */}
                    <div className="lg:col-span-3 space-y-8">
                        <CheckoutSection title="Contact & Delivery" iconName="mapPin">
                            <ActualInput
                                label="Full Name"
                                name="fullName"
                                value={contactInfo.fullName}
                                onChange={handleInputChange(setContactInfo, 'fullName')}
                                error={formErrors.fullName}
                                required
                                iconLeft="user"
                                placeholder="Enter your full name"
                            />
                            <ActualInput
                                label="Email Address"
                                name="email"
                                type="email"
                                value={contactInfo.email}
                                onChange={handleInputChange(setContactInfo, 'email')}
                                error={formErrors.email}
                                required
                                iconLeft="mail"
                                placeholder="Enter your email address"
                            />
                            <ActualInput
                                label="Phone Number"
                                name="phone"
                                type="tel"
                                value={contactInfo.phone}
                                onChange={handleInputChange(setContactInfo, 'phone')}
                                error={formErrors.phone}
                                required
                                iconLeft="phone"
                                placeholder="Enter your phone number"
                            />
                            <h3 className="text-md font-semibold text-slate-700 pt-5 mt-5 border-t border-gray-200">
                                Shipping Address
                            </h3>
                            <ActualSelect
                                label="Wilaya"
                                name="wilaya"
                                options={algerianWilayas}
                                value={deliveryAddress.wilaya}
                                onChange={handleInputChange(setDeliveryAddress, 'wilaya')}
                                error={formErrors.wilaya}
                                required
                            />
                            <ActualInput
                                label="City / Commune"
                                name="city"
                                value={deliveryAddress.city}
                                onChange={handleInputChange(setDeliveryAddress, 'city')}
                                error={formErrors.city}
                                placeholder="Enter your city or commune"
                                required
                            />
                            <ActualInput
                                label="Street Address"
                                name="address"
                                value={deliveryAddress.address}
                                onChange={handleInputChange(setDeliveryAddress, 'address')}
                                error={formErrors.address}
                                required
                                iconLeft="home"
                                placeholder="Enter your street address"
                            />
                            <ActualInput
                                label="Apartment/Suite (Optional)"
                                name="aptSuite"
                                value={deliveryAddress.aptSuite}
                                onChange={handleInputChange(setDeliveryAddress, 'aptSuite')}
                                placeholder="Enter apartment or suite number"
                            />
                        </CheckoutSection>
                        <CheckoutSection title="Order Notes" iconName="fileText">
                            <ActualTextArea
                                label="Special Instructions"
                                name="orderNotes"
                                value={orderNotes}
                                onChange={(e) => setOrderNotes(e.target.value)}
                                placeholder="Any special instructions for delivery?"
                                rows={4}
                            />
                        </CheckoutSection>
                    </div>
                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-2">
                        <div className="lg:sticky lg:top-24">
                            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200/80">
                                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                                    <ActualIcon name="shoppingBag" className="w-6 h-6 text-amber-500 mr-2" />
                                    Order Summary
                                </h2>
                                <div className="max-h-64 overflow-y-auto divide-y divide-gray-200 pr-2 custom-scrollbar">
                                    {cartItems.map(item => (
                                        <OrderSummaryItem
                                            key={`${item.productId}-${item._id}`}
                                            item={item}
                                            onUpdateQuantity={updateQuantity}
                                            onRemove={removeFromCart}
                                        />
                                    ))}
                                </div>
                                <div className="space-y-2 text-sm text-slate-700 pt-4 mt-4 border-t border-gray-200">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span className="font-medium">{subtotal} DA</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Shipping</span>
                                        <span className="font-medium">{shippingCost} DA</span>
                                    </div>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-slate-900 pt-3 mt-3 border-t-2 border-slate-300">
                                    <span>Total</span>
                                    <span>{total} DA</span>
                                </div>
                                <div className="mt-6 p-4 bg-amber-50 rounded-lg text-amber-900 flex items-center space-x-3">
                                    <ActualIcon name="package" className="w-8 h-8 text-amber-500 shrink-0" />
                                    <div>
                                        <p className="font-semibold">Payment on Delivery</p>
                                        <p className="text-xs">
                                            Pay with cash upon delivery of your order.
                                        </p>
                                    </div>
                                </div>
                                <ActualButton
                                    onClick={handlePlaceOrder}
                                    size="lg"
                                    className="w-full mt-6 bg-amber-500 hover:bg-amber-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                                    disabled={isPlacingOrder}
                                    isLoading={isPlacingOrder}
                                    iconLeft="lock"
                                >
                                    {isPlacingOrder ? 'Processing...' : `Confirm Order (${total} DA)`}
                                </ActualButton>
                                <p className="text-xs text-slate-500 mt-4 text-center">
                                    By placing your order, you agree to our terms and conditions.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
        </div>
    );
};

export default CheckoutPage;