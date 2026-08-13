"use client";

import { useState } from "react";

export function PincodeChecker() {
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    serviceable: boolean;
    estimated_delivery: string;
    express_shipping: boolean;
    cod_available: boolean;
  } | null>(null);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length !== 6) return;
    setLoading(true);
    
    // Simulate real-time API call to Shiprocket Serviceability
    setTimeout(() => {
      const isMetro = ["11", "40", "56", "70", "60", "50"].some(prefix => pincode.startsWith(prefix));
      setResult({
        serviceable: true,
        estimated_delivery: isMetro ? "Express 1-2 Business Days" : "Standard 3-4 Business Days",
        express_shipping: isMetro,
        cod_available: true
      });
      setLoading(false);
    }, 400);
  };

  return (
    <div className="my-4 p-4 rounded-2xl bg-gray-50 border border-gray-200">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-emerald-700 font-extrabold text-sm">📍 Delivery &amp; Availability Check</span>
      </div>
      
      <form onSubmit={handleCheck} className="flex gap-2 mt-3">
        <input
          type="text"
          maxLength={6}
          placeholder="Enter 6-digit Pincode (e.g. 400001)"
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
          className="flex-1 bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || pincode.length !== 6}
          className="bg-gray-900 hover:bg-black disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-xs"
        >
          {loading ? "Checking..." : "Check"}
        </button>
      </form>

      {result && (
        <div className="mt-4 pt-3 border-t border-gray-200 space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-emerald-700 font-bold">
            <span>✓ Serviceable to Pincode {pincode}</span>
            <span className="bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg text-[10px] font-bold">
              {result.estimated_delivery}
            </span>
          </div>
          <div className="flex gap-4 text-gray-600 mt-1 font-medium">
            <span>✓ Cash on Delivery Available</span>
            <span>✓ Free Returns &amp; Exchange</span>
          </div>
        </div>
      )}
    </div>
  );
}
