"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchCategories, fetchProducts } from "lib/api";

const CATEGORY_META_MAP: Record<string, { image: string; tag: string }> = {
  jewelry: {
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800",
    tag: "Fine Crafts & Luxury"
  },
  jewellery: {
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800",
    tag: "Fine Crafts & Luxury"
  },
  apparel: {
    image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800",
    tag: "Trending Styles"
  },
  fashion: {
    image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800",
    tag: "Wardrobe Essentials"
  },
  "apparel-wear": {
    image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800",
    tag: "Trending Styles"
  },
  tech: {
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800",
    tag: "Audio & Smart Tech"
  },
  "tech-essentials": {
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800",
    tag: "Audio & Smart Tech"
  },
  watches: {
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
    tag: "Premium Chrono"
  },
  accessories: {
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
    tag: "Everyday Luxury"
  },
  "lifestyle-accessories": {
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
    tag: "Daily Luxury"
  },
  electronics: {
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800",
    tag: "PC & Smart Devices"
  },
  laptops: {
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800",
    tag: "Laptops & Computing"
  },
  mobiles: {
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
    tag: "5G Flagships"
  },
  footwear: {
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
    tag: "Sneakers & Kicks"
  },
  home: {
    image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800",
    tag: "Decor & Living"
  },
  "home-living": {
    image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800",
    tag: "Decor & Living"
  }
};

const DEFAULT_CATEGORIES = [
  { id: "c1", name: "Jewelry", slug: "jewelry", tag: "Fine Crafts & Luxury" },
  { id: "c2", name: "Apparel & Wear", slug: "fashion", tag: "Trending Styles" },
  { id: "c3", name: "Tech Essentials", slug: "electronics", tag: "Audio & Smart Tech" },
  { id: "c4", name: "Lifestyle Accessories", slug: "watches", tag: "Premium Chrono" },
  { id: "c5", name: "Electronics", slug: "laptops", tag: "PC & Smart Devices" },
  { id: "c6", name: "Mobiles", slug: "mobiles", tag: "5G Flagships" }
];

export function BrowseCategoriesGrid() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActiveCategoriesWithProducts() {
      try {
        const [cats, prods] = await Promise.all([
          fetchCategories().catch(() => []),
          fetchProducts().catch(() => [])
        ]);

        let activeCats: any[] = [];

        // Get active category slugs from products in DB
        const activeSlugsFromProducts = new Set(
          (prods || []).map((p: any) =>
            (typeof p.category === "object" ? p.category?.slug : p.category_slug || p.category || "").toLowerCase()
          )
        );

        if (Array.isArray(cats) && cats.length > 0) {
          activeCats = cats.filter((c: any) => {
            if (c.status === "Inactive" || c.status === "Disabled") return false;
            if (activeSlugsFromProducts.size > 0) {
              const cSlug = (c.slug || c.name || "").toLowerCase();
              return activeSlugsFromProducts.has(cSlug);
            }
            return true;
          });
        } else if (Array.isArray(prods) && prods.length > 0) {
          const activeMap = new Map<string, any>();
          prods.forEach((p: any) => {
            const catObj = typeof p.category === "object" ? p.category : null;
            const catName = catObj?.name || p.category_name || p.category || "General";
            const catSlug = catObj?.slug || p.category_slug || String(catName).toLowerCase().replace(/[^a-z0-9]+/g, "-");
            if (!activeMap.has(catSlug)) {
              activeMap.set(catSlug, {
                id: p.category_id || p.id,
                name: catName,
                slug: catSlug,
                image_url: p.images?.[0] || ""
              });
            }
          });
          activeCats = Array.from(activeMap.values());
        }

        setCategories(activeCats.length > 0 ? activeCats : DEFAULT_CATEGORIES);
      } catch (e) {
        setCategories(DEFAULT_CATEGORIES);
      } finally {
        setLoading(false);
      }
    }

    loadActiveCategoriesWithProducts();

    window.addEventListener("ecom_auth_changed", loadActiveCategoriesWithProducts);
    return () => window.removeEventListener("ecom_auth_changed", loadActiveCategoriesWithProducts);
  }, []);

  const displayList = categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  if (loading) {
    return (
      <section className="w-full bg-white py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-100 font-sans">
        <div className="max-w-[1440px] mx-auto space-y-6">
          <div className="h-6 w-48 bg-gray-100 animate-pulse rounded-full mx-auto" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="h-72 sm:h-80 w-full sm:col-span-2 bg-gray-100 animate-pulse rounded-3xl" />
            {[1, 2].map((i) => (
              <div key={i} className="h-72 sm:h-80 w-full bg-gray-100 animate-pulse rounded-3xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-100 font-sans">
      <div className="max-w-[1440px] mx-auto space-y-8 sm:space-y-10">
        
        {/* Section Header */}
        <div className="text-center space-y-2">
          <span className="inline-block bg-blue-50 text-blue-700 border border-blue-200/80 text-[11px] font-extrabold uppercase tracking-widest px-3.5 py-1 rounded-full shadow-2xs">
            CURATED COLLECTIONS &amp; OFFERS
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">
            Explore Categories
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-medium max-w-md mx-auto">
            Shop top trending collections curated for quality, style, and unmatched everyday value
          </p>
        </div>

        {/* 🖼️ Modern Bento Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 max-w-[1440px] mx-auto">
          
          {/* ⚡ Promotional Mega Offer Hero Tile (Spans 2 columns on Desktop Bento Layout) */}
          <Link
            href="/deals"
            className="group relative h-72 sm:h-80 w-full sm:col-span-2 lg:col-span-2 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between p-6 sm:p-8 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-900 text-white border border-blue-400/30 cursor-pointer"
          >
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-400/20 rounded-full blur-2xl group-hover:scale-125 transition duration-700 pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-amber-400/15 rounded-full blur-2xl group-hover:scale-125 transition duration-700 pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between">
              <span className="bg-amber-400 text-gray-950 text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider shadow-xs">
                LIMITED TIME OFFER
              </span>
              <span className="bg-white/15 backdrop-blur-md text-white text-[10px] font-extrabold px-3 py-1 rounded-full border border-white/20">
                Coupon: MEGA80
              </span>
            </div>

            <div className="relative z-10 space-y-3">
              <div className="space-y-1">
                <span className="text-xs sm:text-sm font-bold text-blue-200 uppercase tracking-widest block">
                  Exclusive Mega Drop
                </span>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-none text-white drop-shadow-md">
                  UP TO 80% OFF
                </h3>
                <p className="text-xs sm:text-sm text-blue-100/90 font-medium max-w-sm pt-1 line-clamp-2">
                  Massive price drops across electronics, fashion, lifestyle &amp; daily essentials.
                </p>
              </div>

              <div className="pt-1">
                <span className="inline-flex items-center gap-2 bg-white text-blue-700 font-black text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md group-hover:bg-blue-50 transition transform group-hover:-translate-y-0.5">
                  <span>Shop Mega Deals</span>
                  <span className="group-hover:translate-x-1 transition">&rarr;</span>
                </span>
              </div>
            </div>
          </Link>

          {/* Dynamic Curated Category Cards */}
          {displayList.map((cat: any, idx: number) => {
            const slugKey = (cat.slug || cat.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
            const meta = CATEGORY_META_MAP[slugKey] || CATEGORY_META_MAP[slugKey.split("-")[0]];
            
            const rawUrl = cat.image_url || (cat.icon && (cat.icon.startsWith("http") || cat.icon.startsWith("data:") || cat.icon.startsWith("/")) ? cat.icon : "");
            const isPlaceholder = !rawUrl || rawUrl.includes("via.placeholder") || rawUrl.includes("open-shop") || rawUrl.includes("OPEN");

            const bgImage = !isPlaceholder && !rawUrl.includes("photo-1517649763962-0c623266010b") && (rawUrl.startsWith("http://") || rawUrl.startsWith("https://") || rawUrl.startsWith("/"))
              ? rawUrl
              : meta?.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800";

            const tagText = cat.tag || meta?.tag || "Trending Collection";

            return (
              <Link
                key={cat.id || cat.slug || idx}
                href={`/search/${cat.slug || slugKey}`}
                className="group relative h-72 sm:h-80 w-full rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-200/80 hover:border-blue-500 flex flex-col justify-between p-5 sm:p-6 bg-slate-900 cursor-pointer"
              >
                {/* Background Image with Zoom */}
                <img
                  src={bgImage}
                  alt={cat.name}
                  onError={(e) => {
                    const fallback = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800";
                    if (e.currentTarget.src !== fallback) {
                      e.currentTarget.src = fallback;
                    }
                  }}
                  className="absolute inset-0 h-full w-full object-cover group-hover:scale-106 transition-transform duration-500 ease-out"
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/35 to-transparent group-hover:from-gray-950/95 transition duration-300" />

                {/* Top Badge */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 bg-black/40 backdrop-blur-md text-white/95 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full border border-white/20 tracking-wider">
                    {tagText}
                  </span>
                </div>

                {/* Bottom Title & CTA */}
                <div className="relative z-10 space-y-1">
                  <h3 className="text-lg sm:text-xl font-black text-white tracking-wide uppercase drop-shadow-md">
                    {cat.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-300 group-hover:text-blue-200 transition">
                    <span>Explore Store</span>
                    <span className="transform group-hover:translate-x-1 transition duration-200">&rarr;</span>
                  </div>
                </div>
              </Link>
            );
          })}

        </div>

      </div>
    </section>
  );
}
