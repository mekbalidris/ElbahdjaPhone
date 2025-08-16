import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Truck, Headset, CreditCard, Facebook, Instagram } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-neutral-900 border-t border-neutral-700 text-white">
            <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8">
                    <div className="flex-1 flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <Truck className="w-8 h-8 text-primary-500" />
                            <div>
                                <div className="font-semibold">Livraison 58 wilayas.</div>
                                <div className="text-sm text-neutral-300">Livraison 24 - 48h.</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Headset className="w-8 h-8 text-primary-500" />
                            <div>
                                <div className="font-semibold">Support technique.</div>
                                <div className="text-sm text-neutral-300">Support 24h/7j.</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <CreditCard className="w-8 h-8 text-primary-500" />
                            <div>
                                <div className="font-semibold">Paiement sécurisé.</div>
                                <div className="text-sm text-neutral-300">Payer à la livraison</div>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-4">
                        <span className="text-2xl font-bold text-white mb-2">Elbahdja Phone</span>
                        <div className="flex gap-4 mt-2">
                            <a href="#" className="text-primary-500 hover:text-primary-400" aria-label="Facebook"><Facebook className="w-6 h-6" /></a>
                            <a href="#" className="text-primary-500 hover:text-primary-400" aria-label="Instagram"><Instagram className="w-6 h-6" /></a>
                        </div>
                        <div className="text-sm text-neutral-300 mt-2">Nos réseaux :</div>
                    </div>
                    <div className="flex-1 flex flex-col md:flex-row gap-8 justify-between">
                        <div>
                            <div className="font-semibold mb-2">LIENS RAPIDES :</div>
                            <ul className="space-y-1">
                                <li><Link href="/" className="text-neutral-300 hover:text-primary-500">Accueil</Link></li>
                                <li><Link href="/products" className="text-neutral-300 hover:text-primary-500">Produits</Link></li>
                                <li><Link href="/contact" className="text-neutral-300 hover:text-primary-500">Contact</Link></li>
                                <li><Link href="/about" className="text-neutral-300 hover:text-primary-500">À propos</Link></li>
                            </ul>
                        </div>
                        <div>
                            <div className="font-semibold mb-2">CATÉGORIES :</div>
                            <ul className="space-y-1">
                                <li className="text-neutral-300">iPhones</li>
                                <li className="text-neutral-300">Smartphones</li>
                                <li className="text-neutral-300">Casques</li>
                                <li className="text-neutral-300">Coques</li>
                                <li className="text-neutral-300">Ordinateurs</li>
                            </ul>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="font-semibold mb-2">Système de livraison :</div>
                            <Image src="/yalidine-logo.png" alt="Yalidine Express" width={120} height={32} className="h-8" />
                        </div>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t border-neutral-700 text-center">
                    <p className="font-semibold text-neutral-300">Elbahdja Phone Algérie - Tous droits réservés</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer; 