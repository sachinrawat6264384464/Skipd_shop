"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { LoginModal } from "components/auth/login-modal";
import { useWishlist } from "components/wishlist/wishlist-context";
import {
  getUserAddressesKey,
  getUserOrdersKey,
  getUserCartKey,
  getUserGiftBalanceKey,
  getUserWalletBalanceKey,
  getUserSavedCardsKey
} from "lib/utils";
import { fetchUserOrders, fetchProducts, UserOrder } from "lib/api";

interface TimelineStep {
  status: string;
  location: string;
  timestamp: string;
  completed: boolean;
  active?: boolean;
}

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "addresses";
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const [user, setUser] = useState<{ user_name: string; email: string; phone?: string; gender?: string } | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("ecom_token");
    const stored = localStorage.getItem("ecom_user");
    if (token || stored) {
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUser(parsed);
          setIsLoggedIn(true);
          const nameParts = (parsed.user_name || parsed.name || "").split(" ");
          setFirstName(nameParts[0] || "");
          setLastName(nameParts.slice(1).join(" ") || "");
        } catch (e) {
          setIsLoggedIn(false);
        }
      } else if (token) {
        setIsLoggedIn(true);
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("ecom_token");
    localStorage.removeItem("ecom_user");
    window.location.href = "/";
  };

  // 📦 User Orders State (Scoped strictly to Logged In User)
  const [userOrders, setUserOrders] = useState<UserOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const loadAccountUserOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await fetchUserOrders();
      if (Array.isArray(data) && data.length > 0) {
        setUserOrders(data);
        if (data[0]?.order_number) {
          setSelectedTrackOrderId(data[0].order_number);
        }
      } else {
        setUserOrders([]);
        setSelectedTrackOrderId("");
      }
    } catch (e) {
      setUserOrders([]);
      setSelectedTrackOrderId("");
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    loadAccountUserOrders();
    window.addEventListener("ecom_auth_changed", loadAccountUserOrders);
    return () => {
      window.removeEventListener("ecom_auth_changed", loadAccountUserOrders);
    };
  }, []);

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
    window.addEventListener("ecom_auth_changed", loadUserAddresses);
    window.addEventListener("ecom_address_changed", loadUserAddresses);
    return () => {
      window.removeEventListener("ecom_auth_changed", loadUserAddresses);
      window.removeEventListener("ecom_address_changed", loadUserAddresses);
    };
  }, []);

  const saveAddresses = (newAddrs: any[]) => {
    setAddresses(newAddrs);
    const key = getUserAddressesKey();
    localStorage.setItem(key, JSON.stringify(newAddrs));
    window.dispatchEvent(new Event("ecom_address_changed"));
  };


  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any | null>(null);

  // Custom Toast Notification State & Function
  const [toastMessage, setToastMessage] = useState<{ text: string; type?: "success" | "info" | "error" } | null>(null);
  const showToast = (text: string, type: "success" | "info" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Custom Modal States for Order Details & Policy
  const [viewingOrderDetail, setViewingOrderDetail] = useState<any | null>(null);
  const [showReturnPolicyModal, setShowReturnPolicyModal] = useState(false);

  // Return Request Photo Evidence Upload State
  const [returnPhotos, setReturnPhotos] = useState<string[]>([]);
  const [returnPhotoNames, setReturnPhotoNames] = useState<string[]>([]);

  // -------------------------------------------------------------
  // 🎁 GIFT CARDS & 💳 WALLET / SAVED CARDS DYNAMIC LOGIC
  // -------------------------------------------------------------
  const [giftCardBalance, setGiftCardBalance] = useState<number>(2500);
  const [giftCardCode, setGiftCardCode] = useState("");
  const [giftCardPin, setGiftCardPin] = useState("");

  const [walletBalance, setWalletBalance] = useState<number>(1250);
  const [showAddWalletModal, setShowAddWalletModal] = useState(false);
  const [addWalletAmount, setAddWalletAmount] = useState<string>("500");

  const [savedCards, setSavedCards] = useState<any[]>([
    { id: 1, bank: "HDFC Bank", type: "VISA Debit Card", last4: "4821", exp: "08/28", default: true },
    { id: 2, bank: "ICICI Bank", type: "Mastercard Credit", last4: "9102", exp: "11/27", default: false }
  ]);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [newCardBank, setNewCardBank] = useState("HDFC Bank");
  const [newCardHolder, setNewCardHolder] = useState("");
  const [newCardNumber, setNewCardNumber] = useState("");
  const [newCardExp, setNewCardExp] = useState("");
  const [newCardType, setNewCardType] = useState("VISA Debit Card");

  // Synchronize balances and cards with localStorage & events (Scoped strictly per user account)
  const syncWalletAndCards = () => {
    if (typeof window === "undefined") return;
    const giftKey = getUserGiftBalanceKey();
    const storedGift = localStorage.getItem(giftKey);
    setGiftCardBalance(storedGift !== null ? Number(storedGift) : 0);

    const walletKey = getUserWalletBalanceKey();
    const storedWallet = localStorage.getItem(walletKey);
    setWalletBalance(storedWallet !== null ? Number(storedWallet) : 0);

    const cardsKey = getUserSavedCardsKey();
    const storedCards = localStorage.getItem(cardsKey);
    if (storedCards !== null) {
      try {
        setSavedCards(JSON.parse(storedCards));
      } catch (e) {
        setSavedCards([]);
      }
    } else {
      setSavedCards([]);
    }
  };

  useEffect(() => {
    syncWalletAndCards();
    window.addEventListener("ecom_gift_balance_changed", syncWalletAndCards);
    window.addEventListener("ecom_wallet_balance_changed", syncWalletAndCards);
    window.addEventListener("ecom_saved_cards_changed", syncWalletAndCards);
    window.addEventListener("ecom_auth_changed", syncWalletAndCards);
    return () => {
      window.removeEventListener("ecom_gift_balance_changed", syncWalletAndCards);
      window.removeEventListener("ecom_wallet_balance_changed", syncWalletAndCards);
      window.removeEventListener("ecom_saved_cards_changed", syncWalletAndCards);
      window.removeEventListener("ecom_auth_changed", syncWalletAndCards);
    };
  }, []);

  const handleRedeemGiftCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftCardCode.trim()) return;

    let addedAmount = 500;
    const upper = giftCardCode.toUpperCase();
    if (upper.includes("1000")) addedAmount = 1000;
    if (upper.includes("2500")) addedAmount = 2500;

    const giftKey = getUserGiftBalanceKey();
    const currentBal = Number(localStorage.getItem(giftKey) || "0");
    const newBal = currentBal + addedAmount;
    setGiftCardBalance(newBal);
    localStorage.setItem(giftKey, newBal.toString());
    window.dispatchEvent(new Event("ecom_gift_balance_changed"));

    showToast(`🎉 Gift Card "${upper}" redeemed! ₹${addedAmount.toLocaleString("en-IN")} added to Gift Balance.`);
    setGiftCardCode("");
    setGiftCardPin("");
  };

  const handleBuyGiftCard = (card: { amount: number; label: string; color: string }) => {
    const giftCardItem = {
      id: Date.now(),
      handle: `e-com-gift-card-${card.amount}`,
      title: `E-COM ${card.label} Digital Gift Voucher (₹${card.amount.toLocaleString("en-IN")})`,
      price: card.amount,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400",
      isGiftCard: true,
      giftAmount: card.amount
    };

    sessionStorage.setItem("ecom_buy_now_item", JSON.stringify([giftCardItem]));

    showToast(`🎉 Gift Card ₹${card.amount} selected! Redirecting to checkout...`);
    setTimeout(() => {
      router.push("/checkout?buyNow=true");
    }, 600);
  };

  const handleAddMoneyToWallet = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(addWalletAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    const walletKey = getUserWalletBalanceKey();
    const currentWallet = Number(localStorage.getItem(walletKey) || "0");
    const newWallet = currentWallet + amountNum;
    setWalletBalance(newWallet);
    localStorage.setItem(walletKey, newWallet.toString());
    window.dispatchEvent(new Event("ecom_wallet_balance_changed"));

    showToast(`💳 ₹${amountNum.toLocaleString("en-IN")} added to E-COM Pay Wallet! New Balance: ₹${newWallet.toLocaleString("en-IN")}`);
    setShowAddWalletModal(false);
  };

  const handleAddCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = newCardNumber.replace(/\D/g, "");
    const last4 = cleanNum.slice(-4) || "1234";

    const newCardObj = {
      id: Date.now(),
      bank: newCardBank,
      type: newCardType,
      last4: last4,
      exp: newCardExp || "12/29",
      default: savedCards.length === 0
    };

    const updated = [...savedCards, newCardObj];
    setSavedCards(updated);
    const cardsKey = getUserSavedCardsKey();
    localStorage.setItem(cardsKey, JSON.stringify(updated));
    window.dispatchEvent(new Event("ecom_saved_cards_changed"));

    showToast(`💳 ${newCardBank} card ending in ${last4} saved successfully!`);
    setShowAddCardModal(false);
    setNewCardNumber("");
    setNewCardHolder("");
    setNewCardExp("");
  };

  const handleRemoveCard = (cardId: number) => {
    const updated = savedCards.filter((c) => c.id !== cardId);
    setSavedCards(updated);
    const cardsKey = getUserSavedCardsKey();
    localStorage.setItem(cardsKey, JSON.stringify(updated));
    window.dispatchEvent(new Event("ecom_saved_cards_changed"));
    showToast("💳 Card removed from saved payment methods.");
  };

  const handleReturnPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setReturnPhotos((prev) => [...prev, reader.result as string]);
          setReturnPhotoNames((prev) => [...prev, file.name]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveReturnPhoto = (idx: number) => {
    setReturnPhotos((prev) => prev.filter((_, i) => i !== idx));
    setReturnPhotoNames((prev) => prev.filter((_, i) => i !== idx));
  };

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
    setFormName(user?.user_name || "");
    setFormPhone(user?.phone || "");
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
        name: formName || user?.user_name || "Customer",
        phone: formPhone || user?.phone || "+91 9876543210",
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
  // 🚀 LIVE SHIPMENT TRACKER TAB STATE & LOGIC
  // -------------------------------------------------------------
  const [selectedTrackOrderId, setSelectedTrackOrderId] = useState<string>("");
  const [trackingInput, setTrackingInput] = useState<string>("");
  const [trackingSearchError, setTrackingSearchError] = useState("");

  const trackableOrders = userOrders.map((o: any) => ({
    order_number: o.order_number || (o.id ? `E-COM-${o.id}` : "E-COM-984201"),
    created_at: o.date || o.created_at || "Today",
    delivered_at: o.delivered_at,
    total_amount: Number(o.total || o.total_amount || 0),
    payment_method: o.payment_method || "Razorpay / Prepaid Online",
    status: (o.status || "IN_TRANSIT").toUpperCase(),
    items: Array.isArray(o.items) && o.items.length > 0
      ? o.items.map((it: any) => ({
          title: it.title || it.product_name || o.title || "Ordered Item",
          price: Number(it.price || it.unit_price || o.total || o.total_amount || 0),
          quantity: Number(it.quantity || 1),
          image: it.image || it.product_image || o.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"
        }))
      : [
          {
            title: o.title || "Ordered Item",
            price: Number(o.total || o.total_amount || 0),
            quantity: 1,
            image: o.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"
          }
        ],
    shipping_address: o.shipping_address || {
      name: user?.user_name || "Customer",
      street: "Registered Shipping Address",
      city: "Destination City",
      state: "India",
      pincode: "474001"
    }
  }));

  const currentTrackOrder = trackableOrders.find(
    o => (o.order_number || "").toLowerCase() === (selectedTrackOrderId || "").toLowerCase()
  ) || (trackableOrders.length > 0 ? trackableOrders[0] : null);

  const getTimelineForStatus = (status: string, createdAt?: string, deliveredAt?: string): TimelineStep[] => {
    const s = (status || "").toUpperCase();
    const isDelivered = s === "DELIVERED";
    const isOutForDelivery = s === "OUT_FOR_DELIVERY" || s === "OUT FOR DELIVERY" || isDelivered;
    const isInTransit = s === "IN_TRANSIT" || s === "IN TRANSIT" || s === "SHIPPED" || isOutForDelivery || isDelivered;
    const isPacked = s === "PACKED" || s === "PROCESSING" || isInTransit || isDelivered;

    // Base Date Calculation
    let orderDate = new Date();
    if (createdAt && createdAt !== "Today") {
      const parsed = new Date(createdAt);
      if (!isNaN(parsed.getTime())) orderDate = parsed;
    }

    const formatDate = (d: Date) => {
      return d.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) + " at " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
    };

    const placedTimeStr = formatDate(orderDate);
    const packedTimeStr = formatDate(new Date(orderDate.getTime() + 2 * 60 * 60 * 1000));
    const transitTimeStr = formatDate(new Date(orderDate.getTime() + 6 * 60 * 60 * 1000));
    const outTimeStr = formatDate(new Date(orderDate.getTime() + 24 * 60 * 60 * 1000));
    const estDelivTimeStr = formatDate(new Date(orderDate.getTime() + 48 * 60 * 60 * 1000));
    const actualDelivStr = deliveredAt ? formatDate(new Date(deliveredAt)) : formatDate(new Date());

    return [
      {
        status: "Order Confirmed & Placed",
        location: "E-COM Fulfillment Hub, Mumbai",
        timestamp: `${placedTimeStr} • Confirmed ✓`,
        completed: true
      },
      {
        status: "Order Packed & Quality Checked",
        location: "Central Warehouse, Line 4",
        timestamp: isPacked ? `${packedTimeStr} • Packed ✓` : `Expected ${packedTimeStr}`,
        completed: isPacked
      },
      {
        status: "In Transit — Dispatched via Express",
        location: "Logistics Hub (Express Air Cargo)",
        timestamp: isInTransit ? `${transitTimeStr} • Dispatched ✓` : `Expected ${transitTimeStr}`,
        completed: isInTransit,
        active: isInTransit && !isOutForDelivery
      },
      {
        status: "Out for Delivery",
        location: "Assigned Executive: Vikram Sharma (Vehicle MP-07-EV-4210)",
        timestamp: isOutForDelivery ? `${outTimeStr} • Out for Delivery 🚚` : `Expected ${outTimeStr}`,
        completed: isOutForDelivery,
        active: isOutForDelivery && !isDelivered
      },
      {
        status: "Delivered to Customer",
        location: "Destination Customer Address",
        timestamp: isDelivered ? `${actualDelivStr} • Order Completed & Delivered ✓` : `Expected Delivery by ${estDelivTimeStr}`,
        completed: isDelivered
      }
    ];
  };

  const handleTrackingSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setTrackingSearchError("");
    const q = trackingInput.trim().toLowerCase();
    if (!q) return;

    const match = trackableOrders.find(
      o => o.order_number.toLowerCase() === q || o.order_number.toLowerCase().includes(q)
    );

    if (match) {
      setSelectedTrackOrderId(match.order_number);
    } else {
      setTrackingSearchError(`No order found matching "${trackingInput}". Try E-COM-984201.`);
    }
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
    const storedStr = localStorage.getItem(key) || localStorage.getItem("ecom_user_return_orders");
    if (storedStr) {
      try {
        const raw = JSON.parse(storedStr);
        if (Array.isArray(raw) && raw.length > 0) {
          const normalized: any[] = [];
          raw.forEach((ord: any) => {
            let orderTimestamp = ord.orderTimestamp;
            if (!orderTimestamp) {
              if (ord.created_at && !isNaN(new Date(ord.created_at).getTime())) {
                orderTimestamp = new Date(ord.created_at).getTime();
              } else if (ord.date && !isNaN(new Date(ord.date).getTime())) {
                orderTimestamp = new Date(ord.date).getTime();
              } else {
                const orderIdKey = ord.id || ord.order_number || ord.orderNumber || "temp";
                const savedTs = typeof window !== "undefined" ? localStorage.getItem(`ecom_order_ts_${orderIdKey}`) : null;
                if (savedTs && !isNaN(Number(savedTs))) {
                  orderTimestamp = Number(savedTs);
                } else {
                  orderTimestamp = Date.now();
                  if (typeof window !== "undefined") {
                    localStorage.setItem(`ecom_order_ts_${orderIdKey}`, String(orderTimestamp));
                  }
                }
              }
            }

            const orderId = ord.id || ord.order_number || ord.orderNumber || `#E-COM-${Math.floor(10000 + Math.random() * 90000)}`;
            const isExpired = Date.now() - orderTimestamp > 24 * 3600 * 1000;

            if (ord.items && Array.isArray(ord.items) && ord.items.length > 0) {
              ord.items.forEach((item: any, idx: number) => {
                normalized.push({
                  id: `${orderId}${ord.items.length > 1 ? `-${idx + 1}` : ''}`,
                  parentOrderId: orderId,
                  productName: item.title || item.productName || "Ordered Product",
                  specs: item.variant || item.specs || "Standard Variant",
                  price: item.price || ord.totalPrice || ord.amount || 999,
                  purchasedDate: ord.purchasedDate || `Purchased on ${new Date(orderTimestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
                  deliveredDate: ord.deliveredDate || `Delivered on ${new Date(orderTimestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
                  image: item.featuredImage?.url || item.image || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300",
                  orderTimestamp: orderTimestamp,
                  status: ord.status || "DELIVERED",
                  returnStatus: isExpired ? "EXPIRED" : (item.returnStatus || ord.returnStatus || "ELIGIBLE"),
                  queryId: item.queryId || ord.queryId,
                  expiredText: isExpired ? "24h Refund Window Expired" : null
                });
              });
            } else {
              normalized.push({
                id: orderId,
                parentOrderId: orderId,
                productName: ord.productName || "Ordered Product",
                specs: ord.specs || "Standard Variant",
                price: ord.price || ord.totalPrice || ord.amount || 999,
                purchasedDate: ord.purchasedDate || `Purchased on ${new Date(orderTimestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
                deliveredDate: ord.deliveredDate || `Delivered on ${new Date(orderTimestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
                image: ord.image || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300",
                orderTimestamp: orderTimestamp,
                status: ord.status || "DELIVERED",
                returnStatus: isExpired ? "EXPIRED" : (ord.returnStatus || "ELIGIBLE"),
                queryId: ord.queryId,
                expiredText: isExpired ? "24h Refund Window Expired" : null
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
    window.addEventListener("ecom_auth_changed", loadUserReturnOrders);
    return () => window.removeEventListener("ecom_auth_changed", loadUserReturnOrders);
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

  const handleSimulateReturnOrder = async () => {
    const key = getUserOrdersKey();
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    
    const dbProds = await fetchProducts();
    const newOrderId = `#E-COM-${Math.floor(10000 + Math.random() * 90000)}`;

    const randomProd = dbProds.length > 0 
      ? dbProds[Math.floor(Math.random() * dbProds.length)]
      : { title: "Store Order Item", price: 999, handle: "store-item", images: ["https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300"] };

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
          title: (randomProd as any).title || (randomProd as any).productName || "Ordered Product",
          variant: (randomProd as any).specs || "Standard Variant",
          price: randomProd.price || 999,
          featuredImage: { url: randomProd.images?.[0] || (randomProd as any).image || "" }
        }
      ]
    };

    const updatedOrders = [newOrderObj, ...existing];
    localStorage.setItem(key, JSON.stringify(updatedOrders));
    loadUserReturnOrders();
    showToast(`🎉 Success! New order ${newOrderId} placed! 24-Hour Return Window timer is now active.`);
  };

  const handleSubmitReturnForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReturnProduct) return;

    const queryId = `Q-${Math.floor(10000 + Math.random() * 90000)}`;
    const updated = returnOrders.map(o => o.id === selectedReturnProduct.id ? {
      ...o,
      returnStatus: "REQUESTED",
      queryId,
      returnReason,
      returnDescription,
      returnPhotos
    } : o);
    
    const key = getUserOrdersKey();
    localStorage.setItem("ecom_user_return_orders", JSON.stringify(updated));
    setReturnOrders(updated);

    showToast(`✓ Return query #${queryId} submitted with ${returnPhotos.length} attached photo(s)! Support team will review within 12 hours.`);
    setSelectedReturnProduct(null);
    setReturnPhotoUploaded(false);
    setReturnPhotos([]);
    setReturnPhotoNames([]);
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
    { id: 1, title: "Shipment Dispatched", text: "Your order E-COM-984201 is on its way via BlueDart Courier.", time: "2 hours ago" },
    { id: 2, title: "Supercoins Credited", text: "250 Supercoins added to your wallet.", time: "1 day ago" }
  ];

  // 🔒 LOGGED OUT GUARD VIEW: If user is not authenticated, show clean Sign In screen with LoginModal trigger
  if (isLoggedIn === false) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] text-gray-900 flex items-center justify-center p-4 font-sans">
        <div className="bg-white border border-gray-200/80 rounded-3xl p-8 md:p-12 max-w-md w-full text-center space-y-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#059669] flex items-center justify-center mx-auto text-2xl shadow-xs">
            <svg className="w-8 h-8 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-gray-900">Sign In Required</h2>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              Please sign in to your account to view your profile, active orders, live shipment tracking, 24h returns, and wallet rewards.
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-[#059669] hover:bg-[#047857] text-white font-black text-xs py-3.5 px-6 rounded-2xl transition shadow-xs cursor-pointer"
            >
              Sign In / Register
            </button>

            <Link
              href="/"
              className="block text-xs font-bold text-gray-500 hover:text-gray-900 transition"
            >
              &larr; Return to Store Homepage
            </Link>
          </div>

          <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
      </div>
    );
  }

  const currentUser = user || { user_name: "Customer", email: "user@e-com.in" };

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-gray-900 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* 📌 SINGLE UNIFIED LEFT SIDEBAR */}
        <div className="space-y-4 lg:col-span-1">
          
          {/* User Header Profile Card */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-4 flex items-center justify-between gap-3.5 shadow-2xs">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-full bg-[#10B981] text-white font-black text-xl flex items-center justify-center shadow-xs shrink-0">
                {currentUser.user_name[0] || "S"}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Hello,</p>
                <p className="font-black text-base text-gray-900 truncate">{currentUser.user_name}</p>
                <p className="text-xs text-gray-400 font-medium truncate">{currentUser.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="lg:hidden text-xs font-black text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl border border-red-200 shrink-0 cursor-pointer"
            >
              Logout
            </button>
          </div>

          {/* 📱 MOBILE VERTICAL ACCOUNT SERVICES NAVIGATION CARD (Visible on < lg) */}
          <div className="block lg:hidden bg-white border border-gray-200/80 rounded-2xl p-3 shadow-2xs space-y-3">
            
            {/* Collapsible Header Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl p-3 text-xs font-black text-gray-900 cursor-pointer shadow-2xs transition"
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span>Account Services Menu</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-[#059669] text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full capitalize">
                  {activeTab === "track-order" ? "Live Track" : activeTab === "returns" ? "24h Returns" : activeTab}
                </span>
                <span className="text-gray-400 text-xs font-bold">{isMobileMenuOpen ? "▲" : "▼"}</span>
              </div>
            </button>

            {/* Top-to-Bottom Vertical Services Menu List (Shown when open) */}
            {isMobileMenuOpen && (
              <div className="space-y-3 pt-1 divide-y divide-gray-100 text-xs font-bold text-gray-700 animate-in fade-in slide-in-from-top-1">
                
                {/* MY ORDERS GROUP */}
                <div className="space-y-1">
                  <p className="font-extrabold text-gray-400 px-2 uppercase text-[10px] tracking-wider mb-1">
                    MY ORDERS &amp; LOGISTICS
                  </p>

                  <button
                    type="button"
                    onClick={() => { setActiveTab("orders"); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center justify-between py-2 px-3 rounded-xl transition cursor-pointer ${
                      activeTab === "orders" ? "bg-gray-900 text-white font-black shadow-2xs" : "hover:bg-gray-50 text-gray-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m-8-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span>My Orders</span>
                    </div>
                    <span className="text-xs">&rsaquo;</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActiveTab("track-order"); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center justify-between py-2 px-3 rounded-xl transition cursor-pointer ${
                      activeTab === "track-order" ? "bg-[#059669] text-white font-black shadow-2xs" : "bg-emerald-50 text-[#059669] border border-emerald-200/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <svg className="w-4 h-4 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Track Shipment Live</span>
                    </div>
                    <span className="text-[9px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full">Live</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActiveTab("returns"); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center justify-between py-2 px-3 rounded-xl transition cursor-pointer ${
                      activeTab === "returns" ? "bg-[#059669] text-white font-black shadow-2xs" : "bg-emerald-50 text-[#059669] border border-emerald-200/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <svg className="w-4 h-4 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Return Products Policy</span>
                    </div>
                    <span className="text-[9px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full">24h Policy</span>
                  </button>
                </div>

                {/* ACCOUNT SETTINGS GROUP */}
                <div className="pt-2 space-y-1">
                  <p className="font-extrabold text-gray-400 px-2 uppercase text-[10px] tracking-wider mb-1">
                    ACCOUNT SETTINGS
                  </p>

                  <button
                    type="button"
                    onClick={() => { setActiveTab("profile"); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center justify-between py-2 px-3 rounded-xl transition cursor-pointer ${
                      activeTab === "profile" ? "bg-[#059669] text-white font-black shadow-2xs" : "hover:bg-gray-50 text-gray-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Profile Information</span>
                    </div>
                    <span className="text-xs">&rsaquo;</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActiveTab("addresses"); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center justify-between py-2 px-3 rounded-xl transition cursor-pointer ${
                      activeTab === "addresses" ? "bg-[#059669] text-white font-black shadow-2xs" : "hover:bg-gray-50 text-gray-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <svg className="w-4 h-4 opacity-80 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Manage Addresses</span>
                    </div>
                    <span className="text-xs">&rsaquo;</span>
                  </button>
                </div>

                {/* PAYMENTS & WALLET GROUP */}
                <div className="pt-2 space-y-1">
                  <p className="font-extrabold text-gray-400 px-2 uppercase text-[10px] tracking-wider mb-1">
                    PAYMENTS &amp; WALLET
                  </p>

                  <button
                    type="button"
                    onClick={() => { setActiveTab("gift-cards"); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center justify-between py-2 px-3 rounded-xl transition cursor-pointer ${
                      activeTab === "gift-cards" ? "bg-[#059669] text-white font-black shadow-2xs" : "hover:bg-gray-50 text-gray-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>Gift Cards</span>
                    </div>
                    <span className="text-[#059669] font-black">₹0</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActiveTab("wallet"); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center justify-between py-2 px-3 rounded-xl transition cursor-pointer ${
                      activeTab === "wallet" ? "bg-[#059669] text-white font-black shadow-2xs" : "hover:bg-gray-50 text-gray-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>Saved Cards &amp; Wallet</span>
                    </div>
                    <span className="text-xs">&rsaquo;</span>
                  </button>
                </div>

                {/* MY STUFF GROUP */}
                <div className="pt-2 space-y-1">
                  <p className="font-extrabold text-gray-400 px-2 uppercase text-[10px] tracking-wider mb-1">
                    MY STUFF
                  </p>

                  <button
                    type="button"
                    onClick={() => { setActiveTab("coupons"); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center justify-between py-2 px-3 rounded-xl transition cursor-pointer ${
                      activeTab === "coupons" ? "bg-[#059669] text-white font-black shadow-2xs" : "hover:bg-gray-50 text-gray-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 11h.01M7 15h.01M13 7h.01M13 11h.01M13 15h.01M17 7h.01M17 11h.01M17 15h.01" />
                      </svg>
                      <span>My Coupons (2 Active)</span>
                    </div>
                    <span className="text-xs">&rsaquo;</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActiveTab("supercoin"); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center justify-between py-2 px-3 rounded-xl transition cursor-pointer ${
                      activeTab === "supercoin" ? "bg-[#059669] text-white font-black shadow-2xs" : "hover:bg-gray-50 text-gray-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Supercoins &amp; Plus Zone</span>
                    </div>
                    <span className="text-xs">&rsaquo;</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActiveTab("wishlist"); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center justify-between py-2 px-3 rounded-xl transition cursor-pointer ${
                      activeTab === "wishlist" ? "bg-[#059669] text-white font-black shadow-2xs" : "hover:bg-gray-50 text-gray-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>My Wishlist ({wishlist.length})</span>
                    </div>
                    <span className="text-xs">&rsaquo;</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActiveTab("notifications"); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center justify-between py-2 px-3 rounded-xl transition cursor-pointer ${
                      activeTab === "notifications" ? "bg-[#059669] text-white font-black shadow-2xs" : "hover:bg-gray-50 text-gray-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      <span>All Notifications</span>
                    </div>
                    <span className="text-xs">&rsaquo;</span>
                  </button>
                </div>

              </div>
            )}
          </div>

          {/* Navigation Sidebar Menu (Hidden on mobile < lg, visible on desktop lg+) */}
          <div className="hidden lg:block bg-white border border-gray-200/80 rounded-2xl p-4 space-y-4 text-xs shadow-2xs divide-y divide-gray-100 font-bold text-gray-700">
            
            {/* MY ORDERS */}
            <div className="space-y-1">
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

              {/* 🚀 Track Order & Live Shipment Link */}
              <button
                onClick={() => setActiveTab("track-order")}
                className={`w-full flex items-center justify-between font-bold text-xs py-2.5 px-3.5 rounded-xl transition cursor-pointer ${
                  activeTab === "track-order"
                    ? "bg-[#EAF8F2] text-[#059669] border border-emerald-200/60 font-black"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Track Shipment Live</span>
                </div>
                <span className="text-[9px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full">Live</span>
              </button>

              {/* ↺ 24h Return Products Policy Single Sidebar Link */}
              <button
                onClick={() => setActiveTab("returns")}
                className={`w-full flex items-center justify-between font-bold text-xs py-2.5 px-3.5 rounded-xl transition cursor-pointer ${
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

          {/* 🚀 TAB: TRACK ORDER & LIVE SHIPMENT LOGISTICS (EMBEDDED IN USER PROFILE) */}
          {activeTab === "track-order" && (
            <div className="space-y-6">
              
              {/* Header Bar */}
              <div className="bg-white border border-gray-200/80 p-5 md:p-6 rounded-2xl shadow-2xs flex flex-wrap justify-between items-center gap-4">
                <div>
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-[10px] uppercase px-3 py-1 rounded-full tracking-wider">
                    🚀 LIVE SHIPMENT &amp; LOGISTICS TRACKER
                  </span>
                  <h1 className="text-xl md:text-2xl font-black text-gray-900 mt-2">Track Your Orders Live</h1>
                  <p className="text-xs text-gray-500 font-medium mt-1">Real-time status updates and delivery executive contact info.</p>
                </div>

                <button
                  onClick={() => setActiveTab("orders")}
                  className="text-xs font-bold text-[#059669] hover:underline"
                >
                  View All Order History &rsaquo;
                </button>
              </div>

              {loadingOrders ? (
                <div className="bg-white border border-gray-200 rounded-3xl p-10 text-center text-xs text-gray-500 font-bold animate-pulse">
                  Loading your live shipment updates...
                </div>
              ) : trackableOrders.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-3xl p-10 text-center space-y-4 shadow-2xs">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl font-black border border-emerald-100 shadow-2xs">
                    🚚
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-gray-900">No Active Orders or Shipments</h3>
                    <p className="text-xs text-gray-500 max-w-md mx-auto font-medium">
                      Account: <span className="font-bold text-gray-900">{user?.email || user?.user_name || "Signed In User"}</span>. You haven't placed any orders yet. Place an order to track live delivery!
                    </p>
                  </div>
                </div>
              ) : (
              /* 2-Column Split Layout */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left 4-Col: Recent Orders Selector Cards */}
                <div className="lg:col-span-4 space-y-4">
                  <h3 className="font-black text-base text-gray-900">Your Recent Orders ({trackableOrders.length})</h3>

                  <div className="space-y-3">
                    {trackableOrders.map((ord) => {
                      const isSelected = currentTrackOrder?.order_number === ord.order_number;
                      const firstItem = ord.items[0];

                      return (
                        <div
                          key={ord.order_number}
                          onClick={() => setSelectedTrackOrderId(ord.order_number)}
                          className={`p-4 rounded-2xl border transition cursor-pointer flex gap-3 items-center ${
                            isSelected
                              ? "bg-[#EAF8F2] border-[#059669] ring-2 ring-emerald-500/20 shadow-xs"
                              : "bg-white border-gray-200 hover:border-emerald-300 shadow-2xs"
                          }`}
                        >
                          <img
                            src={firstItem?.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"}
                            alt={firstItem?.title || "Product"}
                            className="w-12 h-12 object-contain bg-white rounded-xl p-1 border border-gray-200 shrink-0"
                          />

                          <div className="flex-1 min-w-0 text-xs space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="font-black text-gray-900 text-xs">{ord.order_number}</span>
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                                ord.status === "DELIVERED"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-900"
                              }`}>
                                {ord.status}
                              </span>
                            </div>
                            <p className="font-bold text-gray-800 truncate">{firstItem?.title}</p>
                            <div className="flex justify-between text-[10px] text-gray-500 pt-0.5">
                              <span>
                                {(() => {
                                  if (!ord.created_at) return "Today";
                                  const d = new Date(ord.created_at);
                                  return !isNaN(d.getTime()) ? d.toLocaleDateString("en-IN") : String(ord.created_at);
                                })()}
                              </span>
                              <span className="font-black text-gray-900">₹{(ord.total_amount || 0).toLocaleString("en-IN")}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right 8-Col: Live Order Details & Stepper */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Search Input Box */}
                  <div className="bg-white border border-gray-200/80 rounded-2xl p-4 md:p-5 shadow-2xs space-y-2.5">
                    <h3 className="text-xs font-bold text-gray-900">Lookup Order by ID</h3>
                    <form onSubmit={handleTrackingSearch} className="flex flex-col sm:flex-row gap-2.5">
                      <input
                        type="text"
                        placeholder="e.g. E-COM-984201"
                        value={trackingInput}
                        onChange={(e) => setTrackingInput(e.target.value)}
                        className="flex-1 min-w-0 bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:border-emerald-600 focus:outline-none uppercase tracking-wider font-mono"
                      />
                      <button
                        type="submit"
                        className="bg-[#059669] hover:bg-[#047857] text-white font-black text-xs px-5 py-2.5 rounded-xl transition shadow-xs whitespace-nowrap cursor-pointer shrink-0 text-center"
                      >
                        Track Live &rarr;
                      </button>
                    </form>
                    {trackingSearchError && <p className="text-xs text-red-600 font-bold">{trackingSearchError}</p>}
                  </div>

                  {/* Selected Order Live Card */}
                  {currentTrackOrder && (
                    <div className="bg-white border border-gray-200/80 rounded-2xl p-6 md:p-8 shadow-2xs space-y-6">
                      
                      {/* Header Summary Bar */}
                      <div className="flex flex-wrap justify-between items-center gap-4 border-b border-gray-100 pb-5 text-xs">
                        <div>
                          <span className="text-gray-400 font-bold block text-[10px] uppercase tracking-wider">ORDER ID</span>
                          <span className="text-base font-black text-gray-900">{currentTrackOrder.order_number}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-bold block text-[10px] uppercase tracking-wider">PAYMENT METHOD</span>
                          <span className="font-bold text-emerald-700 uppercase">{currentTrackOrder.payment_method || "RAZORPAY ONLINE"}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-bold block text-[10px] uppercase tracking-wider">ESTIMATED DELIVERY</span>
                          <span className="font-bold text-gray-900">Saturday, Aug 15</span>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-1.5 text-right">
                          <span className="text-[10px] text-gray-500 font-bold block">DELIVERY SECURITY OTP</span>
                          <span className="text-sm font-black text-emerald-700 font-mono tracking-widest">8942</span>
                        </div>
                      </div>

                      {/* 🛵 Delivery Executive Info Card */}
                      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-5 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center font-black text-white shrink-0">
                            <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <span className="bg-emerald-500 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase">
                              Assigned Delivery Executive
                            </span>
                            <h4 className="text-sm font-black mt-0.5">Vikram Sharma</h4>
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
                            className="bg-emerald-500 hover:bg-emerald-400 text-gray-900 font-black text-xs px-4 py-2.5 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            📞 Call Executive
                          </a>
                        </div>
                      </div>

                      {/* 5-Stage Visual Order Stepper */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">Live Status Progress</h3>

                        <div className="space-y-6 relative pl-6 border-l-2 border-emerald-500 my-4 text-xs">
                          {getTimelineForStatus(currentTrackOrder?.status || "IN_TRANSIT", currentTrackOrder?.created_at, currentTrackOrder?.delivered_at).map((step, idx) => (
                            <div key={idx} className="relative pl-4">
                              <div
                                className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black ${
                                  step.completed
                                    ? "bg-[#059669] text-white ring-4 ring-emerald-100 shadow-2xs"
                                    : step.active
                                    ? "bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse"
                                    : "bg-gray-200 text-gray-400"
                                }`}
                              >
                                {step.completed ? "✓" : idx + 1}
                              </div>

                              <h4 className={`font-bold text-xs ${step.completed ? "text-gray-900" : "text-gray-400"}`}>
                                {step.status}
                              </h4>
                              <p className="text-gray-500 text-[11px] mt-0.5">{step.location} • <span className="font-semibold text-gray-700">{step.timestamp}</span></p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping Destination & Ordered Items */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-5 text-xs">
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-1">
                          <p className="font-black text-gray-900 text-xs uppercase tracking-wider">📍 Delivery Address</p>
                          <p className="font-bold text-gray-900">{currentTrackOrder.shipping_address?.name || "Sachin Rawat"}</p>
                          <p className="text-gray-600 line-clamp-2 text-xs">{currentTrackOrder.shipping_address?.street}, {currentTrackOrder.shipping_address?.city}, {currentTrackOrder.shipping_address?.state} - {currentTrackOrder.shipping_address?.pincode}</p>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
                          <p className="font-black text-gray-900 text-xs uppercase tracking-wider">🛍️ Items in this Package</p>
                          {(currentTrackOrder.items || []).map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center text-xs">
                              <span className="font-bold text-gray-800 truncate max-w-[180px]">{item.title}</span>
                              <span className="font-black text-gray-900">Qty {item.quantity || 1} • ₹{(item.price || 0).toLocaleString("en-IN")}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                </div>

              </div>
              )}

            </div>
          )}

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
                            When you place an order on E-COM Commerce, your purchased items will automatically appear here with a 24-hour return window!
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
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-gray-500 font-bold pt-0.5">
                                  <span className="text-gray-600">📅 {item.purchasedDate || `Purchased on ${new Date(item.orderTimestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}</span>
                                  <span>•</span>
                                  <span className="text-emerald-700">📦 {item.deliveredDate}</span>
                                </div>
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
                                  onClick={() => setViewingOrderDetail(item)}
                                  className="text-[11px] font-bold text-emerald-700 hover:underline block w-full text-center cursor-pointer"
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
                      onClick={() => setShowReturnPolicyModal(true)}
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
              {addresses.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-3xl p-10 text-center space-y-4 shadow-2xs">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl font-black border border-emerald-100 shadow-2xs">
                    📍
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-gray-900">No Delivery Addresses Saved</h3>
                    <p className="text-xs text-gray-500 max-w-md mx-auto font-medium">
                      Account: <span className="font-bold text-gray-900">{user?.email || user?.user_name || "Signed In User"}</span>. Add your home or work address for 1-click fast delivery.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={handleOpenAddModal}
                      className="bg-[#0B132B] hover:bg-black text-white font-black text-xs px-6 py-3 rounded-xl transition shadow-md inline-flex items-center gap-2 cursor-pointer"
                    >
                      <span className="text-base leading-none">+</span>
                      <span>Add New Delivery Address</span>
                    </button>
                  </div>
                </div>
              ) : (
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
              )}
            </div>
          )}

          {/* TAB: PROFILE INFORMATION (World-Class E-Commerce Account Dashboard) */}
          {activeTab === "profile" && (
            <div className="space-y-6 font-sans">
              
              {/* 🌟 VIP Customer Hero Banner Card */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0B132B] via-emerald-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-emerald-500/20">
                {/* Background Ambient Glow Circles */}
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 text-center sm:text-left">
                  
                  {/* Left: Avatar & Name */}
                  <div className="flex flex-col sm:flex-row items-center gap-5">
                    <div className="relative">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg border-2 border-white/20 uppercase tracking-widest">
                        {(firstName?.[0] || "S") + (lastName?.[0] || "W")}
                      </div>
                      <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[10px] p-1.5 rounded-xl shadow-md border border-white/40">
                        ✓
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                          {firstName || lastName ? `${firstName} ${lastName}`.trim() : (user?.user_name || "Soham Www")}
                        </h2>
                        <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-black uppercase px-3 py-1 rounded-full backdrop-blur-md">
                          ✨ VIP Club Member
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-gray-300 font-medium pt-0.5">
                        <span className="flex items-center gap-1.5">
                          <span>✉️</span>
                          <span>{user?.email || "soham@example.com"}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5">
                          <span>📱</span>
                          <span>{user?.phone || "+91 9876543210"}</span>
                        </span>
                      </div>

                      <p className="text-[11px] text-emerald-400 font-bold">
                        Member since August 2026 • Verified Customer Account
                      </p>
                    </div>
                  </div>

                  {/* Right: Quick Action Button */}
                  <button
                    onClick={() => setIsEditingName(!isEditingName)}
                    className="bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs px-5 py-3 rounded-2xl backdrop-blur-md border border-white/20 transition cursor-pointer shrink-0 shadow-sm"
                  >
                    {isEditingName ? "✕ Cancel Editing" : "✏️ Edit Profile Info"}
                  </button>

                </div>
              </div>

              {/* 📊 4 Quick E-Commerce Metric Widgets */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                
                {/* Orders Card */}
                <button
                  onClick={() => setActiveTab("orders")}
                  className="bg-white border border-gray-200/80 p-5 rounded-3xl shadow-2xs hover:shadow-md hover:border-emerald-300 transition text-left space-y-2 group cursor-pointer"
                >
                  <div className="flex justify-between items-center">
                    <span className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-lg group-hover:scale-110 transition">
                      📦
                    </span>
                    <span className="text-xs text-emerald-700 font-bold group-hover:translate-x-1 transition">&rarr;</span>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-gray-900">{userOrders.length}</p>
                    <p className="text-xs text-gray-500 font-extrabold">Total Orders Placed</p>
                  </div>
                </button>

                {/* Wallet Balance Card */}
                <button
                  onClick={() => setActiveTab("wallet")}
                  className="bg-white border border-gray-200/80 p-5 rounded-3xl shadow-2xs hover:shadow-md hover:border-emerald-300 transition text-left space-y-2 group cursor-pointer"
                >
                  <div className="flex justify-between items-center">
                    <span className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg group-hover:scale-110 transition">
                      💳
                    </span>
                    <span className="text-xs text-blue-700 font-bold group-hover:translate-x-1 transition">&rarr;</span>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-gray-900">₹{walletBalance.toLocaleString("en-IN")}</p>
                    <p className="text-xs text-gray-500 font-extrabold">E-COM Pay Wallet</p>
                  </div>
                </button>

                {/* Saved Addresses Card */}
                <button
                  onClick={() => setActiveTab("addresses")}
                  className="bg-white border border-gray-200/80 p-5 rounded-3xl shadow-2xs hover:shadow-md hover:border-emerald-300 transition text-left space-y-2 group cursor-pointer"
                >
                  <div className="flex justify-between items-center">
                    <span className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black text-lg group-hover:scale-110 transition">
                      📍
                    </span>
                    <span className="text-xs text-purple-700 font-bold group-hover:translate-x-1 transition">&rarr;</span>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-gray-900">{addresses.length}</p>
                    <p className="text-xs text-gray-500 font-extrabold">Saved Delivery Addresses</p>
                  </div>
                </button>

                {/* Wishlist Link Card */}
                <Link
                  href="/account/wishlist"
                  className="bg-white border border-gray-200/80 p-5 rounded-3xl shadow-2xs hover:shadow-md hover:border-emerald-300 transition text-left space-y-2 group cursor-pointer"
                >
                  <div className="flex justify-between items-center">
                    <span className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-black text-lg group-hover:scale-110 transition">
                      ❤️
                    </span>
                    <span className="text-xs text-rose-700 font-bold group-hover:translate-x-1 transition">&rarr;</span>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-gray-900">Wishlist</p>
                    <p className="text-xs text-gray-500 font-extrabold">Saved Favorites</p>
                  </div>
                </Link>

              </div>

              {/* 📝 Personal Information Details Form Card */}
              <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
                
                <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Personal Information</h3>
                    <p className="text-xs text-gray-500 font-medium">Manage your personal profile, contact info &amp; preferences</p>
                  </div>
                  <button
                    onClick={() => setIsEditingName(!isEditingName)}
                    className="text-xs font-black text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-1.5 rounded-xl transition cursor-pointer"
                  >
                    {isEditingName ? "Cancel" : "✏️ Edit Details"}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                  
                  {/* First Name */}
                  <div>
                    <label className="block text-xs font-extrabold text-gray-700 mb-1.5">First Name *</label>
                    <input
                      type="text"
                      disabled={!isEditingName}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Soham"
                      className="w-full bg-gray-50 border border-gray-200/80 rounded-2xl px-4 py-3 text-xs text-gray-900 font-extrabold focus:outline-none focus:border-emerald-500 focus:bg-white transition disabled:opacity-80 shadow-2xs"
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-xs font-extrabold text-gray-700 mb-1.5">Last Name *</label>
                    <input
                      type="text"
                      disabled={!isEditingName}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Rawat"
                      className="w-full bg-gray-50 border border-gray-200/80 rounded-2xl px-4 py-3 text-xs text-gray-900 font-extrabold focus:outline-none focus:border-emerald-500 focus:bg-white transition disabled:opacity-80 shadow-2xs"
                    />
                  </div>

                  {/* Email Address */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-extrabold text-gray-700">Email Address</label>
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">✓ Verified</span>
                    </div>
                    <input
                      type="email"
                      disabled
                      value={user?.email || "customer@e-com.in"}
                      className="w-full bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3 text-xs text-gray-700 font-bold cursor-not-allowed shadow-2xs"
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-extrabold text-gray-700">Mobile Phone Number</label>
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">✓ OTP Verified</span>
                    </div>
                    <input
                      type="tel"
                      disabled
                      value={user?.phone || "+91 9876543210"}
                      className="w-full bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3 text-xs text-gray-700 font-bold cursor-not-allowed shadow-2xs"
                    />
                  </div>

                </div>

                {isEditingName && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => {
                        const fullName = `${firstName} ${lastName}`.trim();
                        const updated = {
                          user_name: fullName,
                          email: user?.email || "customer@e-com.in",
                          phone: user?.phone
                        };
                        setUser(updated);
                        localStorage.setItem("ecom_user", JSON.stringify(updated));
                        setIsEditingName(false);
                        showToast("✓ Profile Information Updated & Saved to Account!");
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-6 py-3 rounded-2xl shadow-md cursor-pointer transition"
                    >
                      Save Profile Changes
                    </button>
                  </div>
                )}

              </div>

              {/* 🔐 Account Security & Password Card */}
              <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xs">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-base font-black text-gray-900">Security &amp; Account Access</h3>
                    <p className="text-xs text-gray-500 font-medium">Manage password and security settings</p>
                  </div>
                  <button
                    onClick={() => {
                      alert(`🔒 Password reset link sent to ${user?.email || "your registered email"}!`);
                    }}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer"
                  >
                    Change Password &rsaquo;
                  </button>
                </div>

                <div className="bg-gray-50 border border-gray-200/80 p-4 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-lg">
                      💻
                    </span>
                    <div>
                      <p className="font-extrabold text-gray-900">Current Active Session</p>
                      <p className="text-gray-500 text-[11px] font-medium">Chrome Browser on Windows • Online Now</p>
                    </div>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase border border-emerald-200">
                    Active
                  </span>
                </div>
              </div>

              {/* 💡 FAQs & Member Privileges Accordion */}
              <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xs">
                <h3 className="text-base font-black text-gray-900">Frequently Asked Questions &amp; Member Privileges</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  
                  <div className="bg-slate-50 border border-gray-200/80 p-4 rounded-2xl space-y-1">
                    <p className="font-extrabold text-gray-900 flex items-center gap-2">
                      <span className="text-emerald-600">❓</span> What happens when I update my email address?
                    </p>
                    <p className="text-gray-600 leading-relaxed font-medium text-[11px]">
                      Your login email ID changes automatically. All future order update notifications and invoices will be sent to your new email.
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-gray-200/80 p-4 rounded-2xl space-y-1">
                    <p className="font-extrabold text-gray-900 flex items-center gap-2">
                      <span className="text-emerald-600">⚡</span> How does 24-Hour Easy Return work?
                    </p>
                    <p className="text-gray-600 leading-relaxed font-medium text-[11px]">
                      Raise a return request within 24 hours of delivery from your Orders tab. Instant doorstep pickup will be arranged.
                    </p>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* TAB: ORDERS */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Your Order History</h2>
              <div className="space-y-4">
                {userOrders.length === 0 ? (
                  <div className="bg-white border border-gray-200 rounded-3xl p-10 text-center space-y-4 shadow-2xs">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl font-black border border-emerald-100 shadow-2xs">
                      📦
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-gray-900">No Orders Found</h3>
                      <p className="text-xs text-gray-500 max-w-md mx-auto font-medium">
                        Account: <span className="font-bold text-gray-900">{user?.email || user?.user_name || "Signed In User"}</span>. You haven't placed any orders yet.
                      </p>
                    </div>
                    <div className="pt-2">
                      <Link
                        href="/deals"
                        className="bg-[#059669] hover:bg-[#047857] text-white font-extrabold text-xs px-6 py-3 rounded-xl transition shadow-md inline-flex items-center gap-2 cursor-pointer"
                      >
                        <span>🛍️ Start Shopping Now &rarr;</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  userOrders.map((ord: any) => (
                    <div key={ord.id || ord.order_number} className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                          {ord.order_number || ord.id || "E-COM-ORDER"} • {ord.date || "Today"}
                        </span>
                        <h4 className="font-black text-gray-900 text-sm">{ord.title || "Purchased Product"}</h4>
                        <p className="text-xs text-gray-500 font-bold">Total: ₹{(ord.total || ord.total_amount || 0).toLocaleString("en-IN")}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full">
                          {ord.status || "CONFIRMED"}
                        </span>
                        <button
                          onClick={() => {
                            setActiveTab("track-order");
                            if (ord.order_number) setSelectedTrackOrderId(ord.order_number);
                          }}
                          className="bg-gray-900 hover:bg-black text-white text-xs font-black px-4 py-2 rounded-xl transition cursor-pointer"
                        >
                          Track Order &rsaquo;
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB: GIFT CARDS */}
          {activeTab === "gift-cards" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-gray-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-4 relative z-10">
                  <div>
                    <span className="bg-amber-400 text-gray-900 text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider">
                      🎁 E-COM GIFT CARD VAULT
                    </span>
                    <h2 className="text-2xl md:text-3xl font-black mt-2">Gift Cards &amp; Store Credits</h2>
                    <p className="text-xs text-gray-300 max-w-md mt-1">
                      Redeem digital vouchers, send instant gift cards to friends &amp; family, or view active voucher balances.
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300 block">Available Gift Balance</span>
                    <span className="text-2xl md:text-3xl font-black text-amber-300">₹{giftCardBalance.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-2xs space-y-4">
                <h3 className="font-black text-base text-gray-900">Add / Redeem Gift Card Voucher</h3>
                <form onSubmit={handleRedeemGiftCard} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Gift Card Code (e.g. E-COM-GIFT-992)"
                    value={giftCardCode}
                    onChange={(e) => setGiftCardCode(e.target.value)}
                    required
                    className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-900 font-mono font-bold focus:border-emerald-600 focus:outline-none uppercase"
                  />
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="4-Digit PIN"
                    value={giftCardPin}
                    onChange={(e) => setGiftCardPin(e.target.value)}
                    required
                    className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-900 font-mono font-bold focus:border-emerald-600 focus:outline-none text-center"
                  />
                  <button
                    type="submit"
                    className="bg-[#059669] hover:bg-[#047857] text-white font-black text-xs py-2.5 px-5 rounded-xl transition shadow-xs cursor-pointer"
                  >
                    Apply &amp; Add Balance &rarr;
                  </button>
                </form>
              </div>

              <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-2xs space-y-4">
                <h3 className="font-black text-base text-gray-900">Purchase Digital Gift Cards</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { amount: 500, label: "Starter Card", color: "from-blue-600 to-indigo-700" },
                    { amount: 1000, label: "Popular Choice", color: "from-emerald-600 to-teal-700" },
                    { amount: 2500, label: "VIP Premium", color: "from-amber-500 to-orange-600" },
                  ].map((card) => (
                    <div key={card.amount} className={`bg-gradient-to-br ${card.color} text-white p-5 rounded-2xl shadow-md flex flex-col justify-between space-y-4 relative`}>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-md">{card.label}</span>
                        <span className="text-xl">🎁</span>
                      </div>
                      <div>
                        <p className="text-2xl font-black">₹{card.amount.toLocaleString("en-IN")}</p>
                        <p className="text-[10px] opacity-80 mt-0.5">Instant delivery via email / SMS</p>
                      </div>
                      <button
                        onClick={() => handleBuyGiftCard(card)}
                        className="bg-white text-gray-900 hover:bg-gray-100 font-extrabold text-xs py-2 rounded-xl text-center cursor-pointer shadow-xs transition active:scale-95"
                      >
                        Buy Now &rsaquo;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: WALLET & SAVED CARDS */}
          {activeTab === "wallet" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-900 text-white rounded-3xl p-6 md:p-8 shadow-xl flex flex-wrap justify-between items-center gap-4">
                <div>
                  <span className="bg-white/20 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider">
                    💳 E-COM PAY WALLET
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black mt-2">Saved Cards &amp; Wallet Balance</h2>
                  <p className="text-xs text-emerald-100 max-w-md mt-1">
                    1-Click Razorpay instant checkout with zero OTP delays.
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl text-right flex flex-col items-end">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 block">Wallet Balance</span>
                  <span className="text-2xl md:text-3xl font-black text-amber-300">₹{walletBalance.toLocaleString("en-IN")}</span>
                  <button
                    onClick={() => setShowAddWalletModal(true)}
                    className="mt-2 bg-amber-400 hover:bg-amber-300 text-gray-900 font-black text-xs px-3.5 py-1.5 rounded-xl transition cursor-pointer shadow-xs flex items-center gap-1"
                  >
                    <span>+ Add Money to Wallet</span>
                  </button>
                </div>
              </div>

              <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-2xs space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-base text-gray-900">Saved Credit &amp; Debit Cards ({savedCards.length})</h3>
                  <button
                    onClick={() => setShowAddCardModal(true)}
                    className="text-xs font-black text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1"
                  >
                    <span>+ Add New Card</span>
                  </button>
                </div>

                {savedCards.length === 0 ? (
                  <div className="p-8 text-center bg-gray-50 border border-dashed border-gray-200 rounded-2xl text-xs text-gray-500 font-bold space-y-2">
                    <p className="text-2xl">💳</p>
                    <p>No saved cards found. Click "+ Add New Card" above to save your first payment card!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {savedCards.map((c) => (
                      <div key={c.id} className="border border-gray-200 rounded-2xl p-4 bg-gray-50 flex items-center justify-between shadow-2xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-gray-900 text-xs">{c.bank}</span>
                            {c.default && <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded">DEFAULT</span>}
                          </div>
                          <p className="text-xs font-mono font-bold text-gray-700">•••• •••• •••• {c.last4}</p>
                          <p className="text-[10px] text-gray-400">Expires {c.exp} • {c.type}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveCard(c.id)}
                          className="text-red-500 hover:text-red-700 font-bold text-xs cursor-pointer hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: COUPONS */}
          {activeTab === "coupons" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-amber-500 via-orange-600 to-amber-700 text-white rounded-3xl p-6 md:p-8 shadow-xl flex flex-wrap justify-between items-center gap-4">
                <div>
                  <span className="bg-white/20 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider">
                    🎟️ PROMO &amp; DISCOUNT VOUCHERS
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black mt-2">Active Discount Coupons</h2>
                  <p className="text-xs text-amber-100 max-w-md mt-1">
                    Apply these coupon codes during checkout for maximum savings on your orders!
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-center">
                  <span className="text-2xl font-black text-white">{coupons.length} Active</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-100 block">Available Coupons</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {coupons.map((c) => (
                  <div key={c.code} className="bg-white border border-amber-200/80 rounded-3xl p-5 shadow-2xs space-y-3 flex justify-between items-center border-l-8 border-l-amber-500">
                    <div className="space-y-1">
                      <span className="bg-amber-100 text-amber-900 font-black text-[10px] px-2.5 py-0.5 rounded-md uppercase font-mono">
                        {c.code}
                      </span>
                      <h3 className="text-lg font-black text-gray-900">{c.discount}</h3>
                      <p className="text-xs text-gray-500 font-medium">{c.minOrder} • {c.expiry}</p>
                    </div>

                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(c.code);
                        showToast(`🎉 Coupon "${c.code}" copied to clipboard! Apply at checkout.`);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 py-2.5 rounded-xl transition shadow-2xs cursor-pointer shrink-0"
                    >
                      Copy Code
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: SUPERCOIN & PLUS ZONE */}
          {activeTab === "supercoin" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-gray-900 via-amber-950 to-gray-900 text-white rounded-3xl p-6 md:p-8 shadow-2xl space-y-4 border border-amber-500/30">
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <span className="bg-amber-400 text-gray-900 text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider">
                      ⚡ PLUS VIP ZONE
                    </span>
                    <h2 className="text-2xl md:text-3xl font-black mt-2 text-amber-400">E-COM SuperCoins</h2>
                    <p className="text-xs text-gray-300 max-w-md mt-1">
                      Earn 5 SuperCoins for every ₹100 spent. Redeem coins for instant cash discounts &amp; free shipping!
                    </p>
                  </div>
                  <div className="bg-amber-400/10 border border-amber-400/30 p-4 rounded-2xl text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">SuperCoins Balance</span>
                    <span className="text-3xl font-black text-amber-400">⚡ 350 Coins</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">Worth ₹350 Cash Equivalent</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-2xs space-y-4">
                <h3 className="font-black text-base text-gray-900">Redeem SuperCoins for Rewards</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { title: "FLAT ₹100 Instant Discount", coins: 100 },
                    { title: "Free Express Delivery Voucher", coins: 150 },
                    { title: "FLAT ₹250 Off Electronics", coins: 250 },
                    { title: "1-Year VIP Plus Membership", coins: 350 },
                  ].map((r, i) => (
                    <div key={i} className="border border-gray-200 p-4 rounded-2xl flex justify-between items-center bg-gray-50 shadow-2xs">
                      <div>
                        <p className="font-bold text-xs text-gray-900">{r.title}</p>
                        <p className="text-[10px] text-amber-600 font-bold mt-0.5">⚡ {r.coins} SuperCoins</p>
                      </div>
                      <button
                        onClick={() => showToast(`🎉 Reward "${r.title}" claimed with ${r.coins} SuperCoins!`)}
                        className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-black text-xs px-3.5 py-2 rounded-xl transition shadow-2xs cursor-pointer"
                      >
                        Redeem
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: WISHLIST */}
          {activeTab === "wishlist" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-red-600 via-rose-700 to-pink-800 text-white rounded-3xl p-6 md:p-8 shadow-xl flex flex-wrap justify-between items-center gap-4">
                <div>
                  <span className="bg-white/20 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider">
                    ❤️ YOUR SAVED FAVORITES
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black mt-2">My Wishlist ({wishlist.length})</h2>
                  <p className="text-xs text-rose-100 max-w-md mt-1">
                    Items you've saved for later. Move them to your cart with 1-click whenever you're ready!
                  </p>
                </div>
              </div>

              {wishlist.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-3xl p-10 text-center space-y-4 shadow-2xs">
                  <div className="text-5xl">❤️</div>
                  <h3 className="text-xl font-black text-gray-900">Your Wishlist is Empty</h3>
                  <p className="text-xs text-gray-500">Explore our catalog and click the heart icon on items you love.</p>
                  <Link href="/search" className="inline-block bg-[#059669] text-white font-bold text-xs px-6 py-3 rounded-xl hover:bg-[#047857] transition shadow-md">
                    Explore Catalog &rarr;
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {wishlist.map((item: any) => (
                    <div key={item.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <img src={item.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"} alt={item.title} className="w-full h-36 object-contain rounded-xl bg-gray-50 p-2" />
                        <h4 className="font-bold text-xs text-gray-900 line-clamp-2">{item.title}</h4>
                        <p className="font-black text-gray-900 text-sm">₹{item.price?.toLocaleString("en-IN") || "999"}</p>
                      </div>
                      <button
                        onClick={() => {
                          const buyNowItem = [{
                            id: item.id,
                            handle: item.handle || (item.title ? item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") : String(item.id)),
                            title: item.title,
                            price: item.price || 999,
                            quantity: 1,
                            image: item.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"
                          }];
                          sessionStorage.setItem("ecom_buy_now_item", JSON.stringify(buyNowItem));
                          router.push("/checkout?buyNow=true");
                        }}
                        className="w-full bg-[#059669] hover:bg-[#047857] text-white font-black text-xs py-2.5 rounded-xl text-center cursor-pointer shadow-xs transition active:scale-98"
                      >
                        ⚡ Buy Now &rsaquo;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl flex flex-wrap justify-between items-center gap-4">
                <div>
                  <span className="bg-white/20 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider">
                    🔔 NOTIFICATION CENTER
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black mt-2">All System Notifications</h2>
                  <p className="text-xs text-blue-100 max-w-md mt-1">
                    Stay updated with shipment dispatch tracking, price drop alerts &amp; security notifications.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-2xs space-y-4">
                <div className="space-y-3">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-4 rounded-2xl border border-gray-200 bg-gray-50 flex items-start justify-between gap-3 shadow-2xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xs text-gray-900">{n.title}</span>
                          <span className="text-[10px] text-gray-400 font-medium">{n.time}</span>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">{n.text}</p>
                      </div>
                      <button
                        onClick={() => showToast("Notification cleared.")}
                        className="text-gray-400 hover:text-gray-900 text-xs font-bold cursor-pointer shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
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
                <label className="border-2 border-dashed border-gray-300 hover:border-emerald-500 bg-gray-50 hover:bg-emerald-50/40 rounded-2xl p-4 text-center cursor-pointer transition block space-y-1">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleReturnPhotoUpload}
                    className="hidden"
                  />
                  <div className="text-2xl">📷</div>
                  <div className="text-gray-800 font-bold text-xs">Click to browse &amp; upload defect photo / unboxing video</div>
                  <p className="text-[10px] text-gray-400 font-medium">Supports JPG, PNG, WEBP files from your device</p>
                </label>

                {returnPhotos.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-[11px] font-bold text-emerald-700">
                      ✓ {returnPhotos.length} Photo(s) Attached ({returnPhotoNames.join(", ")})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {returnPhotos.map((img, idx) => (
                        <div key={idx} className="relative w-16 h-16 rounded-xl border border-gray-200 overflow-hidden bg-white shadow-2xs group">
                          <img src={img} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveReturnPhoto(idx)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 hover:bg-red-700 text-white text-[10px] font-black flex items-center justify-center shadow-xs cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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

      {/* 🏡 ADD / EDIT ADDRESS MODAL */}
      {isAddAddressModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-gray-900">
                  {editingAddress ? "Edit Delivery Address" : "Add New Delivery Address"}
                </h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Enter delivery location details for fast checkout
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAddAddressModalOpen(false);
                  setEditingAddress(null);
                }}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 uppercase mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Sachin Rawat"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-900 focus:border-emerald-500 focus:bg-white focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-700 uppercase mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-900 focus:border-emerald-500 focus:bg-white focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 uppercase mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    value={formPincode}
                    onChange={(e) => setFormPincode(e.target.value)}
                    placeholder="e.g. 560103"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-900 focus:border-emerald-500 focus:bg-white focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-700 uppercase mb-1">
                    Landmark / Area
                  </label>
                  <input
                    type="text"
                    value={formLandmark}
                    onChange={(e) => setFormLandmark(e.target.value)}
                    placeholder="e.g. Near Metro Station"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-900 focus:border-emerald-500 focus:bg-white focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-700 uppercase mb-1">
                  Flat, House No., Building, Street Address *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Complete street address details..."
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-900 focus:border-emerald-500 focus:bg-white focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-700 uppercase mb-2">
                  Address Type
                </label>
                <div className="flex items-center gap-3">
                  {["HOME", "WORK", "OTHER"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormType(type)}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer border ${
                        formType === type
                          ? "bg-[#059669] text-white border-[#059669] shadow-xs"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200"
                      }`}
                    >
                      {type === "HOME" ? "🏠 Home" : type === "WORK" ? "🏢 Work" : "📍 Other"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="defaultAddressCheck"
                  checked={formIsDefault}
                  onChange={(e) => setFormIsDefault(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300 cursor-pointer"
                />
                <label htmlFor="defaultAddressCheck" className="text-xs font-bold text-gray-700 cursor-pointer">
                  Make this my default delivery address
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddAddressModalOpen(false);
                    setEditingAddress(null);
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-black py-3 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#059669] hover:bg-[#047857] text-white text-xs font-black py-3 rounded-xl transition shadow-md cursor-pointer"
                >
                  {editingAddress ? "Update Address" : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Support Chat Widget */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => showToast("💬 Live Customer Support Chat Active 24/7!", "info")}
          className="w-14 h-14 bg-[#10B981] hover:bg-[#059669] text-white rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-105 cursor-pointer"
          title="Customer Support Chat"
        >
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5.025L2 22l5.122-1.303A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
          </svg>
        </button>
      </div>

      {/* 🔔 In-Page Custom Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[9999] max-w-md bg-gray-900 text-white p-4 rounded-2xl shadow-2xl border border-gray-700 flex items-center gap-3 animate-in slide-in-from-top duration-200">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white font-black flex items-center justify-center text-sm shrink-0">
            ✓
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-xs leading-snug">{toastMessage.text}</p>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-gray-400 hover:text-white font-bold text-xs cursor-pointer">✕</button>
        </div>
      )}

      {/* 📦 Custom Order Details Modal Popup (Replaces Browser alert) */}
      {viewingOrderDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-xs">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-black text-gray-900">📦 Order Details Summary</h3>
                <p className="text-xs text-gray-500 font-mono">Order ID #{viewingOrderDetail.id}</p>
              </div>
              <button onClick={() => setViewingOrderDetail(null)} className="text-gray-400 hover:text-gray-900 text-lg font-bold cursor-pointer">✕</button>
            </div>

            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
              <img src={viewingOrderDetail.image} alt={viewingOrderDetail.productName} className="w-14 h-14 object-cover rounded-xl bg-white p-1 border border-gray-200" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm line-clamp-1">{viewingOrderDetail.productName}</p>
                <p className="text-gray-500 text-[11px]">{viewingOrderDetail.specs || "Standard Package"}</p>
                <p className="font-black text-emerald-700 text-sm mt-0.5">₹{viewingOrderDetail.price.toLocaleString("en-IN")}</p>
              </div>
            </div>

            <div className="space-y-2 bg-gray-50 p-3 rounded-2xl border border-gray-100 text-[11px]">
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Payment Status:</span>
                <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px] uppercase">{viewingOrderDetail.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Delivered Date:</span>
                <span className="font-bold text-gray-900">{viewingOrderDetail.deliveredDate || "Aug 17, 2026"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Return Window:</span>
                <span className="font-bold text-emerald-700">24-Hour Policy Active</span>
              </div>
            </div>

            <button
              onClick={() => setViewingOrderDetail(null)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 rounded-xl cursor-pointer text-center"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

      {/* 📄 Custom Return Policy Modal Popup */}
      {showReturnPolicyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl text-xs">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-black text-gray-900">🛡️ E-COM Official 24-Hour Return Policy</h3>
                <p className="text-xs text-gray-500">Guaranteed instant replacement or full refund</p>
              </div>
              <button onClick={() => setShowReturnPolicyModal(false)} className="text-gray-400 hover:text-gray-900 text-lg font-bold cursor-pointer">✕</button>
            </div>

            <div className="space-y-3 leading-relaxed text-gray-700">
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-emerald-900">
                <p className="font-bold text-xs">1. 24-Hour Window Timer</p>
                <p className="text-[11px] mt-0.5">Return requests must be submitted within 24 hours of successful product delivery.</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 p-3 rounded-2xl">
                <p className="font-bold text-xs text-gray-900">2. Defect Photo / Video Proof Required</p>
                <p className="text-[11px] mt-0.5 text-gray-500">Attach clear photos or an unboxing video showing the item condition &amp; original box.</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 p-3 rounded-2xl">
                <p className="font-bold text-xs text-gray-900">3. 12-Hour Inspection &amp; Pickup Dispatch</p>
                <p className="text-[11px] mt-0.5 text-gray-500">Our customer support team reviews proofs in 12h and schedules courier doorstep pickup.</p>
              </div>
            </div>

            <button
              onClick={() => setShowReturnPolicyModal(false)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 rounded-xl cursor-pointer text-center"
            >
              Got it, Close Policy
            </button>
          </div>
        </div>
      )}

      {/* 💰 Add Money to Wallet Modal */}
      {showAddWalletModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl text-xs">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-black text-gray-900">💳 Add Money to E-COM Pay Wallet</h3>
                <p className="text-xs text-gray-500">1-Click Instant Top-up via UPI or Card</p>
              </div>
              <button onClick={() => setShowAddWalletModal(false)} className="text-gray-400 hover:text-gray-900 text-lg font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleAddMoneyToWallet} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-900 block">Select Top-Up Amount</label>
                <div className="grid grid-cols-4 gap-2">
                  {["500", "1000", "2000", "5000"].map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => setAddWalletAmount(amt)}
                      className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                        addWalletAmount === amt
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                          : "bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100"
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-900 block">Or Custom Amount (₹)</label>
                <input
                  type="number"
                  min="100"
                  max="50000"
                  value={addWalletAmount}
                  onChange={(e) => setAddWalletAmount(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-900 font-bold focus:border-emerald-600 focus:outline-none"
                  placeholder="Enter amount (e.g. 1500)"
                />
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-[11px] text-emerald-900 font-medium">
                💡 Current Wallet Balance: <span className="font-black text-emerald-700">₹{walletBalance.toLocaleString("en-IN")}</span> &rarr; New Balance after top-up: <span className="font-black text-emerald-700">₹{(walletBalance + (Number(addWalletAmount) || 0)).toLocaleString("en-IN")}</span>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-3 rounded-xl transition shadow-md cursor-pointer"
              >
                Proceed &amp; Add ₹{Number(addWalletAmount || 0).toLocaleString("en-IN")} &rarr;
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 💳 Save New Card Modal */}
      {showAddCardModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-xs">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-black text-gray-900">💳 Save Payment Card (Razorpay Vault)</h3>
                <p className="text-xs text-gray-500">256-bit encrypted card saving for fast checkout</p>
              </div>
              <button onClick={() => setShowAddCardModal(false)} className="text-gray-400 hover:text-gray-900 text-lg font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleAddCardSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-900 block">Bank Name</label>
                  <select
                    value={newCardBank}
                    onChange={(e) => setNewCardBank(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none"
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="SBI Bank">SBI (State Bank of India)</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Kotak Mahindra">Kotak Mahindra</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-900 block">Card Network</label>
                  <select
                    value={newCardType}
                    onChange={(e) => setNewCardType(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none"
                  >
                    <option value="VISA Debit Card">VISA Debit Card</option>
                    <option value="Mastercard Credit">Mastercard Credit</option>
                    <option value="RuPay Card">RuPay Debit Card</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-900 block">Cardholder Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sachin Rawat"
                  value={newCardHolder}
                  onChange={(e) => setNewCardHolder(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-900 font-bold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-900 block">16-Digit Card Number</label>
                <input
                  type="text"
                  maxLength={19}
                  required
                  placeholder="4821 9102 3840 5821"
                  value={newCardNumber}
                  onChange={(e) => setNewCardNumber(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-900 font-mono font-bold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-900 block">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    maxLength={5}
                    required
                    placeholder="08/29"
                    value={newCardExp}
                    onChange={(e) => setNewCardExp(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-xs font-mono font-bold text-gray-900 focus:outline-none text-center"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-900 block">CVV (3 Digits)</label>
                  <input
                    type="password"
                    maxLength={3}
                    required
                    placeholder="•••"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-xs font-mono font-bold text-gray-900 focus:outline-none text-center"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-3 rounded-xl transition shadow-md cursor-pointer mt-2"
              >
                Save &amp; Vault Card &rarr;
              </button>
            </form>
          </div>
        </div>
      )}

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
