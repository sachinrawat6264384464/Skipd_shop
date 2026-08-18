"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BuyNowButton } from "components/auth/buy-now-button";
import { useWishlist } from "components/wishlist/wishlist-context";
import { toast } from "sonner";

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

const CATEGORY_BANNERS: Record<string, { title: string; subtitle: string; tag: string; slides: string[] }> = {
  mobiles: {
    title: "Flagship Mobiles & Smartphones",
    subtitle: "Up to 40% OFF on 5G Smartphones, AMOLED Displays & AI Cameras",
    tag: "⚡ TECH SPOTLIGHT",
    slides: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1400",
      "https://images.unsplash.com/photo-1523206489230-c012c64b2047?w=1400",
      "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=1400"
    ]
  },
  laptops: {
    title: "Laptops & High Performance Workstations",
    subtitle: "Apple M-Series, Intel i9 & Gaming Laptops with Instant Bank Cashbacks",
    tag: "💻 COMPUTING POWER",
    slides: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1400",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1400"
    ]
  },
  electronics: {
    title: "Next-Gen Electronics & Audio Gear",
    subtitle: "Studio Noise Cancelling Headphones, 4K Drones & Smart Wearables",
    tag: "🎧 AUDIO & GADGETS",
    slides: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1400",
      "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=1400"
    ]
  },
  fashion: {
    title: "Trending Fashion & Designer Apparel",
    subtitle: "Heavy Winter Trench Jackets, Cotton Graphic Tees & Festive Wear",
    tag: "👕 STYLE COLLECTION",
    slides: [
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1400",
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1400"
    ]
  },
  footwear: {
    title: "Footwear & Premium Sneakers",
    subtitle: "Original Leather Basketball Shoes, Sport Sneakers & Casual Footwear",
    tag: "👟 SNEAKER HEADQUARTERS",
    slides: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1400",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1400"
    ]
  },
  watches: {
    title: "Smartwatches & Analog Chronographs",
    subtitle: "Always-On AMOLED Displays, Fitness Trackers & Leather Watches",
    tag: "⌚ TIMEPIECE SPOTLIGHT",
    slides: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1400",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=1400"
    ]
  },
  home: {
    title: "Home & Interior Living Decor",
    subtitle: "Modern Luxury Home Furnishings, Kitchenware & Ambient Lighting",
    tag: "🏡 HOME SANCTUARY",
    slides: [
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1400",
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1400"
    ]
  }
};

export function SearchCatalogView({
  products,
  collectionTitle,
  categorySlug
}: {
  products: Product[];
  collectionTitle?: string;
  categorySlug?: string;
}) {
  const searchParams = useSearchParams();
  const maxPriceParam = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : 100000;
  const expressParam = searchParams.get("express") === "true";
  const discountParam = searchParams.get("discount") ? Number(searchParams.get("discount")) : 0;

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("bestselling");
  const { isInWishlist, toggleWishlist: ctxToggleWishlist } = useWishlist();
  const [liveProducts, setLiveProducts] = useState<Product[]>(products);
  const [activeSlide, setActiveSlide] = useState(0);

  const displayTitle = collectionTitle || "All Categories & Catalog";

  const bannerData = categorySlug ? CATEGORY_BANNERS[categorySlug.toLowerCase()] : null;
  const currentBanner = bannerData || {
    title: displayTitle.replace(/^[^\w\s]+/, "").trim(),
    subtitle: "Explore authentic products with 1-Year official brand warranty and instant free delivery",
    tag: "🛍️ STORE COLLECTION",
    slides: [
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400",
      "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1400"
    ]
  };

  useEffect(() => {
    if (currentBanner.slides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % currentBanner.slides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [currentBanner]);

  useEffect(() => {
    setLiveProducts(products || []);
  }, [products]);

  const toggleWishlist = (product: Product) => {
    const item = {
      id: product.id,
      handle: product.handle,
      title: product.title,
      price: product.price,
      compare_at_price: product.compare_at_price,
      image: product.images?.[0] || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800",
      category: typeof product.category === "object" ? product.category?.name : (product.category || "Store"),
      rating: 4.5
    };
    const wasLiked = isInWishlist(product.id);
    ctxToggleWishlist(item);
    if (wasLiked) {
      toast("💔 Removed from Wishlist", { description: product.title });
    } else {
      toast.success("❤️ Added to Wishlist!", { description: product.title });
    }
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

  const getValidCardHandle = (p: Product) => {
    if (!p) return "oneplus-nord-6";
    if (p.handle && typeof p.handle === "string" && p.handle !== "undefined" && p.handle.trim() !== "") {
      return p.handle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    }
    if ((p as any).slug && typeof (p as any).slug === "string" && (p as any).slug !== "undefined") {
      return (p as any).slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    }
    if (p.title && typeof p.title === "string") {
      return p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    }
    return String(p.id || "1");
  };

  return (
    <div className="space-y-6 w-full">
      
      {/* 🚀 CATEGORY HERO SLIDER BANNER */}
      <div className="relative w-full h-56 sm:h-72 md:h-80 rounded-3xl overflow-hidden shadow-xl border border-gray-200/80 group">
        {/* Slide Background Images with smooth fade transition */}
        {currentBanner.slides.map((imgUrl, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              i === activeSlide ? "opacity-100 scale-105" : "opacity-0 scale-100"
            }`}
            style={{ transitionProperty: "opacity, transform" }}
          >
            <img src={imgUrl} alt={currentBanner.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-900/60 to-transparent" />
          </div>
        ))}

        {/* Banner Content Overlay */}
        <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-12 max-w-2xl space-y-3 text-white">
          <span className="bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full border border-emerald-300/40 inline-block self-start shadow-md">
            {currentBanner.tag}
          </span>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight drop-shadow-md">
            {currentBanner.title}
          </h1>
          <p className="text-xs sm:text-sm text-gray-200 font-medium line-clamp-2 drop-shadow-xs max-w-lg">
            {currentBanner.subtitle}
          </p>
        </div>

        {/* Prev / Next Carousel Controls */}
        {currentBanner.slides.length > 1 && (
          <>
            <button
              onClick={() => setActiveSlide((prev) => (prev - 1 + currentBanner.slides.length) % currentBanner.slides.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center font-bold text-lg backdrop-blur-md border border-white/20 transition cursor-pointer z-20 opacity-0 group-hover:opacity-100"
            >
              ‹
            </button>
            <button
              onClick={() => setActiveSlide((prev) => (prev + 1) % currentBanner.slides.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center font-bold text-lg backdrop-blur-md border border-white/20 transition cursor-pointer z-20 opacity-0 group-hover:opacity-100"
            >
              ›
            </button>

            {/* Carousel Dot Indicators */}
            <div className="absolute bottom-4 right-6 z-20 flex gap-2">
              {currentBanner.slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSlide(i)}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    i === activeSlide ? "w-7 bg-emerald-500 shadow-md" : "w-2.5 bg-white/50 hover:bg-white"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

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
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 capitalize">{displayTitle}</h2>
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
          <div className="text-5xl mb-4">📦</div>
          <p className="text-lg font-bold text-gray-900">No products added to {displayTitle} yet</p>
          <p className="text-xs mt-1 text-gray-500">You can add products and assign them to this category from the Admin Panel.</p>
          <div className="flex justify-center gap-3 mt-4">
            <Link
              href="/admin/products"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-xs cursor-pointer"
            >
              + Add Products in Admin Panel &rarr;
            </Link>
            <Link
              href="/category/all"
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
            >
              Browse All Store Products &rarr;
            </Link>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        
        /* ☷ GRID VIEW (Optimal 3-4 Columns Layout) */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedProducts.map((product, idx) => {
            const discountPercent = product.compare_at_price
              ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
              : 36;
            const isLiked = isInWishlist(product.id);
            const isOutOfStock = product.stock_quantity === 0;
            const itemHandle = getValidCardHandle(product);

            return (
              <div
                key={`${itemHandle}-${idx}`}
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
                    onClick={() => toggleWishlist(product)}
                    className={`w-7 h-7 rounded-full border transition flex items-center justify-center text-xs shadow-2xs cursor-pointer ${
                      isLiked ? "bg-red-50 border-red-200 text-red-500" : "bg-white/80 border-gray-200 text-gray-400 hover:text-red-500"
                    }`}
                    title="Add to Wishlist"
                  >
                    {isLiked ? "❤️" : "🖤"}
                  </button>
                </div>

                {/* Compact Product Image Box */}
                <Link href={`/product/${itemHandle}`} className="block relative h-44 sm:h-52 bg-gray-50/80 rounded-xl overflow-hidden p-3 border border-gray-100 flex items-center justify-center cursor-pointer">
                  <img
                    src={product.images[0] || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800"}
                    alt={product.title}
                    className={`max-h-full max-w-full object-contain rounded-lg transition duration-500 ${
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
                      <Link href={`/product/${itemHandle}`}>{product.title}</Link>
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
                        productHandle={itemHandle}
                        className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-900 font-bold text-[10px] py-2 px-2 rounded-xl transition text-center flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                      >
                        🛒 Add to Cart
                      </BuyNowButton>
                      <BuyNowButton
                        productHandle={itemHandle}
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
            const isLiked = isInWishlist(product.id);
            const itemHandle = getValidCardHandle(product);

            return (
              <div
                key={`${itemHandle}-${idx}`}
                className="group bg-white border border-gray-200/80 rounded-3xl overflow-hidden p-4 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row items-center gap-6 relative"
              >
                <div className="relative w-full md:w-52 h-52 shrink-0 bg-gray-50 rounded-2xl overflow-hidden p-3 border border-gray-100">
                  <Link href={`/product/${itemHandle}`} className="block w-full h-full relative cursor-pointer">
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
                    onClick={() => toggleWishlist(product)}
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
                      <Link href={`/product/${itemHandle}`}>{product.title}</Link>
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
                        productHandle={itemHandle}
                        className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-900 font-bold text-xs py-2.5 px-4 rounded-xl transition text-center flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        🛒 Add to Cart
                      </BuyNowButton>
                      <BuyNowButton
                        productHandle={itemHandle}
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
