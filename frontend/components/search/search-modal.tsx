"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SearchProduct {
  id: number;
  handle: string;
  title: string;
  price: number;
  category: string;
  image: string;
}

const CATALOG: SearchProduct[] = [
  {
    id: 1,
    handle: "active-anc-headphones",
    title: "boAt Rockerz Plus 550 ANC Headphones",
    price: 1799,
    category: "Tech Essentials",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"
  },
  {
    id: 2,
    handle: "minimalist-graphic-tee",
    title: "Minimalist Oversized Graphic Cotton Tee",
    price: 1299,
    category: "Apparel & Wear",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400"
  },
  {
    id: 3,
    handle: "matte-black-chrono-watch",
    title: "Matte Black Genuine Leather Chrono Watch",
    price: 3499,
    category: "Lifestyle Accessories",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"
  },
  {
    id: 4,
    handle: "oneplus-nord-6",
    title: "OnePlus Nord 6 5G (8GB + 256GB)",
    price: 44499,
    category: "Mobiles & Tech",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400"
  },
  {
    id: 5,
    handle: "apple-watch-series-9",
    title: "Apple Watch Series 9 GPS 45mm",
    price: 41900,
    category: "Smart Technology",
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400"
  }
];

export function InstantSearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  // Listen to Cmd+K or Ctrl+K hotkeys globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const results = query.trim() === ""
    ? []
    : CATALOG.filter((p) =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <>
      {/* 🔍 Search Trigger Button in Navbar (Sleek Circular Vector Icon Button) */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gray-100/90 hover:bg-emerald-50 text-gray-700 hover:text-emerald-600 border border-gray-200/80 hover:border-emerald-300 transition-all duration-200 cursor-pointer shadow-2xs hover:scale-105 group"
        title="Search store (Cmd + K)"
        aria-label="Search Store"
      >
        <svg
          className="w-5 h-5 text-gray-700 group-hover:text-emerald-600 transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>

      {/* 🪟 Glassmorphism Search Modal Container */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-md flex items-start justify-center pt-16 px-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 border border-gray-200">
            
            {/* Search Input Bar */}
            <div className="relative flex items-center border-b border-gray-100 pb-3">
              <svg className="w-5 h-5 text-emerald-600 absolute left-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                autoFocus
                placeholder="Type to search products, brands, categories..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 text-base font-semibold text-gray-900 focus:outline-none placeholder-gray-400"
              />
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 font-black text-sm flex items-center justify-center cursor-pointer absolute right-1 transition"
              >
                ✕
              </button>
            </div>

            {/* Trending Search Pills (When query empty) */}
            {query.trim() === "" ? (
              <div className="space-y-3 py-2">
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider">🔥 Trending Searches</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {["Headphones", "Graphic Tee", "OnePlus Nord", "Apple Watch", "Chrono Watch"].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag)}
                      className="bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 font-semibold px-3.5 py-1.5 rounded-xl border border-gray-200 transition cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Search Results List */
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
                  Found {results.length} results matching "{query}"
                </p>

                {results.length === 0 ? (
                  <div className="text-center py-8 text-xs text-gray-500 space-y-2">
                    <p className="text-2xl">🔍</p>
                    <p className="font-bold">No products found matching "{query}"</p>
                    <p className="text-gray-400">Try searching for "Headphones", "Watch", or "Tee"</p>
                  </div>
                ) : (
                  results.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.handle}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-gray-50 hover:bg-emerald-50/80 border border-gray-100 hover:border-emerald-300 transition group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-12 h-12 object-contain bg-white rounded-xl p-1 border border-gray-200 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-xs text-gray-900 group-hover:text-emerald-800 transition">
                            {product.title}
                          </p>
                          <span className="text-[10px] text-gray-500 font-medium">
                            Category: {product.category}
                          </span>
                        </div>
                      </div>

                      <span className="font-black text-xs text-gray-900 shrink-0">
                        ₹{product.price.toLocaleString("en-IN")}.00
                      </span>
                    </Link>
                  ))
                )}
              </div>
            )}

            {/* Footer Hint */}
            <div className="flex justify-between items-center text-[10px] text-gray-400 border-t border-gray-100 pt-3">
              <span>Press <kbd className="bg-gray-100 text-gray-600 px-1 rounded">ESC</kbd> to exit</span>
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                onClick={() => setIsOpen(false)}
                className="font-bold text-emerald-600 hover:underline"
              >
                View all store results →
              </Link>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
