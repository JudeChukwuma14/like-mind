"use client";

import { useState } from "react";
import Link from "next/link";

const applicants = [
  {
    initials: "AY",
    name: "Amina Yusuf",
    role: "Account officer",
    status: null,
    time: null,
    bgColor: "bg-gray-800",
    isActive: true, // The highlighted row
  },
  {
    initials: "DO",
    name: "Daniel Okafor",
    role: "Signature mismatch",
    status: { text: "$100 - PENDING", type: "pending" },
    time: "14h ago",
    bgColor: "bg-gray-200 text-gray-700",
  },
  {
    initials: "NE",
    name: "Ngozi Ekanem",
    role: "Ready for sign-off",
    status: { text: "$100 - PAID", type: "paid" },
    time: "1d ago",
    bgColor: "bg-orange-100 text-orange-800",
  },
  {
    initials: "UO",
    name: "Uche Obi",
    role: "Referee verified",
    status: { text: "$100 - PAID", type: "paid" },
    time: "1d ago",
    bgColor: "bg-gray-200 text-gray-700",
  },
  {
    initials: "FA",
    name: "Folake Adeleke",
    role: "Ready for sign-off",
    status: { text: "$100 - PENDING", type: "pending" },
    time: "2d ago",
    bgColor: "bg-orange-100 text-orange-800",
  },
  {
    initials: "EO",
    name: "Emeka Obi",
    role: "Awaiting referee",
    status: { text: "$100 - PAID", type: "paid" },
    time: "2d ago",
    bgColor: "bg-gray-200 text-gray-700",
  },
  {
    initials: "RU",
    name: "Ronke Udom",
    role: "Ready for sign-off",
    status: { text: "$100 - PAID", type: "paid" },
    time: "3d ago",
    bgColor: "bg-gray-200 text-gray-700",
  },
  {
    initials: "TB",
    name: "Tunde Balogun",
    role: "Awaiting referee",
    status: { text: "$100 - PENDING", type: "pending" },
    time: "3d ago",
    bgColor: "bg-gray-200 text-gray-700",
  },
];

export default function ApplicationsPage() {
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">
            APPLICATIONS
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Review pending applications
          </h1>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3 flex-wrap relative">
          <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white text-sm font-medium hover:bg-gray-50 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Last 7 days
          </button>
          
          <button 
            onClick={() => setFilterOpen(!filterOpen)}
            className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${filterOpen ? 'bg-gray-100 border-gray-300' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
          >
            Filter
          </button>

          <button className="px-4 py-2 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm">
            Add member
          </button>

          {/* Filter Dropdown */}
          {filterOpen && (
            <div className="absolute top-12 right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-5 z-50">
              <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-4">
                FILTER APPLICATIONS
              </p>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Entry fee</p>
                  <div className="flex bg-gray-50 p-1 rounded-full border border-gray-200">
                    <button className="flex-1 py-1 px-3 bg-black text-white text-sm font-medium rounded-full shadow-sm">Paid</button>
                    <button className="flex-1 py-1 px-3 text-gray-600 text-sm font-medium rounded-full hover:bg-gray-100">Pending</button>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Pledge / month</p>
                  <div className="flex gap-2">
                    <button className="px-4 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium rounded-full hover:bg-gray-100">Any</button>
                    <button className="px-4 py-1.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-full shadow-sm">≥ $20k</button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <button 
                  onClick={() => setFilterOpen(false)}
                  className="text-sm text-gray-500 hover:text-gray-900 font-medium"
                >
                  Reset
                </button>
                <button 
                  onClick={() => setFilterOpen(false)}
                  className="px-4 py-2 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors shadow-sm"
                >
                  Apply filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-gray-200">
        <button className="pb-3 border-b-2 border-black text-sm font-bold text-gray-900">
          Needs review · 10
        </button>
        <button className="pb-3 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700">
          Approved this month · 14
        </button>
        <button className="pb-3 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700">
          Rejected · 2
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
            APPLICANT
          </p>
        </div>
        
        <div className="divide-y divide-gray-100">
          {applicants.map((a, i) => (
            <Link 
              href="#" 
              key={i}
              className={`flex items-center justify-between p-4 px-6 transition-colors group ${a.isActive ? 'bg-[#fef9c3]/30' : 'hover:bg-gray-50'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 ${a.bgColor}`}>
                  {a.initials}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 truncate">{a.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{a.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-8 ml-4 shrink-0">
                {a.status && (
                  <div className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wider uppercase hidden sm:block ${
                    a.status.type === 'paid' 
                      ? 'bg-[#fcd34d]/30 text-yellow-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {a.status.text}
                  </div>
                )}
                
                {a.time && (
                  <div className="text-xs sm:text-sm font-medium text-gray-400 w-12 sm:w-16 text-right">
                    {a.time}
                  </div>
                )}
                
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-black transition-colors shrink-0">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer Pagination */}
      <div className="flex items-center justify-between text-sm pt-2">
        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
          SHOWING 1-8 OF 24
        </p>
        
        <div className="flex items-center gap-1">
          <button className="px-3 py-1.5 text-gray-400 font-medium hover:text-gray-900 flex items-center gap-1 transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Prev
          </button>
          
          <button className="w-7 h-7 rounded-md bg-black text-white font-medium flex items-center justify-center">
            1
          </button>
          <button className="w-7 h-7 rounded-md text-gray-600 font-medium flex items-center justify-center hover:bg-gray-100 transition-colors">
            2
          </button>
          <button className="w-7 h-7 rounded-md text-gray-600 font-medium flex items-center justify-center hover:bg-gray-100 transition-colors">
            3
          </button>
          
          <button className="px-3 py-1.5 text-gray-600 font-medium hover:text-gray-900 flex items-center gap-1 transition-colors">
            Next
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
