import React, { useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import Icon from './ui/Icon';

const PLACEHOLDER = '/images/categories/placeholder.jpg';


function useDragScroll(ref) {
    React.useEffect(() => {
        const el = ref.current;
        if (!el) return;
        
        let isDown = false;
        let startX;
        let scrollLeft;
        let animationPaused = false;
        
        const pauseAnimation = () => {
            if (!animationPaused) {
                el.style.animationPlayState = 'paused';
                animationPaused = true;
            }
        };
        
        const resumeAnimation = () => {
            if (animationPaused) {
                el.style.animationPlayState = 'running';
                animationPaused = false;
            }
        };
        
        const onMouseDown = (e) => {
            isDown = true;
            el.classList.add('cursor-grabbing');
            startX = e.pageX - el.offsetLeft;
            scrollLeft = el.scrollLeft;
            pauseAnimation();
        };
        
        const onMouseLeave = () => {
            if (isDown) {
                isDown = false;
                el.classList.remove('cursor-grabbing');
                resumeAnimation();
            }
        };
        
        const onMouseUp = () => {
            if (isDown) {
                isDown = false;
                el.classList.remove('cursor-grabbing');
                resumeAnimation();
            }
        };
        
        const onMouseMove = (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - el.offsetLeft;
            const walk = (x - startX) * 1.5; // Reduced sensitivity for smoother scrolling
            el.scrollLeft = scrollLeft - walk;
        };
        
        // Touch events with improved responsiveness
        let touchStartX = 0;
        let touchScrollLeft = 0;
        let touchStartTime = 0;
        
        const onTouchStart = (e) => {
            isDown = true;
            touchStartX = e.touches[0].pageX;
            touchScrollLeft = el.scrollLeft;
            touchStartTime = Date.now();
            pauseAnimation();
        };
        
        const onTouchEnd = () => {
            if (isDown) {
                isDown = false;
                resumeAnimation();
            }
        };
        
        const onTouchMove = (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.touches[0].pageX;
            const walk = (x - touchStartX) * 1.5; // Reduced sensitivity for smoother scrolling
            el.scrollLeft = touchScrollLeft - walk;
        };
        
        el.addEventListener('mousedown', onMouseDown);
        el.addEventListener('mouseleave', onMouseLeave);
        el.addEventListener('mouseup', onMouseUp);
        el.addEventListener('mousemove', onMouseMove);
        el.addEventListener('touchstart', onTouchStart, { passive: false });
        el.addEventListener('touchend', onTouchEnd);
        el.addEventListener('touchmove', onTouchMove, { passive: false });
        
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
        ? 'animate-[marquee-left_20s_linear_infinite]'
        : 'animate-[marquee-right_20s_linear_infinite]';
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
             let query = '';
             if (cat.key === 'iphones') {
                 query = 'category=phones&brand=apple';
             } else if (cat.key === 'xiaomi') {
                 query = 'category=phones&brand=xiaomi';
             } else if (cat.key === 'samsung') {
                 query = 'category=phones&brand=samsung';
             } else if (cat.key === 'anti-choc') {
                 query = 'category=accessories&type=anti-choc';
             } else if (cat.key === 'headphones') {
                 query = 'category=accessories&type=headphones';
             } else if (cat.key === 'cases') {
                 query = 'category=accessories&type=cases';
             } else {
                 query = `category=${encodeURIComponent(cat.filter)}`;
             }
             router.push(`/products?${query}`);
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
             let query = '';
             if (cat.key === 'iphones') {
                 query = 'category=phones&brand=apple';
             } else if (cat.key === 'xiaomi') {
                 query = 'category=phones&brand=xiaomi';
             } else if (cat.key === 'samsung') {
                 query = 'category=phones&brand=samsung';
             } else if (cat.key === 'anti-choc') {
                 query = 'category=accessories&type=anti-choc';
             } else if (cat.key === 'headphones') {
                 query = 'category=accessories&type=headphones';
             } else if (cat.key === 'cases') {
                 query = 'category=accessories&type=cases';
             } else {
                 query = `category=${encodeURIComponent(cat.filter)}`;
             }
             router.push(`/products?${query}`);
         }
         setDragStart(null);
         setDragMoved(false);
     };

    return (
        
        <div className="w-full group py-2 relative bg-gradient-to-r from-primary-50 to-accent-50 overflow-hidden rounded-xl">
            {/* Remove fade overlays */}
            <div
                ref={scrollRef}
                className="overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing category-scroll-container"
                style={{ 
                    WebkitOverflowScrolling: 'touch', 
                    scrollBehavior: 'smooth',
                    scrollSnapType: 'x mandatory',
                    touchAction: 'pan-x'
                }}
            >
                <div
                    className={`flex w-max group-hover:[animation-play-state:paused] ${animationClass} select-none`}
                    style={{ willChange: 'transform', minWidth: '100%' }}
                >
                                         {duplicatedCategories.map((cat, idx) => {
                         const product = products.find(p => {
                             const catVal = (p.category || '').toLowerCase();
                             const brandVal = (p.brand || '').toLowerCase();
                             const filterVal = cat.filter.toLowerCase();
                             
                                                           // Special handling for brand-specific categories
                              if (cat.key === 'iphones') {
                                  return brandVal === 'apple' && catVal === 'phones';
                              }
                              if (cat.key === 'xiaomi') {
                                  return brandVal === 'xiaomi' && catVal === 'phones';
                              }
                              if (cat.key === 'samsung') {
                                  return brandVal === 'samsung' && catVal === 'phones';
                              }
                              
                              // Special handling for accessory subcategories
                              if (cat.key === 'anti-choc') {
                                  return catVal === 'accessories' && (p.type === 'anti-choc' || p.subcategory === 'anti-choc');
                              }
                              if (cat.key === 'headphones') {
                                  return catVal === 'accessories' && (p.type === 'headphones' || p.subcategory === 'headphones' || p.type === 'casques' || p.subcategory === 'casques');
                              }
                              if (cat.key === 'cases') {
                                  return catVal === 'accessories' && (p.type === 'cases' || p.subcategory === 'cases' || p.type === 'coques' || p.subcategory === 'coques');
                              }
                              
                              // Default category matching
                              return catVal === filterVal;
                         });
                        const image = product && product.images && product.images.length > 0 ? product.images[0] : null;
                        // Map categories to appropriate images
                        let categoryImage = image;
                        if (!categoryImage || categoryImage.includes('yellow') || categoryImage.includes('gold')) {
                            switch (cat.key) {
                                case 'phones':
                                    categoryImage = '/images/categories/phones.jpg';
                                    break;
                                case 'laptops':
                                    categoryImage = '/images/categories/laptops.jpg';
                                    break;
                                case 'accessories':
                                    categoryImage = '/images/categories/gadgets.jpg';
                                    break;
                                case 'watch':
                                    categoryImage = '/images/categories/headphones.jpg';
                                    break;
                                default:
                                    categoryImage = '/images/categories/gadgets.jpg';
                                    break;
                            }
                        }
                        // Only show hover effect if not dragging/sliding
                        const showHover = hoveredIdx === idx && !dragMoved;
                        return (
                            <div
                            key={cat.key + '-' + idx}
                            className="flex flex-col items-center w-44 h-44 sm:w-56 sm:h-56 bg-white rounded-xl cursor-pointer mx-2 group border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300"
                            tabIndex={0}
                            role="button"
                            onMouseDown={handleCategoryMouseDown}
                            onMouseMove={handleCategoryMouseMove}
                            onMouseUp={handleCategoryMouseUp(cat)}
                            onTouchStart={handleCategoryTouchStart}
                            onTouchMove={handleCategoryTouchMove}
                            onTouchEnd={handleCategoryTouchEnd(cat)}
                                onKeyPress={e => { 
                                    if (e.key === 'Enter') {
                                        let query = '';
                                        if (cat.key === 'iphones') {
                                            query = 'category=phones&brand=apple';
                                        } else if (cat.key === 'xiaomi') {
                                            query = 'category=phones&brand=xiaomi';
                                        } else if (cat.key === 'samsung') {
                                            query = 'category=phones&brand=samsung';
                                        } else if (cat.key === 'anti-choc') {
                                            query = 'category=accessories&type=anti-choc';
                                        } else if (cat.key === 'headphones') {
                                            query = 'category=accessories&type=headphones';
                                        } else if (cat.key === 'cases') {
                                            query = 'category=accessories&type=cases';
                                        } else {
                                            query = `category=${encodeURIComponent(cat.filter)}`;
                                        }
                                        router.push(`/products?${query}`);
                                    }
                                }}
                                onMouseEnter={() => setHoveredIdx(idx)}
                                onMouseLeave={() => setHoveredIdx(null)}
                                style={{ 
                                    scrollSnapAlign: 'start',
                                    userSelect: 'none', 
                                    WebkitUserSelect: 'none' 
                                }}
                                
                            >
                                <div className="relative overflow-hidden rounded-xl shadow-sm bg-white hover:shadow-md transition-all w-full h-full flex items-center justify-center">
                                    {categoryImage ? (
                                        <Image
                                            src={categoryImage}
                                            alt={cat.title}
                                            fill
                                            className="object-cover rounded-xl"
                                            onError={e => { e.target.src = '/images/categories/gadgets.jpg'; }}
                                        />
                                    ) : (
                                        <span className="text-neutral-600 text-lg font-bold">{cat.title}</span>
                                    )}
                                    {/* Show blur and button only on hovered card and not while dragging */}
                                    {showHover && (
                                        <>
                                            <div className="absolute inset-0 z-20 backdrop-blur-sm transition-all duration-200 bg-primary-500/20"></div>
                                            <button
                                                onClick={e => { 
                                                    e.stopPropagation(); 
                                                    let query = '';
                                                    if (cat.key === 'iphones') {
                                                        query = 'category=phones&brand=apple';
                                                    } else if (cat.key === 'xiaomi') {
                                                        query = 'category=phones&brand=xiaomi';
                                                    } else if (cat.key === 'samsung') {
                                                        query = 'category=phones&brand=samsung';
                                                    } else if (cat.key === 'anti-choc') {
                                                        query = 'category=accessories&type=anti-choc';
                                                    } else if (cat.key === 'headphones') {
                                                        query = 'category=accessories&type=headphones';
                                                    } else if (cat.key === 'cases') {
                                                        query = 'category=accessories&type=cases';
                                                    } else {
                                                        query = `category=${encodeURIComponent(cat.filter)}`;
                                                    }
                                                    router.push(`/products?${query}`);
                                                }}
                                                className="hidden sm:flex absolute inset-0 items-center justify-center z-30"
                                                style={{ pointerEvents: 'auto' }}
                                            >
                                                <span className="px-4 py-2 bg-primary-500 text-white font-semibold text-base rounded-full shadow-lg border border-primary-600 transition-all duration-200 whitespace-nowrap"
                                                    style={{ boxShadow: '0 2px 16px 0 rgba(242,117,26,0.3)' }}
                                                >
                                                    {`Voir les ${cat.title}`}
                                                </span>
                                            </button>
                                        </>
                                    )}
                                </div>
                                <h3 className="mt-2 text-lg font-semibold text-neutral-800 truncate text-center">{cat.title}</h3>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const CategoryGrid = ({ products = [] }) => {
    // First row - Main categories
    const mainCategories = [
        {
            title: 'Xiaomi',
            key: 'xiaomi',
            filter: 'xiaomi',
            image: '/images/categories/phones.jpg'
        },
        {
            title: 'Samsung',
            key: 'samsung',
            filter: 'samsung',
            image: '/images/categories/phones.jpg'
        },
        {
            title: 'iPhones',
            key: 'iphones',
            filter: 'iphones',
            image: '/images/categories/phones.jpg'
        },
        {
            title: 'Laptops',
            key: 'laptops',
            filter: 'laptops',
            image: '/images/categories/laptops.jpg'
        }
    ];

    // Second row - Accessories
    const accessoryCategories = [
        {
            title: 'Anti-choc',
            key: 'anti-choc',
            filter: 'anti-choc',
            image: '/images/categories/gadgets.jpg'
        },
        {
            title: 'Montres',
            key: 'watch',
            filter: 'watch',
            image: '/images/categories/headphones.jpg'
        },
        {
            title: 'Casques',
            key: 'headphones',
            filter: 'headphones',
            image: '/images/categories/headphones.jpg'
        },
        {
            title: 'Coques',
            key: 'cases',
            filter: 'cases',
            image: '/images/categories/gadgets.jpg'
        }
    ];
    return (
        <section className="mb-16">
            <h2 className="text-3xl font-serif font-bold text-center mb-6 text-accent-700">Catégories</h2>
            <CategoryMarquee categories={mainCategories} direction="left" products={products} />
            <CategoryMarquee categories={accessoryCategories} direction="right" products={products} />
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
                
                /* Improve drag scrolling */
                .category-scroll-container {
                    -webkit-overflow-scrolling: touch;
                    scroll-behavior: smooth;
                    cursor: grab;
                }
                .category-scroll-container:active {
                    cursor: grabbing;
                }
                .category-scroll-container * {
                    pointer-events: auto;
                }
            `}</style>
        </section>
    );
};

export default CategoryGrid; 