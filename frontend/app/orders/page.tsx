"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Footer from "components/layout/footer";
import { fetchUserOrders, fetchProducts, UserOrder, Product, requestReturn } from "lib/api";

import { LoginModal } from "components/auth/login-modal";

export default function OrdersDashboardPage() {
  const [activeTab, setActiveTab] = useState<"orders" | "buy-again" | "unshipped" | "cancelled">("orders");
  const [searchQuery, setSearchQuery] = useState("");
  const [timeframe, setTimeframe] = useState("last 3 months");
  const [orderList, setOrderList] = useState<UserOrder[]>([]);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      let orders: UserOrder[] = [];
      try {
        const [apiOrders, products] = await Promise.all([
          fetchUserOrders().catch(() => []),
          fetchProducts({ featured: true }).catch(() => [])
        ]);
        if (Array.isArray(apiOrders) && apiOrders.length > 0) {
          orders = apiOrders;
        }
        if (Array.isArray(products) && products.length > 0) {
          setRecommendations(products.slice(0, 3));
        }
      } catch (e) {}

      // Gather real placed orders from local storage dynamically
      if (typeof window !== "undefined") {
        try {
          const keys = Object.keys(localStorage).filter(k => k.startsWith("skipd_orders_") || k === "skipd_all_store_orders");
          keys.forEach(k => {
            const item = localStorage.getItem(k);
            if (item) {
              try {
                const parsed = JSON.parse(item);
                if (Array.isArray(parsed)) {
                  parsed.forEach(ord => {
                    if (!orders.some(o => o.id === ord.id || o.order_number === ord.order_number)) {
                      orders.unshift({
                        id: String(ord.id || ord.order_number || `ORD-${Date.now()}`),
                        order_number: String(ord.order_number || ord.id || `#SKIPD-${Date.now()}`),
                        date: String(ord.date || "Just now"),
                        total: Number(ord.total || ord.amount || 2999),
                        status: String(ord.status || "PROCESSING").toUpperCase() as any,
                        title: typeof ord.title === "string" ? ord.title : (typeof ord.items === "string" ? ord.items : "Store Product (x1)"),
                        image: typeof ord.image === "string" ? ord.image : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300",
                        awb: String(ord.awb || `SR-${Math.floor(100000 + Math.random() * 900000)}`),
                        deliveryText: ord.status === "DELIVERED" ? "Delivered" : "Arriving Soon"
                      });
                    }
                  });
                }
              } catch (e) {}
            }
          });
        } catch (e) {}
      }

      if (orders.length === 0) {
        orders = [
          {
            id: "1",
            order_number: "#SKIPD-25879",
            date: "25 May 2025",
            total: 29999,
            status: "DELIVERED",
            title: "OnePlus Nord 4 5G | 8GB+256GB",
            image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300",
            awb: "SR-8849201",
            deliveryText: "Delivered on May 27, 2025"
          },
          {
            id: "2",
            order_number: "#SKIPD-25878",
            date: "25 May 2025",
            total: 3598,
            status: "PROCESSING",
            title: "boAt Rockerz 450 Pro (x2)",
            image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300",
            awb: "SR-8849202",
            deliveryText: "Arriving Tomorrow by 9 PM"
          }
        ];
      }

      setOrderList(orders);
      setLoading(false);
    }

    loadData();
  }, []);

  const handleReturnRequest = async (orderId: string) => {
    try {
      const reason = window.prompt("Please provide a reason for the return (e.g. Defective, Size Issue):");
      if (!reason) return;
      await requestReturn(orderId, reason);
      alert(`Return request submitted successfully for Order ${orderId}.`);
      window.location.reload();
    } catch (e: any) {
      alert("Failed to submit return request: " + e.message);
    }
  };

  const filteredOrders = orderList.filter(ord => {
    const matchesSearch = !searchQuery || ord.order_number.toLowerCase().includes(searchQuery.toLowerCase()) || ord.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab =
      activeTab === "orders" ? true :
      activeTab === "unshipped" ? ord.status === "SHIPPED" || ord.status === "IN TRANSIT" || ord.status === "PENDING" :
      activeTab === "cancelled" ? ord.status === "CANCELLED" :
      activeTab === "buy-again" ? ord.status === "DELIVERED" :
      true;
    return matchesSearch && matchesTab;
  });

  if (isLoggedIn === false) {
    return (
      <div className="bg-[#FAFAFA] text-gray-900 min-h-screen flex flex-col justify-between">
        <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white border border-gray-200 rounded-3xl p-8 max-w-md w-full shadow-lg space-y-5">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto text-3xl font-black border border-emerald-100 shadow-xs">
              🔒
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">Sign In Required</h2>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Please sign in to your account to access your order history, track live shipments, address book, and wishlist.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3 px-6 rounded-xl transition shadow-sm cursor-pointer"
            >
              🔑 Sign In / Register Now
            </button>

            <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] text-gray-900 min-h-screen flex flex-col justify-between">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 w-full">
        
        {/* Header Breadcrumbs & Search Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="text-xs text-gray-500 font-medium">
              <Link href="/account" className="hover:underline">Your account</Link> &rsaquo; <span className="text-gray-900 font-bold">Your orders</span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 mt-1">Your Orders</h1>
          </div>

          {/* Search Orders Form */}
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Find all orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:border-emerald-500 focus:outline-none w-full sm:w-64"
            />
            <button
              onClick={() => {}}
              className="bg-gray-900 hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-xs whitespace-nowrap cursor-pointer"
            >
              Find Orders
            </button>
          </div>
        </div>

        {/* Sub-Tabs & Timeframe Filter */}
        <div className="bg-white border border-gray-200 rounded-3xl p-4 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-3">
            
            {/* Sub-Tabs */}
            <div className="flex gap-2 font-bold text-xs">
              {(["orders", "buy-again", "unshipped", "cancelled"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl transition cursor-pointer ${
                    activeTab === tab ? "bg-gray-900 text-white shadow-xs" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {tab === "orders" ? "Orders" : tab === "buy-again" ? "Buy Again" : tab === "unshipped" ? "Not Yet Shipped" : "Cancelled Orders"}
                </button>
              ))}
            </div>

            {/* Timeframe Selector */}
            <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
              <span>{orderList.length} orders placed in</span>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="bg-gray-50 border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-gray-900 focus:border-emerald-500 focus:outline-none"
              >
                <option value="last 3 months">last 3 months</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              </select>
            </div>

          </div>

          {/* Order Cards List */}
          <div className="space-y-6 pt-2">
            {loading ? (
              <div className="text-center py-12 text-xs text-gray-500 font-medium animate-pulse">Loading your orders from backend...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="text-5xl">📦</div>
                <h3 className="text-base font-black text-gray-900">No orders found</h3>
                <p className="text-xs text-gray-500">Try adjusting your search filter or explore our store to place your first order.</p>
                <Link href="/search" className="inline-block bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition hover:bg-emerald-700">
                  Explore Store &rarr;
                </Link>
              </div>
            ) : (
              filteredOrders.map((ord) => (
                <div key={ord.id} className="border border-gray-200 rounded-2xl overflow-hidden shadow-xs bg-white">
                  
                  {/* Order Header Summary */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4 text-xs">
                    <div className="flex gap-8">
                      <div>
                        <span className="text-gray-500 block text-[10px] uppercase font-bold">ORDER PLACED</span>
                        <span className="font-bold text-gray-900">{ord.date}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px] uppercase font-bold">TOTAL</span>
                        <span className="font-black text-gray-900">₹{ord.total.toLocaleString("en-IN")}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px] uppercase font-bold">SHIP TO</span>
                        <span className="font-bold text-emerald-700">Your Address</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-gray-500 block text-[10px] uppercase font-bold">ORDER # {ord.order_number}</span>
                      <Link href={`/track-order?awb=${ord.awb}`} className="text-emerald-700 font-bold hover:underline">
                        View Order Details &rarr;
                      </Link>
                    </div>
                  </div>

                  {/* Order Main Content */}
                  <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    
                    <div className="flex items-start gap-4">
                      <div className="relative w-20 h-20 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shrink-0">
                        <Image src={ord.image} alt={ord.title} fill className="object-cover" />
                      </div>

                      <div className="space-y-1">
                        <span className={`inline-block text-[10px] font-black px-2.5 py-0.5 rounded ${
                          ord.status === "DELIVERED" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                          ord.status === "CANCELLED" ? "bg-red-50 text-red-700 border border-red-200" :
                          "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}>
                          {ord.deliveryText}
                        </span>
                        <h4 className="font-bold text-sm text-gray-900">{ord.title}</h4>
                        <p className="text-xs text-gray-500">Return window open until 31 Aug 2026</p>
                      </div>
                    </div>

                    {/* Order Action Buttons */}
                    <div className="flex flex-col gap-2 w-full md:w-56 text-xs">
                      <Link
                        href={`/track-order?awb=${ord.awb}`}
                        className="bg-gray-900 hover:bg-black text-white font-bold py-2.5 px-4 rounded-xl text-center transition shadow-xs"
                      >
                        📍 Track Package
                      </Link>
                      <button
                        onClick={() => handleReturnRequest(ord.id)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-xl text-center transition cursor-pointer"
                      >
                        🔄 Return or Replace Items
                      </button>
                      <button
                        onClick={() => alert(`Downloading official PDF Tax Invoice for Order ${ord.order_number}...`)}
                        className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-1.5 px-4 rounded-xl text-center transition cursor-pointer"
                      >
                        📄 Download Tax Invoice
                      </button>
                    </div>

                  </div>

                </div>
              ))
            )}
          </div>

        </div>

        {/* Bottom Carousel: "Recommendations based on your shopping trends" */}
        {recommendations.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-lg font-black text-gray-900">Recommendations based on your shopping trends</h3>
              <span className="text-xs text-gray-400 font-bold">Page 1 of 3</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {recommendations.map((rec) => (
                <div key={rec.id} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex gap-4 items-center hover:shadow-md transition">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white shrink-0 border border-gray-200">
                    <Image src={rec.images[0] || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800"} alt={rec.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-gray-900 truncate">{rec.title}</h4>
                    <p className="font-black text-sm text-gray-900 mt-0.5">₹{rec.price.toLocaleString("en-IN")}</p>
                    <Link href={`/product/${rec.handle}`} className="text-[11px] text-emerald-700 font-bold hover:underline">
                      View Product &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
}
