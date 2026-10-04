"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

export interface HeroSlide {
  id: number | string;
  tag: string;
  title: string;
  highlightText: string;
  description: string;
  primaryButtonText: string;
  primaryButtonHref: string;
  secondaryButtonText: string;
  secondaryButtonHref: string;
  imageUrl: string;
  bgImageUrl?: string;
  badgeText: string;
  bgGradient?: string;
  tagColor?: string;
  btnColor?: string;
  highlightColor?: string;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: 1,
    tag: "✨ ROYAL JEWELRY COLLECTION",
    title: "Exquisite Royal & Bridal ",
    highlightText: "Jewelry",
    description: "Discover 100% BIS Hallmarked 18K & 24K Gold, Certified Solitaire Diamonds & Handcrafted Kundan Sets.",
    primaryButtonText: "SHOP JEWELRY",
    primaryButtonHref: "/search?category=jewelry",
    secondaryButtonText: "EXPLORE DEALS",
    secondaryButtonHref: "/deals",
    imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800",
    bgImageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=90&w=2000&auto=format&fit=crop",
    badgeText: "UP TO 50% OFF",
    bgGradient: "from-slate-950/95 via-slate-900/85 to-amber-950/70",
    tagColor: "bg-amber-500/20 text-amber-300 border-amber-400/40",
    highlightColor: "text-amber-400",
    btnColor: "bg-amber-600 hover:bg-amber-500 text-slate-950 shadow-xl shadow-amber-600/30 font-black"
  },
  {
    id: 2,
    tag: "💎 SOLITAIRE & DIAMONDS",
    title: "Timeless Elegance & Pure ",
    highlightText: "Diamonds",
    description: "VVS Solitaire Rings, Platinum Teardrop Pendants & Certified Gemstone Masterpieces.",
    primaryButtonText: "EXPLORE RINGS",
    primaryButtonHref: "/search?category=jewelry",
    secondaryButtonText: "VIEW OFFERS",
    secondaryButtonHref: "/deals",
    imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800",
    bgImageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=90&w=2000&auto=format&fit=crop",
    badgeText: "CERTIFIED VVS",
    bgGradient: "from-slate-950/95 via-slate-900/85 to-indigo-950/70",
    tagColor: "bg-blue-500/20 text-blue-300 border-blue-400/40",
    highlightColor: "text-sky-400",
    btnColor: "bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/30"
  },
  {
    id: 3,
    tag: "🌸 HERITAGE & FESTIVE SPECIAL",
    title: "Handcrafted Antique Gold ",
    highlightText: "Bangles",
    description: "24K Micron Gold Plated Bangles, Jhumkas, Anklets & Victorian Brooches.",
    primaryButtonText: "SHOP HERITAGE",
    primaryButtonHref: "/search?category=jewelry",
    secondaryButtonText: "SEE CATALOG",
    secondaryButtonHref: "/search",
    imageUrl: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800",
    bgImageUrl: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=90&w=2000&auto=format&fit=crop",
    badgeText: "24K GOLD POLISH",
    bgGradient: "from-slate-950/95 via-slate-900/85 to-rose-950/70",
    tagColor: "bg-rose-500/20 text-rose-300 border-rose-400/40",
    highlightColor: "text-rose-400",
    btnColor: "bg-rose-600 hover:bg-rose-500 text-white shadow-xl shadow-rose-600/30"
  }
];

const AUTO_SLIDE_INTERVAL = 3500; // 3.5 seconds per slide

export function HeroSlider() {
  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_SLIDES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const [progressWidth, setProgressWidth] = useState(0);
  const progressAnimRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Load dynamic slides from localStorage (admin panel updates)
  const loadSlides = () => {
    try {
      const stored = localStorage.getItem("ecom_hero_banners");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const jsonStr = JSON.stringify(parsed);
          if (jsonStr.includes("electronics") || jsonStr.includes("watch") || jsonStr.includes("SUMMER SALE")) {
            localStorage.removeItem("ecom_hero_banners");
            setSlides(DEFAULT_SLIDES);
            return;
          }
          setSlides(parsed);
          return;
        }
      }
    } catch {}
    setSlides(DEFAULT_SLIDES);
  };

  useEffect(() => {
    loadSlides();
    const handleUpdate = () => loadSlides();
    window.addEventListener("ecom_banners_updated", handleUpdate);
    return () => window.removeEventListener("ecom_banners_updated", handleUpdate);
  }, []);

  // Progress bar animation
  const startProgress = useCallback(() => {
    setProgressWidth(0);
    if (progressAnimRef.current) clearInterval(progressAnimRef.current);
    const step = 100 / (AUTO_SLIDE_INTERVAL / 50); // update every 50ms
    progressAnimRef.current = setInterval(() => {
      setProgressWidth(prev => {
        if (prev >= 100) {
          if (progressAnimRef.current) clearInterval(progressAnimRef.current);
          return 100;
        }
        return prev + step;
      });
    }, 50);
  }, []);

  const stopProgress = useCallback(() => {
    if (progressAnimRef.current) clearInterval(progressAnimRef.current);
  }, []);

  // Go to next slide with smooth clockwise loop
  const goToNext = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex(prev => (prev + 1) % slides.length);
    setTimeout(() => setIsAnimating(false), 550);
  }, [isAnimating, slides.length]);

  const goToPrev = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex(prev => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsAnimating(false), 550);
  }, [isAnimating, slides.length]);

  const goToSlide = useCallback((index: number) => {
    if (isAnimating || index === currentIndex) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 550);
  }, [isAnimating, currentIndex]);

  // Auto-slide loop — clockwise (left→right direction, loops back to 0 from last)
  useEffect(() => {
    if (slides.length <= 1) return;

    const startAutoSlide = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      startProgress();
      intervalRef.current = setInterval(() => {
        goToNext();
        startProgress();
      }, AUTO_SLIDE_INTERVAL);
    };

    if (!isHovered) {
      startAutoSlide();
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      stopProgress();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      stopProgress();
    };
  }, [isHovered, slides.length, goToNext, startProgress, stopProgress]);

  if (!slides || slides.length === 0) return null;

  return (
    <div
      className="relative w-full overflow-hidden group border-b border-gray-200/80"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides Container — infinite clockwise loop via translateX */}
      <div
        className="flex w-full"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: isAnimating ? "transform 0.55s cubic-bezier(0.45, 0, 0.25, 1)" : "none",
          willChange: "transform"
        }}
      >
        {slides.map((slide, idx) => (
          <div key={slide.id || idx} className="w-full shrink-0">
            <div
              className="relative overflow-hidden min-h-[75vh] sm:min-h-[80vh] lg:min-h-[760px] flex items-end justify-center"
            >
              {/* 🖼️ Full-width Ultra HD Background Image Layer */}
              <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
                <img
                  src={
                    slide.bgImageUrl ||
                    (idx === 2
                      ? "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=90&w=2000&auto=format&fit=crop"
                      : idx === 1
                      ? "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=90&w=2000&auto=format&fit=crop"
                      : "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=90&w=2000&auto=format&fit=crop")
                  }
                  alt="Hero Slide Background"
                  className="w-full h-full object-cover object-center transform scale-100 transition-transform duration-1000"
                />
                {/* 100% Crystal Clear HD Overlay — Only subtle shadow at very bottom for cards */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />
              </div>

              {/* Slide Foreground Content — Clean Full Image View + Bottom Cards Deck */}
              <div className="relative z-10 w-full max-w-full flex flex-col justify-end items-center min-h-[75vh] sm:min-h-[80vh] lg:min-h-[760px] p-4 sm:p-8 lg:p-12 pb-12">
                
                {/* 🎴 Bottom Hero Cards Deck — Untilts on scroll to match clean horizontal card row */}
                <div className="w-full max-w-6xl mx-auto pt-6 pb-2 overflow-x-auto no-scrollbar">
                  <div className={`flex items-center justify-center transition-all duration-500 min-w-[720px] px-4 ${
                    isScrolled ? "gap-3 sm:gap-4 space-x-0 py-2" : "-space-x-3 sm:-space-x-5 py-4"
                  }`}>
                    
                    {/* Card 1 */}
                    <Link
                      href="/product/royal-solitaire-diamond-ring-18k-gold"
                      className={`group relative w-32 sm:w-40 md:w-44 shrink-0 rounded-3xl overflow-hidden border-2 border-white/90 bg-[#FFFDF9] shadow-xl transform transition-all duration-500 block cursor-pointer ${
                        isScrolled ? "rotate-0 scale-100 hover:scale-105" : "-rotate-6 hover:rotate-0 hover:scale-110 z-10 hover:z-40"
                      }`}
                    >
                      <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-900">
                        <img
                          src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600"
                          alt="Solitaire Diamond Ring"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      </div>
                      <div className="bg-[#FFFDF9] text-[#2C221E] p-2.5 sm:p-3 text-center border-t border-[#E8E1D1] relative">
                        <div className="w-full h-2 bg-[#FFFDF9] -top-2 left-0 absolute rounded-t-full" />
                        <p className="font-extrabold text-[10px] sm:text-xs leading-tight line-clamp-2">Solitaire Engagement Ring</p>
                      </div>
                    </Link>

                    {/* Card 2 */}
                    <Link
                      href="/product/elegance-kundan-polki-choker-necklace-set"
                      className={`group relative w-32 sm:w-40 md:w-44 shrink-0 rounded-3xl overflow-hidden border-2 border-white/90 bg-[#FFFDF9] shadow-xl transform transition-all duration-500 block cursor-pointer ${
                        isScrolled ? "rotate-0 scale-100 hover:scale-105" : "rotate-4 hover:rotate-0 hover:scale-110 z-20 hover:z-40"
                      }`}
                    >
                      <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-900">
                        <img
                          src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600"
                          alt="Kundan Necklace"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      </div>
                      <div className="bg-[#FFFDF9] text-[#2C221E] p-2.5 sm:p-3 text-center border-t border-[#E8E1D1] relative">
                        <div className="w-full h-2 bg-[#FFFDF9] -top-2 left-0 absolute rounded-t-full" />
                        <p className="font-extrabold text-[10px] sm:text-xs leading-tight line-clamp-2">Kundan Polki Choker Set</p>
                      </div>
                    </Link>

                    {/* Card 3 */}
                    <Link
                      href="/product/classic-sterling-silver-solitaire-stud-earrings"
                      className={`group relative w-32 sm:w-40 md:w-44 shrink-0 rounded-3xl overflow-hidden border-2 border-white/90 bg-[#FFFDF9] shadow-xl transform transition-all duration-500 block cursor-pointer ${
                        isScrolled ? "rotate-0 scale-100 hover:scale-105" : "-rotate-3 hover:rotate-0 hover:scale-110 z-30 hover:z-40"
                      }`}
                    >
                      <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-900">
                        <img
                          src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600"
                          alt="Sterling Silver Earrings"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      </div>
                      <div className="bg-[#FFFDF9] text-[#2C221E] p-2.5 sm:p-3 text-center border-t border-[#E8E1D1] relative">
                        <div className="w-full h-2 bg-[#FFFDF9] -top-2 left-0 absolute rounded-t-full" />
                        <p className="font-extrabold text-[10px] sm:text-xs leading-tight line-clamp-2">Sterling Silver Solitaire Studs</p>
                      </div>
                    </Link>

                    {/* Card 4 */}
                    <Link
                      href="/product/diamond-teardrop-pendant-with-platinum-chain"
                      className={`group relative w-32 sm:w-40 md:w-44 shrink-0 rounded-3xl overflow-hidden border-2 border-white/90 bg-[#FFFDF9] shadow-xl transform transition-all duration-500 block cursor-pointer ${
                        isScrolled ? "rotate-0 scale-100 hover:scale-105" : "rotate-5 hover:rotate-0 hover:scale-110 z-20 hover:z-40"
                      }`}
                    >
                      <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-900">
                        <img
                          src="https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600"
                          alt="Diamond Teardrop Pendant"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      </div>
                      <div className="bg-[#FFFDF9] text-[#2C221E] p-2.5 sm:p-3 text-center border-t border-[#E8E1D1] relative">
                        <div className="w-full h-2 bg-[#FFFDF9] -top-2 left-0 absolute rounded-t-full" />
                        <p className="font-extrabold text-[10px] sm:text-xs leading-tight line-clamp-2">Platinum Diamond Pendant</p>
                      </div>
                    </Link>

                    {/* Card 5 */}
                    <Link
                      href="/product/pure-24k-gold-plated-traditional-bangle-set"
                      className={`group relative w-32 sm:w-40 md:w-44 shrink-0 rounded-3xl overflow-hidden border-2 border-white/90 bg-[#FFFDF9] shadow-xl transform transition-all duration-500 block cursor-pointer ${
                        isScrolled ? "rotate-0 scale-100 hover:scale-105" : "-rotate-2 hover:rotate-0 hover:scale-110 z-15 hover:z-40"
                      }`}
                    >
                      <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-900">
                        <img
                          src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600"
                          alt="Traditional Bangle Set"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      </div>
                      <div className="bg-[#FFFDF9] text-[#2C221E] p-2.5 sm:p-3 text-center border-t border-[#E8E1D1] relative">
                        <div className="w-full h-2 bg-[#FFFDF9] -top-2 left-0 absolute rounded-t-full" />
                        <p className="font-extrabold text-[10px] sm:text-xs leading-tight line-clamp-2">24K Gold Plated Bangles</p>
                      </div>
                    </Link>

                    {/* Card 6 */}
                    <Link
                      href="/product/royal-velvet-gift-box-diamond-brooch"
                      className={`group relative w-32 sm:w-40 md:w-44 shrink-0 rounded-3xl overflow-hidden border-2 border-white/90 bg-[#FFFDF9] shadow-xl transform transition-all duration-500 block cursor-pointer ${
                        isScrolled ? "rotate-0 scale-100 hover:scale-105" : "rotate-6 hover:rotate-0 hover:scale-110 z-10 hover:z-40"
                      }`}
                    >
                      <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-900">
                        <img
                          src="https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=600"
                          alt="Royal Velvet Brooch"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      </div>
                      <div className="bg-[#FFFDF9] text-[#2C221E] p-2.5 sm:p-3 text-center border-t border-[#E8E1D1] relative">
                        <div className="w-full h-2 bg-[#FFFDF9] -top-2 left-0 absolute rounded-t-full" />
                        <p className="font-extrabold text-[10px] sm:text-xs leading-tight line-clamp-2">Victorian Velvet Brooch</p>
                      </div>
                    </Link>

                  </div>
                </div>

              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HeroSlider;
