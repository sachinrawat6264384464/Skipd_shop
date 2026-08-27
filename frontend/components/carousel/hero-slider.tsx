"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

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
  badgeText: string;
  bgGradient: string;
  tagColor: string;
  btnColor: string;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: 1,
    tag: "🌿 SUMMER SALE",
    title: "Refresh Your Style This ",
    highlightText: "Summer",
    description: "Discover up to 60% OFF on top-rated electronics, fashion, and lifestyle essentials. Guaranteed fast delivery across India.",
    primaryButtonText: "SHOP NOW",
    primaryButtonHref: "/search",
    secondaryButtonText: "EXPLORE DEALS",
    secondaryButtonHref: "/deals",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
    badgeText: "60% OFF",
    bgGradient: "from-emerald-50 via-teal-50 to-emerald-100 border-emerald-200/80",
    tagColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    btnColor: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
  },
  {
    id: 2,
    tag: "🔥 GREAT FREEDOM SALE",
    title: "Reach Every Home, Join Every ",
    highlightText: "Celebration!",
    description: "Get up to 70% OFF across 100% of India's serviceable pin codes with Shiprocket express delivery and instant coupons.",
    primaryButtonText: "START SHOPPING",
    primaryButtonHref: "/deals",
    secondaryButtonText: "VIEW OFFERS",
    secondaryButtonHref: "/search",
    imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600",
    badgeText: "70% OFF",
    bgGradient: "from-amber-50 via-orange-50 to-amber-100 border-amber-200/80",
    tagColor: "bg-orange-100 text-orange-800 border-orange-300",
    btnColor: "bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/20"
  },
  {
    id: 3,
    tag: "⚡ TECH FRONTIER 2026",
    title: "Next-Gen Audio & Personal ",
    highlightText: "AI Devices",
    description: "Upgrade your daily setup with 165FPS gaming phones, studio ANC headphones & smart wearables.",
    primaryButtonText: "EXPLORE TECH",
    primaryButtonHref: "/search/tech",
    secondaryButtonText: "SEE ALL SPECS",
    secondaryButtonHref: "/product/active-anc-headphones",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
    badgeText: "50% OFF",
    bgGradient: "from-blue-50 via-indigo-50 to-blue-100 border-blue-200/80",
    tagColor: "bg-blue-100 text-blue-800 border-blue-300",
    btnColor: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20"
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
      className="relative w-full overflow-hidden group rounded-3xl"
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
              className={`bg-gradient-to-r ${slide.bgGradient || "from-emerald-50 via-teal-50 to-emerald-100 border-emerald-200/80"} border flex flex-col md:flex-row justify-between items-center gap-6 md:gap-10 relative overflow-hidden min-h-[380px] sm:min-h-[440px] md:min-h-[480px] lg:min-h-[500px] p-6 sm:p-10 md:p-12 lg:p-16`}
            >
              {/* Text Content */}
              <div className="space-y-4 sm:space-y-5 max-w-xl z-10 w-full">
                <span className={`inline-block border font-black text-xs uppercase px-4 py-1.5 rounded-full tracking-wider shadow-2xs ${slide.tagColor || "bg-emerald-100 text-emerald-800 border-emerald-300"}`}>
                  {slide.tag}
                </span>

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-tight tracking-tight">
                  {slide.title}
                  <span className="text-emerald-600 font-black">{slide.highlightText}</span>
                </h1>

                <p className="text-gray-600 text-xs sm:text-sm md:text-base font-medium leading-relaxed max-w-lg">
                  {slide.description}
                </p>

                <div className="flex flex-wrap items-center gap-3.5 pt-3">
                  <Link
                    href={slide.primaryButtonHref || "/search"}
                    className={`font-black text-xs sm:text-sm px-6 py-3.5 rounded-2xl transition shadow-lg cursor-pointer flex items-center gap-2 ${slide.btnColor || "bg-emerald-600 hover:bg-emerald-700 text-white"}`}
                  >
                    <span>{slide.primaryButtonText || "SHOP NOW"}</span>
                    <span>&rarr;</span>
                  </Link>
                  {slide.secondaryButtonText && (
                    <Link
                      href={slide.secondaryButtonHref || "/deals"}
                      className="bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-300 font-black text-xs sm:text-sm px-5 py-3.5 rounded-2xl transition shadow-2xs cursor-pointer"
                    >
                      {slide.secondaryButtonText}
                    </Link>
                  )}
                </div>
              </div>

              {/* Right Image (Full Fill & Cover) */}
              <div className="relative w-full md:w-[440px] lg:w-[500px] h-60 sm:h-80 md:h-[360px] lg:h-[400px] rounded-3xl overflow-hidden shadow-2xl border-2 border-white/80 shrink-0">
                <img
                  src={slide.imageUrl}
                  alt={slide.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {slide.badgeText && (
                  <div className="absolute top-4 right-4 bg-red-600 text-white font-black text-xs sm:text-sm px-4 py-1.5 rounded-full shadow-xl animate-pulse tracking-wide">
                    {slide.badgeText}
                  </div>
                )}
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
                  currentIndex === i ? "w-6 bg-emerald-600 shadow-xs" : "w-2 bg-gray-400 hover:bg-gray-600"
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
