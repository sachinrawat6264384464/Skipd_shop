"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { checkEmailRegistered, resetUserPassword } from "lib/api";

export default function CustomerLoginPage() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Forgot password flow
  const [isForgotView, setIsForgotView] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [emailCheckStatus, setEmailCheckStatus] = useState<"idle" | "checking" | "verified" | "error">("idle");
  const [newForgotPass, setNewForgotPass] = useState("");
  const [confirmForgotPass, setConfirmForgotPass] = useState("");

  // 🌐 Google OAuth Modal state & Registration Check Logic
  const [showGooglePicker, setShowGooglePicker] = useState(false);
  const [selectedGoogleAccount, setSelectedGoogleAccount] = useState("sachinrawat6264384464@gmail.com");
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");

  // Auto-dismiss success notification banner after 4 seconds
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const userObj = {
        user_name: emailOrPhone.includes("@") ? emailOrPhone.split("@")[0] : "Sachin Rawat",
        email: emailOrPhone.includes("@") ? emailOrPhone : "sachin.rawat@email.com",
        phone: !emailOrPhone.includes("@") ? emailOrPhone : "+91 6264384464"
      };

      localStorage.setItem("ecom_token", "jwt_token_demo_ecom_2026");
      localStorage.setItem("ecom_user", JSON.stringify(userObj));
      window.dispatchEvent(new Event("ecom_auth_changed"));

      setLoading(false);
      window.location.href = "/account?tab=profile";
    }, 600);
  };

  // 🌐 Google Account Login & Registration Verification Logic
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
      // 🔍 Query Database to check if Google Email is registered
      const checkRes = await checkEmailRegistered(chosenEmail);
      
      if (checkRes.exists) {
        // Registered -> Login Allowed!
        const googleUser = {
          user_name: chosenEmail.split("@")[0],
          email: chosenEmail,
          phone: "+91 6264384464",
          auth_provider: "google"
        };
        localStorage.setItem("ecom_token", "jwt_token_google_oauth_ecom_2026");
        localStorage.setItem("ecom_user", JSON.stringify(googleUser));
        window.dispatchEvent(new Event("ecom_auth_changed"));

        setLoading(false);
        setShowGooglePicker(false);
        setSuccessMsg("✓ Google Account Verified! Welcome back.");
        setTimeout(() => {
          window.location.href = "/account?tab=profile";
        }, 600);
      } else {
        // NOT Registered -> DENIED! Show Red Error
        setLoading(false);
        setShowGooglePicker(false);
        setError(`✕ Account Not Found: The Google email '${chosenEmail}' is not registered with us. Please create an account first.`);
      }
    } catch (err: any) {
      setLoading(false);
      setError("Failed to verify Google Account. Please try again.");
    }
  };

  const handleCheckEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEmailCheckStatus("checking");

    if (!emailOrPhone.trim()) {
      setError("Please enter your registered Email address");
      setEmailCheckStatus("error");
      return;
    }

    try {
      const res = await checkEmailRegistered(emailOrPhone);
      if (res.exists) {
        setEmailCheckStatus("verified");
        setSuccessMsg("Registered Email Verified! Enter your new password below.");
        setTimeout(() => {
          setForgotStep(2);
        }, 600);
      } else {
        setEmailCheckStatus("error");
        setError("This email is not registered with us");
      }
    } catch (err: any) {
      setEmailCheckStatus("error");
      setError(err.message || "This email is not registered with us");
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newForgotPass || newForgotPass.length < 6) {
      setError("New password must be at least 6 characters long");
      return;
    }

    if (newForgotPass !== confirmForgotPass) {
      setError("New password and confirm password do not match");
      return;
    }

    setLoading(true);
    try {
      await resetUserPassword(emailOrPhone, newForgotPass);
      setLoading(false);
      setSuccessMsg("Password updated successfully! Please login with your new password.");
      setIsForgotView(false);
      setPassword(newForgotPass);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Failed to reset password");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col md:flex-row w-full font-sans overflow-x-hidden">
      
      {/* 🟢 LEFT STATIC HERO PANEL (50% Full Screen Height - Dark Emerald Theme) */}
      <div className="md:w-1/2 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden shrink-0 border-r border-emerald-800/40 min-h-[400px] md:min-h-screen">
        
        {/* Decorative Glowing Orbs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header & Branding */}
        <div className="space-y-6 z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition">
              🛍️
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white block leading-none">SKIPD SHOP</span>
              <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase">Official Storefront</span>
            </div>
          </Link>

          <div className="space-y-3 pt-4">
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-black px-3.5 py-1.5 rounded-full border border-emerald-400/30 uppercase tracking-wider inline-block">
              ✨ Customer Portal Access
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
              {isForgotView ? "Account Password Recovery" : "Welcome Back to Skipd Store!"}
            </h1>
            <p className="text-emerald-100/80 text-xs sm:text-sm lg:text-base leading-relaxed font-medium max-w-md">
              {isForgotView
                ? "Verify your registered email to reset your account password securely."
                : "Manage your orders, track shipments in real-time, view wishlist & enjoy exclusive Supercoin rewards."}
            </p>
          </div>
        </div>

        {/* Middle Feature Highlights List */}
        <div className="z-10 my-8 space-y-3 max-w-md">
          <div className="flex items-center gap-3 p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-xs">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/30 text-emerald-300 flex items-center justify-center font-bold text-sm shrink-0">
              ⚡
            </div>
            <div>
              <p className="font-extrabold text-white">Express 2-Day Delivery Across India</p>
              <p className="text-[11px] text-emerald-200/80">Priority shipping on all active verified orders</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-xs">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/30 text-emerald-300 flex items-center justify-center font-bold text-sm shrink-0">
              🔒
            </div>
            <div>
              <p className="font-extrabold text-white">256-bit Encrypted SSL Security</p>
              <p className="text-[11px] text-emerald-200/80">Protected customer authentication & payments</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-xs">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/30 text-emerald-300 flex items-center justify-center font-bold text-sm shrink-0">
              🎁
            </div>
            <div>
              <p className="font-extrabold text-white">250 Instant Reward Supercoins</p>
              <p className="text-[11px] text-emerald-200/80">Redeemable on your very next order purchase</p>
            </div>
          </div>
        </div>

        {/* Footer Customer Trust Stats */}
        <div className="z-10 pt-4 border-t border-emerald-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              <span className="w-7 h-7 rounded-full bg-emerald-400 text-emerald-950 font-black text-xs flex items-center justify-center border-2 border-emerald-950">S</span>
              <span className="w-7 h-7 rounded-full bg-teal-400 text-teal-950 font-black text-xs flex items-center justify-center border-2 border-emerald-950">R</span>
              <span className="w-7 h-7 rounded-full bg-green-400 text-green-950 font-black text-xs flex items-center justify-center border-2 border-emerald-950">A</span>
            </div>
            <span className="text-xs font-extrabold text-emerald-200">50,000+ Happy Customers</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-widest">★ 4.9 Verified Rating</span>
        </div>

      </div>

      {/* 🤍 RIGHT FORM PANEL (50% Full Screen Width) */}
      <div className="md:w-1/2 bg-white p-8 lg:p-16 flex flex-col justify-center max-w-xl mx-auto w-full min-h-screen">
        
        {/* Tab Switcher (Login / Register) */}
        {!isForgotView && (
          <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-8 border border-gray-200">
            <button
              type="button"
              className="flex-1 py-3 text-xs font-black rounded-xl bg-white text-emerald-700 shadow-sm border border-gray-200 transition"
            >
              🔐 LOGIN TO ACCOUNT
            </button>
            <Link
              href="/auth/register"
              className="flex-1 py-3 text-xs font-bold rounded-xl text-gray-500 hover:text-gray-900 text-center transition flex items-center justify-center gap-1"
            >
              <span>✨ CREATE ACCOUNT</span>
            </Link>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-500/80 text-red-700 p-4 rounded-2xl text-xs font-bold flex items-start gap-2.5 shadow-sm animate-shake">
            <span className="text-lg leading-none">⚠️</span>
            <span className="flex-1 leading-relaxed">{error}</span>
          </div>
        )}

        {/* Success Banner */}
        {successMsg && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-4 py-3.5 rounded-2xl flex items-center gap-2 shadow-2xs">
            <span>✅</span>
            <span>{successMsg}</span>
          </div>
        )}

        {isForgotView ? (
          forgotStep === 1 ? (
            /* Step 1: Check Registered Email */
            <form onSubmit={handleCheckEmailSubmit} className="space-y-5 text-xs">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-gray-900">Forgot Your Password?</h2>
                <p className="text-gray-500">Enter your registered email address to verify your account</p>
              </div>

              <div>
                <label className="text-gray-700 block mb-1.5 font-bold">Registered Email Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. customer@e-com.in"
                  value={emailOrPhone}
                  onChange={(e) => {
                    setEmailOrPhone(e.target.value);
                    setEmailCheckStatus("idle");
                    setError("");
                  }}
                  className={`w-full bg-gray-50 border rounded-2xl px-4 py-4 text-sm text-gray-900 focus:outline-none transition ${
                    emailCheckStatus === "error"
                      ? "border-red-500 bg-red-50/30"
                      : emailCheckStatus === "verified"
                      ? "border-emerald-500 bg-emerald-50/30"
                      : "border-gray-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                  }`}
                />

                {emailCheckStatus === "verified" && (
                  <div className="mt-2 text-xs font-extrabold text-emerald-700 flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                    <span>✓ Registered Email Verified</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={emailCheckStatus === "checking"}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-4 rounded-2xl transition shadow-lg shadow-emerald-600/25 cursor-pointer uppercase tracking-wider"
              >
                {emailCheckStatus === "checking" ? "Verifying Registered Email..." : "VERIFY EMAIL & CONTINUE"}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotView(false);
                    setError("");
                  }}
                  className="text-xs text-gray-500 font-bold hover:text-emerald-700 hover:underline cursor-pointer"
                >
                  ← Return to Login
                </button>
              </div>
            </form>
          ) : (
            /* Step 2: Reset Password Form */
            <form onSubmit={handleResetPasswordSubmit} className="space-y-5 text-xs">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-gray-900">Set New Password</h2>
                <p className="text-gray-500">Create a new strong password for your account</p>
              </div>

              <div>
                <label className="text-gray-700 block mb-1.5 font-bold">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter new password (min 6 chars)"
                  value={newForgotPass}
                  onChange={(e) => setNewForgotPass(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-4 text-sm text-gray-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="text-gray-700 block mb-1.5 font-bold">Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter new password"
                  value={confirmForgotPass}
                  onChange={(e) => setConfirmForgotPass(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-4 text-sm text-gray-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-4 rounded-2xl transition shadow-lg shadow-emerald-600/25 cursor-pointer uppercase tracking-wider"
              >
                {loading ? "Updating Password..." : "SAVE NEW PASSWORD & LOGIN"}
              </button>
            </form>
          )
        ) : (
          /* Normal Login Form */
          <form onSubmit={handleLoginSubmit} className="space-y-5 text-xs">
            
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Login to Your Account</h2>
              <p className="text-gray-500 font-medium">Enter your credentials below to access your account</p>
            </div>

            <div>
              <label className="text-gray-700 block mb-1.5 font-bold">Email Address or Mobile Number</label>
              <input
                type="text"
                required
                placeholder="e.g. customer@e-com.in or +91 9876543210"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-4 text-sm text-gray-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition font-medium"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-gray-700 font-bold">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotView(true);
                    setForgotStep(1);
                    setError("");
                    setSuccessMsg("");
                    setEmailCheckStatus("idle");
                  }}
                  className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-4 text-sm text-gray-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition font-medium"
              />
            </div>

            <p className="text-[11px] text-gray-500 leading-normal">
              By continuing, you agree to Skipd Store's{" "}
              <Link href="/terms" className="text-emerald-700 font-bold hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/terms" className="text-emerald-700 font-bold hover:underline">
                Privacy Policy
              </Link>
              .
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm py-4 rounded-2xl transition shadow-lg shadow-emerald-600/30 cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <span>{loading ? "Verifying Credentials..." : "LOGIN TO ACCOUNT"}</span>
              <span>&rarr;</span>
            </button>

            {/* ─── OR DIVIDER ─── */}
            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-gray-200" />
              <span className="px-3 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">OR SIGN IN WITH</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>

            {/* 🌐 GOOGLE OAUTH DIRECT BUTTON */}
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
                  `state=login&` +
                  `prompt=select_account&` +
                  `nonce=${Math.random().toString(36).substring(2)}`;

                window.location.href = googleAuthUrl;
              }}
              className="w-full bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-800 font-bold text-xs py-3.5 px-4 rounded-2xl transition flex items-center justify-center gap-2.5 shadow-2xs cursor-pointer group hover:border-gray-300"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Sign in with Google</span>
            </button>
          </form>
        )}

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
              <p className="text-xs text-gray-500 font-medium">Choose an account to continue to <span className="font-bold text-gray-900">E-COM Commerce</span></p>
            </div>

            {/* Google Accounts Selection List */}
            <div className="space-y-2.5 text-xs">
              {/* Account 1 (Registered) */}
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
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded">Registered</span>
              </div>

              {/* Account 2 (Registered) */}
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
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded">Registered</span>
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
                    <p className="text-gray-400 text-[10px]">Enter any Google email to test registration check</p>
                  </div>
                </div>

                {selectedGoogleAccount === "custom" && (
                  <input
                    type="email"
                    autoFocus
                    placeholder="e.g. unregistered.user@gmail.com"
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
                {loading ? "Verifying..." : "Continue with Account"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
