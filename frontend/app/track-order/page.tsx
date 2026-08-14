"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Footer from "components/layout/footer";

interface TimelineStep {
  status: string;
  location: string;
  timestamp: string;
  completed: boolean;
  active?: boolean;
}

interface OrderRecord {
  order_number: string;
  created_at: string;
  total_amount: number;
  payment_method?: string;
  items: Array<{
    title?: string;
    name?: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  status: string;
  shipping_address?: {
    name?: string;
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
}

export default function TrackOrderPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [trackingInput, setTrackingInput] = useState<string>("");
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    // 1. Read URL params for orderId
    const searchParams = new URLSearchParams(window.location.search);
    const orderIdParam = searchParams.get("orderId") || searchParams.get("awb");

    // 2. Load orders from localStorage
    const savedOrdersStr = localStorage.getItem("skipd_orders");
    let loadedOrders: OrderRecord[] = [];

    if (savedOrdersStr) {
      try {
        loadedOrders = JSON.parse(savedOrdersStr);
      } catch (e) {}
    }

    // Default Fallback Orders if none exist
    if (loadedOrders.length === 0) {
      loadedOrders = [
        {
          order_number: "SKIPD-984201",
          created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
          total_amount: 1799,
          payment_method: "UPI",
          status: "IN_TRANSIT",
          items: [
            {
              title: "boAt Rockerz Plus 550 ANC Headphones",
              price: 1799,
              quantity: 1,
              image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"
            }
          ],
          shipping_address: {
            name: "Sachin Rawat",
            street: "Flat 402, Signature Towers, MG Road",
            city: "Gwalior",
            state: "Madhya Pradesh",
            pincode: "474001"
          }
        },
        {
          order_number: "SKIPD-842109",
          created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
          total_amount: 3499,
          payment_method: "CARD",
          status: "DELIVERED",
          items: [
            {
              title: "Matte Black Chrono Watch",
              price: 3499,
              quantity: 1,
              image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"
            }
          ],
          shipping_address: {
            name: "Sachin Rawat",
            street: "Building 5, Tech Park, Electronic City",
            city: "Bengaluru",
            state: "Karnataka",
            pincode: "560100"
          }
        }
      ];
    }

    setOrders(loadedOrders);

    // Pick target order
    if (orderIdParam) {
      const match = loadedOrders.find(
        (o) => o.order_number.toLowerCase() === orderIdParam.toLowerCase()
      );
      if (match) {
        setSelectedOrder(match);
        return;
      }
    }

    setSelectedOrder(loadedOrders[0] || null);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError("");
    const query = trackingInput.trim().toLowerCase();
    if (!query) return;

    const match = orders.find(
      (o) => o.order_number.toLowerCase() === query || o.order_number.toLowerCase().includes(query)
    );

    if (match) {
      setSelectedOrder(match);
    } else {
      setSearchError(`No order found matching "${trackingInput}". Try SKIPD-984201.`);
    }
  };

  // Helper Timeline Stages based on Order Status
  const getTimelineForStatus = (status: string): TimelineStep[] => {
    const isDelivered = status === "DELIVERED";
    const isInTransit = status === "IN_TRANSIT" || isDelivered;
    const isPacked = status === "PACKED" || isInTransit || isDelivered;

    return [
      {
        status: "Order Confirmed & Placed",
        location: "SKIPD Fulfillment Hub, Mumbai",
        timestamp: "Today, 10:30 AM",
        completed: true
      },
      {
        status: "Order Packed & Quality Checked",
        location: "Central Warehouse, Line 4",
        timestamp: "Today, 12:45 PM",
        completed: isPacked
      },
      {
        status: "In Transit — Dispatched via Express",
        location: "Logistics Hub (AWB: SR-894201)",
        timestamp: isPacked ? "Today, 03:15 PM" : "Pending",
        completed: isInTransit
      },
      {
        status: "Out for Delivery",
        location: "Assigned to Executive (Vikram Sharma)",
        timestamp: isDelivered ? "Yesterday, 04:00 PM" : (isInTransit ? "Expected by 06:00 PM" : "Pending"),
        completed: isDelivered,
        active: isInTransit && !isDelivered
      },
      {
        status: "Delivered to Customer",
        location: "Destination Address",
        timestamp: isDelivered ? "Yesterday, 05:12 PM" : "Expected Aug 15",
        completed: isDelivered
      }
    ];
  };

  return (
    <div className="bg-[#FAFAFA] text-gray-900 min-h-screen flex flex-col justify-between">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 w-full">
        
        {/* Page Header */}
        <div className="border-b border-gray-200 pb-4 flex flex-wrap justify-between items-center gap-4">
          <div>
            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-[10px] uppercase px-3 py-1 rounded-full tracking-wider">
              🚀 LIVE SHIPMENT &amp; LOGISTICS TRACKER
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 mt-2">Track Your Orders Live</h1>
            <p className="text-xs text-gray-500 mt-1">Real-time status updates and delivery executive contact info.</p>
          </div>

          <Link href="/orders" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline">
            View All Past Orders &rsaquo;
          </Link>
        </div>

        {/* 2-Column Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* 👈 Left 4-Col: Recent Orders Selector Cards */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="font-black text-base text-gray-900">Your Recent Orders ({orders.length})</h3>

            <div className="space-y-3">
              {orders.map((ord) => {
                const isSelected = selectedOrder?.order_number === ord.order_number;
                const firstItem = ord.items[0];

                return (
                  <div
                    key={ord.order_number}
                    onClick={() => setSelectedOrder(ord)}
                    className={`p-4 rounded-3xl border transition cursor-pointer flex gap-3 items-center ${
                      isSelected
                        ? "bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
                        : "bg-white border-gray-200 hover:border-emerald-300 shadow-2xs"
                    }`}
                  >
                    <img
                      src={firstItem?.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"}
                      alt={firstItem?.title || firstItem?.name || "Product"}
                      className="w-14 h-14 object-contain bg-white rounded-2xl p-1 border border-gray-200 shrink-0"
                    />

                    <div className="flex-1 min-w-0 text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-black text-gray-900 text-sm">{ord.order_number}</span>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                          ord.status === "DELIVERED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-900"
                        }`}>
                          {ord.status}
                        </span>
                      </div>
                      <p className="font-bold text-gray-800 truncate">{firstItem?.title || firstItem?.name}</p>
                      <div className="flex justify-between text-[10px] text-gray-500 pt-0.5">
                        <span>{new Date(ord.created_at).toLocaleDateString("en-IN")}</span>
                        <span className="font-black text-gray-900">₹{ord.total_amount.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 👉 Right 8-Col: Live Order Details & Stepper */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Search Input Box */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-gray-900">Lookup Order by ID</h3>
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. SKIPD-984201"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  className="flex-1 bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 text-xs text-gray-900 focus:border-emerald-600 focus:outline-none uppercase tracking-wider"
                />
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-6 py-3 rounded-2xl transition shadow-md shadow-emerald-600/20 whitespace-nowrap cursor-pointer"
                >
                  Track Live →
                </button>
              </form>
              {searchError && <p className="text-xs text-red-600 font-bold">{searchError}</p>}
            </div>

            {/* Selected Order Live Card */}
            {selectedOrder && (
              <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-xs space-y-8">
                
                {/* Header Summary Bar */}
                <div className="flex flex-wrap justify-between items-center gap-4 border-b border-gray-100 pb-5 text-xs">
                  <div>
                    <span className="text-gray-400 font-bold block text-[10px] uppercase tracking-wider">ORDER ID</span>
                    <span className="text-lg font-black text-gray-900">{selectedOrder.order_number}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold block text-[10px] uppercase tracking-wider">PAYMENT METHOD</span>
                    <span className="font-bold text-emerald-700 uppercase">{selectedOrder.payment_method || "UPI"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold block text-[10px] uppercase tracking-wider">ESTIMATED DELIVERY</span>
                    <span className="font-bold text-gray-900">Saturday, Aug 15</span>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-2 text-right">
                    <span className="text-[10px] text-gray-500 font-bold block">DELIVERY SECURITY OTP</span>
                    <span className="text-base font-black text-emerald-700 font-mono tracking-widest">8942</span>
                  </div>
                </div>

                {/* 🛵 Delivery Executive Info Card */}
                <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl font-black text-white shrink-0">
                      👨‍✈️
                    </div>
                    <div>
                      <span className="bg-emerald-500 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase">
                        Assigned Delivery Executive
                      </span>
                      <h4 className="text-base font-black mt-0.5">Vikram Sharma</h4>
                      <p className="text-xs text-emerald-200 font-medium">Vehicle: MP-07-EV-4210 • Express Courier</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto justify-between">
                    <div className="text-right hidden md:block">
                      <p className="text-[10px] text-gray-300">Live Status</p>
                      <p className="text-xs font-bold text-emerald-300">1.4 km away • Arriving in 18 mins</p>
                    </div>

                    <a
                      href="tel:+919826012345"
                      className="bg-emerald-500 hover:bg-emerald-400 text-gray-900 font-black text-xs px-5 py-3 rounded-2xl transition shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      📞 Call Executive
                    </a>
                  </div>
                </div>

                {/* 5-Stage Visual Order Stepper */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">Live Status Progress</h3>

                  <div className="space-y-6 relative pl-6 border-l-2 border-emerald-500 my-4 text-xs">
                    {getTimelineForStatus(selectedOrder.status).map((step, idx) => (
                      <div key={idx} className="relative pl-4">
                        <div
                          className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black ${
                            step.completed
                              ? "bg-emerald-500 text-white ring-4 ring-emerald-100 shadow-xs"
                              : step.active
                              ? "bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse"
                              : "bg-gray-200 text-gray-400"
                          }`}
                        >
                          {step.completed ? "✓" : idx + 1}
                        </div>

                        <h4 className={`font-bold text-sm ${step.completed ? "text-gray-900" : "text-gray-400"}`}>
                          {step.status}
                        </h4>
                        <p className="text-gray-500 text-xs mt-0.5">{step.location} • <span className="font-semibold text-gray-700">{step.timestamp}</span></p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Destination & Ordered Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-5 text-xs">
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-1">
                    <p className="font-black text-gray-900 text-xs uppercase tracking-wider">📍 Delivery Address</p>
                    <p className="font-bold text-gray-900">{selectedOrder.shipping_address?.name || "Sachin Rawat"}</p>
                    <p className="text-gray-600 line-clamp-2">{selectedOrder.shipping_address?.street}, {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} - {selectedOrder.shipping_address?.pincode}</p>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-2">
                    <p className="font-black text-gray-900 text-xs uppercase tracking-wider">🛍️ Items in this Package</p>
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="font-bold text-gray-800 truncate max-w-[200px]">{item.title || item.name}</span>
                        <span className="font-black text-gray-900">Qty {item.quantity} • ₹{item.price.toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                  </div>
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
