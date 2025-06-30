import React, { useState, useEffect, useRef, forwardRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { toast } from 'react-hot-toast';
import Button from '../ui/Button';
import { ShoppingCart, ShoppingBag, Search, Heart } from 'lucide-react';

const FADE_DURATION = 300; // ms

const clothingSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const shoeSizes = ['39', '40', '41', '42', '43', '44', '45', '46'];

const ProductCard = forwardRef(function ProductCard({ product }, ref) {
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

    const changeImageWithFade = (newIdx) => {
        setIsFading(true);
        fadeTimeoutRef.current = setTimeout(() => {
            setImageIndex(newIdx);
            setIsFading(false);
        }, FADE_DURATION);
    };

    useEffect(() => {
        if (hovered && images.length > 1) {
            changeImageWithFade(1);
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

    const isShoe = product.category?.toLowerCase().includes('chaussure') || product.category?.toLowerCase().includes('shoes');
    const availableSizes = product.sizes && product.sizes.length > 0 ? product.sizes : (isShoe ? shoeSizes : clothingSizes);

    const handleViewDetails = () => {
        router.push(`/products/${product._id}`);
    };

    const handleAddToCartClick = (e) => {
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

        addToCart(product, quantity, selectedSize, selectedColor);
        setShowBuyModal(false);
        router.push('/checkout');
    };

    const isProductFavorite = isFavorite(product._id);

    return (
        <>
            <div
                ref={ref}
                className="group bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 cursor-pointer flex flex-col transition-all duration-300 hover:shadow-xl relative w-full max-w-[300px]"
                onClick={handleViewDetails}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                {/* Product Image Container */}
                <div className="relative w-full h-[20rem] overflow-hidden bg-gray-100">
                    {/* Favorite Button (Heart Icon) */}
                    <button
                        onClick={handleAddToFavorites}
                        className={`absolute top-3 right-3 z-20 flex items-center justify-center w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow-md transition-all duration-300 ${
                            isProductFavorite 
                                ? 'text-red-500' 
                                : 'text-gray-500 hover:text-red-500 hover:scale-110'
                        }`}
                        title={isProductFavorite ? "Retirer de mes favoris" : "Ajouter à mes favoris"}
                    >
                        <Heart className="w-5 h-5" fill={isProductFavorite ? "currentColor" : "none"} />
                    </button>

                    <div
                        className={`w-full h-full transition-opacity duration-${FADE_DURATION} ${isFading ? 'opacity-0' : 'opacity-100'}`}
                        style={{ position: 'absolute', inset: 0 }}
                    >
                        <Image
                            src={images[imageIndex]}
                            alt={product.name || "Product image"}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover object-center w-full h-full transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => {
                                e.target.src = `https://placehold.co/600x400/e2e8f0/94a3b8?text=${encodeURIComponent(product.name || "Image")}`;
                            }}
                        />
                    </div>

                    {/* === ACTION ICONS WITH TOOLTIPS - NEW DESIGN === */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-auto flex justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg">
                            
                            {/* View Details Icon */}
                            <div className="relative group/icon flex flex-col items-center">
                                <div className="absolute bottom-full mb-2 flex flex-col items-center opacity-0 group-hover/icon:opacity-100 transition-opacity duration-300 pointer-events-none">
                                    <span className="px-3 py-1 text-xs text-white bg-black rounded-md shadow-lg whitespace-nowrap">Voir détails</span>
                                    <div className="w-3 h-3 -mt-1.5 rotate-45 bg-black"></div>
                                </div>
                                <button
                                    onClick={handleViewDetails}
                                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow hover:bg-gray-100 transition-all"
                                    aria-label="Voir détails"
                                >
                                    <Search className="w-5 h-5 text-gray-700" />
                                </button>
                            </div>

                            {/* Add to Cart Icon */}
                             <div className="relative group/icon flex flex-col items-center">
                                <div className="absolute bottom-full mb-2 flex flex-col items-center opacity-0 group-hover/icon:opacity-100 transition-opacity duration-300 pointer-events-none">
                                    <span className="px-3 py-1 text-xs text-white bg-black rounded-md shadow-lg whitespace-nowrap">Ajouter au panier</span>
                                    <div className="w-3 h-3 -mt-1.5 rotate-45 bg-black"></div>
                                </div>
                                <button
                                    onClick={handleAddToCartClick}
                                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow hover:bg-gray-100 transition-all"
                                    aria-label="Ajouter au panier"
                                >
                                    <ShoppingCart className="w-5 h-5 text-gray-700" />
                                </button>
                            </div>

                            {/* Buy Now Icon */}
                            <div className="relative group/icon flex flex-col items-center">
                                <div className="absolute bottom-full mb-2 flex flex-col items-center opacity-0 group-hover/icon:opacity-100 transition-opacity duration-300 pointer-events-none">
                                    <span className="px-3 py-1 text-xs text-white bg-black rounded-md shadow-lg whitespace-nowrap">Acheter</span>
                                    <div className="w-3 h-3 -mt-1.5 rotate-45 bg-black"></div>
                                </div>
                                <button
                                    onClick={handleBuyNow}
                                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow hover:bg-gray-100 transition-all"
                                    aria-label="Acheter"
                                >
                                    <ShoppingBag className="w-5 h-5 text-gray-700" />
                                </button>
                            </div>
                        </div>
                    </div>


                    {product.offer && (
                        <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-lg">
                            Promo
                        </span>
                    )}
                    {!isAvailable && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
                             <span className="bg-gray-800 text-white text-sm font-bold px-4 py-2 rounded-full uppercase tracking-wider">
                                Rupture de stock
                            </span>
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="p-4 flex flex-col flex-grow">
                    <div className="flex-grow">
                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">{product.category}</p>
                        <h3 className="font-semibold text-gray-800 group-hover:text-yellow-800 transition-colors truncate text-base mb-2">{product.name}</h3>
                    </div>
                    <div className="flex items-baseline justify-start gap-2 mt-2">
                        <span className={`font-bold text-lg ${product.oldPrice ? 'text-red-600' : 'text-gray-900'}`}>{product.price?.toLocaleString()} DA</span>
                        {product.oldPrice && (
                            <span className="text-gray-400 line-through text-sm">{product.oldPrice?.toLocaleString()} DA</span>
                        )}
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
                                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
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
                                    <p className="text-sm text-gray-500">{product.category}</p>
                                    <p className="font-semibold text-lg text-gray-900 mt-1">{product.price?.toLocaleString()} DA</p>
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
                                                className={`w-9 h-9 rounded-full border-2 transition-all ${
                                                    selectedColor === color 
                                                        ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-900' 
                                                        : 'border-gray-200 hover:border-gray-400'
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
                                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
                                        disabled={quantity <= 1}
                                    >
                                        -
                                    </button>
                                    <span className="w-12 text-center font-medium">{quantity}</span>
                                    <button
                                        onClick={() => handleQuantityChange(1)}
                                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
                                        disabled={quantity >= product.stock}
                                    >
                                        +
                                    </button>
                                </div>
                                {product.stock > 0 && product.stock < 10 && (
                                    <p className="text-sm text-yellow-600 mt-2">
                                        Il ne reste que {product.stock} en stock.
                                    </p>
                                )}
                            </div>

                            {/* Total */}
                            <div className="border-t pt-4 mb-6">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-gray-900">Total:</span>
                                    <span className="font-bold text-xl text-gray-900">
                                        {(product.price * quantity)?.toLocaleString()} DA
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => setShowBuyModal(false)}
                                    className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-semibold transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleProceedToCheckout}
                                    className="w-full px-4 py-3 bg-yellow-700 text-white rounded-md hover:bg-yellow-800 font-semibold transition-colors"
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
});

export default ProductCard;