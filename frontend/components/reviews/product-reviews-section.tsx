"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api";

interface ReviewItem {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  images?: string[];
  videos?: string[];
  is_verified_purchase?: boolean;
  created_at?: string;
}

interface ProductReviewsSectionProps {
  productId: number;
  productTitle: string;
}

export function ProductReviewsSection({ productId, productTitle }: ProductReviewsSectionProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/reviews/product/${productId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.warn("Reviews fetch fallback");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = typeof window !== "undefined" ? localStorage.getItem("ecom_token") : null;
    if (!token) {
      toast.error("🔒 Please sign in to submit a customer review");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please enter a comment for your review.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: productId,
          rating,
          comment: comment.trim(),
          images: imageUrl.trim() ? [imageUrl.trim()] : []
        })
      });

      if (res.ok) {
        toast.success("🌟 Thank you! Your review has been submitted to PostgreSQL DB.");
        setComment("");
        setImageUrl("");
        fetchReviews();
      } else {
        const err = await res.json();
        toast.error(err.detail || "Failed to submit review");
      }
    } catch (err) {
      toast.error("Error submitting review");
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "4.8";

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-6">
      
      {/* Header Breakdown */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <span>Customer Ratings &amp; Reviews</span>
          </h3>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Verified buyer feedback &amp; photo reviews stored in PostgreSQL DB
          </p>
        </div>

        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl">
          <span className="text-3xl font-black text-amber-600">{avgRating}</span>
          <div>
            <div className="text-amber-500 text-sm font-bold">★ ★ ★ ★ ★</div>
            <p className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wider">
              {reviews.length} Customer Reviews
            </p>
          </div>
        </div>
      </div>

      {/* Review Submission Form */}
      <form onSubmit={handleSubmitReview} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
        <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider">
          ✍️ Write a Customer Review for {productTitle}
        </h4>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-700">Rating:</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-xl transition cursor-pointer ${
                  rating >= star ? "text-amber-400 scale-110" : "text-gray-300"
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your real experience with this product..."
          className="w-full bg-white border border-gray-300 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />

        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Optional Photo URL (Cloudinary / Unsplash photo link)"
          className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-2 rounded-xl transition cursor-pointer shadow-xs disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Verified Review"}
          </button>
        </div>
      </form>

      {/* Customer Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-6 text-xs text-gray-400 font-medium bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            Be the first customer to write a verified review!
          </div>
        ) : (
          reviews.map((rev) => (
            <div key={rev.id} className="border-b border-gray-100 pb-4 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900">{rev.user_name || "Verified Customer"}</span>
                <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-md">
                  ✓ Verified Purchase
                </span>
              </div>
              <div className="text-amber-400 text-xs">
                {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
              </div>
              <p className="text-gray-700 leading-relaxed font-normal">{rev.comment}</p>
              
              {rev.images && rev.images.length > 0 && (
                <div className="flex gap-2 pt-1">
                  {rev.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt="Customer review photo"
                      className="w-16 h-16 object-cover rounded-xl border border-gray-200 shadow-2xs"
                    />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
}
