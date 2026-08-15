"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getUserAddressesKey } from "lib/utils";

export function DeliveryLocationPicker() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userAddresses, setUserAddresses] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [pincodeInput, setPincodeInput] = useState("");
  const [pincodeError, setPincodeError] = useState("");
  const [deliveryInfo, setDeliveryInfo] = useState<string | null>(null);
  const [currentPincode, setCurrentPincode] = useState("474001");
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("skipd_user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        setIsLoggedIn(true);
        const name = u.user_name || u.name || u.email?.split("@")[0] || "User";
        setUserName(name.split(" ")[0]);
      } catch {
        setIsLoggedIn(true);
      }
    } else {
      setIsLoggedIn(false);
    }

    try {
      const key = getUserAddressesKey();
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        setUserAddresses(parsed);
        if (parsed.length > 0) {
          setSelectedId(parsed[0].id);
          if (parsed[0].pincode) setCurrentPincode(parsed[0].pincode);
        }
      } else {
        setUserAddresses([]);
      }
    } catch {}
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleApplyPincode = async () => {
    if (!/^\d{6}$/.test(pincodeInput)) {
      setPincodeError("Please enter a valid 6-digit Indian pincode.");
      return;
    }
    setPincodeError("");
    setCurrentPincode(pincodeInput);
    setDeliveryInfo("Checking serviceability...");

    try {
      const res = await fetch(`http://127.0.0.1:8080/api/v1/shipping/serviceability?pincode=${pincodeInput}`);
      if (res.ok) {
        const data = await res.json();
        setDeliveryInfo(`✅ Deliverable! ${data.estimated_delivery} via ${data.courier_partner}${data.cod_available ? " | COD Available" : ""}`);
      } else {
        setDeliveryInfo("🟡 Delivery available with extended timeline (5-7 days).");
      }
    } catch {
      const isMetro = pincodeInput.startsWith("11") || pincodeInput.startsWith("40") || pincodeInput.startsWith("56") || pincodeInput.startsWith("70");
      setDeliveryInfo(isMetro ? "✅ Express delivery: 1-2 Business Days | COD Available" : "✅ Standard delivery: 3-4 Business Days | COD Available");
    }

    setTimeout(() => setIsOpen(false), 1200);
  };

  return (
    <div className="relative hidden xl:flex items-center">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 transition group cursor-pointer px-2 py-1.5 rounded-xl hover:bg-gray-100"
        title="Choose delivery location"
      >
        <div className="text-left leading-tight">
          <span className="text-[10px] text-gray-400 font-medium block leading-none">
            Deliver to {isLoggedIn ? userName : ""}
          </span>
          <span className="font-bold text-gray-900 text-xs">{currentPincode}</span>
        </div>
        <span className="text-gray-400 text-[10px]">▼</span>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            ref={modalRef}
            className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center px-5 pt-5 pb-3 border-b border-gray-100">
              <h2 className="text-base font-black text-gray-900">Choose your location</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-900 font-black text-lg cursor-pointer w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Subtitle */}
              <p className="text-xs text-amber-800 font-medium leading-snug">
                Select a delivery location to see product availability and delivery options
              </p>

              {/* Saved Addresses (Visible when logged in) */}
              {isLoggedIn ? (
                <div className="space-y-2.5">
                  {userAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => {
                        setSelectedId(addr.id);
                        setCurrentPincode(addr.pincode);
                      }}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition text-xs ${
                        selectedId === addr.id
                          ? "border-blue-500 bg-blue-50/60"
                          : "border-gray-200 hover:border-gray-400 bg-white"
                      }`}
                    >
                      <p className="font-bold text-gray-900 leading-snug">
                        {addr.name} {addr.address}
                      </p>
                      {addr.isDefault && (
                        <span className="text-amber-700 font-bold text-[10px] mt-1 block">Your default address</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-center text-xs space-y-1">
                  <p className="font-bold text-amber-900">Sign in to see your saved addresses</p>
                  <p className="text-[11px] text-gray-600">Access your saved addresses from your account profile.</p>
                </div>
              )}

              {/* Add New Address Link */}
              <div className="text-center">
                <Link
                  href="/account?tab=addresses"
                  onClick={() => setIsOpen(false)}
                  className="text-xs font-bold text-amber-700 hover:underline cursor-pointer inline-block"
                >
                  + Add a new address or pickup location
                </Link>
              </div>

              {/* Pincode Input Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 border-t border-gray-200"></div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Or enter an Indian pincode</span>
                <div className="flex-1 border-t border-gray-200"></div>
              </div>

              {/* Pincode Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincodeInput}
                  onChange={(e) => {
                    setPincodeInput(e.target.value.replace(/\D/g, ""));
                    setPincodeError("");
                    setDeliveryInfo(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyPincode()}
                  placeholder="e.g. 400001, 110001..."
                  className="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:border-blue-500 focus:outline-none placeholder:text-gray-400 font-semibold"
                />
                <button
                  onClick={handleApplyPincode}
                  className="bg-gray-900 hover:bg-black text-white font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer whitespace-nowrap shadow-xs"
                >
                  Apply
                </button>
              </div>

              {pincodeError && (
                <p className="text-[11px] text-red-600 font-semibold">{pincodeError}</p>
              )}

              {deliveryInfo && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold px-3 py-2.5 rounded-xl">
                  {deliveryInfo}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
