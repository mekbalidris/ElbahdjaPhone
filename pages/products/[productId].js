import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import { useRouter } from 'next/router';
import ProductCard from '../../components/products/ProductCard';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const brandOrange = { text: 'text-amber-500', ring: 'focus:ring-amber-500', border: 'border-amber-500' };
const brandPurple = { text: 'text-purple-600' };

const ProductDetailPage = () => {
    const router = useRouter();
    const { productId } = router.query;
    const { addToCart } = useCart();
    const { currentUser } = useAuth();

    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState('');
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [fallbackProducts, setFallbackProducts] = useState([]);
    const [isHovering, setIsHovering] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

    useEffect(() => {
        if (!router.isReady || !productId) return;
        setIsLoading(true);
        fetch(`/api/products?_id=${productId}`)
            .then(res => res.json())
            .then(data => {
                setProduct(data);
                setActiveImage(data.images?.[0] || data.imageUrl);
                if (data && data.category) {
                    fetch(`/api/products?category=${encodeURIComponent(data.category)}`)
                        .then(res => res.json())
                        .then(products => {
                            // Exclude current product
                            const related = products.filter(p => p._id !== productId);
                            setRelatedProducts(related.slice(0, 4));
                            // If less than 4, fetch more products as fallback
                            if (related.length < 4) {
                                fetch('/api/products')
                                    .then(res => res.json())
                                    .then(allProducts => {
                                        // Exclude current and already shown related
                                        const others = allProducts.filter(p => p._id !== productId && !related.some(rp => rp._id === p._id));
                                        setFallbackProducts(others.slice(0, 4 - related.length));
                                    });
                            } else {
                                setFallbackProducts([]);
                            }
                        });
                }
                setIsLoading(false);
            })
            .catch(() => {
                setIsLoading(false);
                toast.error('Failed to load product details.');
            });
    }, [router.isReady, productId]);

    const isAvailable = product && product.stock > 0;

    const handleQuantityChange = (change) => {
        setQuantity(prev => {
            const newQuantity = prev + change;
            if (newQuantity < 1) return 1;
            if (product && newQuantity > product.stock) {
                toast.error(`Only ${product.stock} items available in stock.`);
                return product.stock;
            }
            return newQuantity;
        });
    };

    const handleBuyNow = async () => {
        if (!isAvailable || !product) return;
        
        try {
            await addToCart({ ...product, quantity });
            router.push('/checkout');
        } catch (error) {
            console.error('Error in buy now:', error);
            toast.error('Failed to process your request. Please try again.');
        }
    };

    const handleAddToCartClick = async () => {
        if (!isAvailable || !product) return;
        
        try {
            await addToCart({ ...product, quantity });
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Failed to add product to cart');
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

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className={`animate-spin rounded-full h-16 w-16 border-b-2 ${brandOrange.border}`}></div></div>;
    if (!product) return <div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl text-slate-700">Product not found.</h1></div>;

    return (
        <div className="bg-white font-sans mt-[1rem]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
                <div className="mb-6">
                    <button onClick={() => router.back()} className={`inline-flex items-center text-sm font-medium ${brandPurple.text} hover:text-purple-700`}>
                        <Icon name="chevronLeft" className="w-5 h-5 mr-1"/> Back to Products
                    </button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-10 lg:gap-16">
                    {/* Image Gallery - Left Side */}
                    <div className="lg:col-span-1 order-first lg:order-first">
                        <div className="flex lg:flex-col gap-4">
                           {product.images?.map((img, index) => (
                                <button key={index} onClick={() => setActiveImage(img)} className={`w-[5.5rem] aspect-square bg-gray-100 rounded-xl overflow-hidden focus:outline-none transition-all duration-200 ${activeImage === img ? `ring-2 ring-offset-2 ${brandOrange.ring}` : 'opacity-60 hover:opacity-100'}`}>
                                    <img src={img} alt={`${product.name} thumbnail ${index + 1}`} className="w-full h-full object-cover"/>
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* Main Image */}
                    <div className="lg:col-span-4 mb-8">
                         <div className="bg-gray-100 rounded-2xl shadow-lg overflow-hidden h-[30rem] w-[30rem] sticky top-24 flex items-center justify-center max-sm:relative max-sm:top-0 max-sm:w-[90vw] max-sm:h-[300px] max-sm:mx-auto">
                            <img 
                                src={activeImage} 
                                alt={product.name} 
                                className={`w-full h-full object-cover transition-transform duration-300 ${isHovering ? '' : ''} max-sm:w-full max-sm:h-full max-sm:max-w-[90vw] max-sm:max-h-[300px]`}
                                style={{
                                    transform: isHovering ? 'scale(2.5)' : 'scale(1)',
                                    transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`
                                }}
                                onMouseMove={handleMouseMove}
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                            />
                        </div>
                    </div>
                    {/* Product Info */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="space-y-3">
                            <p className={`font-bold ${brandOrange.text} uppercase tracking-wider text-sm`}>{product.category}</p>
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">{product.name}</h1>
                            <div className="flex items-center space-x-3">
                                <p className={`text-4xl font-bold ${brandPurple.text}`}>{product.price?.toLocaleString()} DA</p>
                                {product.oldPrice && (
                                    <p className="text-red-800 text-xl line-through">{product.oldPrice?.toLocaleString()} DA</p>
                                )}
                            </div>
                        </div>
                        <div className="text-base text-slate-600 space-y-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: product.description?.replace(/\n/g, '<br />') }} />
                        {isAvailable ? (
                            <div className="p-3 bg-green-50 text-green-800 rounded-xl flex items-center space-x-3 text-sm">
                                <Icon name="package" className="w-5 h-5 text-green-600" />
                                <span className="font-semibold">In Stock & Ready to Ship</span>
                            </div>
                        ) : (
                            <div className="p-3 bg-red-50 text-red-700 rounded-xl flex items-center space-x-3 text-sm">
                                <Icon name="xCircle" className="w-5 h-5 text-red-600" />
                                <span className="font-semibold">Out of Stock</span>
                            </div>
                        )}
                        <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                            <p className="font-semibold text-slate-700 text-sm">Quantity:</p>
                            <div className="flex items-center rounded-xl border border-slate-300">
                                <button onClick={() => handleQuantityChange(-1)} className="p-3 text-slate-600 hover:text-amber-500 disabled:opacity-40" disabled={quantity <= 1}><Icon name="minus" className="w-4 h-4"/></button>
                                <span className="px-4 font-bold text-slate-800 text-lg">{quantity}</span>
                                <button onClick={() => handleQuantityChange(1)} className="p-3 text-slate-600 hover:text-amber-500 disabled:opacity-40" disabled={quantity >= product.stock}><Icon name="plus" className="w-4 h-4"/></button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                            <Button onClick={handleAddToCartClick} variant="outline" size="lg" className={`!border-purple-600 !text-purple-600 hover:!bg-purple-600 hover:!text-white`} iconLeft="shoppingBag" disabled={!isAvailable}>Add to Cart</Button>
                            <Button onClick={handleBuyNow} variant="primary" size="lg" disabled={!isAvailable}>Buy Now</Button>
                        </div>
                        <div className="text-sm text-slate-600 space-y-3 pt-4 border-t border-gray-200">
                            <div className="flex items-center"><Icon name="package" className={`w-5 h-5 mr-3 ${brandOrange.text}`}/><span>Fast Delivery to 58 Wilayas</span></div>
                            <div className="flex items-center"><Icon name="package" className={`w-5 h-5 mr-3 text-green-600`}/><span>Official 12-Month Warranty</span></div>
                        </div>
                    </div>
                </div>
                <section className="pt-16 mt-16 border-t border-gray-200/80">
                    <h2 className="text-2xl font-bold text-center mb-8 text-slate-800">Related Products</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {relatedProducts.map(related => (
                            <ProductCard key={related._id} product={related} />
                        ))}
                        {fallbackProducts.map(related => (
                            <ProductCard key={related._id} product={related} />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ProductDetailPage;