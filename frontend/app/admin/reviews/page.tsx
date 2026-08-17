"use client";

import { useState, useEffect } from "react";
import { fetchAdminReviews } from "lib/api";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const data = await fetchAdminReviews();
      setReviews(Array.isArray(data) ? data : []);
    }
    load();
  }, []);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full text-gray-900 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs">
        <div>
          <h1 className="text-2xl font-black text-gray-900">⭐ Customer Reviews &amp; Ratings</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Moderate product feedback, approve customer reviews &amp; respond to customer ratings</p>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-white border border-gray-200/80 p-8 rounded-2xl text-center text-xs text-gray-500 font-bold">
            No customer reviews found in database.
          </div>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-2xs space-y-2">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{r.product_title || r.product || "Product"}</h4>
                  <p className="text-[11px] text-gray-400">By {r.user_name || r.customer || "Customer"} on {r.created_at || r.date || "Today"}</p>
                </div>
                <span className="text-amber-500 font-bold text-xs">{"★".repeat(r.rating || 5)}</span>
              </div>
              <p className="text-xs text-gray-700 font-medium">{r.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
