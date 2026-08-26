"use client";

import { useState } from "react";

export function RewardsBanner() {
  const [modalOpen, setModalOpen] = useState(false);
  const referralCode = "ECOM-REF-9842";
  const [copied, setCopied] = useState(false);

  const copyReferral = () => {
    navigator.clipboard.writeText(`Use my referral code ${referralCode} to get ₹250 OFF on E-COM Commerce! https://ecom.botmartz.com`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <>
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/60 border border-emerald-200 rounded-2xl p-4 my-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xl shadow-xs">
            🪙
          </div>
          <div>
            <h4 className="font-bold text-sm text-gray-900">E-COM Rewards &amp; Wallet Club</h4>
            <p className="text-xs text-gray-600">Earn 5% cashback coins on every purchase + Give ₹250, Get ₹250</p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="bg-gray-900 hover:bg-black text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-xs whitespace-nowrap"
        >
          🎁 Refer &amp; Earn ₹250
        </button>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 p-6 rounded-3xl max-w-sm w-full text-gray-900 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-300 mx-auto flex items-center justify-center text-2xl mb-3">
              🎁
            </div>
            <h4 className="text-xl font-bold">Refer a Friend, Get ₹250</h4>
            <p className="text-xs text-gray-600 mt-2">
              Share your personal referral link. When your friend makes their first order, you both get ₹250 wallet credit!
            </p>

            <div className="my-5 p-3.5 bg-gray-50 border border-gray-200 rounded-2xl flex justify-between items-center text-xs font-mono">
              <span className="text-emerald-700 font-bold">{referralCode}</span>
              <button
                onClick={copyReferral}
                className="bg-gray-900 hover:bg-black px-3.5 py-1.5 rounded-xl text-white font-sans text-xs font-bold transition shadow-xs"
              >
                {copied ? "✓ Copied!" : "Copy Link"}
              </button>
            </div>

            <button
              onClick={() => setModalOpen(false)}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs py-3 rounded-xl transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
