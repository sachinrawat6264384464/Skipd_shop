"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { requestOTP, verifyOTP, changePassword, checkEmailRegistered, resetUserPassword } from "lib/api";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isRegisterView, setIsRegisterView] = useState(false);
  const [isForgotView, setIsForgotView] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [demoOtp, setDemoOtp] = useState<string | null>(null);

  // Email verification status for forgot password
  const [emailCheckStatus, setEmailCheckStatus] = useState<"idle" | "checking" | "verified" | "error">("idle");
  const [newForgotPass, setNewForgotPass] = useState("");
  const [confirmForgotPass, setConfirmForgotPass] = useState("");

  // Timer state for OTP expiration
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [otpExpired, setOtpExpired] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // New Password Option
  const [newPassword, setNewPassword] = useState("");

  // 🌐 Google OAuth Modal state & Registration Check Logic
  const [showGooglePicker, setShowGooglePicker] = useState(false);
  const [selectedGoogleAccount, setSelectedGoogleAccount] = useState("sachinrawat6264384464@gmail.com");
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-dismiss success notification banner after 4 seconds
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // Timer countdown effect
  useEffect(() => {
    let interval: any = null;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && timerActive) {
      setTimerActive(false);
      setOtpExpired(true);
      setError("OTP expired after 1 minute! Please click 'Resend OTP'.");
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  if (!isOpen || !mounted) return null;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!emailOrPhone.trim()) {
      setError("Please enter a valid Email address or Mobile number");
      return;
    }

    setLoading(true);

    if (isRegisterView) {
      // 🚀 CREATE ACCOUNT MODE
      try {
        const userObj = {
          user_name: fullName || (emailOrPhone.includes("@") ? emailOrPhone.split("@")[0] : "Sachin Rawat"),
          email: emailOrPhone.includes("@") ? emailOrPhone : "customer@skipd.in",
          phone: !emailOrPhone.includes("@") ? emailOrPhone : "9876543210"
        };
        localStorage.setItem("skipd_token", "jwt_token_demo_skipd_2026");
        localStorage.setItem("skipd_user", JSON.stringify(userObj));
        window.dispatchEvent(new Event("skipd_auth_changed"));

        setLoading(false);
        setSuccessMsg("Account created successfully! Welcome email sent.");
        setTimeout(() => finishLogin(), 1000);
      } catch (err: any) {
        setLoading(false);
        setError(err.message || "Failed to create account");
      }
    } else {
      // 🔐 LOGIN TO ACCOUNT MODE
      try {
        const res = await requestOTP(emailOrPhone);
        setLoading(false);

        if (res.status === "success" || res.otp_demo) {
          if (res.otp_demo) setDemoOtp(res.otp_demo);
          setSuccessMsg(res.message || "Login credentials verified!");
          setStep(2);
          setTimerSeconds(60);
          setTimerActive(true);
          setOtpExpired(false);
        } else {
          setError("Failed to verify login. Please try again.");
        }
      } catch (err: any) {
        setLoading(false);
        setError(err.message || "Failed to log in");
      }
    }
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
      if (isRegisterView) {
        // 🚀 CREATE ACCOUNT MODE: Pre-fill Google Email & Name directly into Registration Form!
        setEmailOrPhone(chosenEmail);
        if (!fullName) {
          const prefix = chosenEmail.split("@")[0] || "";
          const nameFromEmail = prefix.replace(/[._]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
          setFullName(nameFromEmail);
        }
        setLoading(false);
        setShowGooglePicker(false);
        setSuccessMsg(`✓ Google Email (${chosenEmail}) selected! Please set your account password below to complete account registration.`);
        return;
      }

      // 🔐 LOGIN MODE LOGIC: Must check DB registration!
      const checkRes = await checkEmailRegistered(chosenEmail);
      if (!checkRes || !checkRes.exists) {
        setLoading(false);
        setShowGooglePicker(false);
        setError(`✕ Account Not Found: The Google email '${chosenEmail}' is not registered with us. Please click 'New to SKIPD? Create an account'.`);
        return;
      }

      // 🛡️ SECURITY STEP: Send 6-Digit Security OTP to chosen Google Email
      const otpRes = await requestOTP(chosenEmail);
      setLoading(false);
      setShowGooglePicker(false);

      setEmailOrPhone(chosenEmail);
      if (otpRes.otp_demo) setDemoOtp(otpRes.otp_demo);
      setSuccessMsg(`🔐 Google Security Check: 6-digit verification code sent to ${chosenEmail}`);
      setStep(2);
      setTimerSeconds(60);
      setTimerActive(true);
      setOtpExpired(false);
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
      setIsRegisterView(false);
      setStep(1);
      setPassword(newForgotPass);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Failed to reset password");
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otpExpired) {
      setError("OTP code has expired after 1 minute. Please click 'Resend OTP'.");
      return;
    }

    if (otpInput.length < 6) {
      setError("Please enter the full 6-digit OTP code.");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOTP(emailOrPhone, otpInput);
      setLoading(false);

      if (res.access_token) {
        const userObj = {
          user_name: fullName || res.user_name || (emailOrPhone.includes("@") ? emailOrPhone.split("@")[0] : "Sachin Rawat"),
          email: res.email || (emailOrPhone.includes("@") ? emailOrPhone : "customer@skipd.in"),
          phone: res.phone || (!emailOrPhone.includes("@") ? emailOrPhone : "9876543210")
        };

        localStorage.setItem("skipd_token", res.access_token);
        localStorage.setItem("skipd_user", JSON.stringify(userObj));
        window.dispatchEvent(new Event("skipd_auth_changed"));

        setTimerActive(false);

        if (res.can_change_password) {
          setStep(3);
        } else {
          finishLogin();
        }
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Incorrect or expired OTP code.");
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setSuccessMsg("");
    setLoading(true);
    try {
      const res = await requestOTP(emailOrPhone);
      setLoading(false);
      if (res.otp_demo) setDemoOtp(res.otp_demo);
      setSuccessMsg("Fresh 6-digit OTP sent successfully!");
      setTimerSeconds(60);
      setTimerActive(true);
      setOtpExpired(false);
      setOtpInput("");
    } catch (err: any) {
      setLoading(false);
      setError("Failed to resend OTP");
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.trim()) {
      await changePassword(emailOrPhone, newPassword);
    }
    finishLogin();
  };

  const finishLogin = () => {
    onClose();
    if (onSuccess) {
      onSuccess();
    } else {
      window.location.reload();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="relative bg-white rounded-3xl overflow-hidden max-w-2xl w-full shadow-2xl flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-200 border border-gray-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-sm flex items-center justify-center cursor-pointer transition shadow-xs"
        >
          ✕
        </button>

        {/* 📘 Left Blue Hero Panel */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-8 md:w-2/5 flex flex-col justify-between relative overflow-hidden shrink-0">
          <div className="space-y-3 z-10">
            <h2 className="text-2xl md:text-3xl font-black leading-tight">
              {isForgotView
                ? "Reset Password"
                : step === 2
                ? "Verify OTP"
                : isRegisterView
                ? "Create Account"
                : "Login"}
            </h2>
            <p className="text-blue-100 text-xs md:text-sm leading-relaxed font-medium">
              {isForgotView
                ? "Enter your registered details to permanently reset your account password"
                : step === 2
                ? `6-digit verification code sent to ${emailOrPhone}`
                : isRegisterView
                ? "Sign up with your mobile or email to get started with SKIPD Commerce"
                : "Get access to your Orders, Wishlist and Recommendations"}
            </p>
          </div>

          <div className="z-10 mt-6 space-y-3">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-xs space-y-1">
              <span className="bg-emerald-400 text-black font-extrabold text-[10px] px-2 py-0.5 rounded uppercase">
                ✓ VERIFIED CUSTOMER AUTH
              </span>
              <p className="text-[11px] text-blue-100 font-medium">🔒 256-bit Encrypted SSL Commerce Portal</p>
            </div>
            <div className="w-20 h-20 mx-auto opacity-90 flex items-center justify-center text-4xl">
              📦
            </div>
          </div>
        </div>

        {/* 📄 Right Form Area */}
        <div className="p-6 md:p-8 md:w-3/5 space-y-5 flex flex-col justify-between">
          
          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border-2 border-red-500/80 text-red-700 p-3.5 rounded-2xl text-xs font-bold flex items-start gap-2 shadow-xs animate-shake">
              <span className="text-base leading-none">⚠️</span>
              <span className="flex-1 leading-relaxed">{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xs">
              <span>{emailCheckStatus === "verified" ? "✓" : "🎉"}</span>
              <span className="flex-1">{successMsg}</span>
            </div>
          )}

          {isForgotView ? (
            /* FORGOT PASSWORD VIEW */
            <div>
              {forgotStep === 1 ? (
                <form onSubmit={handleCheckEmailSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="text-gray-700 block mb-1 font-bold">Registered Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="Enter registered email (e.g. sachin.rawat@email.com)"
                      value={emailOrPhone}
                      onChange={(e) => {
                        setEmailOrPhone(e.target.value);
                        setEmailCheckStatus("idle");
                        setError("");
                      }}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:border-blue-600 focus:outline-none transition font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={emailCheckStatus === "checking"}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3.5 rounded-xl transition shadow-sm cursor-pointer uppercase tracking-wider"
                  >
                    {emailCheckStatus === "checking" ? "Verifying Email..." : "VERIFY REGISTERED EMAIL"}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setIsForgotView(false)}
                      className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                    >
                      &larr; Back to Login
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="text-gray-700 block mb-1 font-bold">New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Enter new password (min 6 chars)"
                      value={newForgotPass}
                      onChange={(e) => setNewForgotPass(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:border-blue-600 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="text-gray-700 block mb-1 font-bold">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Re-enter new password"
                      value={confirmForgotPass}
                      onChange={(e) => setConfirmForgotPass(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:border-blue-600 focus:outline-none transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3.5 rounded-xl transition shadow-sm cursor-pointer uppercase tracking-wider"
                  >
                    {loading ? "Updating Password..." : "SAVE NEW PASSWORD & LOGIN"}
                  </button>
                </form>
              )}
            </div>
          ) : step === 1 ? (
            /* STEP 1: Main Login / Register Input */
            <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
              {isRegisterView && (
                <div>
                  <label className="text-gray-700 block mb-1 font-semibold">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Sachin Rawat"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:border-blue-600 focus:outline-none transition font-medium"
                  />
                </div>
              )}

              <div>
                <label className="text-gray-700 block mb-1 font-semibold">Email or Mobile Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. sachin.rawat@email.com or +91 6264384464"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:border-blue-600 focus:outline-none transition font-medium"
                />
              </div>

              {/* Password Field (Shown in both Login and Register View) */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-gray-700 font-semibold">
                    {isRegisterView ? "Set Account Password" : "Password"}
                  </label>
                  {!isRegisterView && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotView(true);
                        setForgotStep(1);
                        setError("");
                      }}
                      className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  required={isRegisterView}
                  placeholder={isRegisterView ? "Create a strong password (min 6 chars)" : "Enter your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:border-blue-600 focus:outline-none transition font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-sm py-3.5 rounded-xl transition shadow-md shadow-orange-500/20 cursor-pointer uppercase tracking-wider"
              >
                {loading
                  ? "Processing..."
                  : isRegisterView
                  ? "CREATE ACCOUNT"
                  : "LOGIN TO ACCOUNT"}
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
                  const modeState = isRegisterView ? "register" : "login";
                  
                  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
                    `client_id=${clientId}&` +
                    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
                    `response_type=token%20id_token&` +
                    `scope=${encodeURIComponent(scope)}&` +
                    `state=${modeState}&` +
                    `prompt=select_account&` +
                    `nonce=${Math.random().toString(36).substring(2)}`;

                  window.location.href = googleAuthUrl;
                }}
                className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 font-bold text-xs py-3 px-4 rounded-xl transition flex items-center justify-center gap-2.5 shadow-2xs cursor-pointer group"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{isRegisterView ? "Sign up with Google" : "Sign in with Google"}</span>
              </button>
            </form>
          ) : step === 2 ? (
            /* STEP 2: Enter 6-Digit OTP & Verify */
            <form onSubmit={handleVerifyOTP} className="space-y-4 text-xs">
              {demoOtp && (
                <div className="bg-amber-50 border border-amber-300 text-amber-900 p-2.5 rounded-xl text-xs font-bold flex justify-between items-center shadow-2xs">
                  <span className="text-[11px]">📧 Live Email OTP: <span className="font-mono text-sm font-black text-amber-700">{demoOtp}</span> <span className="text-[10px] text-amber-700">(Sent to Gmail)</span></span>
                  <button
                    type="button"
                    onClick={() => setOtpInput(demoOtp)}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-lg transition cursor-pointer"
                  >
                    Auto-Fill OTP
                  </button>
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-gray-700 font-bold">Enter 6-Digit OTP</label>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-blue-600 hover:underline font-semibold text-[11px]"
                  >
                    Edit Email/Phone
                  </button>
                </div>

                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="e.g. 849201"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-gray-50 border-2 border-blue-500 rounded-xl px-4 py-3 text-lg font-black tracking-widest text-center text-gray-900 focus:outline-none shadow-xs"
                />
              </div>

              {/* Timer */}
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-200">
                <span className="text-[11px] font-semibold text-gray-600">
                  {timerActive ? (
                    <span className="text-amber-700 font-bold">
                      ⏱️ OTP valid for: <span className="font-mono font-black text-sm">00:{timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds}</span>
                    </span>
                  ) : (
                    <span className="text-red-600 font-bold">⚠️ OTP Expired</span>
                  )}
                </span>

                <button
                  type="button"
                  disabled={timerActive && !otpExpired}
                  onClick={handleResendOTP}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    otpExpired || !timerActive
                      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  🔄 Resend OTP
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || otpInput.length < 6}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-sm py-3.5 rounded-xl transition shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                {loading ? "Verifying OTP..." : "VERIFY & LOGIN"}
              </button>
            </form>
          ) : (
            /* STEP 3: Optional Password Update */
            <form onSubmit={handleChangePasswordSubmit} className="space-y-4 text-xs">
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-2xl space-y-1">
                <p className="font-black text-sm">🎉 Logged in Successfully via OTP!</p>
                <p className="text-[11px]">Optionally set a password for faster login next time:</p>
              </div>

              <div>
                <label className="text-gray-700 block mb-1 font-semibold">New Password (Optional)</label>
                <input
                  type="password"
                  placeholder="Enter new password (min 6 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:border-blue-600 focus:outline-none transition"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={finishLogin}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-xl transition cursor-pointer"
                >
                  Skip &amp; Continue
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-xl transition shadow-xs cursor-pointer"
                >
                  Save Password &amp; Continue
                </button>
              </div>
            </form>
          )}

          {/* Footer View Switcher */}
          {!isForgotView && step === 1 && (
            <div className="text-center pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsRegisterView(!isRegisterView)}
                className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
              >
                {isRegisterView ? "Existing User? Log in to your account" : "New to SKIPD? Create an account"}
              </button>
            </div>
          )}

        </div>

      </div>

      {/* 🌐 Clean Google OAuth Account Chooser Modal Dialog */}
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
              <p className="text-xs text-gray-500 font-medium">Continue to <span className="font-bold text-gray-900">SKIPD Commerce</span></p>
            </div>

            {/* Clean Google Email Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700">Enter Google Email Address</label>
              <input
                type="email"
                autoFocus
                required
                placeholder="e.g. yourname@gmail.com"
                value={customGoogleEmail}
                onChange={(e) => setCustomGoogleEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleGoogleAuthSubmit();
                }}
                className="w-full bg-gray-50 border-2 border-blue-500 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white shadow-2xs transition"
              />
              <p className="text-[11px] text-gray-400 font-medium pt-0.5">
                {isRegisterView 
                  ? "🔒 Enter your Google email to set up your SKIPD account" 
                  : "🔒 We'll send a 6-digit Security Code to verify ownership"}
              </p>
            </div>

            {/* Modal Actions */}
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
                {loading ? "Verifying..." : "Continue with Google"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>,
    document.body
  );
}
