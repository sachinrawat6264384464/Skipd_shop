"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { fetchCategories, fetchProducts, Category } from "lib/api";

export function NavLinks() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [dbCategories, setDbCategories] = useState<Category[]>([]);
  const dropdownRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("ecom_token") : null;
      const user = typeof window !== "undefined" ? localStorage.getItem("ecom_user") : null;
      setIsLoggedIn(!!(token || user));
    };

    checkAuth();

    async function loadActiveCats() {
      try {
        const prods = await fetchProducts().catch(() => []);
        const cats = await fetchCategories().catch(() => []);
        if (Array.isArray(cats) && cats.length > 0) {
          const activeSlugs = new Set(
            prods.map((p: any) =>
              (typeof p.category === "object" ? p.category?.slug : p.category_slug || p.category || "").toLowerCase()
            )
          );
          const filtered = cats.filter((c: any) => {
            if (c.status === "Inactive" || c.status === "Disabled") return false;
            if (activeSlugs.size > 0) {
              return activeSlugs.has((c.slug || "").toLowerCase());
            }
            return true;
          });
          setDbCategories(filtered);
        } else if (Array.isArray(prods) && prods.length > 0) {
          const activeMap = new Map<string, Category>();
          prods.forEach((p: any) => {
            const catObj = typeof p.category === "object" ? p.category : null;
            const catName = catObj?.name || p.category_name || p.category || "General";
            const catSlug = catObj?.slug || p.category_slug || String(catName).toLowerCase().replace(/[^a-z0-9]+/g, "-");
            if (!activeMap.has(catSlug)) {
              activeMap.set(catSlug, { id: p.category_id || p.id, name: catName, slug: catSlug });
            }
          });
          setDbCategories(Array.from(activeMap.values()));
        }
      } catch (e) {}
    }

    loadActiveCats();

    window.addEventListener("storage", checkAuth);
    window.addEventListener("ecom_auth_changed", checkAuth);

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCatOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("ecom_auth_changed", checkAuth);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getCategoryIcon = (slug: string) => {
    const s = slug.toLowerCase();
    if (s.includes("sports") || s.includes("fitness")) return "🏋️";
    if (s.includes("beauty") || s.includes("care") || s.includes("skin")) return "💄";
    if (s.includes("mobile") || s.includes("phone")) return "📱";
    if (s.includes("laptop") || s.includes("computer")) return "💻";
    if (s.includes("tech") || s.includes("electronic")) return "🎧";
    if (s.includes("fashion") || s.includes("apparel")) return "👕";
    if (s.includes("watch")) return "⌚";
    return "📁";
  };

  return (
    <ul className="hidden lg:flex items-center gap-3 xl:gap-5 text-base font-black text-gray-900 whitespace-nowrap">
      
      {/* 📁 Categories Dropdown */}
      <li
        ref={dropdownRef}
        className="relative group cursor-pointer"
        onMouseEnter={() => setIsCatOpen(true)}
        onMouseLeave={() => setIsCatOpen(false)}
      >
        <button
          type="button"
          onClick={() => setIsCatOpen((prev) => !prev)}
          className="px-4 py-2.5 rounded-xl hover:bg-blue-50/80 transition flex items-center gap-2 font-black text-base text-gray-900 hover:text-blue-600 cursor-pointer border-none bg-transparent"
        >
          <span>Categories</span>
          <span className={`text-xs text-blue-600 transition-transform duration-200 ${isCatOpen ? "rotate-180" : ""}`}>
            ▼
          </span>
        </button>

        {/* Hover & Click Categories Dropdown Card */}
        <div
          className={`absolute top-full left-0 pt-2 w-72 z-50 transition-all duration-200 ${
            isCatOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
          }`}
        >
          <div className="bg-white/95 backdrop-blur-2xl border border-gray-200/90 rounded-2xl shadow-2xl p-3.5 text-sm space-y-1.5">
            <div className="text-xs font-black uppercase text-gray-400 px-3 py-1 tracking-wider border-b border-gray-100">
              Shop By Category
            </div>
            <Link
              href="/search"
              prefetch={false}
              onClick={() => setIsCatOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-blue-50/80 text-blue-900 font-black hover:bg-blue-100/80 transition text-sm"
            >
              <span className="text-base">🛍️</span> All Categories &amp; Catalog
            </Link>

            {dbCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/search/${cat.slug}`}
                prefetch={false}
                onClick={() => setIsCatOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-gray-100 text-gray-800 font-extrabold transition text-sm"
              >
                {cat.name}
              </Link>
            ))}

            {/* 🎁 Gift Cards Dropdown Link - ONLY SHOW WHEN LOGGED IN */}
            {isLoggedIn && (
              <Link
                href="/gift-cards"
                prefetch={false}
                onClick={() => setIsCatOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-amber-50 text-amber-900 font-black transition border-t border-gray-100 mt-1.5 pt-2.5 text-sm"
              >
                <span className="text-base">🎁</span> Gift Cards &amp; Rewards
              </Link>
            )}
          </div>
        </div>
      </li>

      {/* 🔥 Deals Link */}
      <li>
        <Link
          href="/deals"
          prefetch={false}
          className="px-4 py-2.5 rounded-xl text-blue-600 font-black hover:bg-blue-50 transition flex items-center gap-2 text-base"
        >
          <span>Deals</span>
          <span className="bg-red-600 text-white font-black text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs animate-pulse">
            HOT
          </span>
        </Link>
      </li>

      {/* 🎁 GIFT CARDS LINK - ONLY SHOWN WHEN CUSTOMER IS LOGGED IN */}
      {isLoggedIn && (
        <li>
          <Link
            href="/gift-cards"
            prefetch={false}
            className="px-4 py-2.5 rounded-xl text-amber-800 font-black hover:bg-amber-50 transition flex items-center gap-2 text-base"
          >
            <span className="text-lg">🎁</span>
            <span>Gift Cards</span>
          </Link>
        </li>
      )}

      {/* ✨ New Arrivals Link */}
      <li>
        <Link
          href="/new-arrivals"
          prefetch={false}
          className="px-4 py-2.5 rounded-xl text-gray-900 font-black hover:bg-blue-50 hover:text-blue-600 transition flex items-center gap-2 text-base"
        >
          <span>New Arrivals</span>
          <span className="bg-blue-600 text-white font-black text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
            NEW
          </span>
        </Link>
      </li>

    </ul>
  );
}
