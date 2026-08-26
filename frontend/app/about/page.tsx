"use client";

import { useState } from "react";
import Link from "next/link";

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState<"about" | "careers" | "stories" | "corporate">("about");
  const [applyJobTitle, setApplyJobTitle] = useState<string | null>(null);
  const [applicantName, setApplicantName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [applicantApplied, setApplicantApplied] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Top Hero Banner */}
        <div className="bg-gradient-to-br from-gray-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl text-center space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
          <span className="bg-emerald-400/20 text-emerald-300 font-black text-xs px-3.5 py-1 rounded-full uppercase tracking-wider border border-emerald-400/30">
            E-COM Commerce Pvt Ltd
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
            India&apos;s Fastest Direct-to-Consumer Platform
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-xs sm:text-sm leading-relaxed font-medium">
            Founded with a vision to revolutionize online shopping in India through instant checkout, transparent logistics tracking, and verified authentic products.
          </p>
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="flex flex-wrap items-center justify-center gap-2 bg-white p-2 rounded-2xl border border-gray-200 shadow-2xs">
          <button
            onClick={() => setActiveTab("about")}
            className={`px-5 py-2.5 rounded-xl font-black text-xs transition cursor-pointer ${
              activeTab === "about"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            🏢 About Us
          </button>
          <button
            onClick={() => setActiveTab("careers")}
            className={`px-5 py-2.5 rounded-xl font-black text-xs transition cursor-pointer ${
              activeTab === "careers"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            💼 Careers
          </button>
          <button
            onClick={() => setActiveTab("stories")}
            className={`px-5 py-2.5 rounded-xl font-black text-xs transition cursor-pointer ${
              activeTab === "stories"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            ✨ E-COM Stories
          </button>
          <button
            onClick={() => setActiveTab("corporate")}
            className={`px-5 py-2.5 rounded-xl font-black text-xs transition cursor-pointer ${
              activeTab === "corporate"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            📜 Corporate Info
          </button>
        </div>

        {/* TAB 1: ABOUT US */}
        {activeTab === "about" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* 4 Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-gray-200 p-6 rounded-3xl text-center space-y-1 shadow-2xs">
                <h3 className="text-3xl font-black text-emerald-600">5M+</h3>
                <p className="text-xs text-gray-500 font-bold">Happy Customers</p>
              </div>
              <div className="bg-white border border-gray-200 p-6 rounded-3xl text-center space-y-1 shadow-2xs">
                <h3 className="text-3xl font-black text-blue-600">28,000+</h3>
                <p className="text-xs text-gray-500 font-bold">Pincodes Served</p>
              </div>
              <div className="bg-white border border-gray-200 p-6 rounded-3xl text-center space-y-1 shadow-2xs">
                <h3 className="text-3xl font-black text-amber-600">99.8%</h3>
                <p className="text-xs text-gray-500 font-bold">On-Time Delivery</p>
              </div>
              <div className="bg-white border border-gray-200 p-6 rounded-3xl text-center space-y-1 shadow-2xs">
                <h3 className="text-3xl font-black text-purple-600">100%</h3>
                <p className="text-xs text-gray-500 font-bold">Genuine Products</p>
              </div>
            </div>

            {/* Core Brand Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-2xs space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 font-black text-2xl flex items-center justify-center">
                  ⚡
                </div>
                <h3 className="text-lg font-black text-gray-900">Express Delivery</h3>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  Integrated directly with BlueDart and Shiprocket Air Cargo to deliver orders in under 24-48 hours across India.
                </p>
              </div>

              <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-2xs space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 font-black text-2xl flex items-center justify-center">
                  🛡️
                </div>
                <h3 className="text-lg font-black text-gray-900">Quality Assured</h3>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  Every product undergoes 100% rigorous quality assurance before being dispatched from our fulfillment hubs.
                </p>
              </div>

              <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-2xs space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 font-black text-2xl flex items-center justify-center">
                  🎁
                </div>
                <h3 className="text-lg font-black text-gray-900">Customer Rewards</h3>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  Earn 5% Supercoin rewards on every single purchase, redeemable instantly as cash discounts at checkout.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CAREERS */}
        {activeTab === "careers" && (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-2xs space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Work With Us — Botmartz AI Solutions</h2>
              <p className="text-xs text-gray-500 mt-1 font-medium">We are hiring interns and community leaders to grow our AI Engineering ecosystem! Applications go to <span className="text-emerald-700 font-bold font-mono">soham@botmartz.com</span>.</p>
            </div>

            <div className="space-y-4">
              {[
                {
                  title: "Brand & Community Intern",
                  focus: "Grow Botmartz brand & AI Engineering community (LinkedIn, Discord, Workshops, AI Frontier)",
                  location: "Remote / Hybrid",
                  type: "Internship / Community",
                  skills: "Communication, Content Creation, Social Media, AI Interest"
                },
                {
                  title: "Partnerships & Community Growth Intern",
                  focus: "Build ecosystem relationships with tech companies, universities, AI groups & sponsors",
                  location: "Remote / Hybrid",
                  type: "Internship / Community",
                  skills: "Outreach, Research, Networking, Partnership CRM"
                },
                {
                  title: "Developer Relations (DevRel) Intern",
                  focus: "Build developer ecosystem around PyTorch, LangGraph, LangChain, Transformers, RAG & AI Agents",
                  location: "Remote / Hybrid",
                  type: "Technical Internship",
                  skills: "Python, AI/ML Interest, GitHub Open-Source, Technical Content"
                }
              ].map((job, idx) => (
                <div key={idx} className="border border-gray-200 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-emerald-500 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-50 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-200">{job.type}</span>
                    </div>
                    <h3 className="font-extrabold text-sm text-gray-900">{job.title}</h3>
                    <p className="text-xs text-emerald-700 font-medium">{job.focus}</p>
                    <p className="text-[11px] text-gray-500 font-medium">{job.location} &bull; Skills: {job.skills}</p>
                  </div>
                  <button
                    onClick={() => setApplyJobTitle(job.title)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer shrink-0"
                  >
                    Apply Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: STORIES */}
        {activeTab === "stories" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
            <div className="bg-white border border-gray-200 rounded-3xl p-6 space-y-3 shadow-2xs">
              <span className="text-xs font-bold text-emerald-600 uppercase">Founder&apos;s Vision</span>
              <h3 className="text-xl font-black text-gray-900">&quot;Why we built E-COM Commerce&quot;</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                Traditional shopping portals suffer from slow load times, fake discount traps, and painful return processes. We built E-COM on high-speed cloud infrastructure to give Indian shoppers instant page loads, genuine pricing, and guaranteed 24-hour refund processing.
              </p>
              <p className="text-xs font-extrabold text-gray-900 pt-2">— Sachin Rawat, Founder &amp; CEO</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl p-6 space-y-3 shadow-2xs">
              <span className="text-xs font-bold text-blue-600 uppercase">Logistics Milestone</span>
              <h3 className="text-xl font-black text-gray-900">Same-Day Dispatch Initiative</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                By partnering directly with automated warehouse networks in Bengaluru, Delhi, and Mumbai, over 85% of orders placed before 2 PM are handed over to express courier partners on the very same day.
              </p>
              <p className="text-xs font-extrabold text-gray-900 pt-2">— Operations Team</p>
            </div>
          </div>
        )}

        {/* TAB 4: CORPORATE INFO */}
        {activeTab === "corporate" && (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-2xs space-y-6 animate-in fade-in duration-300">
            <h2 className="text-2xl font-black text-gray-900">Corporate Entity &amp; Statutory Compliance</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-700 font-medium">
              <div className="bg-gray-50 border border-gray-200 p-5 rounded-2xl space-y-2">
                <p className="font-extrabold text-gray-900 text-sm">Corporate Identification Number (CIN)</p>
                <p className="font-mono text-emerald-700 font-bold">U51109KA2012PTC066107</p>
                <p className="text-gray-500 text-[11px]">Registered under the Companies Act, Ministry of Corporate Affairs, Govt of India.</p>
              </div>

              <div className="bg-gray-50 border border-gray-200 p-5 rounded-2xl space-y-2">
                <p className="font-extrabold text-gray-900 text-sm">GSTIN Registration</p>
                <p className="font-mono text-blue-700 font-bold">29AAAAA0000A1Z5</p>
                <p className="text-gray-500 text-[11px]">State Jurisdiction: Commercial Tax Office, Bengaluru, Karnataka.</p>
              </div>

              <div className="bg-gray-50 border border-gray-200 p-5 rounded-2xl space-y-2 col-span-1 md:col-span-2">
                <p className="font-extrabold text-gray-900 text-sm">Registered Office Address</p>
                <p className="text-gray-600 leading-relaxed">
                  E-COM Commerce Private Limited,<br />
                  Buildings Alyssa, Begonia &amp; Clove Embassy Tech Village,<br />
                  Outer Ring Road, Devarabeesanahalli Village, Bengaluru, 560103, Karnataka, India
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Application Modal */}
        {applyJobTitle && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95 border border-gray-200">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h3 className="font-black text-base text-gray-900">Apply for: {applyJobTitle}</h3>
                <button onClick={() => setApplyJobTitle(null)} className="text-gray-400 hover:text-gray-600 text-sm font-bold">✕</button>
              </div>

              {applicantApplied ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-black text-xl flex items-center justify-center mx-auto">✓</div>
                  <h4 className="font-black text-emerald-900">Application Submitted!</h4>
                  <p className="text-xs text-gray-600">Our HR team will review your application and reach out to {applicantEmail}.</p>
                  <button onClick={() => { setApplyJobTitle(null); setApplicantApplied(false); }} className="bg-emerald-600 text-white font-bold text-xs px-5 py-2 rounded-xl">Close</button>
                </div>
              ) : (
                <form onSubmit={(e) => { 
                  e.preventDefault(); 
                  setApplicantApplied(true);
                  const subject = encodeURIComponent(`Application for ${applyJobTitle}: ${applicantName}`);
                  const body = encodeURIComponent(`Name: ${applicantName}\nEmail: ${applicantEmail}\nApplying for: ${applyJobTitle}`);
                  window.location.href = `mailto:soham@botmartz.com?subject=${subject}&body=${body}`;
                }} className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Your Full Name</label>
                    <input type="text" required placeholder="e.g. Alex Sharma" value={applicantName} onChange={(e) => setApplicantName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none" />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Email Address</label>
                    <input type="email" required placeholder="e.g. alex@gmail.com" value={applicantEmail} onChange={(e) => setApplicantEmail(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none" />
                  </div>
                  <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl uppercase tracking-wider">Send Application to soham@botmartz.com</button>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
