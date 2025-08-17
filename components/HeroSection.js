import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { ChevronDown, Play, Star, Shield, Truck, Clock } from 'lucide-react';

const HeroSection = () => {
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(false);
    const [logoLoaded, setLogoLoaded] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        const timer = setTimeout(() => setLogoLoaded(true), 500);
        return () => clearTimeout(timer);
    }, []);

    const features = [
        { icon: Shield, text: "Garantie Officielle"},
        { icon: Truck, text: "Livraison Rapide"},
        { icon: Clock, text: "Support 24/7"},
        { icon: Star, text: "Produits Authentiques"}
    ];

    return (
        <section className="relative w-screen h-[150vh] overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0">
                <Image
                    src="/hero_header.jpg"
                    alt="Elbahdja Phone Algérie Hero Background"
                    fill
                    className="object-cover sm:object-cover object-center sm:object-center hero-background"
                    sizes="100vw"
                    priority
                    style={{
                        objectPosition: 'center 20%'
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-primary-900/30"></div>
            </div>

            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/5 rounded-full blur-2xl animate-pulse delay-500"></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 w-full h-full flex items-center justify-center">
                <div className="text-center text-white px-4 max-w-6xl mx-auto">
                    {/* Logo Section */}
                    <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <div className="relative inline-block">
                            <div className={`w-32 h-32 mx-auto transition-all duration-1000 ${logoLoaded ? 'scale-100 rotate-0' : 'scale-50 rotate-180'}`}>
                                <Image
                                    src="/logo.png"
                                    alt="Elbahdja Phone Logo"
                                    width={128}
                                    height={128}
                                    className="w-full h-full object-contain drop-shadow-2xl"
                                    onLoad={() => setLogoLoaded(true)}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        setLogoLoaded(true);
                                    }}
                                />
                            </div>
                            {!logoLoaded && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-32 h-32 bg-gradient-to-br from-primary-500 to-accent-600 rounded-full flex items-center justify-center text-white text-2xl font-bold animate-pulse">
                                        EP
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Title */}
                    <div className={`mb-6 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight font-serif mb-4">
                            <span className="bg-gradient-to-r from-white via-primary-100 to-accent-200 bg-clip-text text-transparent animate-gradient-x">
                                Elbahdja
                            </span>
                            <br />
                            <span className="bg-gradient-to-r from-primary-400 via-accent-500 to-primary-600 bg-clip-text text-transparent animate-gradient-x-reverse">
                                Phone
                            </span>
                        </h1>
                    </div>

                    {/* Subtitle */}
                    <div className={`mb-8 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <p className="max-w-3xl mx-auto text-xl md:text-2xl mb-4 text-gray-200 leading-relaxed">
                            Votre destination premium pour les 
                            <span className="text-primary-300 font-semibold"> smartphones</span>, 
                            <span className="text-accent-300 font-semibold"> accessoires</span> et 
                            <span className="text-primary-300 font-semibold"> technologies</span> de pointe
                        </p>
                        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                            Découvrez notre sélection exclusive d'iPhone, casques, coques et ordinateurs portables
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className={`mb-10 transition-all ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                            {features.map((feature, index) => (
                                <div 
                                    key={index}
                                    className={`flex flex-col items-center p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all hover:scale-105 ${feature.delay}`}
                                >
                                    <feature.icon className="w-8 h-8 text-primary-300 mb-2" />
                                    <span className="text-sm font-medium text-gray-200 text-center">{feature.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-1000 delay-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <button
                            onClick={() => router.push('/products')}
                            className="group relative px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-600 hover:from-primary-600 hover:to-accent-700 text-white font-bold text-lg rounded-full transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-primary-500/25"
                        >
                            <span className="relative z-10">Découvrir nos produits</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-accent-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </button>
                        
                        <button
                            onClick={() => router.push('/contact')}
                            className="group px-8 py-4 border-2 border-white/30 hover:border-white text-white font-bold text-lg rounded-full transition-all duration-300 transform hover:scale-105 backdrop-blur-sm hover:bg-white/10"
                        >
                            Nous contacter
                        </button>
                    </div>

                    {/* Scroll Indicator */}
                    <div className={`absolute bottom-8 left-8 transition-all duration-1000 delay-1200 hidden md:block ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <div className="flex flex-col items-center text-white/70 animate-bounce">
                            <span className="text-sm mb-2">Découvrir plus</span>
                            <ChevronDown className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-primary-400 rounded-full animate-float"></div>
                <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-accent-400 rounded-full animate-float-delayed"></div>
                <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-white rounded-full animate-float-slow"></div>
            </div>

            <style jsx>{`
                @keyframes gradient-x {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                @keyframes gradient-x-reverse {
                    0%, 100% { background-position: 100% 50%; }
                    50% { background-position: 0% 50%; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes float-delayed {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-15px); }
                }
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                .animate-gradient-x {
                    background-size: 200% 200%;
                    animation: gradient-x 3s ease infinite;
                }
                .animate-gradient-x-reverse {
                    background-size: 200% 200%;
                    animation: gradient-x-reverse 3s ease infinite;
                }
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
                .animate-float-delayed {
                    animation: float-delayed 3s ease-in-out infinite 1s;
                }
                .animate-float-slow {
                    animation: float-slow 4s ease-in-out infinite 2s;
                }
                
                /* Mobile background optimization */
                @media (max-width: 640px) {
                    .hero-background {
                        object-fit: cover;
                        object-position: center 25%;
                    }
                }
            `}</style>
        </section>
    );
};

export default HeroSection; 