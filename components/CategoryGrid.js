import React, { useRef, useState } from 'react';
import { useRouter } from 'next/router';

const ALL_CATEGORIES = [
  { key: 'tshirts', title: 'T-shirts', filter: 'tshirts' },
  { key: 'pantalons', title: 'Pantalons', filter: 'pantalons' },
  { key: 'jeans', title: 'Jeans', filter: 'jeans' },
  { key: 'chaussures', title: 'Chaussures', filter: 'chaussures' },
  { key: 'vestes', title: 'Vestes', filter: 'vestes' },
  { key: 'accessoires', title: 'Accessoires', filter: 'accessoires' },
  { key: 'short', title: 'Short', filter: 'short' },
  { key: 'chapeau', title: 'Chapeau', filter: 'chapeau' },
  { key: 'casquette', title: 'Casquette', filter: 'casquette' },
  { key: 'hoodie', title: 'Hoodie', filter: 'hoodie' },
  { key: 'gilet_ceinture', title: 'Gilet ceinturé', filter: 'gilet_ceinture' },
];

const PLACEHOLDER = '/public/images/categories/placeholder.jpg';

function useDragScroll(ref) {
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let isDown = false;
    let startX;
    let scrollLeft;
    const onMouseDown = (e) => {
      isDown = true;
      el.classList.add('cursor-grabbing');
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
    };
    const onMouseLeave = () => {
      isDown = false;
      el.classList.remove('cursor-grabbing');
    };
    const onMouseUp = () => {
      isDown = false;
      el.classList.remove('cursor-grabbing');
    };
    const onMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.5;
      el.scrollLeft = scrollLeft - walk;
    };
    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('mouseleave', onMouseLeave);
    el.addEventListener('mouseup', onMouseUp);
    el.addEventListener('mousemove', onMouseMove);
    // Touch events
    let touchStartX = 0;
    let touchScrollLeft = 0;
    const onTouchStart = (e) => {
      isDown = true;
      touchStartX = e.touches[0].pageX;
      touchScrollLeft = el.scrollLeft;
    };
    const onTouchEnd = () => { isDown = false; };
    const onTouchMove = (e) => {
      if (!isDown) return;
      const x = e.touches[0].pageX;
      const walk = (x - touchStartX) * 1.5;
      el.scrollLeft = touchScrollLeft - walk;
    };
    el.addEventListener('touchstart', onTouchStart);
    el.addEventListener('touchend', onTouchEnd);
    el.addEventListener('touchmove', onTouchMove);
    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('mouseleave', onMouseLeave);
      el.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchmove', onTouchMove);
    };
  }, [ref]);
}

const CategoryMarquee = ({ categories, direction = 'left', products }) => {
  const scrollRef = useRef(null);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  // Duplicate categories 4 times for infinite effect
  const duplicatedCategories = [...categories, ...categories, ...categories, ...categories];
  const animationClass = direction === 'left'
    ? 'animate-[marquee-left_40s_linear_infinite]'
    : 'animate-[marquee-right_40s_linear_infinite]';
  useDragScroll(scrollRef);

  // Drag/click distinction state
  const [dragStart, setDragStart] = useState(null);
  const [dragMoved, setDragMoved] = useState(false);

  // Helper for click/drag distinction
  const handleCategoryMouseDown = (e) => {
    setDragStart({ x: e.pageX, y: e.pageY });
    setDragMoved(false);
  };
  const handleCategoryMouseMove = (e) => {
    if (!dragStart) return;
    if (Math.abs(e.pageX - dragStart.x) > 5 || Math.abs(e.pageY - dragStart.y) > 5) {
      setDragMoved(true);
    }
  };
  const handleCategoryMouseUp = (cat) => (e) => {
    if (!dragMoved) {
      window.location.href = `/products?category=${encodeURIComponent(cat.filter)}`;
    }
    setDragStart(null);
    setDragMoved(false);
  };
  // Touch
  const handleCategoryTouchStart = (e) => {
    const touch = e.touches[0];
    setDragStart({ x: touch.pageX, y: touch.pageY });
    setDragMoved(false);
  };
  const handleCategoryTouchMove = (e) => {
    if (!dragStart) return;
    const touch = e.touches[0];
    if (Math.abs(touch.pageX - dragStart.x) > 5 || Math.abs(touch.pageY - dragStart.y) > 5) {
      setDragMoved(true);
    }
  };
  const handleCategoryTouchEnd = (cat) => (e) => {
    if (!dragMoved) {
      window.location.href = `/products?category=${encodeURIComponent(cat.filter)}`;
    }
    setDragStart(null);
    setDragMoved(false);
  };

  return (
    <div className="w-full group py-2 relative">
      {/* Fade overlays */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-12 z-10" style={{background: 'linear-gradient(to right, #fff 80%, transparent)'}} />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-12 z-10" style={{background: 'linear-gradient(to left, #fff 80%, transparent)'}} />
      <div
        ref={scrollRef}
        className="overflow-x-auto scrollbar-hide"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div
          className={`flex w-max group-hover:[animation-play-state:paused] ${animationClass} cursor-grab select-none`}
          style={{ willChange: 'transform' }}
        >
          {duplicatedCategories.map((cat, idx) => {
            const product = products.find(p => (p.category || '').toLowerCase() === cat.filter);
            const image = product && product.images && product.images.length > 0 ? product.images[0] : null;
            return (
              <div
                key={cat.key + '-' + idx}
                className="flex-shrink-0 w-48 sm:w-56 px-2 cursor-pointer"
                tabIndex={0}
                role="button"
                onMouseDown={handleCategoryMouseDown}
                onMouseMove={handleCategoryMouseMove}
                onMouseUp={handleCategoryMouseUp(cat)}
                onTouchStart={handleCategoryTouchStart}
                onTouchMove={handleCategoryTouchMove}
                onTouchEnd={handleCategoryTouchEnd(cat)}
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
    </div>
  );
};

const CategoryGrid = ({ products = [] }) => {
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
          100% { transform: translateX(-25%); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(-25%); }
          100% { transform: translateX(0); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
};

export default CategoryGrid; 