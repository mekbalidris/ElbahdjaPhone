import React from 'react';
import Head from 'next/head';
import { useFavorites } from '../context/FavoritesContext';
import ProductCard from '../components/products/ProductCard';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useCart } from '../context/CartContext';

const FavoritesPage = () => {
    const { favorites, clearFavorites } = useFavorites();
    const { cartItemCount, onCartClick } = useCart();

    return (
        <>
            <Head>
                <title>Mes Favoris - COSMOS</title>
                <meta name="description" content="Découvrez vos produits favoris sur COSMOS" />
            </Head>

            <Navbar onCartClick={onCartClick} cartItemCount={cartItemCount} />

            <main className="pt-16 min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Favoris</h1>
                        <p className="text-gray-600">
                            {favorites.length === 0 
                                ? "Vous n'avez pas encore de produits favoris." 
                                : `Vous avez ${favorites.length} produit${favorites.length > 1 ? 's' : ''} dans vos favoris.`
                            }
                        </p>
                    </div>

                    {/* Clear All Button */}
                    {favorites.length > 0 && (
                        <div className="mb-6">
                            <button
                                onClick={clearFavorites}
                                className="inline-flex items-center px-4 py-2 border border-red-300 text-red-700 bg-white rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Vider tous les favoris
                            </button>
                        </div>
                    )}

                    {/* Favorites Grid */}
                    {favorites.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {favorites.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="max-w-md mx-auto">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-gray-300 mx-auto mb-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                </svg>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun favori</h3>
                                <p className="text-gray-500 mb-6">
                                    Commencez à ajouter des produits à vos favoris pour les retrouver facilement ici.
                                </p>
                                <a
                                    href="/products"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-700 hover:bg-yellow-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200"
                                >
                                    Découvrir nos produits
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </>
    );
};

export default FavoritesPage; 