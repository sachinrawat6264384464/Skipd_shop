"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Footer from "components/layout/footer";
import { fetchTrackOrder, fetchUserOrders, getProductImageByTitle, UserOrder } from "lib/api";

interface TimelineItem {
  stage_index: number;
  title: string;
  status: string;
  message: string;
  date: string;
  timestamp: string | null;
  updated_by: string;
  is_done: boolean;
  is_current: boolean;
}

interface OrderTrackingDetail {
  order_id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: string;
  created_at: string;
  created_at_iso: string;
  shipping_address?: any;
  items: { product_id: number; product_name: string; quantity: number; unit_price: number }[];
  timeline: TimelineItem[];
}

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("orderId") || searchParams.get("awb") || searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [trackingData, setTrackingData] = useState<OrderTrackingDetail | null>(null);
  const [userOrders, setUserOrders] = useState<UserOrder[]>([]);

  useEffect(() => {
    loadUserOrdersAndTrack();
  }, []);

  async function loadUserOrdersAndTrack() {
    setLoading(true);
    setErrorMsg("");
    try {
      const ordersData = await fetchUserOrders();
      if (ordersData && Array.isArray(ordersData)) {
        setUserOrders(ordersData);
      }

      // Priority 1: Search by URL query if present
      let targetQuery = initialSearch.trim();

      // Priority 2: Use first logged-in user order number if no query in URL
      if (!targetQuery && ordersData && ordersData.length > 0 && ordersData[0]) {
        targetQuery = ordersData[0].order_number || String(ordersData[0].id);
        setSearchQuery(targetQuery);
      }

      if (targetQuery) {
        await executeTrack(targetQuery);
      }
    } catch (e) {
      console.error("Error loading track order data:", e);
    } finally {
      setLoading(false);
    }
  }

  async function executeTrack(queryStr: string) {
    if (!queryStr.trim()) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetchTrackOrder(queryStr);
      if (res && res.order_number) {
        setTrackingData(res);
      } else {
        setTrackingData(null);
        setErrorMsg(`No live order found for "${queryStr}". Please check your Order ID (e.g. #E-COM-123456).`);
      }
    } catch (e) {
      setTrackingData(null);
      setErrorMsg(`Failed to load order tracking details from database.`);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    executeTrack(searchQuery.trim());
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen text-gray-900 font-sans flex flex-col justify-between">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-8 w-full">
        
        {/* Breadcrumb Navigation */}
        <div className="flex justify-between items-center text-xs">
          <div className="text-gray-500 font-medium">
            <Link href="/" className="hover:underline">Home</Link> &rsaquo;{" "}
            <Link href="/account" className="hover:underline">Account</Link> &rsaquo;{" "}
            <span className="text-gray-900 font-bold">Live Order Tracking</span>
          </div>

          <Link
            href="/account?tab=orders"
            className="text-[#059669] font-black hover:underline flex items-center gap-1"
          >
            <span>&larr;</span>
            <span>View All My Orders</span>
          </Link>
        </div>

        {/* TOP SEARCH BANNER CARD */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white rounded-3xl p-6 md:p-10 shadow-xl space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider">
              🚀 REAL-TIME POSTGRESQL ORDER LOGISTICS TRACKER
            </span>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">
              Track Your Order &amp; Delivery Status Live
            </h1>
            <p className="text-xs md:text-sm text-gray-300 font-medium">
              Enter your Order Number (e.g. <span className="font-mono text-emerald-300 font-bold">#E-COM-280335</span>) to check real-time status history recorded directly in Neon PostgreSQL database.
            </p>
          </div>

          {/* Search Input Box */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <input
              type="text"
              placeholder="Enter Order ID or Number (#E-COM-280335)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3.5 text-xs md:text-sm text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 font-mono tracking-wider"
            />
            <button
              type="submit"
              className="bg-[#059669] hover:bg-[#047857] text-white font-black text-xs md:text-sm px-7 py-3.5 rounded-2xl transition shadow-lg cursor-pointer whitespace-nowrap"
            >
              Track Order Live &rarr;
            </button>
          </form>

          {errorMsg && (
            <p className="text-xs text-red-300 font-bold bg-red-950/70 border border-red-800/80 p-3.5 rounded-xl max-w-2xl">
              ⚠️ {errorMsg}
            </p>
          )}
        </div>

        {loading ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-16 text-center text-gray-500 font-bold text-xs animate-pulse space-y-2">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p>Fetching real-time status timeline from Neon PostgreSQL Database...</p>
          </div>
        ) : !trackingData ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center text-gray-500 text-xs font-bold space-y-3">
            <p className="text-3xl">📦</p>
            <p className="text-sm font-black text-gray-900">No active order selected for tracking</p>
            <p className="text-gray-500 font-medium max-w-md mx-auto">
              Enter your order number above or select one of your placed orders below to inspect live timeline history.
            </p>
          </div>
        ) : (
          /* LIVE ORDER TRACKING TIMELINE PANEL */
          <div className="space-y-6">
            
            {/* Header Summary Info Card */}
            <div className="bg-white border border-gray-200/80 rounded-3xl p-6 md:p-8 shadow-2xs space-y-6">
              
              <div className="flex flex-wrap justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6 text-xs">
                <div>
                  <span className="text-gray-400 font-bold block text-[10px] uppercase tracking-wider">ORDER NUMBER</span>
                  <span className="text-xl font-mono font-black text-emerald-700">{trackingData.order_number}</span>
                </div>

                <div>
                  <span className="text-gray-400 font-bold block text-[10px] uppercase tracking-wider">CUSTOMER NAME</span>
                  <span className="text-base font-bold text-gray-900">{trackingData.customer_name}</span>
                </div>

                <div>
                  <span className="text-gray-400 font-bold block text-[10px] uppercase tracking-wider">ORDER DATE</span>
                  <span className="text-sm font-bold text-gray-900">{trackingData.created_at}</span>
                </div>

                <div>
                  <span className="text-gray-400 font-bold block text-[10px] uppercase tracking-wider">TOTAL AMOUNT</span>
                  <span className="text-base font-black text-gray-900">₹{trackingData.total_amount.toLocaleString("en-IN")}.00</span>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-2 text-right">
                  <span className="text-[10px] text-emerald-800 font-bold block uppercase">CURRENT DATABASE STATUS</span>
                  <span className="text-sm font-black text-emerald-700 font-mono uppercase">{trackingData.status}</span>
                </div>
              </div>

              {/* 🛵 Courier & Executive Information Card */}
              <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-5 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-black text-white shrink-0 text-xl">
                    🚚
                  </div>
                  <div>
                    <span className="bg-emerald-500 text-white font-extrabold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Fulfillment &amp; Express Delivery
                    </span>
                    <h4 className="text-sm font-black mt-0.5">Delhivery / BlueDart Express</h4>
                    <p className="text-xs text-emerald-200 font-medium">Tracking Code: {trackingData.order_number}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-between">
                  <div className="text-right hidden md:block">
                    <p className="text-[10px] text-gray-300 font-bold">Delivery OTP</p>
                    <p className="text-xs font-mono font-black text-emerald-300 tracking-widest">8942</p>
                  </div>

                  <a
                    href="tel:+919876543210"
                    className="bg-emerald-500 hover:bg-emerald-400 text-gray-900 font-black text-xs px-4 py-2.5 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    📞 Support Helpline
                  </a>
                </div>
              </div>

              {/* Real-time 7-Stage Timeline Progress */}
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                    Live Status History Timeline (Recorded in PostgreSQL)
                  </h3>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    ⚡ Auto Synced from Database
                  </span>
                </div>

                <div className="space-y-6 relative pl-6 border-l-2 border-emerald-500 my-6 text-xs">
                  {trackingData.timeline.map((step, idx) => {
                    const isDone = step.is_done;
                    const isCurrent = step.is_current;

                    return (
                      <div key={idx} className="relative pl-4">
                        {/* Step Marker Icon */}
                        <div
                          className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black transition-all ${
                            isCurrent
                              ? "bg-red-600 text-white ring-4 ring-red-200 shadow-md animate-pulse scale-110"
                              : isDone
                              ? "bg-[#059669] text-white ring-4 ring-emerald-100 shadow-2xs"
                              : "bg-gray-200 text-gray-400"
                          }`}
                        >
                          {isCurrent ? "●" : isDone ? "✓" : idx + 1}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <h4 className={`font-black text-sm flex items-center gap-2 ${
                            isCurrent ? "text-red-600 font-black" : isDone ? "text-gray-900" : "text-gray-400"
                          }`}>
                            <span>{step.title}</span>
                            {isCurrent && (
                              <span className="bg-red-100 text-red-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-red-200 animate-pulse">
                                Live Active Milestone
                              </span>
                            )}
                          </h4>
                          <span className={`text-xs font-bold ${
                            isCurrent ? "text-red-600" : isDone ? "text-emerald-700" : "text-gray-400 font-medium"
                          }`}>
                            {step.date}
                          </span>
                        </div>

                        <p className={`text-xs mt-1 leading-relaxed ${isCurrent ? "text-gray-800 font-medium" : "text-gray-500"}`}>
                          {step.message} {step.updated_by && <span className="text-[10px] text-gray-400 font-semibold">({step.updated_by})</span>}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Items & Shipping Address Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-6 text-xs">
                
                {/* Shipping Address */}
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-1">
                  <p className="font-black text-gray-900 text-xs uppercase tracking-wider">📍 Delivery Address</p>
                  <p className="font-bold text-gray-900">{trackingData.customer_name}</p>
                  {trackingData.shipping_address && (
                    <p className="text-gray-600 text-xs leading-relaxed">
                      {trackingData.shipping_address.street || trackingData.shipping_address.address}, {trackingData.shipping_address.city}, {trackingData.shipping_address.state} - PIN: {trackingData.shipping_address.pincode || trackingData.shipping_address.pinCode}
                    </p>
                  )}
                  <p className="text-gray-500 text-[11px] pt-1">Email: <span className="font-semibold text-gray-700">{trackingData.customer_email}</span></p>
                </div>

                {/* Purchased Items List */}
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
                  <p className="font-black text-gray-900 text-xs uppercase tracking-wider">📦 Ordered Items ({trackingData.items.length})</p>
                  <div className="space-y-2">
                    {trackingData.items.map((item, i) => {
                      const img = (item as any).product_image || getProductImageByTitle(item.product_name);
                      return (
                        <div key={i} className="flex items-center justify-between gap-3 text-xs bg-white p-2.5 rounded-xl border border-gray-200">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img src={img} alt={item.product_name} className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0 bg-white" />
                            <div className="min-w-0">
                              <span className="font-bold text-gray-800 block truncate">{item.quantity}x {item.product_name}</span>
                              <span className="text-[10px] text-gray-500 font-medium">₹{item.unit_price.toLocaleString("en-IN")} each</span>
                            </div>
                          </div>
                          <span className="font-black text-gray-900 shrink-0">₹{(item.unit_price * item.quantity).toLocaleString("en-IN")}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>

            {/* Selector for Logged-In User's Other Orders */}
            {userOrders.length > 0 && (
              <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-2xs space-y-4">
                <h3 className="font-black text-sm text-gray-900">Your Placed Orders ({userOrders.length})</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userOrders.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => {
                        setSearchQuery(o.order_number);
                        executeTrack(o.order_number);
                      }}
                      className={`p-4 rounded-2xl border text-left transition cursor-pointer flex items-center gap-3.5 ${
                        trackingData?.order_number === o.order_number
                          ? "bg-[#EAF8F2] border-[#059669] ring-2 ring-emerald-500/20 shadow-xs"
                          : "bg-gray-50 hover:bg-gray-100 border-gray-200"
                      }`}
                    >
                      <img
                        src={o.image}
                        alt={o.title}
                        className="w-14 h-14 rounded-xl object-cover border border-gray-200 shrink-0 bg-white"
                      />
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-mono font-black text-emerald-700">{o.order_number}</span>
                          <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded uppercase">{o.status}</span>
                        </div>
                        <p className="font-bold text-gray-900 text-xs truncate">{o.title}</p>
                        <p className="text-[10px] text-gray-500 font-medium">{o.date} • ₹{o.total.toLocaleString("en-IN")}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
      <Footer />
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-bold text-gray-500">Loading Live Order Tracker...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
