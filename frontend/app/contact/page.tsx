"use client";

import { useState } from "react";
import Link from "next/link";
import { submitCustomerQuery } from "lib/api";
import { toast } from "sonner";
import Footer from "components/layout/footer";

export default function ContactUsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [queryType, setQueryType] = useState("General Inquiry");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      await submitCustomerQuery({
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        query_type: queryType,
        subject: subject,
        message: message,
        priority: "High"
      });

      setSubmitting(false);
      setSubmitted(true);
      toast.success("✨ Your query has been submitted directly to our Botmartz support team!");
    } catch (err) {
      setSubmitting(false);
      toast.error("Failed to submit inquiry. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans flex flex-col justify-between">
      <div className="py-12 px-4 sm:px-6 max-w-6xl mx-auto space-y-12 w-full">
        
        {/* Header Hero Section */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
            24/7 Botmartz Support Desk
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
            We&apos;re Here to Help You
          </h1>
          <p className="text-sm text-gray-600 font-medium leading-relaxed">
            Have questions about an order, shipping, or product details? Send us a message and our Botmartz support team will get back to you within 2 hours.
          </p>
        </div>

        {/* 3 Quick Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200/80 p-6 rounded-3xl shadow-2xs space-y-3 hover:border-emerald-500 transition duration-300">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center text-2xl">
              📞
            </div>
            <h3 className="font-black text-base text-gray-900">Toll-Free Helpline</h3>
            <p className="text-xs text-gray-500">Mon-Sat from 9:00 AM to 8:00 PM IST</p>
            <p className="font-extrabold text-emerald-700 text-sm">1800-BOTMARTZ (1800 268 6278)</p>
          </div>

          <div className="bg-white border border-gray-200/80 p-6 rounded-3xl shadow-2xs space-y-3 hover:border-emerald-500 transition duration-300">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-2xl">
              ✉️
            </div>
            <h3 className="font-black text-base text-gray-900">Email Support</h3>
            <p className="text-xs text-gray-500">Send an email for order inquiries</p>
            <p className="font-extrabold text-blue-700 text-sm">team@botmartz.com</p>
          </div>

          <div className="bg-white border border-gray-200/80 p-6 rounded-3xl shadow-2xs space-y-3 hover:border-emerald-500 transition duration-300">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 font-bold flex items-center justify-center text-2xl">
              📍
            </div>
            <h3 className="font-black text-base text-gray-900">Corporate HQ</h3>
            <p className="text-xs text-gray-500">50 R, Mangalmurti Krishna Ji Nagar</p>
            <p className="font-extrabold text-gray-800 text-sm">Indore, Madhya Pradesh, India</p>
          </div>
        </div>

        {/* Main Section: Contact Form + HQ Details */}
        <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Form (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Send Us a Direct Inquiry</h2>
              <p className="text-xs text-gray-500 mt-1 font-medium">Your request will be logged directly into our Botmartz support desk.</p>
            </div>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3 animate-in zoom-in-95">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-black text-xl flex items-center justify-center mx-auto">
                  ✓
                </div>
                <h3 className="text-lg font-black text-emerald-900">Inquiry Received!</h3>
                <p className="text-xs text-emerald-800 font-medium">
                  Thank you, <strong>{name}</strong>! We have saved your message to our database. A support representative will respond to <strong>{email}</strong> shortly.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setName(""); setEmail(""); setMessage(""); setSubject(""); }}
                  className="bg-emerald-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl hover:bg-emerald-700 transition cursor-pointer"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sachin Rawat"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. sachin@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Inquiry Type</label>
                    <select
                      value={queryType}
                      onChange={(e) => setQueryType(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs focus:outline-none font-bold"
                    >
                      <option>General Inquiry</option>
                      <option>Order Tracking &amp; Delivery</option>
                      <option>Return &amp; Refund Request</option>
                      <option>Product Size / Quality Issue</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Subject *</label>
                  <input
                    type="text"
                    required
                    placeholder="Brief summary of your inquiry..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Message Details *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your issue or request in detail..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-3.5 rounded-xl transition shadow-md uppercase tracking-wider cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Submitting Inquiry..." : "Submit Inquiry to Support"}
                </button>
              </form>
            )}
          </div>

          {/* Right HQ Info */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white p-8 rounded-3xl flex flex-col justify-between space-y-6 border border-emerald-900/40">
            <div className="space-y-4">
              <span className="bg-emerald-500/20 text-emerald-400 font-extrabold text-[10px] px-2.5 py-1 rounded-md uppercase">
                Botmartz AI Solution HQ
              </span>
              <h3 className="text-2xl font-black leading-tight">Visit or Mail Us</h3>
              <p className="text-xs text-gray-300 leading-relaxed font-medium">
                Botmartz AI Solution Pvt. Ltd.,<br />
                50 R, Mangalmurti Krishna Ji Nagar,<br />
                Behind Mayur Hospital, Indore,<br />
                Madhya Pradesh, India<br />
                Email: team@botmartz.com
              </p>
            </div>

            <div className="space-y-3 border-t border-white/10 pt-4 text-xs font-medium">
              <p className="text-gray-300">🏢 <strong>CIN:</strong> U72900KA2024PTC188888</p>
              <p className="text-gray-300">⏰ <strong>Working Hours:</strong> Mon-Sat 9 AM - 8 PM IST</p>
              <p className="text-emerald-400 font-bold">⚡ Fast 2-Hour Response Time Guaranteed</p>
            </div>

            <div className="pt-2">
              <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:underline font-bold">
                &larr; Back to Shopping
              </Link>
            </div>
          </div>

        </div>

      </div>

      {/* Render Footer */}
      <Footer />
    </div>
  );
}
