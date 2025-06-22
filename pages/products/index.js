import React, { useState, useEffect, useMemo, Fragment, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Button from '../../components/ui/Button';
import ProductCard from '../../components/products/ProductCard';
import Icon from '../../components/ui/Icon';
import { X, SlidersHorizontal, ChevronRight, ShoppingBag, Search, Frown, ChevronDown, Check } from 'lucide-react';

// --- Color Palette (Client Inspired) ---
const brandOrange = { text: 'text-amber-500', border: 'border-amber-500', ring: 'focus:ring-amber-500', bg: 'bg-amber-500', hoverBg: 'hover:bg-amber-600' };
const brandPurple = { text: 'text-purple-600', border: 'border-purple-600', hoverBg: 'hover:bg-purple-700', bg: 'bg-purple-600' };

const LoadingSpinner = () => <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>;

const StyledSelect = ({ value, onChange, options, label }) => (
    <div>
        {label && <label className="text-sm font-semibold text-slate-800 block mb-2">{label}</label>}
        <div className="relative">
            <select value={value} onChange={e => onChange(e.target.value)} className={`w-full appearance-none bg-white border border-slate-300 rounded-xl py-2.5 pl-4 pr-10 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 ${brandOrange.ring}`}>
                {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <Icon name="chevronDown" className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
    </div>
);

const Input = React.forwardRef((props, ref) => <input ref={ref} {...props} className="w-full px-4 py-2 text-sm text-slate-800 bg-white border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition placeholder:text-slate-400" />);
Input.displayName = "Input";

const StyledCheckbox = ({ id, label, checked, onChange }) => (
    <label htmlFor={id} className="flex items-center space-x-3 cursor-pointer group">
        <div className={`w-5 h-5 border-2 rounded-md flex items-center justify-center transition-all duration-200 ${checked ? `${brandOrange.bg} ${brandOrange.border}` : 'border-slate-300 group-hover:border-amber-400'}`}>
            {checked && <Check className="w-3.5 h-3.5 text-white stroke-2" />}
        </div>
        <span className="text-sm text-slate-700 select-none">{label}</span>
    </label>
);

const FilterDrawer = ({ isOpen, onClose, children }) => (
    <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[70]" onClose={onClose}>
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"><div className="fixed inset-0 bg-black bg-opacity-40" /></Transition.Child>
            <div className="fixed inset-0 overflow-hidden"><div className="absolute inset-0 overflow-hidden"><div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
                <Transition.Child as={Fragment} enter="transform transition ease-in-out duration-300" enterFrom="translate-x-full" enterTo="translate-x-0" leave="transform transition ease-in-out duration-300" leaveFrom="translate-x-0" leaveTo="translate-x-full">
                    <Dialog.Panel className="pointer-events-auto w-screen max-w-sm"><div className="flex h-full flex-col overflow-y-scroll bg-gray-50 shadow-xl"><div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-white border-b"><Dialog.Title className="text-lg font-bold text-slate-800 flex items-center"><Icon name="slider" className={`w-5 h-5 mr-2 ${brandOrange.text}`} /> Filters</Dialog.Title><button type="button" className="rounded-full p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100" onClick={onClose}><X className="h-6 w-6" /></button></div><div className="relative mt-6 flex-1 px-4 sm:px-6">{children}</div></div></Dialog.Panel>
                </Transition.Child>
            </div></div></div>
        </Dialog>
    </Transition.Root>
);

// Add a hook to detect mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  return isMobile;
}

const ProductsPage = ({ handleAddToCart }) => {
    const router = useRouter();
    
    const [allProducts, setAllProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [displayedProducts, setDisplayedProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const productsPerPage = 9;
    
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [sortBy, setSortBy] = useState('createdAt_desc');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
    const [minPriceLimit, setMinPriceLimit] = useState(0);
    const [maxPriceLimit, setMaxPriceLimit] = useState(2000);

    // Intersection Observer for infinite scroll
    const observer = useRef();
    const lastProductElementRef = useCallback(node => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [isLoading, hasMore]);

    const isMobile = useIsMobile();

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/products');
                if (!response.ok) throw new Error('Failed to fetch products');
                const data = await response.json();
                setAllProducts(data);
                
                // Calculate price limits
                const prices = data.map(p => p.price);
                setMinPriceLimit(Math.min(...prices));
                setMaxPriceLimit(Math.max(...prices));

                // Set initial filters from URL
                if (router.isReady) {
                    setSearchTerm(router.query.search || '');
                    setSelectedCategory(router.query.category || 'all');
                    setSelectedBrand(router.query.brand || '');
                }
            } catch (error) {
                console.error('Error fetching products:', error);
                toast.error('Failed to load products');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, [router.isReady, router.query]);

    // Filter and sort products
    const filteredAndSortedProducts = useMemo(() => {
        return allProducts
            .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
            .filter(p => selectedBrand === '' || p.brand === selectedBrand)
            .filter(p => !showOnlyAvailable || p.stock > 0)
            .filter(p => priceRange.min === '' || p.price >= parseFloat(priceRange.min))
            .filter(p => priceRange.max === '' || p.price <= parseFloat(priceRange.max))
            .sort((a, b) => {
                const [field, order] = sortBy.split('_');
                const valA = field === 'createdAt' ? new Date(a[field]) : a[field];
                const valB = field === 'createdAt' ? new Date(b[field]) : b[field];
                if (valA < valB) return order === 'asc' ? -1 : 1;
                if (valA > valB) return order === 'asc' ? 1 : -1;
                return 0;
            });
    }, [allProducts, searchTerm, selectedCategory, selectedBrand, showOnlyAvailable, priceRange, sortBy]);

    // Update displayed products when page changes
    useEffect(() => {
        const startIndex = 0;
        const endIndex = page * productsPerPage;
        const newProducts = filteredAndSortedProducts.slice(startIndex, endIndex);
        setDisplayedProducts(newProducts);
        setHasMore(endIndex < filteredAndSortedProducts.length);
    }, [page, filteredAndSortedProducts]);

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [searchTerm, selectedCategory, selectedBrand, sortBy, priceRange, showOnlyAvailable]);

    const availableBrands = useMemo(() => ([{ value: '', label: 'All Brands' }, ...Array.from(new Set(allProducts.filter(p => selectedCategory === 'all' || p.category === selectedCategory).map(p => p.brand).filter(Boolean))).map(brand => ({ value: brand, label: brand }))]), [allProducts, selectedCategory]);
    const categoryOptions = [
        { value: 'all', label: 'All Products' },
        { value: 'phones', label: 'Smartphones' },
        { value: 'laptops', label: 'Laptops' },
        { value: 'accessories', label: 'Accessories' },
        { value: 'watches', label: 'Watches' },
        { value: 'tablets', label: 'Tablets' },
        { value: 'gaming', label: 'Gaming' },
        { value: 'audio', label: 'Audio' },
        { value: 'cameras', label: 'Cameras & Photography' },
        { value: 'drones', label: 'Drones' }
    ];

    const subCategoryOptions = {
        accessories: [
            { value: 'headphones', label: 'Headphones' },
            { value: 'chargers', label: 'Chargers' },
            { value: 'cases', label: 'Cases & Covers' },
            { value: 'screen-protectors', label: 'Screen Protectors' },
            { value: 'power-banks', label: 'Power Banks' },
            { value: 'cables', label: 'Cables & Adapters' }
        ],
        gaming: [
            { value: 'consoles', label: 'Gaming Consoles' },
            { value: 'controllers', label: 'Controllers' },
            { value: 'accessories', label: 'Gaming Accessories' }
        ],
        audio: [
            { value: 'earbuds', label: 'Wireless Earbuds' },
            { value: 'speakers', label: 'Bluetooth Speakers' },
            { value: 'headphones', label: 'Headphones' }
        ]
    };

    const sortOptions = [
        { value: 'createdAt_desc', label: 'Newest First' },
        { value: 'price_asc', label: 'Price: Low to High' },
        { value: 'price_desc', label: 'Price: High to Low' }
    ];

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedCategory('all');
        setSelectedBrand('');
        setSortBy('createdAt_desc');
        setPriceRange({ min: '', max: '' });
        setShowOnlyAvailable(false);
        router.push('/products', undefined, { shallow: true });
        toast.success("Filters Cleared");
    };

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        setSelectedBrand('');
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        
        // Reset page when search term changes
        setPage(1);
        setDisplayedProducts([]);
        
        // Update URL without page parameter when searching
        const params = new URLSearchParams(router.query);
        if (value) {
            params.set('search', value);
        } else {
            params.delete('search');
            // Reset all filters when search is cleared
            params.delete('brand');
            params.delete('category');
            params.delete('minPrice');
            params.delete('maxPrice');
            params.delete('sort');
        }
        router.push(`/products?${params.toString()}`, undefined, { shallow: true });
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            // If search is empty, reset all filters
            if (!searchTerm) {
                setSelectedBrand('');
                setSelectedCategory('');
                setPriceRange([0, 1000000]);
                setSortBy('createdAt_desc');
            }
        }
    };

    const FilterControls = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-md font-semibold text-slate-800 mb-3">Categories</h3>
                <div className="space-y-4">
                    <StyledSelect 
                        label="Main Category" 
                        value={selectedCategory} 
                        onChange={(value) => {
                            handleCategorySelect(value);
                            // Reset subcategory when main category changes
                            if (router.query.subCategory) {
                                const { subCategory, ...rest } = router.query;
                                router.push({ pathname: '/products', query: rest });
                            }
                        }} 
                        options={categoryOptions} 
                    />
                    
                    {selectedCategory && subCategoryOptions[selectedCategory] && (
                        <StyledSelect 
                            label="Subcategory" 
                            value={router.query.subCategory || ''} 
                            onChange={(value) => {
                                router.push({
                                    pathname: '/products',
                                    query: { 
                                        ...router.query,
                                        subCategory: value
                                    }
                                });
                            }} 
                            options={[
                                { value: '', label: 'All Subcategories' },
                                ...subCategoryOptions[selectedCategory]
                            ]} 
                        />
                    )}
                </div>
            </div>

            <div className="border-t pt-6 space-y-6">
                <StyledSelect 
                    label="Brands" 
                    value={selectedBrand} 
                    onChange={setSelectedBrand} 
                    options={availableBrands} 
                />
                <StyledSelect 
                    label="Sort By" 
                    value={sortBy} 
                    onChange={setSortBy} 
                    options={sortOptions} 
                />
                <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">Price Range</label>
                    <div className="flex items-center gap-2">
                        <Input 
                            type="number" 
                            placeholder={`Min (${minPriceLimit})`} 
                            value={priceRange.min} 
                            onChange={e => setPriceRange(p => ({...p, min: e.target.value}))} 
                            className="!py-2 !rounded-lg w-full" 
                        />
                        <span className="text-slate-400">–</span>
                        <Input 
                            type="number" 
                            placeholder={`Max (${maxPriceLimit})`} 
                            value={priceRange.max} 
                            onChange={e => setPriceRange(p => ({...p, max: e.target.value}))} 
                            className="!py-2 !rounded-lg w-full" 
                        />
                    </div>
                </div>
                <div className="pt-2">
                    <StyledCheckbox 
                        id="availability" 
                        label="In Stock Only" 
                        checked={showOnlyAvailable} 
                        onChange={(e) => setShowOnlyAvailable(e.target.checked)} 
                    />
                </div>
                <Button 
                    onClick={resetFilters} 
                    variant="outline" 
                    className="w-full !border-slate-300 !text-slate-600 hover:!bg-slate-100"
                >
                    Clear Filters
                </Button>
            </div>
        </div>
    );

    return (
        <div className="bg-white min-h-screen font-sans pt-20">
            <header className="bg-gray-50 border-b border-gray-200">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center space-x-2 text-sm text-slate-500">
                        <Link href="/" legacyBehavior><a className="hover:text-amber-600">Home</a></Link>
                        <Icon name="chevronRight" className="w-4 h-4"/>
                        <span className="font-semibold text-slate-700">Products</span>
                    </div>
                    <h1 className={`text-4xl sm:text-5xl font-extrabold ${brandOrange.text} tracking-tight mt-2`}>
                        {categoryOptions.find(c => c.value === selectedCategory)?.label || 'All Products'}
                    </h1>
                </div>
            </header>

            <div className="bg-white border-b border-gray-200">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
                    <div className="text-sm text-slate-600">
                        <span className="font-semibold text-slate-800">{filteredAndSortedProducts.length}</span> products found
                    </div>
                </div>
            </div>

            <main className="py-8 md:py-12">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-8">
                    {/* Sidebar Filters */}
                    <aside className="hidden md:block w-72 flex-shrink-0">
                        <div className="bg-gray-50 rounded-xl p-6 shadow border border-gray-200 sticky top-24">
                            <FilterControls />
                        </div>
                    </aside>
                    {/* Product Grid */}
                    <section className="flex-1">
                        <div className="mb-6">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Search products..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => {
                                            setSearchTerm('');
                                            setPage(1);
                                            setDisplayedProducts([]);
                                            const params = new URLSearchParams(router.query);
                                            params.delete('search');
                                            params.delete('brand');
                                            params.delete('category');
                                            params.delete('minPrice');
                                            params.delete('maxPrice');
                                            params.delete('sort');
                                            router.push(`/products?${params.toString()}`, undefined, { shallow: true });
                                        }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <Icon name="x" className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                            {displayedProducts.map((product, index) => (
                                <div
                                    key={product._id}
                                    ref={index === displayedProducts.length - 1 ? lastProductElementRef : null}
                                    className="animate-fadeInUp"
                                    style={{animationDelay: `${index * 60}ms`}}
                                >
                                    <ProductCard product={product} compact={isMobile} onAddToCart={handleAddToCart} />
                                </div>
                            ))}
                        </div>
                        {isLoading && (
                            <div className="flex justify-center items-center py-8">
                                <LoadingSpinner />
                            </div>
                        )}
                        {!hasMore && displayedProducts.length > 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No more products to load
                            </div>
                        )}
                        {!isLoading && displayedProducts.length === 0 && (
                            <div className="text-center py-16 md:py-24 bg-gray-50 rounded-2xl">
                                <Icon name="frown" className={`w-20 h-20 ${brandPurple.text} mx-auto mb-5 opacity-70`} />
                                <h2 className="text-2xl font-semibold text-slate-700 mb-2">No Products Found</h2>
                                <p className="text-slate-500 max-w-md mx-auto">Try adjusting your filters to find what you're looking for</p>
                                <Button onClick={resetFilters} variant="primary" className="mt-8">Clear Filters</Button>
                            </div>
                        )}
                    </section>
                </div>
            </main>

            <style jsx global>{`
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeInUp { animation: fadeInUp 0.5s ease-out forwards; opacity: 0; }
            `}</style>
        </div>
    );
};

export default ProductsPage;