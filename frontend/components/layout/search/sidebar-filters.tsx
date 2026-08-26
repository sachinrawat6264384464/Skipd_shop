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

export function CatalogSidebarFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentMaxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : 100000;
  const currentExpress = searchParams.get("express") === "true";
  const currentRating = searchParams.get("rating") ? Number(searchParams.get("rating")) : 0;
  const currentColor = searchParams.get("color");
  const currentDiscount = searchParams.get("discount") ? Number(searchParams.get("discount")) : 0;

  const [maxPrice, setMaxPrice] = useState<number>(currentMaxPrice);

  useEffect(() => {
    setMaxPrice(currentMaxPrice);
  }, [currentMaxPrice]);

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
    async function loadActiveCategoriesWithProducts() {
      try {
        // 1. Collect category slugs with active products
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
        const activeList: { name: string; image_url: string; slug: string }[] = [
          { name: "All Categories", image_url: "", slug: "all" }
        ];

        if (Array.isArray(dbCats) && dbCats.length > 0) {
          dbCats.forEach((c: any) => {
            if (c.status !== "Inactive" && c.slug) {
              const lowerSlug = String(c.slug).toLowerCase();
              const prefix = lowerSlug.split("-")[0] || lowerSlug;
              const hasCount = typeof c.count === "number" ? c.count > 0 : false;

              // ONLY INCLUDE IF CATEGORY HAS AT LEAST 1 PRODUCT
              if (categoriesWithProducts.has(lowerSlug) || categoriesWithProducts.has(prefix) || hasCount) {
                activeList.push({
                  name: c.name,
                  slug: c.slug,
                  image_url: getCategoryImageUrl(c)
                });
              }
            }
          });
        }

        setCategories(activeList);
      } catch (err) {}
    }

    loadActiveCategoriesWithProducts();
  }, []);

  const colorPalette = [
    { name: "Black", hex: "#000000" },
    { name: "White", hex: "#FFFFFF" },
    { name: "Brown", hex: "#78350F" },
    { name: "Yellow", hex: "#FACC15" },
    { name: "Red", hex: "#EF4444" },
    { name: "Blue", hex: "#3B82F6" },
    { name: "Green", hex: "#10B981" },
    { name: "Purple", hex: "#8B5CF6" },
    { name: "Pink", hex: "#EC4899" },
  ];

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
                      <img src={cat.image_url} alt={cat.name} className="w-5 h-5 rounded-full object-cover border border-gray-200 shadow-2xs" />
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

      {/* ⚡ DELIVERY SPEED */}
      <div className="pt-4 border-t border-gray-100 space-y-2">
        <h4 className="font-black text-gray-900 uppercase text-[10px] tracking-wider">Delivery Speed</h4>
        <label className="flex items-center gap-2 cursor-pointer font-semibold text-gray-700">
          <input
            type="checkbox"
            checked={currentExpress}
            onChange={(e) => updateParam("express", e.target.checked ? "true" : null)}
            className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
          />
          <span>⚡ Get It Today / Tomorrow</span>
        </label>
      </div>

      {/* ⭐ CUSTOMER REVIEWS */}
      <div className="pt-4 border-t border-gray-100 space-y-2">
        <h4 className="font-black text-gray-900 uppercase text-[10px] tracking-wider">Customer Reviews</h4>
        <button
          onClick={() => updateParam("rating", currentRating === 4 ? null : "4")}
          className={`flex items-center gap-1.5 font-bold hover:underline cursor-pointer px-2 py-1 rounded-lg transition ${
            currentRating === 4 ? "bg-amber-50 text-amber-800 border border-amber-200" : "text-amber-500"
          }`}
        >
          <span>★★★★☆</span>
          <span className="text-gray-700 font-bold text-xs">&amp; Up</span>
        </button>
      </div>

      {/* 💰 PRICE RANGE */}
      <div className="pt-4 border-t border-gray-100 space-y-3">
        <h4 className="font-black text-gray-900 uppercase text-[10px] tracking-wider">Price Range</h4>
        <p className="text-[11px] text-gray-500 font-medium">The highest price is ₹1,00,000</p>
        
        <input
          type="range"
          min="1000"
          max="130000"
          step="1000"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          onMouseUp={(e) => updateParam("maxPrice", (e.target as HTMLInputElement).value)}
          onTouchEnd={(e) => updateParam("maxPrice", (e.target as HTMLInputElement).value)}
          className="w-full accent-emerald-600 cursor-pointer"
        />

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-center">
            <span className="text-[10px] text-gray-400 block font-semibold">Min</span>
            <span className="font-extrabold text-gray-900">₹ 0</span>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-center">
            <span className="text-[10px] text-gray-400 block font-semibold">Max</span>
            <span className="font-extrabold text-gray-900">₹{maxPrice > 99000 ? "20000+" : maxPrice.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>

      {/* 🎨 COLOUR PALETTE */}
      <div className="pt-4 border-t border-gray-100 space-y-2.5">
        <h4 className="font-black text-gray-900 uppercase text-[10px] tracking-wider">Colour Palette</h4>
        <div className="flex flex-wrap items-center gap-2">
          {colorPalette.map((c) => (
            <button
              key={c.name}
              title={c.name}
              onClick={() => updateParam("color", currentColor === c.name ? null : c.name)}
              className={`w-6 h-6 rounded-full border border-gray-300 shadow-2xs cursor-pointer transition transform hover:scale-110 flex items-center justify-center ${
                currentColor === c.name ? "ring-2 ring-emerald-600 ring-offset-1" : ""
              }`}
              style={{ backgroundColor: c.hex }}
            >
              {c.name === "White" && <span className="text-[9px] text-gray-400 font-bold">✓</span>}
            </button>
          ))}
        </div>
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
