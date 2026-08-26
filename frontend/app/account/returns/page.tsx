"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getApiBaseUrl } from "lib/api";
import { toast } from "sonner";

interface ReturnItem {
  id: number;
  order_id: number;
  product_title: string;
  product_image: string;
  reason: string;
  comments: string;
  images: string[];
  status: string;
  created_at: string;
}

export default function ReturnsPage() {
  const [returnRequests, setReturnRequests] = useState<ReturnItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [orderIdInput, setOrderIdInput] = useState("");
  const [reasonInput, setReasonInput] = useState("Defective or Damaged Item");
  const [commentsInput, setCommentsInput] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  useEffect(() => {
    fetchMyReturns();
  }, []);

  const fetchMyReturns = async () => {
    const token = typeof window !== "undefined"
      ? (localStorage.getItem("user_token") || localStorage.getItem("ecom_token") || localStorage.getItem("token"))
      : null;
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const apiBase = getApiBaseUrl().replace(/\/+$/, "");
      const res = await fetch(`${apiBase}/returns/my-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReturnRequests(data.returns || []);
      }
    } catch (e) {
      console.error("Error fetching return requests:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = () => {
    if (!imageUrlInput.trim()) return;
    setUploadedImages([...uploadedImages, imageUrlInput.trim()]);
    setImageUrlInput("");
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderIdInput.trim()) {
      toast.error("Please enter a valid Order ID");
      return;
    }

    const token = typeof window !== "undefined"
      ? (localStorage.getItem("user_token") || localStorage.getItem("ecom_token") || localStorage.getItem("token"))
      : null;
    if (!token) {
      toast.error("Please sign in to submit a return request");
      return;
    }

    setSubmitting(true);
    try {
      const apiBase = getApiBaseUrl().replace(/\/+$/, "");
      const res = await fetch(`${apiBase}/returns/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          order_id: Number(orderIdInput.replace(/\D/g, "")),
          reason: reasonInput,
          comments: commentsInput,
          images: uploadedImages
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("📦 Return/Replacement Request Submitted!", {
          description: "Our quality team will review and approve your pickup within 24 hours."
        });
        setOrderIdInput("");
        setCommentsInput("");
        setUploadedImages([]);
        fetchMyReturns();
      } else {
        toast.error(data.detail || "Failed to submit return request");
      }
    } catch (e) {
      toast.error("Network error submitting return request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 font-sans">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <span className="inline-block bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-extrabold text-[10px] uppercase px-3 py-1 rounded-full mb-2">
            7-Day Replacement Guarantee
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Order Returns &amp; Replacements</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Request a 100% free doorstep pickup and replacement or refund for items delivered within the last 7 days.
          </p>
        </div>

        <Link
          href="/orders"
          className="bg-white hover:bg-gray-100 text-slate-900 font-black text-xs px-5 py-3 rounded-2xl transition shadow-md shrink-0"
        >
          View My Orders &rsaquo;
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left 5-col: Submit Return Request Form */}
        <div className="lg:col-span-5 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="font-black text-gray-900 text-base">Submit Return Request</h3>
            <p className="text-xs text-gray-500">Fill in your order details and reason for replacement.</p>
          </div>

          <form onSubmit={handleSubmitReturn} className="space-y-4 text-xs">
            <div>
              <label className="block font-extrabold text-gray-800 mb-1">Order ID / Order Number</label>
              <input
                type="text"
                required
                placeholder="e.g. 101 or E-COM-101"
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 font-semibold text-gray-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-extrabold text-gray-800 mb-1">Return / Replacement Reason</label>
              <select
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 font-semibold text-gray-900 focus:outline-none focus:border-emerald-500"
              >
                <option>Defective or Damaged Item</option>
                <option>Size / Fit Issue</option>
                <option>Item Received Differs from Description</option>
                <option>Missing Accessories in Box</option>
                <option>Changed Mind / No Longer Needed</option>
              </select>
            </div>

            <div>
              <label className="block font-extrabold text-gray-800 mb-1">Detailed Description (Optional)</label>
              <textarea
                rows={3}
                placeholder="Describe the issue with your order..."
                value={commentsInput}
                onChange={(e) => setCommentsInput(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 font-semibold text-gray-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-extrabold text-gray-800 mb-1">Attach Photo Proof (Optional Image Link)</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2 font-medium text-gray-900 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="bg-gray-900 hover:bg-gray-800 text-white font-bold px-3 py-2 rounded-xl transition"
                >
                  + Add
                </button>
              </div>

              {uploadedImages.length > 0 && (
                <div className="flex items-center gap-2 pt-2 flex-wrap">
                  {uploadedImages.map((img, idx) => (
                    <img key={idx} src={img} alt="Proof" className="w-12 h-12 object-cover rounded-lg border border-gray-300" />
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black py-3 rounded-2xl transition shadow-md shadow-emerald-600/30 uppercase tracking-wider text-xs cursor-pointer disabled:opacity-50"
            >
              {submitting ? "Submitting Request..." : "Submit Return Request"}
            </button>
          </form>
        </div>

        {/* Right 7-col: My Return Requests Status History */}
        <div className="lg:col-span-7 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
            <h3 className="font-black text-gray-900 text-base">My Return Requests</h3>
            <span className="text-xs font-bold text-gray-500">{returnRequests.length} Total</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-400 font-medium text-xs">
              Loading your return requests...
            </div>
          ) : returnRequests.length === 0 ? (
            <div className="p-8 text-center text-gray-400 font-medium text-xs space-y-2">
              <span className="text-3xl block">📦</span>
              <p className="font-bold text-gray-700">No active return requests found</p>
              <p className="text-gray-500">If you received a defective item, submit a request on the left.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {returnRequests.map((req) => (
                <div
                  key={req.id}
                  className="border border-gray-200 rounded-2xl p-4 space-y-3 bg-gray-50/50 hover:bg-white transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md uppercase">
                        Request #{req.id}
                      </span>
                      <span className="text-xs font-bold text-gray-900 ml-2">Order #{req.order_id}</span>
                    </div>

                    <span className={`font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider ${
                      req.status === "Approved" ? "bg-emerald-500 text-white" :
                      req.status === "Rejected" ? "bg-red-600 text-white" : "bg-amber-100 text-amber-800 border border-amber-300"
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <img src={req.product_image} alt="Product" className="w-12 h-12 object-cover rounded-xl border border-gray-200" />
                    <div>
                      <h4 className="font-bold text-gray-900 text-xs">{req.product_title}</h4>
                      <p className="text-[11px] text-gray-600 font-medium">Reason: {req.reason}</p>
                    </div>
                  </div>

                  {/* Status Timeline Progress */}
                  <div className="pt-2 border-t border-gray-200/80 flex items-center justify-between text-[10px] font-extrabold text-gray-500">
                    <span className="text-emerald-600">✓ Submitted</span>
                    <span>&rsaquo;</span>
                    <span className={req.status === "Approved" || req.status === "Completed" ? "text-emerald-600" : ""}>
                      Inspection &amp; Pickup
                    </span>
                    <span>&rsaquo;</span>
                    <span className={req.status === "Completed" ? "text-emerald-600" : ""}>
                      Refund / Replacement
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
