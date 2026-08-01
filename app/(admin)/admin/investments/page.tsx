"use client";

import { useState } from "react";
import { 
  Search, Bell, Filter, Calendar, ChevronLeft, ChevronRight, Plus, 
  Trash2, PauseCircle, ChevronDown, Check, X
} from "lucide-react";

export default function InvestmentsPage() {
  const [activeView, setActiveView] = useState("dashboard"); // 'dashboard' | 'edit-pool'
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilterStatus, setActiveFilterStatus] = useState('Open');
  const [activeFilterLockin, setActiveFilterLockin] = useState('91-500 days');

  const mockPools = [
    { 
      id: 1, 
      name: "Treasury bills · Q2", 
      desc: "FGN 91-day · UBA broker",
      lockIn: "91 days", 
      capital: "₦5.2M", 
      investors: 42, 
      yield: "11.8%", 
      status: "OPEN", 
      statusColor: "bg-green-100 text-green-700" 
    },
    { 
      id: 2, 
      name: "Lekki land syndicate", 
      desc: "Co-op pool · 24-month lock",
      lockIn: "24 mo", 
      capital: "₦4.6M", 
      investors: 28, 
      yield: "~14%", 
      status: "FUNDING", 
      statusColor: "bg-amber-100 text-amber-700" 
    },
    { 
      id: 3, 
      name: "Stanbic money market", 
      desc: "Open-ended · daily liquid",
      lockIn: "No lock", 
      capital: "₦1.8M", 
      investors: 36, 
      yield: "9.2%", 
      status: "OPEN", 
      statusColor: "bg-green-100 text-green-700" 
    },
    { 
      id: 4, 
      name: "Lagos State bond series", 
      desc: "Sovereign · 5-year · semi-annual",
      lockIn: "5 yrs", 
      capital: "₦820K", 
      investors: 9, 
      yield: "13.4%", 
      status: "CLOSED", 
      statusColor: "bg-red-100 text-red-700" 
    },
  ];

  if (activeView === "edit-pool") {
    return (
      <div className="text-[#111110]">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-semibold tracking-widest text-black/40 uppercase mb-2">
                MODULES / EDIT POOL
              </div>
              <h1 className="text-4xl font-medium tracking-tight">Treasury bills · Q2</h1>
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-2.5 rounded-full bg-white font-medium text-sm border border-black/5 hover:bg-black/5 transition shadow-sm flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Discard
              </button>
              <button 
                onClick={() => setActiveView("dashboard")}
                className="px-6 py-2.5 rounded-full bg-white font-medium text-sm border border-black/5 hover:bg-black/5 transition shadow-sm"
              >
                Cancel
              </button>
              <button 
                onClick={() => setActiveView("dashboard")}
                className="px-6 py-2.5 rounded-full bg-black text-white font-medium text-sm hover:bg-black/80 transition shadow-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4 rotate-45" /> Save changes
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-6">
              
              {/* 01 - IDENTITY */}
              <div>
                <div className="text-xs font-semibold tracking-widest text-black/40 uppercase mb-3 pl-1">
                  01 - IDENTITY
                </div>
                <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm space-y-6">
                  <div>
                    <label className="block text-xs font-semibold tracking-widest text-black/40 uppercase mb-2">
                      POOL NAME
                    </label>
                    <input 
                      type="text" 
                      defaultValue="Treasury bills · Q3" 
                      className="w-full bg-white rounded-xl p-4 border border-black/20 focus:border-black outline-none font-medium text-[15px] transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold tracking-widest text-black/40 uppercase mb-2">
                        ASSET CLASS
                      </label>
                      <div className="relative">
                        <select className="w-full bg-white rounded-xl p-4 border border-black/5 font-medium appearance-none outline-none cursor-pointer">
                          <option>Sovereign · short-term</option>
                        </select>
                        <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-black/40 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold tracking-widest text-black/40 uppercase mb-2">
                        CUSTODIAN
                      </label>
                      <div className="relative">
                        <select className="w-full bg-white rounded-xl p-4 border border-black/5 font-medium appearance-none outline-none cursor-pointer">
                          <option>UBA Treasury</option>
                        </select>
                        <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-black/40 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 02 - TERMS */}
              <div>
                <div className="text-xs font-semibold tracking-widest text-black/40 uppercase mb-3 pl-1 mt-8">
                  02 - TERMS
                </div>
                <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-semibold tracking-widest text-black/40 uppercase mb-2">
                        TARGET CAPITAL
                      </label>
                      <input 
                        type="text" 
                        defaultValue="₦5,000,000" 
                        className="w-full bg-white rounded-xl p-4 border border-black/5 font-medium text-[15px] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold tracking-widest text-black/40 uppercase mb-2">
                        MIN TICKET
                      </label>
                      <input 
                        type="text" 
                        defaultValue="₦25,000" 
                        className="w-full bg-white rounded-xl p-4 border border-black/5 font-medium text-[15px] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold tracking-widest text-black/40 uppercase mb-2">
                        LOCK-IN
                      </label>
                      <input 
                        type="text" 
                        defaultValue="91 days" 
                        className="w-full bg-white rounded-xl p-4 border border-black/5 font-medium text-[15px] outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-widest text-black/40 uppercase mb-2">
                      DISTRIBUTION
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button className="px-5 py-2.5 rounded-full bg-black text-white font-medium text-sm">
                        At maturity
                      </button>
                      <button className="px-5 py-2.5 rounded-full bg-white border border-black/10 font-medium text-sm text-black/60 hover:text-black hover:border-black/20 transition-colors">
                        Quarterly
                      </button>
                      <button className="px-5 py-2.5 rounded-full bg-white border border-black/10 font-medium text-sm text-black/60 hover:text-black hover:border-black/20 transition-colors">
                        Compound
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 03 - MEMBER ELIGIBILITY */}
              <div>
                <div className="text-xs font-semibold tracking-widest text-black/40 uppercase mb-3 pl-1 mt-8">
                  03 - MEMBER ELIGIBILITY
                </div>
                <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
                  <div className="flex flex-wrap gap-2">
                    <button className="px-5 py-2.5 rounded-full bg-white border border-black/20 font-medium text-sm text-black flex items-center gap-2">
                      Tier 2 +
                    </button>
                    <button className="px-5 py-2.5 rounded-full bg-white border border-black/20 font-medium text-sm text-black flex items-center gap-2">
                      12 mo tenure
                    </button>
                    <button className="px-5 py-2.5 rounded-full bg-white border border-black/20 font-medium text-sm text-black flex items-center gap-2">
                      No active loan
                    </button>
                  </div>
                </div>
              </div>

              {/* DANGER ZONE */}
              <div>
                <div className="text-xs font-semibold tracking-widest text-red-500/60 uppercase mb-3 pl-1 mt-8">
                  DANGER ZONE
                </div>
                <div className="bg-white rounded-2xl p-6 border border-red-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-black/5 hover:border-black/10 transition-colors">
                    <div>
                      <div className="font-semibold mb-1">Pause new investments</div>
                      <div className="text-[13px] text-black/50">Hides pool from members. Existing tickets continue to mature.</div>
                    </div>
                    <button className="px-5 py-2 rounded-full bg-white border border-black/20 font-medium text-sm hover:bg-black/5 transition">
                      Pause
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-xl border border-red-100 bg-red-50/30">
                    <div>
                      <div className="font-semibold mb-1">Delete pool</div>
                      <div className="text-[13px] text-black/50">Available only when no active tickets remain. Audit log retained.</div>
                    </div>
                    <button className="px-5 py-2 rounded-full bg-red-800 text-white font-medium text-sm hover:bg-red-900 transition shadow-sm">
                      Delete pool
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Right side info panel */}
            <div>
              <div className="sticky top-8 space-y-4">
                <div className="bg-[#111110] text-white rounded-3xl p-6 md:p-8 shadow-xl">
                  <div className="text-[10px] font-semibold tracking-widest text-white/50 uppercase mb-6 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    LIVE PERFORMANCE
                  </div>
                  
                  <h3 className="text-xl font-medium mb-8">Treasury bills · Q2</h3>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                      <span className="text-[13px] text-white/60">Capital raised</span>
                      <span className="font-medium text-[15px]">₦5.20M</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                      <span className="text-[13px] text-white/60">Investors</span>
                      <span className="font-medium text-[15px]">42</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                      <span className="text-[13px] text-white/60">Realised yield</span>
                      <span className="font-medium text-[15px]">11.8%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] text-white/60">Maturity</span>
                      <span className="font-medium text-[15px]">Jul 31 - 2026</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm">
                  <div className="text-xs font-semibold tracking-widest text-black/40 uppercase mb-3">
                    EDITS AFFECT FUTURE TICKS
                  </div>
                  <p className="text-[13px] text-black/60 leading-relaxed">
                    Existing investors keep current terms. New tickets follow your edits.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
    );
  }

  // Dashboard View
  return (
    <div className="text-[#111110]">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="text-xs font-semibold tracking-widest text-black/40 uppercase mb-2">
              MODULES / INVESTMENTS
            </div>
            <h1 className="text-5xl font-medium tracking-tight">Investment pools</h1>
          </div>
          <div className="flex items-center gap-3 relative">
            <button className="px-4 py-2.5 rounded-full bg-white flex items-center gap-2 font-medium text-sm border border-black/5 hover:bg-black/5 transition shadow-sm">
              <Calendar className="w-4 h-4 text-black/50" /> FY 2026
            </button>
            <div className="relative">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`px-6 py-2.5 rounded-full flex items-center gap-2 font-medium text-sm border transition shadow-sm ${
                  isFilterOpen ? 'bg-black text-white border-black' : 'bg-white border-black/5 hover:bg-black/5'
                }`}
              >
                Filter
              </button>
              
              {/* Filter Popover */}
              {isFilterOpen && (
                <div className="absolute top-full right-0 mt-2 w-[320px] bg-white rounded-3xl shadow-xl border border-black/5 p-6 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="text-[10px] font-semibold tracking-widest text-black/40 uppercase mb-4">
                    FILTER POOLS
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-3">Status</label>
                    <div className="flex flex-wrap gap-2">
                      {['Open', 'Funding', 'Closed'].map(status => (
                        <button 
                          key={status}
                          onClick={() => setActiveFilterStatus(status)}
                          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                            activeFilterStatus === status 
                              ? 'bg-black text-white' 
                              : 'bg-white border border-black/10 text-black/60 hover:border-black/20'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-8">
                    <label className="block text-sm font-medium mb-3">Lock-in period</label>
                    <div className="flex flex-wrap gap-2">
                      {['≤ 90 days', '91-500 days', '5 yr+'].map(period => (
                        <button 
                          key={period}
                          onClick={() => setActiveFilterLockin(period)}
                          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                            activeFilterLockin === period 
                              ? 'bg-black text-white' 
                              : 'bg-white border border-black/10 text-black/60 hover:border-black/20'
                          }`}
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button className="text-sm font-medium text-black/50 hover:text-black transition">
                      Reset
                    </button>
                    <button 
                      onClick={() => setIsFilterOpen(false)}
                      className="px-6 py-2 rounded-full bg-black text-white text-sm font-medium hover:bg-black/80 transition"
                    >
                      Apply filters
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button className="px-6 py-2.5 rounded-full bg-black text-white font-medium text-sm hover:bg-black/80 transition shadow-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> New pool
            </button>
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-12 py-8 border-b border-t border-black/5">
          <div>
            <div className="text-[10px] font-semibold tracking-widest text-black/40 uppercase mb-2">CAPITAL UNDER MGMT</div>
            <div className="text-3xl md:text-[40px] font-semibold tracking-tight">₦12.4M</div>
          </div>
          <div>
            <div className="text-[10px] font-semibold tracking-widest text-black/40 uppercase mb-2">YTD RETURN</div>
            <div className="text-3xl md:text-[40px] font-semibold tracking-tight">+ 9.4%</div>
          </div>
          <div>
            <div className="text-[10px] font-semibold tracking-widest text-black/40 uppercase mb-2">INVESTORS</div>
            <div className="text-3xl md:text-[40px] font-semibold tracking-tight">94</div>
          </div>
          <div>
            <div className="text-[10px] font-semibold tracking-widest text-black/40 uppercase mb-2">NEXT PAYOUT</div>
            <div className="text-3xl md:text-[40px] font-semibold tracking-tight">Jul 31</div>
          </div>
        </div>

        {/* Pools Table/List */}
        <div className="bg-white/40 rounded-3xl p-2 md:p-6 border border-black/5 shadow-sm">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 text-[10px] font-semibold tracking-widest text-black/40 uppercase">
            <div className="col-span-4">POOL</div>
            <div className="col-span-2 text-center">LOCK-IN</div>
            <div className="col-span-2 text-center">CAPITAL</div>
            <div className="col-span-2 text-center">INVESTORS</div>
            <div className="col-span-1 text-center">YIELD</div>
            <div className="col-span-1 text-right pr-2">STATUS</div>
          </div>

          {/* Table Rows */}
          <div className="space-y-2">
            {mockPools.map((pool) => (
              <div 
                key={pool.id}
                onClick={() => setActiveView("edit-pool")}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6 bg-white rounded-2xl items-center cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all border border-black/5"
              >
                <div className="col-span-4">
                  <div className="font-semibold text-[15px] mb-0.5">{pool.name}</div>
                  <div className="text-xs text-black/50">{pool.desc}</div>
                </div>
                
                <div className="col-span-2 flex justify-between md:block md:text-center mt-4 md:mt-0">
                  <span className="md:hidden text-xs text-black/40 uppercase tracking-wider font-semibold">Lock-in</span>
                  <span className="text-[15px] font-medium text-black/80">{pool.lockIn}</span>
                </div>
                
                <div className="col-span-2 flex justify-between md:block md:text-center mt-2 md:mt-0">
                  <span className="md:hidden text-xs text-black/40 uppercase tracking-wider font-semibold">Capital</span>
                  <span className="text-[15px] font-semibold">{pool.capital}</span>
                </div>
                
                <div className="col-span-2 flex justify-between md:block md:text-center mt-2 md:mt-0">
                  <span className="md:hidden text-xs text-black/40 uppercase tracking-wider font-semibold">Investors</span>
                  <span className="text-[15px] font-medium text-black/80">{pool.investors}</span>
                </div>
                
                <div className="col-span-1 flex justify-between md:block md:text-center mt-2 md:mt-0">
                  <span className="md:hidden text-xs text-black/40 uppercase tracking-wider font-semibold">Yield</span>
                  <span className="text-[15px] font-medium text-black/80">{pool.yield}</span>
                </div>
                
                <div className="col-span-1 flex justify-between md:justify-end items-center mt-4 md:mt-0">
                  <span className="md:hidden text-xs text-black/40 uppercase tracking-wider font-semibold">Status</span>
                  <span className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-widest uppercase ${pool.statusColor}`}>
                    {pool.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-8 px-4">
            <div className="text-[10px] font-semibold tracking-widest text-black/40 uppercase">
              SHOWING 1-4 OF 12
            </div>
            <div className="flex items-center gap-1">
              <button className="px-3 py-1.5 text-sm font-medium text-black/40 hover:text-black transition">
                &lt; Prev
              </button>
              <button className="w-8 h-8 rounded-lg bg-black text-white text-sm font-medium flex items-center justify-center">
                1
              </button>
              <button className="w-8 h-8 rounded-lg text-sm font-medium hover:bg-black/5 flex items-center justify-center transition bg-white border border-black/5">
                2
              </button>
              <button className="w-8 h-8 rounded-lg text-sm font-medium hover:bg-black/5 flex items-center justify-center transition bg-white border border-black/5">
                3
              </button>
              <button className="px-3 py-1.5 text-sm font-medium hover:bg-black/5 transition rounded-lg text-black">
                Next &gt;
              </button>
            </div>
          </div>
        </div>
    </div>
  );
}
