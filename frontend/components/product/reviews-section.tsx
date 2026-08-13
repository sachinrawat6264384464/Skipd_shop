"use client";

import { useState } from "react";

export function CustomerReviewsSection() {
  const [reviews, setReviews] = useState([
    {
      id: 1,
      author: "Vikram Malhotra",
      rating: 5,
      date: "2 days ago",
      verified: true,
      comment: "Absolutely top tier quality! The cotton density feels super premium and heavy. Fits perfectly oversized.",
      likes: 18,
      image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400"
    },
    {
      id: 2,
      author: "Ananya Sharma",
      rating: 5,
      date: "1 week ago",
      verified: true,
      comment: "Delivered in 2 days in Delhi via BlueDart! Packaging was ultra sleek and clean. 10/10 recommended.",
      likes: 12,
      image: null
    }
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({ author: "", comment: "", rating: 5 });

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.author || !newReview.comment) return;

    setReviews([
      {
        id: Date.now(),
        author: newReview.author,
        rating: newReview.rating,
        date: "Just now",
        verified: true,
        comment: newReview.comment,
        likes: 0,
        image: null
      },
      ...reviews
    ]);

    setModalOpen(false);
    setNewReview({ author: "", comment: "", rating: 5 });
  };

  return (
    <div className="my-8 pt-8 border-t border-gray-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h3 className="text-2xl font-black text-gray-900">Verified Customer Reviews</h3>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex text-amber-500 text-lg">★★★★★</div>
            <span className="text-sm font-bold text-gray-900">4.9 out of 5</span>
            <span className="text-xs text-gray-500">(Based on 148 verified buyers)</span>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="bg-gray-900 hover:bg-black text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-xs"
        >
          ✍️ Write a Review
        </button>
      </div>

      {/* Reviews List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map((rev) => (
          <div key={rev.id} className="bg-white border border-gray-200 p-6 rounded-2xl flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="font-bold text-sm text-gray-900">{rev.author}</h5>
                    {rev.verified && (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                        ✓ Verified Buyer
                      </span>
                    )}
                  </div>
                  <div className="text-amber-500 text-xs mt-0.5">{"★".repeat(rev.rating)}</div>
                </div>
                <span className="text-xs text-gray-400">{rev.date}</span>
              </div>

              <p className="text-xs text-gray-700 mt-2 leading-relaxed font-medium">{rev.comment}</p>

              {rev.image && (
                <img
                  src={rev.image}
                  alt="Customer Review"
                  className="w-16 h-16 object-cover rounded-xl mt-3 border border-gray-200 shadow-xs"
                />
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
              <span>Was this review helpful?</span>
              <button className="hover:text-emerald-600 font-bold transition flex items-center gap-1">
                👍 Helpful ({rev.likes})
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Submit Review Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 p-6 rounded-3xl max-w-md w-full shadow-2xl">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Write a Customer Review</h4>
            <form onSubmit={handleAddReview} className="space-y-4 text-xs">
              <div>
                <label className="text-gray-700 block mb-1 font-semibold">Your Name</label>
                <input
                  type="text"
                  value={newReview.author}
                  onChange={(e) => setNewReview({ ...newReview, author: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-gray-900 focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-gray-700 block mb-1 font-semibold">Star Rating</label>
                <select
                  value={newReview.rating}
                  onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-gray-900 focus:border-emerald-500 focus:outline-none"
                >
                  <option value={5}>★★★★★ (5/5 Stars - Excellent)</option>
                  <option value={4}>★★★★☆ (4/5 Stars - Good)</option>
                  <option value={3}>★★★☆☆ (3/5 Stars - Average)</option>
                </select>
              </div>

              <div>
                <label className="text-gray-700 block mb-1 font-semibold">Your Feedback</label>
                <textarea
                  rows={3}
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-gray-900 focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl transition shadow-sm"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
