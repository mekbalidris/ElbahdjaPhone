import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import { useRouter } from 'next/router';
import ProductCard from '../../components/products/ProductCard';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { connectToDatabase } from '../../lib/mongodb';
import { ObjectId } from 'mongodb';
import Image from 'next/image';
import { useFavorites } from '../../context/FavoritesContext';

const clothingSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const shoeSizes = ['39', '40', '41', '42', '43', '44', '45', '46'];

const ZOOM_LENS_SIZE = 120;
const ZOOM_IMAGE_WIDTH = 800;
const ZOOM_IMAGE_HEIGHT = 1000;

const brandOrange = { text: 'text-amber-500', ring: 'focus:ring-amber-500', border: 'border-amber-500' };
const brandPurple = { text: 'text-purple-600' };

const ProductDetailPage = ({ product, relatedProducts, error }) => {
    const router = useRouter();
    const { addToCart } = useCart();
    const { currentUser } = useAuth();
    const { toggleFavorite, isFavorite } = useFavorites();
    
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(product?.images?.[0] || '');
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [tab, setTab] = useState('description');
    const [isHovering, setIsHovering] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

    if (error) {
        toast.error(error);
        return (
            <div className="min-h-screen flex items-center justify-center">
                <h1 className="text-2xl text-red-500">Produit introuvable ou échec du chargement.</h1>
            </div>
        );
    }
    
    if (router.isFallback || !product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    const isAvailable = product.stock > 0;
    const isShoe = product.category?.toLowerCase().includes('chaussure') || product.category?.toLowerCase().includes('shoes');
    const availableSizes = product.sizes && product.sizes.length > 0 ? product.sizes : (isShoe ? shoeSizes : clothingSizes);

    const isProductFavorite = isFavorite(product._id);

    const handleQuantityChange = (change) => {
        setQuantity(prev => {
            const newQuantity = prev + change;
            if (newQuantity < 1) return 1;
            if (newQuantity > product.stock) {
                toast.error(`Only ${product.stock} items available.`);
                return product.stock;
            }
            return newQuantity;
        });
    };

    const handleAddToCart = () => {
        if (!isAvailable) {
            toast.error("This product is currently out of stock.");
            return;
        }
        if (product.sizes?.length > 0 && !selectedSize) {
            toast.error("Please select a size.");
            return;
        }
        if (product.colors?.length > 0 && !selectedColor) {
            toast.error("Please select a color.");
            return;
        }
        try {
            addToCart(product, quantity, selectedSize, selectedColor);
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Failed to add product to cart.');
        }
    };

    // Mouse move/zoom logic for main image
    const handleMouseMove = (e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.pageX - left) / width) * 100;
        const y = ((e.pageY - top) / height) * 100;
        setMousePosition({ x, y });
    };
    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    return (
        <div className="bg-white py-12 lg:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Product details main section */}
                <div className="w-full flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
                    {/* Left: Image Gallery */}
                    <div className="flex w-full lg:w-[45%] min-w-[320px] max-w-[520px] mx-auto">
                        {/* Thumbnails */}
                        <div className="flex flex-col gap-3 justify-center items-center mr-4">
                            {product.images?.map((img, index) => (
                                <button 
                                    key={index} 
                                    onClick={() => setActiveImage(img)} 
                                    className={`w-16 h-16 bg-white rounded-lg overflow-hidden focus:outline-none ring-2 ring-offset-2 transition-all duration-200 ${activeImage === img ? 'ring-yellow-700' : 'ring-transparent opacity-70 hover:opacity-100'}`}
                                >
                                    <Image 
                                        src={img || `https://placehold.co/100x100/e2e8f0/94a3b8?text=${encodeURIComponent(product.name || "Produit")}`} 
                                        alt={`${product.name} miniature ${index + 1}`} 
                                        width={64} 
                                        height={64} 
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                        {/* Main Image */}
                        <div className="relative flex-1 aspect-[4/3] bg-white rounded-lg shadow-sm overflow-hidden group flex items-center justify-center" style={{ minWidth: '0', height: '400px' }}>
                            <img
                                src={activeImage}
                                alt={product.name}
                                className="w-full h-full object-contain transition-transform duration-300"
                                style={{
                                    transform: isHovering ? 'scale(2.2)' : 'scale(1)',
                                    transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                                    cursor: isHovering ? 'zoom-in' : 'default',
                                }}
                                onMouseMove={handleMouseMove}
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                            />
                        </div>
                    </div>
                    {/* Right: Product Info */}
                    <div className="flex-1 w-full max-w-2xl mx-auto">
                        {/* Breadcrumbs (optional) */}
                        {/* <div className="text-xs text-gray-400 mb-2">Accueil / Catégorie / Produit</div> */}
                        <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">{product.name}</h1>
                        <div className="flex items-center gap-4 mb-4">
                            <span className="text-2xl font-bold text-yellow-900">{product.price?.toLocaleString()} د.ج</span>
                            {product.oldPrice && (
                                <span className="text-lg text-gray-400 line-through">{product.oldPrice?.toLocaleString()} د.ج</span>
                            )}
                        </div>
                        {/* Size selector */}
                        <div className="mb-4">
                            <span className="font-medium text-gray-700 mr-2">Pointure :</span>
                            {availableSizes.map(size => (
                                <button 
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`inline-flex items-center justify-center w-10 h-10 rounded-full border text-base font-semibold mx-1 mb-1 transition-colors ${selectedSize === size ? 'bg-yellow-900 text-white border-yellow-900' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                        {/* Quantity and buttons */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center rounded-lg border border-gray-300">
                                <button onClick={() => handleQuantityChange(-1)} className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 rounded-l-lg text-lg" disabled={quantity <= 1}>-</button>
                                <span className="px-4 font-bold text-gray-800 text-base">{quantity}</span>
                                <button onClick={() => handleQuantityChange(1)} className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 rounded-r-lg text-lg" disabled={!isAvailable || quantity >= product.stock}>+</button>
                            </div>
                            <Button onClick={handleAddToCart} size="md" className="w-48 bg-yellow-700 hover:bg-yellow-800 text-xs font-semibold flex items-center justify-center gap-2" disabled={!isAvailable}>
                                <Icon name="shoppingBag" className="w-5 h-5" />
                                {isAvailable ? 'AJOUTER AU PANIER' : 'Rupture de stock'}
                            </Button>
                            <Button onClick={() => {/* handle buy now */}} size="md" className="w-[15rem] bg-yellow-900 hover:bg-yellow-800 text-[0.8rem] font-semibold flex items-center justify-center gap-2" disabled={!isAvailable}>
                                <Icon name="arrowRight" className="w-5 h-5" />
                                COMMANDER MAINTENANT
                            </Button>
                        </div>
                        {/* Color selector and favorites */}
                        <div className="flex items-center gap-6 mb-4">
                            {product.colors && product.colors.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-900">Couleur :</span>
                                    <div className="flex gap-2">
                                        {product.colors.map(color => (
                                            <button 
                                                key={color}
                                                onClick={() => setSelectedColor(color)}
                                                className={`w-7 h-7 rounded-full border-2 transition-all ${selectedColor === color ? 'border-yellow-900 scale-110' : 'border-gray-200'}`}
                                                style={{ backgroundColor: color.toLowerCase() }}
                                                aria-label={`Sélectionner la couleur ${color}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* Favorites heart icon button */}
                            <button
                                onClick={() => toggleFavorite(product)}
                                className={`flex items-center gap-2 cursor-pointer px-2 py-1 rounded transition-all duration-200 ${isProductFavorite ? 'text-red-600' : 'text-gray-400 hover:text-red-600'}`}
                                title={isProductFavorite ? "Retirer de mes favoris" : "Ajouter à mes favoris"}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill={isProductFavorite ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={isProductFavorite ? 0 : 2} stroke="currentColor" className="w-7 h-7">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 0 1 6.364 0L12 7.636l1.318-1.318a4.5 4.5 0 1 1 6.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 0 1 0-6.364z" />
                                </svg>
                                <span className="text-base font-medium">{isProductFavorite ? 'Retirer des favoris' : 'Ajouter à mes favoris'}</span>
                            </button>
                        </div>
                        {isAvailable && product.stock < 10 && (
                            <p className="text-xs text-yellow-600 pt-2">Dépêchez-vous ! Il ne reste que {product.stock} en stock.</p>
                        )}
                    </div>
                </div>
                {/* Product Info Tabs - full width below */}
                <div className="mt-10 w-full max-w-5xl mx-auto">
                    <div className="flex border-b border-gray-200 mb-6">
                        <button className={`px-6 py-3 font-semibold text-gray-700 ${tab === 'description' ? 'border-b-2 border-yellow-700' : ''}`} onClick={() => setTab('description')}>DESCRIPTION</button>
                        <button className="px-6 py-3 font-semibold text-gray-700" onClick={() => setTab('infos')}>INFORMATIONS COMPLÉMENTAIRES</button>
                        <button className="px-6 py-3 font-semibold text-gray-700" onClick={() => setTab('avis')}>AVIS</button>
                        <button className="px-6 py-3 font-semibold text-gray-700" onClick={() => setTab('livraison')}>LIVRAISON</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {tab === 'description' && (
                            <div>
                                <h2 className="text-lg font-bold mb-2">Description</h2>
                                <div className="prose text-gray-700" dangerouslySetInnerHTML={{ __html: product.description?.replace(/\n/g, '<br />') }} />
                            </div>
                        )}
                        {tab === 'infos' && (
                            <div>
                                <h2 className="text-lg font-bold mb-2">Informations complémentaires</h2>
                                <ul className="text-gray-700 space-y-2">
                                    {product.brand && <li><b>Marque:</b> {product.brand}</li>}
                                    {product.genre && <li><b>Genre:</b> {product.genre}</li>}
                                    {product.matiere && <li><b>Matière:</b> {product.matiere}</li>}
                                    {product.coupe && <li><b>Coupe:</b> {product.coupe}</li>}
                                    {product.saison && <li><b>Saison:</b> {product.saison}</li>}
                                </ul>
                            </div>
                        )}
                        {tab === 'avis' && (
                            <div>
                                <h2 className="text-lg font-bold mb-2">Avis</h2>
                                <p>Il n&apos;y a pas encore d&apos;avis.</p>
                            </div>
                        )}
                        {tab === 'livraison' && (
                            <div>
                                <h2 className="text-lg font-bold mb-2">Livraison</h2>
                                <p>Livraison rapide dans 58 wilayas. Garantie 12 mois.</p>
                            </div>
                        )}
                    </div>
                </div>
                {/* Related Products Section */}
                <section className="pt-16 mt-16 border-t border-gray-200/80">
                    <h2 className="text-2xl font-bold text-center mb-8 text-slate-800">Produits similaires</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                        {relatedProducts.map((related, index) => (
                            <div
                                key={related._id}
                                className="animate-fadeInUp"
                                style={{animationDelay: `${index * 60}ms`}}
                            >
                                <ProductCard product={related} />
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export async function getServerSideProps(context) {
    const { productId } = context.params;

    try {
        const { db } = await connectToDatabase();
        const product = await db
            .collection('products')
            .findOne({ _id: new ObjectId(productId) });

        if (!product) {
            return { notFound: true };
        }

        // Fetch related products (e.g., from the same category)
        const relatedProducts = await db
            .collection('products')
            .find({ 
                category: product.category,
                _id: { $ne: product._id } 
            })
            .limit(4)
            .toArray();
        
        return {
            props: {
                product: JSON.parse(JSON.stringify(product)),
                relatedProducts: JSON.parse(JSON.stringify(relatedProducts)),
            },
        };
    } catch (error) {
        console.error(`Error fetching product ${productId}:`, error);
        return { 
            props: { 
                product: null,
                relatedProducts: [],
                error: 'Server error while fetching product data.'
            } 
        };
    }
}

export default ProductDetailPage;