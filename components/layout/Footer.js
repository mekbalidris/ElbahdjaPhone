import React from 'react';
import Link from 'next/link';
import { Truck, Headset, CreditCard, Facebook, Instagram } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-200 text-gray-700">
            <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8">
                    <div className="flex-1 flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <Truck className="w-8 h-8 text-gray-700" />
                            <div>
                                <div className="font-semibold">Livraison 58 wilayas.</div>
                                <div className="text-sm text-gray-500">Livraison 24 - 48h.</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Headset className="w-8 h-8 text-gray-700" />
                            <div>
                                <div className="font-semibold">Support.</div>
                                <div className="text-sm text-gray-500">Support 24h/7j.</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <CreditCard className="w-8 h-8 text-gray-700" />
                            <div>
                                <div className="font-semibold">Paiement à la livraison.</div>
                                <div className="text-sm text-gray-500">Payer à la livraison</div>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-4">
                        <div className="text-4xl font-serif font-bold tracking-widest">COSMOS</div>
                        <div className="flex gap-4 mt-2">
                            <a href="#" className="text-blue-600 hover:text-blue-800" aria-label="Facebook"><Facebook className="w-6 h-6" /></a>
                            <a href="#" className="text-pink-600 hover:text-pink-800" aria-label="Instagram"><Instagram className="w-6 h-6" /></a>
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