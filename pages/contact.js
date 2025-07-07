import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Facebook, Instagram, Mail } from 'lucide-react';

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
      <div className="container mx-auto px-4 py-12 min-h-screen flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-xl w-full text-center">
          <h2 className="text-3xl font-bold font-serif mb-4 text-blue-900">Contactez-nous</h2>
          <p className="text-lg text-gray-700 mb-6">Vous êtes connecté. Pour contacter le support, veuillez utiliser le formulaire dans votre profil.</p>
          <Link href="/profile#support-form" className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded-xl transition text-lg shadow-md inline-block">Aller au support</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen flex flex-col md:flex-row gap-12">
      {/* Formulaire de contact */}
      <div className="flex-1 max-w-xl mx-auto md:mx-0">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <h2 className="text-3xl font-bold font-serif text-center mb-8 text-blue-900">Contactez-nous</h2>
          <div className="mb-5">
            <label className="block text-gray-800 font-semibold mb-2">Nom (ou le nom de votre société) <span className="text-red-500">*</span></label>
            <input type="text" name="nom" value={form.nom} onChange={handleChange} required placeholder="Votre nom" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-700 bg-gray-50" />
          </div>
          <div className="mb-5">
            <label className="block text-gray-800 font-semibold mb-2">E-mail <span className="text-red-500">*</span></label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="Votre e-mail" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-700 bg-gray-50" />
          </div>
          <div className="mb-5">
            <label className="block text-gray-800 font-semibold mb-2">Sujet <span className="text-red-500">*</span></label>
            <input type="text" name="subject" value={form.subject} onChange={handleChange} required placeholder="Sujet du message" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-700 bg-gray-50" />
          </div>
          <div className="mb-5">
            <label className="block text-gray-800 font-semibold mb-2">Message <span className="text-red-500">*</span></label>
            <textarea name="message" value={form.message} onChange={handleChange} rows={5} required placeholder="Votre message..." className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-700 bg-gray-50" />
          </div>
          <p className="text-gray-500 text-sm mb-6 text-center">Nous sommes là pour vous. Indiquez vos besoins et vos attentes, et nous vous répondrons rapidement.</p>
          <button type="submit" disabled={loading} className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded-xl transition text-lg shadow-md disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? 'Envoi en cours...' : 'Envoyer'}
          </button>
          {sent && <p className="text-green-600 mt-4 text-center">Merci pour votre message ! Nous vous répondrons rapidement.</p>}
          {error && <p className="text-red-600 mt-4 text-center">{error}</p>}
        </form>
      </div>
      {/* Informations de contact */}
      <div className="flex-1 flex flex-col justify-center items-center md:items-start">
        <div className="text-2xl font-serif font-semibold mb-6 text-center md:text-left">Vous pouvez nous contacter sur nos pages</div>
        <div className="mb-4 text-lg space-y-2">
          <div className="flex items-center gap-2"><Facebook className="w-6 h-6 text-blue-600" /> Facebook : <span className="font-medium">Arena Fashion Algerie</span></div>
          <div className="flex items-center gap-2"><Instagram className="w-6 h-6 text-pink-600" /> Instagram : <span className="font-medium">ArenaFashion_algerie</span></div>
        </div>
        <div className="mb-4 text-lg">24/24h et 7/7j</div>
        <div className="mb-4 text-lg flex items-center gap-2">
          <Mail className="w-6 h-6 text-gray-700" />
          <span>Adresse mail :</span>
          <span className="font-medium">contact@arenafashion.dz</span>
        </div>
      </div>
    </div>
  );
};

export default Contact; 