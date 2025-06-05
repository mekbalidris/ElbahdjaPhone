import React from 'react';
import { useRouter } from 'next/router';
import Button from '../ui/Button';

// --- Color Palette (Client Inspired - Tailwind classes) ---
const brandOrange = {
    bg: 'bg-amber-500',
    text: 'text-amber-500',
    border: 'border-amber-500',
    hoverBg: 'hover:bg-amber-600',
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-orange-600',
};

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
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
            <div 
                className="w-full h-48 sm:h-56 overflow-hidden relative group cursor-pointer"
                onClick={handleImageClick}
            >
                <img
                    src={product.images?.[0] || product.imageUrl || 'https://placehold.co/600x400/gray/ffffff?text=No+Image'} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => e.target.src = 'https://placehold.co/600x400/gray/ffffff?text=Image+Error'}
                />
                {product.offer && (
                    <span className={`absolute top-4 left-4 ${brandOrange.bg} text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md animate-pulse`}>DEAL!</span>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <Button
                        variant="primary"
                        size="sm"
                        className="w-full bg-black hover:bg-gray-100 hover:text-black"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleImageClick();
                        }}
                    >
                        View Details
                    </Button>
                </div>
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate hover:text-blue-600 transition-colors duration-300" title={product.name}>{product.name}</h3>
                <p className="text-xs text-gray-500 uppercase mb-2 tracking-wider">{product.category}</p>
                
                <div className='flex flex-row justify-between items-center mb-4'>
                    <div className="flex items-center">
                        <p className="text-lg font-bold text-blue-600">
                            {typeof product.price === 'number' ? `$${product.price.toFixed(2)}` : 'N/A'}
                        </p>
                    </div>

                    {/* Availability Status */}
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors duration-300 ${
                        isAvailable 
                            ? 'bg-green-100 text-green-800 group-hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 group-hover:bg-red-200'
                    }`}>
                        {isAvailable ? 'In Stock' : 'Out of Stock'}
                    </span>
                </div>
                
                <div className="flex flex-col space-y-2 mt-auto">
                    <Button 
                        onClick={handleBuyNowClick}
                        size="sm"
                        className="w-full text-xs bg-blue-600 hover:bg-blue-700 transform hover:scale-[1.02] transition-all duration-300"
                        variant="primary"
                        disabled={!isAvailable}
                    >
                        Buy Now
                    </Button>
                    <Button 
                        onClick={handleAddToCartClick} 
                        size="sm"
                        className="w-full text-xs border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transform hover:scale-[1.02] transition-all duration-300"
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