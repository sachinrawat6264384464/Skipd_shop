"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { BuyNowButton } from "components/auth/buy-now-button";
import { Product, fetchProducts } from "lib/api";
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
    if (initialProducts && initialProducts.length > 0) {
      setProducts(initialProducts);
    } else {
      fetchProducts().then(res => {
        if (res && res.length > 0) {
          setProducts(res);
        }
      }).catch(() => {});
    }
  }, [initialProducts]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        let userInteracted: any[] = [];
        const validProducts = (products.length > 0 ? products : (initialProducts || []));
        
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
        const catalogList = (products.length > 0 ? products : (initialProducts || []));
        if (userInteracted.length < 4) {
          catalogList.slice(0, 4).forEach(p => {
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
  }, [initialProducts, products]);

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
      
      {/* 🌟 Trending & Featured Products - Individual Separate Cards */}
      <section className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Trending &amp; New Arrivals</h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Explore our top handpicked products individually</p>
          </div>
          <Link href="/search" className="text-xs font-bold text-blue-600 hover:underline">
            View All &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.slice(0, 8).map((product, idx) => {
            const offPercent = product.compare_at_price 
              ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100) 
              : 0;
            const stock = typeof product.stock_quantity === "number" ? product.stock_quantity : 12;
            const isOutOfStock = stock === 0;

            return (
              <div
                key={`${product.handle || product.id}-${idx}`}
                className="group bg-white border border-gray-200/90 hover:border-blue-500 rounded-3xl p-4 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
              >
                {offPercent > 0 && !isOutOfStock && (
                  <span className="absolute top-3 left-3 z-10 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase shadow-xs">
                    {offPercent}% OFF
                  </span>
                )}

                <Link href={isOutOfStock ? "#" : `/product/${product.handle || product.id}`} className="block relative aspect-square w-full bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 p-2 mb-3 cursor-pointer">
                  <img
                    src={(product.images && product.images[0]) || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800"}
                    alt={product.title}
                    className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition duration-500"
                  />
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center p-2">
                      <div className="border-2 border-red-600 text-red-600 font-black text-xs px-2.5 py-1 rounded-lg uppercase tracking-wider bg-white shadow-md">
                        Out of Stock
                      </div>
                    </div>
                  )}
                </Link>

                <div className="space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider">
                      {typeof product.category === "object" ? product.category?.name : (product.category || "Top Pick")}
                    </span>
                    <h3 className="font-extrabold text-xs sm:text-sm text-gray-900 group-hover:text-blue-600 transition line-clamp-2 leading-snug">
                      <Link href={isOutOfStock ? "#" : `/product/${product.handle || product.id}`}>{product.title}</Link>
                    </h3>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-baseline justify-between">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm sm:text-base font-black text-gray-900">
                        ₹{product.price.toLocaleString("en-IN")}
                      </span>
                      {product.compare_at_price && product.compare_at_price > product.price && (
                        <span className="text-[10px] text-gray-400 line-through">
                          ₹{product.compare_at_price.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                      In Stock
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 🖼️ MIDDLE FULL-WIDTH SHOWCASE BANNER */}
      <section className="max-w-[1440px] mx-auto px-2 sm:px-4 lg:px-6 my-8">
        <div className="relative w-full h-56 sm:h-72 md:h-80 lg:h-[380px] rounded-3xl overflow-hidden shadow-xl border border-[#E8E1D1] group">
          <Image
            src="/image copy 2.png"
            alt="Exclusive Showcase Banner"
            fill
            priority
            sizes="(max-width: 1440px) 100vw, 1440px"
            className="object-cover w-full h-full transform group-hover:scale-105 transition duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent flex items-center p-6 sm:p-10 lg:p-14">
            <div className="max-w-lg space-y-3 sm:space-y-4 text-white">
              <span className="inline-block bg-[#B8860B] text-white text-[11px] sm:text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                Featured Exclusive Collection
              </span>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-amber-50 drop-shadow-md leading-tight">
                Crafted Luxury &amp; Elegance
              </h2>
              <p className="text-xs sm:text-sm text-amber-100/90 line-clamp-2 sm:line-clamp-none font-medium drop-shadow-sm">
                Discover handpicked premium designs curated for timeless fashion and luxury aesthetics.
              </p>
              <div className="pt-2">
                <Link
                  href="/search"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-lg hover:shadow-blue-500/30 transition transform hover:-translate-y-0.5"
                >
                  <span>Explore Full Collection</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>
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

            {/* Category Product Grid (Centered) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-center justify-items-center">
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
                    className={`group bg-white border border-gray-200/90 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between relative p-4 space-y-3 w-full max-w-sm mx-auto ${
                      isOutOfStock ? "border-gray-200/90 bg-white opacity-85" : "border-gray-200/90 hover:border-blue-500 hover:shadow-xl"
                    }`}
                  >
                    {offPercent > 0 && !isOutOfStock && (
                      <span className="absolute top-2 left-2 z-10 bg-[#B8860B] text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase shadow-xs">
                        -{offPercent}%
                      </span>
                    )}

                    {/* Stock Quantity Badge */}
                    <div className="absolute top-2 left-2 z-10">
                      {stock > 5 ? (
                        <span className="bg-[#3B2F2F]/90 backdrop-blur-sm text-[#F4EFE6] font-extrabold text-[9px] px-1.5 py-0.5 rounded-md border border-[#5C4033]">
                          In Stock ({stock} left)
                        </span>
                      ) : stock > 0 ? (
                        <span className="bg-[#B8860B] text-white font-black text-[9px] px-1.5 py-0.5 rounded-md border border-amber-300 shadow-xs animate-pulse">
                          Only {stock} left!
                        </span>
                      ) : (
                        <span className="bg-[#8B0000] text-white font-black text-[9px] px-1.5 py-0.5 rounded-md uppercase tracking-wider shadow-xs">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    {/* Wishlist Heart Button */}
                    <button
                      onClick={() => handleToggleWishlist(product)}
                      className={`absolute top-2 right-2 z-10 w-7 h-7 rounded-full border flex items-center justify-center text-xs shadow-xs transition cursor-pointer ${
                        isInWishlist(product.id, product.handle)
                          ? "bg-rose-50 border-rose-200 text-rose-500"
                          : "bg-[#FFFDF9]/90 border-[#E8E1D1] text-stone-400 hover:text-rose-500 hover:border-rose-200"
                      }`}
                      title={isInWishlist(product.id, product.handle) ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                      {isInWishlist(product.id, product.handle) ? "❤️" : "🖤"}
                    </button>

                    <Link href={isOutOfStock ? "#" : `/product/${product.handle}`} className="block relative aspect-square bg-[#F9F7F2] rounded-xl overflow-hidden border border-[#E8E1D1] mt-5">
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
                      <h3 className="font-bold text-xs text-[#2C221E] group-hover:text-[#B8860B] transition line-clamp-2 leading-snug">
                        <Link href={isOutOfStock ? "#" : `/product/${product.handle}`}>{product.title}</Link>
                      </h3>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-sm font-black ${isOutOfStock ? "text-stone-400" : "text-[#2C221E]"}`}>₹{product.price.toLocaleString("en-IN")}</span>
                        {product.compare_at_price && (
                          <span className="text-xs text-stone-400 line-through">₹{product.compare_at_price.toLocaleString("en-IN")}</span>
                        )}
                      </div>
                    </div>

                    {/* Dual Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#F0ECE1]">
                      <BuyNowButton
                        mode="cart"
                        productObj={product}
                        productHandle={product.handle}
                        disabled={isOutOfStock}
                        className={`font-bold text-[11px] py-2 px-2 rounded-xl transition text-center flex items-center justify-center gap-1 shadow-2xs ${
                          isOutOfStock
                            ? "bg-[#EBE4D5] text-stone-400 cursor-not-allowed border border-[#D8D0C0] opacity-60"
                            : "bg-[#FFFDF9] border border-[#E8E1D1] hover:bg-[#F4EFE6] text-[#3B2F2F] cursor-pointer"
                        }`}
                      >
                        {isOutOfStock ? "Out of Stock" : "Cart"}
                      </BuyNowButton>
                      <BuyNowButton
                        mode="buy"
                        productHandle={product.handle}
                        productObj={product}
                        disabled={isOutOfStock}
                        className={`font-black text-[11px] py-2 px-2 rounded-xl transition text-center flex items-center justify-center gap-1 shadow-xs ${
                          isOutOfStock
                            ? "bg-[#D8D0C0] text-stone-500 cursor-not-allowed opacity-60"
                            : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-md shadow-blue-500/20"
                        }`}
                      >
                        {isOutOfStock ? "Unavailable" : "Buy Now"}
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

export default DynamicHomeShowcase;
