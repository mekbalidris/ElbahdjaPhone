import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import ProductFormModal from '../components/products/ProductFormModal';
import { useAuth } from '../context/AuthContext';

const SellerDashboardPage = () => {
    const [products, setProducts] = useState([]);
    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true); // Separate loading state for products
    const { currentUser, loading: authLoading } = useAuth(); // Get user and auth loading state

    const fetchProducts = async () => {
        setIsLoadingProducts(true); // Set product loading true
        try {
            console.log('Fetching products...');
            const res = await fetch('/api/products');
            const data = await res.json();
            console.log('Fetched products:', data);
            setProducts(data);
        } catch (err) {
            toast.error('Failed to fetch products');
        } finally {
            setIsLoadingProducts(false); // Set product loading false
        }
    };

    useEffect(() => {
        // Fetch products only after auth loading is complete and user is determined
        if (!authLoading && currentUser) {
             console.log('Current User ID for filtering:', currentUser.id);
             fetchProducts();
        } else if (!authLoading && !currentUser) {
            // If auth loaded but no user, set products to empty and stop loading
            console.log('No user logged in, not fetching products for dashboard.');
            setProducts([]);
            setIsLoadingProducts(false);
        }
    }, [currentUser, authLoading]); // Fetch products when user or auth loading state changes

    // Filter products owned by the current user - this will now only run after fetchProducts is called
    // and will use the potentially empty products array or the fetched one.
    const userProducts = products.filter(p => p.sellerId === currentUser?.id);

    const handleAddProduct = async (productData) => {
        setIsLoadingProducts(true); // Set product loading true
        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...productData, sellerId: currentUser?.id, ratings: 0, reviews: 0, createdAt: new Date().toISOString() })
            });
            if (!res.ok) throw new Error('Failed to add product');
            toast.success('Product added successfully!');
            setIsAddProductModalOpen(false);
            fetchProducts(); // Refresh list
        } catch (err) {
            toast.error('Failed to add product');
        } finally {
            setIsLoadingProducts(false); // Set product loading false
        }
    };

    const handleEditProduct = async (productData) => {
        setIsLoadingProducts(true); // Set product loading true
        try {
            const res = await fetch('/api/products', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...productData, _id: editingProduct._id })
            });
            if (!res.ok) throw new Error('Failed to update product');
            toast.success('Product updated successfully!');
            setEditingProduct(null);
            fetchProducts(); // Refresh list
        } catch (err) {
            toast.error('Failed to update product');
        } finally {
            setIsLoadingProducts(false); // Set product loading false
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        setIsLoadingProducts(true);
        try {
            const res = await fetch(`/api/products?_id=${productId}`, {
                method: 'DELETE'
            });
            
            // Check if there's content to parse
            const contentType = res.headers.get('content-type');
            let data;
            if (contentType && contentType.includes('application/json')) {
                data = await res.json();
            }
            
            if (!res.ok) {
                throw new Error(data?.error || 'Failed to delete product');
            }
            
            // If we get here, the deletion was successful
            toast.success('Product deleted successfully!');
            await fetchProducts(); // Wait for the products to refresh
        } catch (err) {
            console.error('Error deleting product:', err);
            toast.error(err.message || 'Failed to delete product');
        } finally {
            setIsLoadingProducts(false);
        }
    };

    // If auth is still loading, show loading state
    if (authLoading) {
        return <div className="flex justify-center items-center h-64"><span>Loading user data...</span></div>;
    }

    // If auth is loaded but no user is logged in, show access denied message
    if (!currentUser) {
        return (
             <div className="text-center py-16">
                <Icon name="lock" className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
                <p className="text-gray-600 mb-6">Please log in to view the seller dashboard.</p>
            </div>
        );
    }

    // Render dashboard content only if user is logged in and products have been loaded
    return (
        <div className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
                    <Button
                        onClick={() => setIsAddProductModalOpen(true)}
                        variant="primary"
                        iconLeft="plus"
                    >
                        Add New Product
                    </Button>
                </div>

                {isLoadingProducts ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : userProducts.length > 0 ? (
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                            {userProducts.map(product => (
                                <li key={product._id}> {/* Use product._id as key */}
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
                                                <p className="text-lg font-semibold text-blue-600">{typeof product.price === 'number' ? `$${product.price.toFixed(2)}` : 'N/A'}</p>
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
                                                        onClick={() => handleDeleteProduct(product._id)} // Use product._id for deletion
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
                                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                <Icon name="star" className="flex-shrink-0 mr-1.5 h-5 w-5 text-yellow-400" />
                                                {product.ratings} ({product.reviews || 0} reviews)
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : ( !isLoadingProducts && (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <Icon name="package" className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No products</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by creating a new product.</p>
                        <div className="mt-6">
                            <Button
                                onClick={() => setIsAddProductModalOpen(true)}
                                variant="primary"
                                iconLeft="plus"
                            >
                                Add New Product
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modals should only render if user is logged in */}
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
                </>
            )}
        </div>
    );
};

export default SellerDashboardPage; 