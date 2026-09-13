"use client";

import Link from "next/link";

const reportsList = [
  {
    title: "Monthly financial summary",
    description: "Cash position, savings inflow, loan disbursement, withdrawal outflow.",
    format: "PDF + CSV",
    buttonType: "black",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
    ),
  },
  {
    title: "Member investment statements",
    description: "Per-member ownership share, dividend basis, contribution match.",
    format: "178 statements",
    buttonType: "white",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    ),
  },
  {
    title: "Operational account ledger",
    description: "Movements in operations and reserve accounts.",
    format: "CSV",
    buttonType: "white",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
    ),
  },
  {
    title: "Loan portfolio",
    description: "Active, paid, written-off; aging buckets and exposure.",
    format: "PDF + CSV",
    buttonType: "white",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="19" x2="12" y2="5"></line>
        <polyline points="5 12 12 5 19 12"></polyline>
      </svg>
    ),
  },
];

export default function ReportsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">
            REPORTS
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            April Report
          </h1>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white text-sm font-medium hover:bg-gray-50 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Apr 2026
          </button>
          <button className="px-5 py-2 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm">
            Export report
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex flex-col sm:flex-row gap-8 sm:gap-16 pt-4">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">
            PERIOD
          </p>
          <p className="text-xl font-bold text-gray-900">Apr 2026</p>
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">
            INFLOW
          </p>
          <p className="text-xl font-bold text-gray-900">$4.12M</p>
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">
            OUTFLOW
          </p>
          <p className="text-xl font-bold text-gray-900">$2.84M</p>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col mt-4 divide-y divide-gray-100">
        {reportsList.map((report, i) => (
          <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center shrink-0 mt-0.5">
                {report.icon}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">{report.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{report.description}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6 justify-between md:justify-end w-full md:w-auto mt-2 md:mt-0 ml-14 md:ml-0">
              <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase whitespace-nowrap">
                {report.format}
              </span>
              
              <button 
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors shadow-sm whitespace-nowrap ${
                  report.buttonType === 'black' 
                    ? 'bg-black text-white hover:bg-gray-800' 
                    : 'bg-white border border-gray-200 text-gray-900 hover:bg-gray-50'
                }`}
              >
                Generate
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
