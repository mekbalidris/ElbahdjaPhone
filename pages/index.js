import React, { useState, useEffect, useRef, useMemo, Fragment } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import ProductCard from '../components/products/ProductCard';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { ChevronDown, Smartphone, Laptop, Headphones, Grid, Instagram, Facebook, Mail, MapPin, Phone } from 'lucide-react';

// --- Color Palette (Client Inspired - Tailwind classes) ---
const brandOrange = {
    bg: 'bg-red-600',
    text: 'text-red-600',
    border: 'border-red-600',
    hoverBg: 'hover:bg-red-700',
    gradientFrom: 'from-red-600',
    gradientTo: 'to-red-700',
    ring: 'focus:ring-red-500'
};

const brandPurple = {
    bg: 'bg-slate-950',
    text: 'text-slate-950',
    border: 'border-slate-800',
    hoverBg: 'hover:bg-slate-900',
    gradientFrom: 'from-slate-950',
    gradientTo: 'to-slate-900',
    ring: 'focus:ring-slate-500',
    hoverText: 'hover:text-slate-900'
};

// --- Main HomePage Component ---
const HomePage = ({ handleAddToCart }) => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showcaseVideoVisible, setShowcaseVideoVisible] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [dragDistance, setDragDistance] = useState(0);
    const router = useRouter();
    const { currentUser } = useAuth();
    const isAdmin = currentUser?.role === 'seller';

    // Pagination state
    const [featuredPage, setFeaturedPage] = useState(1);
    const [offerPage, setOfferPage] = useState(1);
    const productsPerPage = 4;

    const [heroVideoKey, setHeroVideoKey] = useState(Date.now());
    const [showcaseVideoKey, setShowcaseVideoKey] = useState(Date.now() + 1);

    const categories = useMemo(() => [
        { name: 'Phones', query: { category: 'phones' }, icon: 'smartphone', image: '/images/categories/phones.jpg', description: 'Latest smartphones from top brands' },
        { name: 'Laptops', query: { category: 'laptops' }, icon: 'laptop', image: '/images/categories/laptops.jpg', description: 'Powerful laptops for work and gaming' },
        { name: 'Headphones', query: { category: 'accessories' }, icon: 'headphones', image: '/images/categories/headphones.jpg', description: 'Premium audio accessories' },
        { name: 'Gadgets', query: { category: 'accessories' }, icon: 'grid', image: '/images/categories/gadgets.jpg', description: 'Smart gadgets and accessories' },
    ], []);

    // Debug logging for categories
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

    // Paginate products
    const featuredProducts = useMemo(() => products.filter(p => p.featured), [products]);
    const offerProducts = useMemo(() => products.filter(p => p.offer), [products]);

    const totalFeaturedPages = Math.ceil(featuredProducts.length / productsPerPage);
    const totalOfferPages = Math.ceil(offerProducts.length / productsPerPage);

    const paginatedFeaturedProducts = featuredProducts.slice(
        (featuredPage - 1) * productsPerPage,
        featuredPage * productsPerPage
    );
    const paginatedOfferProducts = offerProducts.slice(
        (offerPage - 1) * productsPerPage,
        offerPage * productsPerPage
    );

    const categorySliderRef = useRef(null);
    const autoSlideIntervalRef = useRef(null);

    // Add drag functionality
    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.pageX - categorySliderRef.current.offsetLeft);
        setScrollLeft(categorySliderRef.current.scrollLeft);
        setDragDistance(0);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - categorySliderRef.current.offsetLeft;
        const walk = (x - startX) * 2; // Scroll speed multiplier
        categorySliderRef.current.scrollLeft = scrollLeft - walk;
        setDragDistance(Math.abs(walk));
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleTouchStart = (e) => {
        setIsDragging(true);
        setStartX(e.touches[0].pageX - categorySliderRef.current.offsetLeft);
        setScrollLeft(categorySliderRef.current.scrollLeft);
        setDragDistance(0);
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;
        const x = e.touches[0].pageX - categorySliderRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        categorySliderRef.current.scrollLeft = scrollLeft - walk;
        setDragDistance(Math.abs(walk));
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    const handleCategoryClick = (category, e) => {
        if (dragDistance < 5) {
            router.push({ 
                pathname: '/products', 
                query: category.query 
            });
        }
    };

    // Auto slide functionality
    useEffect(() => {
        if (!isHovered && !isDragging) {
            autoSlideIntervalRef.current = setInterval(() => {
                if (categorySliderRef.current) {
                    const { scrollLeft, scrollWidth, clientWidth } = categorySliderRef.current;
                    const scrollAmount = 0.9;
                    
                    categorySliderRef.current.scrollLeft += scrollAmount;

                    if (scrollLeft >= scrollWidth - clientWidth) {
                        categorySliderRef.current.scrollLeft = 0;
                    }
                }
            }, 20);
        }

        return () => {
            if (autoSlideIntervalRef.current) {
                clearInterval(autoSlideIntervalRef.current);
            }
        };
    }, [isHovered, isDragging]);

    useEffect(() => {
        const sections = document.querySelectorAll('.section-animate');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fadeInUp');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        sections.forEach(section => observer.observe(section));
        return () => sections.forEach(section => observer.unobserve(section));
    }, [isLoading]);

    // Debug social media icons
    useEffect(() => {
        console.log('Rendering social media icons in top-right corner');
    }, []);

    // Pagination component
    const Pagination = ({ currentPage, totalPages, onPageChange }) => {
        const getPageNumbers = () => {
            const pages = [];
            const maxPagesToShow = 5;
            let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
            let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

            if (endPage - startPage + 1 < maxPagesToShow) {
                startPage = Math.max(1, endPage - maxPagesToShow + 1);
            }

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }

            return pages;
        };

        return (
            <div className="flex items-center justify-center space-x-2 py-4">
                <Button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    variant="ghost"
                    className={`disabled:opacity-50 disabled:cursor-not-allowed ${brandPurple.text} ${brandPurple.hoverBg}`}
                >
                    Previous
                </Button>
                {getPageNumbers().map(page => (
                    <Button
                        key={page}
                        onClick={() => onPageChange(page)}
                        variant={page === currentPage ? 'primary' : 'ghost'}
                        className={`min-w-[40px] ${page === currentPage ? `${brandOrange.bg} text-white` : `${brandPurple.text} hover:bg-gray-100`}`}
                    >
                        {page}
                    </Button>
                ))}
                <Button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    variant="ghost"
                    className={`disabled:opacity-50 disabled:cursor-not-allowed ${brandPurple.text} ${brandPurple.hoverBg}`}
                >
                    Next
                </Button>
            </div>
        );
    };

    if (isLoading && products.length === 0) {
        return (
            <div className="fixed inset-0 bg-gray-50 flex flex-col items-center justify-center z-[100]">
                <div className={`${brandOrange.text} text-4xl font-bold mb-4`}>Walid Phone</div>
                <div className={`w-16 h-16 border-4 ${brandOrange.border} border-t-transparent rounded-full animate-spin`}></div>
                <p className="text-slate-700 mt-4 text-lg">Loading...</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen font-sans text-slate-800 selection:bg-amber-500 selection:text-white overflow-x-hidden">
            {/* Screen 1: Hero Section */}
            <section className="min-h-screen flex flex-col items-center justify-center p-6 relative text-center pt-16">
                <Image 
                    src="/images/background.jpg" 
                    alt="Background" 
                    fill 
                    priority 
                    className="object-cover z-0"
                />
                <div className="absolute inset-0 bg-black opacity-30 z-10"></div> {/* Dark overlay for text readability */}

                {/* Logo Placeholder */}
                <div className="absolute top-6 left-6 z-20">
                    <div className={`${brandOrange.text} text-2xl font-bold`}>EL Bahdja Phone</div>
                </div>

                {/* Contact Information */}
                <div className="absolute top-6 right-10 mt-12 flex items-center gap-4 z-20">
                    <a href="https://www.google.com/maps/place/Walid+phone/@36.1664465,1.3350221,608m/data=!3m2!1e3!4b1!4m6!3m5!1s0x12840f0029054703:0xb3b6d49ec8f29932!8m2!3d36.1664429!4d1.3371872!16s%2Fg%2F11vr4lwwpv?entry=ttu" 
                       target="_blank" rel="noopener noreferrer"
                       className="text-white hover:text-red-400 transition-colors duration-300 flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        <span className="text-sm">Find Us</span>
                    </a>
                    <button 
                       onClick={() => {
                           navigator.clipboard.writeText('0558626516');
                           toast.success('Phone number copied successfully!');
                       }}
                       className="text-white hover:text-red-400 transition-colors duration-300 flex items-center gap-2 cursor-pointer">
                        <Phone className="w-5 h-5" />
                        <span className="text-sm">0558 62 65 16</span>
                    </button>
                </div>

                {/* Social Media Links */}
                <div className="absolute top-6 left-8 flex items-center gap-4 z-20 mt-12">
                    <a href="https://www.instagram.com/walidphone_/?hl=en" target="_blank" rel="noopener noreferrer"
                       className="text-white hover:text-red-400 transition-colors duration-300 flex items-center gap-2">
                        <Instagram className="w-5 h-5" />
                        <span className="text-sm">walidphone_</span>
                    </a>
                    <a href="https://www.facebook.com/p/Walid-phone-100057403661350/?locale=bg_BG" target="_blank" rel="noopener noreferrer"
                       className="text-white hover:text-red-400 transition-colors duration-300 flex items-center gap-2">
                        <Facebook className="w-5 h-5" />
                        <span className="text-sm">Walid phone</span>
                    </a>
                    <button 
                       onClick={() => {
                           navigator.clipboard.writeText('email@gmail.com');
                           toast.success('Email copied successfully!');
                       }}
                       className="text-white hover:text-red-400 transition-colors duration-300 flex items-center gap-2 cursor-pointer">
                        <Mail className="w-5 h-5" />
                        <span className="text-sm">email@gmail.com</span>
                    </button>
                </div>

                <div className="relative z-10 space-y-8 max-w-4xl animate-fadeInUp" style={{animationDelay: '0.2s'}}>
                    <div className="space-y-4">
                        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight text-white">
                            Welcome to <span className={`bg-clip-text text-transparent bg-gradient-to-r from-blue-200 ${brandOrange.gradientTo}`}>Walid Phone</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
                            Your trusted destination for premium smartphones, laptops, and accessories
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center pt-8">
                        <Button onClick={() => router.push('/products')} variant="primary" size="xl" 
                                className={`!${brandOrange.bg} ${brandOrange.hoverBg} !text-white transform hover:scale-105 transition-transform duration-300`}>
                            Explore Devices
                        </Button>
                        <Button 
                            onClick={() => {
                                const offersSection = document.getElementById('offers-section');
                                offersSection?.scrollIntoView({ behavior: 'smooth' });
                            }} 
                            variant="outlinePurple" 
                            size="xl" 
                            className={`bg-white text-black hover:bg-gray-300 transform hover:scale-105 transition-transform duration-300`}
                        >
                            Special Offers
                        </Button>
                    </div>
                </div>

                <div className="absolute bottom-10 text-gray-400 animate-bounce-slow z-10">
                    <ChevronDown className="w-10 h-10" />
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
                            className="flex overflow-x-hidden gap-6 pb-4 cursor-grab active:cursor-grabbing"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={(e) => {
                                setIsHovered(false);
                                handleMouseUp(e);
                            }}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                        >
                            {/* Duplicate categories for seamless loop */}
                            {[...categories, ...categories].map((category, index) => (
                                <div
                                    key={index}
                                    onClick={(e) => handleCategoryClick(category, e)}
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
                                    <div className="absolute bottom-0 left-6 right-0 p-8 text-white">
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
                    ) : paginatedOfferProducts.length > 0 ? (
                        <div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                                {paginatedOfferProducts.map((product, index) => (
                                    <div key={product._id} className="animate-fadeInUp" style={{animationDelay: `${0.3 + index * 0.1}s`}}>
                                        <ProductCard product={product} onAddToCart={handleAddToCart} />
                                    </div>
                                ))}
                            </div>
                            <Pagination
                                currentPage={offerPage}
                                totalPages={totalOfferPages}
                                onPageChange={setOfferPage}
                            />
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
                    ) : paginatedFeaturedProducts.length > 0 ? (
                        <div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                                {paginatedFeaturedProducts.map((product, index) => (
                                    <div key={product._id} className="animate-fadeInUp" style={{animationDelay: `${0.2 + index * 0.15}s`}}>
                                        <ProductCard product={product} onAddToCart={handleAddToCart} />
                                    </div>
                                ))}
                            </div>
                            <Pagination
                                currentPage={featuredPage}
                                totalPages={totalFeaturedPages}
                                onPageChange={setFeaturedPage}
                            />
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