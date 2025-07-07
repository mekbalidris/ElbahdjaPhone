import React, { useState, useRef, useCallback, useEffect } from 'react';
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
import { useSwipeable } from 'react-swipeable';

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
    const [commentText, setCommentText] = useState('');
    const [commentStatus, setCommentStatus] = useState('');

    useEffect(() => {
        setActiveImage(product?.images?.[0] || '');
    }, [product?._id]);

    // Find index of current image
    const currentImageIndex = product?.images?.indexOf(activeImage) ?? 0;
    // Handlers for swipe
    const handleSwipeLeft = () => {
        if (currentImageIndex < product.images.length - 1) {
            setActiveImage(product.images[currentImageIndex + 1]);
        }
    };
    const handleSwipeRight = () => {
        if (currentImageIndex > 0) {
            setActiveImage(product.images[currentImageIndex - 1]);
        }
    };
    const swipeHandlers = useSwipeable({
        onSwipedLeft: handleSwipeLeft,
        onSwipedRight: handleSwipeRight,
        trackMouse: true,
    });

    // Infinite scroll for similar products
    const [page, setPage] = useState(1);
    const productsPerPage = 6;
    const visibleRelated = relatedProducts.slice(0, page * productsPerPage);
    const hasMore = visibleRelated.length < relatedProducts.length;
    const observer = useRef();
    const lastRelatedRef = useCallback(node => {
        if (!hasMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new window.IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                setPage(prev => prev + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [hasMore]);

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

    async function handleCommentSubmit(e) {
        e.preventDefault();
        setCommentStatus('');
        try {
            const res = await fetch(`/api/products?id=${product._id}&comment=1`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.id, userName: currentUser.name || currentUser.email, text: commentText }),
            });
            if (res.ok) {
                setCommentText('');
                setCommentStatus('Votre commentaire a été envoyé et sera visible après validation.');
            } else {
                setCommentStatus("Erreur lors de l&apos;envoi du commentaire.");
            }
        } catch {
            setCommentStatus("Erreur lors de l&apos;envoi du commentaire.");
        }
    }

    return (
        <div className="bg-white py-6 sm:py-10 lg:py-24 xl:mt-[2rem]">
            <div className="container mx-auto px-2 sm:px-4 lg:px-8">
                {/* Product details main section */}
                <div className="w-full flex flex-col lg:flex-row gap-6 lg:gap-16 items-start">
                    {/* Mobile: Main image on top, thumbnails below */}
                    <div className="block lg:hidden w-full">
                        <div className="w-full flex items-center justify-center mb-3">
                            <div className="relative w-full max-w-sm aspect-[5/4] bg-white rounded-lg shadow-sm overflow-hidden flex items-center justify-center mx-auto"
                                 {...swipeHandlers}>
                                <img
                                    src={activeImage}
                                    alt={product.name}
                                    className="w-full h-full object-contain select-none"
                                    draggable="false"
                                />
                                {/* Optional: left/right arrows for visual hint */}
                                {currentImageIndex > 0 && (
                                    <button onClick={handleSwipeRight} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-1 shadow text-gray-700">
                                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
                                    </button>
                                )}
                                {currentImageIndex < product.images.length - 1 && (
                                    <button onClick={handleSwipeLeft} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-1 shadow text-gray-700">
                                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 px-2 pb-2 justify-center">
                            {product.images?.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveImage(img)}
                                    className={`w-14 h-14 bg-white rounded-lg overflow-hidden focus:outline-none ring-2 ring-offset-2 transition-all duration-200 ${activeImage === img ? 'ring-yellow-700' : 'ring-transparent opacity-70 hover:opacity-100'}`}
                                    style={{ flex: '0 0 auto' }}
                                >
                                    <Image
                                        src={img || `https://placehold.co/100x100/e2e8f0/94a3b8?text=${encodeURIComponent(product.name || "Produit")}`}
                                        alt={`${product.name} miniature ${index + 1}`}
                                        width={56}
                                        height={56}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* Desktop: Side-by-side gallery */}
                    <div className="hidden lg:flex w-full lg:w-[45%] min-w-[0] max-w-full lg:max-w-[700px] mx-auto">
                        {/* Thumbnails vertical */}
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
                        <div className="relative flex-1 aspect-[4/3] bg-white rounded-lg shadow-sm overflow-hidden group flex items-center justify-center min-w-0 h-[400px] md:h-[500px]">
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
                    <div className="flex-1 w-full max-w-full lg:max-w-2xl mx-auto mt-6 lg:mt-0">
                        <h1 className="text-4xl font-bold text-white mb-2">{product.name}</h1>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4">
                            <span className="text-2xl font-bold text-accent mr-4">{product.price?.toLocaleString()} DA</span>
                            {product.oldPrice && (
                                <span className="text-lg text-gray-400 line-through">{product.oldPrice?.toLocaleString()} DA</span>
                            )}
                        </div>
                        {/* Size selector */}
                        <div className="mb-4 flex flex-wrap items-center gap-2">
                            <label className="block text-lg font-semibold text-white mb-2">{isShoe ? 'Pointure' : 'Taille'} :</label>
                            {availableSizes.map(size => (
                                <button 
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`w-10 h-10 flex items-center justify-center rounded-full border-2 text-base font-semibold mx-1 mb-1 transition-colors
                                        ${selectedSize === size ? 'bg-gray-900 text-white border-accent' : 'bg-white text-gray-900 border-gray-500 hover:bg-gray-200'}`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                        {/* Color selector as dropdown */}
                        {product.colors && product.colors.length > 0 && (
                            <div className="flex items-center gap-2 mb-4">
                                <label className="block text-lg font-semibold text-white mb-2">Couleur :</label>
                                <select
                                    value={selectedColor || ''}
                                    onChange={e => setSelectedColor(e.target.value)}
                                    className="bg-gray-900 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent border border-gray-700"
                                >
                                    <option value="" disabled>Choisir une couleur</option>
                                    {product.colors.map(color => (
                                        <option key={color} value={color}>{color}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Counter and favorites row */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center rounded-lg border border-gray-300 w-fit mx-auto sm:mx-0 mb-2">
                                <button onClick={() => handleQuantityChange(-1)} className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 rounded-l-lg text-lg" disabled={quantity <= 1}>-</button>
                                <span className="px-4 font-bold text-gray-800 text-base">{quantity}</span>
                                <button onClick={() => handleQuantityChange(1)} className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 rounded-r-lg text-lg" disabled={!isAvailable || quantity >= product.stock}>+</button>
                            </div>
                            <button
                                onClick={() => toggleFavorite(product)}
                                className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-full transition-all duration-200 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-accent whitespace-nowrap"
                                title={isProductFavorite ? "Retirer de mes favoris" : "Ajouter à mes favoris"}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill={isProductFavorite ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={isProductFavorite ? 0 : 2} stroke="currentColor" className="w-6 h-6 text-white">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 0 1 6.364 0L12 7.636l1.318-1.318a4.5 4.5 0 1 1 6.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 0 1 0-6.364z" />
                                </svg>
                                <span className="text-base font-medium text-white">{isProductFavorite ? 'Retirer des favoris' : 'Ajouter à mes favoris'}</span>
                            </button>
                        </div>
                        {/* Restore buy and add to cart buttons */}
                        <div className="flex flex-row gap-2 w-full mb-4">
                            <Button onClick={handleAddToCart} size="md" className="w-1/2 sm:w-48 bg-yellow-700 hover:bg-yellow-800 text-xs font-semibold flex items-center justify-center gap-2 text-black" disabled={!isAvailable}>
                                <Icon name="cart" className="w-5 h-5" />
                                {isAvailable ? 'AJOUTER AU PANIER' : 'Rupture de stock'}
                            </Button>
                            <Button onClick={() => {/* handle buy now */}} size="md" className="w-1/2 sm:w-[15rem] bg-yellow-900 hover:bg-yellow-800 text-[0.75rem] font-semibold flex items-center justify-center gap-2 text-white" disabled={!isAvailable}>
                                COMMANDER MAINTENANT
                            </Button>
                        </div>
                        {isAvailable && product.stock < 10 && (
                            <p className="text-xs text-yellow-600 pt-2">Dépêchez-vous ! Il ne reste que {product.stock} en stock.</p>
                        )}
                    </div>
                </div>
                {/* Product Info Tabs - full width below */}
                <div className="mt-8 sm:mt-10 w-full max-w-5xl mx-auto">
                    <div className="flex overflow-x-auto no-scrollbar border-b border-gray-200 mb-6 whitespace-nowrap">
                        <button
                            className={`px-4 sm:px-6 py-4 font-semibold transition-all duration-200
                                ${tab === 'description' ? 'bg-accent text-black' : 'bg-gray-800 text-white hover:bg-gray-700'}
                                border-none outline-none focus:ring-2 focus:ring-accent`}
                            onClick={() => setTab('description')}
                            type="button"
                        >
                            DESCRIPTION
                        </button>
                        <button
                            className={`px-4 sm:px-6 py-4 font-semibold transition-all duration-200
                                ${tab === 'infos' ? 'bg-accent text-black' : 'bg-gray-800 text-white hover:bg-gray-700'}
                                border-none outline-none focus:ring-2 focus:ring-accent`}
                            onClick={() => setTab('infos')}
                            type="button"
                        >
                            INFORMATIONS COMPLÉMENTAIRES
                        </button>
                        <button
                            className={`px-4 sm:px-6 py-4 font-semibold transition-all duration-200
                                ${tab === 'avis' ? 'bg-accent text-black' : 'bg-gray-800 text-white hover:bg-gray-700'}
                                border-none outline-none focus:ring-2 focus:ring-accent`}
                            onClick={() => setTab('avis')}
                            type="button"
                        >
                            AVIS
                        </button>
                        <button
                            className={`px-4 sm:px-6 py-4 font-semibold transition-all duration-200
                                ${tab === 'livraison' ? 'bg-accent text-black' : 'bg-gray-800 text-white hover:bg-gray-700'}
                                border-none outline-none focus:ring-2 focus:ring-accent`}
                            onClick={() => setTab('livraison')}
                            type="button"
                        >
                            LIVRAISON
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        {tab === 'description' && (
                            <div>
                                <h2 className="text-lg font-bold mb-2">Description</h2>
                                <div className="prose text-white" dangerouslySetInnerHTML={{ __html: product.description?.replace(/\n/g, '<br />') }} />
                            </div>
                        )}
                        {tab === 'infos' && (
                            <div>
                                <h2 className="text-lg font-bold mb-2">Informations complémentaires</h2>
                                <ul className="text-white space-y-2">
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
                                <h2 className="text-lg font-bold mb-2">Avis des clients</h2>
                                <div className="mb-4 text-sm text-gray-500">Les commentaires doivent être approuvés par un administrateur avant d'apparaître ici.</div>
                                {product.comments && product.comments.length > 0 ? (
                                    <div className="space-y-4">
                                        {product.comments.map((comment, idx) => (
                                            <div key={idx} className="bg-gray-50 rounded-lg p-4 shadow-sm">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-gray-800">{comment.userName}</span>
                                                    <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <div className="text-gray-700">{comment.text}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-gray-400 italic mb-4">Aucun avis pour ce produit pour le moment.</div>
                                )}
                                {currentUser ? (
                                    <form className="mt-6 space-y-2" onSubmit={handleCommentSubmit}>
                                        <textarea
                                            className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-yellow-700"
                                            rows={3}
                                            placeholder="Écrivez votre avis..."
                                            value={commentText}
                                            onChange={e => setCommentText(e.target.value)}
                                            required
                                        />
                                        <button type="submit" className="bg-yellow-700 hover:bg-yellow-800 text-white px-4 py-2 rounded font-semibold text-sm">Envoyer</button>
                                        {commentStatus && <div className="text-xs text-green-600 mt-1">{commentStatus.replace(/'/g, "&apos;")}</div>}
                                    </form>
                                ) : (
                                    <div className="text-sm text-gray-500 mt-4">Connectez-vous pour laisser un avis.</div>
                                )}
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
                <section className="pt-10 sm:pt-16 mt-10 sm:mt-16 border-t border-gray-200/80">
                    <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8 text-white">Produits similaires</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                        {visibleRelated.map((related, idx) => {
                            const isLast = hasMore && idx === visibleRelated.length - 1;
                            return (
                                <div
                                    key={related._id}
                                    className="animate-fadeInUp"
                                    style={{animationDelay: `${idx * 60}ms`}}
                                    ref={isLast ? lastRelatedRef : null}
                                >
                                    <ProductCard product={related} />
                                </div>
                            );
                        })}
                        {visibleRelated.length === 0 && (
                            <div className="col-span-full text-center text-white">Aucun produit similaire trouvé.</div>
                        )}
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

        // Fetch similar products first, then fill with others if needed
        const similar = await db
            .collection('products')
            .find({ category: product.category, _id: { $ne: product._id } })
            .toArray();
        const similarIds = similar.map(p => p._id);
        const others = await db
            .collection('products')
            .find({ _id: { $nin: [product._id, ...similarIds] } })
            .toArray();
        const relatedProducts = [...similar, ...others];

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