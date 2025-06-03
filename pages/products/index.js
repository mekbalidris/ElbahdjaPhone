import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import ProductCard from '../../components/products/ProductCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Icon from '../../components/ui/Icon';
import { useRouter } from 'next/router';
import Button from '../../components/ui/Button';

const CATEGORIES = [
    { value: 'all', label: 'All Categories' },
    { value: 'phones', label: 'Phones' },
    { value: 'accessories', label: 'Accessories' },
];

const ProductsPage = ({ handleAddToCart }) => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('createdAt_desc');
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const { category } = router.query;

    useEffect(() => {
        setIsLoading(true);
        let url = '/api/products';
        fetch(url)
            .then(res => res.json())
            .then(data => {
                let filtered = data;
                if (searchTerm) {
                    filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.description.toLowerCase().includes(searchTerm.toLowerCase()));
                }
                if (selectedCategory !== 'all') {
                    filtered = filtered.filter(p => p.category === selectedCategory);
                }
                filtered.sort((a, b) => {
                    const [field, order] = sortBy.split('_');
                    let comparison = 0;
                    if (a[field] < b[field]) comparison = -1;
                    if (a[field] > b[field]) comparison = 1;
                    return order === 'desc' ? comparison * -1 : comparison;
                });
                setProducts(filtered);
                setIsLoading(false);
            })
            .catch(() => {
                setIsLoading(false);
                toast.error('Failed to fetch products');
            });
    }, [searchTerm, selectedCategory, sortBy]);

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

    const categoryOptions = [
        { value: 'all', label: 'All Categories' },
        { value: 'phones', label: 'Phones' },
        { value: 'accessories', label: 'Accessories' },
    ];

    return (
        <div className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
                    <h1 className="text-3xl font-bold text-gray-900">Products</h1>
                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
                        <Input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-64"
                        />
                        <Select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            options={categoryOptions}
                            className="w-full sm:w-48"
                        />
                        <Select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            options={sortOptions}
                            className="w-full sm:w-48"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map(product => (
                            <ProductCard 
                                key={product._id} 
                                product={product} 
                                onAddToCart={handleAddToCart}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <Icon name="search" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-xl text-gray-600">No products found matching your criteria.</p>
                        <p className="text-gray-500">Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductsPage; 