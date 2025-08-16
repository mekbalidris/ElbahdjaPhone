import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

const FADE_DURATION = 300; // ms

function OfferCard({ pack, cardClassName = '' }) {
  const router = useRouter();
  const images = pack.images && pack.images.length > 0 ? pack.images : ['/public/images/categories/placeholder.jpg'];
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 640;
  
  return (
    <div
      className={`bg-white rounded-2xl shadow hover:shadow-xl transition flex flex-col items-center relative cursor-pointer border border-gray-200 ${cardClassName}`}
      style={isMobile ? { minWidth: '160px', maxWidth: '160px' } : {}}
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
          <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">{pack.pairs} UNITÉS À {pack.price?.toLocaleString()} DA</span>
        )}
        {/* Old price positioned at bottom right of image on mobile */}
        {isMobile && pack.oldPrice && (
          <div className="absolute bottom-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
            <span className="line-through">{pack.oldPrice?.toLocaleString()} DA</span>
          </div>
        )}
      </div>
      <div className="py-3 px-2 text-center w-full">
        <h3 className="text-base font-semibold text-gray-800 mb-1 truncate">{pack.name}</h3>
        <div className="flex items-center justify-center gap-2">
          <span className="text-lg font-bold text-gray-900">{pack.price?.toLocaleString()} DA</span>
          {/* Show old price below current price only on desktop */}
          {!isMobile && pack.oldPrice && (
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
  const scrollRef = useRef(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 640;
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerView = isMobile ? 2 : 4;
  const totalPages = Math.ceil(packs.length / itemsPerView);

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(totalPages - 1, prev + 1));
  };

  // Touch scroll functionality
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || !isMobile) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    const handleMouseDown = (e) => {
      isDown = true;
      scrollContainer.style.cursor = 'grabbing';
      startX = e.pageX - scrollContainer.offsetLeft;
      scrollLeft = scrollContainer.scrollLeft;
    };

    const handleMouseLeave = () => {
      isDown = false;
      scrollContainer.style.cursor = 'grab';
    };

    const handleMouseUp = () => {
      isDown = false;
      scrollContainer.style.cursor = 'grab';
    };

    const handleMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - scrollContainer.offsetLeft;
      const walk = (x - startX) * 2; // Scroll speed multiplier
      scrollContainer.scrollLeft = scrollLeft - walk;
    };

    // Touch events
    const handleTouchStart = (e) => {
      isDown = true;
      startX = e.touches[0].pageX - scrollContainer.offsetLeft;
      scrollLeft = scrollContainer.scrollLeft;
    };

    const handleTouchEnd = () => {
      isDown = false;
    };

    const handleTouchMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.touches[0].pageX - scrollContainer.offsetLeft;
      const walk = (x - startX) * 2; // Scroll speed multiplier
      scrollContainer.scrollLeft = scrollLeft - walk;
    };

    // Add event listeners
    scrollContainer.addEventListener('mousedown', handleMouseDown);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);
    scrollContainer.addEventListener('mouseup', handleMouseUp);
    scrollContainer.addEventListener('mousemove', handleMouseMove);
    scrollContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
    scrollContainer.addEventListener('touchend', handleTouchEnd);
    scrollContainer.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      scrollContainer.removeEventListener('mousedown', handleMouseDown);
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
      scrollContainer.removeEventListener('mouseup', handleMouseUp);
      scrollContainer.removeEventListener('mousemove', handleMouseMove);
      scrollContainer.removeEventListener('touchstart', handleTouchStart);
      scrollContainer.removeEventListener('touchend', handleTouchEnd);
      scrollContainer.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isMobile]);

  return (
    <section className="mb-16">
      <h2 className="text-3xl font-serif font-bold text-center mb-2 text-accent-700">OFFRES SPÉCIALES</h2>
      <p className="text-center text-neutral-600 mb-8">Découvrez nos produits en promotion, soigneusement sélectionnés pour vous</p>
      
      {packs.length === 0 ? (
        <div className="text-neutral-500 text-center w-full">Aucune offre spéciale pour le moment.</div>
      ) : isMobile ? (
        // Mobile: Horizontal scrollable container with arrows
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing"
            style={{
              WebkitOverflowScrolling: 'touch',
              scrollBehavior: 'smooth',
              scrollSnapType: 'x mandatory'
            }}
          >
            {packs.map((pack) => (
              <div key={pack._id} style={{ scrollSnapAlign: 'start' }}>
                <OfferCard pack={pack} cardClassName="w-40 h-60" />
              </div>
            ))}
          </div>
          
          {/* Navigation Arrows */}
          {totalPages > 1 && (
            <>
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow-lg text-gray-700 z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ display: currentIndex === 0 ? 'none' : 'block' }}
                aria-label="Précédent"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex === totalPages - 1}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow-lg text-gray-700 z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ display: currentIndex === totalPages - 1 ? 'none' : 'block' }}
                aria-label="Suivant"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </>
          )}
        </div>
      ) : (
        // Desktop: Grid layout
        <div className="grid grid-cols-4 gap-6 justify-items-center w-full">
          {packs.map((pack) => (
            <OfferCard key={pack._id} pack={pack} cardClassName="w-56 h-72" />
          ))}
        </div>
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default SpecialOffers; 