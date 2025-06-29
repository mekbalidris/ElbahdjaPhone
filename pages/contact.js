import React, { useState } from 'react';

const Contact = () => {
  const [form, setForm] = useState({ nom: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    // Here you would send the form data to your backend or email service
    setSent(true);
  };

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen flex flex-col md:flex-row gap-12">
      {/* Formulaire de contact */}
      <div className="flex-1 max-w-xl mx-auto md:mx-0">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md">
          <div className="mb-6">
            <label className="block text-gray-800 font-semibold mb-2">Nom (ou le nom de votre société) <span className="text-red-500">*</span></label>
            <input type="text" name="nom" value={form.nom} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-gray-700" />
          </div>
          <div className="mb-6">
            <label className="block text-gray-800 font-semibold mb-2">E-mail <span className="text-red-500">*</span></label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-gray-700" />
          </div>
          <div className="mb-6">
            <label className="block text-gray-800 font-semibold mb-2">Dites-nous ce que vous cherchez !</label>
            <textarea name="message" value={form.message} onChange={handleChange} rows={5} required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-gray-700" />
          </div>
          <p className="text-gray-500 text-sm mb-6">Que vous souhaitiez en savoir plus sur nos produits, demander une offre personnalisée, ou discuter d'un partenariat, nous sommes là pour vous. Indiquez vos besoins et vos attentes dans les champs ci-dessous, et nous vous répondrons rapidement.</p>
          <button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-2 rounded-lg transition">Envoyer</button>
          {sent && <p className="text-green-600 mt-4">Merci pour votre message ! Nous vous répondrons rapidement.</p>}
        </form>
      </div>
      {/* Informations de contact */}
      <div className="flex-1 flex flex-col justify-center items-center md:items-start">
        <div className="text-2xl font-serif font-semibold mb-6 text-center md:text-left">Vous pouvez nous contacter sur nos pages</div>
        <div className="mb-4 text-lg">
          <div>Facebook : <span className="font-medium">Cosmos Algerie</span></div>
          <div>Instagram : <span className="font-medium">Cosmos_algerie</span></div>
        </div>
        <div className="mb-4 text-lg">24/24h et 7/7j</div>
        <div className="mb-4 text-lg">
          Adresse mail :<br />
          <span className="font-medium">Cosmosbyagates@gmail.com</span>
        </div>
      </div>
    </div>
  );
};

export default Contact; 