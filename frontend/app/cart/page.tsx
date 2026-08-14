"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Footer from "components/layout/footer";
import { BuyNowButton } from "components/auth/buy-now-button";

const INITIAL_CART_ITEMS = [
  {
    id: 1,
    title: "OnePlus Nord 4 5G (Obsidian Midnight, 12GB RAM, 256GB Storage)",
    rating: "4.5",
    reviews: "2,356",
    seller: "SKIPD Official",
    specs: ["Snapdragon 7+ Gen 3", "50MP Sony Camera", "5500mAh Battery"],
    delivery: "Delivery by 28 May, 2026 | Free Delivery",
    originalPrice: 32999,
    price: 29999,
    savings: 3000,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500",
    selected: true
  },
  {
    id: 2,
    title: "boAt Rockerz 450 Pro Bluetooth Wireless Headphones",
    rating: "4.4",
    reviews: "1,892",
    seller: "SV Store",
    specs: ["Upto 70H Playtime", "Fast Charge", "Bluetooth 5.3"],
    delivery: "Delivery by 26 May, 2026 | Free Delivery",
    originalPrice: 2999,
    price: 1799,
    savings: 1200,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
    selected: true
  }
];

import { getUserCartKey } from "lib/utils";

export default function CartItemsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const loadUserCart = () => {
    const token = localStorage.getItem("skipd_token");
    const user = localStorage.getItem("skipd_user");
    const loggedIn = !!(token || user);
    setIsLoggedIn(loggedIn);

    const cartKey = getUserCartKey();
    const savedCart = localStorage.getItem(cartKey);

    if (savedCart !== null) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        setItems([]);
      }
    } else {
      // New logged-in user starts with a clean empty cart (0 items from other users!)
      const initial = loggedIn ? [] : INITIAL_CART_ITEMS;
      setItems(initial);
      localStorage.setItem(cartKey, JSON.stringify(initial));
    }
  };

  useEffect(() => {
    loadUserCart();

    window.addEventListener("skipd_auth_changed", loadUserCart);
    window.addEventListener("skipd_cart_updated", loadUserCart);
    return () => {
      window.removeEventListener("skipd_auth_changed", loadUserCart);
      window.removeEventListener("skipd_cart_updated", loadUserCart);
    };
  }, []);

  const saveCartState = (newItems: any[]) => {
    setItems(newItems);
    const cartKey = getUserCartKey();
    localStorage.setItem(cartKey, JSON.stringify(newItems));
    window.dispatchEvent(new Event("skipd_cart_updated"));
  };

  const updateQty = (id: number, delta: number) => {
    const updated = items.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item);
    saveCartState(updated);
  };

  const removeItem = (id: number) => {
    const updated = items.filter(item => item.id !== id);
    saveCartState(updated);
  };

  const clearAll = () => {
    saveCartState([]);
  };

  const selectedItems = items.filter(i => i.selected);
  const subtotal = selectedItems.reduce((acc, item) => acc + (item.originalPrice * item.quantity), 0);
  const totalDiscount = selectedItems.reduce((acc, item) => acc + (item.savings * item.quantity), 0);
  const finalTotal = selectedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="bg-[#FAFAFA] text-gray-900 min-h-screen flex flex-col justify-between">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 w-full">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900">Cart Items</h1>
            <p className="text-xs font-bold text-emerald-700 mt-1">{selectedItems.length} Items in your cart</p>
          </div>
          {/* 🗑️ Remove All Button: Only visible when user IS LOGGED IN */}
          {items.length > 0 && isLoggedIn && (
            <button
              onClick={clearAll}
              className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              🗑️ Remove all
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center space-y-4">
            <div className="text-5xl">🛒</div>
            <h3 className="text-xl font-black text-gray-900">Your cart is currently empty</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Explore our best-selling electronics, fashion, and accessories to add items to your cart!
            </p>
            <Link
              href="/search"
              className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-xs"
            >
              Explore Store &rarr;
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs space-y-4 relative">
                  
                  <div className="flex gap-4 items-start">
                    
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={(e) => setItems(items.map(i => i.id === item.id ? { ...i, selected: e.target.checked } : i))}
                      className="mt-2 w-4 h-4 accent-emerald-600 rounded cursor-pointer shrink-0"
                    />

                    {/* Product Image */}
                    <div className="relative w-24 h-24 bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 shrink-0">
                      <Image src={item.image} alt={item.title} fill className="object-contain p-2" />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 space-y-2 text-xs">
                      <div>
                        <h3 className="font-bold text-sm text-gray-900 leading-snug">{item.title}</h3>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          <span className="text-amber-500 font-bold">★ {item.rating}</span> ({item.reviews} reviews) | Sold by <span className="font-bold text-gray-800">{item.seller}</span>
                        </p>
                      </div>

                      {/* Specs Badges */}
                      {item.specs && item.specs.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {item.specs.map((spec: string, sIdx: number) => (
                            <span key={sIdx} className="bg-gray-100 border border-gray-200 text-gray-700 text-[10px] font-semibold px-2.5 py-0.5 rounded-lg">
                              {spec}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Delivery */}
                      <p className="text-[11px] text-emerald-700 font-medium pt-1">
                        🚚 {item.delivery}
                      </p>
                    </div>

                    {/* Right Price Column */}
                    <div className="text-right shrink-0 text-xs">
                      <span className="text-gray-400 line-through block text-[11px]">₹{item.originalPrice.toLocaleString("en-IN")}.00</span>
                      <span className="text-lg font-black text-gray-900 block">₹{item.price.toLocaleString("en-IN")}.00</span>
                      <span className="text-[11px] text-emerald-600 font-bold block">You save ₹{item.savings.toLocaleString("en-IN")}.00</span>
                    </div>

                  </div>

                  {/* Footer Action Bar: Quantity & Actions */}
                  <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs">
                    
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 font-black text-gray-700 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 font-bold text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 font-black text-gray-700 cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    {/* Save For Later & Remove Links */}
                    <div className="flex items-center gap-4 font-bold text-[11px]">
                      <button className="text-gray-600 hover:text-black cursor-pointer">
                        Save for later
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>

                  </div>

                </div>
              ))}
            </div>

            {/* Right Column: Order Summary Card */}
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs space-y-4 sticky top-24">
                <h2 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3">Order Summary</h2>

                <div className="space-y-3 text-xs text-gray-600">
                  <div className="flex justify-between font-medium">
                    <span>Subtotal ({selectedItems.length} items)</span>
                    <span className="text-gray-900 font-bold">₹{subtotal.toLocaleString("en-IN")}.00</span>
                  </div>

                  <div className="flex justify-between font-medium">
                    <span>Discount</span>
                    <span className="text-emerald-600 font-bold">-₹{totalDiscount.toLocaleString("en-IN")}.00</span>
                  </div>

                  <div className="flex justify-between font-medium">
                    <span>Delivery Charges</span>
                    <span className="text-emerald-600 font-bold">FREE</span>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-gray-900">Total (Incl. of all taxes)</span>
                    <span className="text-2xl font-black text-gray-900">₹{finalTotal.toLocaleString("en-IN")}.00</span>
                  </div>

                  {totalDiscount > 0 && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl text-[11px] font-bold flex items-center gap-2">
                      <span>🏷️</span>
                      <span>You will save ₹{totalDiscount.toLocaleString("en-IN")}.00 on this order</span>
                    </div>
                  )}
                </div>

                <BuyNowButton
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm py-4 rounded-2xl transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 text-center cursor-pointer"
                >
                  Proceed to Checkout &rarr;
                </BuyNowButton>

                <p className="text-[11px] text-gray-500 text-center flex items-center justify-center gap-1.5 pt-1 font-medium">
                  <span>🛡️</span> 100% Safe &amp; Secure Payments
                </p>
              </div>
            </div>

          </div>
        )}

        {/* 🛍️ Recommended Products Section (You Might Also Like) */}
        <div className="pt-8 border-t border-gray-200 space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-2">
                <span>You Might Also Like</span>
                <span className="text-emerald-600">🛍️</span>
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-1">Handpicked recommendations based on your cart items</p>
            </div>
            <Link href="/search" className="text-xs text-emerald-700 font-extrabold hover:underline">
              View All Products &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                id: 101,
                title: "Minimalist Oversized Graphic Tee",
                price: 1299,
                originalPrice: 1999,
                rating: "4.8",
                reviews: "1,420",
                image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500",
                handle: "minimalist-graphic-tee",
                tag: "Bestseller"
              },
              {
                id: 102,
                title: "Matte Black Chrono Leather Watch",
                price: 3499,
                originalPrice: 5499,
                rating: "4.9",
                reviews: "890",
                image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
                handle: "matte-black-chrono-watch",
                tag: "Trending"
              },
              {
                id: 103,
                title: "RC 4K Camera Pro Foldable Toy Drone",
                price: 2499,
                originalPrice: 4999,
                rating: "4.7",
                reviews: "530",
                image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=500",
                handle: "rc-4k-toy-drone",
                tag: "50% OFF"
              },
              {
                id: 104,
                title: "Studio-Grade ANC Wireless Headphones",
                price: 4999,
                originalPrice: 7999,
                rating: "4.9",
                reviews: "2,100",
                image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500",
                handle: "active-anc-headphones",
                tag: "Hot Deal"
              }
            ].map((rec) => (
              <div key={rec.id} className="bg-white border border-gray-200 rounded-3xl p-4 flex flex-col justify-between shadow-2xs hover:shadow-md transition group">
                
                {/* 🔗 Clickable Image & Product Info */}
                <Link href={`/product/${rec.handle}`} className="space-y-3 block">
                  <div className="relative h-44 w-full overflow-hidden rounded-2xl bg-gray-50 border border-gray-100">
                    <img
                      src={rec.image}
                      alt={rec.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <span className="absolute top-2.5 left-2.5 bg-gray-900 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-md shadow-xs">
                      {rec.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-xs text-gray-900 line-clamp-1 group-hover:text-emerald-700 transition">
                      {rec.title}
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      <span className="text-amber-500 font-bold">★ {rec.rating}</span> ({rec.reviews})
                    </p>
                  </div>
                </Link>

                {/* 💰 Price & Action Buttons (+ Add & Buy Now) */}
                <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div>
                    <p className="font-black text-sm text-gray-900">₹{rec.price.toLocaleString("en-IN")}</p>
                    <p className="text-[10px] text-gray-400 line-through">₹{rec.originalPrice.toLocaleString("en-IN")}</p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newItem = {
                          id: rec.id,
                          title: rec.title,
                          rating: rec.rating,
                          reviews: rec.reviews,
                          seller: "SKIPD Partner",
                          specs: ["Official Warranty", "Verified Quality"],
                          delivery: "Delivery in 2 days | Free",
                          originalPrice: rec.originalPrice,
                          price: rec.price,
                          savings: rec.originalPrice - rec.price,
                          quantity: 1,
                          image: rec.image,
                          selected: true
                        };
                        saveCartState([...items, newItem]);
                      }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-extrabold text-[11px] px-2.5 py-1.5 rounded-xl transition cursor-pointer"
                      title="Add to Cart"
                    >
                      + Add
                    </button>

                    <BuyNowButton
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] px-3 py-1.5 rounded-xl transition shadow-xs cursor-pointer"
                    >
                      Buy Now
                    </BuyNowButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
}
