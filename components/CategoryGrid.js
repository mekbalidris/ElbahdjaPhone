import React, { useRef, useState } from 'react';
import { useRouter } from 'next/router';

const ALL_CATEGORIES = [
  { key: 'tshirts', title: 'T-shirts', filter: 'tshirts' },
  { key: 'pantalons', title: 'Pantalons', filter: 'pantalons' },
  { key: 'chaussures', title: 'Chaussures', filter: 'chaussures' },
  { key: 'vestes', title: 'Vestes', filter: 'vestes' },
  { key: 'accessoires', title: 'Accessoires', filter: 'accessoires' },
  { key: 'short', title: 'Short', filter: 'short' },
];

const PLACEHOLDER = '/public/images/categories/placeholder.jpg';

const CategoryMarquee = ({ categories, direction = 'left', products }) => {
  const marqueeRef = useRef(null);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const animationClass = direction === 'left'
    ? 'animate-[marquee-left_30s_linear_infinite]'
    : 'animate-[marquee-right_30s_linear_infinite]';
  return (
    <div className="w-full overflow-hidden group py-2">
      <div
        ref={marqueeRef}
        className={`flex w-max group-hover:[animation-play-state:paused] ${animationClass}`}
        style={{ willChange: 'transform' }}
      >
        {[...categories, ...categories].map((cat, idx) => {
          // Find first product in this category
          const product = products.find(p => (p.category || '').toLowerCase() === cat.filter);
          const image = product && product.images && product.images.length > 0 ? product.images[0] : null;
          return (
            <div
              key={cat.key + '-' + idx}
              className="flex-shrink-0 w-48 sm:w-56 px-2 cursor-pointer"
              onClick={() => window.location.href = `/products?category=${encodeURIComponent(cat.filter)}`}
              tabIndex={0}
              role="button"
              onKeyPress={e => { if (e.key === 'Enter') window.location.href = `/products?category=${encodeURIComponent(cat.filter)}`; }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className="relative overflow-hidden rounded-xl shadow bg-white hover:shadow-lg transition-all">
                <div className="relative w-full aspect-square bg-gray-100 flex items-center justify-center">
                  {image ? (
                    <img
                      src={image}
                      alt={cat.title}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-gray-400 text-lg font-bold">{cat.title}</span>
                  )}
                </div>
                <div className={`absolute inset-0 flex items-center justify-center bg-black transition-all duration-300 ${hoveredIdx === idx ? 'bg-opacity-40' : 'bg-opacity-0'}`}>
                  <span className={`text-white font-bold transition-opacity duration-300 px-4 py-2 bg-orange-600 rounded-md ${hoveredIdx === idx ? 'opacity-100' : 'opacity-0'}`}>
                    Voir {cat.title}
                  </span>
                </div>
              </div>
              <h3 className="mt-2 text-base font-semibold text-gray-700 truncate text-center">{cat.title}</h3>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CategoryGrid = ({ products = [] }) => {
  // Split categories for two rows
  const half = Math.ceil(ALL_CATEGORIES.length / 2);
  const row1 = ALL_CATEGORIES.slice(0, half);
  const row2 = ALL_CATEGORIES.slice(half);

  return (
    <section className="mb-16">
      <h2 className="text-3xl font-serif font-bold text-center mb-6">Catégories</h2>
      <CategoryMarquee categories={row1} direction="left" products={products} />
      <CategoryMarquee categories={row2} direction="right" products={products} />
      <style jsx global>{`
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </section>
  );
};

export default CategoryGrid; 