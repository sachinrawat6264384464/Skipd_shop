"use client";

import { useState } from "react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api";

interface CouponBoxProps {
  subtotal: number;
  onApplyDiscount: (discountAmount: number, couponCode: string) => void;
  onRemoveCoupon: () => void;
  appliedCode?: string;
  appliedDiscount?: number;
}

export function CouponBox({
  subtotal,
  onApplyDiscount,
  onRemoveCoupon,
  appliedCode,
  appliedDiscount = 0
}: CouponBoxProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), subtotal })
      });

      const data = await res.json();
      if (res.ok && data.valid) {
        onApplyDiscount(data.discount_amount, data.code);
        toast.success(`🎉 Coupon ${data.code} Applied!`, {
          description: `You saved ₹${data.discount_amount.toLocaleString("en-IN")}.00 on this order!`
        });
        setCode("");
      } else {
        toast.error("🚫 Coupon Error", {
          description: data.detail || "Invalid promo coupon code."
        });
      }
    } catch (err) {
      toast.error("Failed to validate coupon");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-emerald-50/50 border border-emerald-200/70 rounded-2xl p-3.5 space-y-2 text-xs">
      <div className="flex justify-between items-center">
        <span className="font-extrabold text-emerald-900 flex items-center gap-1">
          <span>🎁 Have a Promo Coupon Code?</span>
        </span>
        <span className="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-100 px-2 py-0.5 rounded-full">
          Live Offers
        </span>
      </div>

      {appliedCode ? (
        <div className="flex items-center justify-between bg-white border border-emerald-300 p-2.5 rounded-xl shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-600 text-white font-black text-[10px] px-2 py-0.5 rounded">
              ✓ {appliedCode}
            </span>
            <span className="font-bold text-emerald-800 text-xs">
              Saved ₹{appliedDiscount.toLocaleString("en-IN")}.00
            </span>
          </div>
          <button
            type="button"
            onClick={onRemoveCoupon}
            className="text-red-600 font-bold hover:underline text-[11px] cursor-pointer"
          >
            Remove ✕
          </button>
        </div>
      ) : (
        <form onSubmit={handleApply} className="flex gap-2 pt-1">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Try WELCOME500 or FLAT20"
            className="flex-1 bg-white border border-emerald-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 uppercase placeholder:normal-case placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 py-2 rounded-xl transition cursor-pointer disabled:opacity-50"
          >
            {loading ? "..." : "Apply"}
          </button>
        </form>
      )}

      {/* Available Coupon Hints */}
      <div className="flex flex-wrap gap-1.5 pt-1 text-[10px]">
        <button
          type="button"
          onClick={() => setCode("WELCOME500")}
          className="bg-white hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 px-2 py-0.5 rounded-md cursor-pointer transition"
        >
          🏷️ WELCOME500 (₹500 Off)
        </button>
        <button
          type="button"
          onClick={() => setCode("FLAT20")}
          className="bg-white hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 px-2 py-0.5 rounded-md cursor-pointer transition"
        >
          🏷️ FLAT20 (20% Off)
        </button>
      </div>
    </div>
  );
}
