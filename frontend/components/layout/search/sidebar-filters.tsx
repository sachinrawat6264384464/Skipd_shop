"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function CatalogSidebarFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedColor, setSelectedColor] = useState<string | null>(searchParams.get("color"));
  const [expressDelivery, setExpressDelivery] = useState(false);
  const [minPrice, setMinPrice] = useState("0");
  const [maxPrice, setMaxPrice] = useState("20000+");

  const categories = [
    { name: "All Categories", icon: "☷", slug: "all" },
    { name: "Fashion & Apparel", icon: "👕", slug: "apparel" },
    { name: "Electronics", icon: "📱", slug: "tech" },
    { name: "Lifestyle", icon: "⌚", slug: "lifestyle" },
    { name: "Home & Living", icon: "🏠", slug: "home" },
    { name: "Gift Cards", icon: "🎁", slug: "gift-cards" },
  ];

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

  const discounts = [
    "10% and above",
    "20% and above",
    "30% and above",
    "40% and above",
    "50% and above",
  ];

  const handleClearFilters = () => {
    setSelectedCategory("All Categories");
    setSelectedColor(null);
    setExpressDelivery(false);
    setMinPrice("0");
    setMaxPrice("20000+");
    router.push("/search");
  };

  return (
    <aside className="h-full flex flex-col justify-between bg-white border border-gray-200/80 rounded-3xl p-5 shadow-xs space-y-6 text-xs text-gray-800">
      
      {/* 📁 CATEGORIES Section (Matching Screenshot) */}
      <div className="space-y-3">
        <h4 className="font-black text-gray-900 uppercase text-[10px] tracking-wider">Categories</h4>
        <ul className="space-y-1">
          {categories.map((cat) => (
            <li key={cat.name}>
              <Link
                href={cat.slug === "all" ? "/search" : `/search/${cat.slug}`}
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition cursor-pointer font-medium ${
                  selectedCategory === cat.name || (cat.slug !== "all" && pathname.includes(cat.slug))
                    ? "bg-emerald-50 text-emerald-800 font-bold border border-emerald-200"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* ⚡ DELIVERY SPEED (Matching Screenshot) */}
      <div className="pt-4 border-t border-gray-100 space-y-2">
        <h4 className="font-black text-gray-900 uppercase text-[10px] tracking-wider">Delivery Speed</h4>
        <label className="flex items-center gap-2 cursor-pointer font-semibold text-gray-700">
          <input
            type="checkbox"
            checked={expressDelivery}
            onChange={(e) => setExpressDelivery(e.target.checked)}
            className="w-4 h-4 accent-emerald-600 rounded"
          />
          <span>⚡ Get It Today / Tomorrow</span>
        </label>
      </div>

      {/* ⭐ CUSTOMER REVIEWS (Matching Screenshot) */}
      <div className="pt-4 border-t border-gray-100 space-y-2">
        <h4 className="font-black text-gray-900 uppercase text-[10px] tracking-wider">Customer Reviews</h4>
        <button className="flex items-center gap-1.5 text-amber-500 font-bold hover:underline cursor-pointer">
          <span>★★★★☆</span>
          <span className="text-gray-700 font-bold text-xs">&amp; Up</span>
        </button>
      </div>

      {/* 💰 PRICE RANGE (Matching Screenshot) */}
      <div className="pt-4 border-t border-gray-100 space-y-2.5">
        <h4 className="font-black text-gray-900 uppercase text-[10px] tracking-wider">Price Range</h4>
        <p className="text-[11px] text-gray-500 font-medium">The highest price is ₹1,00,000</p>
        
        {/* Slider Line */}
        <div className="relative pt-1 pb-2">
          <input
            type="range"
            min="0"
            max="100000"
            className="w-full accent-emerald-600 cursor-pointer"
          />
        </div>

        {/* Min / Max Inputs */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-center">
            <span className="text-[10px] text-gray-400 block font-semibold">Min</span>
            <span className="font-extrabold text-gray-900">₹ {minPrice}</span>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-center">
            <span className="text-[10px] text-gray-400 block font-semibold">Max</span>
            <span className="font-extrabold text-gray-900">₹ {maxPrice}</span>
          </div>
        </div>
      </div>

      {/* 🎨 COLOUR PALETTE (Matching Screenshot) */}
      <div className="pt-4 border-t border-gray-100 space-y-2.5">
        <h4 className="font-black text-gray-900 uppercase text-[10px] tracking-wider">Colour Palette</h4>
        <div className="flex flex-wrap items-center gap-2">
          {colorPalette.map((c) => (
            <button
              key={c.name}
              title={c.name}
              onClick={() => setSelectedColor(selectedColor === c.name ? null : c.name)}
              className={`w-6 h-6 rounded-full border border-gray-300 shadow-2xs cursor-pointer transition transform hover:scale-110 flex items-center justify-center ${
                selectedColor === c.name ? "ring-2 ring-emerald-600 ring-offset-1" : ""
              }`}
              style={{ backgroundColor: c.hex }}
            >
              {c.name === "White" && <span className="text-[9px] text-gray-400 font-bold">✓</span>}
            </button>
          ))}
          <button className="text-[10px] font-bold text-emerald-700 hover:underline pl-1 cursor-pointer">
            + More
          </button>
        </div>
      </div>

      {/* 🏷️ DISCOUNT (Matching Screenshot) */}
      <div className="pt-4 border-t border-gray-100 space-y-2">
        <h4 className="font-black text-gray-900 uppercase text-[10px] tracking-wider">Discount</h4>
        <div className="space-y-1.5 font-medium text-gray-700">
          {discounts.map((d) => (
            <label key={d} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-3.5 h-3.5 accent-emerald-600 rounded" />
              <span>{d}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 🔄 CLEAR ALL FILTERS BUTTON (Matching Screenshot) */}
      <div className="pt-4 border-t border-gray-100">
        <button
          onClick={handleClearFilters}
          className="w-full bg-gray-50 border border-gray-300 hover:bg-gray-100 text-gray-800 font-bold text-xs py-2.5 rounded-2xl transition shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
        >
          <span>🔄</span> Clear All Filters
        </button>
      </div>

    </aside>
  );
}
