import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { toast } from 'react-hot-toast';

// --- Color Palette (Client Inspired - Tailwind classes) ---
const brandOrange = {
    bg: 'bg-amber-500',
    text: 'text-amber-500',
    border: 'border-amber-500',
    hoverBg: 'hover:bg-amber-600',
    ring: 'focus:ring-amber-500',
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-orange-600',
};

const brandPurple = {
    bg: 'bg-purple-600',
    text: 'text-purple-600',
    border: 'border-purple-600',
    hoverBg: 'hover:bg-purple-700',
    ring: 'focus:ring-purple-500',
    gradientFrom: 'from-purple-600',
    gradientTo: 'to-indigo-700',
};

const ProductCard = ({ product, onAddToCart, onBuyNow }) => {
    const router = useRouter();
    const [isHovered, setIsHovered] = useState(false);

    if (!product) return null;

    const isAvailable = product.stock > 0;

    const handleImageClick = () => {
        router.push(`/products/${product._id}`);
    };

    const handleBuyNowClick = async () => {
        if (isAvailable) {
            // Use onBuyNow if provided, otherwise fallback to onAddToCart
            if (onBuyNow) {
                await onBuyNow(product);
            } else if (onAddToCart) {
                await onAddToCart(product);
            }
            // Redirect to checkout after adding to cart
            router.push('/checkout');
        }
    };

    const handleAddToCartClick = async () => {
        if (isAvailable && onAddToCart) {
            await onAddToCart(product);
        }
    };

    return (
        <div
            className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col transition-all duration-300 ease-out group relative border border-gray-200/80 hover:border-transparent hover:shadow-xl hover:shadow-purple-500/10 transform hover:-translate-y-1"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className="w-full h-52 sm:h-60 overflow-hidden cursor-pointer relative group"
                onClick={handleImageClick}
            >
                <img
                    src={product.images?.[0] || product.imageUrl || `https://placehold.co/600x400/e2e8f0/94a3b8?text=${encodeURIComponent(product.name || "Product")}`}
                    alt={product.name || "Product image"}
                    className={`w-full h-full object-cover transition-transform duration-500 ease-in-out ${isHovered ? 'scale-105' : 'scale-100'}`}
                    onError={(e) => e.target.src = 'https://placehold.co/600x400/fecaca/f87171?text=Error'}
                />
                {product.offer && (<span className={`absolute top-3 left-3 ${brandOrange.bg} text-white text-[0.65rem] font-bold px-2.5 py-1 rounded-full shadow-md tracking-wider`}>DEAL</span>)}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
                <h3 className={`text-md font-semibold text-slate-800 mb-1 truncate transition-colors duration-300 group-hover:${brandPurple.text}`} title={product.name}>{product.name || "Unnamed Product"}</h3>
                <p className="text-xs text-slate-500 uppercase mb-2 tracking-wider">{product.category}</p>
                <div className='flex flex-row justify-between items-center mb-3 mt-auto pt-2'>
                    <p className={`text-xl font-bold ${brandPurple.text}`}>{typeof product.price === 'number' ? `$${product.price.toFixed(2)}` : 'N/A'}</p>
                    <span className={`px-2.5 py-0.5 rounded-full text-[0.7rem] font-medium ${isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{isAvailable ? 'In Stock' : 'Out of Stock'}</span>
                </div>
                <div className="space-y-2 pt-3 border-t border-gray-100">
                    <Button onClick={handleBuyNowClick} variant="primary" size="sm" className={`w-full !py-2 ${brandOrange.bg} hover:${brandOrange.hoverBg}`} disabled={!isAvailable}>Buy Now</Button>
                    <Button onClick={handleAddToCartClick} variant="outline" size="sm" className={`w-full !py-2 !border-purple-500 !text-purple-600 hover:!bg-purple-500 hover:!text-white group`} iconLeft="cart" disabled={!isAvailable}>{isAvailable ? 'Add to Cart' : 'Out of Stock'}</Button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;