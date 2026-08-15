"use client";

import { useState, useEffect, useRef } from "react";
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
  bgGradient: string; // e.g. "from-emerald-50 via-teal-50 to-emerald-100 border-emerald-200/80"
  tagColor: string; // e.g. "bg-emerald-100 text-emerald-800 border-emerald-300"
  btnColor: string; // e.g. "bg-emerald-600 hover:bg-emerald-700 text-white"
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

export function HeroSlider() {
  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_SLIDES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Load dynamic slides from localStorage (admin panel updates)
  const loadSlides = () => {
    try {
      const stored = localStorage.getItem("skipd_hero_banners");
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
    window.addEventListener("skipd_banners_updated", handleUpdate);
    return () => window.removeEventListener("skipd_banners_updated", handleUpdate);
  }, []);

  // Auto-slide every 2 seconds (2000ms) right to left, paused on hover
  useEffect(() => {
    if (isHovered || slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 2000); // 2 seconds

    return () => clearInterval(interval);
  }, [isHovered, slides.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (!slides || slides.length === 0) return null;

  return (
    <div
      className="relative w-full overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides Container - Smooth horizontal slide (Right to Left) */}
      <div
        className="flex transition-transform duration-500 ease-in-out w-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide, idx) => (
          <div key={slide.id || idx} className="w-full shrink-0">
            <div className={`bg-gradient-to-r ${slide.bgGradient || "from-emerald-50 via-teal-50 to-emerald-100 border-emerald-200/80"} border rounded-3xl p-8 md:p-12 shadow-xs flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden min-h-[320px]`}>

              {/* Text Content */}
              <div className="space-y-4 max-w-xl z-10">
                <span className={`inline-block border font-extrabold text-[10px] uppercase px-3 py-1 rounded-full tracking-wider ${slide.tagColor || "bg-emerald-100 text-emerald-800 border-emerald-300"}`}>
                  {slide.tag}
                </span>

                <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight">
                  {slide.title}
                  <span className="text-emerald-600">{slide.highlightText}</span>
                </h1>

                <p className="text-gray-600 text-xs md:text-sm font-medium leading-relaxed">
                  {slide.description}
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <Link
                    href={slide.primaryButtonHref || "/search"}
                    className={`font-extrabold text-xs px-6 py-3.5 rounded-xl transition shadow-md cursor-pointer ${slide.btnColor || "bg-emerald-600 hover:bg-emerald-700 text-white"}`}
                  >
                    {slide.primaryButtonText || "SHOP NOW"}
                  </Link>
                  {slide.secondaryButtonText && (
                    <Link
                      href={slide.secondaryButtonHref || "/deals"}
                      className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 font-bold text-xs px-5 py-3.5 rounded-xl transition shadow-2xs cursor-pointer"
                    >
                      {slide.secondaryButtonText}
                    </Link>
                  )}
                </div>
              </div>

              {/* Right Image Container */}
              <div className="relative w-full md:w-96 h-64 md:h-72 rounded-2xl overflow-hidden shadow-lg border border-emerald-100 shrink-0">
                <img
                  src={slide.imageUrl}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                {slide.badgeText && (
                  <div className="absolute top-3 right-3 bg-red-600 text-white font-black text-xs px-3 py-1.5 rounded-full shadow-md animate-pulse">
                    {slide.badgeText}
                  </div>
                )}
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Manual Slide Navigation Arrows (visible on hover) */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-gray-900 font-black text-lg shadow-lg backdrop-blur-xs opacity-0 group-hover:opacity-100 transition duration-200 flex items-center justify-center cursor-pointer z-20"
            title="Previous Slide"
          >
            ‹
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-gray-900 font-black text-lg shadow-lg backdrop-blur-xs opacity-0 group-hover:opacity-100 transition duration-200 flex items-center justify-center cursor-pointer z-20"
            title="Next Slide"
          >
            ›
          </button>
        </>
      )}

      {/* Slide Indicators (Dots) */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 bg-white/60 backdrop-blur-xs px-3 py-1.5 rounded-full shadow-xs">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                currentIndex === i ? "w-6 bg-emerald-600" : "w-2 bg-gray-400 hover:bg-gray-600"
              }`}
              title={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
