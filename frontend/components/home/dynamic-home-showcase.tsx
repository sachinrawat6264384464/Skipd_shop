"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { BuyNowButton } from "components/auth/buy-now-button";
import { Product } from "lib/api";
import { getUserCartKey, getUserOrdersKey } from "lib/utils";
import { useWishlist } from "components/wishlist/wishlist-context";
import { toast } from "sonner";

export function DynamicHomeShowcase({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [pickUpItems, setPickUpItems] = useState<any[]>([]);
  const [showAllCollections, setShowAllCollections] = useState(false);
  const { isInWishlist, toggleWishlist: ctxToggleWishlist } = useWishlist();

  const handleToggleWishlist = (product: Product) => {
    const item = {
      id: product.id,
      handle: product.handle,
      title: product.title,
      price: product.price,
      compare_at_price: product.compare_at_price,
      image: product.images?.[0] || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800",
      category: typeof product.category === "object" ? (product.category as any)?.name : (product.category || "Store"),
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

  useEffect(() => {
    setProducts(initialProducts || []);

    if (typeof window !== "undefined") {
      try {
        let userInteracted: any[] = [];
        const validProducts = (initialProducts || []);
        
        // Helper to check if a item title is a valid live product
        const isValid = (title: string) => {
          if (!title) return false;
          const t = title.toLowerCase();
          if (t.includes("yoga") || t.includes("mat") || t.includes("headphones") || t.includes("boat") || t.includes("nike") || t.includes("oneplus") || t.includes("apple watch")) {
            return false;
          }
          return validProducts.some(p => p.title.toLowerCase() === t || p.handle === t);
        };

        // 1. Read logged-in user's cart items (filtered strictly to valid live products)
        const cartKey = getUserCartKey();
        const storedCart = localStorage.getItem(cartKey);
        if (storedCart) {
          try {
            const parsed = JSON.parse(storedCart);
            const items = Array.isArray(parsed) ? parsed : (parsed.lines || parsed.items || []);
            items.forEach((it: any) => {
              const prod = it.merchandise?.product || it.product || it;
              if (prod && prod.title && isValid(prod.title) && !userInteracted.some(u => u.label === prod.title)) {
                userInteracted.push({
                  img: prod.images?.[0] || prod.featuredImage?.url || prod.image || "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300",
                  label: prod.title,
                  price: `₹${(prod.price || prod.priceRange?.minVariantPrice?.amount || 1799).toLocaleString("en-IN")}`,
                  mrp: prod.compare_at_price ? `₹${prod.compare_at_price.toLocaleString("en-IN")}` : undefined,
                  href: `/product/${prod.handle || "product"}`
                });
              }
            });
          } catch (e) {}
        }

        // 2. Read logged-in user's placed orders (filtered strictly to valid live products)
        const ordersKey = getUserOrdersKey();
        const storedOrders = localStorage.getItem(ordersKey);
        if (storedOrders) {
          try {
            const parsed = JSON.parse(storedOrders);
            if (Array.isArray(parsed)) {
              parsed.forEach((ord: any) => {
                const title = typeof ord.title === "string" ? ord.title : (typeof ord.items === "string" ? ord.items : "Store Product");
                if (isValid(title) && !userInteracted.some(u => u.label === title)) {
                  userInteracted.push({
                    img: typeof ord.image === "string" ? ord.image : "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300",
                    label: title,
                    price: `₹${(ord.total || 2999).toLocaleString("en-IN")}`,
                    href: "/orders"
                  });
                }
              });
            }
          } catch (e) {}
        }

        // Fallback default catalog products if logged in user hasn't added items yet
        if (userInteracted.length < 4) {
          (initialProducts || []).slice(0, 4).forEach(p => {
            if (!userInteracted.some(u => u.label === p.title)) {
              userInteracted.push({
                img: p.images[0] || "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300",
                label: p.title,
                price: `₹${p.price.toLocaleString("en-IN")}`,
                mrp: p.compare_at_price ? `₹${p.compare_at_price.toLocaleString("en-IN")}` : undefined,
                href: `/product/${p.handle}`
              });
            }
          });
        }

        setPickUpItems(userInteracted.slice(0, 4));

      } catch (e) {}
    }
  }, [initialProducts]);

  // Group products dynamically by Category Name / Slug
  const categorizedProducts = useMemo(() => {
    const map: Record<string, { name: string; slug: string; items: Product[] }> = {};

    products.forEach(p => {
      const catObj = p.category;
      let catName = typeof catObj === "object" ? catObj?.name : catObj;
      if (!catName && p.tags && p.tags.length > 0 && p.tags[0]) {
        catName = p.tags[0].charAt(0).toUpperCase() + p.tags[0].slice(1);
      }
      if (!catName) catName = "Featured Catalog";

      const catSlug = typeof catObj === "object" && catObj?.slug 
        ? catObj.slug 
        : catName.toLowerCase().replace(/\s+/g, "-");

      if (!map[catSlug]) {
        map[catSlug] = { name: catName, slug: catSlug, items: [] };
      }
      map[catSlug].items.push(p);
    });

    return Object.values(map);
  }, [products]);

  return (
    <div className="space-y-10">
      
      {/* 📦 Top Dynamic Category Grid with Cozy Warm Coffee/Cream Card Design */}
      <section className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: Pick up where you left off */}
          <div className="bg-[#FFFDF9] border border-[#E8E1D1] hover:border-[#D4AF37]/60 rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 group">
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-[#F0ECE1] pb-2.5">
                <h3 className="text-sm sm:text-base font-black text-[#2C221E] tracking-tight flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B8860B] animate-pulse" />
                  <span>Pick up where you left off</span>
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {pickUpItems.map((item, i) => {
                  const numPrice = parseFloat(String(item.price).replace(/[^0-9.]/g, ""));
                  const numMrp = item.mrp ? parseFloat(String(item.mrp).replace(/[^0-9.]/g, "")) : 0;
                  const offPercent = numMrp > numPrice && numPrice > 0 ? Math.round(((numMrp - numPrice) / numMrp) * 100) : 0;

                  return (
                    <Link key={i} href={item.href || "/orders"} className="bg-white border border-[#EBE4D5] hover:border-[#D4AF37] rounded-2xl p-2.5 shadow-2xs hover:shadow-md transition-all duration-300 group/item block cursor-pointer">
                      <div className="relative w-full aspect-square bg-[#F9F7F2] rounded-xl overflow-hidden border border-[#EBE4D5] mb-2">
                        <img src={item.img} alt={item.label} className="w-full h-full object-cover group-hover/item:scale-105 transition duration-500" />
                        {offPercent > 0 && (
                          <div className="absolute top-1 left-1 bg-gradient-to-r from-[#B8860B] to-[#8B5E3C] text-white font-black text-[8px] px-1.5 py-0.5 rounded-full shadow-xs tracking-wider">
                            {offPercent}% OFF
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] font-bold text-[#3B2F2F] group-hover/item:text-[#B8860B] transition line-clamp-2 leading-snug min-h-[28px]">{item.label}</p>
                      <div className="flex flex-wrap items-baseline gap-1 pt-1">
                        <span className="text-xs font-black text-[#2C221E]">{item.price}</span>
                        {item.mrp && <span className="text-[9px] text-stone-400 line-through font-medium">{item.mrp}</span>}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
            <Link href="/orders" className="text-xs font-extrabold text-[#B8860B] hover:text-[#8B5E3C] flex items-center gap-1.5 pt-1 group-hover:translate-x-1 transition">
              <span>See your orders &amp; cart</span>
              <span>&rarr;</span>
            </Link>
          </div>

          {/* Card 2: Keep shopping for it */}
          <div className="bg-[#FFFDF9] border border-[#E8E1D1] hover:border-[#D4AF37]/60 rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 group">
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-[#F0ECE1] pb-2.5">
                <h3 className="text-sm sm:text-base font-black text-[#2C221E] tracking-tight flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8B5E3C] animate-pulse" />
                  <span>Keep shopping for it</span>
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {products.slice(0, 4).map((p, i) => {
                  const stock = typeof p.stock_quantity === "number" ? p.stock_quantity : 12;
                  return (
                    <Link key={i} href={`/product/${p.handle}`} className="bg-white border border-[#EBE4D5] hover:border-[#8B5E3C] rounded-2xl p-2.5 shadow-2xs hover:shadow-md transition-all duration-300 group/item block cursor-pointer">
                      <div className="relative w-full aspect-square bg-[#F9F7F2] rounded-xl overflow-hidden border border-[#EBE4D5] mb-2">
                        <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover/item:scale-105 transition duration-500" />
                      </div>
                      <p className="text-[11px] font-bold text-[#3B2F2F] group-hover/item:text-[#8B5E3C] transition line-clamp-2 leading-snug min-h-[28px]">{p.title}</p>
                      <div className="flex items-center justify-between flex-wrap gap-1 pt-1">
                        <span className="text-xs font-black text-[#2C221E]">₹{p.price.toLocaleString("en-IN")}</span>
                        {stock > 5 ? (
                          <span className="text-[8px] font-extrabold text-[#5C4033] bg-[#F4EFE6] px-1.5 py-0.5 rounded-md border border-[#E8E1D1]">In Stock</span>
                        ) : stock > 0 ? (
                          <span className="text-[8px] font-black text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded-md animate-pulse">Only {stock} left!</span>
                        ) : (
                          <span className="text-[8px] font-black text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-md">Out of Stock</span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
            <Link href="/search" className="text-xs font-extrabold text-[#8B5E3C] hover:text-[#5C4033] flex items-center gap-1.5 pt-1 group-hover:translate-x-1 transition">
              <span>Explore catalog</span>
              <span>&rarr;</span>
            </Link>
          </div>

          {/* Card 3: Up to 50% off | Select collection */}
          <div className="bg-[#FFFDF9] border border-[#E8E1D1] hover:border-[#D4AF37]/60 rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 group">
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-[#F0ECE1] pb-2.5">
                <h3 className="text-sm sm:text-base font-black text-[#2C221E] tracking-tight flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#A52A2A] animate-pulse" />
                  <span>Up to 50% off | Select collection</span>
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {products.slice(4, 8).map((p, i) => {
                  const offPercent = p.compare_at_price ? Math.round(((p.compare_at_price - p.price) / p.compare_at_price) * 100) : 35;
                  const stock = typeof p.stock_quantity === "number" ? p.stock_quantity : 12;
                  return (
                    <Link key={i} href={`/product/${p.handle}`} className="bg-white border border-[#EBE4D5] hover:border-[#A52A2A] rounded-2xl p-2.5 shadow-2xs hover:shadow-md transition-all duration-300 group/item block cursor-pointer">
                      <div className="relative w-full aspect-square bg-[#F9F7F2] rounded-xl overflow-hidden border border-[#EBE4D5] mb-2">
                        <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover/item:scale-105 transition duration-500" />
                        <div className="absolute top-1 left-1 bg-gradient-to-r from-[#A52A2A] to-[#B8860B] text-white font-black text-[8px] px-1.5 py-0.5 rounded-full shadow-xs tracking-wider">
                          {offPercent}% OFF
                        </div>
                      </div>
                      <p className="text-[11px] font-bold text-[#3B2F2F] group-hover/item:text-[#A52A2A] transition line-clamp-2 leading-snug min-h-[28px]">{p.title}</p>
                      <div className="flex items-center justify-between flex-wrap gap-1 pt-1">
                        <span className="text-xs font-black text-[#2C221E]">₹{p.price.toLocaleString("en-IN")}</span>
                        {stock > 5 ? (
                          <span className="text-[8px] font-extrabold text-[#5C4033] bg-[#F4EFE6] px-1.5 py-0.5 rounded-md border border-[#E8E1D1]">In Stock</span>
                        ) : stock > 0 ? (
                          <span className="text-[8px] font-black text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded-md animate-pulse">Only {stock} left!</span>
                        ) : (
                          <span className="text-[8px] font-black text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-md">Out of Stock</span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
            <Link href="/search?discount=30" className="text-xs font-extrabold text-[#A52A2A] hover:text-[#8B0000] flex items-center gap-1.5 pt-1 group-hover:translate-x-1 transition">
              <span>View discounts</span>
              <span>&rarr;</span>
            </Link>
          </div>

          {/* Card 4: Trending & New Arrivals */}
          <div className="bg-[#FFFDF9] border border-[#E8E1D1] hover:border-[#D4AF37]/60 rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 group">
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-[#F0ECE1] pb-2.5">
                <h3 className="text-sm sm:text-base font-black text-[#2C221E] tracking-tight flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-pulse" />
                  <span>Trending &amp; New Arrivals</span>
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {products.slice(8, 12).map((p, i) => {
                  const stock = typeof p.stock_quantity === "number" ? p.stock_quantity : 12;
                  return (
                    <Link key={i} href={`/product/${p.handle}`} className="bg-white border border-[#EBE4D5] hover:border-[#D4AF37] rounded-2xl p-2.5 shadow-2xs hover:shadow-md transition-all duration-300 group/item block cursor-pointer">
                      <div className="relative w-full aspect-square bg-[#F9F7F2] rounded-xl overflow-hidden border border-[#EBE4D5] mb-2">
                        <img src={p.images[0]} alt={p.title} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover/item:scale-105 transition duration-500" />
                      </div>
                      <p className="text-[11px] font-bold text-[#3B2F2F] group-hover/item:text-[#B8860B] transition line-clamp-2 leading-snug min-h-[28px]">{p.title}</p>
                      <div className="flex items-center justify-between flex-wrap gap-1 pt-1">
                        <span className="text-xs font-black text-[#2C221E]">₹{p.price.toLocaleString("en-IN")}</span>
                        {stock > 5 ? (
                          <span className="text-[8px] font-extrabold text-[#5C4033] bg-[#F4EFE6] px-1.5 py-0.5 rounded-md border border-[#E8E1D1]">In Stock</span>
                        ) : stock > 0 ? (
                          <span className="text-[8px] font-black text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded-md animate-pulse">Only {stock} left!</span>
                        ) : (
                          <span className="text-[8px] font-black text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-md">Out of Stock</span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
            <Link href="/search" className="text-xs font-extrabold text-[#B8860B] hover:text-[#8B5E3C] flex items-center gap-1.5 pt-1 group-hover:translate-x-1 transition">
              <span>See all new arrivals</span>
              <span>&rarr;</span>
            </Link>
          </div>

        </div>
      </section>

      {/* 🏷️ DYNAMIC CATEGORY SHOWCASE SECTIONS (Initially 2 categories with Show More toggle) */}
      <section className="max-w-[1440px] mx-auto px-2 sm:px-4 lg:px-6 space-y-8">
        {(showAllCollections ? categorizedProducts : categorizedProducts.slice(0, 2)).map((catGroup) => (
          <div key={catGroup.slug} className="bg-[#FFFDF9] border border-[#E8E1D1] rounded-3xl p-6 shadow-sm space-y-6">
            
            {/* Category Header with Title & Explore More Button */}
            <div className="flex justify-between items-center border-b border-[#F0ECE1] pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#2C221E]">{catGroup.name} Collection</h2>
                <p className="text-xs text-stone-500 mt-0.5">Explore {catGroup.items.length} items in {catGroup.name}</p>
              </div>
              
              <Link
                href={`/category/${catGroup.slug}`}
                className="bg-[#F4EFE6] hover:bg-[#EBE4D5] text-[#5C4033] border border-[#E8E1D1] font-extrabold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-2xs"
              >
                <span>Explore More</span>
                <span>&rarr;</span>
              </Link>
            </div>

            {/* Category Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {catGroup.items.slice(0, 4).map((product, idx) => {
                const offPercent = product.compare_at_price 
                  ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100) 
                  : 0;

                const numId = typeof product.id === "number" ? product.id : (parseInt(String(product.id || "").replace(/[^0-9]/g, "")) || idx);
                const stock = typeof product.stock_quantity === "number" ? product.stock_quantity : 12;
                const isOutOfStock = stock === 0;

                return (
                  <div
                    key={`${product.handle || product.id}-${idx}`}
                    className={`group bg-gray-50/80 border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between relative p-4 space-y-3 ${
                      isOutOfStock ? "border-gray-300 bg-gray-100/60 opacity-85" : "border-gray-200/80 hover:shadow-lg"
                    }`}
                  >
                    {offPercent > 0 && !isOutOfStock && (
                      <span className="absolute top-2 left-2 z-10 bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                        -{offPercent}%
                      </span>
                    )}

                    {/* Stock Quantity Badge */}
                    <div className="absolute top-2 left-2 z-10">
                      {stock > 5 ? (
                        <span className="bg-slate-900/85 backdrop-blur-sm text-sky-400 font-extrabold text-[9px] px-1.5 py-0.5 rounded-md border border-slate-700">
                          📦 In Stock ({stock} left)
                        </span>
                      ) : stock > 0 ? (
                        <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded-md border border-amber-400 shadow-xs animate-pulse">
                          ⚡ Only {stock} left!
                        </span>
                      ) : (
                        <span className="bg-red-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded-md uppercase tracking-wider shadow-xs">
                          ❌ Out of Stock
                        </span>
                      )}
                    </div>

                    {/* Wishlist Heart Button */}
                    <button
                      onClick={() => handleToggleWishlist(product)}
                      className={`absolute top-2 right-2 z-10 w-7 h-7 rounded-full border flex items-center justify-center text-xs shadow transition cursor-pointer ${
                        isInWishlist(product.id, product.handle)
                          ? "bg-red-50 border-red-200 text-red-500"
                          : "bg-white/80 border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200"
                      }`}
                      title={isInWishlist(product.id, product.handle) ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                      {isInWishlist(product.id, product.handle) ? "❤️" : "🖤"}
                    </button>

                    <Link href={isOutOfStock ? "#" : `/product/${product.handle}`} className="block relative aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200/60 mt-5">
                      <Image
                        src={product.images[0] || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800"}
                        alt={product.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                        loading="lazy"
                        className={`object-cover w-full h-full transition duration-500 ${isOutOfStock ? "grayscale opacity-70" : "group-hover:scale-105"}`}
                      />
                    </Link>

                    <div className="space-y-1">
                      <h3 className="font-bold text-xs text-gray-900 group-hover:text-blue-600 transition line-clamp-2 leading-snug">
                        <Link href={isOutOfStock ? "#" : `/product/${product.handle}`}>{product.title}</Link>
                      </h3>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-sm font-black ${isOutOfStock ? "text-gray-500" : "text-gray-900"}`}>₹{product.price.toLocaleString("en-IN")}</span>
                        {product.compare_at_price && (
                          <span className="text-xs text-gray-400 line-through">₹{product.compare_at_price.toLocaleString("en-IN")}</span>
                        )}
                      </div>
                    </div>

                    {/* Dual Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200/60">
                      <BuyNowButton
                        mode="cart"
                        productObj={product}
                        productHandle={product.handle}
                        disabled={isOutOfStock}
                        className={`font-bold text-[11px] py-2 px-2 rounded-xl transition text-center flex items-center justify-center gap-1 shadow-2xs ${
                          isOutOfStock
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300 opacity-60"
                            : "bg-white border border-gray-300 hover:bg-gray-100 text-gray-900 cursor-pointer"
                        }`}
                      >
                        {isOutOfStock ? "Out of Stock" : "🛒 Cart"}
                      </BuyNowButton>
                      <BuyNowButton
                        mode="buy"
                        productHandle={product.handle}
                        productObj={product}
                        disabled={isOutOfStock}
                        className={`font-black text-[11px] py-2 px-2 rounded-xl transition text-center flex items-center justify-center gap-1 shadow-xs ${
                          isOutOfStock
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-60"
                            : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                        }`}
                      >
                        {isOutOfStock ? "Unavailable" : "⚡ Buy Now"}
                      </BuyNowButton>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        ))}

        {/* 🔘 Show More Categories Button */}
        {categorizedProducts.length > 2 && (
          <div className="text-center pt-2 pb-4">
            <button
              onClick={() => setShowAllCollections(!showAllCollections)}
              className="bg-white hover:bg-blue-50 text-blue-700 border-2 border-blue-500/80 hover:border-blue-600 font-extrabold text-sm px-8 py-3.5 rounded-2xl shadow-sm hover:shadow-md transition cursor-pointer inline-flex items-center gap-2 group"
            >
              <span>{showAllCollections ? "Show Fewer Categories ▲" : `Show More Categories (${categorizedProducts.length - 2} More) ▼`}</span>
            </button>
          </div>
        )}
      </section>

    </div>
  );
}
