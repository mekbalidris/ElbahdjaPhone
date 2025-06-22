import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import Icon from '../ui/Icon';
import Button from '../ui/Button';

// --- Color Palette (Client Inspired - Tailwind classes) ---
const brandOrange = {
    bg: 'bg-orange-600',
    text: 'text-orange-600',
    border: 'border-orange-600',
    hoverBg: 'hover:bg-orange-700',
    ring: 'focus:ring-orange-500',
    gradientFrom: 'from-orange-600',
    gradientTo: 'to-orange-700',
};

const brandPurple = {
    bg: 'bg-slate-800',
    text: 'text-slate-800',
    border: 'border-slate-800',
    hoverBg: 'hover:bg-slate-900',
    ring: 'focus:ring-slate-500',
    gradientFrom: 'from-slate-800',
    gradientTo: 'to-slate-900',
};

const ProductCard = ({ product, compact = false }) => {
    const router = useRouter();
    const { addToCart } = useCart();
    const { currentUser } = useAuth();
    const [isImageHovered, setIsImageHovered] = useState(false);
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    if (!product) return null;

    const isAvailable = product.stock > 0;

    const handleViewDetails = (e) => {
        // Prevent navigation if clicking on buttons other than view details
        if (e.target.closest('button') && !e.target.closest('button').textContent.includes('View Details')) return;
        router.push(`/products/${product._id}`);
    };

    const handleBuyNowClick = async (e) => {
        e.stopPropagation(); // Prevent card click
        if (!isAvailable) return;
        
        try {
            await addToCart({ ...product, quantity: 1 });
            router.push('/checkout');
        } catch (error) {
            console.error('Error in buy now:', error);
            toast.error('Failed to process your request. Please try again.');
        }
    };

    const handleAddToCartClick = async (e) => {
        e.stopPropagation(); // Prevent card click
        if (!isAvailable) return;
        
        try {
            await addToCart({ ...product, quantity: 1 });
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Failed to add product to cart');
        }
    };

    // Get the first image from the images array or use imageUrl as fallback
    const imageUrl = product.images?.[0] || product.imageUrl || `https://placehold.co/600x400/e2e8f0/94a3b8?text=${encodeURIComponent(product.name || "Product")}`;

    return (
        <div 
            className={`group relative bg-slate-100 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100 cursor-pointer ${compact ? 'p-1' : ''}`}
            onClick={handleViewDetails}
        >
            {/* Product Image Container */}
            <div 
                className={`relative aspect-square overflow-hidden bg-gray-100 w-full h-full ${compact ? 'h-28 sm:h-32' : ''}`}
                onMouseEnter={() => setIsImageHovered(true)}
                onMouseLeave={() => setIsImageHovered(false)}
            >
                <Image
                    src={imageUrl}
                    alt={product.name || "Product image"}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className={`object-cover object-center w-full h-full transition-all duration-500 ${
                        isImageHovered ? 'scale-110 blur-sm' : 'scale-100 blur-0'
                    } ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setIsImageLoaded(true)}
                    onError={(e) => {
                        e.target.src = 'https://placehold.co/600x400/fecaca/f87171?text=Error';
                    }}
                />
                {!isImageLoaded && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                )}
                
                {/* Deal Tag */}
                {product.offer && (
                    <span className="absolute top-2 left-2 bg-orange-600 text-white text-[0.55rem] font-bold px-2 py-0.5 rounded-full shadow-md tracking-wider animate-pulse">
                        DEAL
                    </span>
                )}
                
                {/* View Details Button */}
                <div className={`cursor-pointer absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                    isImageHovered ? 'opacity-100' : 'opacity-0'
                }`}>
                    <Button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(e);
                        }}
                        variant="primary"
                        size={compact ? "xs" : "sm"}
                        className={`bg-black backdrop-blur-sm hover:bg-white hover:text-amber-500 transform hover:scale-105 transition-all duration-300 ${compact ? 'text-xs px-2 py-1' : ''}`}
                    >
                        View Details
                    </Button>
                </div>
            </div>

            {/* Product Info */}
            <div className={`${compact ? 'p-2' : 'p-4'}`}>
                <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 ${compact ? 'text-xs' : 'text-base'}`}>{product.name}</h3>
                    {isAvailable ? (
                        <span className={`text-green-600 bg-green-50 rounded-full ml-2 whitespace-nowrap ${compact ? 'text-[10px] px-1 py-0.5' : 'text-sm px-2 py-1'}`}>In Stock</span>
                    ) : (
                        <span className={`text-orange-600 bg-orange-50 rounded-full ml-2 whitespace-nowrap ${compact ? 'text-[10px] px-1 py-0.5' : 'text-sm px-2 py-1'}`}>Out of Stock</span>
                    )}
                </div>
                <div className="flex items-center justify-between mb-2">
                    <p className={`text-amber-500 font-bold ${compact ? 'text-sm' : 'text-xl'}`}>{product.price?.toLocaleString()} DA</p>
                    {product.oldPrice && (
                        <p className={`text-orange-800 line-through ${compact ? 'text-xs' : 'text-sm'}`}>{product.oldPrice?.toLocaleString()} DA</p>
                    )}
                </div>
                <div className={`${compact ? 'p-0 space-y-1' : 'p-4 space-y-2'}`}>
                    <Button
                        onClick={handleAddToCartClick}
                        variant="outline" 
                        size={compact ? "xs" : "sm"}
                        className={`w-full border-orange-600 text-orange-400 hover:bg-orange-50 hover:text-orange-700 transition-colors ${compact ? 'text-xs px-2 py-1' : ''}`}
                        disabled={!isAvailable}
                        iconLeft="shoppingBag"
                    >
                        Add to Cart
                    </Button>
                    <Button
                        onClick={handleBuyNowClick}
                        variant="primary"
                        size={compact ? "xs" : "sm"}
                        className={`w-full bg-slate-800 hover:bg-slate-900 text-white transition-colors ${compact ? 'text-xs px-2 py-1' : ''}`}
                        disabled={!isAvailable}
                        iconLeft="zap"
                    >
                        Buy Now
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;