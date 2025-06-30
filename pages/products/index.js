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

const clothingSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '34', '36', '38', '40', '42', '44', '46'];
const shoeSizes = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'];

const ProductsPage = ({ handleAddToCart }) => {
    const router = useRouter();
    
    const [allProducts, setAllProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [displayedProducts, setDisplayedProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [productsPerPage, setProductsPerPage] = useState(6);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [sortBy, setSortBy] = useState('createdAt_desc');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
    const [minPriceLimit, setMinPriceLimit] = useState(0);
    const [maxPriceLimit, setMaxPriceLimit] = useState(2000);
    const [selectedSize, setSelectedSize] = useState('');

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
            .filter(p => selectedCategory === 'all' || (p.category && p.category.toUpperCase() === selectedCategory.toUpperCase()))
            .filter(p => selectedBrand === '' || p.brand === selectedBrand)
            .filter(p => !showOnlyAvailable || p.stock > 0)
            .filter(p => priceRange.min === '' || p.price >= parseFloat(priceRange.min))
            .filter(p => priceRange.max === '' || p.price <= parseFloat(priceRange.max))
            .filter(p => !selectedSize || (p.sizes && p.sizes.includes(selectedSize)) || (p.size && p.size === selectedSize))
            .sort((a, b) => {
                const [field, order] = sortBy.split('_');
                const valA = field === 'createdAt' ? new Date(a[field]) : a[field];
                const valB = field === 'createdAt' ? new Date(b[field]) : b[field];
                if (valA < valB) return order === 'asc' ? -1 : 1;
                if (valA > valB) return order === 'asc' ? 1 : -1;
                return 0;
            });
    }, [allProducts, searchTerm, selectedCategory, selectedBrand, showOnlyAvailable, priceRange, sortBy, selectedSize]);

    // Update displayed products when page changes
    useEffect(() => {
        const startIndex = 0;
        const endIndex = page * productsPerPage;
        // Only show 6 products at a time, and only load 6 more when user scrolls to the end
        const newProducts = filteredAndSortedProducts.slice(0, endIndex);
        setDisplayedProducts(newProducts);
        setHasMore(endIndex < filteredAndSortedProducts.length);
    }, [page, filteredAndSortedProducts]);

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [searchTerm, selectedCategory, selectedBrand, sortBy, priceRange, showOnlyAvailable]);

    const availableBrands = useMemo(() => ([{ value: '', label: 'All Brands' }, ...Array.from(new Set(allProducts.filter(p => selectedCategory === 'all' || p.category === selectedCategory).map(p => p.brand).filter(Boolean))).map(brand => ({ value: brand, label: brand }))]), [allProducts, selectedCategory]);
    // Dynamically generate category options from products
    const uniqueCategories = Array.from(new Set(allProducts.map(p => (p.category || '').toUpperCase()))).filter(Boolean);
    const categoryOptions = [
        { value: 'all', label: 'Tous les produits' },
        { value: 'SHORT', label: 'Short' },
        { value: 'ACCESSORIES', label: 'Accessoires' },
        { value: 'T-SHIRTS', label: 'T-shirts' },
        { value: 'PANTALONS', label: 'Pantalons' },
        { value: 'CHAUSSURES', label: 'Chaussures' },
        { value: 'VESTES', label: 'Vestes' },
        { value: 'CHAPEAU', label: 'Chapeau' },
        { value: 'CASQUETTE', label: 'Casquette' },
        { value: 'HOODIE', label: 'Hoodie' },
        { value: 'GILET_CEINTURE', label: 'Gilet ceinturé' },
    ];

    const subCategoryOptions = {
        men: [
            { value: 'shirts', label: 'Shirts' },
            { value: 'pants', label: 'Pants' },
            { value: 'jackets', label: 'Jackets' },
            { value: 't-shirts', label: 'T-Shirts' },
            { value: 'suits', label: 'Suits' },
            { value: 'underwear', label: 'Underwear' }
        ],
        women: [
            { value: 'dresses', label: 'Dresses' },
            { value: 'tops', label: 'Tops' },
            { value: 'skirts', label: 'Skirts' },
            { value: 'pants', label: 'Pants' },
            { value: 'jackets', label: 'Jackets' },
            { value: 'lingerie', label: 'Lingerie' }
        ],
        shoes: [
            { value: 'sneakers', label: 'Sneakers' },
            { value: 'formal', label: 'Formal Shoes' },
            { value: 'casual', label: 'Casual Shoes' },
            { value: 'boots', label: 'Boots' },
            { value: 'sandals', label: 'Sandals' },
            { value: 'sports', label: 'Sports Shoes' }
        ],
        accessories: [
            { value: 'belts', label: 'Belts' },
            { value: 'scarves', label: 'Scarves' },
            { value: 'hats', label: 'Hats' },
            { value: 'sunglasses', label: 'Sunglasses' },
            { value: 'gloves', label: 'Gloves' },
            { value: 'socks', label: 'Socks' }
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
                <div className="flex flex-col md:flex-row md:items-center md:gap-8 gap-4">
                    <StyledSelect
                        label="Filtrer par tailles (vêtements)"
                        value={selectedSize && clothingSizes.includes(selectedSize) ? selectedSize : ''}
                        onChange={val => setSelectedSize(val === '' ? '' : val)}
                        options={[{ value: '', label: 'Toutes les tailles' }, ...clothingSizes.map(size => ({ value: size, label: size }))]}
                    />
                    <StyledSelect
                        label="Filtrer par pointures (chaussures)"
                        value={selectedSize && shoeSizes.includes(selectedSize) ? selectedSize : ''}
                        onChange={val => setSelectedSize(val === '' ? '' : val)}
                        options={[{ value: '', label: 'Toutes les pointures' }, ...shoeSizes.map(size => ({ value: size, label: size }))]}
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

    const gridOptions = [3, 4, 5];

    return (
        <div className="bg-white min-h-screen mt-5">
            <main className="container mx-auto px-2 sm:px-4 lg:px-6 py-12">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-800 tracking-tight mb-8">Boutique</h1>
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar filters for desktop */}
                    {!isMobile && (
                        <aside className="w-full md:w-64 flex-shrink-0 mb-8 md:mb-0">
                            <FilterControls />
                        </aside>
                    )}
                    {/* Filter button and drawer for mobile */}
                    {isMobile && (
                        <>
                            <button
                                className="mb-4 flex items-center gap-2 px-4 py-2 bg-yellow-700 text-white rounded-lg font-semibold shadow hover:bg-yellow-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                onClick={() => setIsFilterOpen(true)}
                            >
                                <Icon name="slider" className="w-5 h-5" />
                                Filtres
                            </button>
                            <FilterDrawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)}>
                                <FilterControls />
                            </FilterDrawer>
                        </>
                    )}
                    {/* Main content: search, sort, grid */}
                    <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                            {/* Breadcrumbs */}
                            <div className="text-sm text-gray-500 mb-2 sm:mb-0">
                                <span>Accueil</span> <span className="mx-1">/</span> <span className="font-semibold text-gray-900">Boutique</span>
                            </div>
                            {/* Sort dropdown */}
                            <div className="ml-2">
                                <StyledSelect
                                    value={sortBy}
                                    onChange={setSortBy}
                                    options={[
                                        { value: 'createdAt_desc', label: 'Tri du plus récent au plus ancien' },
                                        { value: 'createdAt_asc', label: 'Tri du plus ancien au plus récent' },
                                        { value: 'price_asc', label: 'Prix croissant' },
                                        { value: 'price_desc', label: 'Prix décroissant' },
                                    ]}
                                />
                            </div>
                        </div>
                        {/* Search box */}
                        <div className="mb-6">
                            <Input
                                type="text"
                                placeholder="Rechercher un produit..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                onKeyPress={handleKeyPress}
                            />
                        </div>
                        {/* Product grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6 justify-items-center"> 
                            {displayedProducts.map((product, idx) => {
                                const isLast = hasMore && idx === displayedProducts.length - 1;
                                return (
                                    <ProductCard key={product._id} product={product} ref={isLast ? lastProductElementRef : null} />
                                );
                            })}
                        </div>
                        {isLoading && <div className="flex justify-center py-8"><LoadingSpinner /></div>}
                        {!isLoading && displayedProducts.length === 0 && (
                            <div className="text-center py-20">
                                <p className="text-xl text-gray-500">Aucun produit trouvé.</p>
                                <p className="text-gray-400 mt-2">Essayez d&apos;autres filtres ou revenez plus tard !</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProductsPage;