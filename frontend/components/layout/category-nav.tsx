"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchCategories, fetchProducts } from "lib/api";

function CategorySVGIcon({ slug, icon }: { slug: string; icon?: string }) {
  if (icon && (icon.startsWith("data:") || icon.startsWith("http") || icon.startsWith("/"))) {
    return <img src={icon} alt="" className="w-full h-full object-cover rounded-full" />;
  }

  const s = (slug || "").toLowerCase();

  if (s.includes("mobile") || s.includes("phone")) {
    return (
      <svg className="w-6 h-6 text-blue-600 group-hover:scale-110 transition duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="3" ry="3" />
        <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3" />
      </svg>
    );
  }

  if (s.includes("electronic") || s.includes("tech") || s.includes("audio")) {
    return (
      <svg className="w-6 h-6 text-purple-600 group-hover:scale-110 transition duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5a9 9 0 0 1 18 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
      </svg>
    );
  }

  if (s.includes("watch")) {
    return (
      <svg className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="6" />
        <polyline points="12 9 12 12 14 14" />
        <path d="M9.5 6 10 2h4l.5 4" />
        <path d="M9.5 18 10 22h4l.5-4" />
      </svg>
    );
  }

  if (s.includes("laptop") || s.includes("computer")) {
    return (
      <svg className="w-6 h-6 text-slate-700 group-hover:scale-110 transition duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <line x1="2" y1="20" x2="22" y2="20" strokeWidth="2" />
      </svg>
    );
  }

  if (s.includes("footwear") || s.includes("shoe") || s.includes("sneaker")) {
    return (
      <svg className="w-6 h-6 text-amber-600 group-hover:scale-110 transition duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 16v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3l-3-5h-4l-2 3H4z" />
        <line x1="14" y1="9" x2="10" y2="5" />
      </svg>
    );
  }

  if (s.includes("fashion") || s.includes("apparel") || s.includes("clothing")) {
    return (
      <svg className="w-6 h-6 text-rose-600 group-hover:scale-110 transition duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.38 3.46 16 2l-4 4-4-4-4.38 1.46a2 2 0 0 0-1.28 1.66l-.34 3.42A2 2 0 0 0 4 10.5V20a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9.5a2 2 0 0 0 1.96-1.96l-.34-3.42a2 2 0 0 0-1.24-1.66z" />
      </svg>
    );
  }

  if (s.includes("home")) {
    return (
      <svg className="w-6 h-6 text-teal-600 group-hover:scale-110 transition duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    );
  }

  return (
    <svg className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

export function CategoryNav() {
  const [categories, setCategories] = useState<{ name: string; slug: string; icon?: string; bg: string }[]>([]);

  useEffect(() => {
    async function loadActiveCategories() {
      try {
        const activeMap = new Map<string, { name: string; slug: string; icon?: string; bg: string }>();

        // 1. First fetch real categories from PostgreSQL DB
        const dbCats = await fetchCategories().catch(() => []);
        if (Array.isArray(dbCats) && dbCats.length > 0) {
          dbCats.forEach((c: any) => {
            if (c.status !== "Inactive" && c.slug) {
              const s = String(c.slug).toLowerCase();
              let bg = "bg-emerald-50 border-emerald-200/80 shadow-2xs hover:border-emerald-400";
              if (s.includes("mobile") || s.includes("phone")) bg = "bg-blue-50/80 border-blue-200/80 shadow-2xs hover:border-blue-400";
              else if (s.includes("electronic") || s.includes("tech") || s.includes("audio")) bg = "bg-purple-50/80 border-purple-200/80 shadow-2xs hover:border-purple-400";
              else if (s.includes("watch")) bg = "bg-emerald-50/80 border-emerald-200/80 shadow-2xs hover:border-emerald-400";
              else if (s.includes("laptop") || s.includes("computer")) bg = "bg-slate-100/80 border-slate-300/80 shadow-2xs hover:border-slate-400";
              else if (s.includes("footwear") || s.includes("shoe") || s.includes("sneaker")) bg = "bg-amber-50/80 border-amber-200/80 shadow-2xs hover:border-amber-400";
              else if (s.includes("fashion") || s.includes("apparel") || s.includes("clothing")) bg = "bg-rose-50/80 border-rose-200/80 shadow-2xs hover:border-rose-400";
              else if (s.includes("home")) bg = "bg-teal-50/80 border-teal-200/80 shadow-2xs hover:border-teal-400";

              activeMap.set(c.slug, {
                name: c.name,
                slug: c.slug,
                icon: c.image_url || c.icon,
                bg
              });
            }
          });
        }

        // 2. Fetch products to capture any additional categories
        const prods = await fetchProducts().catch(() => []);
        if (Array.isArray(prods) && prods.length > 0) {
          prods.forEach((p: any) => {
            const catName = typeof p.category === "object" ? p.category?.name : (p.category_name || p.category_slug || p.category);
            const catSlug = typeof p.category === "object" ? p.category?.slug : (p.category_slug || (catName ? String(catName).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : null));

            if (catName && catSlug && !activeMap.has(catSlug)) {
              let bg = "bg-emerald-50 border-emerald-200/80 shadow-2xs";
              const s = String(catSlug).toLowerCase();

              if (s.includes("mobile") || s.includes("phone")) bg = "bg-blue-50/80 border-blue-200/80 shadow-2xs";
              else if (s.includes("electronic") || s.includes("tech") || s.includes("audio")) bg = "bg-purple-50/80 border-purple-200/80 shadow-2xs";
              else if (s.includes("watch")) bg = "bg-emerald-50/80 border-emerald-200/80 shadow-2xs";
              else if (s.includes("laptop") || s.includes("computer")) bg = "bg-slate-100/80 border-slate-300/80 shadow-2xs";
              else if (s.includes("footwear") || s.includes("shoe") || s.includes("sneaker")) bg = "bg-amber-50/80 border-amber-200/80 shadow-2xs";
              else if (s.includes("fashion") || s.includes("apparel") || s.includes("clothing")) bg = "bg-rose-50/80 border-rose-200/80 shadow-2xs";
              else if (s.includes("home")) bg = "bg-teal-50/80 border-teal-200/80 shadow-2xs";

              activeMap.set(catSlug, {
                name: String(catName).charAt(0).toUpperCase() + String(catName).slice(1),
                slug: catSlug,
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

  const displayCategories = categories.length > 0 ? categories : [
    { name: "Mobiles", slug: "mobiles", bg: "bg-blue-50/80 border-blue-200/80 shadow-2xs" },
    { name: "Electronics", slug: "electronics", bg: "bg-purple-50/80 border-purple-200/80 shadow-2xs" },
    { name: "Watches", slug: "watches", bg: "bg-emerald-50/80 border-emerald-200/80 shadow-2xs" },
    { name: "Fashion", slug: "fashion", bg: "bg-rose-50/80 border-rose-200/80 shadow-2xs" },
    { name: "Home & Living", slug: "home", bg: "bg-teal-50/80 border-teal-200/80 shadow-2xs" },
    { name: "Sports", slug: "sports", bg: "bg-emerald-50/80 border-emerald-200/80 shadow-2xs" },
    { name: "Artisan", slug: "artisan", bg: "bg-amber-50/80 border-amber-200/80 shadow-2xs" },
    { name: "Laptops", slug: "laptops", bg: "bg-slate-100/80 border-slate-300/80 shadow-2xs" },
    { name: "Footwear", slug: "footwear", bg: "bg-amber-50/80 border-amber-200/80 shadow-2xs" },
    { name: "Lifestyle", slug: "lifestyle", bg: "bg-teal-50/80 border-teal-200/80 shadow-2xs" }
  ];

  return (
    <nav className="bg-white border-b border-gray-200/80 py-4 px-4 overflow-x-auto no-scrollbar font-sans">
      <div className="max-w-[1440px] mx-auto flex items-center justify-start sm:justify-center gap-6 md:gap-10 min-w-max">
        {displayCategories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/search/${cat.slug}`}
            className="group flex flex-col items-center gap-2 cursor-pointer transition transform hover:-translate-y-1"
          >
            <div className={`w-14 h-14 rounded-full border ${cat.bg} flex items-center justify-center shadow-2xs group-hover:shadow-md transition duration-300 overflow-hidden`}>
              <CategorySVGIcon slug={cat.slug} icon={cat.icon} />
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

