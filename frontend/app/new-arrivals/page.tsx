"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchProducts, fetchCategories, Product, Category } from "lib/api";
import { AddToCartButton } from "components/cart/add-to-cart-button";

export default function NewArrivalsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [prodsData, catsData] = await Promise.all([
          fetchProducts(),
          fetchCategories()
        ]);
        
        // Sort by Newest (highest ID / latest first)
        const sorted = [...prodsData].sort((a, b) => b.id - a.id);
        setProducts(sorted);
        setCategories(catsData);
      } catch (err) {
        console.error("Error loading new arrivals:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter products by selected category
  const filteredProducts = products.filter((p) => {
    if (selectedCategory === "all") return true;
    const catSlug = p.category?.slug || (p as any).category_slug;
    return catSlug === selectedCategory || p.tags?.includes(selectedCategory);
  });

  // Apply sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    return b.id - a.id; // newest default
  });

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16 font-sans">
      
      {/* 🌟 NEW ARRIVALS HERO HEADER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0B132B] via-emerald-950 to-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-emerald-500/20 shadow-lg">
        {/* Ambient Glow Effects */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1440px] mx-auto relative z-10 space-y-4 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-md">
            <span>✨ 2026 Collection Drop</span>
            <span>•</span>
            <span>Real-time Live Store</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
                New Arrivals &amp; Fresh Drops
              </h1>
              <p className="text-gray-300 text-xs sm:text-sm font-medium leading-relaxed">
                Discover the latest premium additions to our store catalog. Directly fetched from our live PostgreSQL backend database with 0 cached fallback data.
              </p>
            </div>

            {/* Live Stats */}
            <div className="flex items-center gap-4 sm:gap-6 bg-white/10 backdrop-blur-xl border border-white/15 px-6 py-4 rounded-3xl shrink-0">
              <div className="text-center sm:text-left">
                <p className="text-2xl sm:text-3xl font-black text-emerald-400">{products.length}</p>
                <p className="text-[11px] font-bold text-gray-300">Fresh Drops</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center sm:text-left">
                <p className="text-2xl sm:text-3xl font-black text-amber-400">100%</p>
                <p className="text-[11px] font-bold text-gray-300">Genuine Stock</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 📍 MAIN CONTENT CONTAINER */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* 🎛️ CONTROLS & FILTERING BAR */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-gray-200/80 shadow-2xs">
          
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              🔥 All New Drops ({products.length})
            </button>

            {categories.map((cat) => {
              const count = products.filter(p => (p.category?.slug || (p as any).category_slug) === cat.slug).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-4 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                    selectedCategory === cat.slug
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span>{cat.name}</span>
                  {count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                      selectedCategory === cat.slug ? "bg-white/20 text-white" : "bg-gray-200 text-gray-800"
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-3 shrink-0 self-end md:self-auto text-xs font-bold text-gray-700">
            <label className="text-gray-500">Sort By:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-xs font-extrabold text-gray-900 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="newest">✨ Newest First (Latest Added)</option>
              <option value="price-low">💰 Price: Low to High</option>
              <option value="price-high">💎 Price: High to Low</option>
            </select>
          </div>

        </div>

        {/* 🛍️ PRODUCT GRID / LOADING STATE */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-4 border border-gray-200 shadow-2xs space-y-3 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-2xl w-full" />
                <div className="h-4 bg-gray-200 rounded-md w-3/4" />
                <div className="h-4 bg-gray-200 rounded-md w-1/2" />
                <div className="h-10 bg-gray-200 rounded-xl w-full pt-2" />
              </div>
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/80 shadow-2xs space-y-4 max-w-md mx-auto my-8">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center font-black text-3xl mx-auto">
              📦
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900">No New Products Found</h3>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                No new products matching category "{selectedCategory}" in the live database right now.
              </p>
            </div>
            <button
              onClick={() => setSelectedCategory("all")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl transition cursor-pointer"
            >
              View All New Drops
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
            {sortedProducts.map((product) => {
              const image = (product.images && product.images[0]) || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800";
              const discountPercent = product.compare_at_price
                ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
                : 0;

              return (
                <div
                  key={product.id}
                  className="group bg-white rounded-3xl border border-gray-200/90 p-4 shadow-2xs hover:shadow-xl hover:border-emerald-300 transition duration-300 flex flex-col justify-between relative overflow-hidden"
                >
                  {/* Glowing JUST IN Badge */}
                  <div className="absolute top-6 left-6 z-10 flex items-center gap-1 bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md uppercase tracking-wider">
                    <span>✨ JUST IN</span>
                  </div>

                  {/* Discount Badge if available */}
                  {discountPercent > 0 && (
                    <div className="absolute top-6 right-6 z-10 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                      {discountPercent}% OFF
                    </div>
                  )}

                  {/* Product Image Link */}
                  <Link
                    href={`/product/${product.handle || product.id}`}
                    className="relative block w-full h-56 rounded-2xl bg-gray-50 overflow-hidden mb-4 border border-gray-100 group-hover:border-emerald-100 transition"
                  >
                    <img
                      src={image}
                      alt={product.title}
                      className="w-full h-full object-contain p-4 group-hover:scale-105 transition duration-300"
                    />
                  </Link>

                  {/* Product Info */}
                  <div className="space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider mb-1">
                        {product.category?.name || "New Arrival"}
                      </div>
                      <Link
                        href={`/product/${product.handle || product.id}`}
                        className="font-extrabold text-sm text-gray-900 group-hover:text-emerald-700 transition line-clamp-2 leading-snug"
                      >
                        {product.title}
                      </Link>
                    </div>

                    <div className="pt-2 space-y-3">
                      {/* Price Section */}
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-gray-900">
                          ₹{product.price.toLocaleString("en-IN")}
                        </span>
                        {product.compare_at_price && product.compare_at_price > product.price && (
                          <span className="text-xs font-bold text-gray-400 line-through">
                            ₹{product.compare_at_price.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>

                      {/* Add to Cart Button */}
                      <div className="w-full">
                        <AddToCartButton product={product} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
