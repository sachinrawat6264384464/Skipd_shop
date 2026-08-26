"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CustomerRegisterPage() {
  const [fullName, setFullName] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // 🌐 Google OAuth Modal state & Logic
  const [showGooglePicker, setShowGooglePicker] = useState(false);
  const [selectedGoogleAccount, setSelectedGoogleAccount] = useState("sachinrawat6264384464@gmail.com");
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(async () => {
      const userObj = {
        user_name: fullName || "Sachin Rawat",
        email: emailOrPhone.includes("@") ? emailOrPhone : "sachin.rawat@email.com",
        phone: !emailOrPhone.includes("@") ? emailOrPhone : "+91 6264384464"
      };

      localStorage.setItem("ecom_token", "jwt_token_demo_ecom_2026");
      localStorage.setItem("ecom_user", JSON.stringify(userObj));

      try {
        const { sendWelcomeEmail } = await import("lib/services/email-service");
        sendWelcomeEmail(userObj.email, userObj.user_name);
      } catch (e) {}

      setLoading(false);
      window.location.href = "/account?tab=profile";
    }, 600);
  };

  // Auto-dismiss success notification banner after 4 seconds
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // 🌐 Create Account via Google (Direct Account Creation with chosen Google Email)
  const handleGoogleAuthSubmit = async () => {
    setError("");
    setSuccessMsg("");
    setLoading(true);

    const chosenEmail = selectedGoogleAccount === "custom" ? customGoogleEmail.trim() : selectedGoogleAccount;

    if (!chosenEmail || !chosenEmail.includes("@")) {
      setError("Please enter a valid Google email address");
      setLoading(false);
      return;
    }

    try {
      setEmailOrPhone(chosenEmail);
      if (!fullName) {
        const prefix = chosenEmail.split("@")[0] || "";
        const nameFromEmail = prefix.replace(/[._]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
        setFullName(nameFromEmail);
      }
      setLoading(false);
      setShowGooglePicker(false);
      setSuccessMsg(`✓ Google Email (${chosenEmail}) selected! Please set your account password below to complete account registration.`);
    } catch (err: any) {
      setLoading(false);
      setError("Failed to process Google account selection.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl overflow-hidden max-w-3xl w-full shadow-2xl flex flex-col md:flex-row border border-gray-200">
        
        {/* 📘 Left Blue Hero Panel */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-8 md:p-12 md:w-2/5 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-4 z-10">
            <h1 className="text-3xl font-black">Looks like you're new here!</h1>
            <p className="text-blue-100 text-xs md:text-sm leading-relaxed font-medium">
              Sign up with your mobile or email number to get started with E-COM Commerce
            </p>
          </div>

          <div className="z-10 mt-12 space-y-4">
            <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-xs space-y-1">
              <span className="bg-emerald-400 text-black font-extrabold text-[10px] px-2 py-0.5 rounded uppercase">
                ✓ Create Free Account
              </span>
              <p className="text-[11px] text-blue-100 font-medium">🪙 Earn 250 Bonus Supercoins Instantly</p>
            </div>
            <div className="w-28 h-28 mx-auto opacity-90 flex items-center justify-center text-6xl">
              🎁
            </div>
          </div>
        </div>

        {/* 🤍 Right White Form Panel */}
        <div className="p-8 md:p-12 md:w-3/5 flex flex-col justify-between space-y-6">
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-4 py-3 rounded-xl">
              ⚠️ {error}
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-4 py-3 rounded-xl">
              ✅ {successMsg}
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="space-y-5 text-xs">
            <div>
              <label className="text-gray-700 block mb-1.5 font-semibold">Full Name</label>
              <input
                type="text"
                required
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:border-blue-600 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="text-gray-700 block mb-1.5 font-semibold">Mobile Number or Email</label>
              <input
                type="text"
                required
                placeholder="e.g. +91 9876543210 or email@domain.com"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:border-blue-600 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="text-gray-700 block mb-1.5 font-semibold">Set Account Password</label>
              <input
                type="password"
                required
                placeholder="Set a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:border-blue-600 focus:outline-none transition"
              />
            </div>

            <p className="text-[11px] text-gray-500 leading-normal">
              By continuing, you agree to E-COM's{" "}
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
              className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-sm py-4 rounded-2xl transition shadow-md shadow-orange-500/20 cursor-pointer uppercase tracking-wider"
            >
              {loading ? "Creating Account..." : "CREATE ACCOUNT"}
            </button>

            {/* ─── OR DIVIDER ─── */}
            <div className="flex items-center my-3">
              <div className="flex-1 border-t border-gray-200" />
              <span className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">OR</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>

            {/* 🌐 OFFICIAL GOOGLE OAUTH 2.0 DIRECT REDIRECT BUTTON (Redirects to accounts.google.com) */}
            <button
              type="button"
              onClick={() => {
                setError("");
                const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "799222349882-ne3i0s9jdm5s0p7ll2d7tlsi1vc1halt.apps.googleusercontent.com";
                const redirectUri = window.location.origin + "/auth/login";
                const scope = "openid profile email";
                
                const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
                  `client_id=${clientId}&` +
                  `redirect_uri=${encodeURIComponent(redirectUri)}&` +
                  `response_type=token%20id_token&` +
                  `scope=${encodeURIComponent(scope)}&` +
                  `state=register&` +
                  `prompt=select_account&` +
                  `nonce=${Math.random().toString(36).substring(2)}`;

                window.location.href = googleAuthUrl;
              }}
              className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 font-bold text-xs py-3.5 px-4 rounded-2xl transition flex items-center justify-center gap-2.5 shadow-2xs cursor-pointer group"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Sign up with Google</span>
            </button>
          </form>

          <div className="text-center pt-4 border-t border-gray-100">
            <Link href="/auth/login" className="text-xs text-blue-600 font-bold hover:underline">
              Existing User? Log in to your account
            </Link>
          </div>
        </div>

      </div>

      {/* 🌐 Google OAuth Account Chooser Modal Dialog */}
      {showGooglePicker && (
        <div className="fixed inset-0 z-[100000] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 border border-gray-100">
            {/* Google Header */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center mx-auto shadow-2xs">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
              <h3 className="text-lg font-black text-gray-900">Sign in with Google</h3>
              <p className="text-xs text-gray-500 font-medium">Choose an account to create account on <span className="font-bold text-gray-900">E-COM Commerce</span></p>
            </div>

            {/* Google Accounts Selection List */}
            <div className="space-y-2.5 text-xs">
              {/* Account 1 */}
              <div
                onClick={() => setSelectedGoogleAccount("sachinrawat6264384464@gmail.com")}
                className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition ${
                  selectedGoogleAccount === "sachinrawat6264384464@gmail.com"
                    ? "bg-blue-50 border-blue-500 shadow-2xs"
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-emerald-500 text-white font-black text-sm flex items-center justify-center shrink-0">
                  S
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-gray-900">Sachin Rawat</p>
                  <p className="text-gray-500 text-[11px] truncate">sachinrawat6264384464@gmail.com</p>
                </div>
              </div>

              {/* Account 2 */}
              <div
                onClick={() => setSelectedGoogleAccount("sachin.rawat@email.com")}
                className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition ${
                  selectedGoogleAccount === "sachin.rawat@email.com"
                    ? "bg-blue-50 border-blue-500 shadow-2xs"
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-blue-500 text-white font-black text-sm flex items-center justify-center shrink-0">
                  S
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-gray-900">Sachin Rawat (Personal)</p>
                  <p className="text-gray-500 text-[11px] truncate">sachin.rawat@email.com</p>
                </div>
              </div>

              {/* Account 3: Custom Google Email Input */}
              <div
                onClick={() => setSelectedGoogleAccount("custom")}
                className={`flex flex-col gap-2 p-3 rounded-2xl border cursor-pointer transition ${
                  selectedGoogleAccount === "custom"
                    ? "bg-blue-50 border-blue-500 shadow-2xs"
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-300 text-gray-700 font-black text-sm flex items-center justify-center shrink-0">
                    ➕
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-gray-900">Use another Google account</p>
                    <p className="text-gray-400 text-[10px]">Enter any Google email address to create account</p>
                  </div>
                </div>

                {selectedGoogleAccount === "custom" && (
                  <input
                    type="email"
                    autoFocus
                    placeholder="e.g. newuser.google@gmail.com"
                    value={customGoogleEmail}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    className="w-full bg-white border-2 border-blue-500 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none shadow-2xs"
                  />
                )}
              </div>
            </div>

            {/* Chooser Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowGooglePicker(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGoogleAuthSubmit}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition shadow-xs cursor-pointer"
              >
                {loading ? "Creating Account..." : "Create Account & Continue"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
