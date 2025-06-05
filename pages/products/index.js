import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import ProductCard from '../../components/products/ProductCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Icon from '../../components/ui/Icon';
import { useRouter } from 'next/router';
import Button from '../../components/ui/Button';

// --- Color Palette (Client Inspired - Tailwind classes) ---
const brandOrange = {
    bg: 'bg-amber-500',
    text: 'text-amber-500',
    border: 'border-amber-500',
    hoverBg: 'hover:bg-amber-600',
    ring: 'focus:ring-amber-500',
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-orange-600',
};

const brandPurple = {
    bg: 'bg-purple-600',
    text: 'text-purple-600',
    border: 'border-purple-600',
    hoverBg: 'hover:bg-purple-700',
    ring: 'focus:ring-purple-500',
    gradientFrom: 'from-purple-600',
    gradientTo: 'to-indigo-700',
};

const CATEGORIES = [
    { value: 'all', label: 'All Categories', icon: 'grid' },
    { value: 'phones', label: 'Phones', icon: 'smartphone' },
    { value: 'accessories', label: 'Accessories', icon: 'headphones' },
];

const STEP = 1;
const MIN_PRICE = 0;
let MAX_PRICE = 1000; // Default max price, will be updated based on data

const ProductsPage = ({ handleAddToCart }) => {
    const [products, setProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]); // Store all products for filtering
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('createdAt_desc');
    const [isLoading, setIsLoading] = useState(true);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [overallMinPrice, setOverallMinPrice] = useState(0);
    const [overallMaxPrice, setOverallMaxPrice] = useState(2000);
    const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
    const router = useRouter();
    const { category } = router.query;

    // Determine actual max price from fetched products
    useEffect(() => {
        if (allProducts.length > 0) {
            const prices = allProducts.map(p => p.price).filter(p => typeof p === 'number');
            setOverallMinPrice(prices.length ? Math.min(...prices) : 0);
            setOverallMaxPrice(prices.length ? Math.max(...prices) : 2000);
            setPriceRange({min: '', max: ''}); // Reset price range when new products are loaded
        }
    }, [allProducts]);

    useEffect(() => {
        setIsLoading(true);
        let url = '/api/products';
        fetch(url)
            .then(res => res.json())
            .then(data => {
                setAllProducts(data); // Store all products
                applyFilters(data); // Apply initial filters
                setIsLoading(false);
            })
            .catch(() => {
                setIsLoading(false);
                toast.error('Failed to fetch products');
            });
    }, []);

    // Apply all filters whenever any filter changes
    useEffect(() => {
        applyFilters(allProducts);
    }, [searchTerm, selectedCategory, sortBy, priceRange, showOnlyAvailable, allProducts]);

    const applyFilters = (data) => {
        let filtered = [...data];

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                p.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply category filter
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        // Apply price range filter
        if (priceRange.min && priceRange.max) {
            filtered = filtered.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);
        }

        // Apply availability filter
        if (showOnlyAvailable) {
            filtered = filtered.filter(p => p.stock > 0);
        }

        // Apply sorting
        filtered.sort((a, b) => {
            const [field, order] = sortBy.split('_');
            let comparison = 0;
            if (a[field] < b[field]) comparison = -1;
            if (a[field] > b[field]) comparison = 1;
            return order === 'desc' ? comparison * -1 : comparison;
        });

        setProducts(filtered);
    };

    useEffect(() => {
        if (category && category !== selectedCategory) {
            setSelectedCategory(category);
        }
    }, [category]);

    const sortOptions = [
        { value: 'createdAt_desc', label: 'Newest First' },
        { value: 'price_asc', label: 'Price: Low to High' },
        { value: 'price_desc', label: 'Price: High to Low' },
        { value: 'name_asc', label: 'Name: A to Z' },
        { value: 'name_desc', label: 'Name: Z to A' },
    ];

    const handlePriceChange = (type, value) => {
        const numValue = value === '' ? '' : parseFloat(value);
        setPriceRange(prev => ({ ...prev, [type]: numValue }));
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedCategory('all');
        setSortBy('createdAt_desc');
        setPriceRange({ min: '', max: '' });
        setShowOnlyAvailable(false);
        toast.success("Filters Reset!");
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className={`bg-gradient-to-r ${brandOrange.gradientFrom} ${brandPurple.gradientTo} py-16 px-4 sm:px-6 lg:px-8`}>
                <div className="max-w-7xl mx-auto">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-white mb-4">Discover Our Products</h1>
                        <p className="text-xl text-amber-100 mb-8">Find exactly what you&apos;re looking for</p>
                        <div className="max-w-2xl mx-auto">
                            <div className="relative">
                                <Input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 text-lg rounded-xl shadow-lg"
                                />
                                <Icon name="search" className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Category Pills */}
                <div className="mb-8">
                    <div className="flex flex-wrap gap-4 justify-center">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.value}
                                onClick={() => setSelectedCategory(cat.value)}
                                className={`flex items-center px-6 py-3 rounded-full transition-all duration-200 ${
                                    selectedCategory === cat.value
                                        ? `${brandOrange.bg} text-white shadow-lg scale-105`
                                        : `bg-white text-slate-700 hover:${brandOrange.text} hover:bg-amber-500/10`
                                }`}
                            >
                                <Icon name={cat.icon} className="w-5 h-5 mr-2" />
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filter and Sort Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 space-y-4 sm:space-y-0">
                    <div className="flex items-center space-x-4">
                        <Button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            variant="outlinePurple"
                            className="flex items-center"
                        >
                            <Icon name="filter" className="w-5 h-5 mr-2" />
                            Filters
                        </Button>
                        <span className="text-slate-600">
                            {products.length} {products.length === 1 ? 'product' : 'products'} found
                        </span>
                    </div>
                    <Select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        options={sortOptions}
                        className="w-full sm:w-48"
                    />
                </div>

                {/* Filter Panel */}
                {isFilterOpen && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 animate-fadeIn border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Price Range Filter */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Price Range</h3>
                                <div className="flex flex-col space-y-4">
                                    <div>
                                        <label className="block text-sm text-slate-700 font-medium mb-1">Min Price (DA)</label>
                                        <Input
                                            type="number"
                                            placeholder={overallMinPrice.toFixed(2)}
                                            value={priceRange.min}
                                            onChange={e => handlePriceChange('min', e.target.value)}
                                            min={overallMinPrice}
                                            step="10"
                                            className="!py-2.5"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-700 font-medium mb-1">Max Price (DA)</label>
                                        <Input
                                            type="number"
                                            placeholder={overallMaxPrice.toFixed(2)}
                                            value={priceRange.max}
                                            onChange={e => handlePriceChange('max', e.target.value)}
                                            min={priceRange.min || 0}
                                            step="10"
                                            className="!py-2.5"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Availability Filter */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Availability</h3>
                                <label className="inline-flex items-center">
                                    <input type="checkbox" className={`form-checkbox h-5 w-5 ${brandOrange.text} rounded focus:ring-0`} checked={showOnlyAvailable} onChange={(e) => setShowOnlyAvailable(e.target.checked)} />
                                    <span className="ml-2 text-slate-700">Only show available products</span>
                                </label>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <Button variant="outlineOrange" onClick={handleResetFilters}>
                                Reset Filters
                            </Button>
                        </div>
                    </div>
                )}

                {/* Products Grid */}
                {isLoading ? (
                    <div className="flex flex-col justify-center items-center h-[40vh]">
                        <LoadingSpinner size="lg" />
                        <p className="mt-4 text-slate-600 text-lg">Searching EL Bahdja Collection...</p>
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map(product => (
                            <div key={product._id} className="animate-fadeIn">
                                <ProductCard 
                                    product={product} 
                                    onAddToCart={handleAddToCart}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 md:py-24 bg-gray-50 rounded-2xl shadow-md section-animate min-h-[40vh] flex flex-col justify-center items-center">
                        <Icon name="package" className={`w-16 h-16 ${brandPurple.text} mx-auto mb-5 opacity-60`} />
                        <h2 className="text-2xl font-semibold text-slate-700 mb-2">No Treasures Found</h2>
                        <p className="text-gray-600">Try adjusting your search or filters to find what you&apos;re looking for.</p>
                        <Button onClick={handleResetFilters} variant="primary" className="mt-8">
                            Reset Filters & Search Again
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductsPage;