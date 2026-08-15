"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function UserReturnsPage() {
  const [returnOrders, setReturnOrders] = useState([
    {
      id: "ORD-984210",
      productName: "OnePlus Nord 6 (8GB + 256GB)",
      price: 44499,
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300",
      orderTimestamp: Date.now() - 3600 * 1000 * 5, // 5 hours ago
      paymentStatus: "PAID",
      status: "ELIGIBLE_FOR_RETURN"
    },
    {
      id: "ORD-984209",
      productName: "Saree Premium Silk",
      price: 598,
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300",
      orderTimestamp: Date.now() - 3600 * 1000 * 20, // 20 hours ago
      paymentStatus: "PAID",
      status: "ELIGIBLE_FOR_RETURN"
    },
    {
      id: "ORD-984205",
      productName: "20000mAh Power Bank",
      price: 999,
      image: "https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=300",
      orderTimestamp: Date.now() - 3600 * 1000 * 30, // 30 hours ago (Expired)
      paymentStatus: "PAID",
      status: "WINDOW_EXPIRED"
    }
  ]);

  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [reason, setReason] = useState("Damaged Item Received");
  const [description, setDescription] = useState("");
  const [contactPhone, setContactPhone] = useState("+91 98765 43210");
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [submittedQueryId, setSubmittedQueryId] = useState<string | null>(null);

  // Time Remaining Counter Helper
  const getRemainingTime = (orderTimestamp: number) => {
    const windowEnd = orderTimestamp + 24 * 3600 * 1000;
    const diff = windowEnd - Date.now();
    if (diff <= 0) return null;

    const hours = Math.floor(diff / (3600 * 1000));
    const minutes = Math.floor((diff % (3600 * 1000)) / (60 * 1000));
    const seconds = Math.floor((diff % (60 * 1000)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const [timers, setTimers] = useState<{ [key: string]: string | null }>({});

  useEffect(() => {
    const interval = setInterval(() => {
      const newTimers: { [key: string]: string | null } = {};
      returnOrders.forEach(o => {
        newTimers[o.id] = getRemainingTime(o.orderTimestamp);
      });
      setTimers(newTimers);
    }, 1000);

    return () => clearInterval(interval);
  }, [returnOrders]);

  const handleSubmitReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const queryId = `Q-${Math.floor(10000 + Math.random() * 90000)}`;
    setSubmittedQueryId(queryId);

    // Update order state to return requested
    setReturnOrders(returnOrders.map(o => o.id === selectedProduct.id ? { ...o, status: "RETURN_REQUESTED" } : o));

    alert(`✓ Return request submitted successfully! Query ID: #${queryId}. Our team will review within 12 hours.`);
    setSelectedProduct(null);
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen py-10 px-4 font-sans text-gray-900">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <Link href="/account" className="hover:underline text-emerald-700 font-bold">My Account</Link>
              <span>/</span>
              <span className="font-bold text-gray-800">Return Products Policy</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900">📦 24-Hour Express Product Return Window</h1>
            <p className="text-xs text-gray-500 mt-1">
              Strict 24-hour return policy starts automatically upon payment completion. Submit return queries with product photos within 24 hours.
            </p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-2xl text-xs font-bold text-emerald-800">
            ⏳ Strict 24h Policy Guarantee
          </div>
        </div>

        {/* Orders List for Return */}
        <div className="space-y-4">
          <h3 className="font-black text-lg text-gray-900">Your Recent Purchases &amp; Eligibility</h3>

          {returnOrders.map((item) => {
            const timeRemaining = timers[item.id] || getRemainingTime(item.orderTimestamp);
            const isEligible = timeRemaining !== null && item.status === "ELIGIBLE_FOR_RETURN";
            const isRequested = item.status === "RETURN_REQUESTED";

            return (
              <div key={item.id} className="bg-white border border-gray-200 p-6 rounded-3xl shadow-xs flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <img src={item.image} alt={item.productName} className="w-20 h-20 rounded-2xl object-cover border border-gray-100 bg-gray-50" />
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                      {item.id} • {item.paymentStatus}
                    </span>
                    <h4 className="font-bold text-gray-900 text-sm">{item.productName}</h4>
                    <p className="font-black text-gray-900 text-sm">₹{item.price.toLocaleString("en-IN")}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto justify-end">
                  {/* Countdown Timer */}
                  <div className="text-center sm:text-right">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">24h Return Window</p>
                    {timeRemaining ? (
                      <p className="text-sm font-black text-emerald-600 font-mono animate-pulse">
                        ⏳ {timeRemaining} remaining
                      </p>
                    ) : (
                      <p className="text-xs font-bold text-red-500">
                        🚫 24h Return Window Expired
                      </p>
                    )}
                  </div>

                  {/* Return Action Button */}
                  {isRequested ? (
                    <span className="bg-blue-100 text-blue-800 text-xs font-black px-4 py-2.5 rounded-2xl border border-blue-200">
                      ✓ Return Request Pending Approval
                    </span>
                  ) : isEligible ? (
                    <button
                      onClick={() => setSelectedProduct(item)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-3 rounded-2xl transition shadow-md shadow-emerald-600/20 cursor-pointer w-full sm:w-auto"
                    >
                      ↺ Return Product Now
                    </button>
                  ) : (
                    <button
                      disabled
                      className="bg-gray-100 text-gray-400 font-bold text-xs px-5 py-3 rounded-2xl cursor-not-allowed w-full sm:w-auto"
                    >
                      Return Period Expired
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Return Request Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-gray-900">↺ Product Return Request</h3>
                <p className="text-xs text-gray-500">Order #{selectedProduct.id} • {selectedProduct.productName}</p>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="text-gray-400 hover:text-gray-900 text-lg font-bold">✕</button>
            </div>

            <form onSubmit={handleSubmitReturn} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Select Return Reason *</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 font-bold focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Damaged Item Received">Damaged or Defective Item Received</option>
                  <option value="Wrong Size or Color">Wrong Size, Color or Variant Delivered</option>
                  <option value="Quality Not as Expected">Product Quality Not as Expected</option>
                  <option value="Missing Accessories">Missing Accessories or Items</option>
                  <option value="Other Issue">Other Product Query Issue</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Upload Product Photos / Evidence *</label>
                <div
                  onClick={() => setPhotoUploaded(true)}
                  className="border-2 border-dashed border-gray-300 hover:border-emerald-500 bg-gray-50 rounded-2xl p-4 text-center cursor-pointer transition"
                >
                  {photoUploaded ? (
                    <div className="text-emerald-600 font-bold">✓ 2 Photos Uploaded Successfully (image_01.jpg, image_02.jpg)</div>
                  ) : (
                    <div className="text-gray-500 font-bold">📷 Click to upload defect photo / unboxing video</div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Explain Issue / Additional Comments *</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what went wrong with the item..."
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Contact Phone Number for Pickup</label>
                <input
                  type="text"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl shadow-md cursor-pointer"
                >
                  Submit Return Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
