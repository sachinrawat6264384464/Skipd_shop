"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const categoryBubbles = [
  { name: "Mobiles", slug: "mobiles", icon: "📱", bg: "bg-blue-50 border-blue-200 text-blue-700" },
  { name: "Laptops", slug: "laptops", icon: "💻", bg: "bg-gray-100 border-gray-300 text-gray-800" },
  { name: "Electronics", slug: "electronics", icon: "🎧", bg: "bg-purple-50 border-purple-200 text-purple-700" },
  { name: "Fashion", slug: "fashion", icon: "👕", bg: "bg-rose-50 border-rose-200 text-rose-700" },
  { name: "Footwear", slug: "footwear", icon: "👟", bg: "bg-amber-50 border-amber-200 text-amber-700" },
  { name: "Watches", slug: "watches", icon: "⌚", bg: "bg-emerald-50 border-emerald-200 text-emerald-700" },
  { name: "Beauty", slug: "beauty", icon: "💄", bg: "bg-pink-50 border-pink-200 text-pink-700" },
  { name: "Home & Living", slug: "home", icon: "🏠", bg: "bg-teal-50 border-teal-200 text-teal-700" },
  { name: "Gaming", slug: "gaming", icon: "🎮", bg: "bg-indigo-50 border-indigo-200 text-indigo-700" },
  { name: "More", slug: "more", icon: "•••", bg: "bg-gray-100 border-gray-200 text-gray-600" },
];

export function CategoryNav() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="bg-white border-b border-gray-200 py-4 px-4 overflow-x-auto no-scrollbar">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 md:gap-8 min-w-max">
        {categoryBubbles.map((cat) => (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className="group flex flex-col items-center gap-2 cursor-pointer transition transform hover:-translate-y-0.5"
          >
            <div className={`w-14 h-14 rounded-full border ${cat.bg} flex items-center justify-center text-xl shadow-xs group-hover:scale-105 transition`}>
              {cat.icon}
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
