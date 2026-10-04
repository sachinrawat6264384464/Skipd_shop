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
    bgImageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600&auto=format&fit=crop",
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
    bgImageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1600&auto=format&fit=crop",
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
    bgImageUrl: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=1600&auto=format&fit=crop",
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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const [progressWidth, setProgressWidth] = useState(0);
  const progressAnimRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
              className="relative overflow-hidden min-h-[380px] sm:min-h-[440px] md:min-h-[480px] lg:min-h-[500px] flex items-center"
            >
              {/* 🖼️ Full-width Background Image Layer */}
              <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
                <img
                  src={
                    slide.bgImageUrl ||
                    (idx === 2
                      ? "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&auto=format&fit=crop"
                      : idx === 1
                      ? "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1600&auto=format&fit=crop"
                      : "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop")
                  }
                  alt="Hero Slide Background"
                  className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000"
                />
                {/* Sleek Frosted Glass Overlay for Crystal-Clear Text Legibility */}
                <div className={`absolute inset-0 bg-gradient-to-r ${slide.bgGradient || "from-slate-950/95 via-slate-900/85 to-blue-950/70"} backdrop-blur-[1px]`} />
              </div>

              {/* Slide Foreground Content */}
              <div className="relative z-10 w-full max-w-full flex flex-col md:flex-row justify-between items-center gap-6 md:gap-10 p-6 sm:p-10 md:p-12 lg:p-16 px-6 sm:px-12 lg:px-20">
                {/* Text Content */}
                <div className="space-y-4 sm:space-y-5 max-w-xl w-full">
                  <span className={`inline-block border font-black text-xs uppercase px-4 py-1.5 rounded-full tracking-wider shadow-sm backdrop-blur-md ${slide.tagColor || "bg-blue-500/20 text-blue-300 border-blue-400/40"}`}>
                    {slide.tag}
                  </span>

                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-md">
                    {slide.title}
                    <span className={slide.highlightColor || "text-sky-400"}>{slide.highlightText}</span>
                  </h1>

                  <p className="text-gray-200 text-xs sm:text-sm md:text-base font-medium leading-relaxed max-w-lg drop-shadow-sm">
                    {slide.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3.5 pt-3">
                    <Link
                      href={slide.primaryButtonHref || "/search"}
                      className={`font-black text-xs sm:text-sm px-6 py-3.5 rounded-2xl transition shadow-xl cursor-pointer flex items-center gap-2 ${slide.btnColor || "bg-blue-600 hover:bg-blue-500 text-white"}`}
                    >
                      <span>{slide.primaryButtonText || "SHOP NOW"}</span>
                      <span>&rarr;</span>
                    </Link>
                    {slide.secondaryButtonText && (
                      <Link
                        href={slide.secondaryButtonHref || "/deals"}
                        className="bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-md font-black text-xs sm:text-sm px-5 py-3.5 rounded-2xl transition shadow-2xs cursor-pointer"
                      >
                        {slide.secondaryButtonText}
                      </Link>
                    )}
                  </div>
                </div>

                {/* Right Image (Full Fill & Cover) */}
                <div className="relative w-full md:w-[440px] lg:w-[500px] h-60 sm:h-80 md:h-[360px] lg:h-[400px] rounded-3xl overflow-hidden shadow-2xl border-2 border-white/30 shrink-0">
                  {idx === 0 ? (
                    <Image
                      src={slide.imageUrl}
                      alt={slide.title}
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, 500px"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <img
                      src={slide.imageUrl}
                      alt={slide.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  {slide.badgeText && (
                    <div className="absolute top-4 right-4 bg-red-600 text-white font-black text-xs sm:text-sm px-4 py-1.5 rounded-full shadow-xl animate-pulse tracking-wide">
                      {slide.badgeText}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ← → Manual Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-gray-900 font-black text-lg shadow-lg backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center cursor-pointer z-20 border border-gray-200/80 hover:scale-110"
            title="Previous Slide"
          >
            ‹
          </button>
          <button
            onClick={goToNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-gray-900 font-black text-lg shadow-lg backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center cursor-pointer z-20 border border-gray-200/80 hover:scale-110"
            title="Next Slide"
          >
            ›
          </button>
        </>
      )}

      {/* Bottom Dots + Progress Bar */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20">
          {/* Progress Thin Bar */}
          {!isHovered && (
            <div className="w-32 h-0.5 bg-white/40 rounded-full overflow-hidden backdrop-blur-xs">
              <div
                className="h-full bg-white rounded-full transition-none"
                style={{ width: `${progressWidth}%` }}
              />
            </div>
          )}

          {/* Dot Indicators */}
          <div className="flex items-center gap-2 bg-white/60 backdrop-blur-xs px-3 py-1.5 rounded-full shadow-xs">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`h-2 rounded-full transition-all duration-400 cursor-pointer ${
                  currentIndex === i ? "w-6 bg-blue-600 shadow-xs" : "w-2 bg-gray-400 hover:bg-gray-600"
                }`}
                title={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Slide Counter Badge (top right) */}
      {slides.length > 1 && (
        <div className="absolute top-3 right-3 z-20 bg-black/30 text-white font-bold text-[10px] px-2.5 py-1 rounded-full backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-all duration-200">
          {currentIndex + 1} / {slides.length}
        </div>
      )}
    </div>
  );
}
