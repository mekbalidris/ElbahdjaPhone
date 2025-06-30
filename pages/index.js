import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import HeroSection from '../components/HeroSection';
import CategoryGrid from '../components/CategoryGrid';
import SpecialOffers from '../components/SpecialOffers';
import ProductCard from '../components/products/ProductCard';
import { connectToDatabase } from '../lib/mongodb';

const HomePage = ({ products, error }) => {
    const [page, setPage] = useState(1);
    const productsPerPage = 6;
    const visibleProducts = products ? products.slice(0, page * productsPerPage) : [];
    const hasMore = products && visibleProducts.length < products.length;
    const observer = useRef();
    const lastProductRef = useCallback(node => {
        if (!hasMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new window.IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                setPage(prev => prev + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [hasMore]);
    return (
        <div className="bg-white">
            {/* Sticky Hero Section - stays at the top until scrolled past */}
            <div className="sticky top-0 left-0 w-full h-screen z-0 relative">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <Image
                        src="/hero_header.png"
                        alt="Cosmos Algérie Hero Background"
                        fill
                        className="object-cover"
                        priority
                    />
                    {/* Overlay for better text readability */}
                    <div className="absolute inset-0 bg-black bg-opacity-60"></div>
                </div>
                
                {/* Content */}
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                    <div className="text-center text-white px-4">
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-serif mb-4 text-shadow">
                            Cosmos Algérie
                        </h1>
                        <p className="max-w-2xl mx-auto text-lg mb-2 text-shadow">
                            La marque Cosmos est une marque de chaussures 100% algérienne, fabriquée dans un atelier artisanal pour vous offrir une expérience authentique et des produits de qualité garantie.
                        </p>
                        <p className="max-w-2xl mx-auto text-base opacity-90 text-shadow">
                            Découvrez notre collection soigneusement sélectionnée pour vous.
                        </p>
                    </div>
                </div>
            </div>

            {/* Content overlays the hero as you scroll */}
            <div className="relative z-10">
                <div className="bg-white rounded-t-3xl">
                    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <CategoryGrid products={products} />
                        <SpecialOffers products={products} />
                        <div className="mt-16">
                            <h2 className="text-3xl font-serif font-bold text-gray-800 mb-8 text-center">Nouveaux produits</h2>
                            {error ? (
                                <div className="text-center text-red-500 py-8">{error}</div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4 sm:gap-6 justify-items-center sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {visibleProducts && visibleProducts.length > 0 ? (
                                        visibleProducts.map((product, idx) => {
                                            const isLast = hasMore && idx === visibleProducts.length - 1;
                                            return (
                                                <ProductCard
                                                    key={product._id}
                                                    product={product}
                                                    ref={isLast ? lastProductRef : null}
                                                />
                                            );
                                        })
                                    ) : (
                                        <div className="col-span-full text-center text-gray-500">Aucun produit trouvé.</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export async function getServerSideProps() {
    try {
        const { db } = await connectToDatabase();
        const products = await db
            .collection('products')
            .find({})
            .sort({ createdAt: -1 })
            .toArray();
        return {
            props: {
                products: JSON.parse(JSON.stringify(products)),
            },
        };
    } catch (error) {
        return {
            props: {
                products: [],
                error: 'Erreur lors du chargement des produits.',
            },
        };
    }
}

export default HomePage; 