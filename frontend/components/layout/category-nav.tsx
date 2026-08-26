"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchCategories, fetchProducts } from "lib/api";

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  mobiles: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
  mobile: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
  electronics: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
  watches: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
  watch: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
  fashion: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800",
  apparel: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800",
  footwear: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
  shoes: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
  laptops: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800",
  laptop: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800",
  home: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800",
  "home-living": "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800",
  sports: "https://images.unsplash.com/photo-1517649763962-0c623266010b?w=800",
  artisan: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800",
  lifestyle: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800"
};

function getCategoryImageUrl(c: any): string {
  const rawUrl = c.image_url || c.icon || "";
  if (rawUrl && (rawUrl.startsWith("http://") || rawUrl.startsWith("https://") || rawUrl.startsWith("data:") || rawUrl.startsWith("/"))) {
    return rawUrl;
  }
  const slug = (c.slug || c.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const prefix = slug.split("-")[0] || slug;
  return CATEGORY_IMAGE_MAP[slug] || CATEGORY_IMAGE_MAP[prefix] || "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800";
}

export function CategoryNav() {
  const [categories, setCategories] = useState<{ name: string; slug: string; image_url: string }[]>([]);

  useEffect(() => {
    async function loadActiveCategoriesWithProducts() {
      try {
        // 1. Fetch active products to identify categories that ACTUALLY contain items
        const prods = await fetchProducts().catch(() => []);
        const categoriesWithProducts = new Set<string>();

        if (Array.isArray(prods) && prods.length > 0) {
          prods.forEach((p: any) => {
            const catName = typeof p.category === "object" ? p.category?.name : (p.category_name || p.category);
            const catSlug = typeof p.category === "object" ? p.category?.slug : (p.category_slug || (catName ? String(catName).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : null));
            if (catSlug) {
              const lowerSlug = String(catSlug).toLowerCase();
              const prefix = lowerSlug.split("-")[0] || lowerSlug;
              categoriesWithProducts.add(lowerSlug);
              categoriesWithProducts.add(prefix);
            }
          });
        }

        // 2. Fetch categories from PostgreSQL DB
        const dbCats = await fetchCategories().catch(() => []);
        const activeMap = new Map<string, { name: string; slug: string; image_url: string }>();

        if (Array.isArray(dbCats) && dbCats.length > 0) {
          dbCats.forEach((c: any) => {
            if (c.status !== "Inactive" && c.slug) {
              const lowerSlug = String(c.slug).toLowerCase();
              const prefix = lowerSlug.split("-")[0] || lowerSlug;
              const hasCount = typeof c.count === "number" ? c.count > 0 : false;

              // ONLY INCLUDE IF CATEGORY HAS AT LEAST 1 PRODUCT
              if (categoriesWithProducts.has(lowerSlug) || categoriesWithProducts.has(prefix) || hasCount) {
                activeMap.set(c.slug, {
                  name: c.name,
                  slug: c.slug,
                  image_url: getCategoryImageUrl(c)
                });
              }
            }
          });
        }

        // 3. Fallback: if DB categories list is loading, populate from products map
        if (activeMap.size === 0 && Array.isArray(prods) && prods.length > 0) {
          prods.forEach((p: any) => {
            const catName = typeof p.category === "object" ? p.category?.name : (p.category_name || p.category_slug || p.category);
            const catSlug = typeof p.category === "object" ? p.category?.slug : (p.category_slug || (catName ? String(catName).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : null));

            if (catName && catSlug && !activeMap.has(catSlug)) {
              activeMap.set(catSlug, {
                name: String(catName).charAt(0).toUpperCase() + String(catName).slice(1),
                slug: catSlug,
                image_url: getCategoryImageUrl({ name: catName, slug: catSlug })
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
    <nav className="bg-white border-b border-gray-200/80 py-4 px-4 overflow-x-auto no-scrollbar font-sans shadow-2xs">
      <div className="max-w-[1440px] mx-auto flex items-center justify-start sm:justify-center gap-6 md:gap-9 min-w-max">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/search/${cat.slug}`}
            className="group flex flex-col items-center gap-2 cursor-pointer transition transform hover:-translate-y-1"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-emerald-500/20 group-hover:border-emerald-600 shadow-2xs group-hover:shadow-md transition duration-300 overflow-hidden bg-gray-50 p-0.5">
              <img
                src={cat.image_url}
                alt={cat.name}
                className="w-full h-full object-cover rounded-full group-hover:scale-110 transition duration-300"
              />
            </div>
            <span className="text-xs font-extrabold text-gray-800 group-hover:text-emerald-700 transition tracking-tight">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
