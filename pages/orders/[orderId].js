import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
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
        // Wait for router to be ready
        if (!router.isReady) return;

        // Fetch order details once orderId is available
        if (orderId) {
            const fetchOrder = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    const res = await fetch(`/api/orders/${orderId}`);
                    
                    const contentType = res.headers.get('content-type');
                    let resultData = null;
                    if (contentType && contentType.includes('application/json')) {
                        resultData = await res.json();
                    }

                    if (!res.ok) {
                        const errorMessage = resultData?.error || 'Failed to fetch order details';
                        throw new Error(errorMessage);
                    }

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
        } else if (!orderId && router.isReady) {
            setError('No order ID provided.');
            setIsLoading(false);
            toast.error('No order ID found.');
        }
    }, [router.isReady, orderId]);

    if (isLoading) {
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
        <div className="bg-black min-h-screen py-8 sm:py-12 mt-[1.5rem]">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="bg-black rounded-xl shadow-xl p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between border-b border-gray-800 pb-6 mb-6">
                        <div className="text-center sm:text-left mb-4 sm:mb-0">
                            <h1 className="text-2xl sm:text-3xl font-bold text-accent mb-1">Thank You for Your Order!</h1>
                            <p className="text-white">Your order has been placed successfully.</p>
                        </div>
                        <div className="flex items-center">
                             <Icon name="package" className="w-8 h-8 text-accent mr-2" />
                             <p className="text-xl font-semibold text-accent">Order #{order._id ? order._id.slice(-6).toUpperCase() : 'N/A'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-accent mb-3 flex items-center"><Icon name="user" className="w-5 h-5 mr-2 text-accent" /> Contact Information</h2>
                            <p className="text-white"><span className="font-medium text-accent">Name:</span> {order.contactInfo?.fullName || 'N/A'}</p>
                            <p className="text-white"><span className="font-medium text-accent">Email:</span> {order.contactInfo?.email || 'N/A'}</p>
                            <p className="text-white"><span className="font-medium text-accent">Phone:</span> {order.contactInfo?.phone || 'N/A'}</p>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-accent mb-3 flex items-center"><Icon name="mapPin" className="w-5 h-5 mr-2 text-accent" /> Delivery Address</h2>
                            <p className="text-white">{order.deliveryAddress?.address || 'N/A'}</p>
                            {order.deliveryAddress?.aptSuite && <p className="text-white">Apt/Suite: {order.deliveryAddress.aptSuite}</p>}
                            <p className="text-white">{order.deliveryAddress?.city || 'N/A'}, {order.deliveryAddress?.wilaya || 'N/A'}</p>
                            <p className="text-white">Payment Method: <span className="text-accent">{order.paymentMethod || 'N/A'}</span></p>
                        </div>
                    </div>
                    
                    {order.orderNotes && (
                        <div className="mb-6 p-4 bg-black rounded-lg border border-gray-800">
                            <h2 className="text-lg font-semibold text-accent mb-2 flex items-center"><Icon name="edit" className="w-5 h-5 mr-2 text-accent" /> Order Notes</h2>
                            <p className="text-white">{order.orderNotes}</p>
                        </div>
                    )}

                    <div className="mb-6">
                         <h2 className="text-lg font-semibold text-accent mb-3 flex items-center"><Icon name="shoppingBag" className="w-5 h-5 mr-2 text-accent" /> Items Ordered</h2>
                         <ul className="divide-y divide-gray-800 border-t border-b border-gray-800">
                             {order.items?.map((item, index) => (
                                 <li key={index} className="flex py-4">
                                     <div className="relative h-20 w-20 mr-4">
                                         <Image src={item.imageUrl || '/placeholder.png'} alt={item.name} fill className="object-cover rounded-lg" />
                                     </div>
                                     <div className="flex-1 flex flex-col justify-center">
                                         <p className="text-sm font-medium text-white">{item.name || 'Unnamed Item'}</p>
                                         {item.attributes && <p className="text-xs text-accent">{item.attributes}</p>}
                                         <p className="text-xs text-white mt-0.5">Qty: {item.quantity || 0}</p>
                                     </div>
                                     <p className="text-sm font-semibold text-accent ml-4">DA{((item.price || 0) * (item.quantity || 0)).toFixed(2)}</p>
                                 </li>
                             )) || <p className="text-accent py-4">No items found</p>}
                         </ul>
                    </div>

                     <div className="space-y-1.5 text-sm text-white pt-4 border-t border-gray-800">
                         <div className="flex justify-between items-center">
                             <span>Subtotal</span>
                             <span className="font-medium">DA{order.totals?.subtotal?.toFixed(2) || '0.00'}</span>
                         </div>
                         {order.totals?.discount > 0 && (
                             <div className="flex justify-between text-green-400">
                                 <span>Discount</span>
                                 <span>-DA{order.totals?.discount?.toFixed(2) || '0.00'}</span>
                             </div>
                         )}
                         <div className="flex justify-between">
                             <span>Shipping</span>
                             <span className="font-medium">DA{order.totals?.shippingCost?.toFixed(2) || '0.00'}</span>
                         </div>
                          {order.totals?.taxes > 0 && (
                             <div className="flex justify-between">
                                 <span>Taxes</span>
                                 <span>DA{order.totals?.taxes?.toFixed(2) || '0.00'}</span>
                             </div>
                          )}
                         <div className="flex justify-between text-base font-bold text-accent pt-3 mt-3 border-t-2 border-gray-800">
                             <span>Total</span>
                             <span className="font-medium">DA{order.totals?.total?.toFixed(2) || '0.00'}</span>
                         </div>
                     </div>

                     <div className="mt-8 text-center">
                         <Button onClick={() => router.push('/products')} variant="primary" size="lg">
                             Continue Shopping
                         </Button>
                     </div>
                </div>
                 {/* Small text at the bottom */}
                 <p className="text-xs text-accent mt-6 text-center">
                     Order placed on {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}. Order status: <span className="text-white">{order.status || 'N/A'}</span>.
                 </p>
            </div>
        </div>
    );
};

export default OrderDetailPage; 