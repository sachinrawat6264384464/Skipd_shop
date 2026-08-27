"use client";

import { useWishlist } from "components/wishlist/wishlist-context";
import Link from "next/link";
import Footer from "components/layout/footer";
import { getUserCartKey } from "lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const router = useRouter();

  // ✅ Properly adds item to cart with real event dispatch (updates navbar badge)
  const handleMoveToCart = (item: any) => {
    try {
      const cartKey = getUserCartKey();
      const stored = localStorage.getItem(cartKey);
      let items = stored ? JSON.parse(stored) : [];

      const existingIdx = items.findIndex((i: any) =>
        String(i.id) === String(item.id) || i.handle === item.handle
      );

      if (existingIdx > -1) {
        items[existingIdx].quantity = (items[existingIdx].quantity || 1) + 1;
      } else {
        items.push({
          id: item.id,
          handle: item.handle,
          title: item.title,
          price: item.price,
          compare_at_price: item.compare_at_price,
          quantity: 1,
          image: item.image
        });
      }

      localStorage.setItem(cartKey, JSON.stringify(items));

      // Fire both cart events so navbar counter badge updates instantly
      window.dispatchEvent(new Event("ecom_cart_updated"));
      window.dispatchEvent(new Event("ecom_cart_changed"));
      window.dispatchEvent(new StorageEvent("storage", {
        key: cartKey,
        newValue: JSON.stringify(items)
      }));

      // Remove from wishlist after adding to cart
      removeFromWishlist(item.id);

      toast.success(`🛒 Moved to Cart!`, {
        description: `${item.title} added to your cart.`,
        duration: 3000
      });
    } catch (e) {
      toast.error("Something went wrong. Please try again.");
    }
  };

  // ⚡ Buy Now — save to session and go directly to checkout
  const handleBuyNow = (item: any) => {
    try {
      const buyNowItem = [{
        id: item.id,
        handle: item.handle,
        title: item.title,
        price: item.price,
        quantity: 1,
        image: item.image
      }];
      sessionStorage.setItem("ecom_buy_now_item", JSON.stringify(buyNowItem));
      router.push("/checkout?buyNow=true");
    } catch (e) {
      toast.error("Could not proceed to checkout. Try again.");
    }
  };

  return (
    <div className="bg-[#FAFAFA] text-gray-900 min-h-screen flex flex-col justify-between">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 w-full">

        {/* Page Header */}
        <div className="border-b border-gray-200 pb-4 flex justify-between items-center flex-wrap gap-4">
          <div>
            <span className="bg-rose-100 text-rose-800 border border-rose-300 font-extrabold text-[10px] uppercase px-3 py-1 rounded-full tracking-wider">
              ❤️ YOUR SAVED FAVORITES
            </span>
            <h1 className="text-3xl font-black text-gray-900 mt-2">
              My Wishlist ({wishlist.length})
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Items you've saved for later. Move them to your cart with 1 click whenever you're ready!
            </p>
          </div>

          <Link href="/search" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline">
            + Continue Shopping &rsaquo;
          </Link>
        </div>

        {/* Wishlist Grid or Empty State */}
        {wishlist.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto shadow-xs">
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-4xl mx-auto border border-rose-200">
              ❤️
            </div>
            <h2 className="text-xl font-black text-gray-900">Your Wishlist is Empty</h2>
            <p className="text-xs text-gray-500">
              Explore our catalog and click the heart icon on items you love.
            </p>
            <Link
              href="/search"
              className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-3 rounded-2xl transition cursor-pointer shadow-md"
            >
              Explore Catalog →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map((item, idx) => {
              const discountPercent = item.compare_at_price
                ? Math.round(((item.compare_at_price - item.price) / item.compare_at_price) * 100)
                : 25;

              const numId = typeof item.id === "number" ? item.id : (parseInt(String(item.id || "").replace(/[^0-9]/g, "")) || idx);
              const stock = typeof (item as any).stock_quantity === "number" ? (item as any).stock_quantity : 12;
              const isOutOfStock = stock === 0;

              return (
                <div
                  key={item.id}
                  className={`bg-white border rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4 group transition-all duration-300 ${
                    isOutOfStock ? "border-gray-300 bg-gray-50/60 opacity-85" : "border-gray-200 hover:shadow-lg"
                  }`}
                >
                  {/* Product Image */}
                  <div className="space-y-3">
                    <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden p-3 border border-gray-100">
                      <Link href={isOutOfStock ? "#" : `/product/${item.handle}`}>
                        <img
                          src={item.image}
                          alt={item.title}
                          className={`w-full h-full object-contain transition duration-300 ${
                            isOutOfStock ? "grayscale opacity-75" : "group-hover:scale-105"
                          }`}
                        />
                      </Link>

                      {/* Discount Badge */}
                      {discountPercent > 0 && !isOutOfStock && (
                        <span className="absolute top-2 left-2 bg-red-600 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase">
                          -{discountPercent}%
                        </span>
                      )}

                      {/* Stock Quantity Badge */}
                      <div className="absolute bottom-2 left-2 z-10">
                        {stock > 5 ? (
                          <span className="bg-slate-900/80 backdrop-blur-md text-emerald-400 font-extrabold text-[9px] px-2 py-0.5 rounded-md border border-slate-700">
                            📦 In Stock ({stock} left)
                          </span>
                        ) : stock > 0 ? (
                          <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-md border border-amber-400 shadow-xs animate-pulse">
                            ⚡ Only {stock} left!
                          </span>
                        ) : (
                          <span className="bg-red-600 text-white font-black text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider shadow-xs">
                            ❌ Out of Stock
                          </span>
                        )}
                      </div>

                      {/* Remove from Wishlist */}
                      <button
                        onClick={() => {
                          removeFromWishlist(item.id);
                          toast("💔 Removed from Wishlist", { description: item.title });
                        }}
                        className="absolute top-2 right-2 bg-white/90 hover:bg-red-50 text-gray-400 hover:text-red-600 w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-sm transition cursor-pointer"
                        title="Remove from Wishlist"
                      >
                        🗑️
                      </button>
                    </div>

                    {/* Title & Rating */}
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        {item.category || "Electronics"}
                      </span>
                      <Link
                        href={isOutOfStock ? "#" : `/product/${item.handle}`}
                        className={`font-bold text-sm line-clamp-2 leading-tight transition ${
                          isOutOfStock ? "text-gray-500 cursor-not-allowed" : "text-gray-900 hover:text-emerald-600"
                        }`}
                      >
                        {item.title}
                      </Link>
                      <p className="text-[11px] text-amber-500 font-bold mt-1">
                        ★ {item.rating || 4.5} <span className="text-gray-400 font-normal">(Verified Item)</span>
                      </p>
                    </div>
                  </div>

                  {/* Price & Action Buttons */}
                  <div className="space-y-2.5 pt-3 border-t border-gray-100">
                    {/* Price Row */}
                    <div className="flex items-baseline gap-2">
                      <span className={`text-lg font-black ${isOutOfStock ? "text-gray-500" : "text-gray-900"}`}>
                        ₹{item.price.toLocaleString("en-IN")}
                      </span>
                      {item.compare_at_price && (
                        <span className="text-xs text-gray-400 line-through">
                          ₹{item.compare_at_price.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>

                    {/* 🛒 Move to Cart Button */}
                    <button
                      onClick={() => !isOutOfStock && handleMoveToCart(item)}
                      disabled={isOutOfStock}
                      className={`w-full font-black text-xs py-2.5 rounded-2xl transition flex items-center justify-center gap-1.5 ${
                        isOutOfStock
                          ? "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                          : "bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-emerald-500 text-gray-900 hover:text-emerald-700 cursor-pointer"
                      }`}
                    >
                      {isOutOfStock ? "❌ Out of Stock" : "🛒 Move to Cart"}
                    </button>

                    {/* ⚡ Buy Now & 🗑️ Remove Row */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => !isOutOfStock && handleBuyNow(item)}
                        disabled={isOutOfStock}
                        className={`col-span-2 font-black text-xs py-2.5 rounded-2xl transition shadow-md flex items-center justify-center gap-1.5 ${
                          isOutOfStock
                            ? "bg-gray-200 text-gray-400 shadow-none cursor-not-allowed opacity-60"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 cursor-pointer"
                        }`}
                      >
                        {isOutOfStock ? "Unavailable" : "⚡ Buy Now"}
                      </button>

                      <button
                        onClick={() => {
                          removeFromWishlist(item.id);
                          toast("💔 Removed from Wishlist", { description: item.title });
                        }}
                        className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-extrabold text-xs py-2.5 rounded-2xl transition flex items-center justify-center gap-1 cursor-pointer"
                        title="Remove from Wishlist"
                      >
                        🗑️ Remove
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
}
