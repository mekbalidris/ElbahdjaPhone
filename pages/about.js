import React from 'react';
import { Shield, Truck, Users, Award, Smartphone, Headphones, Laptop, Zap } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 pt-20">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold font-serif mb-6 text-neutral-800">
            À propos de <span className="text-primary-500">Elbahdja</span><span className="text-accent-500">Phone</span>
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
            Votre partenaire de confiance pour tous vos besoins technologiques en Algérie. 
            Nous nous engageons à vous offrir les meilleurs produits et services avec une qualité exceptionnelle.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-6">
              <Award className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold font-serif mb-4 text-neutral-800">Notre Mission</h3>
            <p className="text-neutral-600 leading-relaxed">
              Rendre la technologie accessible à tous les Algériens en proposant des produits de qualité 
              à des prix compétitifs. Nous nous efforçons d'offrir une expérience d'achat exceptionnelle 
              avec un service client de premier ordre.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mb-6">
              <Zap className="w-8 h-8 text-accent-600" />
            </div>
            <h3 className="text-2xl font-bold font-serif mb-4 text-neutral-800">Notre Vision</h3>
            <p className="text-neutral-600 leading-relaxed">
              Devenir la référence incontournable dans le domaine de la technologie en Algérie, 
              en créant une communauté de clients satisfaits qui nous font confiance pour tous 
              leurs besoins technologiques.
            </p>
          </div>
        </div>

        {/* Nos Valeurs */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold font-serif text-center mb-12 text-neutral-800">Nos Valeurs</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-10 h-10 text-primary-600" />
              </div>
              <h4 className="text-xl font-bold mb-2 text-neutral-800">Confiance</h4>
              <p className="text-neutral-600">Nous construisons des relations durables basées sur la transparence et la fiabilité.</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-10 h-10 text-accent-600" />
              </div>
              <h4 className="text-xl font-bold mb-2 text-neutral-800">Qualité</h4>
              <p className="text-neutral-600">Nous sélectionnons rigoureusement chaque produit pour garantir la meilleure qualité.</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-primary-600" />
              </div>
              <h4 className="text-xl font-bold mb-2 text-neutral-800">Service</h4>
              <p className="text-neutral-600">Notre équipe dédiée est là pour vous accompagner à chaque étape.</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-10 h-10 text-accent-600" />
              </div>
              <h4 className="text-xl font-bold mb-2 text-neutral-800">Accessibilité</h4>
              <p className="text-neutral-600">Nous rendons la technologie accessible à tous, partout en Algérie.</p>
            </div>
          </div>
        </div>

        {/* Nos Produits */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold font-serif text-center mb-12 text-neutral-800">Nos Produits</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-primary-600" />
              </div>
              <h4 className="text-xl font-bold mb-2 text-neutral-800">Smartphones</h4>
              <p className="text-neutral-600">iPhones, Samsung, Huawei et bien d'autres marques premium pour tous les budgets.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Headphones className="w-8 h-8 text-accent-600" />
              </div>
              <h4 className="text-xl font-bold mb-2 text-neutral-800">Accessoires</h4>
              <p className="text-neutral-600">Casques, coques, chargeurs et tous les accessoires essentiels pour votre appareil.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Laptop className="w-8 h-8 text-primary-600" />
              </div>
              <h4 className="text-xl font-bold mb-2 text-neutral-800">Ordinateurs</h4>
              <p className="text-neutral-600">Laptops, tablettes et accessoires informatiques pour tous vos besoins professionnels.</p>
            </div>
          </div>
        </div>

        {/* Pourquoi nous choisir */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold font-serif text-center mb-12 text-neutral-800">Pourquoi nous choisir ?</h2>
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-neutral-800 mb-2">Garantie Officielle</h4>
                  <p className="text-neutral-600">Tous nos produits bénéficient d'une garantie officielle du fabricant pour votre tranquillité d'esprit.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Truck className="w-6 h-6 text-accent-600" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-neutral-800 mb-2">Livraison Rapide</h4>
                  <p className="text-neutral-600">Livraison dans les 58 wilayas d'Algérie avec un service de qualité et un suivi en temps réel.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-neutral-800 mb-2">Support 24/7</h4>
                  <p className="text-neutral-600">Notre équipe de support technique est disponible 24h/7j pour répondre à toutes vos questions.</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6 text-accent-600" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-neutral-800 mb-2">Produits Authentiques</h4>
                  <p className="text-neutral-600">Nous ne vendons que des produits authentiques et originaux, directement importés des fabricants.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-neutral-800 mb-2">Prix Compétitifs</h4>
                  <p className="text-neutral-600">Nous proposons les meilleurs prix du marché sans compromettre la qualité de nos produits.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-6 h-6 text-accent-600" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-neutral-800 mb-2">Large Sélection</h4>
                  <p className="text-neutral-600">Une vaste gamme de produits technologiques pour répondre à tous vos besoins.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notre Histoire */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <h2 className="text-3xl font-bold font-serif text-center mb-8 text-neutral-800">Notre Histoire</h2>
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-lg text-neutral-600 leading-relaxed mb-6">
              Fondée avec la vision de démocratiser l'accès à la technologie en Algérie, 
              Elbahdja Phone est née de la passion pour l'innovation et le désir d'offrir 
              aux Algériens les meilleurs produits technologiques.
            </p>
            <p className="text-lg text-neutral-600 leading-relaxed mb-6">
              Depuis nos débuts, nous nous sommes engagés à fournir un service exceptionnel, 
              des produits de qualité et une expérience client inégalée. Notre équipe dédiée 
              travaille sans relâche pour vous offrir la meilleure expérience d'achat possible.
            </p>
            <p className="text-lg text-neutral-600 leading-relaxed">
              Aujourd'hui, nous sommes fiers d'être devenus une référence dans le domaine 
              de la technologie en Algérie, avec des milliers de clients satisfaits qui nous 
              font confiance pour tous leurs besoins technologiques.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
