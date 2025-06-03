import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import StarRating from '../../components/ui/StarRating';
import { useRouter } from 'next/router';

const ProductDetailPage = ({ handleAddToCart }) => {
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const { productId } = router.query; // Get productId from router query

    useEffect(() => {
        if (!productId) return; // Don't fetch if productId is not available yet

        setIsLoading(true);
        // Fetch product by _id
        fetch(`/api/products?_id=${productId}`)
            .then(res => {
                if (!res.ok) {
                     // Handle case where product is not found (e.g., 404)
                    if (res.status === 404) {
                        return null; // Indicate product not found
                    }
                    throw new Error('Failed to fetch product');
                }
                return res.json();
            })
            .then(data => {
                setProduct(data); // API should return a single product object
                setIsLoading(false);
            })
            .catch((err) => {
                console.error('Product detail fetch error:', err);
                setIsLoading(false);
                toast.error('Failed to load product details.');
            });
    }, [productId]); // Refetch when productId changes

    if (isLoading || !productId) {
        return <div className="flex justify-center items-center h-64"><span>Loading...</span></div>;
    }

    if (!product) {
        return (
            <div className="text-center py-16">
                <Icon name="xCircle" className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h1>
                <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
                <Button onClick={() => router.push('/products')} variant="primary">
                    Back to Products
                </Button>
            </div>
        );
    }

    const handleAddToCartClick = () => {
        if (handleAddToCart && product) {
            handleAddToCart(product);
        } else {
            toast.error('Could not add product to cart.');
        }
    };

    const mainImageUrl = product.images?.[0] || product.imageUrl;
    const hasGalleryImages = product.images && product.images.filter(img => !!img).length > 1; // Check for valid images

    return (
        <div className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
                    {/* Product Image */}
                    <div className="lg:max-w-lg lg:self-end">
                        <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden">
                            {mainImageUrl ? (
                                <img
                                    src={mainImageUrl}
                                    alt={product.name}
                                    className="w-full h-full object-center object-cover"
                                    onError={(e) => e.target.src = 'https://placehold.co/600x400/gray/ffffff?text=Image+Error'}
                                />
                            ) : (
                                <img
                                    src='https://placehold.co/600x400/gray/ffffff?text=No+Image'
                                    alt="No Image Available"
                                    className="w-full h-full object-center object-cover"
                                />
                            )}
                        </div>
                        {/* Image Gallery */}
                        {hasGalleryImages && (
                            <div className="mt-4 grid grid-cols-4 gap-2">
                                {product.images.filter(img => !!img).map((image, index) => ( // Filter out null/undefined images
                                    <div key={index} className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden">
                                        <img
                                            src={image}
                                            alt={`${product.name} - Image ${index + 1}`}
                                            className="w-full h-full object-center object-cover cursor-pointer hover:opacity-75"
                                            onClick={() => {
                                                // Swap main image with clicked thumbnail - need to handle swapping with filtered array
                                                const currentImages = product.images.filter(img => !!img);
                                                const clickedImage = currentImages[index];
                                                const remainingImages = currentImages.filter((_, i) => i !== index);
                                                setProduct({ ...product, images: [clickedImage, ...remainingImages] });
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
                        <div className="flex items-center justify-between">
                            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{product.name}</h1>
                            <p className="text-3xl font-bold text-blue-600">{typeof product.price === 'number' ? `$${product.price.toFixed(2)}` : 'N/A'}</p>
                        </div>

                        <div className="mt-3">
                            <h2 className="sr-only">Product information</h2>
                            <p className="text-sm text-gray-500 uppercase">{product.category}</p>
                        </div>

                        <div className="mt-6">
                            <div className="flex items-center">
                                <StarRating rating={typeof product.ratings === 'number' ? product.ratings : 0} /> {/* Ensure rating is a number */}
                                <p className="ml-2 text-sm text-gray-500">
                                    ({product.reviews || 0} reviews)
                                </p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h3 className="sr-only">Description</h3>
                            <div className="text-base text-gray-700 space-y-6">
                                <p>{product.description}</p>
                            </div>
                        </div>

                        <div className="mt-8">
                            <div className="flex items-center">
                                <div className="flex items-center">
                                    <Icon name="package" className="h-5 w-5 text-gray-400" />
                                    <p className="ml-2 text-sm text-gray-500">
                                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 flex">
                                <Button
                                    onClick={handleAddToCartClick}
                                    variant="primary"
                                    size="lg"
                                    className="w-full"
                                    disabled={product.stock === 0}
                                >
                                    Add to Cart
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage; 