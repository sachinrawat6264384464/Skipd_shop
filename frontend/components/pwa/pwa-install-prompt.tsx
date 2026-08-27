"use client";

import { useState, useEffect } from "react";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 bg-gray-900/95 text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/30 backdrop-blur-md max-w-sm flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center gap-3">
        <span className="text-2xl bg-emerald-500/20 p-2 rounded-xl border border-emerald-400/30">📲</span>
        <div>
          <h4 className="font-extrabold text-xs text-emerald-400">Install E-COM App</h4>
          <p className="text-[10px] text-gray-300 font-medium">Fast 1-Tap Shopping & Offline Deals</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={handleInstallClick}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl transition cursor-pointer shadow-xs"
        >
          Install
        </button>
        <button
          type="button"
          onClick={() => setShowPrompt(false)}
          className="text-gray-400 hover:text-white text-xs px-1.5 py-1 rounded-lg"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
