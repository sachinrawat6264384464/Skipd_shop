"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { requestOTP, verifyOTP, changePassword } from "lib/api";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [mounted, setMounted] = useState(false);
  // Step 1 = Request OTP, Step 2 = Enter 6-digit OTP, Step 3 = Optional Password Update
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isRegisterView, setIsRegisterView] = useState(false);
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [demoOtp, setDemoOtp] = useState<string | null>(null);

  // Timer state for 1-minute OTP expiration
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [otpExpired, setOtpExpired] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // New Password Option
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!emailOrPhone.trim()) {
      setError("Please enter a valid Email address or Mobile number");
      return;
    }

    setLoading(true);
    try {
      const res = await requestOTP(emailOrPhone);
      setLoading(false);
      if (res.status === "success" || res.otp_demo) {
        if (res.otp_demo) setDemoOtp(res.otp_demo);
        setSuccessMsg(res.message || "OTP code sent to your registered email!");
        setStep(2);
        setTimerSeconds(60);
        setTimerActive(true);
        setOtpExpired(false);
      } else {
        setError("Failed to generate OTP. Please try again.");
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Failed to send OTP");
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

        // Transition to Password Option or finish
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

        {/* 📘 Left Blue/Indigo Hero Panel (Matching Reference Screenshot) */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-8 md:w-2/5 flex flex-col justify-between relative overflow-hidden shrink-0">
          <div className="space-y-3 z-10">
            <h2 className="text-2xl md:text-3xl font-black leading-tight">
              {step === 2 ? "Verify OTP" : isRegisterView ? "Create Account" : "Login"}
            </h2>
            <p className="text-blue-100 text-xs md:text-sm leading-relaxed font-medium">
              {step === 2
                ? `6-digit verification code sent to ${emailOrPhone}`
                : isRegisterView
                ? "Sign up with your mobile or email to get started with SKIPD Commerce"
                : "Get access to your Orders, Wishlist and Recommendations"}
            </p>
          </div>

          {/* Graphics & Security Stamp */}
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

          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* 🤍 Right White Input Form Panel */}
        <div className="p-8 md:w-3/5 flex flex-col justify-between space-y-5 bg-white">
          
          {/* Error & Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-3.5 py-2.5 rounded-xl">
              ⚠️ {error}
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-3.5 py-2.5 rounded-xl flex items-center justify-between">
              <span>✅ {successMsg}</span>
              {demoOtp && (
                <span className="bg-emerald-600 text-white font-black px-2 py-0.5 rounded text-[11px] shadow-2xs">
                  OTP: {demoOtp}
                </span>
              )}
            </div>
          )}

          {/* STEP 1: Enter Email / Mobile & Request OTP */}
          {step === 1 && (
            <form onSubmit={handleRequestOTP} className="space-y-4 text-xs">
              {isRegisterView && (
                <div>
                  <label className="text-gray-700 block mb-1 font-semibold">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:border-blue-600 focus:outline-none transition"
                  />
                </div>
              )}

              <div>
                <label className="text-gray-700 block mb-1 font-semibold">Enter Email / Mobile number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. customer@skipd.in or +91 9876543210"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:border-blue-600 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="text-gray-700 block mb-1 font-semibold">Enter Password (Optional)</label>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:border-blue-600 focus:outline-none transition"
                />
              </div>

              <p className="text-[11px] text-gray-500 leading-normal">
                By continuing, you agree to SKIPD's{" "}
                <Link href="/terms" onClick={onClose} className="text-blue-600 font-bold hover:underline">
                  Terms of Use
                </Link>{" "}
                and{" "}
                <Link href="/terms" onClick={onClose} className="text-blue-600 font-bold hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-sm py-3.5 rounded-xl transition shadow-md shadow-orange-500/20 cursor-pointer"
              >
                {loading ? "Sending OTP..." : "REQUEST OTP / LOGIN"}
              </button>
            </form>
          )}

          {/* STEP 2: Enter 6-Digit OTP & Verify */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-4 text-xs">
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

              {/* 1-Minute Expiration Live Timer */}
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
          )}

          {/* STEP 3: Optional Password Update */}
          {step === 3 && (
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
          {step === 1 && (
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
    </div>,
    document.body
  );
}
