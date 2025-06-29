import React from 'react';
import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-200 text-gray-700">
            <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8">
                    <div className="flex-1 flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h13M9 21V7a4 4 0 1 1 8 0v14" /></svg>
                            <div>
                                <div className="font-semibold">Livraison 58 wilayas.</div>
                                <div className="text-sm text-gray-500">Livraison 24 - 48h.</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h2" /><circle cx="12" cy="4" r="4" /></svg>
                            <div>
                                <div className="font-semibold">Support.</div>
                                <div className="text-sm text-gray-500">Support 24h/7j.</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 0V4m0 8v8" /></svg>
                            <div>
                                <div className="font-semibold">Paiement à la livraison.</div>
                                <div className="text-sm text-gray-500">Payer à la livraison</div>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-4">
                        <div className="text-4xl font-serif font-bold tracking-widest">COSMOS</div>
                        <div className="flex gap-4 mt-2">
                            <a href="#" className="text-blue-600 hover:text-blue-800"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg></a>
                            <a href="#" className="text-pink-600 hover:text-pink-800"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.241-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.771.131 4.659.425 3.678 1.406c-.98.98-1.274 2.092-1.334 3.374C2.013 5.668 2 6.077 2 12c0 5.923.013 6.332.072 7.612.06 1.282.354 2.394 1.334 3.374.98.98 2.092 1.274 3.374 1.334C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.282-.06 2.394-.354 3.374-1.334.98-.98 1.274-2.092 1.334-3.374.059-1.28.072-1.689.072-7.612 0-5.923-.013-6.332-.072-7.612-.06-1.282-.354-2.394-1.334-3.374-.98-.98-2.092-1.274-3.374-1.334C15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/></svg></a>
                        </div>
                        <div className="text-sm text-gray-500 mt-2">Nos réseaux :</div>
                    </div>
                    <div className="flex-1 flex flex-col md:flex-row gap-8 justify-between">
                        <div>
                            <div className="font-semibold mb-2">LIENS RAPIDES :</div>
                            <ul className="space-y-1">
                                <li><Link href="/">Accueil</Link></li>
                                <li><Link href="/products">Boutique</Link></li>
                                <li><Link href="/contact">Contact</Link></li>
                                <li><Link href="/about">À propos</Link></li>
                            </ul>
                        </div>
                        <div>
                            <div className="font-semibold mb-2">CATÉGORIES :</div>
                            <ul className="space-y-1">
                                <li>Sneakers</li>
                                <li>Boots</li>
                                <li>Accessoires</li>
                            </ul>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="font-semibold mb-2">Système de livraison :</div>
                            <img src="/yalidine-logo.png" alt="Yalidine Express" className="h-8" />
                        </div>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t border-gray-200 text-center">
                    <p className="font-semibold">Cosmos algérie All rights reserved</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer; 