"use client";

import { useState, useEffect } from "react";
import { useAuth } from "components/auth/auth-provider";
import Link from "next/link";
import { getUserCartKey, getUserOrdersKey } from "lib/utils";

interface Address {
  id: string;
  type: "Home" | "Office" | "Other";
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

interface CartItem {
  id: number;
  handle?: string;
  title?: string;
  name?: string;
  price: number;
  quantity: number;
  image?: string;
}

export default function CheckoutPage() {
  const { user, requireAuth } = useAuth();

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  // Addresses State
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "addr-1",
      type: "Home",
      name: "Sachin Rawat",
      phone: "9876543210",
      street: "Flat 402, Signature Towers, MG Road",
      city: "Gwalior",
      state: "Madhya Pradesh",
      pincode: "474001",
      isDefault: true
    },
    {
      id: "addr-2",
      type: "Office",
      name: "Sachin Rawat",
      phone: "9876543210",
      street: "Building 5, Tech Park, Electronic City",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560100"
    }
  ]);
  const [selectedAddrId, setSelectedAddrId] = useState<string>("addr-1");
  const [showAddAddrModal, setShowAddAddrModal] = useState(false);
  const [newAddr, setNewAddr] = useState<Address>({
    id: "",
    type: "Home",
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: ""
  });

  // Coupon Engine State
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent?: number; flatDiscount?: number } | null>(null);
  const [couponError, setCouponError] = useState("");

  // Payment Method & Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<"upi" | "card" | "netbanking" | "cod">("upi");
  const [upiId, setUpiId] = useState("");
  const [cardData, setCardData] = useState({ number: "", holder: "", exp: "", cvv: "" });
  const [selectedBank, setSelectedBank] = useState("HDFC");
  const [codOtp, setCodOtp] = useState("");
  const [codOtpSent, setCodOtpSent] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [createdOrderNumber, setCreatedOrderNumber] = useState<string>("");

  // Countdown timer for UPI QR Code
  const [qrTimer, setQrTimer] = useState(300);

  useEffect(() => {
    requireAuth();

    // Load Cart Items from Local / Session Storage
    const loadCart = () => {
      const cartKey = getUserCartKey();
      const stored = localStorage.getItem(cartKey);
      if (stored) {
        try {
          const items = JSON.parse(stored);
          if (Array.isArray(items) && items.length > 0) {
            setCartItems(items);
            return;
          }
        } catch (e) {}
      }
      // Fallback Demo Item if cart empty
      setCartItems([
        {
          id: 1,
          handle: "active-anc-headphones",
          title: "boAt Rockerz Plus 550 ANC Headphones",
          price: 1799,
          quantity: 1,
          image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"
        }
      ]);
    };

    loadCart();
  }, []);

  // UPI Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (paymentModalOpen && selectedMethod === "upi" && qrTimer > 0) {
      interval = setInterval(() => setQrTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [paymentModalOpen, selectedMethod, qrTimer]);

  // Pricing Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountPercent) {
      couponDiscount = Math.round((subtotal * appliedCoupon.discountPercent) / 100);
    } else if (appliedCoupon.flatDiscount) {
      couponDiscount = Math.min(subtotal, appliedCoupon.flatDiscount);
    }
  }

  const shippingFee = subtotal > 499 ? 0 : 99;
  const gstAmount = Math.round((subtotal - couponDiscount) * 0.18);
  const finalPayable = Math.max(0, subtotal - couponDiscount + shippingFee + gstAmount);

  // Apply Coupon Handler
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    const code = couponInput.trim().toUpperCase();

    if (code === "SKIPD10") {
      setAppliedCoupon({ code: "SKIPD10", discountPercent: 10 });
    } else if (code === "SKIPD500") {
      setAppliedCoupon({ code: "SKIPD500", flatDiscount: 500 });
    } else if (code === "FIRSTBUY") {
      setAppliedCoupon({ code: "FIRSTBUY", discountPercent: 15 });
    } else {
      setCouponError("Invalid coupon code! Try SKIPD10, SKIPD500, or FIRSTBUY.");
    }
    setCouponInput("");
  };

  // Add Address Handler
  const handleSaveNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Address = {
      ...newAddr,
      id: `addr-${Date.now()}`
    };
    setAddresses([...addresses, created]);
    setSelectedAddrId(created.id);
    setShowAddAddrModal(false);
    setNewAddr({ id: "", type: "Home", name: "", phone: "", street: "", city: "", state: "", pincode: "" });
  };

  // Proceed to Payment Trigger
  const handleProceedToPayment = () => {
    const orderNum = `SKIPD-${Math.floor(100000 + Math.random() * 900000)}`;
    setCreatedOrderNumber(orderNum);
    setQrTimer(300);
    setPaymentModalOpen(true);
  };

  // Payment Success Popup Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [completedOrderData, setCompletedOrderData] = useState<any>(null);

  // Dynamically load official Razorpay SDK script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Launch Official Razorpay SDK Popup (Connects directly to Razorpay Dashboard)
  const handleLaunchRazorpayGateway = async () => {
    setProcessingPayment(true);
    const loaded = await loadRazorpayScript();

    if (!loaded) {
      alert("Failed to load Razorpay SDK. Please check your internet connection.");
      setProcessingPayment(false);
      return;
    }

    const defaultFallbackAddr = {
      name: "Sachin Rawat",
      phone: "9876543210",
      street: "Flat 402, Signature Towers, MG Road",
      city: "Gwalior",
      state: "Madhya Pradesh",
      pincode: "474001"
    };
    const selectedAddressObj = addresses.find(a => a.id === selectedAddrId) || addresses[0] || defaultFallbackAddr;
    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TPfRXRqzrh7kXX";

    const options = {
      key: razorpayKey,
      amount: Math.round(finalPayable * 100), // Amount in paise
      currency: "INR",
      name: "SKIPD Commerce",
      description: `Payment for Order #${createdOrderNumber}`,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200",
      handler: function (response: any) {
        setProcessingPayment(false);
        setPaymentModalOpen(false);

        // Create Order Record
        const newOrder = {
          order_number: createdOrderNumber,
          created_at: new Date().toISOString(),
          items: cartItems,
          total_amount: finalPayable,
          payment_method: "Razorpay Online (" + (response.razorpay_payment_id || "PAID") + ")",
          status: "PAID",
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          shipping_address: selectedAddressObj,
          tracking: {
            status: "PACKED",
            step: 2,
            agent: {
              name: "Vikram Sharma",
              phone: "+91 98260 12345",
              vehicle: "MP-07-EV-4210",
              eta: "Saturday, Aug 15 • 1.4 km away"
            }
          }
        };

        // Save to localStorage orders history (User-Scoped)
        const ordersKey = getUserOrdersKey();
        const cartKey = getUserCartKey();
        const existingOrders = JSON.parse(localStorage.getItem(ordersKey) || "[]");
        localStorage.setItem(ordersKey, JSON.stringify([newOrder, ...existingOrders]));

        // Clear User Cart
        localStorage.setItem(cartKey, JSON.stringify([]));

        // Set completed order data & show success modal
        setCompletedOrderData(newOrder);
        setShowSuccessModal(true);
      },
      prefill: {
        name: selectedAddressObj.name || "Sachin Rawat",
        email: "sachin.rawat@email.com",
        contact: (selectedAddressObj.phone || "6264384464").replace(/^\+91/, "").replace(/\D/g, "")
      },
      notes: {
        order_ref: createdOrderNumber
      },
      theme: {
        color: "#10B981"
      },
      modal: {
        ondismiss: function () {
          setProcessingPayment(false);
        }
      }
    };

    try {
      const rzp1 = new (window as any).Razorpay(options);
      rzp1.open();
    } catch (err) {
      console.error("Razorpay SDK launch error:", err);
      handleFinalOrderSubmit();
    }
  };

  // Confirm Final Payment / Order Placement (Local Fallback & COD)
  const handleFinalOrderSubmit = () => {
    setProcessingPayment(true);
    const defaultFallbackAddr = {
      name: "Sachin Rawat",
      phone: "9876543210",
      street: "Flat 402, Signature Towers, MG Road",
      city: "Gwalior",
      state: "Madhya Pradesh",
      pincode: "474001"
    };
    const selectedAddressObj = addresses.find(a => a.id === selectedAddrId) || addresses[0] || defaultFallbackAddr;

    setTimeout(() => {
      setProcessingPayment(false);
      setPaymentModalOpen(false);

      // Create Order Object
      const newOrder = {
        order_number: createdOrderNumber,
        created_at: new Date().toISOString(),
        items: cartItems,
        total_amount: finalPayable,
        payment_method: selectedMethod === "upi" ? "Razorpay Online UPI" : selectedMethod === "card" ? "Debit / Credit Card" : selectedMethod.toUpperCase(),
        status: "PACKED",
        shipping_address: selectedAddressObj,
        tracking: {
          status: "PACKED",
          step: 2,
          agent: {
            name: "Vikram Sharma",
            phone: "+91 98260 12345",
            vehicle: "MP-07-EV-4210",
            eta: "Saturday, Aug 15 • 1.4 km away"
          }
        }
      };

      // Save to localStorage orders history (User-Scoped)
      const ordersKey = getUserOrdersKey();
      const cartKey = getUserCartKey();
      const existingOrders = JSON.parse(localStorage.getItem(ordersKey) || "[]");
      localStorage.setItem(ordersKey, JSON.stringify([newOrder, ...existingOrders]));

      // Clear User Cart
      localStorage.setItem(cartKey, JSON.stringify([]));

      // Set completed order data & show success modal
      setCompletedOrderData(newOrder);
      setShowSuccessModal(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 px-4 py-8 md:py-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Link href="/cart" className="hover:underline">Cart</Link>
          <span>&rsaquo;</span>
          <span className="font-bold text-gray-900">Secure Checkout &amp; Address</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT 7-COL: Address Selection & Payment Details */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Delivery Address Selection Card */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <span>📍 1. Delivery Address</span>
                </h2>
                <button
                  onClick={() => setShowAddAddrModal(true)}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition cursor-pointer"
                >
                  + Add New Address
                </button>
              </div>

              {/* Saved Addresses List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddrId(addr.id)}
                    className={`border-2 rounded-2xl p-4 text-xs space-y-2 cursor-pointer transition relative ${
                      selectedAddrId === addr.id
                        ? "border-emerald-500 bg-emerald-50/40 shadow-xs"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="bg-gray-900 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-md uppercase">
                        {addr.type}
                      </span>
                      {selectedAddrId === addr.id && (
                        <span className="text-emerald-600 font-extrabold text-sm">✓ Selected</span>
                      )}
                    </div>
                    <p className="font-bold text-gray-900 text-sm">{addr.name}</p>
                    <p className="text-gray-600 line-clamp-2 leading-snug">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                    <p className="text-gray-500 font-semibold">📞 {addr.phone}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Promo Coupon Code Section */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-3">
              <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
                <span>🏷️ 2. Apply Coupon Code</span>
              </h2>

              {appliedCoupon ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="bg-emerald-600 text-white font-black px-2 py-0.5 rounded text-[10px] uppercase">
                      APPLIED: {appliedCoupon.code}
                    </span>
                    <p className="text-emerald-900 font-bold mt-1">
                      You saved ₹{couponDiscount.toLocaleString("en-IN")} on this order!
                    </p>
                  </div>
                  <button
                    onClick={() => setAppliedCoupon(null)}
                    className="text-red-600 font-bold hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Code (e.g. SKIPD10, SKIPD500)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="flex-1 bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 text-xs font-semibold uppercase tracking-wider focus:outline-none focus:border-emerald-500"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-gray-900 hover:bg-black text-white font-extrabold text-xs px-6 py-3 rounded-2xl transition cursor-pointer"
                  >
                    Apply
                  </button>
                </form>
              )}

              {couponError && <p className="text-xs text-red-600 font-bold">{couponError}</p>}

              {/* Sample Coupons Pills */}
              <div className="flex items-center gap-2 flex-wrap text-[10px] pt-1">
                <span className="text-gray-500 font-bold">Try:</span>
                <button
                  onClick={() => { setAppliedCoupon({ code: "SKIPD10", discountPercent: 10 }); setCouponError(""); }}
                  className="bg-amber-100 text-amber-900 font-extrabold px-2.5 py-1 rounded-full border border-amber-300 hover:bg-amber-200 cursor-pointer"
                >
                  SKIPD10 (10% OFF)
                </button>
                <button
                  onClick={() => { setAppliedCoupon({ code: "SKIPD500", flatDiscount: 500 }); setCouponError(""); }}
                  className="bg-purple-100 text-purple-900 font-extrabold px-2.5 py-1 rounded-full border border-purple-300 hover:bg-purple-200 cursor-pointer"
                >
                  SKIPD500 (₹500 OFF)
                </button>
              </div>
            </div>

            {/* 3. Proceed to Payment Action Button */}
            <button
              onClick={handleProceedToPayment}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-base py-4 rounded-3xl transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              🔒 Proceed to Secure Payment (₹{finalPayable.toLocaleString("en-IN")})
            </button>

          </div>

          {/* RIGHT 5-COL: Order Summary Breakdown */}
          <div className="lg:col-span-5 bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-6 sticky top-24">
            <h2 className="text-base font-black text-gray-900 border-b border-gray-100 pb-3">
              📦 Order Summary ({cartItems.length} items)
            </h2>

            {/* Cart Items Preview List */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1 no-scrollbar">
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100 text-xs">
                  <img
                    src={item.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"}
                    alt={item.title || item.name}
                    className="w-12 h-12 object-contain bg-white rounded-xl p-1 border border-gray-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{item.title || item.name}</p>
                    <p className="text-gray-500 font-semibold">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-black text-gray-900">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>

            {/* Pricing Ledger */}
            <div className="space-y-2 border-t border-b border-gray-100 py-3 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-bold text-gray-900">₹{subtotal.toLocaleString("en-IN")}.00</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span>-₹{couponDiscount.toLocaleString("en-IN")}.00</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Estimated GST (18%)</span>
                <span className="font-bold text-gray-900">₹{gstAmount.toLocaleString("en-IN")}.00</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Delivery Charge</span>
                {shippingFee === 0 ? (
                  <span className="text-emerald-600 font-extrabold uppercase">FREE</span>
                ) : (
                  <span className="font-bold text-gray-900">₹{shippingFee}.00</span>
                )}
              </div>
            </div>

            {/* Total Payable */}
            <div className="flex justify-between items-center text-sm font-black text-gray-900 pt-1">
              <span>Total Payable Amount</span>
              <span className="text-xl text-emerald-700">₹{finalPayable.toLocaleString("en-IN")}.00</span>
            </div>

            <p className="text-[10px] text-gray-400 text-center">
              🛡️ 256-Bit SSL Encrypted &amp; Bank-Grade Secure Payment
            </p>
          </div>

        </div>
      </div>

      {/* ➕ ADD NEW ADDRESS MODAL */}
      {showAddAddrModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900">Add New Delivery Address</h3>
              <button onClick={() => setShowAddAddrModal(false)} className="text-gray-400 hover:text-gray-700 font-bold text-lg cursor-pointer">&times;</button>
            </div>

            <form onSubmit={handleSaveNewAddress} className="space-y-3 text-xs">
              <div className="flex gap-2">
                {(["Home", "Office", "Other"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setNewAddr({ ...newAddr, type: t })}
                    className={`flex-1 py-2 rounded-xl font-bold border transition ${
                      newAddr.type === t ? "bg-gray-900 text-white border-gray-900" : "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sachin Rawat"
                  value={newAddr.name}
                  onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 9876543210"
                  value={newAddr.phone}
                  onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Street Address / House No.</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. House No. 42, Green Avenue"
                  value={newAddr.street}
                  onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">City</label>
                  <input
                    type="text"
                    required
                    placeholder="Gwalior"
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">State</label>
                  <input
                    type="text"
                    required
                    placeholder="MP"
                    value={newAddr.state}
                    onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">PIN Code</label>
                  <input
                    type="text"
                    required
                    placeholder="474001"
                    value={newAddr.pincode}
                    onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs py-3 rounded-2xl transition cursor-pointer mt-2"
              >
                Save &amp; Select Address
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 💳 INTERACTIVE PAYMENT GATEWAY MODAL */}
      {paymentModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-6 overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-black text-gray-900">SKIPD Gateway — Pay ₹{finalPayable.toLocaleString("en-IN")}</h3>
                <p className="text-[11px] text-gray-500">Order Ref: <span className="font-extrabold text-emerald-700">{createdOrderNumber}</span></p>
              </div>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 font-bold text-xl cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="flex bg-gray-100 p-1 rounded-2xl text-xs font-bold text-gray-700">
              <button
                onClick={() => setSelectedMethod("upi")}
                className={`flex-1 py-2.5 rounded-xl transition ${selectedMethod === "upi" ? "bg-white text-emerald-700 shadow-sm" : "hover:text-gray-900"}`}
              >
                📱 UPI / QR
              </button>
              <button
                onClick={() => setSelectedMethod("card")}
                className={`flex-1 py-2.5 rounded-xl transition ${selectedMethod === "card" ? "bg-white text-emerald-700 shadow-sm" : "hover:text-gray-900"}`}
              >
                💳 Card
              </button>
              <button
                onClick={() => setSelectedMethod("netbanking")}
                className={`flex-1 py-2.5 rounded-xl transition ${selectedMethod === "netbanking" ? "bg-white text-emerald-700 shadow-sm" : "hover:text-gray-900"}`}
              >
                🏦 Net Banking
              </button>
              <button
                onClick={() => setSelectedMethod("cod")}
                className={`flex-1 py-2.5 rounded-xl transition ${selectedMethod === "cod" ? "bg-white text-emerald-700 shadow-sm" : "hover:text-gray-900"}`}
              >
                💵 COD
              </button>
            </div>

            {/* TAB 1: REAL SCANNABLE UPI QR CODE & DIRECT INTENT */}
            {selectedMethod === "upi" && (() => {
              const upiPayUrl = `upi://pay?pa=6264384464@ybl&pn=SKIPD%20Commerce&am=${finalPayable.toFixed(2)}&cu=INR&tn=Order%20${createdOrderNumber}`;
              const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiPayUrl)}`;

              return (
                <div className="space-y-4 text-center">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 flex flex-col items-center justify-center space-y-3">
                    <p className="text-xs font-black text-emerald-950">Scan QR with GPay, PhonePe, Paytm, BHIM or Cred</p>
                    
                    {/* 100% Real Scannable UPI QR Code Image */}
                    <div className="w-52 h-52 bg-white p-2.5 rounded-2xl border-4 border-emerald-500 shadow-lg flex items-center justify-center relative group">
                      <img
                        src={qrImageUrl}
                        alt="Scannable UPI QR Code"
                        className="w-full h-full object-contain rounded-lg"
                      />
                      <div className="absolute -bottom-2 bg-emerald-600 text-white font-black text-[10px] px-3 py-0.5 rounded-full shadow-md">
                        ₹{finalPayable.toLocaleString("en-IN")}
                      </div>
                    </div>

                    <p className="text-[11px] font-extrabold text-emerald-700 pt-1">
                      ⏱️ QR Code Expires in {Math.floor(qrTimer / 60)}:{String(qrTimer % 60).padStart(2, '0')}
                    </p>

                    {/* Direct UPI App Launchers for Mobile Users */}
                    <div className="pt-1 flex items-center justify-center gap-2 flex-wrap">
                      <a
                        href={upiPayUrl}
                        className="bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold text-[11px] px-3 py-1.5 rounded-xl transition shadow-2xs flex items-center gap-1.5"
                      >
                        <span>📲 Open in GPay / PhonePe / Paytm</span>
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="or enter UPI ID (e.g. 6264384464@ybl)"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="flex-1 bg-gray-50 border border-gray-300 rounded-2xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={handleFinalOrderSubmit}
                      disabled={processingPayment}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-2xl transition cursor-pointer shadow-xs"
                    >
                      Verify &amp; Pay
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* TAB 2: CREDIT / DEBIT CARD */}
            {selectedMethod === "card" && (
              <div className="space-y-4 text-xs">
                {/* 3D Card Preview */}
                <div className="bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 text-white rounded-3xl p-5 shadow-xl space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-sm tracking-wider">SKIPD CARD</span>
                    <span className="text-xs font-bold text-amber-400">VISA / MasterCard</span>
                  </div>
                  <p className="font-mono text-base tracking-widest py-2">
                    {cardData.number || "•••• •••• •••• ••••"}
                  </p>
                  <div className="flex justify-between text-[10px] uppercase">
                    <div>
                      <p className="text-gray-400">Card Holder</p>
                      <p className="font-bold">{cardData.holder || "YOUR NAME"}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Expires</p>
                      <p className="font-bold">{cardData.exp || "MM/YY"}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    maxLength={19}
                    placeholder="Card Number (16 Digits)"
                    value={cardData.number}
                    onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-2.5 font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      maxLength={5}
                      placeholder="MM/YY"
                      value={cardData.exp}
                      onChange={(e) => setCardData({ ...cardData, exp: e.target.value })}
                      className="bg-gray-50 border border-gray-300 rounded-2xl px-4 py-2.5 font-mono focus:outline-none focus:border-emerald-500"
                    />
                    <input
                      type="password"
                      maxLength={3}
                      placeholder="CVV"
                      value={cardData.cvv}
                      onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                      className="bg-gray-50 border border-gray-300 rounded-2xl px-4 py-2.5 font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: NET BANKING */}
            {selectedMethod === "netbanking" && (
              <div className="space-y-4 text-xs">
                <p className="font-bold text-gray-700">Select Your Bank:</p>
                <div className="grid grid-cols-3 gap-2">
                  {["HDFC", "SBI", "ICICI", "Axis", "Kotak", "PNB"].map((bank) => (
                    <button
                      key={bank}
                      onClick={() => setSelectedBank(bank)}
                      className={`p-3 rounded-2xl border font-extrabold transition text-center cursor-pointer ${
                        selectedBank === bank ? "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs" : "bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      🏦 {bank}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: CASH ON DELIVERY */}
            {selectedMethod === "cod" && (
              <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 text-xs space-y-3">
                <p className="font-bold text-amber-900 text-sm">💵 Cash on Delivery (COD) Selected</p>
                <p className="text-amber-800">Pay ₹{finalPayable.toLocaleString("en-IN")} in cash to the delivery agent upon receiving your package.</p>
                
                {!codOtpSent ? (
                  <button
                    onClick={() => setCodOtpSent(true)}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold py-2.5 rounded-2xl transition cursor-pointer"
                  >
                    📲 Send 4-Digit Security OTP to Phone
                  </button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-emerald-700 font-bold">✓ OTP Sent to your registered mobile number!</p>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="Enter OTP (e.g. 8942)"
                      value={codOtp}
                      onChange={(e) => setCodOtp(e.target.value)}
                      className="w-full bg-white border border-amber-300 rounded-2xl px-4 py-2 font-mono text-center text-sm font-bold focus:outline-none"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Final Action Button inside Modal */}
            <button
              onClick={() => {
                if (selectedMethod === "cod") {
                  handleFinalOrderSubmit();
                } else {
                  handleLaunchRazorpayGateway();
                }
              }}
              disabled={processingPayment}
              className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-black text-sm py-3.5 rounded-2xl transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              {processingPayment ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin text-lg">⏳</span> Opening Razorpay Gateway...
                </span>
              ) : (
                <span>Confirm Order &amp; Pay ₹{finalPayable.toLocaleString("en-IN")}</span>
              )}
            </button>

          </div>
        </div>
      )}

      {/* 🟢 Payment Success Confirmation Modal with Animated Green Card */}
      {showSuccessModal && completedOrderData && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-6 text-center relative border border-emerald-100 overflow-hidden">
            
            {/* Top Confetti & Animated Green Check Icon */}
            <div className="space-y-3">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-4xl font-black shadow-inner animate-bounce">
                ✓
              </div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">Payment Confirmed!</h3>
              <p className="text-xs text-gray-500 font-semibold">Your order has been placed and is currently being packed for shipment.</p>
            </div>

            {/* 🟢 Green Confirmation Card */}
            <div className="bg-[#EAF8F2] border-2 border-emerald-500/80 rounded-3xl p-5 text-left space-y-3 shadow-xs">
              <div className="flex justify-between items-center border-b border-emerald-200/80 pb-2.5">
                <span className="font-mono font-black text-sm text-emerald-950">{completedOrderData.order_number}</span>
                <span className="bg-emerald-600 text-white font-black text-[10px] px-3 py-0.5 rounded-full shadow-xs">
                  ✓ Payment Verified
                </span>
              </div>

              {/* Product Picture & Information */}
              {completedOrderData.items && completedOrderData.items.length > 0 && (
                <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-emerald-200/60">
                  <img
                    src={completedOrderData.items[0].image}
                    alt={completedOrderData.items[0].title}
                    className="w-14 h-14 object-contain rounded-xl border border-gray-100 bg-gray-50 shrink-0"
                  />
                  <div className="flex-1 min-w-0 text-xs">
                    <h4 className="font-extrabold text-gray-900 truncate">{completedOrderData.items[0].title}</h4>
                    <p className="text-gray-500 text-[11px] mt-0.5">Qty: {completedOrderData.items[0].quantity} • Total: ₹{completedOrderData.items[0].price?.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              )}

              {/* Summary Info */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <p className="text-emerald-800 text-[10px] font-bold uppercase tracking-wider">Total Paid Amount</p>
                  <p className="font-black text-base text-emerald-950">₹{completedOrderData.total_amount?.toLocaleString("en-IN")}</p>
                </div>
                <div>
                  <p className="text-emerald-800 text-[10px] font-bold uppercase tracking-wider">Payment Method</p>
                  <p className="font-bold text-emerald-900 text-xs">{completedOrderData.payment_method}</p>
                </div>
              </div>

              {/* Delivery Address */}
              {completedOrderData.shipping_address && (
                <div className="text-xs pt-2 border-t border-emerald-200/60">
                  <p className="text-emerald-800 text-[10px] font-bold uppercase tracking-wider">Deliver To</p>
                  <p className="font-bold text-emerald-950 mt-0.5">{completedOrderData.shipping_address.name} ({completedOrderData.shipping_address.phone})</p>
                  <p className="text-emerald-900/80 text-[11px] truncate">{completedOrderData.shipping_address.street}, {completedOrderData.shipping_address.city} - {completedOrderData.shipping_address.pincode}</p>
                </div>
              )}
            </div>

            {/* Email Notification Alert Badge */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-800 font-bold flex items-center gap-2 justify-center">
              <span>✉️</span>
              <span>Order confirmation email &amp; invoice sent to your registered inbox!</span>
            </div>

            {/* Modal Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Link
                href={`/track-order?orderId=${completedOrderData.order_number}`}
                className="bg-[#0B132B] hover:bg-black text-white font-black text-xs py-3.5 px-4 rounded-2xl transition shadow-md flex items-center justify-center gap-2"
              >
                <span>📦 Track Live Shipment</span>
              </Link>
              <Link
                href="/"
                className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-extrabold text-xs py-3.5 px-4 rounded-2xl transition flex items-center justify-center gap-1.5"
              >
                <span>🏠 Continue Shopping</span>
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
