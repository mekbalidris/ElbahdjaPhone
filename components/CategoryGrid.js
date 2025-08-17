import React, { useRef, useState, useEffect } from 'react';

/**
 * Custom Hook: useDragScroll
 * Enables drag-to-scroll functionality on an element.
 */
function useDragScroll(ref) {
    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        let isDown = false;
        let startX;
        let scrollLeft;

        // --- Mouse Events ---
        const onMouseDown = (e) => {
            isDown = true;
            el.classList.add('cursor-grabbing');
            startX = e.pageX - el.offsetLeft;
            scrollLeft = el.scrollLeft;
        };

        const onMouseLeaveOrUp = () => {
            isDown = false;
            el.classList.remove('cursor-grabbing');
        };

        const onMouseMove = (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - el.offsetLeft;
            const walk = (x - startX) * 2; // Scroll speed multiplier
            el.scrollLeft = scrollLeft - walk;
        };
        
        // --- Touch Events ---
        const onTouchStart = (e) => {
            isDown = true;
            startX = e.touches[0].pageX - el.offsetLeft;
            scrollLeft = el.scrollLeft;
        };

        const onTouchEnd = () => {
            isDown = false;
        };

        const onTouchMove = (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.touches[0].pageX - el.offsetLeft;
            const walk = (x - startX) * 2;
            el.scrollLeft = scrollLeft - walk;
        };

        // Add event listeners
        el.addEventListener('mousedown', onMouseDown);
        el.addEventListener('mouseleave', onMouseLeaveOrUp);
        el.addEventListener('mouseup', onMouseLeaveOrUp);
        el.addEventListener('mousemove', onMouseMove);
        el.addEventListener('touchstart', onTouchStart, { passive: true });
        el.addEventListener('touchend', onTouchEnd);
        el.addEventListener('touchmove', onTouchMove, { passive: false });

        // Cleanup function
        return () => {
            el.removeEventListener('mousedown', onMouseDown);
            el.removeEventListener('mouseleave', onMouseLeaveOrUp);
            el.removeEventListener('mouseup', onMouseLeaveOrUp);
            el.removeEventListener('mousemove', onMouseMove);
            el.removeEventListener('touchstart', onTouchStart);
            el.removeEventListener('touchend', onTouchEnd);
            el.removeEventListener('touchmove', onTouchMove);
        };
    }, [ref]);
}

/**
 * Component: CategoryMarquee
 * Renders an infinitely scrolling marquee of categories that can also be manually dragged.
 */
const CategoryMarquee = ({ categories, direction = 'left', products = [] }) => {
    const scrollContainerRef = useRef(null); // Ref for the element that will actually scroll
    const [hoveredIdx, setHoveredIdx] = useState(null);
    const [dragStart, setDragStart] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    // Apply the drag hook to the scrollable container
    useDragScroll(scrollContainerRef);

    // Duplicate categories for a seamless infinite loop effect
    const duplicatedCategories = [...categories, ...categories, ...categories, ...categories];
    const animationClass = direction === 'left' 
        ? 'animate-[marquee-left_80s_linear_infinite]' 
        : 'animate-[marquee-right_80s_linear_infinite]';

    // --- Navigation Helper ---
    const handleNavigation = (cat) => {
        const queryMap = {
            'iphones': 'category=phones&brand=apple',
            'xiaomi': 'category=phones&brand=xiaomi',
            'samsung': 'category=phones&brand=samsung',
            'anti-choc': 'category=accessories&type=anti-choc',
            'headphones': 'category=accessories&type=headphones',
            'cases': 'category=accessories&type=cases',
        };
        const query = queryMap[cat.key] || `category=${encodeURIComponent(cat.filter)}`;
        window.location.href = `/products?${query}`;
    };

    // --- Event Handlers to Differentiate Click vs. Drag ---
    const handlePointerDown = (e) => {
        const pageX = e.touches ? e.touches[0].pageX : e.pageX;
        const pageY = e.touches ? e.touches[0].pageY : e.pageY;
        setDragStart({ x: pageX, y: pageY });
        setIsDragging(false);
    };

    const handlePointerMove = (e) => {
        if (!dragStart) return;
        const pageX = e.touches ? e.touches[0].pageX : e.pageX;
        const pageY = e.touches ? e.touches[0].pageY : e.pageY;
        if (Math.abs(pageX - dragStart.x) > 5 || Math.abs(pageY - dragStart.y) > 5) {
            setIsDragging(true);
        }
    };

    const handlePointerUp = (cat) => () => {
        if (!isDragging) {
            handleNavigation(cat);
        }
        setDragStart(null);
        setIsDragging(false);
    };

    return (
        <div className="w-full group py-2 relative bg-gradient-to-r from-orange-300 to-purple-500 overflow-hidden rounded-xl">
            {/* This new container handles the manual dragging */}
            <div
                ref={scrollContainerRef}
                className="overflow-x-auto scrollbar-hide cursor-grab"
                onMouseDown={() => scrollContainerRef.current.style.animationPlayState = 'paused'}
                onMouseUp={() => scrollContainerRef.current.style.animationPlayState = 'running'}
            >
                {/* This inner container handles the CSS animation */}
                <div
                    className={`flex w-max group-hover:[animation-play-state:paused] ${animationClass}`}
                    style={{ willChange: 'transform' }}
                >
                    {duplicatedCategories.map((cat, idx) => {
                        const product = products.find(p => {
                            const catVal = (p.category || '').toLowerCase();
                            const brandVal = (p.brand || '').toLowerCase();
                            if (cat.key === 'iphones') return brandVal === 'apple' && catVal === 'phones';
                            if (cat.key === 'xiaomi') return brandVal === 'xiaomi' && catVal === 'phones';
                            if (cat.key === 'samsung') return brandVal === 'samsung' && catVal === 'phones';
                            if (cat.key === 'anti-choc') return catVal === 'accessories' && p.type === 'anti-choc';
                            if (cat.key === 'headphones') return catVal === 'accessories' && (p.type === 'headphones' || p.type === 'casques');
                            return catVal === cat.filter.toLowerCase();
                        });
                        const image = product?.images?.[0];

                        const fallbackImages = {
                            'phones': '/images/categories/phones.jpg',
                            'laptops': '/images/categories/laptops.jpg',
                            'accessories': '/images/categories/gadgets.jpg',
                            'watch': '/images/categories/headphones.jpg',
                        };
                        const categoryImage = image || fallbackImages[cat.key] || '/images/categories/gadgets.jpg';
                        const showHover = hoveredIdx === idx && !isDragging;

                        return (
                            <div
                                key={`${cat.key}-${idx}`}
                                className="flex-shrink-0 flex flex-col items-center w-44 h-44 sm:w-56 sm:h-56 bg-white rounded-xl mx-2 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300"
                                role="button"
                                tabIndex={0}
                                onMouseDown={handlePointerDown}
                                onMouseMove={handlePointerMove}
                                onMouseUp={handlePointerUp(cat)}
                                onTouchStart={handlePointerDown}
                                onTouchMove={handlePointerMove}
                                onTouchEnd={handlePointerUp(cat)}
                                onKeyPress={(e) => e.key === 'Enter' && handleNavigation(cat)}
                                onMouseEnter={() => setHoveredIdx(idx)}
                                onMouseLeave={() => setHoveredIdx(null)}
                                onDragStart={(e) => e.preventDefault()}
                            >
                                <div className="relative overflow-hidden rounded-xl w-full h-full flex items-center justify-center pointer-events-none">
                                    <img
                                        src={categoryImage}
                                        alt={cat.title}
                                        className="absolute inset-0 w-full h-full object-cover"
                                        onError={(e) => { e.target.src = '/images/categories/gadgets.jpg'; }}
                                        draggable="false"
                                    />
                                    {showHover && (
                                        <>
                                            <div className="absolute inset-0 z-20 backdrop-blur-sm bg-black/20"></div>
                                            <div className="absolute inset-0 flex items-center justify-center z-30">
                                                <span className="px-4 py-2 bg-amber-500 text-white font-semibold text-base rounded-full shadow-lg">
                                                    {`Voir les ${cat.title}`}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <h3 className="mt-2 text-lg font-semibold text-neutral-800 truncate text-center pointer-events-none">
                                    {cat.title}
                                </h3>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

/**
 * Component: CategoryGrid
 * The main component that assembles the category sections.
 */
const CategoryGrid = ({ products = [] }) => {
    const mainCategories = [
        { title: 'Xiaomi', key: 'xiaomi', filter: 'xiaomi' },
        { title: 'Samsung', key: 'samsung', filter: 'samsung' },
        { title: 'iPhones', key: 'iphones', filter: 'iphones' },
        { title: 'Laptops', key: 'laptops', filter: 'laptops' }
    ];

    const accessoryCategories = [
        { title: 'Anti-Choc', key: 'anti-choc', filter: 'anti-choc' },
        { title: 'Casques', key: 'headphones', filter: 'headphones' },
        { title: 'Accessoires', key: 'accessories', filter: 'accessories' }
    ];

    return (
        <section className="space-y-8 mb-16">
            <div>
                <h2 className="text-2xl font-serif font-bold text-center mb-6 text-gray-800">CATÉGORIES PRINCIPALES</h2>
                <CategoryMarquee categories={mainCategories} direction="left" products={products} />
            </div>

            <div>
                <h2 className="text-2xl font-serif font-bold text-center mb-6 text-gray-800">ACCESSOIRES</h2>
                <CategoryMarquee categories={accessoryCategories} direction="right" products={products} />
            </div>

            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                @keyframes marquee-left { 
                    0% { transform: translateX(0%); } 
                    100% { transform: translateX(-50%); } 
                }
                @keyframes marquee-right { 
                    0% { transform: translateX(-50%); } 
                    100% { transform: translateX(0%); } 
                }
            `}</style>
        </section>
    );
};

export default CategoryGrid;
