import React, { useState } from 'react';
import Image from 'next/image';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const OrderDetailsModal = ({ isOpen, onClose, order, onStatusUpdate, onDelete }) => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    
    if (!order) return null;

    const handleStatusUpdate = async (newStatus) => {
        if (!order) return;

        try {
            setLoading(true);
            const response = await fetch(`/api/orders/${order._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'user-id': currentUser?.id
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                throw new Error('Failed to update order status');
            }

            // Update the order status locally
            const updatedOrder = { ...order, status: newStatus };
            onStatusUpdate(updatedOrder);
            onClose();
        } catch (error) {
            console.error('Error updating order status:', error);
            toast.error('Failed to update order status');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteOrder = async () => {
        if (!confirm('Are you sure you want to delete this order?')) return;

        try {
            setLoading(true);
            const response = await fetch(`/api/orders/${order._id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'user-id': currentUser?.id
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete order');
            }

            // Add a small delay to ensure the deletion is complete
            await new Promise(resolve => setTimeout(resolve, 500));

            toast.success('Order deleted successfully');
            onClose();
            onDelete(order._id);
        } catch (error) {
            console.error('Error deleting order:', error);
            toast.error('Failed to delete order');
        } finally {
            setLoading(false);
        }
    };

    // Helper function to safely format currency
    const formatCurrency = (amount) => {
        if (typeof amount !== 'number') return '0.00 DA';
        return `${amount.toFixed(2)} DA`;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Order #${order._id.slice(-6)}`}>
            <div className="space-y-6">
                {/* Order Status and Actions */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Order Status</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              order.status === 'returned' ? 'bg-purple-100 text-purple-800' :
                              order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'}`}>
                            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'}
                        </span>
                    </div>
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate('completed')}
                            disabled={order.status === 'completed'}
                        >
                            Mark as Completed
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate('processing')}
                            disabled={order.status === 'processing'}
                        >
                            Mark as Processing
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate('returned')}
                            disabled={order.status === 'returned'}
                            className="text-purple-600 hover:text-purple-700"
                        >
                            Mark as Returned
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate('cancelled')}
                            disabled={order.status === 'cancelled'}
                            className="text-red-600 hover:text-red-700"
                        >
                            Cancel Order
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDeleteOrder}
                            className="text-red-600 hover:text-red-700"
                        >
                            <Icon name="trash" className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Contact Information */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div className="flex items-center">
                            <Icon name="user" className="w-5 h-5 text-gray-400 mr-2" />
                            <span className="text-gray-700">{order.contactInfo?.fullName || 'N/A'}</span>
                        </div>
                        <div className="flex items-center">
                            <Icon name="mail" className="w-5 h-5 text-gray-400 mr-2" />
                            <a href={`mailto:${order.contactInfo?.email || ''}`} className="text-blue-600 hover:text-blue-700">
                                {order.contactInfo?.email || 'N/A'}
                            </a>
                        </div>
                        <div className="flex items-center">
                            <Icon name="phone" className="w-5 h-5 text-gray-400 mr-2" />
                            <a href={`tel:${order.contactInfo?.phone || ''}`} className="text-blue-600 hover:text-blue-700">
                                {order.contactInfo?.phone || 'N/A'}
                            </a>
                        </div>
                    </div>
                </div>

                {/* Delivery Address */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Delivery Address</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700">{order.deliveryAddress?.address || 'N/A'}</p>
                        {order.deliveryAddress?.aptSuite && <p className="text-gray-700">Apt/Suite: {order.deliveryAddress.aptSuite}</p>}
                        <p className="text-gray-700">
                            {order.deliveryAddress?.city || 'N/A'}, {order.deliveryAddress?.wilaya || 'N/A'}
                        </p>
                    </div>
                </div>

                {/* Order Items */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Order Items</h3>
                    <div className="space-y-3">
                        {order.items?.map((item, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center">
                                    <div className="relative w-12 h-12">
                                        <Image
                                            src={item.imageUrl || '/placeholder.png'}
                                            alt={item.name}
                                            fill
                                            className="rounded-md object-cover"
                                        />
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="text-sm font-medium text-gray-900">{item.name || 'Unnamed Item'}</h4>
                                        <p className="text-sm text-gray-500">Quantity: {item.quantity || 0}</p>
                                    </div>
                                </div>
                                <p className="text-sm font-medium text-gray-900">
                                    {formatCurrency((item.price || 0) * (item.quantity || 0))}
                                </p>
                            </div>
                        )) || <p className="text-gray-500">No items found</p>}
                    </div>
                </div>

                {/* Order Totals */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Order Summary</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="text-gray-900">{formatCurrency(order.totals?.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Shipping</span>
                            <span className="text-gray-900">{formatCurrency(order.totals?.shippingCost)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tax</span>
                            <span className="text-gray-900">{formatCurrency(order.totals?.taxes)}</span>
                        </div>
                        <div className="border-t border-gray-200 pt-2 mt-2">
                            <div className="flex justify-between font-medium">
                                <span className="text-gray-900">Total</span>
                                <span className="text-blue-600">{formatCurrency(order.totals?.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Notes */}
                {order.orderNotes && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Order Notes</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-gray-700">{order.orderNotes}</p>
                        </div>
                    </div>
                )}

                {/* Order Date */}
                <div className="text-sm text-gray-500">
                    <p>Order placed: {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</p>
                    {order.updatedAt && order.updatedAt !== order.createdAt && (
                        <p>Last updated: {new Date(order.updatedAt).toLocaleString()}</p>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default OrderDetailsModal; 