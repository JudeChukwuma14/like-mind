import { Metadata } from "next";
import { FileText, FileCheck, BookOpen, Download, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Explore the resources Kajola offers to support your journey. From insightful content to helpful tools and guides, we’re here to empower you every step of the way.",
};

export default function ResourcesPage() {
  return (
    <div className="bg-[#fcfbf9] min-h-screen pb-32">
      {/* ── Resources Hero ────────────────────────────────────────────── */}
      <section className="bg-[#f6f4eb] rounded-b-[3rem] pt-12 md:pt-20 pb-20 md:pb-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-[10px] font-mono font-bold tracking-[0.2em] text-gray-500 uppercase mb-16 md:mb-20">
            HOME / RESOURCES
          </div>
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

      {/* ── Latest News / Blog ──────────────────────────────────────── */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Latest from the Blog</h2>
            <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View all posts <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Blog Post 1 */}
            <div className="group cursor-pointer">
              <div className="bg-gray-200 rounded-4xl aspect-video mb-6 overflow-hidden relative">
                <div className="absolute inset-0 bg-[#f4efe6] group-hover:scale-105 transition-transform duration-500"></div>
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <span className="text-gray-400 font-mono text-sm tracking-widest">IMAGE PLACEHOLDER</span>
                </div>
              </div>
              <p className="text-xs font-semibold tracking-widest text-indigo-500 uppercase mb-3">
                Cooperative News — Mar 12, 2026
              </p>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                Announcing the Q1 2026 Dividend Distribution
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Following our recent Board resolution, we are excited to announce a 4.2% annualized dividend distribution for all active Daily Pulse and Quarterly Pool participants...
              </p>
            </div>

            {/* Blog Post 2 */}
            <div className="group cursor-pointer">
              <div className="bg-gray-200 rounded-4xl aspect-video mb-6 overflow-hidden relative">
                <div className="absolute inset-0 bg-[#f4efe6] group-hover:scale-105 transition-transform duration-500"></div>
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <span className="text-gray-400 font-mono text-sm tracking-widest">IMAGE PLACEHOLDER</span>
                </div>
              </div>
              <p className="text-xs font-semibold tracking-widest text-indigo-500 uppercase mb-3">
                Member Spotlight — Mar 05, 2026
              </p>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                How the Welfare Fund supported the Adebayo family
              </h3>
              <p className="text-gray-600 leading-relaxed">
                When unexpected medical emergencies arise, our cooperative stands together. Read the story of the Adebayo family and how the Medical Hardship grant provided critical bridge support...
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}