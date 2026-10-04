"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchCategories, fetchProducts } from "lib/api";

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  mobiles: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
  electronics: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
  watches: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
  fashion: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800",
  footwear: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
  laptops: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800",
  home: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800",
  "home-living": "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800",
  sports: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
  artisan: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800",
  crafts: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800",
  beauty: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800",
  "personal-care": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800",
  books: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800",
  toys: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800"
};

const DEFAULT_FEATURED_CATEGORIES = [
  { id: "cat-jewelry", name: "Royal Jewelry", slug: "jewelry", image_url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800" },
  { id: "cat-mobiles", name: "Mobiles & 5G", slug: "mobiles", image_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800" },
  { id: "cat-electronics", name: "Electronics & Audio", slug: "electronics", image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800" },
  { id: "cat-fashion", name: "Fashion & Apparel", slug: "fashion", image_url: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800" }
];

export function BrowseCategoriesGrid() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActiveCategoriesWithProducts() {
      try {
        const data = await fetchCategories().catch(() => []);
        let activeCats: any[] = [];
        if (Array.isArray(data) && data.length > 0) {
          activeCats = data.filter((c: any) => c.status !== "Inactive" && c.status !== "Disabled");
        }
        
        // Merge with default categories if count is low to ensure full responsive showcase
        const existingSlugs = new Set(activeCats.map((c: any) => (c.slug || c.name || "").toLowerCase()));
        DEFAULT_FEATURED_CATEGORIES.forEach((defCat) => {
          if (!existingSlugs.has(defCat.slug) && activeCats.length < 4) {
            activeCats.push(defCat);
          }
        });

        setCategories(activeCats.length > 0 ? activeCats : DEFAULT_FEATURED_CATEGORIES);
      } catch (e) {
        setCategories(DEFAULT_FEATURED_CATEGORIES);
      } finally {
        setLoading(false);
      }
    }
    loadActiveCategoriesWithProducts();
  }, []);

  if (loading) {
    return (
      <section className="w-full bg-transparent py-12 px-4 sm:px-6 lg:px-8 border-t border-[#E8E1D1]/60 font-sans">
        <div className="max-w-[1440px] mx-auto space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-[#2C221E] text-center tracking-tight">
            Browse Categories
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 sm:h-72 lg:h-80 w-full sm:w-60 md:w-64 bg-[#EBE4D5]/60 animate-pulse rounded-3xl border border-[#E8E1D1]" />
            ))}
          </div>
        </div>
      </section>
    );
  }


  if (categories.length === 0) return null;

  return (
    <section className="w-full bg-transparent py-10 sm:py-14 px-4 sm:px-6 lg:px-8 border-t border-[#E8E1D1]/60 font-sans">
      <div className="max-w-[1440px] mx-auto space-y-6 sm:space-y-8">
        
        {/* Section Title */}
        <div className="text-center space-y-1.5">
          <span className="inline-block bg-[#132B4F] text-cyan-300 border border-cyan-400/40 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-xs">
            COLLECTIONS &amp; DEALS
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#2C221E] tracking-tight">
            Browse Categories
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 font-bold">
            Explore active collections from across our catalog ({categories.length} Categories)
          </p>
        </div>

        {/* 🖼️ Centered & Fully Responsive Grid of Category Tiles */}
        <div className="flex flex-wrap items-stretch justify-center gap-4 sm:gap-6 max-w-[1440px] mx-auto">
          {categories.map((cat: any, idx) => {
            const rawUrl = cat.image_url || (cat.icon && (cat.icon.startsWith("http") || cat.icon.startsWith("data:") || cat.icon.startsWith("/")) ? cat.icon : "");
            const isPlaceholder = !rawUrl || rawUrl.includes("via.placeholder") || rawUrl.includes("open-shop") || rawUrl.includes("OPEN");
            
            const slugKey = (cat.slug || cat.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
            const bgImage = !isPlaceholder && !rawUrl.includes("photo-1517649763962-0c623266010b") && (rawUrl.startsWith("http://") || rawUrl.startsWith("https://") || rawUrl.startsWith("/") || rawUrl.startsWith("data:"))
              ? rawUrl
              : CATEGORY_IMAGE_MAP[slugKey] || CATEGORY_IMAGE_MAP[slugKey.split("-")[0]] || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800";

            return (
              <Link
                key={cat.id || cat.slug || idx}
                href={`/search/${cat.slug || slugKey}`}
                className="group relative h-64 sm:h-72 lg:h-80 w-full sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] max-w-[320px] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex items-end p-5 sm:p-6 bg-slate-950 border-2 border-white/90 cursor-pointer"
              >
                {/* Background Image */}
                <img
                  src={bgImage}
                  alt={cat.name}
                  onError={(e) => {
                    const fallback = "https://images.unsplash.com/photo-1517649763962-0c623266010b?w=800";
                    if (e.currentTarget.src !== fallback) {
                      e.currentTarget.src = fallback;
                    }
                  }}
                  className="absolute inset-0 h-full w-full object-cover group-hover:scale-108 transition duration-500 ease-out"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent group-hover:from-black/90 transition duration-300" />

                {/* Category Title Overlay */}
                <div className="relative z-10 space-y-1">
                  <span className="inline-block text-white font-black text-sm sm:text-base tracking-wider uppercase drop-shadow-md">
                    {cat.name}
                  </span>
                  <span className="block text-[10px] sm:text-xs text-cyan-300 font-bold group-hover:translate-x-1 transition duration-200">
                    Explore Store &rsaquo;
                  </span>
                </div>
              </Link>
            );
          })}

          {/* ⚡ Promotional Mega Offer Tile */}
          <Link
            href="/deals"
            className="group relative h-64 sm:h-72 lg:h-80 w-full sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] max-w-[320px] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between p-6 sm:p-8 bg-gradient-to-tr from-amber-600 via-orange-500 to-yellow-400 text-white border-2 border-white/90 cursor-pointer"
          >
            <div className="space-y-1">
              <span className="bg-black/30 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full backdrop-blur-xs tracking-wider inline-block">
                Limited Time Offer
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-3xl sm:text-4xl font-black tracking-tight leading-none text-white drop-shadow-md uppercase">
                UP TO<br />80% OFF
              </h3>
              <p className="text-xs sm:text-sm font-black text-amber-100 flex items-center gap-1 group-hover:translate-x-1 transition duration-200">
                <span>Shop Mega Deals</span>
                <span>&rsaquo;</span>
              </p>
            </div>
          </Link>

        </div>

      </div>
    </section>
  );
}

