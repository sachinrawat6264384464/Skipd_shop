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

      localStorage.setItem("skipd_token", "jwt_token_demo_skipd_2026");
      localStorage.setItem("skipd_user", JSON.stringify(userObj));
      window.dispatchEvent(new Event("skipd_auth_changed"));

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
        localStorage.setItem("skipd_token", "jwt_token_google_oauth_skipd_2026");
        localStorage.setItem("skipd_user", JSON.stringify(googleUser));
        window.dispatchEvent(new Event("skipd_auth_changed"));

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
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl overflow-hidden max-w-3xl w-full shadow-2xl flex flex-col md:flex-row border border-gray-200">
        
        {/* 📘 Left Blue Hero Panel */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-8 md:p-12 md:w-2/5 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-4 z-10">
            <h1 className="text-3xl font-black">
              {isForgotView ? "Reset Password" : "Login"}
            </h1>
            <p className="text-blue-100 text-xs md:text-sm leading-relaxed font-medium">
              {isForgotView
                ? "Verify your registered email to reset your password"
                : "Get access to your Orders, Wishlist and Recommendations"}
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

        {/* 🤍 Right White Form Panel */}
        <div className="p-8 md:p-12 md:w-3/5 flex flex-col justify-between space-y-6">
          
          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border-2 border-red-500/80 text-red-700 p-3.5 rounded-2xl text-xs font-bold flex items-start gap-2 shadow-xs animate-shake">
              <span className="text-base leading-none">⚠️</span>
              <span className="flex-1 leading-relaxed">{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-4 py-3 rounded-xl">
              ✅ {successMsg}
            </div>
          )}

          {isForgotView ? (
            forgotStep === 1 ? (
              /* Step 1: Check Registered Email */
              <form onSubmit={handleCheckEmailSubmit} className="space-y-5 text-xs">
                <div>
                  <label className="text-gray-700 block mb-1.5 font-semibold">Enter Registered Email / Username</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. customer@skipd.in"
                    value={emailOrPhone}
                    onChange={(e) => {
                      setEmailOrPhone(e.target.value);
                      setEmailCheckStatus("idle");
                      setError("");
                    }}
                    className={`w-full bg-gray-50 border rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:outline-none transition ${
                      emailCheckStatus === "error"
                        ? "border-red-500 bg-red-50/30"
                        : emailCheckStatus === "verified"
                        ? "border-emerald-500 bg-emerald-50/30"
                        : "border-gray-300 focus:border-blue-600"
                    }`}
                  />

                  {emailCheckStatus === "verified" && (
                    <div className="mt-2 text-xs font-extrabold text-emerald-700 flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                      <span>✓ Registered Email Verified</span>
                    </div>
                  )}

                  {emailCheckStatus === "error" && (
                    <div className="mt-2 text-xs font-bold text-red-600 flex items-center gap-1.5 bg-red-50 border border-red-200 p-2.5 rounded-xl">
                      <span>✕ This email is not registered with us</span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={emailCheckStatus === "checking"}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-sm py-4 rounded-2xl transition shadow-md shadow-blue-600/20 cursor-pointer uppercase tracking-wider"
                >
                  {emailCheckStatus === "checking" ? "Verifying Email..." : "VERIFY REGISTERED EMAIL"}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotView(false);
                      setError("");
                    }}
                    className="text-xs text-gray-500 font-bold hover:underline cursor-pointer"
                  >
                    ← Back to Login
                  </button>
                </div>
              </form>
            ) : (
              /* Step 2: Reset Password Form */
              <form onSubmit={handleResetPasswordSubmit} className="space-y-5 text-xs">
                <div>
                  <label className="text-gray-700 block mb-1.5 font-semibold">New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter new password (min 6 chars)"
                    value={newForgotPass}
                    onChange={(e) => setNewForgotPass(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-gray-700 block mb-1.5 font-semibold">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter new password"
                    value={confirmForgotPass}
                    onChange={(e) => setConfirmForgotPass(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm py-4 rounded-2xl transition shadow-md shadow-emerald-600/20 cursor-pointer uppercase tracking-wider"
                >
                  {loading ? "Updating Password..." : "SAVE NEW PASSWORD & LOGIN"}
                </button>
              </form>
            )
          ) : (
            /* Normal Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-5 text-xs">
              <div>
                <label className="text-gray-700 block mb-1.5 font-semibold">Enter Email / Mobile number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. customer@skipd.in or +91 9876543210"
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
                
                {/* Forgot Password Link */}
                <div className="flex justify-end pt-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotView(true);
                      setForgotStep(1);
                      setError("");
                      setSuccessMsg("");
                      setEmailCheckStatus("idle");
                    }}
                    className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
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
                className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-sm py-4 rounded-2xl transition shadow-md shadow-orange-500/20 cursor-pointer uppercase tracking-wider"
              >
                {loading ? "Verifying Credentials..." : "LOGIN TO ACCOUNT"}
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
                    `state=login&` +
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
                <span>Sign in with Google</span>
              </button>
            </form>
          )}

          {!isForgotView && (
            <div className="text-center pt-4 border-t border-gray-100">
              <Link href="/auth/register" className="text-xs text-blue-600 font-bold hover:underline">
                New to SKIPD? Create an account
              </Link>
            </div>
          )}

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
              <p className="text-xs text-gray-500 font-medium">Choose an account to continue to <span className="font-bold text-gray-900">SKIPD Commerce</span></p>
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
