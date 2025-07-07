import React, { useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import Icon from './ui/Icon';

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
    // Duplicate categories for infinite effect
    const duplicatedCategories = [...categories, ...categories];
    const animationClass = direction === 'left'
        ? 'animate-[marquee-left_40s_linear_infinite]'
        : 'animate-[marquee-right_40s_linear_infinite]';
    useDragScroll(scrollRef);

    // Drag/click distinction state
    const [dragStart, setDragStart] = useState(null);
    const [dragMoved, setDragMoved] = useState(false);

    const router = useRouter();

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
            // Only navigate if not dragged
            const normalizedCategory = cat.filter.replace(/-/g, '').toLowerCase();
            router.push(`/products?category=${encodeURIComponent(normalizedCategory)}`);
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
            const normalizedCategory = cat.filter.replace(/-/g, '').toLowerCase();
            router.push(`/products?category=${encodeURIComponent(normalizedCategory)}`);
        }
        setDragStart(null);
        setDragMoved(false);
    };

    return (
        <div className="w-full group py-2 relative bg-black overflow-hidden">
            {/* Remove fade overlays */}
            <div
                ref={scrollRef}
                className="overflow-x-auto scrollbar-hide"
                style={{ WebkitOverflowScrolling: 'touch' }}
            >
                <div
                    className={`flex w-max group-hover:[animation-play-state:paused] ${animationClass} cursor-grab select-none`}
                    style={{ willChange: 'transform', minWidth: '100%' }}
                >
                    {duplicatedCategories.map((cat, idx) => {
                        const product = products.find(p => {
                            const catVal = (p.category || '').replace(/-/g, '').toLowerCase();
                            const filterVal = cat.filter.replace(/-/g, '').toLowerCase();
                            return catVal === filterVal;
                        });
                        const image = product && product.images && product.images.length > 0 ? product.images[0] : null;
                        const isChaussures = cat.key === 'chaussures';
                        const categoryImage = (isChaussures && (!image || image.includes('yellow') || image.includes('gold')))
                            ? '/images/categories/gadgets.jpg'
                            : (image || null);
                        // Only show hover effect if not dragging/sliding
                        const showHover = hoveredIdx === idx && !dragMoved;
                        return (
                            <div
                                key={cat.key + '-' + idx}
                                className="flex flex-col items-center w-44 h-44 sm:w-56 sm:h-56 bg-black rounded-xl cursor-pointer mx-2 group"
                                tabIndex={0}
                                role="button"
                                onMouseDown={handleCategoryMouseDown}
                                onMouseMove={handleCategoryMouseMove}
                                onMouseUp={handleCategoryMouseUp(cat)}
                                onTouchStart={handleCategoryTouchStart}
                                onTouchMove={handleCategoryTouchMove}
                                onTouchEnd={handleCategoryTouchEnd(cat)}
                                onKeyPress={e => { if (e.key === 'Enter') router.push(`/products?category=${encodeURIComponent(cat.filter.replace(/-/g, '').toUpperCase())}`); }}
                                onMouseEnter={() => setHoveredIdx(idx)}
                                onMouseLeave={() => setHoveredIdx(null)}
                            >
                                <div className="relative overflow-hidden rounded-xl shadow bg-black hover:shadow-lg transition-all w-full h-full flex items-center justify-center">
                                    {categoryImage ? (
                                        <img
                                            src={categoryImage}
                                            alt={cat.title}
                                            className="object-cover w-full h-full rounded-xl"
                                            onError={e => { e.target.src = '/images/categories/gadgets.jpg'; }}
                                        />
                                    ) : (
                                        <span className="text-gray-400 text-lg font-bold">{cat.title}</span>
                                    )}
                                    {/* Show blur and button only on hovered card and not while dragging */}
                                    {showHover && (
                                        <>
                                            <div className="absolute inset-0 z-20 backdrop-blur-sm transition-all duration-200"></div>
                                            <button
                                                onClick={e => { e.stopPropagation(); router.push(`/products?category=${encodeURIComponent(cat.filter.replace(/-/g, '').toLowerCase())}`); }}
                                                className="hidden sm:flex absolute inset-0 items-center justify-center z-30"
                                                style={{ pointerEvents: 'auto' }}
                                            >
                                                <span className="px-4 py-2 bg-black/80 text-white font-semibold text-base rounded-full shadow-lg border border-accent transition-all duration-200 whitespace-nowrap"
                                                    style={{ boxShadow: '0 2px 16px 0 rgba(0,0,0,0.18)' }}
                                                >
                                                    {`Voir les ${cat.title}`}
                                                </span>
                                            </button>
                                        </>
                                    )}
                                </div>
                                <h3 className="mt-2 text-lg font-semibold text-white truncate text-center">{cat.title}</h3>
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
            <h2 className="text-3xl font-serif font-bold text-center mb-6 text-accent">Catégories</h2>
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