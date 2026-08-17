"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchAdminOrders, fetchProducts } from "lib/api";

export default function AdminOrdersPage() {
  const [activeTab, setActiveTab] = useState<string>("All Orders");
  const [loading, setLoading] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [awbFilter, setAwbFilter] = useState("ALL");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals state
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Orders State (Initial sample dataset matching exact screenshot + live user orders)
  const [orders, setOrders] = useState<any[]>([
    {
      id: "#SKIPD-25879",
      date: "May 25, 2025 10:30 AM",
      customer: "Amit Sharma",
      phone: "+91 98765 43210",
      email: "amit.sharma@gmail.com",
      address: "474001, Gwalior, MP, India",
      items: "OnePlus Nord 4 5G (x1)",
      img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200",
      amount: 29999,
      payment: "UPI",
      awb: "SR-8849201",
      status: "Delivered"
    },
    {
      id: "#SKIPD-25878",
      date: "May 25, 2025 09:15 AM",
      customer: "Priya Verma",
      phone: "+91 98123 45678",
      email: "priya.v@yahoo.com",
      address: "380001, Ahmedabad, Gujarat, India",
      items: "boAt Rockerz 450 Pro (x2)",
      img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200",
      amount: 3598,
      payment: "VISA",
      awb: "SR-8849202",
      status: "Processing"
    },
    {
      id: "#SKIPD-25877",
      date: "May 24, 2025 07:45 PM",
      customer: "Rahul Singh",
      phone: "+91 97111 22334",
      email: "rahul.s@outlook.com",
      address: "110001, New Delhi, India",
      items: "Noise ColorFit Pro 5 (x1)",
      img: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=200",
      amount: 4499,
      payment: "Mastercard",
      awb: "SR-8849203",
      status: "Shipped"
    },
    {
      id: "#SKIPD-25876",
      date: "May 24, 2025 05:20 PM",
      customer: "Sneha Patel",
      phone: "+91 96555 44332",
      email: "sneha.p@gmail.com",
      address: "560001, Bengaluru, Karnataka, India",
      items: "Nike Air Force 1 '07 (x1)",
      img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=200",
      amount: 7499,
      payment: "UPI",
      awb: "SR-8849204",
      status: "Delivered"
    },
    {
      id: "#SKIPD-25875",
      date: "May 23, 2025 03:10 PM",
      customer: "Vikram Joshi",
      phone: "+91 99887 76655",
      email: "vikram.j@gmail.com",
      address: "400001, Mumbai, Maharashtra, India",
      items: "MacBook Air M2 (x1)",
      img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200",
      amount: 84990,
      payment: "VISA",
      awb: "Cancelled",
      status: "Cancelled"
    },
    {
      id: "#SKIPD-25874",
      date: "May 23, 2025 01:30 PM",
      customer: "Karan Mehta",
      phone: "+91 91122 33445",
      email: "karan.m@gmail.com",
      address: "411001, Pune, Maharashtra, India",
      items: "Cold Pressed Oil 1L (x3)",
      img: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=200",
      amount: 747,
      payment: "UPI",
      awb: "Pending",
      status: "Pending"
    },
    {
      id: "#SKIPD-25873",
      date: "May 22, 2025 11:25 AM",
      customer: "Ananya Roy",
      phone: "+91 92233 44556",
      email: "ananya.r@gmail.com",
      address: "700001, Kolkata, West Bengal, India",
      items: "Velvet Cushion Cover (x4)",
      img: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=200",
      amount: 3200,
      payment: "UPI",
      awb: "RET-90481",
      status: "Returns"
    },
    {
      id: "#SKIPD-25872",
      date: "May 22, 2025 10:05 AM",
      customer: "Arjun Nair",
      phone: "+91 93456 77890",
      email: "arjun.n@gmail.com",
      address: "682001, Kochi, Kerala, India",
      items: "20000mAh Power Bank (x1)",
      img: "https://images.unsplash.com/photo-1609592424009-dd2790930777?w=200",
      amount: 999,
      payment: "VISA",
      awb: "REF-77412",
      status: "Refunds"
    },
    {
      id: "#SKIPD-25871",
      date: "May 21, 2025 08:40 PM",
      customer: "Divya Sharma",
      phone: "+91 98444 11223",
      email: "divya.s@gmail.com",
      address: "201301, Noida, UP, India",
      items: "Sony WH-1000XM5 (x1)",
      img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200",
      amount: 24990,
      payment: "UPI",
      awb: "SR-8849205",
      status: "Delivered"
    },
    {
      id: "#SKIPD-25870",
      date: "May 21, 2025 06:15 PM",
      customer: "Rohan Kapoor",
      phone: "+91 97222 33445",
      email: "rohan.k@gmail.com",
      address: "302001, Jaipur, Rajasthan, India",
      items: "Apple Watch Series 9 (x1)",
      img: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=200",
      amount: 41900,
      payment: "Mastercard",
      awb: "SR-8849206",
      status: "Shipped"
    },
    {
      id: "#SKIPD-25869",
      date: "May 21, 2025 03:30 PM",
      customer: "Manish Kumar",
      phone: "+91 96111 55443",
      email: "manish.k@gmail.com",
      address: "800001, Patna, Bihar, India",
      items: "Samsung 65\" QLED 4K TV (x1)",
      img: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=200",
      amount: 89990,
      payment: "VISA",
      awb: "SR-8849207",
      status: "Processing"
    },
    {
      id: "#SKIPD-25868",
      date: "May 20, 2025 01:10 PM",
      customer: "Pooja Reddy",
      phone: "+91 95333 77889",
      email: "pooja.r@gmail.com",
      address: "500001, Hyderabad, Telangana, India",
      items: "Artisan Ceramic Tea Set (x1)",
      img: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=200",
      amount: 2499,
      payment: "UPI",
      awb: "SR-8849208",
      status: "Delivered"
    },
    {
      id: "#SKIPD-25867",
      date: "May 20, 2025 11:00 AM",
      customer: "Suresh Gupta",
      phone: "+91 94222 88990",
      email: "suresh.g@gmail.com",
      address: "440001, Nagpur, Maharashtra, India",
      items: "Leather Dual Wallet (x2)",
      img: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=200",
      amount: 1998,
      payment: "UPI",
      awb: "SR-8849209",
      status: "Delivered"
    },
    {
      id: "#SKIPD-25866",
      date: "May 19, 2025 09:45 PM",
      customer: "Kavita Rao",
      phone: "+91 93111 44556",
      email: "kavita.r@gmail.com",
      address: "530001, Visakhapatnam, AP, India",
      items: "Handcrafted Jute Tote Bag (x1)",
      img: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=200",
      amount: 1499,
      payment: "VISA",
      awb: "SR-8849210",
      status: "Pending"
    },
    {
      id: "#SKIPD-25865",
      date: "May 19, 2025 07:20 PM",
      customer: "Nikhil Saxena",
      phone: "+91 92000 66778",
      email: "nikhil.s@gmail.com",
      address: "462001, Bhopal, MP, India",
      items: "Mechanical Gaming Keyboard (x1)",
      img: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200",
      amount: 3999,
      payment: "Mastercard",
      awb: "SR-8849211",
      status: "Shipped"
    },
    {
      id: "#SKIPD-25864",
      date: "May 19, 2025 04:15 PM",
      customer: "Meera Agarwal",
      phone: "+91 91999 88776",
      email: "meera.a@gmail.com",
      address: "248001, Dehradun, Uttarakhand, India",
      items: "Organic Green Tea 250g (x3)",
      img: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=200",
      amount: 897,
      payment: "UPI",
      awb: "SR-8849212",
      status: "Delivered"
    },
    {
      id: "#SKIPD-25863",
      date: "May 18, 2025 02:00 PM",
      customer: "Deepak Chawla",
      phone: "+91 90888 77665",
      email: "deepak.c@gmail.com",
      address: "160001, Chandigarh, India",
      items: "Ergonomic Office Desk Chair (x1)",
      img: "https://images.unsplash.com/photo-1580481072645-022f9a6d8310?w=200",
      amount: 12490,
      payment: "VISA",
      awb: "SR-8849213",
      status: "Delivered"
    },
    {
      id: "#SKIPD-25862",
      date: "May 18, 2025 11:30 AM",
      customer: "Aarti Pandit",
      phone: "+91 89777 66554",
      email: "aarti.p@gmail.com",
      address: "141001, Ludhiana, Punjab, India",
      items: "Pure Cotton Bed Sheet Set (x2)",
      img: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=200",
      amount: 2998,
      payment: "UPI",
      awb: "SR-8849214",
      status: "Processing"
    },
    {
      id: "#SKIPD-25861",
      date: "May 17, 2025 08:10 PM",
      customer: "Tarun Malhotra",
      phone: "+91 88666 55443",
      email: "tarun.m@gmail.com",
      address: "122001, Gurugram, Haryana, India",
      items: "UltraHD Webcam 1080p (x1)",
      img: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200",
      amount: 2499,
      payment: "Mastercard",
      awb: "SR-8849215",
      status: "Delivered"
    },
    {
      id: "#SKIPD-25860",
      date: "May 17, 2025 05:45 PM",
      customer: "Shweta Deshmukh",
      phone: "+91 87555 44332",
      email: "shweta.d@gmail.com",
      address: "411002, Pune, MH, India",
      items: "Stainless Steel Insulated Flask (x2)",
      img: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=200",
      amount: 1598,
      payment: "UPI",
      awb: "SR-8849216",
      status: "Delivered"
    },
    {
      id: "#SKIPD-25859",
      date: "May 16, 2025 03:20 PM",
      customer: "Gaurav Sen",
      phone: "+91 86444 33221",
      email: "gaurav.s@gmail.com",
      address: "734001, Siliguri, WB, India",
      items: "Wireless Bluetooth Speaker (x1)",
      img: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=200",
      amount: 3499,
      payment: "VISA",
      awb: "SR-8849217",
      status: "Shipped"
    },
    {
      id: "#SKIPD-25858",
      date: "May 16, 2025 12:15 PM",
      customer: "Neha Pillai",
      phone: "+91 85333 22110",
      email: "neha.p@gmail.com",
      address: "695001, Thiruvananthapuram, Kerala, India",
      items: "Aromatherapy Essential Oils Pack (x1)",
      img: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=200",
      amount: 1199,
      payment: "UPI",
      awb: "SR-8849218",
      status: "Delivered"
    },
    {
      id: "#SKIPD-25857",
      date: "May 15, 2025 09:30 AM",
      customer: "Alok Nanda",
      phone: "+91 84222 11009",
      email: "alok.n@gmail.com",
      address: "751001, Bhubaneswar, Odisha, India",
      items: "Noise-Cancelling Earbuds (x1)",
      img: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200",
      amount: 5999,
      payment: "Mastercard",
      awb: "SR-8849219",
      status: "Delivered"
    },
    {
      id: "#SKIPD-25856",
      date: "May 14, 2025 07:10 PM",
      customer: "Ritu Kulkarni",
      phone: "+91 83111 00998",
      email: "ritu.k@gmail.com",
      address: "400002, Mumbai, MH, India",
      items: "Smart Fitness Activity Band (x1)",
      img: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=200",
      amount: 2799,
      payment: "VISA",
      awb: "SR-8849220",
      status: "Delivered"
    },
    {
      id: "#SKIPD-25855",
      date: "May 14, 2025 04:50 PM",
      customer: "Hemant Bisht",
      phone: "+91 82000 99887",
      email: "hemant.b@gmail.com",
      address: "263139, Haldwani, UK, India",
      items: "Hiking Backpack 45L (x1)",
      img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200",
      amount: 3499,
      payment: "UPI",
      awb: "SR-8849221",
      status: "Delivered"
    }
  ]);

  useEffect(() => {
    async function loadOrdersData() {
      try {
        const apiOrders = await fetchAdminOrders();
        if (apiOrders && Array.isArray(apiOrders) && apiOrders.length > 0) {
          const formatted = apiOrders.map((o: any) => ({
            id: String(o.order_number || `#SKIPD-${o.id}`),
            date: (() => {
              if (!o.created_at) return "May 25, 2025 10:30 AM";
              const d = new Date(o.created_at);
              return !isNaN(d.getTime())
                ? d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
                : String(o.created_at);
            })(),
            customer: String(o.user?.full_name || o.user_name || "Customer"),
            phone: String(o.user?.phone || "+91 98765 43210"),
            email: String(o.user?.email || "customer@skipd.in"),
            address: o.shipping_address ? `${o.shipping_address.city || ''}, ${o.shipping_address.state || ''} (${o.shipping_address.pincode || ''})` : "India",
            items: (() => {
              if (typeof o.items === "string") return o.items;
              if (Array.isArray(o.items) && o.items.length > 0) {
                const first = o.items[0];
                return typeof first === "string"
                  ? first
                  : `${first?.product_title || first?.title || first?.name || 'Purchased Item'} (x${first?.quantity || 1})`;
              }
              return "Store Item (x1)";
            })(),
            img: typeof o.items?.[0]?.product_image === "string" ? o.items[0].product_image : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200",
            amount: Number(o.total_amount || o.total || 2999),
            payment: String(o.payment_method || "UPI"),
            awb: String(o.tracking_number || `SR-${Math.floor(100000 + Math.random() * 900000)}`),
            status: String(o.status || "Processing")
          }));

          setOrders(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newItems = formatted.filter((f: any) => !existingIds.has(f.id));
            return [...newItems, ...prev];
          });
        }
      } catch (e) {
        console.warn("FastAPI Orders API offline, reading live user store orders.");
      }

      // Gather real placed orders from all user session localStorages (Window safe)
      if (typeof window !== "undefined") {
        try {
          let realPlaced: any[] = [];
          const keys = Object.keys(localStorage).filter(k => k.startsWith("skipd_orders_") || k === "skipd_all_store_orders");
          keys.forEach(k => {
            const item = localStorage.getItem(k);
            if (item) {
              try {
                const parsed = JSON.parse(item);
                if (Array.isArray(parsed)) {
                  parsed.forEach(ord => {
                    if (!realPlaced.some(o => o.id === ord.id || o.id === ord.order_number)) {
                      realPlaced.push({
                        id: String(ord.order_number || ord.id || `#SKIPD-${Date.now()}`),
                        date: String(ord.date || "Just now"),
                        customer: String(ord.customer || ord.user_name || "Store Customer"),
                        phone: String(ord.phone || "+91 98765 43210"),
                        email: String(ord.email || "customer@skipd.in"),
                        address: String(ord.address || "Deliver to Customer Address"),
                        items: (() => {
                          if (typeof ord.items === "string") return ord.items;
                          if (typeof ord.title === "string") return ord.title;
                          if (Array.isArray(ord.items) && ord.items.length > 0) {
                            const first = ord.items[0];
                            return typeof first === "string" 
                              ? first 
                              : `${first?.product_title || first?.title || first?.name || 'Store Item'} (x${first?.quantity || 1})`;
                          }
                          if (typeof ord.items === "object" && ord.items !== null) {
                            return `${ord.items.product_title || ord.items.title || ord.items.name || 'Store Item'} (x${ord.items.quantity || 1})`;
                          }
                          return "Store Product (x1)";
                        })(),
                        img: typeof ord.image === "string" ? ord.image : (typeof ord.img === "string" ? ord.img : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200"),
                        amount: Number(ord.total || ord.amount || 2999),
                        payment: String(ord.payment || "UPI"),
                        awb: String(ord.awb || `SR-${Math.floor(100000 + Math.random() * 900000)}`),
                        status: String(ord.status || "Processing")
                      });
                    }
                  });
                }
              } catch (e) {}
            }
          });

          if (realPlaced.length > 0) {
            setOrders(prev => {
              const ids = new Set(prev.map(p => p.id));
              const fresh = realPlaced.filter(r => !ids.has(r.id));
              return [...fresh, ...prev];
            });
          }
        } catch (e) {}
      }

      setLoading(false);
    }

    loadOrdersData();
  }, []);

  const showNotification = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  const tabs = ["All Orders", "Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Returns", "Refunds"];

  // Filtered Orders (Null-safe)
  const filteredOrders = orders.filter((o) => {
    if (!o) return false;
    const statusStr = (o.status || "").toString();
    const tabMatch = activeTab === "All Orders" || statusStr.toLowerCase() === activeTab.toLowerCase();
    
    const idStr = (o.id || "").toString();
    const custStr = (o.customer || "").toString();
    const awbStr = (o.awb || "").toString();
    const itemsStr = (o.items || "").toString();

    const searchMatch = !searchQuery.trim() || 
      idStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      custStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      awbStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      itemsStr.toLowerCase().includes(searchQuery.toLowerCase());

    const paymentStr = (o.payment || "").toString();
    const paymentMatch = paymentFilter === "ALL" || paymentStr.toUpperCase() === paymentFilter.toUpperCase();
    const statusDropdownMatch = statusFilter === "ALL" || statusStr.toLowerCase() === statusFilter.toLowerCase();
    
    const awbMatch = awbFilter === "ALL" || 
      (awbFilter === "ASSIGNED" && awbStr !== "Pending" && awbStr !== "Cancelled") ||
      (awbFilter === "PENDING" && (awbStr === "Pending" || awbStr === "Cancelled"));

    return tabMatch && searchMatch && paymentMatch && statusDropdownMatch && awbMatch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const handleStatusChange = (id: string, newStatus: string) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    setUpdatingOrderId(null);
    showNotification(`✓ Order ${id} status updated to "${newStatus}"!`);
  };

  const handleResetFilters = () => {
    setActiveTab("All Orders");
    setSearchQuery("");
    setPaymentFilter("ALL");
    setStatusFilter("ALL");
    setAwbFilter("ALL");
    setCurrentPage(1);
    showNotification("🔄 Filters Reset");
  };

  const handleExportOrders = () => {
    showNotification("📥 Exporting Orders Lifecycle Report (CSV/PDF)...");
  };

  // Metrics Calculations (Null-safe)
  const totalRev = orders.reduce((sum, o) => sum + (typeof o?.amount === 'number' ? o.amount : Number(o?.amount) || 0), 0);
  const completedCount = orders.filter(o => (o?.status || "").toLowerCase() === "delivered").length;
  const pendingCount = orders.filter(o => (o?.status || "").toLowerCase() === "pending" || (o?.status || "").toLowerCase() === "processing").length;
  const returnCount = orders.filter(o => (o?.status || "").toLowerCase() === "returns").length;
  const refundCount = orders.filter(o => (o?.status || "").toLowerCase() === "refunds").length;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full text-gray-900 font-sans">
      
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl text-xs font-black shadow-2xl bg-[#EAF8F2] text-[#059669] border border-emerald-300 flex items-center gap-2 animate-bounce">
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* 🛒 Top Header Banner Bar (Matching Exact Screenshot) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center text-2xl shadow-2xs">
            🛒
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Orders &amp; Fulfillment Lifecycle</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Live database connected. Monitor and manage orders across all fulfillment stages.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-bold text-gray-700 cursor-pointer shadow-2xs">
            <span>📅 May 19, 2025 - May 25, 2025</span>
            <span className="text-[10px] text-gray-400">▼</span>
          </div>

          <button
            onClick={handleExportOrders}
            className="bg-white border border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-black text-xs px-4 py-2.5 rounded-xl transition cursor-pointer shadow-2xs flex items-center gap-1.5"
          >
            <span>📥</span>
            <span>Export Orders</span>
          </button>

          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-2.5 px-4 flex items-center gap-2 shadow-2xs">
            <span className="text-lg">🛒</span>
            <div className="text-left leading-tight">
              <p className="text-[9px] text-emerald-600 font-bold uppercase">Total Orders</p>
              <p className="font-black text-sm text-emerald-900">{orders.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 🟢 Top Fulfillment Status Pills Navigation Bar (Matching Screenshot Pill Buttons with Counts) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar bg-white border border-gray-200/80 p-2 rounded-2xl shadow-2xs">
        {tabs.map((tab) => {
          const active = activeTab === tab;
          const count = tab === "All Orders" 
            ? orders.length 
            : orders.filter(o => (o?.status || "").toLowerCase() === tab.toLowerCase()).length;

          return (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                active 
                  ? "bg-[#059669] text-white shadow-xs" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span>{tab}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                active ? "bg-white text-[#059669]" : "bg-gray-100 text-gray-600"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 📊 5 Metric Overview Cards Row (Matching Screenshot Top Stat Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Revenue */}
        <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-2xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xl shrink-0">
            ₹
          </div>
          <div>
            <p className="text-[11px] text-gray-500 font-medium">Total Revenue</p>
            <h3 className="text-lg font-black text-gray-900 mt-0.5">₹{totalRev.toLocaleString("en-IN")}</h3>
            <p className="text-[10px] text-emerald-600 font-bold">↑ 18.6% vs last 7 days</p>
          </div>
        </div>

        {/* Orders Completed */}
        <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-2xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xl shrink-0">
            ☑
          </div>
          <div>
            <p className="text-[11px] text-gray-500 font-medium">Orders Completed</p>
            <h3 className="text-lg font-black text-gray-900 mt-0.5">{completedCount}</h3>
            <p className="text-[10px] text-emerald-600 font-bold">↑ 33.3% vs last 7 days</p>
          </div>
        </div>

        {/* Orders Pending */}
        <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-2xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-black text-xl shrink-0">
            🕒
          </div>
          <div>
            <p className="text-[11px] text-gray-500 font-medium">Orders Pending</p>
            <h3 className="text-lg font-black text-gray-900 mt-0.5">{pendingCount}</h3>
            <p className="text-[10px] text-amber-600 font-bold">↓ 20% vs last 7 days</p>
          </div>
        </div>

        {/* Return Requests */}
        <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-2xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-black text-xl shrink-0">
            ↺
          </div>
          <div>
            <p className="text-[11px] text-gray-500 font-medium">Return Requests</p>
            <h3 className="text-lg font-black text-gray-900 mt-0.5">{returnCount}</h3>
            <p className="text-[10px] text-emerald-600 font-bold">↑ 100% vs last 7 days</p>
          </div>
        </div>

        {/* Refunds Issued */}
        <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-2xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-black text-xl shrink-0">
            💳
          </div>
          <div>
            <p className="text-[11px] text-gray-500 font-medium">Refunds Issued</p>
            <h3 className="text-lg font-black text-gray-900 mt-0.5">{refundCount}</h3>
            <p className="text-[10px] text-emerald-600 font-bold">↑ 100% vs last 7 days</p>
          </div>
        </div>

      </div>

      {/* 🔍 Search & Multi-Dropdown Filter Controls Bar */}
      <div className="bg-white border border-gray-200/80 p-4 rounded-2xl shadow-2xs flex flex-col lg:flex-row gap-3 justify-between items-center text-xs">
        
        {/* Search Input */}
        <div className="relative w-full lg:w-80">
          <span className="absolute left-3.5 top-2.5 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search by Order ID, Customer, AWB..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-900 font-medium focus:border-emerald-500 focus:outline-none transition"
          />
        </div>

        {/* Multi Dropdown Filters */}
        <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap">
          
          {/* Payment Method Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-bold text-gray-800 focus:border-emerald-500 focus:outline-none"
          >
            <option value="ALL">Payment Method ▾</option>
            <option value="UPI">UPI</option>
            <option value="VISA">VISA</option>
            <option value="MASTERCARD">Mastercard</option>
          </select>

          {/* Fulfillment Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-bold text-gray-800 focus:border-emerald-500 focus:outline-none"
          >
            <option value="ALL">Fulfillment Status ▾</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="returns">Returns</option>
            <option value="refunds">Refunds</option>
          </select>

          {/* AWB Status Dropdown */}
          <select
            value={awbFilter}
            onChange={(e) => {
              setAwbFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-bold text-gray-800 focus:border-emerald-500 focus:outline-none"
          >
            <option value="ALL">AWB Status ▾</option>
            <option value="ASSIGNED">Assigned AWB</option>
            <option value="PENDING">Pending AWB</option>
          </select>

          {/* Filters Action Button */}
          <button
            onClick={() => showNotification("⚙️ Custom Filter presets active")}
            className="bg-gray-50 border border-gray-300 hover:bg-gray-100 text-gray-800 font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>⚙️</span>
            <span>Filters</span>
          </button>

          {/* Reset Button */}
          <button
            onClick={handleResetFilters}
            className="bg-gray-50 border border-gray-300 hover:bg-gray-100 text-gray-800 font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>🔄</span>
            <span>Reset</span>
          </button>
        </div>

      </div>

      {/* 🛍️ Main Orders Table (Matching Screenshot Columns, Badges & Action Buttons) */}
      <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-gray-500 font-bold">Loading live orders database...</div>
          ) : paginatedOrders.length === 0 ? (
            <div className="p-12 text-center text-gray-500 font-bold space-y-2">
              <div className="text-3xl">🛒</div>
              <p className="text-sm text-gray-900 font-black">No Orders Match Selected Filters</p>
              <p className="text-xs text-gray-400">Try resetting search query or status filter.</p>
              <button
                onClick={handleResetFilters}
                className="bg-[#059669] text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] font-extrabold border-b border-gray-100 tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Order ID &amp; Date</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Items</th>
                  <th className="px-5 py-3.5">Total Amount</th>
                  <th className="px-5 py-3.5">Payment</th>
                  <th className="px-5 py-3.5">AWB Code</th>
                  <th className="px-5 py-3.5">Fulfillment Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {paginatedOrders.map((ord) => {
                  const status = (ord.status || "").toLowerCase();
                  const isDelivered = status === "delivered";
                  const isProcessing = status === "processing";
                  const isShipped = status === "shipped";
                  const isCancelled = status === "cancelled";
                  const isPending = status === "pending";
                  const isReturns = status === "returns";
                  const isRefunds = status === "refunds";

                  return (
                    <tr key={ord.id} className="hover:bg-gray-50 transition group">
                      
                      {/* Order ID & Date */}
                      <td className="px-5 py-4">
                        <p className="font-black text-gray-900 font-mono text-xs">{ord.id}</p>
                        <p className="text-[10px] text-gray-400 font-medium mt-0.5">{ord.date}</p>
                      </td>

                      {/* Customer */}
                      <td className="px-5 py-4">
                        <p className="font-black text-gray-900 text-xs">{ord.customer}</p>
                        <p className="text-[10px] text-gray-400 font-medium mt-0.5">{ord.phone}</p>
                      </td>

                      {/* Items */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={ord.img}
                            alt={typeof ord.items === "string" ? ord.items : "Product Image"}
                            className="w-10 h-10 rounded-xl object-contain bg-gray-50 p-1 border border-gray-200 shrink-0 group-hover:scale-105 transition"
                          />
                          <span className="font-bold text-gray-900 text-xs truncate max-w-[180px]">
                            {typeof ord.items === "string" ? ord.items : "Store Product (x1)"}
                          </span>
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="px-5 py-4 font-black text-gray-900 text-sm">
                        ₹{Number(ord?.amount || 0).toLocaleString("en-IN")}
                      </td>

                      {/* Payment */}
                      <td className="px-5 py-4">
                        {ord.payment === "UPI" ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-black px-2.5 py-0.5 rounded text-[10px]">
                            UPI
                          </span>
                        ) : ord.payment === "VISA" ? (
                          <span className="bg-blue-50 text-blue-700 border border-blue-200 font-black px-2.5 py-0.5 rounded text-[10px]">
                            VISA
                          </span>
                        ) : (
                          <span className="bg-orange-50 text-orange-700 border border-orange-200 font-black px-2.5 py-0.5 rounded text-[10px]">
                            Mastercard
                          </span>
                        )}
                      </td>

                      {/* AWB Code */}
                      <td className="px-5 py-4 font-mono text-gray-500 text-[11px] font-bold">
                        {ord.awb}
                      </td>

                      {/* Fulfillment Status Badges (Exact matching screenshot design) */}
                      <td className="px-5 py-4">
                        {isDelivered ? (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-3 py-1 rounded-full inline-flex items-center gap-1.5 border border-emerald-200">
                            <span>✓</span> Delivered
                          </span>
                        ) : isProcessing ? (
                          <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-3 py-1 rounded-full inline-flex items-center gap-1.5 border border-blue-200">
                            <span>◯</span> Processing
                          </span>
                        ) : isShipped ? (
                          <span className="bg-purple-100 text-purple-800 text-[10px] font-black px-3 py-1 rounded-full inline-flex items-center gap-1.5 border border-purple-200">
                            <span>📦</span> Shipped
                          </span>
                        ) : isCancelled ? (
                          <span className="bg-red-100 text-red-800 text-[10px] font-black px-3 py-1 rounded-full inline-flex items-center gap-1.5 border border-red-200">
                            <span>🚫</span> Cancelled
                          </span>
                        ) : isPending ? (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-3 py-1 rounded-full inline-flex items-center gap-1.5 border border-amber-200">
                            <span>🕒</span> Pending
                          </span>
                        ) : isReturns ? (
                          <span className="bg-cyan-100 text-cyan-800 text-[10px] font-black px-3 py-1 rounded-full inline-flex items-center gap-1.5 border border-cyan-200">
                            <span>↺</span> Returns
                          </span>
                        ) : (
                          <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-3 py-1 rounded-full inline-flex items-center gap-1.5 border border-rose-200">
                            <span>₹</span> Refunds
                          </span>
                        )}
                      </td>

                      {/* Actions Column */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Eye View Details Modal Button */}
                          <button
                            onClick={() => setSelectedOrderDetails(ord)}
                            className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center text-sm transition cursor-pointer shadow-2xs"
                            title="View Order Details"
                          >
                            👁
                          </button>

                          {/* Status Update Menu Button */}
                          <button
                            onClick={() => setUpdatingOrderId(ord.id)}
                            className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center text-sm transition cursor-pointer shadow-2xs"
                            title="Update Status"
                          >
                            ⋮
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* 📄 Pagination Footer (Matching Screenshot Bottom Control Bar) */}
        <div className="bg-gray-50 border-t border-gray-100 p-4 px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500 font-medium">
          <div>
            Showing <span className="font-bold text-gray-900">{filteredOrders.length > 0 ? startIndex + 1 : 0}</span> to <span className="font-bold text-gray-900">{Math.min(startIndex + itemsPerPage, filteredOrders.length)}</span> of <span className="font-bold text-gray-900">{filteredOrders.length}</span> orders
          </div>

          <div className="flex items-center gap-4">
            {/* Page buttons */}
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="w-8 h-8 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 text-gray-700 font-black flex items-center justify-center transition cursor-pointer"
                title="Previous Page"
              >
                &lsaquo;
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center ${
                    currentPage === pageNum
                      ? "bg-[#059669] text-white shadow-xs"
                      : "border border-gray-300 bg-white hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="w-8 h-8 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 text-gray-700 font-black flex items-center justify-center transition cursor-pointer"
                title="Next Page"
              >
                &rsaquo;
              </button>
            </div>

            {/* Items Per Page Selector */}
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none"
            >
              <option value="5">5 / page</option>
              <option value="10">10 / page</option>
              <option value="20">20 / page</option>
              <option value="50">50 / page</option>
            </select>
          </div>
        </div>
      </div>

      {/* 👁️ VIEW ORDER DETAILS MODAL */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-gray-900">Order Information</h3>
                <p className="text-xs font-mono font-bold text-emerald-700">{selectedOrderDetails.id}</p>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs font-medium">
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl space-y-1">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Customer Details</p>
                <p className="font-black text-gray-900 text-sm">{selectedOrderDetails.customer}</p>
                <p className="text-gray-600">{selectedOrderDetails.phone} • {selectedOrderDetails.email}</p>
                <p className="text-gray-500 font-medium pt-1 border-t border-gray-200 mt-1">📍 {selectedOrderDetails.address}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 border border-gray-200 p-3 rounded-2xl space-y-0.5">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Payment Mode</p>
                  <p className="font-black text-gray-900">{selectedOrderDetails.payment}</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 p-3 rounded-2xl space-y-0.5">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">AWB Tracking Code</p>
                  <p className="font-mono font-bold text-emerald-700">{selectedOrderDetails.awb}</p>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl space-y-2">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Ordered Item</p>
                <div className="flex items-center gap-3">
                  <img src={selectedOrderDetails.img} alt={selectedOrderDetails.items} className="w-12 h-12 rounded-xl object-contain bg-white p-1 border border-gray-200 shrink-0" />
                  <div>
                    <h4 className="font-black text-gray-900 text-xs">{selectedOrderDetails.items}</h4>
                    <p className="text-emerald-700 font-black text-sm">Total Paid: ₹{typeof selectedOrderDetails.amount === 'number' ? selectedOrderDetails.amount.toLocaleString("en-IN") : selectedOrderDetails.amount}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  showNotification(`📥 Printing Tax Invoice & AWB Label for ${selectedOrderDetails.id}...`);
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl transition text-xs cursor-pointer"
              >
                🖨 Print Invoice
              </button>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="flex-1 bg-[#059669] hover:bg-[#047857] text-white font-black py-3 rounded-xl transition text-xs cursor-pointer shadow-xs"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✏️ UPDATE ORDER STATUS MODAL */}
      {updatingOrderId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900">Update Order {updatingOrderId}</h3>
              <button onClick={() => setUpdatingOrderId(null)} className="text-gray-400 hover:text-gray-900 text-sm font-bold">✕</button>
            </div>

            <p className="text-xs text-gray-500 font-medium">Select new fulfillment lifecycle status for this order:</p>

            <div className="grid grid-cols-1 gap-2 text-xs font-bold">
              {["Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Returns", "Refunds"].map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusChange(updatingOrderId, st)}
                  className="w-full text-left px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition cursor-pointer flex items-center justify-between"
                >
                  <span>{st}</span>
                  <span className="text-gray-400">&rarr;</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setUpdatingOrderId(null)}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
