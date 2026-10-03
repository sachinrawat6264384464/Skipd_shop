"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchCategories, fetchProducts } from "lib/api";

const RELIABLE_SPORTS_IMAGE = "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&auto=format&fit=crop&q=80";
const RELIABLE_BEAUTY_IMAGE = "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&auto=format&fit=crop&q=80";

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  mobiles: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=80",
  mobile: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=80",
  electronics: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80",
  watches: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80",
  watch: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80",
  fashion: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=300&auto=format&fit=crop&q=80",
  apparel: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=300&auto=format&fit=crop&q=80",
  footwear: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop&q=80",
  shoes: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop&q=80",
  laptops: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&auto=format&fit=crop&q=80",
  laptop: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&auto=format&fit=crop&q=80",
  home: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=300&auto=format&fit=crop&q=80",
  "home-living": "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=300&auto=format&fit=crop&q=80",
  sports: RELIABLE_SPORTS_IMAGE,
  "sports-fitness": RELIABLE_SPORTS_IMAGE,
  fitness: RELIABLE_SPORTS_IMAGE,
  beauty: RELIABLE_BEAUTY_IMAGE,
  "beauty-care": RELIABLE_BEAUTY_IMAGE,
  skincare: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=300&auto=format&fit=crop&q=80",
  cosmetics: RELIABLE_BEAUTY_IMAGE,
  artisan: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=300&auto=format&fit=crop&q=80",
  lifestyle: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=300&auto=format&fit=crop&q=80"
};

function getFallbackForSlug(slug: string): string {
  const cleanSlug = (slug || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const prefix = cleanSlug.split("-")[0] || cleanSlug;
  if (cleanSlug.includes("beauty") || prefix === "beauty" || cleanSlug.includes("skincare") || cleanSlug.includes("care")) {
    return RELIABLE_BEAUTY_IMAGE;
  }
  return CATEGORY_IMAGE_MAP[cleanSlug] || CATEGORY_IMAGE_MAP[prefix] || RELIABLE_SPORTS_IMAGE;
}

function getCategoryImageUrl(c: any, prodsList: any[] = []): string {
  const rawUrl = c.image_url || c.icon || "";
  if (rawUrl.includes("photo-1517649763962-0c623266010b")) {
    return RELIABLE_SPORTS_IMAGE;
  }
  if (rawUrl && (rawUrl.startsWith("http://") || rawUrl.startsWith("https://") || rawUrl.startsWith("data:") || rawUrl.startsWith("/"))) {
    return rawUrl;
  }

  // Try to find first product image for this category if rawUrl is null/emoji
  const catSlug = (c.slug || c.name || "").toLowerCase();
  const matchedProd = prodsList.find((p: any) => {
    const pCat = (typeof p.category === "object" ? p.category?.slug || p.category?.name : (p.category_slug || p.category_name || p.category) || "").toLowerCase();
    return pCat.includes(catSlug) || catSlug.includes(pCat);
  });

  if (matchedProd && matchedProd.image && (matchedProd.image.startsWith("http") || matchedProd.image.startsWith("/"))) {
    return matchedProd.image;
  }

  return getFallbackForSlug(c.slug || c.name);
}

export function CategoryNav() {
  const [categories, setCategories] = useState<{ name: string; slug: string; image_url: string }[]>([]);

  useEffect(() => {
    async function loadActiveCategoriesWithProducts() {
      try {
        const prods = await fetchProducts().catch(() => []);
        const dbCats = await fetchCategories().catch(() => []);
        const activeMap = new Map<string, { name: string; slug: string; image_url: string }>();

        if (Array.isArray(dbCats) && dbCats.length > 0) {
          dbCats.forEach((c: any) => {
            if (c.status !== "Inactive" && c.status !== "Disabled" && c.slug) {
              activeMap.set(c.slug, {
                name: c.name,
                slug: c.slug,
                image_url: getCategoryImageUrl(c, prods)
              });
            }
          });
        }

        if (activeMap.size === 0 && Array.isArray(prods) && prods.length > 0) {
          prods.forEach((p: any) => {
            const catName = typeof p.category === "object" ? p.category?.name : (p.category_name || p.category_slug || p.category);
            const catSlug = typeof p.category === "object" ? p.category?.slug : (p.category_slug || (catName ? String(catName).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : null));

            if (catName && catSlug && !activeMap.has(catSlug)) {
              activeMap.set(catSlug, {
                name: String(catName).charAt(0).toUpperCase() + String(catName).slice(1),
                slug: catSlug,
                image_url: getCategoryImageUrl({ name: catName, slug: catSlug }, prods)
              });
            }
          });
        }

        setCategories(Array.from(activeMap.values()));
      } catch (e) {}
    }

    loadActiveCategoriesWithProducts();
  }, []);

  if (categories.length === 0) return null;

  return (
    <nav className="w-full bg-white border-b border-gray-200/80 py-3.5 px-4 sm:px-8 font-sans shadow-2xs">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-center flex-wrap gap-5 sm:gap-8 md:gap-10 lg:gap-14">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/search/${cat.slug}`}
            className="group flex flex-col items-center gap-1.5 cursor-pointer transition transform hover:-translate-y-1"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18 rounded-full border-2 border-emerald-500/20 group-hover:border-emerald-600 shadow-2xs group-hover:shadow-md transition duration-300 overflow-hidden bg-gray-50 p-0.5 relative">
              <img
                src={cat.image_url}
                alt={cat.name}
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = getFallbackForSlug(cat.slug);
                }}
                className="w-full h-full object-cover rounded-full group-hover:scale-110 transition duration-300"
              />
            </div>
            <span className="text-xs sm:text-sm font-extrabold text-gray-800 group-hover:text-emerald-700 transition tracking-tight text-center">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}


