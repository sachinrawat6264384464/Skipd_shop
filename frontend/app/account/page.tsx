"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { LoginModal } from "components/auth/login-modal";
import { useWishlist } from "components/wishlist/wishlist-context";
import { getUserAddressesKey, getUserOrdersKey } from "lib/utils";

function AccountContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "addresses";
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const [user, setUser] = useState<{ user_name: string; email: string; phone?: string; gender?: string }>({
    user_name: "Sachin Rawat",
    email: "sachin.rawat@email.com",
    phone: "+91 6264384464",
    gender: "Male"
  });

  const [firstName, setFirstName] = useState("Sachin");
  const [lastName, setLastName] = useState("Rawat");
  const [isEditingName, setIsEditingName] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("skipd_token");
    const stored = localStorage.getItem("skipd_user");
    if (token || stored) {
      setIsLoggedIn(true);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUser(parsed);
          const nameParts = (parsed.user_name || "Sachin Rawat").split(" ");
          setFirstName(nameParts[0] || "Sachin");
          setLastName(nameParts.slice(1).join(" ") || "Rawat");
        } catch (e) {}
      }
    } else {
      setIsLoggedIn(true); // Default preview
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("skipd_token");
    localStorage.removeItem("skipd_user");
    window.location.href = "/";
  };

  const orders = [
    {
      id: "SKIPD-984201",
      date: "12 Aug 2026",
      items: "Minimalist Oversized Graphic Tee (Size M)",
      total: 1299.0,
      status: "SHIPPED",
      awb: "SR-AWB-984201"
    },
    {
      id: "SKIPD-842915",
      date: "05 Aug 2026",
      items: "Active ANC Wireless Headphones",
      total: 4999.0,
      status: "DELIVERED",
      awb: "SR-AWB-842915"
    }
  ];

  // 📍 Addresses State
  const [addresses, setAddresses] = useState<any[]>([]);

  const loadUserAddresses = () => {
    const key = getUserAddressesKey();
    const saved = localStorage.getItem(key);
    if (saved !== null) {
      try {
        setAddresses(JSON.parse(saved));
        return;
      } catch (e) {}
    }
    setAddresses([]);
  };

  useEffect(() => {
    loadUserAddresses();
    window.addEventListener("skipd_auth_changed", loadUserAddresses);
    return () => {
      window.removeEventListener("skipd_auth_changed", loadUserAddresses);
    };
  }, []);

  const saveAddresses = (newAddrs: any[]) => {
    setAddresses(newAddrs);
    const key = getUserAddressesKey();
    localStorage.setItem(key, JSON.stringify(newAddrs));
  };

  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any | null>(null);

  // Modal Form Inputs
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formPincode, setFormPincode] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formLandmark, setFormLandmark] = useState("");
  const [formType, setFormType] = useState("HOME");
  const [formIsDefault, setFormIsDefault] = useState(false);

  const handleOpenAddModal = () => {
    setEditingAddress(null);
    setFormName(user.user_name || "");
    setFormPhone(user.phone || "");
    setFormPincode("");
    setFormAddress("");
    setFormLandmark("");
    setFormType("HOME");
    setFormIsDefault(false);
    setIsAddAddressModalOpen(true);
  };

  const handleEditAddress = (addr: any) => {
    setEditingAddress(addr);
    setFormName(addr.name);
    setFormPhone(addr.phone);
    setFormPincode(addr.pincode);
    setFormAddress(addr.address);
    setFormLandmark(addr.landmark);
    setFormType(addr.type);
    setFormIsDefault(addr.isDefault);
    setIsAddAddressModalOpen(true);
  };

  const handleDeleteAddress = (id: number) => {
    if (confirm("Are you sure you want to delete this address?")) {
      const updated = addresses.filter((a) => a.id !== id);
      saveAddresses(updated);
    }
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    let updatedList: any[] = [];
    if (editingAddress) {
      updatedList = addresses.map((a) =>
        a.id === editingAddress.id
          ? {
              ...a,
              name: formName,
              phone: formPhone,
              pincode: formPincode,
              address: formAddress,
              landmark: formLandmark,
              type: formType,
              isDefault: formIsDefault
            }
          : formIsDefault
          ? { ...a, isDefault: false }
          : a
      );
    } else {
      const newObj = {
        id: Date.now(),
        name: formName || user.user_name || "Customer",
        phone: formPhone || user.phone || "+91 9876543210",
        pincode: formPincode || "560103",
        address: formAddress,
        landmark: formLandmark || "Near Central Location",
        type: formType,
        isDefault: formIsDefault || addresses.length === 0
      };
      if (formIsDefault) {
        updatedList = addresses.map((a) => ({ ...a, isDefault: false })).concat(newObj);
      } else {
        updatedList = [...addresses, newObj];
      }
    }
    saveAddresses(updatedList);
    setIsAddAddressModalOpen(false);
    setEditingAddress(null);
  };

  // -------------------------------------------------------------
  // 📦 24-HOUR EXPRESS RETURN PRODUCTS POLICY TAB STATE & LOGIC
  // -------------------------------------------------------------
  const [returnSubTab, setReturnSubTab] = useState("All Orders");
  const [returnSearchQuery, setReturnSearchQuery] = useState("");
  const [selectedReturnProduct, setSelectedReturnProduct] = useState<any | null>(null);

  const [returnReason, setReturnReason] = useState("Damaged Item Received");
  const [returnDescription, setReturnDescription] = useState("");
  const [returnContactPhone, setReturnContactPhone] = useState("+91 98765 43210");
  const [returnPhotoUploaded, setReturnPhotoUploaded] = useState(false);

  const [returnOrders, setReturnOrders] = useState<any[]>([]);
  const [returnTimers, setReturnTimers] = useState<{ [key: string]: { label: string | null; isExpired: boolean } }>({});

  const calculateReturnTimer = (orderTimestamp: number) => {
    const windowEnd = orderTimestamp + 24 * 3600 * 1000;
    const diff = windowEnd - Date.now();
    if (diff <= 0) return { label: null, isExpired: true };

    const hours = Math.floor(diff / (3600 * 1000));
    const minutes = Math.floor((diff % (3600 * 1000)) / (60 * 1000));
    const seconds = Math.floor((diff % (60 * 1000)) / 1000);

    const pad = (n: number) => n.toString().padStart(2, '0');
    return {
      label: `${hours}h : ${pad(minutes)}m : ${pad(seconds)}s`,
      isExpired: false
    };
  };

  const loadUserReturnOrders = () => {
    const key = getUserOrdersKey();
    const storedStr = localStorage.getItem(key) || localStorage.getItem("skipd_user_return_orders");
    if (storedStr) {
      try {
        const raw = JSON.parse(storedStr);
        if (Array.isArray(raw) && raw.length > 0) {
          const normalized: any[] = [];
          raw.forEach((ord: any) => {
            const orderTimestamp = ord.orderTimestamp || (ord.createdAt ? new Date(ord.createdAt).getTime() : Date.now());
            const orderId = ord.id || ord.orderNumber || `#SKIPD-${Math.floor(10000 + Math.random() * 90000)}`;

            if (ord.items && Array.isArray(ord.items) && ord.items.length > 0) {
              ord.items.forEach((item: any, idx: number) => {
                normalized.push({
                  id: `${orderId}${ord.items.length > 1 ? `-${idx + 1}` : ''}`,
                  parentOrderId: orderId,
                  productName: item.title || item.productName || "Ordered Product",
                  specs: item.variant || item.specs || "Standard Variant",
                  price: item.price || ord.totalPrice || ord.amount || 999,
                  deliveredDate: ord.deliveredDate || `Delivered on ${new Date(orderTimestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
                  image: item.featuredImage?.url || item.image || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300",
                  orderTimestamp: orderTimestamp,
                  status: ord.status || "DELIVERED",
                  returnStatus: item.returnStatus || ord.returnStatus || (Date.now() - orderTimestamp > 24 * 3600 * 1000 ? "EXPIRED" : "ELIGIBLE"),
                  queryId: item.queryId || ord.queryId,
                  expiredText: Date.now() - orderTimestamp > 24 * 3600 * 1000 ? "Expired 24h Policy Window" : null
                });
              });
            } else {
              normalized.push({
                id: orderId,
                parentOrderId: orderId,
                productName: ord.productName || "Ordered Product",
                specs: ord.specs || "Standard Variant",
                price: ord.price || ord.totalPrice || ord.amount || 999,
                deliveredDate: ord.deliveredDate || `Delivered on ${new Date(orderTimestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
                image: ord.image || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300",
                orderTimestamp: orderTimestamp,
                status: ord.status || "DELIVERED",
                returnStatus: ord.returnStatus || (Date.now() - orderTimestamp > 24 * 3600 * 1000 ? "EXPIRED" : "ELIGIBLE"),
                queryId: ord.queryId,
                expiredText: Date.now() - orderTimestamp > 24 * 3600 * 1000 ? "Expired 24h Policy Window" : null
              });
            }
          });
          setReturnOrders(normalized);
          return;
        }
      } catch (e) {}
    }
    setReturnOrders([]);
  };

  useEffect(() => {
    loadUserReturnOrders();
    window.addEventListener("skipd_auth_changed", loadUserReturnOrders);
    return () => window.removeEventListener("skipd_auth_changed", loadUserReturnOrders);
  }, []);

  useEffect(() => {
    if (returnOrders.length === 0) return;

    const updateTimers = () => {
      const newTimers: { [key: string]: { label: string | null; isExpired: boolean } } = {};
      returnOrders.forEach(o => {
        newTimers[o.id] = calculateReturnTimer(o.orderTimestamp);
      });
      setReturnTimers(newTimers);
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, [returnOrders]);

  const handleSimulateReturnOrder = () => {
    const key = getUserOrdersKey();
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    
    const sampleProducts = [
      { productName: "OnePlus Nord 4 5G", specs: "Obsidian Midnight, 8GB RAM, 256GB Storage", price: 24499, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300" },
      { productName: "Saree Premium Silk", specs: "Pure Mulberry Kanjivaram Silk, Gold Zari", price: 598, image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300" },
      { productName: "Sony WH-1000XM5 ANC Headphones", specs: "Silver, 30h Battery, Noise Cancelling", price: 29990, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300" }
    ];

    const randomProd = sampleProducts[Math.floor(Math.random() * sampleProducts.length)];
    const newOrderId = `#SKIPD-${Math.floor(10000 + Math.random() * 90000)}`;

    if (!randomProd) return;

    const newOrderObj = {
      id: newOrderId,
      orderNumber: newOrderId,
      orderTimestamp: Date.now(),
      createdAt: new Date().toISOString(),
      status: "PAID",
      totalPrice: randomProd.price,
      items: [
        {
          title: randomProd.productName,
          variant: randomProd.specs,
          price: randomProd.price,
          featuredImage: { url: randomProd.image }
        }
      ]
    };

    const updatedOrders = [newOrderObj, ...existing];
    localStorage.setItem(key, JSON.stringify(updatedOrders));
    loadUserReturnOrders();
    alert(`🎉 Success! New order ${newOrderId} placed! 24-Hour Return Window timer is now active.`);
  };

  const handleSubmitReturnForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReturnProduct) return;

    const queryId = `Q-${Math.floor(10000 + Math.random() * 90000)}`;
    const updated = returnOrders.map(o => o.id === selectedReturnProduct.id ? { ...o, returnStatus: "REQUESTED", queryId } : o);
    
    const key = getUserOrdersKey();
    localStorage.setItem("skipd_user_return_orders", JSON.stringify(updated));
    setReturnOrders(updated);

    alert(`✓ Return query #${queryId} submitted successfully! Our support team will review within 12 hours.`);
    setSelectedReturnProduct(null);
    setReturnPhotoUploaded(false);
    setReturnDescription("");
  };

  const eligibleReturnCount = returnOrders.filter(o => o.returnStatus === "ELIGIBLE" && !returnTimers[o.id]?.isExpired).length;
  const requestedReturnCount = returnOrders.filter(o => o.returnStatus === "REQUESTED").length;
  const completedReturnCount = returnOrders.filter(o => o.returnStatus === "COMPLETED").length;

  const filteredReturnOrders = returnOrders.filter(o => {
    if (returnSubTab.startsWith("Return Eligible")) {
      if (o.returnStatus !== "ELIGIBLE" || returnTimers[o.id]?.isExpired) return false;
    } else if (returnSubTab.startsWith("Return Requested")) {
      if (o.returnStatus !== "REQUESTED") return false;
    } else if (returnSubTab.startsWith("Return Completed")) {
      if (o.returnStatus !== "COMPLETED") return false;
    }

    if (returnSearchQuery.trim()) {
      const q = returnSearchQuery.toLowerCase();
      const matchId = o.id.toLowerCase().includes(q);
      const matchName = o.productName.toLowerCase().includes(q);
      const matchSpecs = o.specs ? o.specs.toLowerCase().includes(q) : false;
      return matchId || matchName || matchSpecs;
    }

    return true;
  });

  const coupons = [
    { code: "SKIPD250", discount: "₹250 OFF", minOrder: "Min order ₹1,499", expiry: "Valid till 31 Aug 2026" },
    { code: "FREEDOM50", discount: "50% OFF", minOrder: "Min order ₹999", expiry: "Valid till 25 Aug 2026" }
  ];

  const { wishlist } = useWishlist();

  const notifications = [
    { id: 1, title: "Shipment Dispatched", text: "Your order SKIPD-984201 is on its way via BlueDart Courier.", time: "2 hours ago" },
    { id: 2, title: "Supercoins Credited", text: "250 Supercoins added to your wallet.", time: "1 day ago" }
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-gray-900 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* 📌 SINGLE UNIFIED LEFT SIDEBAR */}
        <div className="space-y-4 lg:col-span-1">
          
          {/* User Header Profile Card */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-[#10B981] text-white font-black text-xl flex items-center justify-center shadow-xs shrink-0">
              {user.user_name[0] || "S"}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Hello,</p>
              <p className="font-black text-base text-gray-900 truncate">{user.user_name}</p>
              <p className="text-xs text-gray-400 font-medium truncate">{user.email}</p>
            </div>
          </div>

          {/* Navigation Sidebar Menu */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-4 space-y-4 text-xs shadow-2xs divide-y divide-gray-100 font-bold text-gray-700">
            
            {/* MY ORDERS */}
            <div>
              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full flex items-center justify-between font-black text-xs py-2.5 px-3.5 rounded-xl transition cursor-pointer ${
                  activeTab === "orders" ? "bg-gray-900 text-white shadow-xs" : "text-gray-800 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m-8-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span className="tracking-wide">MY ORDERS</span>
                </div>
                <span className="text-sm font-black">&rsaquo;</span>
              </button>

              {/* ♻️ 24h Return Products Policy Single Sidebar Link */}
              <button
                onClick={() => setActiveTab("returns")}
                className={`w-full flex items-center justify-between font-bold text-xs py-2.5 px-3.5 rounded-xl transition cursor-pointer mt-1 ${
                  activeTab === "returns"
                    ? "bg-[#EAF8F2] text-[#059669] border border-emerald-200/60 font-black"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Return Products Policy</span>
                </div>
                <span className="text-[9px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full">24h Policy</span>
              </button>
            </div>

            {/* ACCOUNT SETTINGS */}
            <div className="pt-3 space-y-1">
              <p className="font-extrabold text-gray-400 px-3.5 uppercase text-[10px] tracking-wider mb-1.5">
                Account Settings
              </p>
              
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-3 py-2.5 px-3.5 rounded-xl font-bold transition cursor-pointer text-xs ${
                  activeTab === "profile" 
                    ? "bg-[#EAF8F2] text-[#059669] border border-emerald-200/60 font-black" 
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Profile Information</span>
              </button>

              <button
                onClick={() => setActiveTab("addresses")}
                className={`w-full flex items-center gap-3 py-2.5 px-3.5 rounded-xl transition cursor-pointer text-xs ${
                  activeTab === "addresses" 
                    ? "bg-[#EAF8F2] text-[#059669] border border-emerald-200/60 font-black" 
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-bold"
                }`}
              >
                <svg className="w-4 h-4 opacity-80 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Manage Addresses</span>
              </button>
            </div>

            {/* PAYMENTS & WALLET */}
            <div className="pt-3 space-y-1">
              <p className="font-extrabold text-gray-400 px-3.5 uppercase text-[10px] tracking-wider mb-1.5">
                Payments &amp; Wallet
              </p>
              
              <button
                onClick={() => setActiveTab("gift-cards")}
                className={`w-full flex justify-between items-center py-2.5 px-3.5 rounded-xl font-bold transition cursor-pointer text-xs ${
                  activeTab === "gift-cards" ? "bg-[#EAF8F2] text-[#059669] border border-emerald-200/60 font-black" : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Gift Cards</span>
                </div>
                <span className="text-[#059669] font-black">₹0</span>
              </button>

              <button
                onClick={() => setActiveTab("wallet")}
                className={`w-full flex items-center gap-3 py-2.5 px-3.5 rounded-xl font-bold transition cursor-pointer text-xs ${
                  activeTab === "wallet" ? "bg-[#EAF8F2] text-[#059669] border border-emerald-200/60 font-black" : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Saved Cards &amp; Wallet</span>
              </button>
            </div>

            {/* MY STUFF */}
            <div className="pt-3 space-y-1">
              <p className="font-extrabold text-gray-400 px-3.5 uppercase text-[10px] tracking-wider mb-1.5">
                My Stuff
              </p>
              
              <button
                onClick={() => setActiveTab("coupons")}
                className={`w-full flex items-center gap-3 py-2.5 px-3.5 rounded-xl font-bold transition cursor-pointer text-xs ${
                  activeTab === "coupons" ? "bg-[#EAF8F2] text-[#059669] border border-emerald-200/60 font-black" : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 11h.01M7 15h.01M13 7h.01M13 11h.01M13 15h.01M17 7h.01M17 11h.01M17 15h.01" />
                </svg>
                <span>My Coupons (2 Active)</span>
              </button>

              <button
                onClick={() => setActiveTab("supercoin")}
                className={`w-full flex items-center gap-3 py-2.5 px-3.5 rounded-xl font-bold transition cursor-pointer text-xs ${
                  activeTab === "supercoin" ? "bg-[#EAF8F2] text-[#059669] border border-emerald-200/60 font-black" : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Supercoins &amp; Plus Zone</span>
              </button>

              <button
                onClick={() => setActiveTab("wishlist")}
                className={`w-full flex items-center gap-3 py-2.5 px-3.5 rounded-xl font-bold transition cursor-pointer text-xs ${
                  activeTab === "wishlist" ? "bg-[#EAF8F2] text-[#059669] border border-emerald-200/60 font-black" : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>My Wishlist ({wishlist.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("notifications")}
                className={`w-full flex items-center gap-3 py-2.5 px-3.5 rounded-xl font-bold transition cursor-pointer text-xs ${
                  activeTab === "notifications" ? "bg-[#EAF8F2] text-[#059669] border border-emerald-200/60 font-black" : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span>All Notifications</span>
              </button>
            </div>

            {/* LOGOUT */}
            <div className="pt-3">
              <button
                onClick={handleLogout}
                className="w-full text-left py-2.5 px-3.5 rounded-xl font-black text-red-600 hover:bg-red-50 transition flex items-center gap-2.5 cursor-pointer text-xs"
              >
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout Account</span>
              </button>
            </div>

          </div>
        </div>

        {/* 📄 Right Main Content Panel */}
        <div className="lg:col-span-3 space-y-6">

          {/* ♻️ TAB: 24-HOUR EXPRESS PRODUCT RETURN WINDOW (UNIFIED SINGLE SIDEBAR) */}
          {activeTab === "returns" && (
            <div className="space-y-6">
              
              {/* Top Banner Box */}
              <div className="bg-white border border-gray-200/80 p-5 md:p-6 rounded-2xl shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2 font-medium">
                    <button onClick={() => setActiveTab("profile")} className="hover:underline text-gray-600 font-bold">My Account</button>
                    <span>&rsaquo;</span>
                    <span className="font-bold text-gray-900">Return Products Policy</span>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#EAF8F2] text-[#059669] flex items-center justify-center shrink-0 border border-emerald-200/60">
                      <svg className="w-6 h-6 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m-8-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div>
                      <h1 className="text-xl font-black text-gray-900">24-Hour Express Product Return Window</h1>
                      <p className="text-xs text-gray-500 font-medium mt-1">
                        Strict 24-hour return policy starts automatically upon payment completion. Submit return queries with product photos within 24 hours.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#EAF8F2] border border-emerald-200/80 p-3.5 rounded-2xl text-center shrink-0 w-full md:w-auto space-y-0.5">
                  <p className="text-xs font-black text-[#059669] flex items-center justify-center gap-1.5">
                    <svg className="w-4 h-4 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Strict 24h Policy Guarantee</span>
                  </p>
                  <p className="text-[10px] font-bold text-gray-500">100% Refund • No Questions Asked</p>
                </div>
              </div>

              {/* Main 2 Column Row: Purchases List + Return Policy Card */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left 8 Cols: Purchases & Eligibility */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-black text-base text-gray-900">Your Recent Purchases &amp; Eligibility</h3>
                    <button
                      onClick={handleSimulateReturnOrder}
                      className="bg-emerald-50 hover:bg-emerald-100 text-[#059669] border border-emerald-200 text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                      title="Simulate placing a new order to test live 24h return window"
                    >
                      <span>+</span>
                      <span>Simulate Order</span>
                    </button>
                  </div>

                  {/* Sub-Filter Tabs Bar */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white border border-gray-200/80 p-2 rounded-2xl shadow-2xs">
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs font-bold w-full sm:w-auto">
                      {[
                        { label: `All Orders (${returnOrders.length})`, tabKey: "All Orders" },
                        { label: `Return Eligible (${eligibleReturnCount})`, tabKey: "Return Eligible" },
                        { label: `Return Requested (${requestedReturnCount})`, tabKey: "Return Requested" },
                        { label: `Return Completed (${completedReturnCount})`, tabKey: "Return Completed" }
                      ].map((item) => {
                        const isSelected = returnSubTab === item.tabKey || returnSubTab === item.label;
                        return (
                          <button
                            key={item.label}
                            onClick={() => setReturnSubTab(item.tabKey)}
                            className={`px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap text-xs ${
                              isSelected ? "bg-[#EAF8F2] text-[#059669] border border-emerald-200/80 font-black" : "text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <div className="relative w-full sm:w-36">
                        <input
                          type="text"
                          placeholder="Search in your orders.."
                          value={returnSearchQuery}
                          onChange={(e) => setReturnSearchQuery(e.target.value)}
                          className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none w-full pr-7"
                        />
                        {returnSearchQuery && (
                          <button onClick={() => setReturnSearchQuery("")} className="absolute right-2 top-1.5 text-gray-400 hover:text-gray-700 text-xs">✕</button>
                        )}
                      </div>

                      <button
                        onClick={() => { setReturnSearchQuery(""); setReturnSubTab("All Orders"); }}
                        className="bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        <span>Filters</span>
                      </button>
                    </div>
                  </div>

                  {/* Cards List matching exact screenshot design */}
                  <div className="space-y-4">
                    {returnOrders.length === 0 ? (
                      <div className="bg-white border border-gray-200/80 p-10 rounded-2xl text-center space-y-4 text-gray-500 text-xs">
                        <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#059669] flex items-center justify-center mx-auto border border-emerald-100">
                          <svg className="w-8 h-8 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m-8-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-extrabold text-gray-900 text-sm">No Purchased Orders Found</p>
                          <p className="text-gray-500 max-w-sm mx-auto mt-1">
                            When you place an order on SKIPD Commerce, your purchased items will automatically appear here with a 24-hour return window!
                          </p>
                        </div>
                        <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                          <Link
                            href="/"
                            className="bg-[#059669] hover:bg-[#047857] text-white font-black px-5 py-2.5 rounded-xl transition shadow-2xs inline-block"
                          >
                            Browse Products &amp; Shop Now
                          </Link>
                          <button
                            onClick={handleSimulateReturnOrder}
                            className="bg-emerald-50 hover:bg-emerald-100 text-[#059669] border border-emerald-200 font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
                          >
                            + Simulate Test Order
                          </button>
                        </div>
                      </div>
                    ) : filteredReturnOrders.length === 0 ? (
                      <div className="bg-white border border-gray-200/80 p-8 rounded-2xl text-center space-y-2 text-gray-500 text-xs">
                        <p className="font-bold text-gray-800">No orders match filter "{returnSubTab}"</p>
                        <p>Try switching filter tabs or clearing your search.</p>
                      </div>
                    ) : (
                      filteredReturnOrders.map((item) => {
                        const timerData = returnTimers[item.id] || calculateReturnTimer(item.orderTimestamp);
                        const isExpired = timerData.isExpired || item.returnStatus === "EXPIRED";
                        const isEligible = item.returnStatus === "ELIGIBLE" && !isExpired;
                        const isRequested = item.returnStatus === "REQUESTED";
                        const isCompleted = item.returnStatus === "COMPLETED";

                        return (
                          <div key={item.id} className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            
                            {/* Product Image & Info */}
                            <div className="flex items-center gap-4">
                              <img
                                src={item.image}
                                alt={item.productName}
                                onError={(e: any) => {
                                  e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300";
                                }}
                                className="w-16 h-16 rounded-xl object-cover border border-gray-100 bg-gray-50 shrink-0"
                              />
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold font-mono text-gray-500">Order ID: {item.id}</span>
                                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.2 rounded uppercase">
                                    {item.status}
                                  </span>
                                </div>
                                <h4 className="font-black text-gray-900 text-sm leading-tight">{item.productName}</h4>
                                <p className="font-black text-gray-900 text-sm">₹{item.price.toLocaleString("en-IN")}</p>
                                <p className="text-[10px] text-gray-400 font-medium">{item.deliveredDate}</p>
                              </div>
                            </div>

                            {/* Center Window Timer Box + Right Actions */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto justify-end border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0">
                              
                              {/* 24h Window Timer Box */}
                              <div className="text-center sm:text-right w-full sm:w-auto">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">24H RETURN WINDOW</p>
                                {isEligible ? (
                                  <div className="bg-[#EAF8F2] border border-emerald-200/80 px-3 py-1.5 rounded-xl mt-0.5 space-y-0.5">
                                    <p className="text-xs font-black text-[#059669] font-mono flex items-center justify-center sm:justify-end gap-1.5">
                                      <span>⏳</span>
                                      <span>{timerData.label || "Calculating..."}</span>
                                    </p>
                                    <p className="text-[9px] text-gray-500 font-medium">remaining</p>
                                  </div>
                                ) : (
                                  <div className="bg-[#FEF2F2] border border-red-200 px-3 py-1.5 rounded-xl mt-0.5 space-y-0.5">
                                    <p className="text-xs font-bold text-red-600 flex items-center justify-center sm:justify-end gap-1">
                                      <span>🚫</span> Return Window Expired
                                    </p>
                                    <p className="text-[9px] text-gray-400 font-medium">{item.expiredText || "Expired 24h Policy Window"}</p>
                                  </div>
                                )}
                              </div>

                              {/* Action Buttons (Sleek Compact Size) */}
                              <div className="space-y-1.5 text-center w-full sm:w-auto shrink-0">
                                {isCompleted ? (
                                  <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-4 py-2 rounded-xl block border border-emerald-200">
                                    ✓ Return Completed
                                  </span>
                                ) : isRequested ? (
                                  <span className="bg-blue-100 text-blue-800 text-xs font-black px-4 py-2 rounded-xl block border border-blue-200">
                                    ✓ Request Pending
                                  </span>
                                ) : isEligible ? (
                                  <button
                                    onClick={() => setSelectedReturnProduct(item)}
                                    className="bg-[#059669] hover:bg-[#047857] text-white font-black text-xs px-4 py-2 rounded-xl transition shadow-2xs cursor-pointer w-full text-center leading-snug"
                                  >
                                    Return Product Now
                                  </button>
                                ) : (
                                  <button
                                    disabled
                                    className="bg-gray-100 text-gray-400 font-bold text-xs px-4 py-2 rounded-xl cursor-not-allowed w-full text-center leading-snug"
                                  >
                                    Return Period Expired
                                  </button>
                                )}

                                <button
                                  onClick={() => alert(`Order Details for ${item.id}:\nItem: ${item.productName}\nAmount: ₹${item.price}\nStatus: ${item.status}`)}
                                  className="text-[11px] font-bold text-gray-500 hover:text-gray-900 block w-full text-center cursor-pointer"
                                >
                                  View Order Details &rsaquo;
                                </button>
                              </div>

                            </div>

                          </div>
                        );
                      })
                    )}
                  </div>

                </div>

                {/* Right 4 Cols: Return Policy Information Card */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs space-y-5">
                    <h3 className="font-black text-base text-gray-900 border-b border-gray-100 pb-3">Return Policy</h3>

                    <div className="space-y-4 text-xs">
                      
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">24-Hour Return Window</h4>
                          <p className="text-gray-500 mt-0.5 leading-relaxed">You can raise return request within 24 hours of order delivery.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m-8-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">Product Condition</h4>
                          <p className="text-gray-500 mt-0.5 leading-relaxed">Items must be unused, unwashed, undamaged and in original packaging.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h0.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">Photo Required</h4>
                          <p className="text-gray-500 mt-0.5 leading-relaxed">Clear photos of product and packaging are mandatory.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">Refund Process</h4>
                          <p className="text-gray-500 mt-0.5 leading-relaxed">Once return is approved, refund will be processed within 3-5 business days.</p>
                        </div>
                      </div>

                    </div>

                    <button
                      onClick={() => alert("SKIPD 24-Hour Return Policy:\n\n1. Return window opens immediately upon delivery.\n2. Raise request with photos within 24 hours.\n3. Inspection completed within 12h.\n4. Pickup & refund processed in 3-5 days.")}
                      className="w-full border border-[#059669] text-[#059669] hover:bg-[#EAF8F2] font-bold text-xs py-2.5 rounded-xl transition cursor-pointer"
                    >
                      Read Full Return Policy &rsaquo;
                    </button>
                  </div>
                </div>

              </div>

              {/* 📍 Bottom How Returns Work Timeline */}
              <div className="bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs space-y-6">
                <h3 className="font-black text-base text-gray-900">How Returns Work?</h3>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center text-xs">
                  
                  {/* Step 1 */}
                  <div className="flex flex-col items-center space-y-2 flex-1">
                    <div className="w-14 h-14 rounded-full bg-[#EAF8F2] text-[#059669] flex items-center justify-center border border-emerald-200/60 shadow-2xs">
                      <svg className="w-6 h-6 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m-8-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-gray-900">1. Raise Request</h4>
                      <p className="text-[10px] text-gray-400 font-medium max-w-[130px] mt-0.5 leading-tight">Submit return request within 24 hours</p>
                    </div>
                  </div>

                  <svg className="w-5 h-5 text-gray-300 hidden md:block shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center space-y-2 flex-1">
                    <div className="w-14 h-14 rounded-full bg-[#EAF8F2] text-[#059669] flex items-center justify-center border border-emerald-200/60 shadow-2xs">
                      <svg className="w-6 h-6 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h0.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-gray-900">2. Upload Photos</h4>
                      <p className="text-[10px] text-gray-400 font-medium max-w-[130px] mt-0.5 leading-tight">Upload clear photos of product &amp; packaging</p>
                    </div>
                  </div>

                  <svg className="w-5 h-5 text-gray-300 hidden md:block shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center space-y-2 flex-1">
                    <div className="w-14 h-14 rounded-full bg-[#EAF8F2] text-[#059669] flex items-center justify-center border border-emerald-200/60 shadow-2xs">
                      <svg className="w-6 h-6 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-gray-900">3. Review</h4>
                      <p className="text-[10px] text-gray-400 font-medium max-w-[130px] mt-0.5 leading-tight">We will review your request</p>
                    </div>
                  </div>

                  <svg className="w-5 h-5 text-gray-300 hidden md:block shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>

                  {/* Step 4 */}
                  <div className="flex flex-col items-center space-y-2 flex-1">
                    <div className="w-14 h-14 rounded-full bg-[#EAF8F2] text-[#059669] flex items-center justify-center border border-emerald-200/60 shadow-2xs">
                      <svg className="w-6 h-6 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-gray-900">4. Pickup</h4>
                      <p className="text-[10px] text-gray-400 font-medium max-w-[130px] mt-0.5 leading-tight">We will pick up the product</p>
                    </div>
                  </div>

                  <svg className="w-5 h-5 text-gray-300 hidden md:block shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>

                  {/* Step 5 */}
                  <div className="flex flex-col items-center space-y-2 flex-1">
                    <div className="w-14 h-14 rounded-full bg-[#EAF8F2] text-[#059669] flex items-center justify-center border border-emerald-200/60 shadow-2xs">
                      <svg className="w-6 h-6 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-gray-900">5. Refund</h4>
                      <p className="text-[10px] text-gray-400 font-medium max-w-[130px] mt-0.5 leading-tight">Refund will be processed within 3-5 days</p>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* TAB: MANAGE ADDRESSES */}
          {activeTab === "addresses" && (
            <div className="space-y-6">
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Manage Delivery Addresses</h2>
                  <p className="text-xs text-gray-500 font-medium mt-1">Add, edit or remove addresses to deliver your orders</p>
                </div>

                <button
                  onClick={handleOpenAddModal}
                  className="bg-[#0B132B] hover:bg-black text-white text-xs font-black px-5 py-3 rounded-xl transition shadow-md flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <span className="text-base leading-none">+</span>
                  <span>Add New Address</span>
                </button>
              </div>

              {/* Address Cards List */}
              <div className="space-y-5">
                {addresses.map((addr) => {
                  const isDefault = addr.isDefault;
                  let iconBg = "bg-[#EAF8F2] text-[#059669]";
                  let badgeBg = "bg-gray-100 text-gray-600 border-gray-200";
                  let iconSvg = (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  );

                  if (addr.type === "WORK") {
                    iconBg = "bg-blue-100/70 text-blue-600";
                    badgeBg = "bg-blue-50 text-blue-600 border-blue-100";
                    iconSvg = (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4M9 7h1m-1 4h1m-1 4h1m4-8h1m-1 4h1m-1 4h1" />
                      </svg>
                    );
                  } else if (addr.type === "OTHER") {
                    iconBg = "bg-orange-100/70 text-orange-600";
                    badgeBg = "bg-orange-50 text-orange-600 border-orange-100";
                    iconSvg = (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    );
                  }

                  return (
                    <div
                      key={addr.id}
                      className={`bg-white rounded-3xl p-6 relative transition-all duration-200 shadow-2xs ${
                        isDefault 
                          ? "border-2 border-[#10B981] shadow-xs" 
                          : "border border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {isDefault && (
                        <div className="mb-4">
                          <span className="border border-[#10B981] text-[#059669] bg-[#EAF8F2] font-extrabold text-[11px] px-3.5 py-1 rounded-md inline-block">
                            Default Address
                          </span>
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-full ${iconBg} flex items-center justify-center shrink-0 border border-emerald-200/40 shadow-2xs`}>
                            {iconSvg}
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <h3 className="font-black text-base text-gray-900">{addr.name}</h3>
                              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider border ${badgeBg}`}>
                                {addr.type}
                              </span>
                            </div>

                            <p className="text-xs text-gray-500 font-bold">{addr.phone}</p>
                            <p className="text-xs text-gray-700 font-medium leading-relaxed max-w-xl">
                              {addr.address}
                            </p>

                            <div className="flex items-center gap-2 flex-wrap pt-2">
                              <span className="bg-gray-100/90 text-gray-600 border border-gray-200/80 font-bold text-[11px] px-3 py-1 rounded-full">
                                Pincode: {addr.pincode}
                              </span>
                              <span className="bg-gray-100/90 text-gray-600 border border-gray-200/80 font-bold text-[11px] px-3 py-1 rounded-full">
                                Landmark: {addr.landmark}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleEditAddress(addr)}
                            className="p-2 text-gray-600 hover:text-[#059669] bg-gray-100 hover:bg-[#EAF8F2] rounded-xl transition cursor-pointer"
                            title="Edit Address"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="p-2 text-gray-600 hover:text-red-600 bg-gray-100 hover:bg-red-50 rounded-xl transition cursor-pointer"
                            title="Delete Address"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: PROFILE INFORMATION */}
          {activeTab === "profile" && (
            <div className="bg-white border border-gray-200/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xs">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <h2 className="text-xl font-black text-gray-900">Personal Information</h2>
                <button
                  onClick={() => setIsEditingName(!isEditingName)}
                  className="text-xs font-black text-[#059669] hover:underline cursor-pointer"
                >
                  {isEditingName ? "Cancel" : "Edit"}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">First Name</label>
                  <input
                    type="text"
                    disabled={!isEditingName}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 font-bold focus:outline-none disabled:opacity-80"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Last Name</label>
                  <input
                    type="text"
                    disabled={!isEditingName}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 font-bold focus:outline-none disabled:opacity-80"
                  />
                </div>
              </div>

              {isEditingName && (
                <button
                  onClick={() => {
                    const fullName = `${firstName} ${lastName}`.trim();
                    const updated = { ...user, user_name: fullName };
                    setUser(updated);
                    localStorage.setItem("skipd_user", JSON.stringify(updated));
                    setIsEditingName(false);
                    alert("✓ Profile Name Updated!");
                  }}
                  className="bg-[#059669] text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              )}

              <div className="pt-4 border-t border-gray-100 space-y-2">
                <h3 className="font-extrabold text-sm text-gray-900">FAQs</h3>
                <div className="text-xs text-gray-500 space-y-1 font-medium">
                  <p className="font-bold text-gray-800">What happens when I update my email address (or mobile number)?</p>
                  <p>Your login email id (or mobile number) changes automatically. You'll receive all your order update notifications on the new email address.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ORDERS */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Your Order History</h2>
              <div className="space-y-4">
                {orders.map((ord) => (
                  <div key={ord.id} className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                        {ord.id} • {ord.date}
                      </span>
                      <h4 className="font-black text-gray-900 text-sm">{ord.items}</h4>
                      <p className="text-xs text-gray-500 font-bold">Total: ₹{ord.total.toLocaleString("en-IN")}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full">
                        {ord.status}
                      </span>
                      <Link
                        href={`/track-order?id=${ord.id}`}
                        className="bg-gray-900 hover:bg-black text-white text-xs font-black px-4 py-2 rounded-xl transition"
                      >
                        Track Order &rsaquo;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Return Request Modal */}
      {selectedReturnProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl text-xs">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-gray-900">↺ Product Return Request</h3>
                <p className="text-xs text-gray-500">Order #{selectedReturnProduct.id} • {selectedReturnProduct.productName}</p>
              </div>
              <button onClick={() => setSelectedReturnProduct(null)} className="text-gray-400 hover:text-gray-900 text-lg font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSubmitReturnForm} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Select Return Reason *</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
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
                  onClick={() => setReturnPhotoUploaded(true)}
                  className="border-2 border-dashed border-gray-300 hover:border-emerald-500 bg-gray-50 rounded-2xl p-4 text-center cursor-pointer transition"
                >
                  {returnPhotoUploaded ? (
                    <div className="text-[#059669] font-bold">✓ 2 Photos Uploaded Successfully (image_01.jpg, image_02.jpg)</div>
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
                  value={returnDescription}
                  onChange={(e) => setReturnDescription(e.target.value)}
                  placeholder="Describe what went wrong with the item..."
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Contact Phone Number for Pickup</label>
                <input
                  type="text"
                  required
                  value={returnContactPhone}
                  onChange={(e) => setReturnContactPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedReturnProduct(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2.5 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#059669] hover:bg-[#047857] text-white font-black py-2.5 rounded-xl shadow-md cursor-pointer"
                >
                  Submit Return Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Support Chat Widget */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => alert("Live Customer Support Chat Available 24/7!")}
          className="w-14 h-14 bg-[#10B981] hover:bg-[#059669] text-white rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-105 cursor-pointer"
          title="Customer Support Chat"
        >
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5.025L2 22l5.122-1.303A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
          </svg>
        </button>
      </div>

    </div>
  );
}

export default function CustomerAccountPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm font-bold text-gray-600">Loading Account Profile...</div>}>
      <AccountContent />
    </Suspense>
  );
}
