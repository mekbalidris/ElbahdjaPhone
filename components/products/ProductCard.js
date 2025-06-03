import React from 'react';
import { useRouter } from 'next/router';
import Button from '../ui/Button';
import StarRating from '../ui/StarRating';

const ProductCard = ({ product, onAddToCart }) => {
    const router = useRouter();

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-300">
            <div className="w-full h-48 sm:h-56 overflow-hidden">
                <img
                    src={product.images?.[0] || product.imageUrl || 'https://placehold.co/600x400/gray/ffffff?text=No+Image'} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => e.target.src = 'https://placehold.co/600x400/gray/ffffff?text=Image+Error'}
                />
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate" title={product.name}>{product.name}</h3>
                <p className="text-xs text-gray-500 uppercase mb-2">{product.category}</p>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-grow">{product.description}</p>
                <div className="flex items-center justify-between mb-3">
                    <p className="text-xl font-bold text-blue-600">
                        {typeof product.price === 'number' ? `$${product.price.toFixed(2)}` : 'N/A'}
                    </p>
                    {product.ratings && (
                        <div className="flex items-center text-sm text-gray-500">
                            <StarRating rating={product.ratings} />
                            <span className="ml-1">({product.reviews || 0})</span>
                        </div>
                    )}
                </div>
                <div className="mt-auto flex space-x-2">
                    <Button onClick={() => router.push(`/products/${product._id}`)} variant="outline" size="md" className="w-full">
                        View Details
                    </Button>
                    <Button onClick={() => onAddToCart(product)} size="md" className="w-full" iconLeft="shoppingBag">
                        Add to Cart
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard; 