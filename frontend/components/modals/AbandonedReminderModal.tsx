"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { getProductImageByTitle, getApiBaseUrl } from "lib/api";

export function AbandonedReminderModal() {
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [reminderData, setReminderData] = useState<any>(null);

  useEffect(() => {
    // Hide modal on admin routes
    if (pathname?.startsWith("/admin")) return;

    checkAbandonedReminder();

    // Poll every 15 seconds to trigger abandoned modal while user browses
    const interval = setInterval(() => {
      checkAbandonedReminder();
    }, 15000);

    return () => clearInterval(interval);
  }, [pathname]);

  const checkAbandonedReminder = async () => {
    if (typeof window === "undefined") return;
    if (pathname?.startsWith("/admin")) return;

    const token = localStorage.getItem("user_token") || localStorage.getItem("skipd_token") || localStorage.getItem("token");
    if (!token) return;

    const snoozedUntil = sessionStorage.getItem("reminder_snoozed_until");
    if (snoozedUntil && Date.now() < Number(snoozedUntil)) {
      return;
    }

    try {
      const apiBase = getApiBaseUrl().replace(/\/+$/, "");
      const res = await fetch(`${apiBase}/abandoned-reminders/active`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) return;

      const data = await res.json();
      if (data.has_abandoned_item && data.product) {
        setReminderData(data);
        setIsOpen(true);
      }
    } catch (e) {
      console.error("Error checking abandoned reminders:", e);
    }
  };

  const handleRemindLater = () => {
    const snoozeTime = Date.now() + 10 * 60 * 1000;
    sessionStorage.setItem("reminder_snoozed_until", snoozeTime.toString());
    setIsOpen(false);
  };

  const handleBuyNow = () => {
    setIsOpen(false);
    if (reminderData?.product?.handle) {
      router.push(`/product/${reminderData.product.handle}`);
    } else {
      router.push("/cart");
    }
  };

  const handleRemoveItem = async () => {
    // Instantly close modal and clear state for zero UI lag
    setIsOpen(false);
    setRemoving(false);

    if (typeof window !== "undefined") {
      const snoozeTime = Date.now() + 24 * 60 * 60 * 1000;
      sessionStorage.setItem("reminder_snoozed_until", snoozeTime.toString());
    }

    const currentItem = reminderData;
    setReminderData(null);

    const token = typeof window !== "undefined"
      ? (localStorage.getItem("user_token") || localStorage.getItem("skipd_token") || localStorage.getItem("token"))
      : null;

    if (currentItem) {
      try {
        const apiBase = getApiBaseUrl().replace(/\/+$/, "");
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        await fetch(`${apiBase}/abandoned-reminders/remove`, {
          method: "DELETE",
          headers,
          body: JSON.stringify({
            item_id: currentItem.item_id,
            item_type: currentItem.item_type
          })
        });
      } catch (e) {
        console.warn("Background item removal error:", e);
      }
    }
  };

  if (pathname?.startsWith("/admin") || !isOpen || !reminderData || !reminderData.product) {
    return null;
  }

  const { product, item_type } = reminderData;
  const isCart = item_type === "cart";
  const imgUrl = product.image || getProductImageByTitle(product.title);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-950 to-indigo-950 border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-5 text-white overflow-hidden">
        
        {/* Subtle Decorative Background Glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header Badge */}
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
            isCart
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
          }`}>
            {isCart ? "🛒 Abandoned Cart Item" : "❤️ Saved in Wishlist"}
          </span>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
            Added &gt; 1 Min Ago
          </span>
        </div>

        {/* Title Message */}
        <div className="space-y-1">
          <h3 className="text-lg font-black text-white leading-snug">
            {isCart ? "Still Thinking About This Item?" : "Your Favorite Wishlist Item is Waiting!"}
          </h3>
          <p className="text-xs text-slate-300 leading-normal">
            {isCart
              ? "You added this to your cart a minute ago. Stocks are moving fast — grab yours now!"
              : "Don't let your favorite item sell out! Complete your order before it's gone."}
          </p>
        </div>

        {/* Product Card Row */}
        <div className="flex items-center gap-4 bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl">
          <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
            <Image
              src={imgUrl}
              alt={product.title}
              fill
              className="object-cover"
            />
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              {product.category}
            </p>
            <h4 className="font-extrabold text-white text-xs truncate">
              {product.title}
            </h4>
            <div className="flex items-baseline gap-2 pt-0.5">
              <span className="text-sm font-black text-emerald-400">
                ₹{product.price?.toLocaleString("en-IN")}
              </span>
              {product.compare_at_price > product.price && (
                <span className="text-[11px] text-slate-500 line-through font-bold">
                  ₹{product.compare_at_price?.toLocaleString("en-IN")}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleBuyNow}
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>⚡ Buy Now</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleRemindLater}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              ⏰ Remind Me Later
            </button>

            <button
              onClick={handleRemoveItem}
              disabled={removing}
              className="py-2.5 px-3 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/50 text-rose-300 font-bold text-xs rounded-xl transition cursor-pointer disabled:opacity-50"
            >
              {removing ? "Removing..." : `🗑️ Remove from ${isCart ? "Cart" : "Wishlist"}`}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
