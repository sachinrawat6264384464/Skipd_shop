"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  sports: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
  "sports-fitness": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
  fitness: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
  beauty: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800",
  "beauty-care": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800",
  skincare: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800",
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
  if (slug.includes("beauty") || prefix === "beauty" || slug.includes("skincare") || slug.includes("care")) {
    return "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800";
  }
  return CATEGORY_IMAGE_MAP[slug] || CATEGORY_IMAGE_MAP[prefix] || "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800";
}

export function CatalogSidebarFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentDiscount = searchParams.get("discount") ? Number(searchParams.get("discount")) : 0;

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value !== null && value !== "" && value !== "0" && value !== "100000") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
  };

  const [categories, setCategories] = useState<{ name: string; image_url: string; slug: string }[]>([
    { name: "All Categories", image_url: "", slug: "all" }
  ]);

  useEffect(() => {
    async function loadActiveCategories() {
      try {
        const dbCats = await fetchCategories().catch(() => []);
        const activeList: { name: string; image_url: string; slug: string }[] = [
          { name: "All Categories", image_url: "", slug: "all" }
        ];

        if (Array.isArray(dbCats) && dbCats.length > 0) {
          dbCats.forEach((c: any) => {
            if (c.status !== "Inactive" && c.status !== "Disabled" && c.slug) {
              activeList.push({
                name: c.name,
                slug: c.slug,
                image_url: getCategoryImageUrl(c)
              });
            }
          });
        }

        // Fallback: if DB categories were empty, populate from products catalog
        if (activeList.length === 1) {
          const prods = await fetchProducts().catch(() => []);
          const map = new Map<string, { name: string; image_url: string; slug: string }>();

          if (Array.isArray(prods) && prods.length > 0) {
            prods.forEach((p: any) => {
              const catName = typeof p.category === "object" ? p.category?.name : (p.category_name || p.category);
              const catSlug = typeof p.category === "object" ? p.category?.slug : (p.category_slug || (catName ? String(catName).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : null));

              if (catName && catSlug && !map.has(catSlug)) {
                map.set(catSlug, {
                  name: String(catName).charAt(0).toUpperCase() + String(catName).slice(1),
                  slug: catSlug,
                  image_url: getCategoryImageUrl({ name: catName, slug: catSlug })
                });
              }
            });
          }

          map.forEach((item) => activeList.push(item));
        }

        setCategories(activeList);
      } catch (err) {}
    }

    loadActiveCategories();
  }, []);

  const discounts = [10, 20, 30, 40, 50];

  return (
    <aside className="bg-white border border-gray-200/80 rounded-3xl p-5 shadow-xs space-y-6 text-xs text-gray-800 font-sans">
      
      {/* 📁 CATEGORIES Section */}
      <div className="space-y-3">
        <h4 className="font-black text-gray-900 uppercase text-[10px] tracking-wider">Categories</h4>
        <ul className="space-y-1">
          {categories.map((cat) => {
            const isActive = cat.slug === "all" 
              ? pathname === "/search" || pathname === "/category/all" || pathname === "/category/all-categories"
              : pathname.includes(cat.slug);

            return (
              <li key={cat.name}>
                <Link
                  href={cat.slug === "all" ? "/category/all" : `/category/${cat.slug}`}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl transition cursor-pointer font-medium ${
                    isActive
                      ? "bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 shadow-2xs"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {cat.slug === "all" ? (
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs">☷</span>
                    ) : (
                      <img
                        src={cat.image_url}
                        alt={cat.name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800";
                        }}
                        className="w-5 h-5 rounded-full object-cover border border-gray-200 shadow-2xs"
                      />
                    )}
                    <span>{cat.name}</span>
                  </div>
                  {isActive && <span className="text-emerald-700 font-black">✓</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* 🏷️ DISCOUNT */}
      <div className="pt-4 border-t border-gray-100 space-y-2">
        <h4 className="font-black text-gray-900 uppercase text-[10px] tracking-wider">Discount</h4>
        <div className="space-y-1.5 font-medium text-gray-700">
          {discounts.map((d) => (
            <label key={d} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={currentDiscount === d}
                onChange={() => updateParam("discount", currentDiscount === d ? null : String(d))}
                className="w-3.5 h-3.5 accent-emerald-600 rounded cursor-pointer"
              />
              <span>{d}% and above</span>
            </label>
          ))}
        </div>
      </div>

    </aside>
  );
}
