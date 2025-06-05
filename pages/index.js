import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import ProductCard from '../components/products/ProductCard';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

// --- Color Palette (Client Inspired - Tailwind classes) ---
const brandOrange = {
    bg: 'bg-amber-500',
    text: 'text-amber-500',
    border: 'border-amber-500',
    hoverBg: 'hover:bg-amber-600',
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-orange-600',
};

const brandPurple = {
    bg: 'bg-purple-600',
    text: 'text-purple-600',
    border: 'border-purple-600',
    hoverBg: 'hover:bg-purple-700',
    gradientFrom: 'from-purple-600',
    gradientTo: 'to-indigo-700',
};

// --- Main HomePage Component ---
const HomePage = ({ handleAddToCart }) => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showcaseVideoVisible, setShowcaseVideoVisible] = useState(true);
    const router = useRouter();
    const { currentUser } = useAuth();
    const isAdmin = currentUser?.role === 'seller';

    const [heroVideoKey, setHeroVideoKey] = useState(Date.now());
    const [showcaseVideoKey, setShowcaseVideoKey] = useState(Date.now() + 1);

    const categories = [
        { name: 'All Phones', query: { category: 'smartphones' }, icon: 'smartphone' },
        { name: 'Laptops', query: { category: 'laptops' }, icon: 'laptop' },
        { name: 'Headphones', query: { category: 'accessories', subCategory: 'headphones' }, icon: 'headphones' },
        { name: 'Gadgets', query: { category: 'accessories' }, icon: 'grid' },
    ];

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
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
    const scrollCategory = (direction) => {
        if (categorySliderRef.current) {
            const scrollAmount = categorySliderRef.current.offsetWidth * 0.75;
            categorySliderRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

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
                <p className="text-slate-700 mt-4 text-lg">Loading brilliance...</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen font-sans text-slate-800 selection:bg-amber-500 selection:text-white overflow-x-hidden">
            {/* Screen 1: Hero Section */}
            <section className="min-h-screen flex flex-col items-center justify-center p-6 relative text-center bg-gradient-to-br from-slate-900 via-slate-800 to-black">
                <div className="relative z-10 space-y-8 max-w-4xl animate-fadeInUp" style={{animationDelay: '0.3s'}}>
                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight text-white">
                        Welcome to <span className={`bg-clip-text text-transparent bg-gradient-to-r ${brandOrange.gradientFrom} ${brandPurple.gradientTo}`}>EL Bahdja Phone</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
                        Your destination for cutting-edge mobile technology and premium accessories. Discover innovation.
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
                            className={`!${brandPurple.text} !${brandPurple.border} hover:!${brandPurple.bg} hover:!text-white`}
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
            <section className="py-16 md:py-24 bg-white section-animate">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className={`text-3xl md:text-4xl font-bold ${brandPurple.text} tracking-tight`}>Shop By Category</h2>
                        <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">Find exactly what you&apos;re looking for with ease.</p>
                    </div>
                    <div className="flex justify-center items-center">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
                            {categories.map((category, index) => (
                                <div
                                    key={index}
                                    onClick={() => router.push({ pathname: '/products', query: category.query })}
                                    className="w-full h-52 md:h-60 bg-gray-50 rounded-2xl flex flex-col items-center justify-center text-center p-5 cursor-pointer group hover:bg-gradient-to-br hover:from-amber-500 hover:to-orange-600 hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 hover:border-transparent"
                                    style={{animationDelay: `${index * 100}ms`}}
                                >
                                    <Icon name={category.icon} className={`w-12 h-12 md:w-14 md:h-14 mb-4 ${brandOrange.text} group-hover:text-white transition-colors duration-300 transform group-hover:scale-110`} />
                                    <p className="text-md md:text-lg font-semibold text-slate-700 group-hover:text-white transition-colors duration-300">{category.name}</p>
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
                        <h2 className={`text-3xl md:text-4xl font-bold ${brandOrange.text} tracking-tight`}>Hot Deals & Showcase</h2>
                        <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">Grab limited-time offers and see our products in action.</p>
                    </div>
                    
                    {showcaseVideoVisible && (
                        <div className="mb-16 md:mb-20 relative animate-fade-in">
                            <div className="aspect-video bg-black rounded-2xl shadow-2xl overflow-hidden max-w-4xl mx-auto">
                                <video
                                    className="w-full h-full object-cover"
                                    muted
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
                        <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">Our top picks, curated just for you.</p>
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