"use client";

import { useState } from "react";

export default function AdminReviewsPage() {
  const [reviews] = useState([
    { id: 1, product: "OnePlus Nord 6", customer: "Rahul Sharma", rating: 5, comment: "Amazing battery life and ultra-fast charging!", status: "Approved", date: "May 25, 2026" },
    { id: 2, product: "Saree Premium Silk", customer: "Priya Patel", rating: 5, comment: "Soft genuine silk fabric, very elegant design.", status: "Approved", date: "May 24, 2026" },
    { id: 3, product: "20000mAh Power Bank", customer: "Amit Verma", rating: 4, comment: "Good capacity, slightly heavy to carry.", status: "Approved", date: "May 22, 2026" }
  ]);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full text-gray-900 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs">
        <div>
          <h1 className="text-2xl font-black text-gray-900">⭐ Customer Reviews &amp; Ratings</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Moderate product feedback, approve customer reviews &amp; respond to customer ratings</p>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-2xs space-y-2">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <div>
                <h4 className="font-bold text-gray-900 text-sm">{r.product}</h4>
                <p className="text-[11px] text-gray-400">By {r.customer} on {r.date}</p>
              </div>
              <span className="text-amber-500 font-bold text-xs">{"★".repeat(r.rating)}</span>
            </div>
            <p className="text-xs text-gray-700 font-medium">{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
