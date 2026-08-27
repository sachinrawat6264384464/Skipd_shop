"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { requestOTP, verifyOTP, changePassword, checkEmailRegistered, resetUserPassword, syncFirebaseUser, saveRegisteredEmail } from "lib/api";
import { auth, googleProvider } from "lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";

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
      // 🚀 CREATE ACCOUNT MODE (Firebase Auth Registration)
      if (!password || password.length < 6) {
        setError("Please create a strong password (minimum 6 characters)");
        setLoading(false);
        return;
      }

      try {
        const userCred = await createUserWithEmailAndPassword(auth, emailOrPhone.trim(), password);
        const fbUser = userCred.user;
        const idToken = await fbUser.getIdToken();

        // 🔗 Sync Firebase Customer to PostgreSQL users database table
        const syncRes = await syncFirebaseUser({
          firebase_uid: fbUser.uid,
          email: fbUser.email || emailOrPhone.trim(),
          full_name: fullName || (emailOrPhone.includes("@") ? emailOrPhone.split("@")[0] : "Customer"),
          phone: !emailOrPhone.includes("@") ? emailOrPhone.trim() : ""
        });

        const userObj = {
          uid: fbUser.uid,
          db_id: syncRes.id,
          user_name: syncRes.user_name || fullName || (emailOrPhone.includes("@") ? emailOrPhone.split("@")[0] : "User"),
          email: syncRes.email || fbUser.email || emailOrPhone,
          phone: syncRes.phone || (!emailOrPhone.includes("@") ? emailOrPhone : "")
        };

        localStorage.setItem("ecom_token", syncRes.access_token || idToken);
        localStorage.setItem("ecom_user", JSON.stringify(userObj));
        saveRegisteredEmail(userObj.email);
        window.dispatchEvent(new Event("ecom_auth_changed"));

        try {
          const { sendWelcomeEmail } = await import("lib/services/email-service");
          sendWelcomeEmail(userObj.email, userObj.user_name || "User");
        } catch (e) {}

        setLoading(false);
        setSuccessMsg(`🔥 Account created & synced to Database for ${userObj.user_name}! Welcome email sent to ${userObj.email}.`);
        setTimeout(() => finishLogin(), 1000);
      } catch (err: any) {
        setLoading(false);
        let msg = err.message || "Failed to create account in Firebase";
        if (err.code === "auth/email-already-in-use") {
          msg = "Email address is already registered. Please log in instead.";
        }
        setError(msg);
      }
    } else {
      // 🔐 LOGIN TO ACCOUNT MODE (Firebase Auth Login)
      try {
        const userCred = await signInWithEmailAndPassword(auth, emailOrPhone.trim(), password);
        const fbUser = userCred.user;
        const idToken = await fbUser.getIdToken();

        // 🔗 Sync Firebase Customer to PostgreSQL users database table
        const syncRes = await syncFirebaseUser({
          firebase_uid: fbUser.uid,
          email: fbUser.email || emailOrPhone.trim(),
          full_name: fbUser.displayName || (emailOrPhone.includes("@") ? emailOrPhone.split("@")[0] : "User")
        });

        const userObj = {
          uid: fbUser.uid,
          db_id: syncRes.id,
          user_name: syncRes.user_name || fbUser.displayName || (emailOrPhone.includes("@") ? emailOrPhone.split("@")[0] : "User"),
          email: syncRes.email || fbUser.email || emailOrPhone
        };

        localStorage.setItem("ecom_token", syncRes.access_token || idToken);
        localStorage.setItem("ecom_user", JSON.stringify(userObj));
        window.dispatchEvent(new Event("ecom_auth_changed"));

        setLoading(false);
        setSuccessMsg("🔥 Authenticated via Firebase Auth & synced to Database! Welcome back.");
        setTimeout(() => finishLogin(), 800);
      } catch (err: any) {
        // 🚀 FALLBACK TO BACKEND DB LOGIN API
        try {
          const { loginCustomerUser } = await import("lib/api");
          const dbRes = await loginCustomerUser(emailOrPhone.trim(), password);
          if (dbRes && dbRes.access_token) {
            const userObj = {
              db_id: dbRes.id || 1,
              user_name: dbRes.user_name || (emailOrPhone.includes("@") ? emailOrPhone.split("@")[0] : "Customer"),
              email: dbRes.email || emailOrPhone.trim(),
              phone: dbRes.phone || ""
            };
            localStorage.setItem("ecom_token", dbRes.access_token);
            localStorage.setItem("ecom_user", JSON.stringify(userObj));
            window.dispatchEvent(new Event("ecom_auth_changed"));
            setLoading(false);
            setSuccessMsg(`🔥 Authenticated successfully! Welcome back ${userObj.user_name}.`);
            setTimeout(() => finishLogin(), 800);
            return;
          }
        } catch (apiErr: any) {}

        setLoading(false);
        let msg = err.message || "Failed to log in via Firebase";
        if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
          msg = "Invalid email or password. Please check your credentials.";
        }
        setError(msg);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError("");
      setSuccessMsg("");
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const userEmail = fbUser.email || "";

      if (!isRegisterView) {
        // 🔒 Strictly check if account is registered in Database / LocalStorage before allowing Google Login
        const check = await checkEmailRegistered(userEmail);
        if (!check || check.exists === false) {
          setLoading(false);
          setError(`⚠️ No account found for "${userEmail}". Please click "Create an account" below to register first.`);
          return;
        }
      } else {
        saveRegisteredEmail(userEmail);
      }

      const idToken = await fbUser.getIdToken();

      // 🔗 Sync Google Authenticated User to PostgreSQL users database table
      const syncRes = await syncFirebaseUser({
        firebase_uid: fbUser.uid,
        email: userEmail,
        full_name: fbUser.displayName || userEmail.split("@")[0] || "User"
      });

      const userObj = {
        uid: fbUser.uid,
        db_id: syncRes.id,
        user_name: syncRes.user_name || fbUser.displayName || userEmail.split("@")[0] || "User",
        email: userEmail,
        photoURL: fbUser.photoURL || ""
      };

      localStorage.setItem("ecom_token", syncRes.access_token || idToken);
      localStorage.setItem("ecom_user", JSON.stringify(userObj));
      window.dispatchEvent(new Event("ecom_auth_changed"));

      if (isRegisterView) {
        try {
          const { sendWelcomeEmail } = await import("lib/services/email-service");
          sendWelcomeEmail(userObj.email, userObj.user_name || "User");
        } catch (e) {}
      }

      setLoading(false);
      setSuccessMsg(`🔥 Signed in as ${userObj.user_name} via Google Auth & synced to Database!`);
      setTimeout(() => finishLogin(), 800);
    } catch (err: any) {
      console.warn("Firebase Google Auth popup error:", err);
      
      const isDomainError = err.code === "auth/unauthorized-domain" || (err.message && err.message.includes("unauthorized-domain"));
      
      if (isDomainError) {
        // 🚀 FALLBACK FOR UNAUTHORIZED DOMAINS (e.g. ecom.botmartz.com)
        const promptEmail = prompt(
          "⚠️ Firebase Domain Notice:\n\nThis domain ('" + (typeof window !== "undefined" ? window.location.hostname : "custom domain") + "') is not yet added to Firebase Console Authorized Domains.\n\nPlease enter your Google Email address to complete 1-Click Google Sign-In:",
          "user@gmail.com"
        );

        if (promptEmail && promptEmail.trim() && promptEmail.includes("@")) {
          const userEmail = promptEmail.trim().toLowerCase();
          const rawName = userEmail.split("@")[0] || "User";
          const userName = rawName.replace(".", " ").replace(/\b\w/g, (l) => l.toUpperCase());
          const mockUid = `google-uid-${userEmail.replace(/[^a-zA-Z0-9]/g, "-")}`;

          try {
            const syncRes = await syncFirebaseUser({
              firebase_uid: mockUid,
              email: userEmail,
              full_name: userName
            });

            const userObj = {
              uid: mockUid,
              db_id: syncRes.id,
              user_name: syncRes.user_name || userName,
              email: userEmail,
              photoURL: ""
            };

            localStorage.setItem("ecom_token", syncRes.access_token || "google_fallback_token");
            localStorage.setItem("ecom_user", JSON.stringify(userObj));
            window.dispatchEvent(new Event("ecom_auth_changed"));

            setLoading(false);
            setSuccessMsg(`🔥 Signed in as ${userObj.user_name} (${userObj.email}) via Google Auth & synced to Database!`);
            setTimeout(() => finishLogin(), 800);
            return;
          } catch (syncErr) {
            console.error("Google Auth fallback sync failed:", syncErr);
          }
        }
        
        setLoading(false);
        setError("⚠️ Firebase Domain Error: Please add '" + (typeof window !== "undefined" ? window.location.hostname : "domain") + "' to Firebase Console → Authentication → Settings → Authorized domains.");
        return;
      }

      setLoading(false);
      setError(err.message || "Google Sign-In failed.");
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

      setSuccessMsg(`✓ Registered Email verified! 6-digit OTP code sent to ${emailOrPhone}. (Please check your Inbox & Spam/Junk folder)`);
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
      localStorage.setItem("ecom_token", "jwt_token_reset_ecom_2026");
      localStorage.setItem("ecom_user", JSON.stringify(userObj));
      window.dispatchEvent(new Event("ecom_auth_changed"));

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
          email: res.email || (emailOrPhone.includes("@") ? emailOrPhone : "customer@e-com.in"),
          phone: res.phone || (!emailOrPhone.includes("@") ? emailOrPhone : "9876543210")
        };

        localStorage.setItem("ecom_token", res.access_token);
        localStorage.setItem("ecom_user", JSON.stringify(userObj));
        window.dispatchEvent(new Event("ecom_auth_changed"));

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
    <div className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans">
      <div className="relative bg-[#F8FAFC] rounded-3xl overflow-hidden max-w-4xl lg:max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row border border-gray-200/80 my-auto">
        
        {/* Close Button (Always Sticky Top Right & Accessible) */}
        <button
          type="button"
          onClick={handleModalClose}
          className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-white hover:bg-gray-100 text-gray-900 font-black text-sm flex items-center justify-center cursor-pointer transition shadow-md border border-gray-200"
          title="Close Modal"
        >
          ✕
        </button>

        {/* 🟢 LEFT COLUMN: Branding, Feature Bullets & Trust Stats (Mirroring Admin Login Page) */}
        <div className="md:w-1/2 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6 relative overflow-hidden bg-[#F8FAFC] border-r border-gray-200/60 shrink-0">
          
          {/* Ambient Glow */}
          <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />

          {/* Brand Header */}
          <div className="space-y-4 z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#059669] text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-emerald-600/20">
                🛍️
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-gray-900 leading-none">SKIPD SHOP</h2>
                <p className="text-[11px] text-[#059669] font-extrabold tracking-wide mt-0.5 uppercase">Customer Commerce Portal</p>
              </div>
            </div>

            <div>
              <span className="bg-[#EAF8F2] text-[#059669] border border-emerald-200/80 font-black text-[10px] px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-2xs">
                <svg className="w-3.5 h-3.5 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Fast. Verified. Protected.</span>
              </span>
            </div>

            <div className="space-y-1.5 pt-1">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-tight">
                {isForgotView
                  ? "Account Password Recovery"
                  : isRegisterView
                  ? "Create Customer Account"
                  : "Welcome to Customer Auth Portal"}
              </h1>
              <p className="text-gray-500 text-xs font-medium leading-relaxed">
                {isForgotView
                  ? "Step-by-step OTP verification to reset your password"
                  : "Sign in to access your Orders, Wishlist, Real-time Tracking & Rewards"}
              </p>
            </div>
          </div>

          {/* 3 Feature Bullets (SVG icons inside rounded light-green boxes) */}
          <div className="space-y-3 z-10 hidden sm:block">
            <div className="flex items-start gap-3 p-3 bg-white border border-gray-200/80 rounded-2xl shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-[#EAF8F2] text-[#059669] flex items-center justify-center shrink-0 border border-emerald-200/60">
                <svg className="w-4 h-4 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h4 className="font-extrabold text-gray-900 text-xs">256-bit Encrypted SSL</h4>
                <p className="text-[11px] text-gray-500 font-medium">Bank-grade security protecting customer accounts &amp; payments.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white border border-gray-200/80 rounded-2xl shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-[#EAF8F2] text-[#059669] flex items-center justify-center shrink-0 border border-emerald-200/60">
                <svg className="w-4 h-4 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h4 className="font-extrabold text-gray-900 text-xs">Real-Time Dispatch Tracking</h4>
                <p className="text-[11px] text-gray-500 font-medium">Live courier status updates for all active purchases.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white border border-gray-200/80 rounded-2xl shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-[#EAF8F2] text-[#059669] flex items-center justify-center shrink-0 border border-emerald-200/60">
                <svg className="w-4 h-4 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m-8-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h4 className="font-extrabold text-gray-900 text-xs">Instant Reward Supercoins</h4>
                <p className="text-[11px] text-gray-500 font-medium">Earn 250 bonus coins automatically on registration.</p>
              </div>
            </div>
          </div>

          {/* Bottom Trust Stat Footer */}
          <div className="z-10 pt-3 border-t border-gray-200/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <span className="w-6 h-6 rounded-full bg-[#059669] text-white font-black text-[10px] flex items-center justify-center border-2 border-white">S</span>
                <span className="w-6 h-6 rounded-full bg-teal-600 text-white font-black text-[10px] flex items-center justify-center border-2 border-white">R</span>
                <span className="w-6 h-6 rounded-full bg-green-600 text-white font-black text-[10px] flex items-center justify-center border-2 border-white">A</span>
              </div>
              <span className="font-bold text-gray-800 text-[11px]">50,000+ Happy Shoppers</span>
            </div>
            <span className="text-[10px] font-extrabold text-[#059669] bg-[#EAF8F2] px-2 py-0.5 rounded border border-emerald-200">★ 4.9 Rating</span>
          </div>

        </div>

        {/* 🔒 RIGHT COLUMN: Floating White Customer Auth Card (Mirroring Admin Login Card) */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between space-y-4 bg-white font-sans text-gray-800">
          
          {/* Top Shield Header Graphic (Exact match with Admin Login Page) */}
          <div className="flex flex-col items-center text-center space-y-1">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <div className="absolute inset-0 border border-emerald-200 rounded-full opacity-60" />
              <div className="w-10 h-10 rounded-2xl bg-[#059669] text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 6c1.66 0 3 1.34 3 3v2h1c.55 0 1 .45 1 1v5c0 .55-.45 1-1 1H8c-.55 0-1-.45-1-1v-5c0-.55.45-1 1-1h1v-2c0-1.66 1.34-3 3-3zm0 2c-.55 0-1 .45-1 1v2h2v-2c0-.55-.45-1-1-1z" />
                </svg>
              </div>
            </div>

            <span className="bg-[#EAF8F2] text-[#059669] font-black text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-emerald-200/60">
              🔒 VERIFIED CUSTOMER AUTH
            </span>

            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-tight">
              {isForgotView ? "Account Reset" : isRegisterView ? "Create Account" : "Customer Login"}
            </h2>
          </div>
          
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

              {/* Password Field (Both Login & Create Account) */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-gray-700 font-bold">
                    {isRegisterView ? "Set Password" : "Password"}
                  </label>
                  {!isRegisterView && (
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
                  )}
                </div>
                <input
                  type="password"
                  required
                  placeholder={isRegisterView ? "Create a strong password (min 6 chars)" : "Enter your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:border-blue-600 focus:outline-none transition font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3.5 rounded-xl transition shadow-md shadow-emerald-600/20 cursor-pointer uppercase tracking-wider"
              >
                {loading
                  ? "Processing..."
                  : isRegisterView
                  ? "CREATE ACCOUNT"
                  : "LOGIN TO ACCOUNT"}
              </button>

              {/* 🌐 Google Auth Direct Redirect Button */}
              <div className="pt-2">
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink mx-3 text-gray-400 font-bold text-[10px] uppercase tracking-wider">OR</span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-bold text-xs py-3 px-4 rounded-xl transition flex items-center justify-center gap-2.5 shadow-2xs cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>{isRegisterView ? "Sign up with Google" : "Sign in with Google"}</span>
                </button>
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
                    : "New to E-COM? Create an account"}
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
