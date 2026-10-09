import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Mail,
  Instagram,
  Twitter,
  Facebook,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Flame,
  Tag,
  Gift
} from 'lucide-react';
import { Category, Product, CarouselSlide, SpotlightBanner } from '../types';
import { ProductCard } from './ProductCard';
import { INITIAL_CAROUSEL_SLIDES } from '../services/seedData';
import { DEFAULT_SPOTLIGHT_BANNER } from '../services/storeService';
import { formatPrice } from '../utils/format';

interface HomePageProps {
  categories: Category[];
  featuredProducts: Product[];
  bestSellers: Product[];
  newArrivals: Product[];
  carouselSlides?: CarouselSlide[];
  spotlightBanner?: SpotlightBanner;
  onNavigate: (view: string, param?: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  categories,
  featuredProducts,
  bestSellers,
  newArrivals,
  carouselSlides = INITIAL_CAROUSEL_SLIDES,
  spotlightBanner = DEFAULT_SPOTLIGHT_BANNER,
  onNavigate,
  onSelectProduct
}) => {
  const currentSpotlight = spotlightBanner || DEFAULT_SPOTLIGHT_BANNER;
  // Filter active slides or fallback
  const activeSlides = carouselSlides && carouselSlides.length > 0
    ? carouselSlides.filter(s => s.active !== false)
    : INITIAL_CAROUSEL_SLIDES;

  const slidesToRender = activeSlides.length > 0 ? activeSlides : INITIAL_CAROUSEL_SLIDES;

  // 5-Slide Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-play slides carousel (5 seconds per slide)
  useEffect(() => {
    if (isPaused || slidesToRender.length <= 1) return;

    autoPlayRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slidesToRender.length);
    }, 5000);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isPaused, slidesToRender.length]);

  // Keep index within bounds
  useEffect(() => {
    if (currentSlide >= slidesToRender.length) {
      setCurrentSlide(0);
    }
  }, [slidesToRender.length, currentSlide]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slidesToRender.length) % slidesToRender.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slidesToRender.length);
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-20 overflow-hidden">
      {/* 1. HERO SECTION (REDUCED SLEEK HEIGHT, LIGHT GREEN THEME) */}
      <section className="relative px-3 sm:px-6 lg:px-8 max-w-[1720px] mx-auto pt-3 sm:pt-4">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-50 via-[#ecfdf5] to-[#d1fae5]/80 text-stone-900 min-h-[300px] md:min-h-[360px] lg:min-h-[380px] flex items-center shadow-lg border border-emerald-200/90">
          {/* Background image with subtle light green gradient overlay */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=2000&q=85"
              alt="ATAL Architectural Lifestyle"
              className="w-full h-full object-cover object-center opacity-20 scale-105 transform hover:scale-100 transition-transform duration-1000 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/95 via-[#ecfdf5]/90 to-transparent" />
          </div>

          {/* Hero Content (Compact & Balanced) */}
          <div className="relative z-10 max-w-2xl px-5 sm:px-10 lg:px-12 py-7 sm:py-9">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 border border-emerald-300/80 backdrop-blur-md text-emerald-900 text-[11px] sm:text-xs font-semibold tracking-wider mb-3 sm:mb-4 shadow-2xs">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-700" />
              <span>ATAL – Shop Smart. Live Better. 🛍️</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-serif-display leading-[1.15] text-emerald-950">
              Shop Smart. <span className="italic font-light text-emerald-800">Live Better.</span>
            </h1>

            <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-stone-700 leading-relaxed max-w-lg line-clamp-2 sm:line-clamp-none">
              Curated beauty, luxury fragrances, premium cosmetics, chic everyday fashion &amp; verified modern electronics across Pakistan.
            </p>

            {/* CTA Buttons */}
            <div className="mt-5 sm:mt-6 flex flex-wrap items-center gap-2.5 sm:gap-3.5">
              <button
                onClick={() => onNavigate('shop')}
                className="px-5 sm:px-6 py-2.5 sm:py-3 bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm hover:bg-emerald-800 transition shadow-md hover:shadow-lg flex items-center gap-1.5 group cursor-pointer"
              >
                <span>Explore Catalog</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => onNavigate('shop', 'best-sellers')}
                className="px-5 sm:px-6 py-2.5 sm:py-3 bg-white/95 text-emerald-900 font-semibold rounded-xl text-xs sm:text-sm hover:bg-white transition border border-emerald-300/90 shadow-2xs backdrop-blur-sm cursor-pointer"
              >
                Trending Best Sellers
              </button>
            </div>

            {/* Quick trust metrics bar */}
            <div className="mt-6 sm:mt-7 pt-4 sm:pt-5 border-t border-emerald-200/80 grid grid-cols-3 gap-3 text-left">
              <div>
                <span className="text-base sm:text-xl font-black text-emerald-950 font-serif-display">PKR 290</span>
                <p className="text-[9px] sm:text-xs text-emerald-800/80 font-medium mt-0.5">Flat Shipping</p>
              </div>
              <div>
                <span className="text-base sm:text-xl font-black text-emerald-700 font-serif-display">PKR 6,000+</span>
                <p className="text-[9px] sm:text-xs text-emerald-800/80 font-medium mt-0.5">Free Delivery</p>
              </div>
              <div>
                <span className="text-base sm:text-xl font-black text-emerald-950 font-serif-display">100%</span>
                <p className="text-[9px] sm:text-xs text-emerald-800/80 font-medium mt-0.5">Original &amp; Verified</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DYNAMIC CAROUSEL SLIDER (HERO PRODUCT SHOWCASE, EDITABLE FROM ADMIN) */}
      <section className="max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8">
        <div
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-stone-950 border border-stone-800 group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Slider Slides Container with Guaranteed Responsive Viewport Height */}
          <div className="relative min-h-[520px] sm:min-h-[480px] md:min-h-[390px] lg:min-h-[430px] flex items-center">
            {slidesToRender.map((slide, index) => {
              const isActive = index === currentSlide;
              return (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  {/* Clean Studio Ambient Background (Sleek dark gradient with subtle diffuse lighting) */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${slide.bgGradient || 'from-stone-950 via-stone-900 to-stone-950'}`} />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_60%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.08),transparent_60%)]" />
                  </div>

                  {/* Slide Content Grid: High-Contrast Details & Crystal-Clear Hero Product Showcase */}
                  <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-5 sm:py-7 lg:py-8 h-full flex flex-col justify-center">
                    <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-4 sm:gap-6 lg:gap-8">
                      {/* Left: Product Information & Call-to-Action */}
                      <div className="md:col-span-7 lg:col-span-7 space-y-2.5 sm:space-y-3.5">
                        {/* Badges, Discount Tag & Slide Indicator */}
                        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                          {slide.badge && (
                            <span className={`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold border backdrop-blur-md ${slide.badgeColor || 'bg-amber-400 text-stone-950 border-amber-300'} shadow-sm`}>
                              {slide.badge}
                            </span>
                          )}
                          {slide.discountTag && (
                            <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-red-600 text-white shadow-sm flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              <span>{slide.discountTag}</span>
                            </span>
                          )}
                          <span className="text-stone-400 text-[10px] sm:text-xs font-semibold ml-auto sm:ml-0 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                            {index + 1} / {slidesToRender.length}
                          </span>
                        </div>

                        {/* Subtitle */}
                        {slide.subtitle && (
                          <span className="text-amber-400 text-xs sm:text-sm uppercase font-bold tracking-widest block">
                            {slide.subtitle}
                          </span>
                        )}

                        {/* Main Product Title */}
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black font-serif-display text-white leading-tight drop-shadow-sm">
                          {slide.title}
                        </h2>

                        {/* Description */}
                        <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-xl line-clamp-2">
                          {slide.description}
                        </p>

                        {/* Product Original Price & Discount Price Display */}
                        <div className="pt-1 flex flex-wrap items-center gap-2.5 sm:gap-3">
                          {(slide.discountPrice || slide.originalPrice || slide.priceTag) && (
                            <div className="flex items-center gap-2.5 sm:gap-3 bg-stone-900/95 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-2xl border border-white/20 backdrop-blur-md shadow-md">
                              {slide.discountPrice ? (
                                <>
                                  <div className="flex flex-col">
                                    <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold">Special Price</span>
                                    <span className="text-emerald-400 font-black text-sm sm:text-base lg:text-lg font-serif-display leading-tight">
                                      {formatPrice(slide.discountPrice)}
                                    </span>
                                  </div>
                                  {slide.originalPrice && slide.originalPrice > slide.discountPrice && (
                                    <div className="flex flex-col pl-2.5 border-l border-stone-700">
                                      <span className="text-[9px] uppercase tracking-wider text-stone-400 font-bold">Regular</span>
                                      <span className="text-stone-400 text-xs sm:text-sm line-through font-medium leading-tight">
                                        {formatPrice(slide.originalPrice)}
                                      </span>
                                    </div>
                                  )}
                                  {slide.originalPrice && slide.originalPrice > slide.discountPrice && !slide.discountTag && (
                                    <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/90 px-2 py-0.5 rounded-md border border-emerald-800/80">
                                      Save {formatPrice(slide.originalPrice - slide.discountPrice)}
                                    </span>
                                  )}
                                </>
                              ) : slide.priceTag ? (
                                <div className="inline-flex items-center gap-1.5">
                                  <Flame className="w-4 h-4 text-amber-400" />
                                  <span className="text-white font-bold text-xs sm:text-sm font-serif-display">
                                    {slide.priceTag}
                                  </span>
                                </div>
                              ) : null}
                            </div>
                          )}

                          <button
                            onClick={() => {
                              const target = slide.buttonLink || slide.productId || 'shop';
                              if (target.startsWith('prod-') || slide.productId) {
                                const pId = slide.productId || target;
                                const allProds = [...featuredProducts, ...bestSellers, ...newArrivals];
                                const found = allProds.find(p => p.id === pId);
                                if (found) {
                                  onSelectProduct(found);
                                  return;
                                }
                              }
                              if (target.startsWith('cat-')) {
                                onNavigate('shop', target);
                              } else if (target === 'shop') {
                                onNavigate('shop');
                              } else if (target === 'best-sellers' || target === 'new-arrivals') {
                                onNavigate('shop', target);
                              } else {
                                onNavigate('shop', target);
                              }
                            }}
                            className="px-5 sm:px-7 py-2.5 sm:py-3 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black rounded-xl text-xs sm:text-sm transition-all shadow-lg hover:shadow-emerald-500/25 flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
                          >
                            <ShoppingBag className="w-4 h-4" />
                            <span>{slide.buttonText || 'Buy Now'}</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onNavigate('shop')}
                            className="hidden sm:inline-flex px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs sm:text-sm transition border border-white/20 backdrop-blur-md cursor-pointer"
                          >
                            View Collection
                          </button>
                        </div>
                      </div>

                      {/* Right: Dedicated Crystal-Clear Hero Product Showcase */}
                      <div className="md:col-span-5 lg:col-span-5 flex justify-center md:justify-end">
                        <div
                          onClick={() => {
                            const target = slide.buttonLink || slide.productId || 'shop';
                            if (target.startsWith('prod-') || slide.productId) {
                              const pId = slide.productId || target;
                              const allProds = [...featuredProducts, ...bestSellers, ...newArrivals];
                              const found = allProds.find(p => p.id === pId);
                              if (found) {
                                onSelectProduct(found);
                                return;
                              }
                            }
                            onNavigate('shop');
                          }}
                          className="relative w-full max-w-[240px] sm:max-w-[280px] md:max-w-[320px] lg:max-w-[360px] h-44 sm:h-56 md:h-64 lg:h-76 rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-white/25 shadow-2xl bg-stone-900 backdrop-blur-md transform hover:scale-[1.03] transition-all duration-500 group/img cursor-pointer ring-1 ring-white/10"
                        >
                          {/* Image Container with Crisp Scaling */}
                          <img
                            src={slide.image || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=85'}
                            alt={slide.title}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=85';
                            }}
                            className="w-full h-full object-cover object-center group-hover/img:scale-108 transition-transform duration-700"
                          />

                          {/* Bottom Gradient with Product Badge */}
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2.5 sm:p-3 pt-5 flex items-center justify-between text-white">
                            <span className="px-2 py-0.5 rounded-md text-[9px] sm:text-[11px] font-bold bg-white/20 backdrop-blur-md border border-white/20">
                              {slide.badge || 'Featured Product'}
                            </span>
                            <span className="text-[10px] sm:text-xs font-semibold text-emerald-400 flex items-center gap-1 group-hover/img:translate-x-1 transition-transform">
                              <span>View Item</span>
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Carousel Left & Right Arrow Controls */}
          {slidesToRender.length > 1 && (
            <>
              <button
                onClick={handlePrevSlide}
                aria-label="Previous Slide"
                className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-stone-950/60 hover:bg-emerald-600 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-md hover:scale-110"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={handleNextSlide}
                aria-label="Next Slide"
                className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-stone-950/60 hover:bg-emerald-600 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-md hover:scale-110"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Pagination Dots Indicator */}
              <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-stone-950/70 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                {slidesToRender.map((slide, idx) => (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentSlide(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      currentSlide === idx
                        ? 'w-6 h-2 bg-emerald-400 shadow-xs'
                        : 'w-2 h-2 bg-white/40 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* 3. SHOP BY CATEGORY */}
      <section className="max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 sm:mb-7">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-stone-400">
              Department Archives
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif-display text-stone-950 mt-0.5">
              Shop by Category
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="mt-2 sm:mt-0 text-xs sm:text-sm font-semibold text-stone-900 hover:text-black flex items-center gap-1 group cursor-pointer"
          >
            <span>View All Departments</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onNavigate('shop', cat.id)}
              className="group relative flex flex-col text-left rounded-2xl overflow-hidden bg-white border border-stone-200/90 shadow-2xs hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            >
              <div className="aspect-[4/5] w-full overflow-hidden bg-stone-100">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-3 bg-white">
                <h3 className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-emerald-700 transition">
                  {cat.name}
                </h3>
                <span className="text-[10px] sm:text-[11px] font-medium text-stone-500 mt-0.5 inline-flex items-center gap-1">
                  Shop Now <ArrowRight className="w-3 h-3 text-stone-400" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 4. NEW ARRIVALS: 6 IN ROW (PC), 3 IN ROW (TABLET), 2 IN ROW (MOBILE) */}
      <section className="max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 sm:mb-7">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-amber-600">
              Fresh Off Production
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif-display text-stone-950 mt-0.5">
              New Arrivals
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop', 'new-arrivals')}
            className="mt-2 sm:mt-0 text-xs sm:text-sm font-semibold text-stone-900 hover:text-black flex items-center gap-1 group cursor-pointer"
          >
            <span>Explore All New</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
          {newArrivals.slice(0, 18).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      </section>

      {/* 5. PROMOTIONAL SPOTLIGHT FEATURE BANNER (Admin Editable) */}
      {currentSpotlight.active !== false && (
        <section className="max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-stone-900 text-white grid grid-cols-1 lg:grid-cols-2 items-center shadow-xl">
            <div className="p-6 sm:p-10 lg:p-14 z-10">
              <span className={`text-xs uppercase font-bold tracking-widest ${currentSpotlight.badgeColor || 'text-amber-400'}`}>
                {currentSpotlight.badge || 'Spotlight Hardware'}
              </span>
              <h3 className="text-2xl sm:text-4xl font-extrabold font-serif-display mt-2 leading-tight whitespace-pre-line">
                {currentSpotlight.title || 'Acoustic Precision. \nPure Silence.'}
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-stone-300 leading-relaxed max-w-lg">
                {currentSpotlight.description}
              </p>
              <div className="mt-4 sm:mt-5 flex flex-wrap items-center gap-3 sm:gap-4">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">
                  {formatPrice(currentSpotlight.price || 14500)}
                </span>
                {currentSpotlight.compareAtPrice && currentSpotlight.compareAtPrice > currentSpotlight.price && (
                  <span className="text-sm sm:text-lg text-stone-400 line-through">
                    {formatPrice(currentSpotlight.compareAtPrice)}
                  </span>
                )}
                {currentSpotlight.discountTag && (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 text-xs font-bold border border-emerald-800">
                    {currentSpotlight.discountTag}
                  </span>
                )}
              </div>
              <div className="mt-5 sm:mt-7 flex flex-wrap gap-3">
                <button
                  onClick={() => onNavigate('shop', currentSpotlight.primaryButtonLink !== 'shop' ? currentSpotlight.primaryButtonLink : undefined)}
                  className="px-6 py-3 bg-white text-stone-950 font-bold rounded-xl text-xs sm:text-sm hover:bg-stone-100 transition shadow-md cursor-pointer"
                >
                  {currentSpotlight.primaryButtonText || 'Shop Audio'}
                </button>
                <button
                  onClick={() => onNavigate('shop', currentSpotlight.secondaryButtonLink !== 'shop' ? currentSpotlight.secondaryButtonLink : undefined)}
                  className="px-6 py-3 bg-stone-800 text-white font-semibold rounded-xl text-xs sm:text-sm hover:bg-stone-700 transition border border-stone-700 cursor-pointer"
                >
                  {currentSpotlight.secondaryButtonText || 'View Catalog'}
                </button>
              </div>
            </div>
            <div className="relative h-60 sm:h-72 lg:h-full min-h-[260px] overflow-hidden">
              <img
                src={currentSpotlight.image || 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=85'}
                alt={currentSpotlight.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=85';
                }}
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
        </section>
      )}

      {/* 6. BEST SELLERS: 6 IN ROW (PC), 3 IN ROW (TABLET), 2 IN ROW (MOBILE) */}
      <section className="max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 sm:mb-7">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-amber-600">
              Customer Favorites
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif-display text-stone-950 mt-0.5">
              Best Sellers
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop', 'best-sellers')}
            className="mt-2 sm:mt-0 text-xs sm:text-sm font-semibold text-stone-900 hover:text-black flex items-center gap-1 group cursor-pointer"
          >
            <span>View All Best Sellers</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
          {bestSellers.slice(0, 18).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      </section>

      {/* 7. TRUST / VALUE PROPOSITIONS (BELOW / AFTER BEST SELLERS) */}
      <section className="max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 p-6 sm:p-7 rounded-3xl bg-white border border-stone-200/80 shadow-2xs">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-900">Affordable Nationwide Shipping</h4>
              <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5 leading-relaxed">
                Flat shipping fee of PKR 290 on all orders. Free delivery above PKR 6,000.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-900">Secure Payments &amp; COD</h4>
              <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5 leading-relaxed">
                Cash on delivery supported across Pakistan alongside JazzCash &amp; Easypaisa.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-900">100% Genuine Quality</h4>
              <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5 leading-relaxed">
                Authentic beauty, cosmetics, perfumes, apparel, and verified electronics.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-900">Dedicated Customer Support</h4>
              <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5 leading-relaxed">
                Dedicated WhatsApp &amp; phone assistance available for all your questions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. NEWSLETTER SECTION */}
      <section className="max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-stone-100 border border-stone-200/80 p-6 sm:p-10 text-center max-w-4xl mx-auto shadow-2xs">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-stone-900 text-white flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold font-serif-display text-stone-900">
            Join the ATAL Society
          </h3>
          <p className="mt-2 text-stone-600 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
            Receive early access to seasonal capsule drops, design editor stories, and exclusive store discounts on your orders.
          </p>
          <div className="mt-5 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email..."
              className="flex-1 px-4 py-2.5 sm:py-3 rounded-xl bg-white border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
            <button
              type="button"
              className="px-6 py-2.5 sm:py-3 bg-stone-950 text-white font-bold rounded-xl text-xs sm:text-sm hover:bg-stone-800 transition cursor-pointer"
            >
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
