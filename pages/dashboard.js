import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import ProductFormModal from '../components/products/ProductFormModal';
import OrderDetailsModal from '../components/orders/OrderDetailsModal';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

const SellerDashboardPage = () => {
    const [products, setProducts] = useState([]);
    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [statistics, setStatistics] = useState(null);
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const { currentUser, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');

    // Check for seller role and redirect if not authorized
    useEffect(() => {
        if (!authLoading) {
            if (!currentUser) {
                toast.error('Please log in to access the dashboard');
                router.replace('/auth');
            } else if (currentUser.role !== 'seller') {
                toast.error('Access denied. Only sellers can access the dashboard');
                router.replace('/');
            }
        }
    }, [currentUser, authLoading, router]);

    const fetchStatistics = async () => {
        try {
            const res = await fetch('/api/statistics');
            if (!res.ok) throw new Error('Failed to fetch statistics');
            const data = await res.json();
            setStatistics(data);
        } catch (err) {
            console.error('Error fetching statistics:', err);
            toast.error('Failed to load statistics');
        } finally {
            setIsLoadingStats(false);
        }
    };

    const fetchProducts = async () => {
        setIsLoadingProducts(true);
        try {
            const res = await fetch('/api/products');
            if (!res.ok) throw new Error('Failed to fetch products');
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            console.error('Error fetching products:', err);
            toast.error('Failed to fetch products');
        } finally {
            setIsLoadingProducts(false);
        }
    };

    // Fetch data when user is confirmed as seller
    useEffect(() => {
        if (!authLoading && currentUser?.role === 'seller') {
            Promise.all([fetchStatistics(), fetchProducts()])
                .catch(err => {
                    console.error('Error fetching dashboard data:', err);
                });
        }
    }, [currentUser, authLoading]);

    // Filter products owned by the current user and apply search filter
    const filteredUserProducts = products.filter(p => 
        p.sellerId === currentUser?.id &&
        (p.name?.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
         p.description?.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
         p.category?.toLowerCase().includes(productSearchTerm.toLowerCase())) &&
        (!selectedBrand || p.brand === selectedBrand)
    );

    // Get unique brands from products
    const availableBrands = useMemo(() => {
        const brands = new Set(products
            .filter(p => p.sellerId === currentUser?.id)
            .map(p => p.brand)
            .filter(Boolean));
        return Array.from(brands).map(brand => ({ value: brand, label: brand.charAt(0).toUpperCase() + brand.slice(1) }));
    }, [products, currentUser?.id]);

    const handleAddProduct = async (productData) => {
        setIsLoadingProducts(true);
        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    ...productData, 
                    sellerId: currentUser?.id, 
                    ratings: 0, 
                    reviews: 0, 
                    createdAt: new Date().toISOString() 
                })
            });
            if (!res.ok) throw new Error('Failed to add product');
            toast.success('Product added successfully!');
            setIsAddProductModalOpen(false);
            fetchProducts();
        } catch (err) {
            console.error('Error adding product:', err);
            toast.error('Failed to add product');
        } finally {
            setIsLoadingProducts(false);
        }
    };

    const handleEditProduct = async (productData) => {
        setIsLoadingProducts(true);
        try {
            const res = await fetch('/api/products', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...productData, _id: editingProduct._id })
            });
            if (!res.ok) throw new Error('Failed to update product');
            toast.success('Product updated successfully!');
            setEditingProduct(null);
            fetchProducts();
        } catch (err) {
            console.error('Error updating product:', err);
            toast.error('Failed to update product');
        } finally {
            setIsLoadingProducts(false);
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        setIsLoadingProducts(true);
        try {
            const res = await fetch(`/api/products?_id=${productId}`, {
                method: 'DELETE'
            });
            
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data?.error || 'Failed to delete product');
            }
            
            // Add a small delay to ensure the deletion is processed
            await new Promise(resolve => setTimeout(resolve, 500));
            
            toast.success('Product deleted successfully!');
            await fetchProducts();
        } catch (err) {
            console.error('Error deleting product:', err);
            // Only show error if it's not a "not found" error after successful deletion
            if (!err.message?.includes('not found')) {
                toast.error(err.message || 'Failed to delete product');
            } else {
                toast.success('Product deleted successfully!');
                await fetchProducts();
            }
        } finally {
            setIsLoadingProducts(false);
        }
    };

    const handleOrderStatusUpdate = (newStatus) => {
        setStatistics(prev => ({
            ...prev,
            recentOrders: prev.recentOrders.map(order => 
                order._id === selectedOrder._id 
                    ? { ...order, status: newStatus }
                    : order
            )
        }));
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
        toast.success(`Order status updated to ${newStatus}`);
    };

    const handleOrderDelete = (orderId) => {
        setStatistics(prev => ({
            ...prev,
            recentOrders: prev.recentOrders.filter(order => order._id !== orderId)
        }));
        toast.success('Order deleted successfully');
    };

    // Show loading state while checking auth
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Show error state if not authorized
    if (!currentUser || currentUser.role !== 'seller') {
        return null; // The useEffect will handle the redirect
    }

    return (
        <div className="py-8 mt-[2.5rem]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Statistics Section */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
                    {isLoadingStats ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : statistics && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Total Orders */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                                        <Icon name="package" className="w-6 h-6" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Total Orders</p>
                                        <p className="text-2xl font-semibold text-gray-900">{statistics.totalOrders}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Total Revenue */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-full bg-green-100 text-green-600">
                                        <Icon name="dollar" className="w-6 h-6" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                        <p className="text-2xl font-semibold text-gray-900">{statistics.totalRevenue} DA</p>
                                    </div>
                                </div>
                            </div>

                            {/* Orders by Status */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                                        <Icon name="list" className="w-6 h-6" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Orders by Status</p>
                                        <div className="mt-2">
                                            {statistics.ordersByStatus.map(status => (
                                                <div key={status._id} className="flex justify-between text-sm">
                                                    <span className="text-gray-600">{status._id || 'Pending'}</span>
                                                    <span className="font-medium">{status.count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Top Products */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                                        <Icon name="star" className="w-6 h-6" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Top Products</p>
                                        <div className="mt-2">
                                            {statistics.topProducts.map(product => (
                                                <div key={product._id} className="flex justify-between text-sm">
                                                    <span className="text-gray-600 truncate max-w-[150px]">{product.productName}</span>
                                                    <span className="font-medium">{product.totalSold} sold</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Recent Orders */}
                {statistics?.recentOrders && statistics.recentOrders.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Orders</h2>
                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            <ul className="divide-y divide-gray-200">
                                {statistics.recentOrders.map(order => (
                                    <li 
                                        key={order._id} 
                                        className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={() => setSelectedOrder(order)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="ml-3">
                                                    <p className="text-sm font-medium text-gray-900">{order.items?.[0]?.name || 'Unnamed Order'} #{order._id?.slice(-6).toUpperCase() || 'N/A'}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                      order.status === 'returned' ? 'bg-purple-100 text-purple-800' :
                                                      'bg-gray-100 text-gray-800'}`}>
                                                    {order.status || 'N/A'}
                                                </span>
                                                <span className="ml-4 text-sm font-medium text-gray-900">
                                                    {order.totals?.total || '0.00'} DA
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Products Section */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h2 className="text-2xl font-bold text-gray-900">Your Products</h2>
                        <div className="flex flex-col sm:flex-row items-stretch gap-4 w-full sm:w-auto">
                            <Input
                                type="text"
                                placeholder="Search your products..."
                                value={productSearchTerm}
                                onChange={(e) => setProductSearchTerm(e.target.value)}
                                className="w-full sm:w-64 !h-[42px]"
                            />
                            <Select
                                options={[
                                    { value: '', label: 'All Brands' },
                                    ...availableBrands
                                ]}
                                value={selectedBrand}
                                onChange={(e) => setSelectedBrand(e.target.value)}
                                className="w-full sm:w-48 !h-[42px]"
                            />
                            <Button
                                onClick={() => setIsAddProductModalOpen(true)}
                                variant="primary"
                                iconLeft="plus"
                                className="whitespace-nowrap min-w-[160px] !h-[42px]"
                            >
                                Add New Product
                            </Button>
                        </div>
                    </div>
                </div>

                {isLoadingProducts ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : filteredUserProducts.length > 0 ? (
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                            {filteredUserProducts.map(product => (
                                <li key={product._id}>
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <img
                                                    src={product.images?.[0] || product.imageUrl || 'https://placehold.co/80x80/gray/ffffff?text=N/A'}
                                                    alt={product.name}
                                                    className="h-12 w-12 rounded-md object-cover"
                                                />
                                                <div className="ml-4">
                                                    <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                                                    <p className="text-sm text-gray-500">{product.category}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <p className="text-lg font-semibold text-blue-600">
                                                    {typeof product.price === 'number' ? product.price : 'N/A'} DA
                                                </p>
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setEditingProduct(product)}
                                                        iconLeft="edit"
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteProduct(product._id)}
                                                        className="text-red-600 hover:text-red-700"
                                                        iconLeft="trash"
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-2 sm:flex sm:justify-between">
                                            <div className="sm:flex">
                                                <p className="flex items-center text-sm text-gray-500">
                                                    <Icon name="package" className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                                    {product.stock} in stock
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <Icon name="package" className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">{productSearchTerm ? 'No products found matching your search' : 'No products yet'}</h3>
                        {productSearchTerm ? (
                            <p className="mt-1 text-sm text-gray-500">Try a different search term.</p>
                        ) : (
                            <p className="mt-1 text-sm text-gray-500">Get started by creating a new product.</p>
                        )}
                        <div className="mt-6">
                            <Button
                                onClick={() => setIsAddProductModalOpen(true)}
                                variant="primary"
                                iconLeft="plus"
                                iconSize="w-7 h-7"
                            >
                                Add New Product
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {currentUser && (
                <>
                    <ProductFormModal
                        isOpen={isAddProductModalOpen}
                        onClose={() => setIsAddProductModalOpen(false)}
                        onSubmit={handleAddProduct}
                    />

                    <ProductFormModal
                        isOpen={!!editingProduct}
                        onClose={() => setEditingProduct(null)}
                        onSubmit={handleEditProduct}
                        product={editingProduct}
                    />

                    <OrderDetailsModal
                        isOpen={!!selectedOrder}
                        onClose={() => setSelectedOrder(null)}
                        order={selectedOrder}
                        onStatusUpdate={handleOrderStatusUpdate}
                        onDelete={handleOrderDelete}
                    />
                </>
            )}
        </div>
    );
};

export default SellerDashboardPage; 