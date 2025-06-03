import React, { useState, useEffect } from 'react';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import ProductCard from '../components/products/ProductCard';
import { useRouter } from 'next/router';

const HomePage = ({ handleAddToCart }) => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        setIsLoading(true);
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                setProducts(data);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }, []);

    const featuredProducts = products.slice(0, 4); // Show more featured products

    return (
        <div className="space-y-12 py-8 px-4 md:px-0">
            <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 rounded-xl shadow-2xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
                            Welcome to PhoneVerse
                        </h1>
                        <p className="mt-3 max-w-md mx-auto text-base sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                            Discover the latest smartphones and accessories at amazing prices.
                        </p>
                        <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                            <div className="rounded-md shadow">
                                <Button
                                    onClick={() => router.push('/products')}
                                    variant="primary"
                                    size="lg"
                                    className="w-full"
                                >
                                    Shop Now
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                        Featured Products
                    </h2>
                    <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
                        Check out our most popular items
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="mt-12 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        {featuredProducts.map(product => (
                            <ProductCard
                                key={product._id}
                                product={product}
                                onAddToCart={handleAddToCart}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default HomePage; 