import React, { useState, useEffect, useMemo, Fragment, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';
import { useRouter } from 'next/router';
import Button from '../../components/ui/Button';
import ProductCard from '../../components/products/ProductCard';
import { X, SlidersHorizontal, ChevronRight, ShoppingBag, Search, Frown, ChevronDown, Check } from 'lucide-react';

const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
);

const StyledSelect = ({ value, onChange, options, label }) => (
  <div>
    {label && <label className="text-sm font-semibold text-black block mb-2">{label}</label>}
    <div className="relative">
      <select 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        className="w-full appearance-none bg-white border border-slate-300 rounded-xl py-2.5 pl-4 pr-10 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
      >
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  </div>
);

const Input = React.forwardRef((props, ref) => (
  <input 
    ref={ref} 
    {...props} 
    className="w-full px-4 py-2 text-sm text-slate-800 bg-white border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition placeholder:text-slate-400" 
  />
));
Input.displayName = "Input";

const StyledCheckbox = ({ id, label, checked, onChange }) => (
  <label htmlFor={id} className="flex items-center space-x-3 cursor-pointer group">
    <div className={`w-5 h-5 border-2 rounded-md flex items-center justify-center transition-all duration-200 ${checked ? 'bg-amber-500 border-amber-500' : 'border-slate-300 group-hover:border-amber-400'}`}>
      {checked && <Check className="w-3.5 h-3.5 text-black stroke-2" />}
    </div>
    <span className="text-sm text-slate-700 select-none">{label}</span>
  </label>
);

const FilterDrawer = ({ isOpen, onClose, children }) => (
  <Transition.Root show={isOpen} as={Fragment}>
    <Dialog as="div" className="relative z-[70]" onClose={onClose}>
      <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
        <div className="fixed inset-0 bg-black bg-opacity-40" />
      </Transition.Child>
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
            <Transition.Child as={Fragment} enter="transform transition ease-in-out duration-300" enterFrom="translate-x-full" enterTo="translate-x-0" leave="transform transition ease-in-out duration-300" leaveFrom="translate-x-0" leaveTo="translate-x-full">
              <Dialog.Panel className="pointer-events-auto w-screen max-w-sm">
                <div className="flex h-full flex-col overflow-y-scroll bg-gray-50 shadow-xl">
                  <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-white border-b">
                    <Dialog.Title className="text-lg font-bold text-slate-800 flex items-center">
                      <SlidersHorizontal className="w-5 h-5 mr-2 text-amber-500" /> Filters
                    </Dialog.Title>
                    <button type="button" className="rounded-full p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100" onClick={onClose}>
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="relative mt-6 flex-1 px-4 sm:px-6">{children}</div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </div>
    </Dialog>
  </Transition.Root>
);

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  return isMobile;
}

const ProductsPage = ({ setGlobalLoading }) => {
  const router = useRouter();
  const isInitialMount = useRef(true);
  const isMobile = useIsMobile();
  
  // State management
  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [productsPerPage] = useState(12);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [sortBy, setSortBy] = useState('createdAt_desc');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [minPriceLimit, setMinPriceLimit] = useState(0);
  const [maxPriceLimit, setMaxPriceLimit] = useState(500000);

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setAllProducts(data);
        
        if (data.length > 0) {
          const prices = data.map(p => p.price);
          setMinPriceLimit(Math.floor(Math.min(...prices)));
          setMaxPriceLimit(Math.ceil(Math.max(...prices)));
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Sync URL to state on initial load
  useEffect(() => {
    if (router.isReady && allProducts.length > 0 && isInitialMount.current) {
      const { query } = router;
      setSearchTerm(query.search || '');
      setSelectedCategory(query.category || 'all');
      setSelectedBrand(query.brand || '');
      setSortBy(query.sortBy || 'createdAt_desc');
      setPriceRange({ 
        min: query.minPrice || '', 
        max: query.maxPrice || '' 
      });
      setShowOnlyAvailable(query.available === 'true');
      setSelectedSize(query.size || '');
      isInitialMount.current = false;
    }
  }, [router.isReady, allProducts]);

  // Sync state to URL when filters change
  useEffect(() => {
    if (isInitialMount.current) return;

    const query = {};
    if (searchTerm) query.search = searchTerm;
    if (selectedCategory !== 'all') query.category = selectedCategory;
    if (selectedBrand) query.brand = selectedBrand;
    if (sortBy !== 'createdAt_desc') query.sortBy = sortBy;
    if (priceRange.min) query.minPrice = priceRange.min;
    if (priceRange.max) query.maxPrice = priceRange.max;
    if (showOnlyAvailable) query.available = 'true';
    if (selectedSize) query.size = selectedSize;

    router.replace(
      { pathname: '/products', query },
      undefined,
      { shallow: true }
    );
  }, [searchTerm, selectedCategory, selectedBrand, sortBy, priceRange, showOnlyAvailable, selectedSize]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    return allProducts
      .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
      .filter(p => !selectedBrand || p.brand?.toLowerCase() === selectedBrand.toLowerCase())
      .filter(p => !showOnlyAvailable || p.stock > 0)
      .filter(p => priceRange.min === '' || p.price >= parseFloat(priceRange.min))
      .filter(p => priceRange.max === '' || p.price <= parseFloat(priceRange.max))
      .filter(p => !selectedSize || (p.sizes && p.sizes.includes(selectedSize)))
      .sort((a, b) => {
        const [field, order] = sortBy.split('_');
        const valA = field === 'createdAt' ? new Date(a[field]) : a[field];
        const valB = field === 'createdAt' ? new Date(b[field]) : b[field];
        if (valA < valB) return order === 'asc' ? -1 : 1;
        if (valA > valB) return order === 'asc' ? 1 : -1;
        return 0;
      });
  }, [allProducts, searchTerm, selectedCategory, selectedBrand, showOnlyAvailable, priceRange, sortBy, selectedSize]);

  const availableBrands = useMemo(() => {
    const productsForCategory = selectedCategory === 'all' 
      ? allProducts 
      : allProducts.filter(p => p.category === selectedCategory);
    
    const brandCounts = productsForCategory.reduce((acc, product) => {
      if (!product.brand) return acc;
      const brand = product.brand.trim();
      acc[brand] = (acc[brand] || 0) + 1;
      return acc;
    }, {});

    return [
      { value: '', label: 'All Brands' },
      ...Object.entries(brandCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([brand, count]) => ({ 
          value: brand, 
          label: `${brand} (${count})` 
        }))
    ];
  }, [allProducts, selectedCategory]);

  // Pagination
  useEffect(() => {
    const endIndex = page * productsPerPage;
    setDisplayedProducts(filteredAndSortedProducts.slice(0, endIndex));
    setHasMore(endIndex < filteredAndSortedProducts.length);
  }, [page, filteredAndSortedProducts, productsPerPage]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedCategory, selectedBrand, sortBy, priceRange, showOnlyAvailable, selectedSize]);

  // Infinite scroll observer
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

  const categoryOptions = [
    { value: 'all', label: 'All Products' },
    { value: 'phones', label: 'Smartphones' },
    { value: 'laptops', label: 'Laptops' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'watch', label: 'Smart Watches' },
  ];
  
  const sortOptions = [
    { value: 'createdAt_desc', label: 'Newest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' }
  ];

  const phoneStorageSizes = ['64GB', '128GB', '256GB', '512GB', '1TB'];
  const laptopStorageSizes = ['256GB', '512GB', '1TB', '2TB'];

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSelectedBrand('');
    setSelectedSize('');
  };
  
  const resetAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedBrand('');
    setSortBy('createdAt_desc');
    setPriceRange({ min: '', max: '' });
    setShowOnlyAvailable(false);
    setSelectedSize('');
    toast.success("Filters Cleared");
  };

  const FilterControls = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-md font-semibold text-slate-800 mb-3 border-b pb-2">Categories</h3>
        <StyledSelect 
          value={selectedCategory} 
          onChange={handleCategoryChange} 
          options={categoryOptions} 
        />
      </div>
      <div className="border-t pt-6 space-y-6">
        <StyledSelect 
          label="Brands" 
          value={selectedBrand} 
          onChange={setSelectedBrand} 
          options={availableBrands} 
        />
        
        <div>
          <label className="text-sm font-semibold text-black block mb-2">Price Range</label>
          <div className="flex items-center gap-2">
            <Input 
              type="number" 
              placeholder={`Min (${minPriceLimit})`} 
              value={priceRange.min} 
              onChange={e => setPriceRange({ ...priceRange, min: e.target.value })} 
              className="!py-2 !rounded-lg w-full" 
            />
            <span className="text-slate-400">–</span>
            <Input 
              type="number" 
              placeholder={`Max (${maxPriceLimit})`} 
              value={priceRange.max} 
              onChange={e => setPriceRange({ ...priceRange, max: e.target.value })} 
              className="!py-2 !rounded-lg w-full" 
            />
          </div>
        </div>

        {selectedCategory === 'phones' && (
          <StyledSelect
            label="Storage Capacity"
            value={selectedSize}
            onChange={setSelectedSize}
            options={[{ value: '', label: 'All Capacities' }, ...phoneStorageSizes.map(size => ({ value: size, label: size }))]}
          />
        )}
        {selectedCategory === 'laptops' && (
          <StyledSelect
            label="Storage Capacity"
            value={selectedSize}
            onChange={setSelectedSize}
            options={[{ value: '', label: 'All Capacities' }, ...laptopStorageSizes.map(size => ({ value: size, label: size }))]}
          />
        )}

        <StyledCheckbox 
          id="availability" 
          label="In Stock Only" 
          checked={showOnlyAvailable} 
          onChange={(e) => setShowOnlyAvailable(e.target.checked)} 
        />
        
        <Button 
          onClick={resetAllFilters} 
          variant="outline" 
          className="w-full !border-slate-300 !text-slate-700 hover:!bg-slate-100"
        >
          Clear Filters
        </Button>
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Animated background elements */}
      <div className="relative overflow-hidden">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-20 relative z-10">
          {/* Hero Section */}
          <div className="text-center mb-12 space-y-6">
            
            <p className="mt-4 text-xl text-slate-600 max-w-2xl mx-auto animate-[fadeInUp_0.6s_ease-out_forwards_100ms]">
              Find the perfect tech companion from our carefully curated selection of cutting-edge devices
            </p>
            
            {/* Search bar */}
            <div className="max-w-xl mx-auto mt-8 animate-[fadeInUp_0.6s_ease-out_forwards_200ms]">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search for products, brands, or categories..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-12 pr-6 py-4 text-base rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                />
                <button className="absolute right-0 top-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
                  Search
                </button>
              </div>
            </div>
            
            {/* Category chips */}
            <div className="flex flex-wrap justify-center gap-3 mt-8 animate-[fadeInUp_0.6s_ease-out_forwards_300ms]">
              {categoryOptions.map((category) => (
                <button
                  key={category.value}
                  onClick={() => handleCategoryChange(category.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category.value
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
            {/* Desktop Sidebar */}
            {!isMobile && (
              <aside className="w-full md:w-64 lg:w-72 flex-shrink-0">
                <div className="sticky top-24">
                  <FilterControls />
                </div>
              </aside>
            )}
            
            {/* Main Content */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4 p-4 bg-white rounded-xl border">
                <div className="relative flex-grow">
                  <Input
                    type="text"
                    placeholder="Search for a product..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                  <Search className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  {isMobile && (
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => setIsFilterOpen(true)}
                    >
                      <SlidersHorizontal className="w-5 h-5" />
                      Filters
                    </Button>
                  )}
                  <div className="w-48">
                    <StyledSelect
                      value={sortBy}
                      onChange={setSortBy}
                      options={sortOptions}
                    />
                  </div>
                </div>
              </div>

              {/* Mobile Filter Drawer */}
              <FilterDrawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)}>
                <FilterControls />
              </FilterDrawer>
              
              {/* Product Grid */}
              {isLoading && allProducts.length === 0 ? (
                <div className="flex justify-center py-20"><LoadingSpinner /></div>
              ) : displayedProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"> 
                  {displayedProducts.map((product, idx) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      setGlobalLoading={setGlobalLoading}
                      ref={idx === displayedProducts.length - 1 ? lastProductElementRef : undefined}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-xl border">
                  <Frown className="w-16 h-16 mx-auto text-slate-300" />
                  <h3 className="mt-4 text-xl font-semibold text-slate-800">No Products Found</h3>
                  <p className="text-slate-500 mt-2">Try adjusting your filters or clearing them to see all products.</p>
                  <Button onClick={resetAllFilters} className="mt-6">Clear All Filters</Button>
                </div>
              )}

              {/* Loading spinner for infinite scroll */}
              {isLoading && allProducts.length > 0 && (
                <div className="flex justify-center py-8"><LoadingSpinner /></div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProductsPage;