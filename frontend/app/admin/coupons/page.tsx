"use client";

import { useState } from "react";

export default function AdminCouponsPage() {
  const [coupons] = useState([
    { id: 1, code: "FREEDOM50", discount: "50% OFF", maxDiscount: "₹500", minOrder: "₹999", uses: "1,245 uses", status: "Active" },
    { id: 2, code: "WELCOME100", discount: "₹100 OFF", maxDiscount: "₹100", minOrder: "₹499", uses: "3,450 uses", status: "Active" },
    { id: 3, code: "SUMMER60", discount: "60% OFF", maxDiscount: "₹1000", minOrder: "₹1999", uses: "560 uses", status: "Active" }
  ]);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full text-gray-900 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs">
        <div>
          <h1 className="text-2xl font-black text-gray-900">🎟️ Coupons &amp; Discount Code Manager</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Create promo codes, set percentage or fixed discounts, minimum cart value &amp; usage limits</p>
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-3 rounded-xl transition shadow-xs cursor-pointer">
          + Create Coupon Code
        </button>
      </div>

      <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="px-6 py-4">Coupon Code</th>
                <th className="px-6 py-4">Discount Type</th>
                <th className="px-6 py-4">Max Cap</th>
                <th className="px-6 py-4">Min Spend</th>
                <th className="px-6 py-4">Total Uses</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-black text-emerald-700 font-mono text-sm">{c.code}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{c.discount}</td>
                  <td className="px-6 py-4 font-bold text-gray-700">{c.maxDiscount}</td>
                  <td className="px-6 py-4 text-gray-500">{c.minOrder}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{c.uses}</td>
                  <td className="px-6 py-4">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded uppercase">
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
