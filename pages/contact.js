import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Facebook, Instagram, Mail, Phone, MapPin, Clock, MessageSquare, Send } from 'lucide-react';

const Contact = () => {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ nom: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSent(false);
    setLoading(true);
    try {
      const res = await fetch(`/api/support/messages?userId=guest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: form.nom,
          userEmail: form.email,
          subject: form.subject,
          message: form.message,
          isGuest: true,
          userId: null
        })
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Erreur lors de l\'envoi du message.');
      setSent(true);
      setForm({ nom: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 pt-20">
        <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-xl w-full text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold font-serif mb-4 text-neutral-800">Contactez-nous</h2>
            <p className="text-lg text-neutral-600 mb-6">Vous êtes connecté. Pour contacter le support, veuillez utiliser le formulaire dans votre profil.</p>
            <Link href="/profile#support-form" className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-3 rounded-xl transition text-lg shadow-md inline-block">
              Aller au support
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 pt-20">
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4 text-neutral-800">
            Contactez <span className="text-primary-500">Elbahdja</span><span className="text-accent-500">Phone</span>
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Notre équipe est là pour vous accompagner dans tous vos besoins technologiques. 
            N'hésitez pas à nous contacter pour toute question ou assistance.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
              <h3 className="text-2xl font-bold font-serif mb-6 text-neutral-800">Informations de contact</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-800 mb-1">Téléphone</h4>
                    <p className="text-neutral-600">+213 XXX XXX XXX</p>
                    <p className="text-sm text-neutral-500">Support technique 24h/7j</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-accent-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-800 mb-1">Email</h4>
                    <p className="text-neutral-600">contact@elbahdjaphone.dz</p>
                    <p className="text-sm text-neutral-500">Réponse sous 24h</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-800 mb-1">Adresse</h4>
                    <p className="text-neutral-600">Alger, Algérie</p>
                    <p className="text-sm text-neutral-500">Livraison dans les 58 wilayas</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-accent-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-800 mb-1">Horaires</h4>
                    <p className="text-neutral-600">Lun - Sam: 9h00 - 18h00</p>
                    <p className="text-sm text-neutral-500">Support en ligne 24h/7j</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
              <h3 className="text-2xl font-bold font-serif mb-6 text-neutral-800">Suivez-nous</h3>
              <div className="space-y-4">
                <a href="#" className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                  <Facebook className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-semibold text-neutral-800">Facebook</p>
                    <p className="text-sm text-neutral-600">Elbahdja Phone Algérie</p>
                  </div>
                </a>
                <a href="#" className="flex items-center gap-4 p-4 bg-pink-50 rounded-xl hover:bg-pink-100 transition-colors">
                  <Instagram className="w-6 h-6 text-pink-600" />
                  <div>
                    <p className="font-semibold text-neutral-800">Instagram</p>
                    <p className="text-sm text-neutral-600">@elbahdjaphone</p>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold font-serif text-neutral-800">Envoyez-nous un message</h3>
              <p className="text-neutral-600 mt-2">Nous vous répondrons dans les plus brefs délais</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-neutral-800 font-semibold mb-2">Nom complet <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="nom" 
                  value={form.nom} 
                  onChange={handleChange} 
                  required 
                  placeholder="Votre nom complet" 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 transition-all" 
                />
              </div>

              <div>
                <label className="block text-neutral-800 font-semibold mb-2">Email <span className="text-red-500">*</span></label>
                <input 
                  type="email" 
                  name="email" 
                  value={form.email} 
                  onChange={handleChange} 
                  required 
                  placeholder="votre.email@exemple.com" 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 transition-all" 
                />
              </div>

              <div>
                <label className="block text-neutral-800 font-semibold mb-2">Sujet <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="subject" 
                  value={form.subject} 
                  onChange={handleChange} 
                  required 
                  placeholder="Sujet de votre message" 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 transition-all" 
                />
              </div>

              <div>
                <label className="block text-neutral-800 font-semibold mb-2">Message <span className="text-red-500">*</span></label>
                <textarea 
                  name="message" 
                  value={form.message} 
                  onChange={handleChange} 
                  rows={5} 
                  required 
                  placeholder="Décrivez votre demande ou question..." 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 transition-all resize-none" 
                />
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-gradient-to-r from-primary-500 to-accent-600 hover:from-primary-600 hover:to-accent-700 text-white font-semibold px-6 py-4 rounded-xl transition-all text-lg shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-105"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Envoi en cours...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Send className="w-5 h-5" />
                    Envoyer le message
                  </div>
                )}
              </button>

              {sent && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <p className="text-green-700 font-semibold">✅ Message envoyé avec succès !</p>
                  <p className="text-green-600 text-sm mt-1">Nous vous répondrons dans les plus brefs délais.</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                  <p className="text-red-700 font-semibold">❌ Erreur lors de l'envoi</p>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 