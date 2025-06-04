import React, { useState, useEffect, useRef } from 'react';

// --- Project Imports ---
import { useRouter } from 'next/router';
import Button from '../components/ui/Button'; // Assuming this path is correct
import Icon from '../components/ui/Icon';     // Assuming this path is correct
import ProductCard from '../components/products/ProductCard'; // Assuming this path is correct
// import { useAuth } from '../../context/AuthContext'; // Not used in this component, but kept in mind
import { toast } from 'react-hot-toast'; // Assuming react-hot-toast is used in the project

// --- Main HomePage Component ---
const HomePage = ({ handleAddToCart }) => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter(); // Using the real router

    // Categories for the slider - using icon names compatible with your Icon component
    const categories = [
        { name: 'All Products', brand: null, category: null, icon: 'grid' }, // Assuming 'grid' icon exists
        { name: 'Smartphones', category: 'smartphones', brand: null, icon: 'smartphone' }, // Assuming 'smartphone' icon exists
        { name: 'Laptops', category: 'laptops', brand: null, icon: 'laptop' }, // Assuming 'laptop' icon exists
        { name: 'Accessories', category: 'accessories', brand: null, icon: 'headphones' }, // Assuming 'headphones' icon exists
        // Add more categories/brands as needed, using icon names compatible with your Icon component
    ];

    useEffect(() => {
        setIsLoading(true);
        const fetchProducts = async () => {
            try {
                const res = await fetch('/api/products');
                if (!res.ok) {
                    // Check if the response body can be parsed as JSON for a specific error message
                    const errorData = await res.json().catch(() => ({ error: 'Failed to fetch products' }));
                    throw new Error(errorData.error || 'Failed to fetch products');
                }
                const data = await res.json();
                setProducts(data);
            } catch (error) {
                console.error('Error fetching products:', error);
                // Show a toast error using react-hot-toast
                toast.error(error.message || 'Failed to load products');
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const featuredProducts = products.filter(p => p.featured).slice(0, 4);
    const offerProducts = products.filter(p => p.offer).slice(0, 3);

    const categorySliderRef = useRef(null);

    const scrollCategory = (direction) => {
        if (categorySliderRef.current) {
            const scrollAmount = categorySliderRef.current.offsetWidth * 0.8; // Scroll by 80% of visible width
            categorySliderRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans text-gray-800">
            {/* Screen 1: Hero Section */}
            <section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-30">
                    {/* Placeholder for a large, high-quality iPhone image or abstract tech background */}
                    {/* Replace with a real image relevant to your site if possible */}
                    <img
                        src="https://placehold.co/1920x1080/000000/111111?text=Your+Awesome+Tech+Image"
                        alt="Featured Tech Background"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="relative z-10 text-center space-y-8 max-w-3xl">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
                        Welcome to <span className="text-blue-400">Your Store Name</span> {/* Replace with your store name */}
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-300 max-w-xl mx-auto">
                        Experience the future of technology. Discover cutting-edge products and premium accessories. {/* Replace with your slogan */}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Button
                            onClick={() => router.push('/products')}
                            variant="primary"
                            size="xl"
                            className="w-full sm:w-auto shadow-lg hover:shadow-xl transform hover:scale-105"
                            iconRight={<Icon name="arrowRight" className="w-6 h-6"/>}
                        >
                            Explore Products
                        </Button>
                        <Button
                            onClick={() => router.push('/products?filter=offers')}
                            variant="outline"
                            size="xl"
                            className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-gray-900 shadow-lg hover:shadow-xl transform hover:scale-105"
                            iconRight={<Icon name="chevronRight" className="w-6 h-6"/>}
                        >
                            View Offers
                        </Button>
                    </div>
                </div>
                <div className="absolute bottom-10 text-gray-400 animate-bounce">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                </div>
            </section>

            {/* Screen 2: Category/Brand Slider */}
            <section className="py-16 md:py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Shop by Category</h2>
                        <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">Find exactly what you&apos;re looking for, from top brands to essential accessories.</p>
                    </div>

                    <div className="relative">
                        <div ref={categorySliderRef} className="flex space-x-4 md:space-x-6 overflow-x-auto pb-4 scrollbar-hide">
                            {categories.map((category, index) => (
                                <div
                                    key={index}
                                    onClick={() => router.push(category.brand ? `/products?brand=${category.brand}` : (category.category ? `/products?category=${category.category}`: '/products'))}
                                    className="flex-shrink-0 w-40 h-40 md:w-48 md:h-48 bg-gray-100 rounded-xl flex flex-col items-center justify-center text-center p-4 cursor-pointer group hover:bg-blue-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200"
                                >
                                    <Icon name={category.icon} className="w-12 h-12 mb-2 text-gray-700 group-hover:text-white transition-colors" />
                                    <p className="text-sm md:text-base font-semibold text-gray-700 group-hover:text-white transition-colors">{category.name}</p>
                                </div>
                            ))}
                        </div>
                         {/* Scroll Buttons for Slider - visible on larger screens */}
                        <button
                            onClick={() => scrollCategory('left')}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 p-2 bg-white/80 hover:bg-white rounded-full shadow-md hidden md:block transition-opacity hover:opacity-100 opacity-70"
                            aria-label="Scroll left"
                        >
                            <Icon name="chevronLeft" className="w-6 h-6 text-gray-700"/> {/* Assuming 'chevronLeft' icon exists */}
                        </button>
                        <button
                            onClick={() => scrollCategory('right')}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-2 bg-white/80 hover:bg-white rounded-full shadow-md hidden md:block transition-opacity hover:opacity-100 opacity-70"
                            aria-label="Scroll right"
                        >
                            <Icon name="chevronRight" className="w-6 h-6 text-gray-700"/> {/* Assuming 'chevronRight' icon exists */}
                        </button>
                    </div>
                </div>
            </section>

            {/* Screen 3: Offers & Showcase */}
            <section className="py-16 md:py-24 bg-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Hot Deals & New Arrivals</h2>
                        <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">Don&apos;t miss out on our latest promotions and newest tech.</p>
                    </div>

                    {/* Video Showcase Placeholder - Replace with real video embed if needed */}
                    <div className="mb-16 md:mb-20">
                        <div className="aspect-video bg-gray-800 rounded-xl shadow-2xl flex items-center justify-center text-white relative overflow-hidden group">
                             {/* Placeholder for a video thumbnail */}
                            <img
                                src="https://placehold.co/1280x720/1F2937/4B5563?text=Product+Showcase+Video"
                                alt="Video placeholder"
                                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity"
                            />
                            <div className="relative z-10 text-center">
                                <Icon name="playCircle" className="w-20 h-20 md:w-28 md:h-28 text-white/80 group-hover:text-white group-hover:scale-110 transition-all duration-300 cursor-pointer"/> {/* Assuming 'playCircle' icon exists */}
                                <p className="mt-2 text-lg font-medium">Watch Our Latest Review</p>
                            </div>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            <p className="ml-3 text-gray-600">Loading Offers...</p>
                        </div>
                    ) : offerProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                            {offerProducts.map(product => (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                    onAddToCart={handleAddToCart}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-600 text-lg">No special offers available at the moment. Check back soon!</p>
                    )}
                    <div className="text-center mt-12 md:mt-16">
                        <Button
                            onClick={() => router.push('/products?filter=offers')} // Link to products page filtered by offers
                            variant="outline"
                            size="lg"
                            className="border-blue-600 text-blue-600 hover:bg-blue-50"
                            iconRight={<Icon name="chevronRight" className="w-5 h-5"/>} // Assuming 'chevronRight' icon exists
                        >
                            View All Offers
                        </Button>
                    </div>
                </div>
            </section>

            {/* Featured Products Section */}
            <section className="py-16 md:py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 sm:text-4xl">
                            Featured Products
                        </h2>
                        <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
                            Handpicked for you. Our most popular and top-rated items.
                        </p>
                    </div>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            <p className="ml-3 text-gray-600">Loading Products...</p>
                        </div>
                    ) : featuredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
                            {featuredProducts.map(product => (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                    onAddToCart={handleAddToCart}
                                />
                            ))}
                        </div>
                    ) : (
                         <p className="text-center text-gray-600 text-lg">No featured products to display currently.</p>
                    )}
                </div>
            </section>

            {/* Footer (Simple Placeholder) */}
            <footer className="py-12 bg-gray-800 text-gray-300 text-center">
                <p>&copy; {new Date().getFullYear()} Your Store Name. All rights reserved.</p> {/* Replace with your store name */}
                <p className="text-sm mt-1">Discover the Best in Technology.</p> {/* Replace with your slogan */}
            </footer>
            <style jsx global>{`
                html {
                    scroll-behavior: smooth;
                }
                .font-sans { // Ensure Inter or a similar clean font is prioritized if used
                    // font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;  /* IE and Edge */
                    scrollbar-width: none;  /* Firefox */
                }
            `}</style>
        </div>
    );
};

export default HomePage; 