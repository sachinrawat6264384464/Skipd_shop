"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function EmailToastListener() {
  const pathname = usePathname();
  const [activeEmail, setActiveEmail] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;

    const handleEmailSent = (e: any) => {
      const emailDetail = e.detail;
      if (emailDetail) {
        setActiveEmail(emailDetail);
      }
    };

    window.addEventListener("skipd_email_sent", handleEmailSent);
    return () => window.removeEventListener("skipd_email_sent", handleEmailSent);
  }, [pathname]);

  if (pathname?.startsWith("/admin") || !activeEmail) return null;

  return (
    <>
      {/* 🟢 Live Floating Email Toast Banner */}
      <div className="fixed top-20 right-4 z-[99999] max-w-md w-full bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-emerald-500/80 animate-in slide-in-from-top-5 duration-300 font-sans">
        <div className="flex items-start justify-between gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 font-black text-lg flex items-center justify-center shrink-0 shadow-md">
            ✉️
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-400 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded uppercase tracking-wider">
                EMAIL SENT
              </span>
              <span className="text-[10px] text-slate-400 font-semibold truncate">To: {activeEmail.to}</span>
            </div>
            <h4 className="font-extrabold text-xs text-white truncate mt-1">{activeEmail.subject}</h4>
            <p className="text-[11px] text-slate-300 font-medium line-clamp-1 mt-0.5">
              {activeEmail.type === "WELCOME"
                ? `Account registered for username: ${activeEmail.username}`
                : activeEmail.type === "ORDER_CONFIRMATION"
                ? `Invoice & delivery details sent for Order #${activeEmail.details?.order_number || ''}`
                : activeEmail.type === "OTP_VERIFICATION"
                ? `Verification code: ${activeEmail.details?.otp || ''}`
                : "Email notification delivered successfully."}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1">
            <button
              type="button"
              onClick={() => setActiveEmail(null)}
              className="text-slate-400 hover:text-white font-bold text-xs p-1 cursor-pointer"
            >
              ✕
            </button>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="text-emerald-400 hover:text-emerald-300 font-extrabold text-[10px] underline cursor-pointer"
            >
              View Email
            </button>
          </div>
        </div>
      </div>

      {/* 📄 Full Interactive Email Inbox Modal Preview */}
      {showModal && (
        <div className="fixed inset-0 z-[100000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-sans animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[85vh] overflow-y-auto p-6 text-gray-900 shadow-2xl space-y-4 border border-gray-200">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <span className="bg-emerald-600 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                  {activeEmail.type} EMAIL
                </span>
                <h3 className="text-base font-black text-gray-900 mt-1">{activeEmail.subject}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-black text-sm flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Email Meta Header */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-1 text-xs">
              <div className="flex justify-between text-gray-600">
                <span><strong>From:</strong> SKIPD Store (sachinrawat6264384464@gmail.com)</span>
                <span className="text-gray-400 text-[11px]">{new Date(activeEmail.timestamp).toLocaleTimeString("en-IN")}</span>
              </div>
              <p className="text-gray-900"><strong>To:</strong> {activeEmail.to} ({activeEmail.username})</p>
              <p className="text-gray-600"><strong>Security:</strong> 256-bit TLS Encrypted Mail Transport</p>
            </div>

            {/* Email Body Content */}
            <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-5 text-xs text-gray-800 space-y-4">
              {activeEmail.type === "WELCOME" && (
                <div className="space-y-2">
                  <h4 className="font-extrabold text-sm text-emerald-950">Welcome to SKIPD Commerce, {activeEmail.username}! 🎉</h4>
                  <p className="leading-relaxed">Your registered account <strong>{activeEmail.to}</strong> has been activated.</p>
                  <div className="bg-white p-3 rounded-xl border border-emerald-200">
                    <p className="font-bold text-gray-900">Account Details:</p>
                    <p className="text-gray-600 mt-1">Username: <strong>{activeEmail.username}</strong></p>
                    <p className="text-gray-600">Registered Email: <strong>{activeEmail.to}</strong></p>
                  </div>
                </div>
              )}

              {activeEmail.type === "ORDER_CONFIRMATION" && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-emerald-200 pb-2">
                    <span className="font-extrabold text-emerald-950 text-sm">Order #{activeEmail.details?.order_number}</span>
                    <span className="font-black text-emerald-700 text-sm">Total Paid: ₹{activeEmail.details?.total_amount?.toLocaleString("en-IN")}</span>
                  </div>

                  <p className="font-bold text-gray-900">Hi {activeEmail.username}, thank you for your order!</p>
                  <p className="text-gray-600">Payment method: <strong>{activeEmail.details?.payment_method}</strong></p>

                  <div className="bg-white rounded-xl p-3 border border-emerald-200 space-y-2">
                    <p className="font-bold text-gray-900 text-xs">📦 Items Purchased:</p>
                    {(activeEmail.details?.items || []).map((it: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span>{it.title} (x{it.quantity})</span>
                        <span className="font-bold">₹{it.total?.toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs space-y-1">
                    <p className="font-bold text-amber-900">🚚 Estimated Delivery:</p>
                    <p className="text-amber-800">{activeEmail.details?.expected_delivery}</p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-[11px] space-y-1 text-blue-900">
                    <p className="font-bold">📞 Owner &amp; Support Contact Inquiry:</p>
                    <p>Owner: {activeEmail.details?.owner_contact?.owner_name}</p>
                    <p>Phone: {activeEmail.details?.owner_contact?.phone}</p>
                    <p>Email: {activeEmail.details?.owner_contact?.email}</p>
                  </div>
                </div>
              )}

              {activeEmail.type === "OTP_VERIFICATION" && (
                <div className="space-y-3 text-center">
                  <h4 className="font-extrabold text-sm text-gray-900">Password Reset Verification OTP</h4>
                  <div className="bg-white border-2 border-emerald-500 rounded-2xl p-4 inline-block mx-auto">
                    <span className="text-2xl font-black tracking-widest text-emerald-700">{activeEmail.details?.otp}</span>
                  </div>
                  <p className="text-gray-500 text-[11px]">Valid for 1 minute. Enter this 6-digit code in the Forgot Password form.</p>
                </div>
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="bg-gray-900 hover:bg-black text-white font-extrabold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
