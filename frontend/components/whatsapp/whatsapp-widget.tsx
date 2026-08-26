"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

export function WhatsAppFloatingWidget() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const phoneNumber = "919876543210"; // E-COM Support Line

  // Hide WhatsApp widget on admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const handleOpenWhatsApp = (message: string) => {
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encoded}`, "_blank");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 bg-neutral-900 border border-neutral-800 p-4 rounded-2xl shadow-2xl w-72 text-white animate-in fade-in slide-in-from-bottom-2">
          <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h5 className="font-bold text-xs">E-COM WhatsApp Support</h5>
            </div>
            <button onClick={() => setOpen(false)} className="text-neutral-400 hover:text-white text-xs font-bold">
              ✕
            </button>
          </div>

          <p className="text-xs text-neutral-400 my-3">
            Hi there! 👋 How can we help you today with your order or shipping?
          </p>

          <div className="space-y-2">
            <button
              onClick={() => handleOpenWhatsApp("Hi, I want to track my order status!")}
              className="w-full text-left bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 p-2 rounded-lg text-xs transition text-emerald-400 font-medium"
            >
              🚚 Track My Order Status
            </button>
            <button
              onClick={() => handleOpenWhatsApp("Hi, I have a query about sizing and product quality!")}
              className="w-full text-left bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 p-2 rounded-lg text-xs transition text-white"
            >
              👕 Product &amp; Size Assistance
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-full shadow-2xl flex items-center justify-center text-2xl transition-transform hover:scale-110 focus:ring-4 focus:ring-emerald-400/50 cursor-pointer"
        title="Chat on WhatsApp"
      >
        💬
      </button>
    </div>
  );
}
