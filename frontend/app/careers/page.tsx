"use client";

import { useState } from "react";
import Link from "next/link";
import Footer from "components/layout/footer";

export default function CareersPage() {
  const [applyJobTitle, setApplyJobTitle] = useState<string | null>(null);
  const [applicantName, setApplicantName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [applicantApplied, setApplicantApplied] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans flex flex-col justify-between">
      <div className="py-12 px-4 sm:px-6 max-w-5xl mx-auto space-y-10 w-full">
        
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl text-center space-y-4 border border-emerald-900/40">
          <span className="bg-emerald-400/20 text-emerald-300 font-black text-xs px-3.5 py-1 rounded-full uppercase tracking-wider border border-emerald-400/30">
            Botmartz Technologies &bull; Join Our Team
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black">Build the Future of AI Commerce</h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-2xl mx-auto font-medium leading-relaxed">
            We are hiring engineers, interns, devrel creators, and community growth managers. Shape the next era of high-speed digital shopping!
          </p>
        </div>

        {/* Job Listings Grid */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-2xs space-y-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Open Positions &amp; Internships</h2>
            <p className="text-xs text-gray-500 mt-1 font-medium">All applications are submitted directly to <span className="text-emerald-700 font-bold font-mono">support@botmartz.com</span>.</p>
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
              },
              {
                title: "Full-Stack AI Software Engineer",
                focus: "Architect high-concurrency Next.js 15, FastAPI, Redis, and PostgreSQL e-commerce engines",
                location: "Bengaluru / Remote",
                type: "Full-Time Engineer",
                skills: "Next.js, TypeScript, Python FastAPI, PostgreSQL, Redis"
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

        {/* Modal */}
        {applyJobTitle && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-gray-200">
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
                  window.location.href = `mailto:support@botmartz.com?subject=${subject}&body=${body}`;
                }} className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Your Full Name</label>
                    <input type="text" required placeholder="e.g. Alex Sharma" value={applicantName} onChange={(e) => setApplicantName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none" />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Email Address</label>
                    <input type="email" required placeholder="e.g. alex@gmail.com" value={applicantEmail} onChange={(e) => setApplicantEmail(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none" />
                  </div>
                  <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl uppercase tracking-wider">Send Application to support@botmartz.com</button>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
}
