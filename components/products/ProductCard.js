import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { toast } from 'react-hot-toast';
import Button from '../ui/Button';

const FADE_DURATION = 300; // ms

const clothingSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const shoeSizes = ['39', '40', '41', '42', '43', '44', '45', '46'];

const ProductCard = ({ product }) => {
    const router = useRouter();
    const { addToCart } = useCart();
    const { toggleFavorite, isFavorite } = useFavorites();
    const [hovered, setHovered] = useState(false);
    const [imageIndex, setImageIndex] = useState(0);
    const [isFading, setIsFading] = useState(false);
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const intervalRef = useRef(null);
    const fadeTimeoutRef = useRef(null);
    const images = product.images && product.images.length > 0 ? product.images : [
        `https://placehold.co/600x400/e2e8f0/94a3b8?text=${encodeURIComponent(product.name || "Product")}`
    ];

    // Helper to change image with fade
    const changeImageWithFade = (newIdx) => {
        setIsFading(true);
        fadeTimeoutRef.current = setTimeout(() => {
            setImageIndex(newIdx);
            setIsFading(false);
        }, FADE_DURATION);
    };

    useEffect(() => {
        if (hovered && images.length > 1) {
            changeImageWithFade(1); // Show second image immediately with fade
            let idx = 1;
            intervalRef.current = setInterval(() => {
                idx = (idx + 1) % images.length;
                changeImageWithFade(idx);
            }, 3000);
        } else {
            changeImageWithFade(0);
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => {
            intervalRef.current && clearInterval(intervalRef.current);
            fadeTimeoutRef.current && clearTimeout(fadeTimeoutRef.current);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hovered, images.length]);

    if (!product) return null;
    const isAvailable = product.stock > 0;

    // Determine if product is clothing or shoes
    const isShoe = product.category?.toLowerCase().includes('chaussure') || product.category?.toLowerCase().includes('shoes');
    const availableSizes = product.sizes && product.sizes.length > 0 ? product.sizes : (isShoe ? shoeSizes : clothingSizes);

    const handleViewDetails = () => {
        router.push(`/products/${product._id}`);
    };

    const handleAddToCartClick = async (e) => {
        e.stopPropagation();
        if (!isAvailable) {
            toast.error('Ce produit est en rupture de stock.');
            return;
        }
        toast('Veuillez sélectionner la taille et la couleur sur la page du produit.');
        router.push(`/products/${product._id}`);
    };

    const handleBuyNow = (e) => {
        e.stopPropagation();
        if (!isAvailable) {
            toast.error('Ce produit est en rupture de stock.');
            return;
        }
        setShowBuyModal(true);
    };

    const handleAddToFavorites = (e) => {
        e.stopPropagation();
        toggleFavorite(product);
    };

    const handleQuantityChange = (change) => {
        setQuantity(prev => {
            const newQuantity = prev + change;
            if (newQuantity < 1) return 1;
            if (newQuantity > product.stock) {
                toast.error(`Il ne reste que ${product.stock} en stock.`);
                return product.stock;
            }
            return newQuantity;
        });
    };

    const handleProceedToCheckout = () => {
        if (product.colors?.length > 0 && !selectedColor) {
            toast.error('Veuillez sélectionner une couleur.');
            return;
        }
        if (product.sizes?.length > 0 && !selectedSize) {
            toast.error('Veuillez sélectionner une taille.');
            return;
        }

        // Add to cart first, then redirect to checkout
        addToCart(product, quantity, selectedSize, selectedColor);
        setShowBuyModal(false);
        router.push('/checkout');
    };

    const isProductFavorite = isFavorite(product._id);

    return (
        <>
            <div
                className="group bg-white rounded-2xl overflow-hidden shadow border border-gray-200 cursor-pointer flex flex-col transition-all duration-300 hover:shadow-xl relative w-full max-w-[280px]"
                onClick={handleViewDetails}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                {/* Product Image Container */}
                <div className="relative w-full h-[17rem] overflow-hidden bg-gray-100">
                    {/* Heart icon in top right */}
                    <button
                        onClick={e => { e.stopPropagation(); handleAddToFavorites(e); }}
                        className={`absolute top-3 right-3 z-10 flex items-center justify-center w-9 h-9 rounded-full border transition-all duration-200 ${
                            isProductFavorite 
                                ? 'bg-red-500 border-red-500 text-white hover:bg-red-600' 
                                : 'border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                        }`}
                        title={isProductFavorite ? "Retirer de mes favoris" : "Ajouter à mes favoris"}
                    >
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill={isProductFavorite ? "currentColor" : "none"} 
                            viewBox="0 0 24 24" 
                            strokeWidth={isProductFavorite ? 0 : 2} 
                            stroke="currentColor" 
                            className="w-5 h-5"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 0 1 6.364 0L12 7.636l1.318-1.318a4.5 4.5 0 1 1 6.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 0 1 0-6.364z" />
                        </svg>
                    </button>
                    <div
                        className={`w-full h-full transition-opacity duration-300 ${isFading ? 'opacity-0' : 'opacity-100'}`}
                        style={{ position: 'absolute', inset: 0 }}
                    >
                        <Image
                            src={images[imageIndex]}
                            alt={product.name || "Product image"}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover object-center w-full h-full transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                                e.target.src = `https://placehold.co/600x400/e2e8f0/94a3b8?text=${encodeURIComponent(product.name || "Product")}`;
                            }}
                        />
                    </div>
                    {product.offer && (
                        <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider animate-pulse shadow-lg">
                            Promo
                        </span>
                    )}
                    {!isAvailable && (
                        <span className="absolute top-3 right-14 bg-gray-700 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            Rupture de stock
                        </span>
                    )}
                </div>
                {/* Product Info */}
                <div className="p-4 flex flex-col flex-grow justify-between">
                    <div className="mb-2">
                        <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">{product.category}</p>
                        <h3 className="font-semibold text-gray-900 group-hover:text-yellow-700 transition-colors truncate text-lg mb-1">{product.name}</h3>
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <span className={`font-bold text-lg ${product.oldPrice ? 'text-red-600' : 'text-gray-900'}`}>{product.price?.toLocaleString()} DA</span>
                        {product.oldPrice && (
                            <span className="text-gray-400 line-through text-sm">{product.oldPrice?.toLocaleString()} DA</span>
                        )}
                    </div>
                    {/* Stack buttons vertically */}
                    <div className="flex flex-col gap-2 mt-2">
                        <Button
                            onClick={e => { e.stopPropagation(); handleBuyNow(e); }}
                            variant="primary"
                            size="sm"
                            className="w-full bg-yellow-700 hover:bg-yellow-800 text-white flex items-center justify-center gap-2"
                            iconLeft="shoppingBag"
                        >Acheter</Button>
                        <Button
                            onClick={e => { e.stopPropagation(); handleAddToCartClick(e); }}
                            variant="secondary"
                            size="sm"
                            className="w-full border-yellow-700 text-yellow-700 hover:bg-yellow-50 flex items-center justify-center gap-2"
                            iconLeft="cart"
                        >Ajouter au panier</Button>
                    </div>
                </div>
            </div>

            {/* Buy Modal */}
            {showBuyModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Acheter maintenant</h3>
                                <button
                                    onClick={() => setShowBuyModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Product Info */}
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                                    <Image
                                        src={images[0]}
                                        alt={product.name}
                                        width={64}
                                        height={64}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">{product.name}</h4>
                                    <p className="text-gray-500">{product.category}</p>
                                    <p className="font-semibold text-gray-900">{product.price?.toLocaleString()} DA</p>
                                </div>
                            </div>

                            {/* Color Selection */}
                            {product.colors && product.colors.length > 0 && (
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-900 mb-3">
                                        Couleur <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex flex-wrap gap-3">
                                        {product.colors.map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setSelectedColor(color)}
                                                className={`w-10 h-10 rounded-full border-2 transition-all ${
                                                    selectedColor === color 
                                                        ? 'border-gray-900 scale-110' 
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                                style={{ backgroundColor: color.toLowerCase() }}
                                                title={color}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Size Selection */}
                            {product.sizes && product.sizes.length > 0 && (
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-900 mb-3">
                                        Taille <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {availableSizes.map(size => (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                                                    selectedSize === size 
                                                        ? 'bg-gray-900 text-white border-gray-900' 
                                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                                }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quantity */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-900 mb-3">
                                    Quantité
                                </label>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => handleQuantityChange(-1)}
                                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                                        disabled={quantity <= 1}
                                    >
                                        -
                                    </button>
                                    <span className="w-12 text-center font-medium">{quantity}</span>
                                    <button
                                        onClick={() => handleQuantityChange(1)}
                                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                                        disabled={quantity >= product.stock}
                                    >
                                        +
                                    </button>
                                </div>
                                {product.stock < 10 && (
                                    <p className="text-sm text-yellow-600 mt-2">
                                        Il ne reste que {product.stock} en stock.
                                    </p>
                                )}
                            </div>

                            {/* Total */}
                            <div className="border-t pt-4 mb-6">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-gray-900">Total:</span>
                                    <span className="font-bold text-lg text-gray-900">
                                        {(product.price * quantity)?.toLocaleString()} DA
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowBuyModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleProceedToCheckout}
                                    className="flex-1 px-4 py-2 bg-yellow-700 text-white rounded-md hover:bg-yellow-800 transition-colors"
                                >
                                    Procéder au paiement
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProductCard;