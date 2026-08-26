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
  sports: "https://images.unsplash.com/photo-1517649763962-0c623266010b?w=800",
  artisan: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800",
  crafts: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800",
  beauty: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800",
  "personal-care": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800",
  books: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800",
  toys: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800"
};

export function BrowseCategoriesGrid() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActiveCategoriesWithProducts() {
      try {
        const prods = await fetchProducts().catch(() => []);
        const categoriesWithProducts = new Set<string>();

        if (Array.isArray(prods) && prods.length > 0) {
          prods.forEach((p: any) => {
            const catName = typeof p.category === "object" ? p.category?.name : (p.category_name || p.category);
            const catSlug = typeof p.category === "object" ? p.category?.slug : (p.category_slug || (catName ? String(catName).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : null));
            if (catSlug) {
              const lowerSlug = String(catSlug).toLowerCase();
              categoriesWithProducts.add(lowerSlug);
              categoriesWithProducts.add(lowerSlug.split("-")[0]);
            }
          });
        }

        const data = await fetchCategories().catch(() => []);
        if (Array.isArray(data) && data.length > 0) {
          const activeWithProds = data.filter((c: any) => {
            if (c.status === "Inactive") return false;
            const lowerSlug = (c.slug || c.name || "").toLowerCase();
            const prefix = lowerSlug.split("-")[0];
            const hasCount = typeof c.count === "number" ? c.count > 0 : false;
            return categoriesWithProducts.has(lowerSlug) || categoriesWithProducts.has(prefix) || hasCount;
          });
          setCategories(activeWithProds);
        }
      } catch (e) {
        console.error("Failed to load browse categories:", e);
      } finally {
        setLoading(false);
      }
    }
    loadActiveCategoriesWithProducts();
  }, []);

  if (loading) {
    return (
      <section className="w-full bg-white py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-100 font-sans">
        <div className="max-w-[1440px] mx-auto space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 text-center tracking-tight">
            Browse Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-64 sm:h-72 lg:h-80 bg-gray-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="w-full bg-white py-10 sm:py-14 px-4 sm:px-6 lg:px-8 border-t border-gray-200/80 font-sans">
      <div className="max-w-[1440px] mx-auto space-y-6 sm:space-y-8">
        
        {/* Section Title */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">
            Browse Categories
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-bold">
            Explore active collections from across our catalog ({categories.length} Categories)
          </p>
        </div>

        {/* 🖼️ Grid of Category Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
          {categories.map((cat: any, idx) => {
            const rawUrl = cat.image_url || cat.icon || "";
            const isPlaceholder = !rawUrl || rawUrl.includes("via.placeholder") || rawUrl.includes("open-shop") || rawUrl.includes("OPEN");
            
            const slugKey = (cat.slug || cat.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
            const bgImage = !isPlaceholder && (rawUrl.startsWith("http://") || rawUrl.startsWith("https://") || rawUrl.startsWith("/"))
              ? rawUrl
              : CATEGORY_IMAGE_MAP[slugKey] || CATEGORY_IMAGE_MAP[slugKey.split("-")[0]] || "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800";

            return (
              <Link
                key={cat.id || cat.slug || idx}
                href={`/search/${cat.slug || slugKey}`}
                className="group relative h-64 sm:h-72 lg:h-80 rounded-2xl overflow-hidden shadow-xs hover:shadow-2xl transition duration-300 flex items-end p-4 sm:p-5 bg-gray-900 border border-gray-200/60"
              >
                {/* Background Image */}
                <img
                  src={bgImage}
                  alt={cat.name}
                  className="absolute inset-0 h-full w-full object-cover group-hover:scale-108 transition duration-500 ease-out"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent group-hover:from-black/90 transition duration-300" />

                {/* Category Title Overlay */}
                <div className="relative z-10 space-y-1">
                  <span className="inline-block text-white font-black text-sm sm:text-base tracking-wider uppercase drop-shadow-md">
                    {cat.name}
                  </span>
                  <span className="block text-[10px] sm:text-xs text-emerald-300 font-bold group-hover:translate-x-1 transition duration-200">
                    Explore Store &rarr;
                  </span>
                </div>
              </Link>
            );
          })}

          {/* ⚡ Promotional Offer Banner Tile */}
          <Link
            href="/deals"
            className="group relative h-64 sm:h-72 lg:h-80 rounded-2xl overflow-hidden shadow-xs hover:shadow-2xl transition duration-300 flex flex-col justify-between p-6 sm:p-8 bg-gradient-to-tr from-amber-600 via-orange-500 to-yellow-400 text-white border border-amber-400/50"
          >
            <div className="space-y-1">
              <span className="bg-black/30 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full backdrop-blur-xs tracking-wider inline-block">
                Limited Time Offer
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-none text-white drop-shadow-md uppercase">
                UP TO<br />80% OFF
              </h3>
              <p className="text-xs sm:text-sm font-black text-amber-100 flex items-center gap-1 group-hover:translate-x-1 transition duration-200">
                <span>Shop Mega Deals</span>
                <span>&rarr;</span>
              </p>
            </div>
          </Link>

        </div>

      </div>
    </section>
  );
}
