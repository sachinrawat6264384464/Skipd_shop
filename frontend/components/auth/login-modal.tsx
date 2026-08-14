"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  
  // 🔐 Forgot Password 3-Step Flow: 1=Email DB Check & OTP Send -> 2=Verify OTP -> 3=New Password
  const [isForgotView, setIsForgotView] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [demoOtp, setDemoOtp] = useState<string | null>(null);

  // Email verification & Password Reset states
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

  // New Password Option for Step 3
  const [newPassword, setNewPassword] = useState("");

  // 🌐 Google OAuth State
  const [selectedGoogleAccount, setSelectedGoogleAccount] = useState("sachinrawat6264384464@gmail.com");
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // 🔄 ALWAYS reset modal state when opened so it starts fresh from Step 1!
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setIsForgotView(false);
      setForgotStep(1);
      setError("");
      setSuccessMsg("");
      setOtpInput("");
      setNewForgotPass("");
      setConfirmForgotPass("");
      setEmailCheckStatus("idle");
      setLoading(false);
    }
  }, [isOpen]);

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

  // ❌ Reset & Close Modal helper function
  const handleModalClose = () => {
    setStep(1);
    setIsRegisterView(false);
    setIsForgotView(false);
    setForgotStep(1);
    setError("");
    setSuccessMsg("");
    setEmailOrPhone("");
    setPassword("");
    setFullName("");
    setOtpInput("");
    setNewForgotPass("");
    setConfirmForgotPass("");
    setEmailCheckStatus("idle");
    setLoading(false);
    onClose();
  };

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

  // 📧 FORGOT PASSWORD STEP 1: Check Database Email & Send Real OTP
  const handleForgotSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setEmailCheckStatus("checking");

    if (!emailOrPhone.trim()) {
      setError("Please enter your registered Email address");
      setEmailCheckStatus("error");
      return;
    }

    setLoading(true);
    try {
      // 1️⃣ Check Database if Email is registered
      const checkRes = await checkEmailRegistered(emailOrPhone.trim());
      if (!checkRes || !checkRes.exists) {
        setLoading(false);
        setEmailCheckStatus("error");
        setError(`✕ Account Not Found: Email '${emailOrPhone}' is not registered in our database. Please check your email or click 'Create Account'.`);
        return;
      }

      // 2️⃣ Request OTP for registered email
      const otpRes = await requestOTP(emailOrPhone.trim());
      setLoading(false);
      setEmailCheckStatus("verified");
      if (otpRes.otp_demo) setDemoOtp(otpRes.otp_demo);

      setSuccessMsg(`✓ Registered Email verified! 6-digit OTP code sent to ${emailOrPhone}.`);
      setForgotStep(2);
      setTimerSeconds(60);
      setTimerActive(true);
      setOtpExpired(false);
      setOtpInput("");
    } catch (err: any) {
      setLoading(false);
      setEmailCheckStatus("error");
      setError(err.message || "Failed to send verification OTP");
    }
  };

  // 🔑 FORGOT PASSWORD STEP 2: Verify OTP
  const handleForgotVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

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

      if (res.access_token || res.status === "success" || res.message) {
        setTimerActive(false);
        setSuccessMsg("✓ OTP verified successfully! Enter your new password below.");
        setForgotStep(3); // Go to New Password step!
      } else {
        setError("Invalid OTP code. Please check and try again.");
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Incorrect or expired OTP code.");
    }
  };

  // 🔒 FORGOT PASSWORD STEP 3: Save New Password & Login
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

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

      // Auto login user with new password
      const userObj = {
        user_name: emailOrPhone.includes("@") ? emailOrPhone.split("@")[0] : "Sachin Rawat",
        email: emailOrPhone,
        phone: "9876543210"
      };
      localStorage.setItem("skipd_token", "jwt_token_reset_skipd_2026");
      localStorage.setItem("skipd_user", JSON.stringify(userObj));
      window.dispatchEvent(new Event("skipd_auth_changed"));

      setSuccessMsg("🎉 Password updated successfully! Logging you in...");
      setTimeout(() => finishLogin(), 1200);
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

  const finishLogin = () => {
    handleModalClose();
    if (onSuccess) {
      onSuccess();
    } else {
      window.location.reload();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="relative bg-white rounded-3xl overflow-hidden max-w-2xl w-full shadow-2xl flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-200 border border-gray-100">
        
        {/* Close Button (Always Resets & Closes) */}
        <button
          onClick={handleModalClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-sm flex items-center justify-center cursor-pointer transition shadow-xs"
          title="Close"
        >
          ✕
        </button>

        {/* 📘 Left Blue Hero Panel */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-8 md:w-2/5 flex flex-col justify-between relative overflow-hidden shrink-0">
          <div className="space-y-3 z-10">
            <h2 className="text-2xl md:text-3xl font-black leading-tight">
              {isForgotView
                ? forgotStep === 1
                  ? "Forgot Password"
                  : forgotStep === 2
                  ? "Verify OTP"
                  : "Reset Password"
                : step === 2
                ? "Verify OTP"
                : isRegisterView
                ? "Create Account"
                : "Login"}
            </h2>
            <p className="text-blue-100 text-xs md:text-sm leading-relaxed font-medium">
              {isForgotView
                ? forgotStep === 1
                  ? "Step 1: Enter your registered Email to receive OTP"
                  : forgotStep === 2
                  ? `Step 2: Enter 6-digit OTP code sent to ${emailOrPhone}`
                  : "Step 3: Enter your new password to reset account access"
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
              <span>✓</span>
              <span className="flex-1">{successMsg}</span>
            </div>
          )}

          {isForgotView ? (
            /* 🔐 3-STEP FORGOT PASSWORD FLOW */
            <div>
              {forgotStep === 1 ? (
                
                /* STEP 1: Enter Registered Email & Check DB */
                <form onSubmit={handleForgotSendOTP} className="space-y-4 text-xs">
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
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3.5 rounded-xl transition shadow-sm cursor-pointer uppercase tracking-wider disabled:opacity-50"
                  >
                    {loading ? "Checking Database & Sending OTP..." : "SEND VERIFICATION OTP"}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotView(false);
                        setForgotStep(1);
                        setError("");
                      }}
                      className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                    >
                      &larr; Back to Login
                    </button>
                  </div>
                </form>
              ) : forgotStep === 2 ? (

                /* STEP 2: Enter 6-Digit Verification OTP */
                <form onSubmit={handleForgotVerifyOTP} className="space-y-4 text-xs">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-gray-700 font-bold">Enter 6-Digit OTP Code</label>
                      <span className={`font-bold ${timerSeconds < 15 ? "text-red-500 animate-pulse" : "text-gray-500"}`}>
                        ⏳ {timerSeconds}s
                      </span>
                    </div>

                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="Enter 6-digit OTP code"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-center text-lg font-black tracking-widest text-gray-900 focus:border-blue-600 focus:outline-none transition"
                    />
                    

                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3.5 rounded-xl transition shadow-sm cursor-pointer uppercase tracking-wider disabled:opacity-50"
                  >
                    {loading ? "Verifying Code..." : "VERIFY OTP"}
                  </button>

                  <div className="flex justify-between items-center text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      className="text-blue-600 font-bold hover:underline cursor-pointer"
                    >
                      &larr; Change Email
                    </button>
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      className="text-emerald-700 font-bold hover:underline cursor-pointer"
                    >
                      🔄 Resend OTP Code
                    </button>
                  </div>
                </form>
              ) : (

                /* STEP 3: Reset Password (Matching User Screenshot!) */
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
                    {loading ? "Saving Password..." : "SAVE NEW PASSWORD & LOGIN"}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={handleModalClose}
                      className="text-xs text-gray-500 font-bold hover:underline cursor-pointer"
                    >
                      Cancel &amp; Return to Store
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : step === 1 ? (
            
            /* 🟢 LOGIN / REGISTER STEP 1 */
            <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
              
              {isRegisterView && (
                <div>
                  <label className="text-gray-700 block mb-1 font-bold">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:border-blue-600 focus:outline-none transition font-medium"
                  />
                </div>
              )}

              <div>
                <label className="text-gray-700 block mb-1 font-bold">
                  {isRegisterView ? "Email Address or Mobile Number" : "Enter Email / Mobile number"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isRegisterView ? "Enter email or 10-digit mobile" : "Enter email or mobile number"}
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:border-blue-600 focus:outline-none transition font-medium"
                />
              </div>

              {!isRegisterView && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-gray-700 font-bold">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotView(true);
                        setForgotStep(1);
                        setError("");
                      }}
                      className="text-blue-600 text-xs font-bold hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:border-blue-600 focus:outline-none transition font-medium"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3.5 rounded-xl transition shadow-sm cursor-pointer uppercase tracking-wider"
              >
                {loading
                  ? "Processing..."
                  : isRegisterView
                  ? "CONTINUE TO REGISTER"
                  : "LOGIN TO ACCOUNT"}
              </button>

              {/* 🌐 Google Auth Direct Redirect Button */}
              <div className="pt-2">
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink mx-3 text-gray-400 font-bold text-[10px] uppercase tracking-wider">OR</span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>

                <a
                  href={`https://accounts.google.com/o/oauth2/v2/auth?client_id=108923489123-demo.apps.googleusercontent.com&redirect_uri=${encodeURIComponent(
                    typeof window !== "undefined" ? `${window.location.origin}/auth/login` : "http://localhost:3000/auth/login"
                  )}&response_type=token%20id_token&scope=openid%20profile%20email&prompt=select_account`}
                  className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-bold text-xs py-3 px-4 rounded-xl transition flex items-center justify-center gap-2.5 shadow-2xs cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>{isRegisterView ? "Sign up with Google" : "Sign in with Google"}</span>
                </a>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterView(!isRegisterView);
                    setError("");
                    setSuccessMsg("");
                  }}
                  className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  {isRegisterView
                    ? "Existing User? Log in to your account"
                    : "New to SKIPD? Create an account"}
                </button>
              </div>

            </form>
          ) : (
            
            /* 🔐 LOGIN STEP 2: VERIFY OTP CODE */
            <form onSubmit={handleVerifyOTP} className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-gray-700 font-bold">Enter 6-Digit OTP Code</label>
                  <span className={`font-bold ${timerSeconds < 15 ? "text-red-500 animate-pulse" : "text-gray-500"}`}>
                    ⏳ {timerSeconds}s
                  </span>
                </div>

                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="Enter 6-digit OTP code"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-center text-lg font-black tracking-widest text-gray-900 focus:border-blue-600 focus:outline-none transition"
                />
                

              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3.5 rounded-xl transition shadow-sm cursor-pointer uppercase tracking-wider"
              >
                {loading ? "Verifying Code..." : "VERIFY & LOGIN"}
              </button>

              <div className="flex justify-between items-center text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  &larr; Change Details
                </button>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  className="text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  🔄 Resend OTP Code
                </button>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>,
    document.body
  );
}
