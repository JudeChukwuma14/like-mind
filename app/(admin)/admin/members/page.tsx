"use client";

import { useState } from "react";
import Link from "next/link";

const members = [
  {
    initials: "BO",
    name: "Bisi Olatunji",
    id: "LM-3380",
    role: "Member",
    balance: "₦485,200",
    cycle: "Apr - paid",
    status: null,
    bgColor: "bg-gray-800",
  },
  {
    initials: "AO",
    name: "Adaeze Okonkwo",
    id: "LM-9821",
    role: "Secretary",
    balance: "₦1,210,800",
    cycle: "Apr - paid",
    status: null,
    bgColor: "bg-gray-200 text-gray-700",
  },
  {
    initials: "CO",
    name: "Chinedu Okeke",
    id: "LM-4421",
    role: "Member",
    balance: "₦62,400",
    cycle: "Apr - loan",
    status: null,
    bgColor: "bg-gray-200 text-gray-700",
  },
  {
    initials: "TA",
    name: "Tomi Adesanya",
    id: "LM-7798",
    role: "Member",
    balance: "₦298,500",
    cycle: "Apr - pending",
    status: { text: "ACTIVE", type: "active" },
    bgColor: "bg-gray-200 text-gray-700",
  },
  {
    initials: "SK",
    name: "Sade Kuti",
    id: "LM-2218",
    role: "Treasurer",
    balance: "₦892,140",
    cycle: "Apr - paid",
    status: { text: "ACTIVE", type: "active" },
    bgColor: "bg-gray-200 text-gray-700",
  },
  {
    initials: "JN",
    name: "Jide Ndubuisi",
    id: "LM-5512",
    role: "Member",
    balance: "₦144,300",
    cycle: "Mar - overdue",
    status: { text: "OVERDUE", type: "overdue" },
    bgColor: "bg-gray-200 text-gray-700",
  },
  {
    initials: "RU",
    name: "Ronke Udom",
    id: "LM-6240",
    role: "Member",
    balance: "₦210,000",
    cycle: "Apr - paid",
    status: { text: "ACTIVE", type: "active" },
    bgColor: "bg-gray-200 text-gray-700",
  },
  {
    initials: "NA",
    name: "Ngozi Adesanya",
    id: "LM-7798",
    role: "Loan officer",
    balance: "₦1,486,000",
    cycle: "Apr - paid",
    status: { text: "ACTIVE", type: "active" },
    bgColor: "bg-gray-200 text-gray-700",
  },
];

export default function MembersPage() {
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">
            DIRECTORY
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Members
          </h1>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          <button className="px-4 py-2 rounded-full border border-gray-200 bg-white text-sm font-medium hover:bg-gray-50 transition-colors">
            Export
          </button>
          <button className="px-4 py-2 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm">
            Add member
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-gray-200">
        <button className="pb-3 border-b-2 border-black flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900">Directory</span>
          <span className="px-1.5 py-0.5 rounded bg-gray-900 text-white text-[10px] font-bold">178</span>
        </button>
        <button className="pb-3 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700">
          Share capital
        </button>
      </div>

      {/* Sub Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-2">
        <div className="flex items-center gap-4 sm:gap-8 flex-wrap">
          <div>
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">
              ACTIVE
            </p>
            <p className="text-2xl font-bold text-gray-900">178</p>
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">
              SUSPENDED
            </p>
            <p className="text-2xl font-bold text-gray-900">4</p>
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">
              OUTSTANDING
            </p>
            <p className="text-2xl font-bold text-gray-900">27</p>
          </div>
        </div>

        <div className="flex items-center gap-2 relative">
          <button className="px-4 py-2 rounded-full border border-gray-200 bg-white text-sm font-medium hover:bg-gray-50 transition-colors">
            All roles
          </button>
          <button 
            onClick={() => setFilterOpen(!filterOpen)}
            className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${filterOpen ? 'bg-gray-100 border-gray-300' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
          >
            Status
          </button>

          {/* Filter Dropdown */}
          {filterOpen && (
            <div className="absolute top-12 right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-5 z-50">
              <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-4">
                FILTER BY ROLE
              </p>
              
              <div className="space-y-3 mb-6">
                {[
                  { label: "Super admin", count: 2, checked: true },
                  { label: "Treasurer", count: 2, checked: true },
                  { label: "Secretary", count: 3, checked: true },
                  { label: "Credit Officer", count: 4, checked: false },
                  { label: "Auditor", count: 2, checked: false },
                  { label: "Member", count: 167, checked: false },
                ].map((role) => (
                  <label key={role.label} className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${role.checked ? 'bg-black' : 'bg-white border border-gray-300 group-hover:border-gray-400'}`}>
                        {role.checked && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm ${role.checked ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                        {role.label}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">{role.count}</span>
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button 
                  onClick={() => setFilterOpen(false)}
                  className="text-sm text-gray-500 hover:text-gray-900 font-medium"
                >
                  Clear
                </button>
                <button 
                  onClick={() => setFilterOpen(false)}
                  className="px-4 py-2 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors shadow-sm"
                >
                  Show 5
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mt-2">
        <div className="grid grid-cols-12 gap-2 sm:gap-4 px-4 sm:px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="col-span-5 md:col-span-3 text-[10px] font-bold tracking-widest text-gray-400 uppercase">MEMBER</div>
          <div className="col-span-3 hidden md:block text-[10px] font-bold tracking-widest text-gray-400 uppercase">ROLE</div>
          <div className="col-span-3 text-[10px] font-bold tracking-widest text-gray-400 uppercase">BALANCE</div>
          <div className="col-span-4 md:col-span-3 text-[10px] font-bold tracking-widest text-gray-400 uppercase text-right sm:text-left pr-4 sm:pr-0">CYCLE</div>
        </div>
        
        <div className="divide-y divide-gray-100">
          {members.map((m, i) => (
            <Link 
              href="#" 
              key={i}
              className="grid grid-cols-12 gap-2 sm:gap-4 items-center p-4 px-4 sm:px-6 transition-colors hover:bg-gray-50 group"
            >
              <div className="col-span-5 md:col-span-3 flex items-center gap-3 sm:gap-4">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold text-white shrink-0 ${m.bgColor}`}>
                  {m.initials}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 text-sm sm:text-base truncate">{m.name}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 truncate">{m.id}</p>
                </div>
              </div>
              
              <div className="col-span-3 hidden md:block text-sm font-medium text-gray-700">
                {m.role}
              </div>
              
              <div className="col-span-3 text-xs sm:text-sm font-bold text-gray-900 truncate">
                {m.balance}
              </div>
              
              <div className="col-span-4 md:col-span-3 flex items-center justify-end sm:justify-between ml-auto w-full">
                <div className="flex items-center gap-2 sm:gap-4 justify-end w-full sm:w-auto">
                  <span className="text-xs sm:text-sm font-medium text-gray-600 truncate">{m.cycle}</span>
                  {m.status && (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase hidden xl:block ${
                      m.status.type === 'active' 
                        ? 'bg-[#bbf7d0]/50 text-green-800' 
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {m.status.text}
                    </span>
                  )}
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-black transition-colors shrink-0 ml-1 sm:ml-2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
