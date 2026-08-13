"use client";

import { useState } from "react";
import Footer from "components/layout/footer";
import Link from "next/link";

export default function HelpPage() {
  const [ticket, setTicket] = useState({ name: "", email: "", topic: "Order Tracking", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-[#FAFAFA] text-gray-900 min-h-screen flex flex-col justify-between">
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-12 w-full">
        
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-xs text-center space-y-3">
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black px-3 py-1 rounded-full uppercase">
            24/7 Customer Support Hub
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900">How Can We Help You Today?</h1>
          <div className="max-w-md mx-auto">
            <Link
              href="/track-order"
              className="inline-block bg-gray-900 hover:bg-black text-white text-xs font-bold px-6 py-3 rounded-xl transition shadow-xs"
            >
              📍 Track Your Order Real-Time &rarr;
            </Link>
          </div>
        </div>

        {/* Support Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-xs space-y-2">
            <div className="text-2xl">💳</div>
            <h3 className="font-black text-base text-gray-900">Payments &amp; Refunds</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Razorpay instant UPI/Card payments, 5-7 business day refund timeline for returned items.
            </p>
          </div>

          <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-xs space-y-2">
            <div className="text-2xl">🚚</div>
            <h3 className="font-black text-base text-gray-900">Shipping &amp; Delivery</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Shiprocket air cargo delivery in 1-4 days. Free shipping on all orders over ₹499.
            </p>
          </div>

          <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-xs space-y-2">
            <div className="text-2xl">🔄</div>
            <h3 className="font-black text-base text-gray-900">Cancellation &amp; Returns</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Easy 7-day hassle-free doorstep pickup return &amp; size exchange policy.
            </p>
          </div>
        </div>

        {/* Support Ticket Form */}
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-xs max-w-2xl mx-auto space-y-6">
          <h2 className="text-xl font-black text-gray-900">Submit a Support Ticket</h2>
          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-bold text-center">
              ✓ Ticket #TICK-84920 Created! Our support team will reply to your email within 2 hours.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold block mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={ticket.name}
                    onChange={(e) => setTicket({ ...ticket, name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Your Email</label>
                  <input
                    type="email"
                    required
                    value={ticket.email}
                    onChange={(e) => setTicket({ ...ticket, email: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Topic</label>
                <select
                  value={ticket.topic}
                  onChange={(e) => setTicket({ ...ticket, topic: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 focus:border-emerald-500 focus:outline-none"
                >
                  <option>Order Tracking &amp; Delivery Delay</option>
                  <option>Payment / Refund Issue</option>
                  <option>Return &amp; Size Exchange Request</option>
                  <option>General Support Question</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Message Details</label>
                <textarea
                  rows={4}
                  required
                  value={ticket.message}
                  onChange={(e) => setTicket({ ...ticket, message: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl transition shadow-xs cursor-pointer"
              >
                Submit Ticket
              </button>
            </form>
          )}
        </div>

      </div>
      <Footer />
    </div>
  );
}
