"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { fetchLiveTracking, fetchUserOrders, TrackingData, UserOrder } from "lib/api";
import Footer from "components/layout/footer";

export default function TrackOrderPage() {
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string>("SKIPD-984201");
  const [trackingInput, setTrackingInput] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [trackingResult, setTrackingResult] = useState<TrackingData | null>(null);

  useEffect(() => {
    async function loadOrders() {
      const userOrders = await fetchUserOrders();
      setOrders(userOrders);
      if (userOrders.length > 0) {
        const initialOrder = userOrders[0];
        setSelectedOrderNumber(initialOrder?.order_number || "SKIPD-984201");
        loadTrackingForOrder(initialOrder?.order_number || "SKIPD-984201");
      }
    }
    loadOrders();
  }, []);

  const loadTrackingForOrder = async (orderOrAwb: string) => {
    setLoading(true);
    setSelectedOrderNumber(orderOrAwb);
    const data = await fetchLiveTracking(orderOrAwb);
    setTrackingResult(data);
    setLoading(false);
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingInput.trim()) return;
    loadTrackingForOrder(trackingInput.trim());
  };

  return (
    <div className="bg-[#FAFAFA] text-gray-900 min-h-screen flex flex-col justify-between">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 w-full">
        
        {/* Page Header */}
        <div className="border-b border-gray-200 pb-4">
          <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold text-[10px] uppercase px-3 py-1 rounded-full tracking-wider">
            SHIPROCKET LIVE LOGISTICS PORTAL
          </span>
          <h1 className="text-3xl font-black text-gray-900 mt-2">Track Your Orders &amp; Packages Live</h1>
          <p className="text-xs text-gray-500 mt-1">Select an order from your recent purchases or enter an AWB tracking code below.</p>
        </div>

        {/* 2-Column Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 👈 Left Column: Recent Orders List (Interactive Cards) */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="font-black text-base text-gray-900">Your Recent Orders ({orders.length})</h3>
              <span className="text-[11px] text-emerald-700 font-bold">Click to track live</span>
            </div>

            <div className="space-y-3">
              {orders.map((ord) => {
                const isSelected = selectedOrderNumber === ord.order_number || selectedOrderNumber === ord.awb;
                return (
                  <div
                    key={ord.id}
                    onClick={() => loadTrackingForOrder(ord.order_number)}
                    className={`p-4 rounded-3xl border transition cursor-pointer flex gap-3 items-center ${
                      isSelected
                        ? "bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
                        : "bg-white border-gray-200 hover:border-emerald-300 shadow-2xs"
                    }`}
                  >
                    <div className="relative w-16 h-16 bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 shrink-0">
                      <Image src={ord.image} alt={ord.title} fill className="object-cover" />
                    </div>

                    <div className="flex-1 min-w-0 text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-black text-gray-900 text-sm">{ord.order_number}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                          ord.status === "DELIVERED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-blue-100 text-blue-800"
                        }`}>
                          {ord.status}
                        </span>
                      </div>
                      <p className="font-bold text-gray-800 truncate">{ord.title}</p>
                      <div className="flex justify-between text-[11px] text-gray-500 pt-0.5">
                        <span>{ord.date}</span>
                        <span className="font-black text-gray-900">₹{ord.total.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 👉 Right Column: Live Tracking Details & Timeline */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Search Input Banner */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-gray-900">Enter Order # or Courier AWB Tracking Code</h3>
              <form onSubmit={handleManualSearch} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. SKIPD-984201 or SR-AWB-984201"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  className="flex-1 bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 text-xs text-gray-900 focus:border-emerald-600 focus:outline-none shadow-2xs"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-6 py-3 rounded-2xl transition shadow-md shadow-emerald-600/20 whitespace-nowrap cursor-pointer"
                >
                  {loading ? "Searching..." : "Track Live →"}
                </button>
              </form>
            </div>

            {/* Tracking Result Card */}
            {trackingResult && (
              <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-xs space-y-6">
                
                <div className="flex flex-wrap justify-between items-center gap-4 border-b border-gray-100 pb-4 text-xs">
                  <div>
                    <span className="text-gray-500 font-semibold block text-[10px] uppercase">SELECTED ORDER / AWB</span>
                    <span className="text-base font-black text-gray-900">{trackingResult.order_number} ({trackingResult.awb_code})</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-semibold block text-[10px] uppercase">COURIER PARTNER</span>
                    <span className="font-bold text-emerald-700">{trackingResult.courier_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-semibold block text-[10px] uppercase">ESTIMATED DELIVERY</span>
                    <span className="font-bold text-gray-900">{trackingResult.estimated_delivery}</span>
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-6 pl-4 border-l-2 border-emerald-500 my-4 text-xs">
                  {trackingResult.timeline.map((step, idx) => (
                    <div key={idx} className="relative pl-6">
                      <div className={`absolute -left-[25px] top-0.5 w-4 h-4 rounded-full border-2 border-white ${
                        step.completed ? "bg-emerald-600 ring-4 ring-emerald-100" : "bg-gray-300"
                      }`} />
                      <h4 className={`font-bold text-sm ${step.completed ? "text-gray-900" : "text-gray-400"}`}>
                        {step.status}
                      </h4>
                      <p className="text-gray-500 text-[11px] mt-0.5">{step.location} • {step.timestamp}</p>
                    </div>
                  ))}
                </div>

              </div>
            )}

          </div>

        </div>

      </div>
      <Footer />
    </div>
  );
}
