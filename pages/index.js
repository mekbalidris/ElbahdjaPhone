import React from 'react';
import HeroSection from '../components/HeroSection';
import CategoryGrid from '../components/CategoryGrid';
import SpecialOffers from '../components/SpecialOffers';
import ProductCard from '../components/products/ProductCard';
import { connectToDatabase } from '../lib/mongodb';

const HomePage = ({ products, error }) => {
    return (
        <div className="bg-white min-h-screen">
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <HeroSection />
                <CategoryGrid products={products} />
                <SpecialOffers products={products} />
                <div className="mt-16">
                    <h2 className="text-3xl font-serif font-bold text-gray-800 mb-8 text-center">Nouveaux produits</h2>
                    {error ? (
                        <div className="text-center text-red-500 py-8">{error}</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                            {products && products.length > 0 ? (
                                products.map(product => <ProductCard key={product._id} product={product} />)
                            ) : (
                                <div className="col-span-full text-center text-gray-500">Aucun produit trouvé.</div>
                            )}
                        </div>
                    )}
                </div>
            </main>
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
            .limit(12)
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