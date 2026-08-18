"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchProducts } from "lib/api";

export function CategoryNav() {
  const [categories, setCategories] = useState<{ name: string; slug: string; icon: string; bg: string }[]>([]);

  useEffect(() => {
    async function loadActiveCategories() {
      try {
        const prods = await fetchProducts().catch(() => []);
        const activeMap = new Map<string, { name: string; slug: string; icon: string; bg: string }>();

        if (Array.isArray(prods) && prods.length > 0) {
          prods.forEach((p: any) => {
            const catName = typeof p.category === "object" ? p.category?.name : (p.category_name || p.category_slug || p.category);
            const catSlug = typeof p.category === "object" ? p.category?.slug : (p.category_slug || (catName ? String(catName).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : null));

            if (catName && catSlug && !activeMap.has(catSlug)) {
              let icon = "📁";
              let bg = "bg-emerald-50 border-emerald-200 text-emerald-700";
              const s = String(catSlug).toLowerCase();

              if (s.includes("mobile") || s.includes("phone")) { icon = "📱"; bg = "bg-blue-50 border-blue-200 text-blue-700"; }
              else if (s.includes("electronic") || s.includes("tech") || s.includes("audio")) { icon = "🎧"; bg = "bg-purple-50 border-purple-200 text-purple-700"; }
              else if (s.includes("watch")) { icon = "⌚"; bg = "bg-emerald-50 border-emerald-200 text-emerald-700"; }
              else if (s.includes("laptop") || s.includes("computer")) { icon = "💻"; bg = "bg-gray-100 border-gray-300 text-gray-800"; }
              else if (s.includes("footwear") || s.includes("shoe") || s.includes("sneaker")) { icon = "👟"; bg = "bg-amber-50 border-amber-200 text-amber-700"; }
              else if (s.includes("fashion") || s.includes("apparel") || s.includes("clothing")) { icon = "👕"; bg = "bg-rose-50 border-rose-200 text-rose-700"; }
              else if (s.includes("home")) { icon = "🏠"; bg = "bg-teal-50 border-teal-200 text-teal-700"; }
              else if (s.includes("beauty")) { icon = "💄"; bg = "bg-pink-50 border-pink-200 text-pink-700"; }
              else if (s.includes("game") || s.includes("gaming")) { icon = "🎮"; bg = "bg-indigo-50 border-indigo-200 text-indigo-700"; }

              activeMap.set(catSlug, {
                name: String(catName).charAt(0).toUpperCase() + String(catName).slice(1),
                slug: catSlug,
                icon,
                bg
              });
            }
          });
        }

        setCategories(Array.from(activeMap.values()));
      } catch (e) {}
    }

    loadActiveCategories();
  }, []);

  if (categories.length === 0) return null;

  return (
    <nav className="bg-white border-b border-gray-200 py-4 px-4 overflow-x-auto no-scrollbar">
      <div className="max-w-7xl mx-auto flex items-center justify-start sm:justify-between gap-4 md:gap-8 min-w-max">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className="group flex flex-col items-center gap-2 cursor-pointer transition transform hover:-translate-y-0.5"
          >
            <div className={`w-14 h-14 rounded-full border ${cat.bg} flex items-center justify-center text-xl shadow-xs group-hover:scale-105 transition overflow-hidden`}>
              {cat.icon && (cat.icon.startsWith("data:") || cat.icon.startsWith("http") || cat.icon.startsWith("/")) ? (
                <img src={cat.icon} alt={cat.name} className="w-full h-full object-cover" />
              ) : (
                cat.icon
              )}
            </div>
            <span className="text-xs font-bold text-gray-700 group-hover:text-emerald-700 transition">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
