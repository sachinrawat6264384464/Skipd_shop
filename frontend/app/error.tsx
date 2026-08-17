"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Storefront Error Boundary Captured]:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md w-full bg-white border border-gray-200/80 rounded-3xl p-8 shadow-2xl space-y-4">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl font-black border border-emerald-100 shadow-2xs">
          🛍️
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-black text-gray-900">SKIPD Store Sync Notice</h2>
          <p className="text-xs text-gray-500 font-medium">
            We updated catalog states in real time. Click below to refresh your view smoothly.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="bg-[#059669] hover:bg-[#047857] text-white font-black text-xs px-6 py-3 rounded-xl transition shadow-md cursor-pointer flex-1"
          >
            Retry Action &rarr;
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs px-5 py-3 rounded-xl transition cursor-pointer flex-1"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
}
