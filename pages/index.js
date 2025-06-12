import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import ProductCard from '../components/products/ProductCard';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { ChevronDown, Smartphone, Laptop, Headphones, Grid } from 'lucide-react';

// --- Color Palette (Client Inspired - Tailwind classes) ---
const brandOrange = {
    bg: 'bg-amber-500',
    text: 'text-amber-500',
    border: 'border-amber-500',
    hoverBg: 'hover:bg-amber-600',
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-orange-600',
    ring: 'focus:ring-amber-500'
};

const brandPurple = {
    bg: 'bg-purple-600',
    text: 'text-purple-600',
    border: 'border-purple-600',
    hoverBg: 'hover:bg-purple-700',
    gradientFrom: 'from-purple-600',
    gradientTo: 'to-indigo-700',
    ring: 'focus:ring-purple-600'
};

// --- Main HomePage Component ---
const HomePage = ({ handleAddToCart }) => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showcaseVideoVisible, setShowcaseVideoVisible] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const router = useRouter();
    const { currentUser } = useAuth();
    const isAdmin = currentUser?.role === 'seller';

    const [heroVideoKey, setHeroVideoKey] = useState(Date.now());
    const [showcaseVideoKey, setShowcaseVideoKey] = useState(Date.now() + 1);

    const categories = useMemo(() => [
        { 
            name: 'All Phones', 
            query: { category: 'phones' }, 
            image: '/images/categories/phones.jpg',
            description: 'Latest smartphones from top brands'
        },
        { 
            name: 'Laptops', 
            query: { category: 'laptops' }, 
            image: '/images/categories/laptops.jpg',
            description: 'Powerful laptops for work and gaming'
        },
        { 
            name: 'Headphones', 
            query: { category: 'accessories', subCategory: 'headphones' }, 
            image: '/images/categories/headphones.jpg',
            description: 'Premium audio accessories'
        },
        { 
            name: 'Gadgets', 
            query: { category: 'accessories' }, 
            image: '/images/categories/gadgets.jpg',
            description: 'Smart gadgets and accessories'
        },
    ], []);

    // Add debug logging for categories
    useEffect(() => {
        console.log('Categories data:', categories);
    }, [categories]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Test image accessibility
                const testImagePaths = categories.map(cat => cat.image);
                console.log('Testing image paths:', testImagePaths);
                
                for (const path of testImagePaths) {
                    try {
                        const response = await fetch(path);
                        console.log(`Image ${path} status:`, response.status);
                        if (!response.ok) {
                            console.error(`Failed to load image ${path}:`, response.statusText);
                        }
                    } catch (error) {
                        console.error(`Error fetching image ${path}:`, error);
                    }
                }

                // Fetch products
                const productsRes = await fetch('/api/products');
                if (!productsRes.ok) {
                    throw new Error('Failed to fetch products');
                }
                const productsData = await productsRes.json();
                setProducts(productsData);

                // Fetch showcase visibility
                const showcaseRes = await fetch('/api/showcase');
                if (!showcaseRes.ok) {
                    throw new Error('Failed to fetch showcase visibility');
                }
                const showcaseData = await showcaseRes.json();
                setShowcaseVideoVisible(showcaseData.visible);
                setHeroVideoKey(Date.now());
                setShowcaseVideoKey(Date.now() + 1);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error(error.message || 'Failed to load data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const featuredProducts = useMemo(() => products.filter(p => p.featured).slice(0, 4), [products]);
    const offerProducts = useMemo(() => products.filter(p => p.offer).slice(0, 4), [products]);

    const categorySliderRef = useRef(null);
    const autoSlideIntervalRef = useRef(null);

    // Auto slide functionality
    useEffect(() => {
        if (!isHovered) {
            autoSlideIntervalRef.current = setInterval(() => {
                if (categorySliderRef.current) {
                    const { scrollLeft, scrollWidth, clientWidth } = categorySliderRef.current;
                    const scrollAmount = 0.9; // Small amount for smooth movement
                    
                    categorySliderRef.current.scrollLeft += scrollAmount;

                    // When we reach the end, reset to start
                    if (scrollLeft >= scrollWidth - clientWidth) {
                        categorySliderRef.current.scrollLeft = 0;
                    }
                }
            }, 20); // Update every 20ms for smooth movement
        }

        return () => {
            if (autoSlideIntervalRef.current) {
                clearInterval(autoSlideIntervalRef.current);
            }
        };
    }, [isHovered]);

    useEffect(() => {
        const sections = document.querySelectorAll('.section-animate');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fadeInUp');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        sections.forEach(section => observer.observe(section));
        return () => sections.forEach(section => observer.unobserve(section));
    }, [isLoading]);

    if (isLoading && products.length === 0) {
        return (
            <div className="fixed inset-0 bg-gray-50 flex flex-col items-center justify-center z-[100]">
                <div className={`${brandOrange.text} text-4xl font-bold mb-4`}>EL Bahdja Phone</div>
                <div className={`w-16 h-16 border-4 ${brandOrange.border} border-t-transparent rounded-full animate-spin`}></div>
                <p className="text-slate-700 mt-4 text-lg">Loading...</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen font-sans text-slate-800 selection:bg-amber-500 selection:text-white overflow-x-hidden">
            {/* Screen 1: Hero Section */}
            <section className="min-h-screen flex flex-col items-center justify-center p-6 relative text-center bg-gradient-to-br from-slate-900 via-slate-800 to-black pt-16">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-black"></div>
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                <div className="relative z-10 space-y-8 max-w-4xl animate-fadeInUp" style={{animationDelay: '0.2s'}}>
                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight text-white">
                        Welcome to <span className={`bg-clip-text text-transparent bg-gradient-to-r ${brandOrange.gradientFrom} ${brandPurple.gradientTo}`}>EL Bahdja Phone</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
                        Discover the latest smartphones, laptops, and accessories at unbeatable prices
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center pt-8">
                        <Button onClick={() => router.push('/products')} variant="primary" size="xl" className={`!${brandOrange.bg} ${brandOrange.hoverBg} !text-white`}>
                            Explore Devices
                        </Button>
                        <Button 
                            onClick={() => {
                                const offersSection = document.getElementById('offers-section');
                                offersSection?.scrollIntoView({ behavior: 'smooth' });
                            }} 
                            variant="outlinePurple" 
                            size="xl" 
                            className={`bg-white text-black hover:bg-gray-300`}
                        >
                            Special Offers
                        </Button>
                    </div>
                </div>
                <div className="absolute bottom-10 text-gray-400 animate-bounce-slow z-10">
                    <Icon name="chevronDown" className="w-10 h-10" path="m19.5 8.25-7.5 7.5-7.5-7.5"/>
                </div>
            </section>

            {/* Screen 2: Category Slider */}
            <section className="py-16 md:py-24 bg-gray-50 section-animate overflow-hidden">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className={`text-3xl md:text-4xl font-bold ${brandPurple.text} tracking-tight`}>Shop by Category</h2>
                        <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">Browse our wide selection of products by category</p>
                    </div>
                    
                    {/* Slider Container */}
                    <div className="relative">
                        {/* Slider */}
                        <div 
                            ref={categorySliderRef}
                            className="flex overflow-x-hidden gap-6 pb-4"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            {/* Duplicate categories for seamless loop */}
                            {[...categories, ...categories].map((category, index) => (
                                <div
                                    key={index}
                                    onClick={() => router.push({ 
                                        pathname: '/products', 
                                        query: category.query 
                                    })}
                                    className="group relative flex-none w-[80vw] sm:w-[60vw] md:w-[45vw] lg:w-[30vw] h-[400px] bg-white rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                                    style={{animationDelay: `${index * 100}ms`}}
                                >
                                    <div className="relative w-full h-full">
                                        <Image 
                                            src={category.image} 
                                            alt={category.name}
                                            fill
                                            sizes="(max-width: 768px) 80vw, (max-width: 1200px) 45vw, 30vw"
                                            className="object-cover transform group-hover:scale-110 transition-transform duration-500"
                                            priority={index === 0}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                                        <h3 className="text-2xl font-bold mb-3">{category.name}</h3>
                                        <p className="text-base text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            {category.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Screen 3: Offers & Showcase Video */}
            <section id="offers-section" className="py-16 md:py-24 bg-gray-50 section-animate">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className={`text-3xl md:text-4xl font-bold ${brandOrange.text} tracking-tight`}>Hot Deals</h2>
                        <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">Check out our latest offers and discounts</p>
                    </div>
                    
                    {showcaseVideoVisible && (
                        <div className="mb-16 md:mb-20 relative animate-fade-in flex justify-center">
                            <div className="bg-black rounded-2xl shadow-2xl overflow-hidden max-h-[60vh] max-w-full">
                                <video
                                    className="w-full h-full object-contain"
                                    loop
                                    playsInline
                                    controls
                                    controlsList="nodownload"
                                    style={{ borderRadius: '1rem' }}
                                >
                                    <source src="/api/showcase/video" type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                            {isAdmin && (
                                <div className="absolute -top-16 right-0 z-10">
                                    <Button onClick={() => router.push('/admin/homepage-management')} variant="secondary" size="sm" className="shadow-md">
                                        Manage Homepage
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {isLoading && !offerProducts.length ? (
                        <div className="flex justify-center items-center h-64"><div className={`w-12 h-12 border-4 ${brandOrange.border} border-t-transparent rounded-full animate-spin`}></div></div>
                    ) : offerProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                            {offerProducts.map((product, index) => (
                                <div key={product._id} className="animate-fadeInUp" style={{animationDelay: `${0.3 + index * 0.1}s`}}>
                                    <ProductCard product={product} onAddToCart={handleAddToCart} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-slate-500 text-lg py-8">No special offers available right now. Check back soon!</p>
                    )}
                    <div className="text-center mt-12 md:mt-16">
                        <Button 
                            onClick={() => router.push('/products?filter=offers')} 
                            variant="primary" 
                            size="lg"
                            className={`${brandOrange.bg} ${brandOrange.hoverBg} !text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300`}
                        >
                            View All Deals
                        </Button>
                    </div>
                </div>
            </section>

            {/* Screen 4: Featured Products */}
            <section className="py-16 md:py-24 bg-white section-animate">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className={`text-3xl md:text-4xl font-bold ${brandPurple.text} tracking-tight`}>Featured Selections</h2>
                        <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">Our handpicked selection of the best products</p>
                    </div>
                    {isLoading && !featuredProducts.length ? (
                        <div className="flex justify-center items-center h-64"><div className={`w-12 h-12 border-4 ${brandPurple.border} border-t-transparent rounded-full animate-spin`}></div></div>
                    ) : featuredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                            {featuredProducts.map((product, index) => (
                                <div key={product._id} className="animate-fadeInUp" style={{animationDelay: `${0.2 + index * 0.15}s`}}>
                                    <ProductCard product={product} onAddToCart={handleAddToCart} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-slate-500 text-lg py-8">Curating our featured products... Please check back soon!</p>
                    )}
                </div>
            </section>

            <style jsx global>{`
                html { scroll-behavior: smooth; }
                body { 
                    background-color: #f8fafc;
                    color: #1e293b;
                }
                .font-sans {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
                }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(25px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeInUp { animation: fadeInUp 0.7s ease-out forwards; opacity:0; }
                
                @keyframes videoFadeIn {
                    from { opacity: 0; }
                    to { opacity: 0.3; }
                }
                .animate-video-fade-in { animation: videoFadeIn 1.5s 0.2s ease-out forwards; }

                @keyframes bounceSlow {
                    0%, 100% { transform: translateY(-10%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
                    50% { transform: translateY(0); animation-timing-function: cubic-bezier(0,0,0.2,1); }
                }
                .animate-bounce-slow { animation: bounceSlow 2.5s infinite; }
            `}</style>
        </div>
    );
};

export default HomePage; 