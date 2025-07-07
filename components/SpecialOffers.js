import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useSwipeable } from 'react-swipeable';

const FADE_DURATION = 300; // ms

function OfferCard({ pack, cardClassName = '' }) {
  const router = useRouter();
  const images = pack.images && pack.images.length > 0 ? pack.images : ['/public/images/categories/placeholder.jpg'];
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 640;
  // Remove hover/fade logic for mobile
  return (
    <div
      className={`bg-white rounded-2xl shadow hover:shadow-xl transition flex flex-col items-center relative cursor-pointer border border-gray-200 ${cardClassName}`}
      style={isMobile ? { minWidth: '100%', maxWidth: '100%' } : {}}
      onClick={() => router.push(`/products/${pack._id}`)}
      tabIndex={0}
      role="button"
      onKeyPress={e => { if (e.key === 'Enter') router.push(`/products/${pack._id}`); }}
    >
      <div className="relative w-full aspect-[4/5] bg-gray-100 rounded-t-2xl overflow-hidden flex items-center justify-center">
        <Image
          src={images[0]}
          alt={pack.name}
          fill
          sizes="100vw"
          className="object-cover object-center w-full h-full transition-transform duration-300"
          onError={(e) => { e.target.src = '/public/images/categories/placeholder.jpg'; }}
        />
        <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider animate-pulse shadow-lg">
          Promo
        </span>
        {pack.pairs && (
          <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">{pack.pairs} PAIRES À {pack.price?.toLocaleString()} DA</span>
        )}
      </div>
      <div className="py-3 px-2 text-center w-full">
        <h3 className="text-base font-semibold text-gray-800 mb-1 truncate">{pack.name}</h3>
        <div className="flex items-center justify-center gap-2">
          <span className="text-lg font-bold text-gray-900">{pack.price?.toLocaleString()} DA</span>
          {pack.oldPrice && (
            <span className="text-gray-400 line-through text-sm">{pack.oldPrice?.toLocaleString()} DA</span>
          )}
        </div>
      </div>
    </div>
  );
}

const SpecialOffers = ({ products = [] }) => {
  // Filter products with an offer (oldPrice or offer flag)
  const packs = products.filter(p => p.offer || p.oldPrice);
  const [page, setPage] = useState(1);
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 640;
  const offersPerPage = isMobile ? 2 : 4;
  const totalPages = Math.ceil(packs.length / offersPerPage);
  const paginatedPacks = packs.slice((page - 1) * offersPerPage, page * offersPerPage);

  const handlePrev = () => setPage(p => Math.max(1, p - 1));
  const handleNext = () => setPage(p => Math.min(totalPages, p + 1));

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [packs.length, totalPages]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleNext(),
    onSwipedRight: () => handlePrev(),
    trackMouse: false,
  });

  return (
    <section className="mb-16">
      <h2 className="text-3xl font-serif font-bold text-center mb-2">OFFRE EXCEPTIONNELLE</h2>
      <p className="text-center text-gray-600 mb-8">Découvrez nos packs, soigneusement sélectionnés pour vous</p>
      <div className="relative">
        <div className={`grid ${isMobile ? 'grid-cols-2 gap-4' : 'grid-cols-4 gap-6'} justify-items-center w-full`}>
          {packs.length === 0 ? (
            <div className="text-gray-500 text-center w-full">Aucune offre spéciale pour le moment.</div>
          ) : (
            paginatedPacks.map((pack) => (
              <OfferCard key={pack._id} pack={pack} cardClassName={isMobile ? 'w-40 h-60' : 'w-56 h-72'} />
            ))
          )}
        </div>
        {totalPages > 1 && (
          <>
            <button
              onClick={handlePrev}
              disabled={page === 1}
              className="absolute left-[-2rem] top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow text-gray-700 z-10"
              style={{ display: page === 1 ? 'none' : 'block' }}
              aria-label="Précédent"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <button
              onClick={handleNext}
              disabled={page === totalPages}
              className="absolute right-[-2rem] top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow text-gray-700 z-10"
              style={{ display: page === totalPages ? 'none' : 'block' }}
              aria-label="Suivant"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
            </button>
          </>
        )}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-4">
          <span className="px-2 py-2 font-semibold">Page {page} / {totalPages}</span>
        </div>
      )}
    </section>
  );
};

export default SpecialOffers; 