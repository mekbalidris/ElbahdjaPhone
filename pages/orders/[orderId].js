import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import Icon from '../../components/ui/Icon';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

const OrderDetailPage = () => {
    const router = useRouter();
    const { orderId } = router.query;
    const { currentUser, isLoading: authLoading } = useAuth();
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Wait for router to be ready and user authentication to load
        if (!router.isReady || authLoading) return;

        // If no user is logged in, redirect to login
        if (!currentUser) {
            toast.error('Please log in to view order details.');
            router.push('/auth');
            return;
        }

        // Fetch order details once orderId is available and user is logged in
        if (orderId && currentUser) {
            const fetchOrder = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    // Call the correct API endpoint for fetching a single order by ID
                    const res = await fetch(`/api/orders/${orderId}`, {
                         headers: { // Send user ID for authorization check on the backend
                            'user-id': currentUser.id
                         }
                    });
                    
                    // Check for JSON content type before parsing
                    const contentType = res.headers.get('content-type');
                    let resultData = null;
                    if (contentType && contentType.includes('application/json')) {
                        resultData = await res.json();
                    }

                    if (!res.ok) {
                         // Use error message from API response if available
                        const errorMessage = resultData?.error || 'Failed to fetch order details';
                        throw new Error(errorMessage);
                    }

                    // Set the order data
                    setOrder(resultData);

                } catch (err) {
                    console.error('Error fetching order:', err);
                    setError(err.message || 'Failed to load order details.');
                    toast.error(err.message || 'Failed to load order details.');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchOrder();
        } else if (!orderId && router.isReady) { // If router is ready but no orderId in query
             setError('No order ID provided.');
             setIsLoading(false);
             toast.error('No order ID found.');
             // Optionally redirect to a different page, e.g., orders list or home
             // router.push('/orders');
        }
    }, [router.isReady, orderId, currentUser, authLoading]); // Re-run effect if these dependencies change

    if (authLoading || isLoading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center text-red-600">
                 <Icon name="xCircle" className="w-16 h-16 mb-4" />
                <h1 className="text-2xl font-bold mb-2">Error Loading Order</h1>
                <p className="text-gray-700 mb-6">{error}</p>
                <Button onClick={() => router.push('/')}>Go Home</Button>
            </div>
        );
    }

     if (!order) { // Case where isLoading is false but order is null (e.g., API returned no data without error)
         return (
             <div className="min-h-[80vh] flex flex-col items-center justify-center text-gray-700">
                 <Icon name="package" className="w-16 h-16 mb-4" />
                 <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
                 <p className="mb-6">The order details could not be loaded.</p>
                 <Button onClick={() => router.push('/')}>Go Home</Button>
             </div>
         );
     }

    return (
        <div className="bg-gray-100 min-h-screen py-8 sm:py-12">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between border-b pb-6 mb-6">
                        <div className="text-center sm:text-left mb-4 sm:mb-0">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">Thank You for Your Order!</h1>
                            <p className="text-gray-600">Your order has been placed successfully.</p>
                        </div>
                        <div className="flex items-center">
                             <Icon name="package" className="w-8 h-8 text-blue-500 mr-2" />
                             <p className="text-xl font-semibold text-blue-600">Order #{order._id ? order._id.slice(-6).toUpperCase() : 'N/A'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center"><Icon name="user" className="w-5 h-5 mr-2 text-gray-500" /> Contact Information</h2>
                            <p className="text-gray-700"><span className="font-medium">Name:</span> {order.contactInfo?.fullName || 'N/A'}</p>
                            <p className="text-gray-700"><span className="font-medium">Email:</span> {order.contactInfo?.email || 'N/A'}</p>
                            <p className="text-gray-700"><span className="font-medium">Phone:</span> {order.contactInfo?.phone || 'N/A'}</p>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center"><Icon name="mapPin" className="w-5 h-5 mr-2 text-gray-500" /> Delivery Address</h2>
                            <p className="text-gray-700">{order.deliveryAddress?.address || 'N/A'}</p>
                            {order.deliveryAddress?.aptSuite && <p className="text-gray-700">Apt/Suite: {order.deliveryAddress.aptSuite}</p>}
                            <p className="text-gray-700">{order.deliveryAddress?.city || 'N/A'}, {order.deliveryAddress?.wilaya || 'N/A'}</p>
                            <p className="text-gray-700">Payment Method: {order.paymentMethod || 'N/A'}</p>
                        </div>
                    </div>
                    
                    {order.orderNotes && (
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center"><Icon name="edit" className="w-5 h-5 mr-2 text-gray-500" /> Order Notes</h2>
                            <p className="text-gray-700">{order.orderNotes}</p>
                        </div>
                    )}

                    <div className="mb-6">
                         <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center"><Icon name="shoppingBag" className="w-5 h-5 mr-2 text-gray-500" /> Items Ordered</h2>
                         <ul className="divide-y divide-gray-200 border-t border-b border-gray-200">
                             {order.items?.map((item, index) => (
                                 <li key={index} className="flex py-4">
                                     <img src={item.imageUrl || '/placeholder.png'} alt={item.name} className="h-20 w-20 object-cover rounded-lg mr-4" />
                                     <div className="flex-1 flex flex-col justify-center">
                                         <p className="text-sm font-medium text-gray-900">{item.name || 'Unnamed Item'}</p>
                                         {item.attributes && <p className="text-xs text-gray-500">{item.attributes}</p>}
                                         <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity || 0}</p>
                                     </div>
                                     <p className="text-sm font-semibold text-gray-900 ml-4">${((item.price || 0) * (item.quantity || 0)).toFixed(2)}</p>
                                 </li>
                             )) || <p className="text-gray-500 py-4">No items found</p>}
                         </ul>
                    </div>

                     <div className="space-y-1.5 text-sm text-gray-700 pt-4 border-t border-gray-200">
                         <div className="flex justify-between items-center">
                             <span>Subtotal</span>
                             <span className="font-medium">${order.totals?.subtotal?.toFixed(2) || '0.00'}</span>
                         </div>
                         {order.totals?.discount > 0 && (
                             <div className="flex justify-between text-green-600">
                                 <span>Discount</span>
                                 <span>-${order.totals?.discount?.toFixed(2) || '0.00'}</span>
                             </div>
                         )}
                         <div className="flex justify-between">
                             <span>Shipping</span>
                             <span className="font-medium">${order.totals?.shippingCost?.toFixed(2) || '0.00'}</span>
                         </div>
                          {order.totals?.taxes > 0 && (
                             <div className="flex justify-between">
                                 <span>Taxes</span>
                                 <span>${order.totals?.taxes?.toFixed(2) || '0.00'}</span>
                             </div>
                          )}
                         <div className="flex justify-between text-base font-bold text-gray-900 pt-3 mt-3 border-t-2 border-gray-300">
                             <span>Total</span>
                             <span className="font-medium">${order.totals?.total?.toFixed(2) || '0.00'}</span>
                         </div>
                     </div>

                     <div className="mt-8 text-center">
                         <Button onClick={() => router.push('/products')} variant="primary" size="lg">
                             Continue Shopping
                         </Button>
                     </div>
                </div>
                 {/* Small text at the bottom */}
                 <p className="text-xs text-gray-500 mt-6 text-center">
                     Order placed on {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}. Order status: {order.status || 'N/A'}.
                 </p>
            </div>
        </div>
    );
};

export default OrderDetailPage; 