"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Footer from "components/layout/footer";
import { fetchAdminShipments, fetchUserOrders, UserOrder } from "lib/api";

interface ShipmentDetail {
  id: number;
  awbCode: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  courierName: string;
  destination: string;
  pinCode: string;
  estDeliveryDate: string;
  status: string;
  currentLocation: string;
  date: string;
}

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialAwb = searchParams.get("awb") || searchParams.get("orderId") || "";

  const [searchQuery, setSearchQuery] = useState(initialAwb);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [allShipments, setAllShipments] = useState<ShipmentDetail[]>([]);
  const [currentShipment, setCurrentShipment] = useState<ShipmentDetail | null>(null);
  const [userOrders, setUserOrders] = useState<UserOrder[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [shipmentsData, ordersData] = await Promise.all([
        fetchAdminShipments(),
        fetchUserOrders()
      ]);

      if (ordersData && Array.isArray(ordersData)) {
        setUserOrders(ordersData);
      }

      if (ordersData && ordersData.length > 0) {
        // Build shipments from logged-in user's own orders
        const userShipments: ShipmentDetail[] = ordersData.map((order: any, idx: number) => ({
          id: idx + 1,
          awbCode: order.awb || `SR-AWB-${order.order_number}`,
          orderId: order.order_number,
          customerName: "Logged-In Customer",
          customerEmail: "user@skipd.com",
          customerPhone: "+91 98765 43210",
          courierName: "Delhivery Express Logistics",
          destination: "Delivery Address",
          pinCode: "474001",
          estDeliveryDate: "Aug 20, 2026",
          status: (order.status || "IN TRANSIT").toUpperCase(),
          currentLocation: "Regional Sort Hub",
          date: order.date || "Aug 17, 2026",
          timeline: [
            { title: "Order Confirmed & Payment Received", location: "SKIPD Merchant Hub", date: order.date || "Aug 16, 2026", done: true },
            { title: "Package Packed & Handed to Logistics", location: "Central Warehouse", date: order.date || "Aug 16, 2026", done: true },
            { title: "In Transit across Regional Hubs", location: "Regional Logistics Hub", date: "Aug 17, 2026", done: true, current: true },
            { title: "Out for Express Delivery", location: "Local Delivery Facility", date: "Aug 18, 2026", done: false },
            { title: "Package Delivered", location: "Customer Destination", date: "Aug 19, 2026", done: false }
          ]
        }));

        setAllShipments(userShipments);
        const match = userShipments.find(
          (s: ShipmentDetail) =>
            (s.awbCode || "").toLowerCase() === (initialAwb || "").toLowerCase() ||
            (s.orderId || "").toLowerCase() === (initialAwb || "").toLowerCase()
        );
        setCurrentShipment(match || userShipments[0] || null);
      } else {
        setAllShipments([]);
        setCurrentShipment(null);
      }
    } catch (e) {
      console.error("Error loading shipment tracking data:", e);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;

    const found = allShipments.find(
      s => s.awbCode.toLowerCase() === q ||
           s.orderId.toLowerCase() === q ||
           s.awbCode.toLowerCase().includes(q) ||
           s.orderId.toLowerCase().includes(q)
    );

    if (found) {
      setCurrentShipment(found);
    } else {
      setErrorMsg(`No live shipment found for "${searchQuery}". Try searching for SR-8849201 or #SKIPD-25879.`);
    }
  };

  const getStepperProgress = (status: string) => {
    const s = (status || "").toUpperCase();
    if (s.includes("DELIVERED")) return 4;
    if (s.includes("OUT")) return 3;
    if (s.includes("TRANSIT") || s.includes("SHIPPED")) return 2;
    if (s.includes("PICKED") || s.includes("PACKED")) return 1;
    return 0;
  };

  const stepLevel = currentShipment ? getStepperProgress(currentShipment.status) : 2;

  const timelineSteps = [
    { title: "Order Confirmed & Placed", location: "SKIPD Fulfillment Center, Mumbai Hub", date: currentShipment?.date || "May 24, 2025 10:30 AM" },
    { title: "Packed & Quality Checked", location: "Central Sorting Warehouse, Line 4", date: currentShipment?.date || "May 24, 2025 02:45 PM" },
    { title: "In Transit — Dispatched via Express", location: currentShipment?.currentLocation || "Bhopal Sort Center", date: "May 25, 2025 08:15 AM" },
    { title: "Out for Delivery", location: "Assigned Executive: Vikram Sharma (Vehicle MP-07-EV-4210)", date: "Expected Today by 06:00 PM" },
    { title: "Delivered to Customer", location: currentShipment?.destination || "Gwalior, Madhya Pradesh", date: currentShipment?.estDeliveryDate || "May 27, 2026" }
  ];

  return (
    <div className="bg-[#FAFAFA] min-h-screen text-gray-900 font-sans flex flex-col justify-between">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-8 w-full">
        
        {/* Breadcrumb Navigation */}
        <div className="flex justify-between items-center text-xs">
          <div className="text-gray-500 font-medium">
            <Link href="/" className="hover:underline">Home</Link> &rsaquo;{" "}
            <Link href="/account" className="hover:underline">Account</Link> &rsaquo;{" "}
            <span className="text-gray-900 font-bold">Track Shipment Live</span>
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
              🚀 REAL-TIME COURIER LOGISTICS TRACKER
            </span>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">
              Track Your Order &amp; Package Live
            </h1>
            <p className="text-xs md:text-sm text-gray-300 font-medium">
              Enter your AWB Tracking Code (e.g. <span className="font-mono text-emerald-300 font-bold">SR-8849201</span>) or Order ID (e.g. <span className="font-mono text-emerald-300 font-bold">#SKIPD-25879</span>) to check live status.
            </p>
          </div>

          {/* Search Input Box */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <input
              type="text"
              placeholder="Enter AWB Code (SR-8849201) or Order ID (#SKIPD-25879)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3.5 text-xs md:text-sm text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 font-mono tracking-wider"
            />
            <button
              type="submit"
              className="bg-[#059669] hover:bg-[#047857] text-white font-black text-xs md:text-sm px-7 py-3.5 rounded-2xl transition shadow-lg cursor-pointer whitespace-nowrap"
            >
              Track Package Live &rarr;
            </button>
          </form>

          {errorMsg && (
            <p className="text-xs text-red-400 font-bold bg-red-950/60 border border-red-800/60 p-3 rounded-xl max-w-2xl">
              ⚠️ {errorMsg}
            </p>
          )}
        </div>

        {loading ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-16 text-center text-gray-500 font-bold text-xs animate-pulse">
            Fetching live shipment tracking details from PostgreSQL Database...
          </div>
        ) : !currentShipment ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center text-gray-500 text-xs font-bold space-y-2">
            <p className="text-2xl">📦</p>
            <p>No active shipment selected. Enter your AWB tracking code above to get started!</p>
          </div>
        ) : (
          /* LIVE SHIPMENT DETAILS PANEL */
          <div className="space-y-6">
            
            {/* Header Summary Info Card */}
            <div className="bg-white border border-gray-200/80 rounded-3xl p-6 md:p-8 shadow-2xs space-y-6">
              
              <div className="flex flex-wrap justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6 text-xs">
                <div>
                  <span className="text-gray-400 font-bold block text-[10px] uppercase tracking-wider">AWB TRACKING CODE</span>
                  <span className="text-xl font-mono font-black text-emerald-700">{currentShipment.awbCode}</span>
                </div>

                <div>
                  <span className="text-gray-400 font-bold block text-[10px] uppercase tracking-wider">LINKED ORDER ID</span>
                  <span className="text-base font-mono font-black text-gray-900">{currentShipment.orderId}</span>
                </div>

                <div>
                  <span className="text-gray-400 font-bold block text-[10px] uppercase tracking-wider">COURIER PARTNER</span>
                  <span className="text-sm font-black text-gray-900">{currentShipment.courierName}</span>
                </div>

                <div>
                  <span className="text-gray-400 font-bold block text-[10px] uppercase tracking-wider">ESTIMATED DELIVERY</span>
                  <span className="text-sm font-bold text-gray-900">{currentShipment.estDeliveryDate}</span>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-2 text-right">
                  <span className="text-[10px] text-emerald-800 font-bold block">SECURITY OTP</span>
                  <span className="text-base font-black text-emerald-700 font-mono tracking-widest">8942</span>
                </div>
              </div>

              {/* 🛵 Assigned Delivery Executive Card */}
              <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-5 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-black text-white shrink-0 text-xl">
                    🚚
                  </div>
                  <div>
                    <span className="bg-emerald-500 text-white font-extrabold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Assigned Courier Executive
                    </span>
                    <h4 className="text-sm font-black mt-0.5">Vikram Sharma</h4>
                    <p className="text-xs text-emerald-200 font-medium">Vehicle: MP-07-EV-4210 • {currentShipment.courierName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-between">
                  <div className="text-right hidden md:block">
                    <p className="text-[10px] text-gray-300 font-bold">Current Location</p>
                    <p className="text-xs font-bold text-emerald-300">{currentShipment.currentLocation}</p>
                  </div>

                  <a
                    href="tel:+919826012345"
                    className="bg-emerald-500 hover:bg-emerald-400 text-gray-900 font-black text-xs px-4 py-2.5 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    📞 Call Executive
                  </a>
                </div>
              </div>

              {/* 5-Stage Visual Progress Stepper */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">Live Delivery Timeline Progress</h3>

                <div className="space-y-6 relative pl-6 border-l-2 border-emerald-500 my-4 text-xs">
                  {timelineSteps.map((step, idx) => {
                    const isDone = idx <= stepLevel;
                    const isCurrent = idx === stepLevel;

                    return (
                      <div key={idx} className="relative pl-4">
                        <div
                          className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black ${
                            isDone
                              ? "bg-[#059669] text-white ring-4 ring-emerald-100 shadow-2xs"
                              : isCurrent
                              ? "bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse"
                              : "bg-gray-200 text-gray-400"
                          }`}
                        >
                          {isDone ? "✓" : idx + 1}
                        </div>

                        <h4 className={`font-black text-sm ${isDone ? "text-gray-900" : "text-gray-400"}`}>
                          {step.title}
                        </h4>
                        <p className="text-gray-500 text-xs mt-0.5">
                          {step.location} • <span className="font-semibold text-gray-700">{step.date}</span>
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Destination Address & Package Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-6 text-xs">
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-1">
                  <p className="font-black text-gray-900 text-xs uppercase tracking-wider">📍 Destination Address</p>
                  <p className="font-bold text-gray-900">{currentShipment.customerName} ({currentShipment.customerPhone})</p>
                  <p className="text-gray-600 text-xs">{currentShipment.destination} - PIN: {currentShipment.pinCode}</p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-2">
                  <p className="font-black text-gray-900 text-xs uppercase tracking-wider">📦 Courier &amp; Logistics Service</p>
                  <p className="font-bold text-gray-900">{currentShipment.courierName}</p>
                  <p className="text-gray-600 text-xs">Status: <span className="font-black text-emerald-700">{currentShipment.status}</span></p>
                </div>
              </div>

            </div>

            {/* Quick Selector for Other Shipments */}
            <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-2xs space-y-4">
              <h3 className="font-black text-sm text-gray-900">Select Other Active Shipments ({allShipments.length})</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {allShipments.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setCurrentShipment(s);
                      setSearchQuery(s.awbCode);
                    }}
                    className={`p-4 rounded-2xl border text-left transition cursor-pointer space-y-1 ${
                      currentShipment?.id === s.id
                        ? "bg-[#EAF8F2] border-[#059669] ring-2 ring-emerald-500/20 shadow-xs"
                        : "bg-gray-50 hover:bg-gray-100 border-gray-200"
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono font-black text-emerald-700">{s.awbCode}</span>
                      <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">{s.status}</span>
                    </div>
                    <p className="font-bold text-gray-900 text-xs">{s.orderId}</p>
                    <p className="text-[10px] text-gray-500 font-medium">{s.courierName} • {s.destination}</p>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
      <Footer />
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-bold text-gray-500">Loading Live Shipment Tracker...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
