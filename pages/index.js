import React, { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import HeroSection from '../components/HeroSection';
import CategoryGrid from '../components/CategoryGrid';
import SpecialOffers from '../components/SpecialOffers';
import ProductCard from '../components/products/ProductCard';
import { connectToDatabase } from '../lib/mongodb';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const HomePage = ({ products, error }) => {
    const router = useRouter();
    const { currentUser } = useAuth();
    const [displayedCount, setDisplayedCount] = useState(9);
    const [showcaseData, setShowcaseData] = useState(null);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const videoRef = useRef(null);
    const productsPerLoad = 9;
    const visibleProducts = products ? products.slice(0, displayedCount) : [];
    const hasMoreProducts = products && displayedCount < products.length;
    
    const handleLoadMore = () => {
        setDisplayedCount(prev => Math.min(prev + productsPerLoad, products.length));
    };

    useEffect(() => {
        const fetchShowcase = async () => {
            try {
                const response = await fetch('/api/showcase');
                if (response.ok) {
                    const data = await response.json();
                    setShowcaseData(data);
                }
            } catch (error) {
                console.error('Error fetching showcase data:', error);
            }
        };
        fetchShowcase();
    }, []);

    const togglePlayPause = () => {
        if (videoRef.current) {
            if (isVideoPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsVideoPlaying(!isVideoPlaying);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };
    return (
        <div className="bg-white relative">
            {/* Hero Section */}
            <HeroSection />
            
            {/* Main content */}
            <div className="relative z-10 bg-white min-h-screen">
                <div className="bg-white rounded-t-3xl min-h-screen">
                    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-16 mt-16">
                        <CategoryGrid products={products} />
                        <SpecialOffers products={products} />
                        
                        {/* Showcase Video Section */}
                        {showcaseData && showcaseData.videoUrl && (
                            <div className="mt-16 mb-16">
                                <div className="text-center mb-8">
                                    <h2 className="text-3xl font-serif font-bold text-neutral-800 mb-4">
                                        Découvrez nos offres spéciales
                                    </h2>
                                    <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                                        {showcaseData.description || "Regardez notre vidéo de présentation pour découvrir nos dernières offres et nouveautés."}
                                    </p>
                                </div>
                                
                                <div className="max-w-4xl mx-auto">
                                    <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
                                        <video
                                            ref={videoRef}
                                            className="w-full h-auto"
                                            poster={showcaseData.thumbnailUrl || '/video-thumbnail.jpg'}
                                            muted={isMuted}
                                            onPlay={() => setIsVideoPlaying(true)}
                                            onPause={() => setIsVideoPlaying(false)}
                                            onEnded={() => setIsVideoPlaying(false)}
                                        >
                                            <source src={showcaseData.videoUrl} type="video/mp4" />
                                            Votre navigateur ne supporte pas la lecture de vidéos.
                                        </video>
                                        
                                        {/* Video Controls Overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <button
                                                onClick={togglePlayPause}
                                                className="bg-white/20 backdrop-blur-sm rounded-full p-4 hover:bg-white/30 transition-all duration-300 group"
                                            >
                                                {isVideoPlaying ? (
                                                    <Pause className="w-8 h-8 text-white" />
                                                ) : (
                                                    <Play className="w-8 h-8 text-white ml-1" />
                                                )}
                                            </button>
                                        </div>
                                        
                                        {/* Volume Control */}
                                        <div className="absolute bottom-4 right-4">
                                            <button
                                                onClick={toggleMute}
                                                className="bg-black/50 backdrop-blur-sm rounded-full p-2 hover:bg-black/70 transition-all duration-300"
                                            >
                                                {isMuted ? (
                                                    <VolumeX className="w-5 h-5 text-white" />
                                                ) : (
                                                    <Volume2 className="w-5 h-5 text-white" />
                                                )}
                                            </button>
                                        </div>
                                        
                                        {/* Video Info Overlay */}
                                        <div className="absolute bottom-4 left-4 text-white">
                                            <h3 className="text-lg font-semibold mb-1">
                                                {showcaseData.title || "Offre Spéciale"}
                                            </h3>
                                            <p className="text-sm opacity-90">
                                                {showcaseData.subtitle || "Découvrez nos meilleures offres"}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {showcaseData.ctaText && (
                                        <div className="text-center mt-6">
                                            <button className="bg-gradient-to-r from-primary-500 to-accent-600 hover:from-primary-600 hover:to-accent-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg">
                                                {showcaseData.ctaText}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        {/* Admin Button for Video Management - Only visible to admins */}
                        {(currentUser?.role === 'admin' || currentUser?.role === 'seller') && (
                            <div className="text-center mt-8">
                                <button
                                    onClick={() => router.push('/admin/homepage-management')}
                                    className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors duration-300 shadow-lg"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Gérer la vidéo de présentation
                                </button>
                            </div>
                        )}
                        
                        {/* Show video section even if no video is set */}
                        {!showcaseData?.videoUrl && (
                            <div className="mt-16 mb-16 text-center">
                                <div className="max-w-4xl mx-auto">
                                    <div className="bg-gray-100 rounded-2xl p-12 border-2 border-dashed border-gray-300">
                                        <h3 className="text-xl font-semibold text-gray-600 mb-4">
                                            Une offre arrive...
                                        </h3>
                                        <p className="text-gray-500 mb-6">
                                            Restez à l'écoute pour découvrir nos prochaines offres spéciales
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div className="mt-16">
                            <h2 className="text-3xl font-serif font-bold text-neutral-800 mb-8 text-center">Nouveaux produits</h2>
                            {error ? (
                                <div className="text-center text-red-500 py-8">{error}</div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-4 sm:gap-6 justify-items-center sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                        {visibleProducts && visibleProducts.length > 0 ? (
                                            visibleProducts.map((product) => (
                                                <ProductCard
                                                    key={product._id}
                                                    product={product}
                                                />
                                            ))
                                        ) : (
                                            <div className="col-span-full text-center text-neutral-500">Aucun produit trouvé.</div>
                                        )}
                                    </div>
                                    
                                    {/* Load More Button */}
                                    {hasMoreProducts && (
                                        <div className="flex justify-center mt-12">
                                            <button
                                                onClick={handleLoadMore}
                                                className="px-8 py-3 bg-gradient-to-r from-primary-500 to-accent-600 hover:from-primary-600 hover:to-accent-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                                            >
                                                Charger plus de produits
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        {/* Footer spacer to prevent overlap */}
                        <div className="h-8"></div>
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