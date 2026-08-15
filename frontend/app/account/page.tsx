"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { LoginModal } from "components/auth/login-modal";
import { useWishlist } from "components/wishlist/wishlist-context";
import { getUserAddressesKey } from "lib/utils";

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

  // 📍 Addresses State (User-Scoped & Persistent across refreshes)
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
        
        {/* 📌 Left Sidebar (Exact Flipkart Profile Sidebar Match) */}
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
          <div className="bg-white border border-gray-200/80 rounded-2xl p-4 space-y-4 text-xs shadow-2xs divide-y divide-gray-100">
            
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

              <Link
                href="/account/returns"
                className="w-full flex items-center justify-between font-bold text-xs py-2.5 px-3.5 rounded-xl transition cursor-pointer bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm">↺</span>
                  <span className="tracking-wide font-black">24h Return Products</span>
                </div>
                <span className="text-[9px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full">24h Policy</span>
              </Link>
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

          {/* TAB: MANAGE ADDRESSES (EXACT SCREENSHOT REPLICA) */}
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
                      {/* Top Default Address Badge */}
                      {isDefault && (
                        <div className="mb-4">
                          <span className="border border-[#10B981] text-[#059669] bg-[#EAF8F2] font-extrabold text-[11px] px-3.5 py-1 rounded-md inline-block">
                            Default Address
                          </span>
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          {/* Round Icon */}
                          <div className={`w-12 h-12 rounded-full ${iconBg} flex items-center justify-center shrink-0 border border-emerald-200/40 shadow-2xs`}>
                            {iconSvg}
                          </div>

                          {/* Main Address Information */}
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

                            {/* Meta Tags (Pill Badges) */}
                            <div className="flex items-center gap-2 flex-wrap pt-2">
                              <span className="bg-gray-100/90 text-gray-600 border border-gray-200/80 font-bold text-[11px] px-3 py-1 rounded-full">
                                Pincode: {addr.pincode}
                              </span>
                              <span className="bg-gray-100/90 text-gray-600 border border-gray-200/80 font-bold text-[11px] px-3 py-1 rounded-full">
                                Landmark: {addr.landmark}
                              </span>
                              <span className="bg-gray-100/90 text-gray-600 border border-gray-200/80 font-bold text-[11px] px-3 py-1 rounded-full">
                                Type: {addr.type.charAt(0) + addr.type.slice(1).toLowerCase()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons (Top Right) */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleEditAddress(addr)}
                            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="bg-white hover:bg-red-50 text-gray-400 hover:text-red-600 border border-gray-200 font-bold text-base w-9 h-9 rounded-xl transition flex items-center justify-center cursor-pointer shadow-2xs"
                            title="Delete Address"
                          >
                            ⋮
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Safety Banner */}
              <div className="bg-[#EAF8F2] border border-emerald-200/80 rounded-2xl p-4 md:p-5 flex items-center justify-between gap-4 shadow-2xs">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#10B981] text-white flex items-center justify-center text-lg font-black shadow-xs shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-emerald-950">Your addresses are 100% safe and secure</h4>
                    <p className="text-xs text-emerald-800/80 font-medium mt-0.5">We will never share your personal information with anyone.</p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-emerald-600 font-black text-xl shrink-0 opacity-80">
                  🏠 ─── 📍
                </div>
              </div>
            </div>
          )}

          {/* TAB: PROFILE INFORMATION */}
          {activeTab === "profile" && (
            <div className="bg-white border border-gray-200/80 rounded-3xl p-6 md:p-8 space-y-8 shadow-2xs">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <h3 className="text-lg font-black text-gray-900">Personal Information</h3>
                  <button
                    onClick={() => setIsEditingName(!isEditingName)}
                    className="text-xs text-[#059669] font-bold hover:underline cursor-pointer"
                  >
                    {isEditingName ? "Save" : "Edit"}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl text-xs">
                  <div>
                    <label className="text-gray-600 block mb-1 font-semibold">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      disabled={!isEditingName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-emerald-500 disabled:opacity-70"
                    />
                  </div>
                  <div>
                    <label className="text-gray-600 block mb-1 font-semibold">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      disabled={!isEditingName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-emerald-500 disabled:opacity-70"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-100 text-xs text-gray-600 space-y-3">
                <h4 className="font-black text-sm text-gray-900">FAQs</h4>
                <div>
                  <p className="font-bold text-gray-800">What happens when I update my email address (or mobile number)?</p>
                  <p className="mt-1 leading-relaxed">
                    Your login email id (or mobile number) changes automatically. You'll receive all your order update notifications on the new email address.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: MY ORDERS */}
          {activeTab === "orders" && (
            <div className="bg-white border border-gray-200/80 rounded-3xl overflow-hidden shadow-2xs">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-black text-gray-900">My Order History</h3>
                <span className="text-xs text-[#059669] font-extrabold">{orders.length} Active Orders</span>
              </div>
              <div className="divide-y divide-gray-100">
                {orders.map((ord) => (
                  <div key={ord.id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50 transition">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-sm text-gray-900">{ord.id}</span>
                        <span className="px-2.5 py-0.5 text-[10px] font-black rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {ord.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 font-medium mt-1">{ord.items}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Order Date: {ord.date}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-black text-base text-gray-900">₹{ord.total.toLocaleString("en-IN")}</span>
                      <Link
                        href={`/track-order?awb=${ord.awb}`}
                        className="bg-gray-900 hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-xs"
                      >
                        Track Courier
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* OTHER TABS */}
          {activeTab === "coupons" && (
            <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-2xs space-y-4">
              <h3 className="text-lg font-black text-gray-900">My Active Coupons &amp; Offers</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {coupons.map((c, i) => (
                  <div key={i} className="bg-[#EAF8F2] border border-emerald-200/80 p-5 rounded-2xl text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-black text-emerald-800 text-sm bg-white px-2.5 py-1 rounded-lg border border-emerald-300">{c.code}</span>
                      <span className="text-emerald-700 font-black">{c.discount}</span>
                    </div>
                    <p className="text-gray-700 font-bold">{c.minOrder}</p>
                    <p className="text-gray-500 text-[11px]">{c.expiry}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* ➕ Modal Dialog for Adding / Editing Delivery Address */}
      {isAddAddressModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-6 border border-gray-100">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <h3 className="text-lg font-black text-gray-900">
                {editingAddress ? "Edit Delivery Address" : "Add New Delivery Address"}
              </h3>
              <button
                onClick={() => setIsAddAddressModalOpen(false)}
                className="text-gray-400 hover:text-gray-900 font-black text-xl w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-emerald-500 font-medium"
                    placeholder="Sachin Rawat"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-emerald-500 font-medium"
                    placeholder="+91 6264384464"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Pincode</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={formPincode}
                    onChange={(e) => setFormPincode(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-emerald-500 font-medium"
                    placeholder="560103"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Landmark</label>
                  <input
                    type="text"
                    value={formLandmark}
                    onChange={(e) => setFormLandmark(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-emerald-500 font-medium"
                    placeholder="Near Metro Station"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Complete Address</label>
                <textarea
                  required
                  rows={3}
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-emerald-500 font-medium"
                  placeholder="Outer Ring Road, Prashanthnagarhalli Village, Bengaluru, Karnataka"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Address Type</label>
                <div className="flex gap-3 pt-1">
                  {["HOME", "WORK", "OTHER"].map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setFormType(type)}
                      className={`flex-1 py-2 rounded-xl font-bold border transition text-xs ${
                        formType === type
                          ? "bg-[#059669] text-white border-[#059669] shadow-2xs"
                          : "bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="defaultAddress"
                  checked={formIsDefault}
                  onChange={(e) => setFormIsDefault(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                />
                <label htmlFor="defaultAddress" className="text-xs text-gray-700 font-bold cursor-pointer">
                  Make this my default delivery address
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddAddressModalOpen(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#0B132B] hover:bg-black text-white font-extrabold px-6 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Chat Widget Icon (Matching Screenshot Bottom-Right Green Widget) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => alert("Live Chat Support Available 24/7!")}
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
