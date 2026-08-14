"use client";

import { useWishlist } from "components/wishlist/wishlist-context";
import { useCart } from "components/cart/cart-context";
import Link from "next/link";
import Footer from "components/layout/footer";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addCartItem } = useCart();

  const handleMoveToCart = (item: any) => {
    // Add item to cart
    addCartItem(item.id.toString(), 1);
    
    // Remove from wishlist
    removeFromWishlist(item.id);

    // Also update guest/user cart storage
    try {
      const stored = localStorage.getItem("skipd_user_cart") || sessionStorage.getItem("skipd_guest_cart");
      let items = stored ? JSON.parse(stored) : [];
      const existing = items.find((i: any) => i.id === item.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        items.push({
          id: item.id,
          handle: item.handle,
          title: item.title,
          price: item.price,
          quantity: 1,
          image: item.image
        });
      }
      localStorage.setItem("skipd_user_cart", JSON.stringify(items));
      sessionStorage.setItem("skipd_guest_cart", JSON.stringify(items));
    } catch (e) {}

    alert(`🎉 "${item.title}" has been moved to your Shopping Cart!`);
  };

  return (
    <div className="bg-[#FAFAFA] text-gray-900 min-h-screen flex flex-col justify-between">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 w-full">
        
        {/* Page Header */}
        <div className="border-b border-gray-200 pb-4 flex justify-between items-center flex-wrap gap-4">
          <div>
            <span className="bg-rose-100 text-rose-800 border border-rose-300 font-extrabold text-[10px] uppercase px-3 py-1 rounded-full tracking-wider">
              ❤️ YOUR SAVED WISHLIST
            </span>
            <h1 className="text-3xl font-black text-gray-900 mt-2">Saved Favorite Items ({wishlist.length})</h1>
            <p className="text-xs text-gray-500 mt-1">Items saved here remain stored across sessions. Move them to cart with 1 click.</p>
          </div>

          <Link href="/search" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline">
            + Continue Shopping &rsaquo;
          </Link>
        </div>

        {/* Wishlist Grid */}
        {wishlist.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto shadow-xs">
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-4xl mx-auto border border-rose-200">
              ❤️
            </div>
            <h2 className="text-xl font-black text-gray-900">Your Wishlist is Empty</h2>
            <p className="text-xs text-gray-500">Explore our catalog and click the heart icon on any product to save it here!</p>
            <Link
              href="/search"
              className="inline-block bg-gray-900 hover:bg-black text-white font-extrabold text-xs px-6 py-3 rounded-2xl transition cursor-pointer"
            >
              Explore Products Catalog →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map((item) => {
              const discountPercent = item.compare_at_price
                ? Math.round(((item.compare_at_price - item.price) / item.compare_at_price) * 100)
                : 25;

              return (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4 group hover:shadow-md transition"
                >
                  <div className="space-y-3">
                    {/* Thumbnail Image Container */}
                    <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden p-3 border border-gray-100">
                      <Link href={`/product/${item.handle}`}>
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-contain group-hover:scale-105 transition duration-300"
                        />
                      </Link>
                      
                      <span className="absolute top-2 left-2 bg-red-600 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase">
                        -{discountPercent}%
                      </span>

                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="absolute top-2 right-2 bg-white/90 hover:bg-red-50 text-gray-400 hover:text-red-600 w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-sm transition cursor-pointer"
                        title="Remove from Wishlist"
                      >
                        🗑️
                      </button>
                    </div>

                    {/* Category & Title */}
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        {item.category || "Electronics"}
                      </span>
                      <Link
                        href={`/product/${item.handle}`}
                        className="font-bold text-sm text-gray-900 line-clamp-2 leading-tight hover:text-emerald-600 transition"
                      >
                        {item.title}
                      </Link>
                      <p className="text-[11px] text-amber-500 font-bold mt-1">★ {item.rating || 4.5} (Verified Item)</p>
                    </div>
                  </div>

                  {/* Price & 1-Click Move to Cart Action */}
                  <div className="space-y-3 pt-3 border-t border-gray-100">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-black text-gray-900">₹{item.price.toLocaleString("en-IN")}.00</span>
                      {item.compare_at_price && (
                        <span className="text-xs text-gray-400 line-through">₹{item.compare_at_price.toLocaleString("en-IN")}.00</span>
                      )}
                    </div>

                    <button
                      onClick={() => handleMoveToCart(item)}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs py-3 rounded-2xl transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      🛒 1-Click Move to Cart
                    </button>
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
