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

  if (pathname?.startsWith("/admin") || !isOpen || !reminderData) {
    return null;
  }

  const { product, item_type, items: rawItems, total_count } = reminderData;
  const isCart = item_type === "cart";
  const itemsList = Array.isArray(rawItems) && rawItems.length > 0 ? rawItems : (product ? [product] : []);
  const itemCount = total_count || itemsList.length;

  if (itemsList.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-950 to-indigo-950 border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-5 text-white overflow-hidden">
        
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
            {isCart ? `🛒 Abandoned Cart (${itemCount} Items)` : `❤️ Saved in Wishlist (${itemCount} Items)`}
          </span>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
            Saved &gt; 1 Min Ago
          </span>
        </div>

        {/* Title Message */}
        <div className="space-y-1">
          <h3 className="text-lg font-black text-white leading-snug">
            {isCart ? "Items Waiting in Your Cart!" : "Your Saved Wishlist Items are Waiting!"}
          </h3>
          <p className="text-xs text-slate-300 leading-normal">
            You have <strong className="text-emerald-400">{itemCount} item(s)</strong> saved. Stocks are moving fast — finish your purchase before items sell out!
          </p>
        </div>

        {/* Scrollable Products List */}
        <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
          {itemsList.map((item: any, idx: number) => {
            const imgUrl = item.image || getProductImageByTitle(item.title);
            const numId = typeof item.id === "number" ? item.id : (parseInt(String(item.id || "").replace(/[^0-9]/g, "")) || idx);
            const stock = item.stock_quantity ?? (numId % 7 === 0 ? 0 : numId % 3 === 0 ? 3 : 12);

            return (
              <div key={item.item_id || item.id || idx} className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
                <div className="relative w-14 h-14 shrink-0 rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                  <Image
                    src={imgUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300"}
                    alt={item.title || "Product"}
                    fill
                    className="object-contain p-1"
                  />
                </div>

                <div className="space-y-0.5 min-w-0 flex-1">
                  <h4 className="font-extrabold text-white text-xs truncate">
                    {item.title || "Featured Product"}
                  </h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-emerald-400">
                      ₹{Number(item.price || 0).toLocaleString("en-IN")}
                    </span>

                    {/* Stock Status Badge */}
                    {stock > 5 ? (
                      <span className="text-[9px] font-bold text-emerald-300 bg-emerald-950 border border-emerald-800/60 px-1.5 py-0.5 rounded">
                        📦 In Stock ({stock} left)
                      </span>
                    ) : stock > 0 ? (
                      <span className="text-[9px] font-black text-amber-300 bg-amber-950 border border-amber-800/60 px-1.5 py-0.5 rounded animate-pulse">
                        ⚠️ Only {stock} left!
                      </span>
                    ) : (
                      <span className="text-[9px] font-black text-red-300 bg-red-950 border border-red-800/60 px-1.5 py-0.5 rounded">
                        ❌ Out of Stock
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleBuyNow()}
                  className="shrink-0 bg-slate-800 hover:bg-emerald-600 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition cursor-pointer"
                >
                  View
                </button>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleBuyNow}
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>⚡ View All {itemCount} Saved Items &amp; Checkout &rsaquo;</span>
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
              {removing ? "Clearing..." : `🗑️ Dismiss ${isCart ? "Cart" : "Wishlist"}`}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
