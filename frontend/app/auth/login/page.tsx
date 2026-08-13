"use client";

import { useState } from "react";
import Link from "next/link";

export default function CustomerLoginPage() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const userObj = {
        user_name: emailOrPhone.includes("@") ? emailOrPhone.split("@")[0] : "Sachin Rawat",
        email: emailOrPhone.includes("@") ? emailOrPhone : "sachin.rawat@example.com",
        phone: !emailOrPhone.includes("@") ? emailOrPhone : "+91 6264384464"
      };

      localStorage.setItem("skipd_token", "jwt_token_demo_skipd_2026");
      localStorage.setItem("skipd_user", JSON.stringify(userObj));

      setLoading(false);
      window.location.href = "/account?tab=profile";
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl overflow-hidden max-w-3xl w-full shadow-2xl flex flex-col md:flex-row border border-gray-200">
        
        {/* 📘 Left Blue Hero Panel (Matching Reference Screenshot 1) */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-8 md:p-12 md:w-2/5 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-4 z-10">
            <h1 className="text-3xl font-black">Login</h1>
            <p className="text-blue-100 text-xs md:text-sm leading-relaxed font-medium">
              Get access to your Orders, Wishlist and Recommendations
            </p>
          </div>

          <div className="z-10 mt-12 space-y-4">
            <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-xs space-y-1">
              <span className="bg-emerald-400 text-black font-extrabold text-[10px] px-2 py-0.5 rounded uppercase">
                ✓ Official Customer Portal
              </span>
              <p className="text-[11px] text-blue-100 font-medium">🔒 256-bit Encrypted SSL Commerce Account</p>
            </div>
            <div className="w-28 h-28 mx-auto opacity-90 flex items-center justify-center text-6xl">
              📦
            </div>
          </div>
        </div>

        {/* 🤍 Right White Form Panel (Matching Reference Screenshot 1) */}
        <div className="p-8 md:p-12 md:w-3/5 flex flex-col justify-between space-y-6">
          <form onSubmit={handleLoginSubmit} className="space-y-6 text-xs">
            <div>
              <label className="text-gray-700 block mb-1.5 font-semibold">Enter Email / Mobile number</label>
              <input
                type="text"
                required
                placeholder="e.g. customer@example.com or +91 9876543210"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="text-gray-700 block mb-1.5 font-semibold">Password</label>
              <input
                type="password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none transition"
              />
            </div>

            <p className="text-[11px] text-gray-500 leading-normal">
              By continuing, you agree to SKIPD's{" "}
              <Link href="/terms" className="text-blue-600 font-bold hover:underline">
                Terms of Use
              </Link>{" "}
              and{" "}
              <Link href="/terms" className="text-blue-600 font-bold hover:underline">
                Privacy Policy
              </Link>
              .
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-sm py-4 rounded-2xl transition shadow-md shadow-orange-500/20 cursor-pointer"
            >
              {loading ? "Verifying Credentials..." : "REQUEST OTP / LOGIN"}
            </button>
          </form>

          <div className="text-center pt-4 border-t border-gray-100">
            <Link href="/auth/register" className="text-xs text-blue-600 font-bold hover:underline">
              New to SKIPD? Create an account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
