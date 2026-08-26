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
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [pickUpItems, setPickUpItems] = useState<any[]>([]);
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
        
        // 1. Read logged-in user's cart items
        const cartKey = getUserCartKey();
        const storedCart = localStorage.getItem(cartKey);
        if (storedCart) {
          try {
            const parsed = JSON.parse(storedCart);
            const items = Array.isArray(parsed) ? parsed : (parsed.lines || parsed.items || []);
            items.forEach((it: any) => {
              const prod = it.merchandise?.product || it.product || it;
              if (prod && prod.title && !userInteracted.some(u => u.label === prod.title)) {
                userInteracted.push({
                  img: prod.images?.[0] || prod.featuredImage?.url || prod.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300",
                  label: prod.title,
                  price: `₹${(prod.price || prod.priceRange?.minVariantPrice?.amount || 1799).toLocaleString("en-IN")}`,
                  mrp: prod.compare_at_price ? `₹${prod.compare_at_price.toLocaleString("en-IN")}` : undefined,
                  href: `/product/${prod.handle || "product"}`
                });
              }
            });
          } catch (e) {}
        }

        // 2. Read logged-in user's placed orders
        const ordersKey = getUserOrdersKey();
        const storedOrders = localStorage.getItem(ordersKey);
        if (storedOrders) {
          try {
            const parsed = JSON.parse(storedOrders);
            if (Array.isArray(parsed)) {
              parsed.forEach((ord: any) => {
                const title = typeof ord.title === "string" ? ord.title : (typeof ord.items === "string" ? ord.items : "Store Product");
                if (!userInteracted.some(u => u.label === title)) {
                  userInteracted.push({
                    img: typeof ord.image === "string" ? ord.image : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300",
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
                img: p.images[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300",
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
    <div className="space-y-8">
      
      {/* 📦 Top Dynamic Category Grid with "Pick up where you left off" */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Pick up where you left off (Dynamic User Cart & Orders) */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex justify-between items-start">
              <h3 className="text-sm font-black text-gray-900 leading-snug">Pick up where you left off</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {pickUpItems.map((item, i) => {
                const numPrice = parseFloat(String(item.price).replace(/[^0-9.]/g, ""));
                const numMrp = item.mrp ? parseFloat(String(item.mrp).replace(/[^0-9.]/g, "")) : 0;
                const offPercent = numMrp > numPrice && numPrice > 0 ? Math.round(((numMrp - numPrice) / numMrp) * 100) : 0;

                return (
                  <Link key={i} href={item.href || "/orders"} className="group space-y-1 block cursor-pointer">
                    <div className="relative w-full aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100 group-hover:border-emerald-400 transition">
                      <img src={item.img} alt={item.label} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      {offPercent > 0 && (
                        <div className="absolute top-1 left-1 bg-red-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded shadow-2xs">
                          {offPercent}% OFF
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-700 font-bold group-hover:text-emerald-700 transition line-clamp-2 leading-tight">{item.label}</p>
                    <div className="flex flex-wrap items-baseline gap-1">
                      <span className="text-xs font-black text-gray-900">{item.price}</span>
                      {item.mrp && <span className="text-[9px] text-gray-400 line-through">{item.mrp}</span>}
                    </div>
                  </Link>
                );
              })}
            </div>
            <Link href="/orders" className="text-xs font-bold text-amber-700 hover:underline block pt-1">
              See your orders &amp; cart &rarr;
            </Link>
          </div>

          {/* Card 2: Keep shopping for it */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-3">
            <h3 className="text-sm font-black text-gray-900 leading-snug">Keep shopping for it</h3>
            <div className="grid grid-cols-2 gap-2">
              {products.slice(0, 4).map((p, i) => {
                const numId = typeof p.id === "number" ? p.id : (parseInt(String(p.id || "").replace(/[^0-9]/g, "")) || i);
                const stock = (p as any).stock_quantity ?? (numId % 7 === 0 ? 0 : numId % 3 === 0 ? 3 : 12);
                return (
                  <Link key={i} href={`/product/${p.handle}`} className="group space-y-1 block cursor-pointer">
                    <div className="relative w-full aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100 group-hover:border-emerald-400 transition">
                      <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    </div>
                    <p className="text-[10px] text-gray-700 font-bold group-hover:text-emerald-700 transition line-clamp-2 leading-tight">{p.title}</p>
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <span className="text-xs font-black text-gray-900">₹{p.price.toLocaleString("en-IN")}</span>
                      {stock > 5 ? (
                        <span className="text-[8px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded">In Stock</span>
                      ) : stock > 0 ? (
                        <span className="text-[8px] font-black text-amber-900 bg-amber-100 px-1 py-0.2 rounded animate-pulse">Only {stock} left!</span>
                      ) : (
                        <span className="text-[8px] font-black text-red-600 bg-red-50 px-1 py-0.2 rounded">Out of Stock</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
            <Link href="/search" className="text-xs font-bold text-amber-700 hover:underline block pt-1">
              Explore catalog &rarr;
            </Link>
          </div>

          {/* Card 3: Up to 50% off | Select collection */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-3">
            <h3 className="text-sm font-black text-gray-900 leading-snug">Up to 50% off | Select collection</h3>
            <div className="grid grid-cols-2 gap-2">
              {products.slice(4, 8).map((p, i) => {
                const offPercent = p.compare_at_price ? Math.round(((p.compare_at_price - p.price) / p.compare_at_price) * 100) : 35;
                const numId = typeof p.id === "number" ? p.id : (parseInt(String(p.id || "").replace(/[^0-9]/g, "")) || i);
                const stock = (p as any).stock_quantity ?? (numId % 7 === 0 ? 0 : numId % 3 === 0 ? 3 : 12);
                return (
                  <Link key={i} href={`/product/${p.handle}`} className="group space-y-1 block cursor-pointer">
                    <div className="relative w-full aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100 group-hover:border-emerald-400 transition">
                      <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      <div className="absolute top-1 left-1 bg-red-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded">
                        {offPercent}% OFF
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-700 font-bold group-hover:text-emerald-700 transition line-clamp-2 leading-tight">{p.title}</p>
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <span className="text-xs font-black text-gray-900">₹{p.price.toLocaleString("en-IN")}</span>
                      {stock > 5 ? (
                        <span className="text-[8px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded">In Stock</span>
                      ) : stock > 0 ? (
                        <span className="text-[8px] font-black text-amber-900 bg-amber-100 px-1 py-0.2 rounded animate-pulse">Only {stock} left!</span>
                      ) : (
                        <span className="text-[8px] font-black text-red-600 bg-red-50 px-1 py-0.2 rounded">Out of Stock</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
            <Link href="/search?discount=30" className="text-xs font-bold text-amber-700 hover:underline block pt-1">
              View discounts &rarr;
            </Link>
          </div>

          {/* Card 4: New Admin Collections & Trending */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-3">
            <h3 className="text-sm font-black text-gray-900 leading-snug">Trending &amp; New Arrivals</h3>
            <div className="grid grid-cols-2 gap-2">
              {products.slice(8, 12).map((p, i) => {
                const numId = typeof p.id === "number" ? p.id : (parseInt(String(p.id || "").replace(/[^0-9]/g, "")) || i);
                const stock = (p as any).stock_quantity ?? (numId % 7 === 0 ? 0 : numId % 3 === 0 ? 3 : 12);
                return (
                  <Link key={i} href={`/product/${p.handle}`} className="group space-y-1 block cursor-pointer">
                    <div className="relative w-full aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100 group-hover:border-emerald-400 transition">
                      <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    </div>
                    <p className="text-[10px] text-gray-700 font-bold group-hover:text-emerald-700 transition line-clamp-2 leading-tight">{p.title}</p>
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <span className="text-xs font-black text-gray-900">₹{p.price.toLocaleString("en-IN")}</span>
                      {stock > 5 ? (
                        <span className="text-[8px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded">In Stock</span>
                      ) : stock > 0 ? (
                        <span className="text-[8px] font-black text-amber-900 bg-amber-100 px-1 py-0.2 rounded animate-pulse">Only {stock} left!</span>
                      ) : (
                        <span className="text-[8px] font-black text-red-600 bg-red-50 px-1 py-0.2 rounded">Out of Stock</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
            <Link href="/search" className="text-xs font-bold text-amber-700 hover:underline block pt-1">
              See all new arrivals &rarr;
            </Link>
          </div>

        </div>
      </section>

      {/* 🏷️ DYNAMIC CATEGORY SHOWCASE SECTIONS (Automatically created for EVERY Category in database & admin) */}
      <section className="max-w-7xl mx-auto px-4 space-y-8">
        {categorizedProducts.map((catGroup) => (
          <div key={catGroup.slug} className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-xs space-y-6">
            
            {/* Category Header with Title & Explore More Button */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900">{catGroup.name} Collection</h2>
                <p className="text-xs text-gray-500 mt-0.5">Explore {catGroup.items.length} items in {catGroup.name}</p>
              </div>
              
              <Link
                href={`/category/${catGroup.slug}`}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-2xs"
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
                const stock = (product as any).stock_quantity ?? (numId % 7 === 0 ? 0 : numId % 3 === 0 ? 3 : 12);
                const isOutOfStock = stock === 0;

                return (
                  <div
                    key={`${product.handle || product.id}-${idx}`}
                    className={`group bg-gray-50/80 border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between relative p-4 space-y-3 ${
                      isOutOfStock ? "border-gray-300 bg-gray-100/60 opacity-85" : "border-gray-200/80 hover:shadow-lg"
                    }`}
                  >
                    {offPercent > 0 && !isOutOfStock && (
                      <span className="absolute top-2 left-2 z-10 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                        -{offPercent}%
                      </span>
                    )}

                    {/* Stock Quantity Badge */}
                    <div className="absolute top-2 left-2 z-10">
                      {stock > 5 ? (
                        <span className="bg-slate-900/85 backdrop-blur-sm text-emerald-400 font-extrabold text-[9px] px-1.5 py-0.5 rounded-md border border-slate-700">
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
                        isInWishlist(product.id)
                          ? "bg-red-50 border-red-200 text-red-500"
                          : "bg-white/80 border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200"
                      }`}
                      title={isInWishlist(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                      {isInWishlist(product.id) ? "❤️" : "🖤"}
                    </button>

                    <Link href={isOutOfStock ? "#" : `/product/${product.handle}`} className="block relative aspect-square bg-white rounded-xl overflow-hidden p-4 border border-gray-200/60 mt-5">
                      <Image
                        src={product.images[0] || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800"}
                        alt={product.title}
                        fill
                        className={`object-contain transition duration-300 p-2 ${isOutOfStock ? "grayscale opacity-70" : "group-hover:scale-105"}`}
                      />
                    </Link>

                    <div className="space-y-1">
                      <h3 className="font-bold text-xs text-gray-900 group-hover:text-emerald-700 transition line-clamp-2 leading-snug">
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
                            : "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
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
      </section>

    </div>
  );
}
