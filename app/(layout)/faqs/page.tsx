import { Metadata } from "next";
import { FaqAccordion } from "../FaqAccordion";
import { FileText, FileCheck, BookOpen, Download } from "lucide-react";

export const metadata: Metadata = {
  title: "FAQs & Resources",
  description:
    "Frequently Asked Questions about Kajola. Get answers to your questions about our programs, services, and more.",
};

const FAQs = () => {
  return (
    <div className="bg-[#fcfbf9] min-h-screen">
      {/* ── FAQs ────────────────────────────────────────────────── */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-16">
          <div className="lg:w-1/3">
            <p className="text-xs font-semibold tracking-widest text-[#a89f91] uppercase mb-4">
              — Faqs
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight mb-6">
              Common
              <br />
              questions,
              <br />
              and answers.
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
              If your question isn't covered here, message us — every member rep
              is also a member.
            </p>
          </div>
          <FaqAccordion />
        </div>
      </section>

      {/* ── Resources Hero ────────────────────────────────────────────── */}
      <section className="bg-[#f6f4eb] rounded-b-[3rem] pt-12 md:pt-20 pb-20 md:pb-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <p className="text-xs font-semibold tracking-widest text-indigo-500 uppercase mb-4">
                — RESOURCES
              </p>
              <h1 className="text-5xl md:text-[4rem] font-bold text-gray-900 tracking-tight leading-[1.05]">
                Bylaws, policies, blog & news.
              </h1>
            </div>
            <div className="shrink-0 md:mb-2">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors shadow-sm">
                <Download className="w-4 h-4 text-gray-500" />
                Download document index
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Bylaws */}
            <div className="bg-white rounded-4xl p-8 border border-gray-100 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div className="w-10 h-10 rounded-[0.8rem] bg-[#f4efe6] flex items-center justify-center text-gray-700">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-gray-400 uppercase">
                  12 DOCS
                </span>
              </div>
              <h3 className="text-[1.35rem] font-bold text-gray-900 mb-2">
                Bylaws
              </h3>
              <p className="text-[13px] text-gray-500 leading-relaxed mb-6 flex-1">
                The cooperative's constitution. Amended in General Assembly
                votes only.
              </p>
              <div className="border-t border-dashed border-gray-200 pt-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[13px] font-semibold text-gray-800">
                    2024 Bylaws (current)
                  </span>
                  <span className="text-[11px] font-mono font-semibold text-gray-400 uppercase">
                    PDF · 1.2MB
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] font-semibold text-gray-800">
                    Amendment history
                  </span>
                  <span className="text-[11px] font-mono font-semibold text-gray-400 uppercase">
                    PDF · 480KB
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] font-semibold text-gray-800">
                    Founding charter
                  </span>
                  <span className="text-[11px] font-mono font-semibold text-gray-400 uppercase">
                    PDF · 220KB
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Policies */}
            <div className="bg-white rounded-4xl p-8 border border-gray-100 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div className="w-10 h-10 rounded-[0.8rem] bg-[#f4efe6] flex items-center justify-center text-gray-700">
                  <FileCheck className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-gray-400 uppercase">
                  28 DOCS
                </span>
              </div>
              <h3 className="text-[1.35rem] font-bold text-gray-900 mb-2">
                Policies
              </h3>
              <p className="text-[13px] text-gray-500 leading-relaxed mb-6 flex-1">
                Operational rules — set by Board, ratified by members.
              </p>
              <div className="border-t border-dashed border-gray-200 pt-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[13px] font-semibold text-gray-800">
                    Loan disbursement policy
                  </span>
                  <span className="text-[11px] font-mono font-semibold text-gray-400 uppercase">
                    PDF · 320KB
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] font-semibold text-gray-800">
                    Welfare claim policy
                  </span>
                  <span className="text-[11px] font-mono font-semibold text-gray-400 uppercase">
                    PDF · 190KB
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] font-semibold text-gray-800">
                    Investment vetting policy
                  </span>
                  <span className="text-[11px] font-mono font-semibold text-gray-400 uppercase">
                    PDF · 410KB
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Document Library */}
            <div className="bg-[#111111] rounded-4xl p-8 shadow-xl shadow-black/5 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div className="w-10 h-10 rounded-[0.8rem] bg-white/5 border border-white/10 flex items-center justify-center text-[#facc15]">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-gray-500 uppercase">
                  142 DOCS · LIBRARY
                </span>
              </div>
              <h3 className="text-[1.35rem] font-bold text-white mb-2">
                Document Library
              </h3>
              <p className="text-[13px] text-gray-400 leading-relaxed mb-6 flex-1">
                All quarterly reports, audited financials, council minutes —
                searchable.
              </p>
              <div className="border-t border-dashed border-white/15 pt-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[13px] font-semibold text-white">
                    Q1 2026 disclosure
                  </span>
                  <span className="text-[11px] font-mono font-semibold text-gray-500 uppercase">
                    PDF · 2.4MB
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] font-semibold text-white">
                    2025 audited financials
                  </span>
                  <span className="text-[11px] font-mono font-semibold text-gray-500 uppercase">
                    PDF · 6.1MB
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] font-semibold text-white">
                    AGM 2026 minutes
                  </span>
                  <span className="text-[11px] font-mono font-semibold text-gray-500 uppercase">
                    PDF · 880KB
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ── Contact ─────────────────────────────────────────────── */}
      <section className="bg-[#fcfbf9] pb-32 pt-20">
        <div className="px-6 max-w-5xl mx-auto ">
          <div className="flex flex-col lg:flex-row justify-center gap-8 lg:gap-12 items-start">
            {/* Contact Form */}
            <div className="bg-white rounded-3xl p-10 lg:p-12 shadow-sm border border-gray-100 w-full lg:w-3/5">
              <p className="text-xs font-semibold tracking-widest text-indigo-500 uppercase mb-4">
                — Contact Form
              </p>
              <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-10">
                Tell us how we can help.
              </h2>

              <form className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Full name
                    </label>
                    <input
                      type="text"
                      placeholder="Alexandra Morgan"
                      className="w-full px-4 py-3 rounded-xl border border-black/50 focus:outline-none focus:ring-2  focus:border-black/30 transition-all text-sm "
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="alex@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-black/50 focus:outline-none focus:ring-2  focus:border-black/30 transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    I'd like to ask about
                  </label>
                  <div className="relative">
                    <select className="w-full px-4 py-3 rounded-xl border border-black/50 focus:outline-none focus:ring-2  focus:border-black/30 transition-all text-sm appearance-none bg-white">
                      <option>Membership application</option>
                      <option>General inquiries</option>
                    </select>
                    <svg
                      className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Your message
                  </label>
                  <textarea
                    rows={4}
                    placeholder="I'd like to learn more about the Generations Trust scheme and what it means for my children's inheritance."
                    className="w-full px-4 py-3 rounded-xl border border-black/50 focus:outline-none ring-2 ring-black/10  transition-all text-sm resize-none"
                  ></textarea>
                  <p className="text-xs text-gray-500 mt-2">
                    Avg response time: 8 hours on business days.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="w-5 h-5 rounded bg-[#111111] flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      I agree to the privacy policy
                    </span>
                  </label>
                  <button
                    type="button"
                    className="px-6 py-3 bg-[#111111] text-white rounded-full font-semibold text-sm hover:scale-105 transition-transform flex items-center gap-2"
                  >
                    Send message <span aria-hidden="true">→</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Contact Info Box */}
            <div className="bg-[#111111] rounded-3xl p-10 lg:p-12 text-white w-full lg:w-90 lg:mt-32">
              <p className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-8">
                — Direct Lines
              </p>
              <div className="flex flex-col gap-8">
                <div className="flex justify-between items-center border-b border-white/10 pb-6">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">
                      General inquiries
                    </p>
                    <p className="font-semibold text-sm">
                      support@likeminds.coop
                    </p>
                  </div>
                  <div className="text-[#facc15] text-xs">↗</div>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-6">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">
                      Member relations
                    </p>
                    <p className="font-semibold text-sm">
                      members@likeminds.coop
                    </p>
                  </div>
                  <div className="text-[#facc15] text-xs">↗</div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">
                      Phone (toll-free)
                    </p>
                    <p className="font-semibold text-sm">1—800—LIKEMIND</p>
                  </div>
                  <div className="text-[#facc15] text-xs">↗</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQs;
