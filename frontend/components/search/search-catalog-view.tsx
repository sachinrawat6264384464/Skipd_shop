"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BuyNowButton } from "components/auth/buy-now-button";

interface Product {
  id: number;
  title: string;
  handle: string;
  description: string;
  price: number;
  compare_at_price?: number;
  featured: boolean;
  images: string[];
  tags: string[];
  stock_quantity?: number;
  category?: { name: string; slug: string };
}

export function SearchCatalogView({
  products,
  collectionTitle
}: {
  products: Product[];
  collectionTitle?: string;
}) {
  const searchParams = useSearchParams();
  const maxPriceParam = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : 100000;
  const expressParam = searchParams.get("express") === "true";
  const discountParam = searchParams.get("discount") ? Number(searchParams.get("discount")) : 0;

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("bestselling");
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [liveProducts, setLiveProducts] = useState<Product[]>(products);

  const displayTitle = collectionTitle || "All Categories & Catalog";

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        let custom: any[] = [];
        const storedCustom = localStorage.getItem("skipd_custom_products");
        if (storedCustom) {
          const parsed = JSON.parse(storedCustom);
          if (Array.isArray(parsed)) custom = parsed;
        }

        let updatesMap: Record<string, any> = {};
        const storedUpdates = localStorage.getItem("skipd_updated_products");
        if (storedUpdates) {
          updatesMap = JSON.parse(storedUpdates);
        }

        let deletedSet = new Set<string>();
        const storedDeletions = localStorage.getItem("skipd_deleted_product_ids");
        if (storedDeletions) {
          const parsed = JSON.parse(storedDeletions);
          if (Array.isArray(parsed)) {
            parsed.forEach((id: any) => deletedSet.add(String(id)));
          }
        }

        let combined = [...custom, ...products];
        const seen = new Set();
        combined = combined
          .filter(p => {
            const pIdStr = String(p.id);
            if (deletedSet.has(pIdStr) || deletedSet.has(p.handle)) return false;
            const key = p.id || p.handle;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          })
          .map(p => {
            const pIdStr = String(p.id);
            if (updatesMap[pIdStr]) {
              return { ...p, ...updatesMap[pIdStr] };
            }
            return p;
          });

        setLiveProducts(combined);
      } catch (e) {}
    }
  }, [products]);

  const toggleWishlist = (id: number) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // 🔍 Filter & Sort logic driven by URL params
  const sortedProducts = useMemo(() => {
    return liveProducts
      .filter((product) => {
        // Price filter
        if (product.price > maxPriceParam) return false;
        // Express delivery filter
        if (expressParam && !product.featured && !product.tags?.includes("bestseller")) return false;
        // Discount filter
        if (discountParam > 0) {
          const off = product.compare_at_price
            ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
            : 0;
          if (off < discountParam) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        return a.id - b.id;
      });
  }, [liveProducts, maxPriceParam, expressParam, discountParam, sortBy]);

  // Dynamic Pagination Math
  const totalItems = sortedProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedProducts = sortedProducts.slice(startIndex, endIndex);

  // Generate dynamic page numbers array
  const pageNumbers: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 150, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-6 w-full">
      
      {/* 📍 Breadcrumb & Top Header Title Controls */}
      <div className="space-y-3">
        <div className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
          <Link href="/" className="hover:underline">Home</Link>
          <span>&rsaquo;</span>
          <Link href="/category/all" className="hover:underline">Categories</Link>
          <span>&rsaquo;</span>
          <span className="text-gray-900 font-bold">{displayTitle}</span>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-gray-200/80 p-4 md:p-6 rounded-3xl shadow-2xs">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 capitalize">{displayTitle}</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Showing {totalItems > 0 ? startIndex + 1 : 0}–{endIndex} of {totalItems} products in stock
            </p>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center text-xs">
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2 font-semibold">
              <span className="text-gray-500 text-[11px]">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent font-extrabold text-gray-900 focus:outline-none cursor-pointer"
              >
                <option value="bestselling">Best Selling</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl border border-gray-200">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-xl font-bold transition cursor-pointer ${
                  viewMode === "grid" ? "bg-white text-emerald-700 shadow-2xs" : "text-gray-400 hover:bg-gray-200"
                }`}
                title="Grid View"
              >
                ☷
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-xl font-bold transition cursor-pointer ${
                  viewMode === "list" ? "bg-white text-emerald-700 shadow-2xs" : "text-gray-400 hover:bg-gray-200"
                }`}
                title="List View"
              >
                ☰
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 👉 PRODUCT CARDS GRID vs LIST VIEW (DYNAMIC FILTERING WORKING LIVE) */}
      {paginatedProducts.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center text-gray-500 shadow-xs">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-lg font-bold text-gray-900">No products match your active filters</p>
          <p className="text-xs mt-1 text-gray-500">Try adjusting your price slider or clearing filters.</p>
          <Link
            href="/category/all"
            className="inline-block mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-xs cursor-pointer"
          >
            Clear Filters &amp; Show All Products &rarr;
          </Link>
        </div>
      ) : viewMode === "grid" ? (
        
        /* ☷ GRID VIEW (Optimal 3-4 Columns Layout) */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedProducts.map((product, idx) => {
            const discountPercent = product.compare_at_price
              ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
              : 36;
            const isLiked = wishlist.includes(product.id);
            const isOutOfStock = product.stock_quantity === 0;

            return (
              <div
                key={`${product.handle || product.id}-${idx}`}
                className="group bg-white border border-gray-200/80 rounded-2xl overflow-hidden p-3 shadow-2xs hover:shadow-xl transition-all duration-300 relative space-y-3 flex flex-col justify-between"
              >
                {/* Badges & Wishlist Heart */}
                <div className="flex justify-between items-center z-10 w-full">
                  <div className="flex gap-1">
                    {isOutOfStock ? (
                      <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider animate-pulse">
                        🚫 OUT OF STOCK
                      </span>
                    ) : (
                      <>
                        <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase">
                          -{discountPercent}% OFF
                        </span>
                        {idx % 2 === 1 && (
                          <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase">
                            Bestseller
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className={`w-7 h-7 rounded-full border transition flex items-center justify-center text-xs shadow-2xs cursor-pointer ${
                      isLiked ? "bg-red-50 border-red-200 text-red-500" : "bg-white/80 border-gray-200 text-gray-400 hover:text-red-500"
                    }`}
                    title="Add to Wishlist"
                  >
                    {isLiked ? "❤️" : "🖤"}
                  </button>
                </div>

                {/* Product Image */}
                <Link href={`/product/${product.handle}`} className="block relative aspect-square bg-gray-50 rounded-xl overflow-hidden p-2">
                  <img
                    src={product.images[0] || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800"}
                    alt={product.title}
                    className={`w-full h-full object-cover rounded-lg transition duration-500 ${
                      isOutOfStock ? "grayscale opacity-50" : "group-hover:scale-105"
                    }`}
                  />
                  {/* 🚫 OUT OF STOCK STAMP IN CENTER */}
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center p-2">
                      <div className="border-4 border-red-600 text-red-600 font-black text-xs px-2.5 py-1 rounded-xl transform -rotate-12 uppercase tracking-widest bg-white/95 shadow-xl text-center">
                        OUT OF STOCK
                      </div>
                    </div>
                  )}
                </Link>

                {/* Details */}
                <div className="space-y-2 flex-1 flex flex-col justify-between w-full">
                  <div>
                    <h3 className="font-bold text-xs text-gray-900 group-hover:text-emerald-700 transition line-clamp-2 leading-snug">
                      <Link href={`/product/${product.handle}`}>{product.title}</Link>
                    </h3>
                    <p className="text-[10px] text-amber-500 font-bold mt-1">
                      ★ 4.5 <span className="text-gray-400 font-medium">(2,356)</span>
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1.5 pt-1">
                    <span className="text-sm font-black text-gray-900">₹{product.price.toLocaleString("en-IN")}</span>
                    {product.compare_at_price && (
                      <span className="text-[10px] text-gray-400 line-through">₹{product.compare_at_price.toLocaleString("en-IN")}</span>
                    )}
                  </div>
                </div>

                {/* Dual Action Buttons */}
                <div className="pt-2 border-t border-gray-100 w-full">
                  {isOutOfStock ? (
                    <button
                      disabled
                      className="w-full bg-red-50 border border-red-300 text-red-600 text-[10px] font-black py-2 rounded-xl text-center cursor-not-allowed uppercase tracking-wider"
                    >
                      🚫 Out of Stock
                    </button>
                  ) : (
                    <div className="grid grid-cols-2 gap-1.5">
                      <BuyNowButton
                        mode="cart"
                        productObj={product}
                        className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-900 font-bold text-[10px] py-2 px-2 rounded-xl transition text-center flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                      >
                        🛒 Add to Cart
                      </BuyNowButton>
                      <BuyNowButton
                        productHandle={product.handle}
                        productObj={product}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] py-2 px-2 rounded-xl transition text-center flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                      >
                        ⚡ Buy Now
                      </BuyNowButton>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        
        /* ☰ LIST VIEW */
        <div className="space-y-4">
          {paginatedProducts.map((product, idx) => {
            const discountPercent = product.compare_at_price
              ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
              : 36;
            const isLiked = wishlist.includes(product.id);

            return (
              <div
                key={`${product.handle || product.id}-${idx}`}
                className="group bg-white border border-gray-200/80 rounded-3xl overflow-hidden p-4 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row items-center gap-6 relative"
              >
                <div className="relative w-full md:w-52 h-52 shrink-0 bg-gray-50 rounded-2xl overflow-hidden p-3 border border-gray-100">
                  <Link href={`/product/${product.handle}`} className="block w-full h-full relative">
                    <img
                      src={product.images[0] || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800"}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500 rounded-xl"
                    />
                  </Link>

                  <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                    <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase shadow-xs">
                      -{discountPercent}% OFF
                    </span>
                  </div>

                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className={`absolute top-3 right-3 w-8 h-8 rounded-full border transition flex items-center justify-center text-xs shadow-xs cursor-pointer z-10 ${
                      isLiked ? "bg-red-50 border-red-200 text-red-500" : "bg-white/90 border-gray-200 text-gray-400 hover:text-red-500"
                    }`}
                    title="Add to Wishlist"
                  >
                    {isLiked ? "❤️" : "🖤"}
                  </button>
                </div>

                <div className="flex-1 space-y-3 w-full flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="font-extrabold text-base text-gray-900 group-hover:text-emerald-700 transition leading-snug">
                      <Link href={`/product/${product.handle}`}>{product.title}</Link>
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {product.description || "High quality premium brand product with instant shipping and 1-year official warranty."}
                    </p>
                    <p className="text-xs text-amber-500 font-bold">
                      ★ 4.5 <span className="text-gray-400 font-medium">(2,356 Reviews)</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-gray-900">₹{product.price.toLocaleString("en-IN")}</span>
                      {product.compare_at_price && (
                        <span className="text-xs text-gray-400 line-through">₹{product.compare_at_price.toLocaleString("en-IN")}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <BuyNowButton
                        mode="cart"
                        productObj={product}
                        className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-900 font-bold text-xs py-2.5 px-4 rounded-xl transition text-center flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        🛒 Add to Cart
                      </BuyNowButton>
                      <BuyNowButton
                        productHandle={product.handle}
                        productObj={product}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2.5 px-5 rounded-xl transition text-center flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        ⚡ Buy Now
                      </BuyNowButton>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 🔢 DYNAMIC PAGINATION BAR */}
      <div className="mt-8 bg-white border border-gray-200/80 p-4 rounded-3xl shadow-2xs flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-semibold text-gray-700">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handlePageChange(validCurrentPage - 1)}
            disabled={validCurrentPage === 1}
            className="w-8 h-8 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Previous Page"
          >
            &lt;
          </button>

          {pageNumbers.map((num) => {
            const isCurrent = num === validCurrentPage;
            return (
              <button
                key={num}
                onClick={() => handlePageChange(num)}
                className={`web-page-btn w-8 h-8 rounded-xl font-bold flex items-center justify-center transition cursor-pointer ${
                  isCurrent
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {num}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(validCurrentPage + 1)}
            disabled={validCurrentPage === totalPages}
            className="w-8 h-8 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Next Page"
          >
            &gt;
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-500 font-medium">Show</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-gray-50 border border-gray-300 rounded-xl px-3 py-1.5 font-bold text-gray-900 focus:outline-none cursor-pointer"
          >
            <option value="4">4</option>
            <option value="8">8</option>
            <option value="12">12</option>
            <option value="24">24</option>
            <option value="48">48</option>
          </select>
          <span className="text-gray-500 font-medium">per page</span>
        </div>
      </div>

    </div>
  );
}
