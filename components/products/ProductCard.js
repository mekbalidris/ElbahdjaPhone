import React from 'react';
import { useRouter } from 'next/router';
import Button from '../ui/Button';

const ProductCard = ({ product, onAddToCart }) => {
    const router = useRouter();

    // Determine availability based on stock
    const isAvailable = product.stock > 0;

    const handleAddToCartClick = (e) => {
        if (isAvailable && onAddToCart) {
            onAddToCart(product);
        }
    };

    const handleImageClick = () => {
        router.push(`/products/${product._id}`);
    };

    const handleBuyNowClick = () => {
        if (isAvailable) {
            // Add to cart first
            if (onAddToCart) {
                onAddToCart(product);
            }
            // Then redirect to checkout
            router.push('/checkout');
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300">
            <div 
                className="w-full h-48 sm:h-56 overflow-hidden relative group cursor-pointer"
                onClick={handleImageClick}
            >
                <img
                    src={product.images?.[0] || product.imageUrl || 'https://placehold.co/600x400/gray/ffffff?text=No+Image'} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => e.target.src = 'https://placehold.co/600x400/gray/ffffff?text=Image+Error'}
                />
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate" title={product.name}>{product.name}</h3>
                <p className="text-xs text-gray-500 uppercase mb-2">{product.category}</p>
                
                <div className='flex flex-row justify-between'>
                    <div className="flex items-center justify-between mb-3 mt-auto">
                        <p className="text-lg font-bold text-blue-600">
                            {typeof product.price === 'number' ? `$${product.price.toFixed(2)}` : 'N/A'}
                        </p>
                    </div>

                    {/* Availability Status */}
                    <div className="mb-4">
                        <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {isAvailable ? 'In Stock' : 'Out of Stock'}
                        </span>
                    </div>
                </div>
                
                <div className="flex flex-col space-y-2">
                    <Button 
                        onClick={handleBuyNowClick}
                        size="sm"
                        className="w-full text-xs"
                        variant="primary"
                        disabled={!isAvailable}
                    >
                        Buy Now
                    </Button>
                    <Button 
                        onClick={handleAddToCartClick} 
                        size="sm"
                        className="w-full text-xs"
                        iconLeft="shoppingBag"
                        variant="outline"
                        disabled={!isAvailable}
                    >
                        {isAvailable ? 'Add to Cart' : 'Out of Stock'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard; 