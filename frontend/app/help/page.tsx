"use client";

import { useState } from "react";
import Link from "next/link";
import { submitCustomerQuery } from "lib/api";
import { toast } from "sonner";
import Footer from "components/layout/footer";

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState<"all" | "payments" | "shipping" | "returns">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Ticket Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("Order Tracking");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const faqs = [
    {
      category: "shipping",
      question: "How long will my order take to deliver?",
      answer: "Orders are processed within 24 hours. Delivery takes 2-4 business days for metro cities and 3-5 days for non-metro locations across India via BlueDart & Shiprocket Air Express."
    },
    {
      category: "payments",
      question: "What payment methods do you accept?",
      answer: "We accept Google Pay, PhonePe, Paytm, BHIM UPI, Netbanking, Credit/Debit Cards (Visa, MasterCard, RuPay), Botmartz Wallet, and Cash on Delivery (COD)."
    },
    {
      category: "returns",
      question: "What is the return & replacement policy?",
      answer: "We offer a 7-day hassle-free doorstep pickup return and size replacement policy. You can initiate a return directly from your account page or by contacting support@botmartz.com."
    },
    {
      category: "payments",
      question: "When will I receive my refund for a returned item?",
      answer: "Once the pickup courier collects your package and passes verification, refunds are instantly credited to your original payment method or Botmartz Wallet within 24-48 hours."
    },
    {
      category: "shipping",
      question: "Is shipping free on all orders?",
      answer: "Yes, free shipping is applicable on all orders above ₹499. A nominal delivery fee of ₹49 applies to orders below ₹499."
    },
    {
      category: "returns",
      question: "How do I request a size exchange?",
      answer: "Navigate to Account → My Orders, click 'Request Return / Exchange', select your preferred new size, and our courier will pick up the item and hand over the replacement."
    }
  ];

  const filteredFaqs = faqs.filter(f => {
    const matchesTab = activeTab === "all" || f.category === activeTab;
    const matchesSearch = !searchQuery.trim() || 
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      f.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      await submitCustomerQuery({
        customer_name: name,
        customer_email: email,
        query_type: topic,
        subject: `Helpdesk Ticket: ${topic}`,
        message: message,
        priority: "High"
      });
      setSubmitting(false);
      setSubmitted(true);
      toast.success("✨ Support ticket created in Botmartz Database!");
    } catch (e) {
      setSubmitting(false);
      toast.error("Failed to submit support ticket.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans flex flex-col justify-between">
      <div className="py-12 px-4 sm:px-6 max-w-5xl mx-auto space-y-10 w-full">
        
        {/* Header Hero Search */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-3xl p-8 sm:p-12 shadow-lg text-center space-y-6">
          <span className="bg-white/20 text-white font-extrabold text-xs px-3.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-xs">
            24/7 Help Center &amp; Support Hub &bull; Botmartz Technologies
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
            How Can We Help You?
          </h1>

          <div className="max-w-xl mx-auto relative">
            <input
              type="text"
              placeholder="Search FAQs, payments, returns, shipping..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-gray-900 placeholder-gray-400 font-medium rounded-2xl pl-11 pr-4 py-3.5 text-xs shadow-md focus:outline-none"
            />
            <span className="absolute left-4 top-3.5 text-gray-400 text-sm">🔍</span>
          </div>
        </div>

        {/* 3 Main Quick Nav Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => setActiveTab("payments")}
            className={`p-6 rounded-3xl border transition text-left space-y-3 shadow-2xs ${
              activeTab === "payments" ? "bg-emerald-50 border-emerald-500" : "bg-white border-gray-200 hover:border-emerald-300"
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 font-black text-2xl flex items-center justify-center">
              💳
            </div>
            <h3 className="font-black text-lg text-gray-900">Payments &amp; Refunds</h3>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              Razorpay UPI, cards, netbanking, COD, Botmartz Wallet, and 24-hour instant refund timelines.
            </p>
          </button>

          <button
            onClick={() => setActiveTab("shipping")}
            className={`p-6 rounded-3xl border transition text-left space-y-3 shadow-2xs ${
              activeTab === "shipping" ? "bg-emerald-50 border-emerald-500" : "bg-white border-gray-200 hover:border-emerald-300"
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 font-black text-2xl flex items-center justify-center">
              🚚
            </div>
            <h3 className="font-black text-lg text-gray-900">Shipping &amp; Delivery</h3>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              Shiprocket air cargo 2-4 day express shipping across 28,000+ Indian pincodes.
            </p>
          </button>

          <button
            onClick={() => setActiveTab("returns")}
            className={`p-6 rounded-3xl border transition text-left space-y-3 shadow-2xs ${
              activeTab === "returns" ? "bg-emerald-50 border-emerald-500" : "bg-white border-gray-200 hover:border-emerald-300"
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 font-black text-2xl flex items-center justify-center">
              🔄
            </div>
            <h3 className="font-black text-lg text-gray-900">Cancellation &amp; Returns</h3>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              Doorstep pickup return, size replacement, and full refund processing.
            </p>
          </button>
        </div>

        {/* FAQs Accordion */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <h2 className="text-2xl font-black text-gray-900">Frequently Asked Questions</h2>
            {activeTab !== "all" && (
              <button onClick={() => setActiveTab("all")} className="text-xs font-bold text-emerald-600 hover:underline">
                Show All FAQs
              </button>
            )}
          </div>

          <div className="space-y-3">
            {filteredFaqs.length === 0 ? (
              <p className="text-center py-6 text-xs text-gray-400 font-bold">No FAQs matching your search.</p>
            ) : (
              filteredFaqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div key={index} className="border border-gray-200 rounded-2xl overflow-hidden transition">
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full p-4 text-left font-extrabold text-xs sm:text-sm text-gray-900 flex justify-between items-center hover:bg-gray-50 transition cursor-pointer"
                    >
                      <span>{faq.question}</span>
                      <span className="text-gray-400 text-base">{isOpen ? "−" : "+"}</span>
                    </button>
                    {isOpen && (
                      <div className="p-4 pt-0 text-xs text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/50 font-medium">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Submit Ticket Form */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Still Need Help? Submit a Ticket</h2>
            <p className="text-xs text-gray-500 font-medium mt-1">Our Botmartz support team will respond directly to your email.</p>
          </div>

          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center mx-auto">✓</div>
              <h3 className="font-black text-emerald-900">Support Ticket Created!</h3>
              <p className="text-xs text-emerald-800 font-medium">We have logged your ticket into our Botmartz database. Response will be sent to <strong>{email}</strong>.</p>
            </div>
          ) : (
            <form onSubmit={handleTicketSubmit} className="space-y-4 text-xs font-medium">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Your Name *</label>
                  <input type="text" required placeholder="e.g. Sachin Rawat" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs focus:outline-none" />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Email Address *</label>
                  <input type="email" required placeholder="e.g. sachin@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Topic</label>
                <select value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none">
                  <option>Order Tracking &amp; Delivery Delay</option>
                  <option>Payment / Refund Issue</option>
                  <option>Return &amp; Size Exchange Request</option>
                  <option>General Support Question</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Message Details *</label>
                <textarea rows={4} required placeholder="Describe your issue or query..." value={message} onChange={(e) => setMessage(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs focus:outline-none" />
              </div>

              <button type="submit" disabled={submitting} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-xl uppercase tracking-wider transition cursor-pointer disabled:opacity-50">
                {submitting ? "Submitting Ticket..." : "Submit Support Ticket"}
              </button>
            </form>
          )}
        </div>

      </div>
      <Footer />
    </div>
  );
}
