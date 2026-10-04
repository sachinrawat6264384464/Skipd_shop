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
    <div className="min-h-[60vh] flex items-center justify-center p-6 text-center font-sans bg-[#FAF7F2]">
      <div className="max-w-md w-full bg-[#FFFDF9] border border-[#E8E1D1] rounded-3xl p-8 shadow-xl space-y-4">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto text-3xl font-black border border-blue-100 shadow-xs">
          🛍️
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-black text-gray-900">BotCom Store Sync Notice</h2>
          <p className="text-xs text-gray-600 font-medium">
            We updated catalog states in real time. Click below to refresh your view smoothly.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-6 py-3 rounded-xl transition shadow-md cursor-pointer flex-1"
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
