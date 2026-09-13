"use client";

import { useState } from "react";
import { 
  Calendar, Filter, CheckCircle2, Info, X, Check
} from "lucide-react";

export default function LoansPage() {
  const [activeTab, setActiveTab] = useState("approvals"); // 'approvals' | 'offers' | 'cosign'
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilterStatus, setActiveFilterStatus] = useState('Eligible');
  const [selectedApp, setSelectedApp] = useState<number | null>(1);
  const [showCosignModal, setShowCosignModal] = useState(false);

  // Mock data
  const mockApplications = [
    { id: 1, name: "Folake Adeleke", type: "School fees · 12 months", amount: "$180,000", badge: "TIER 2", badgeColor: "text-amber-700 bg-amber-100", selected: true },
    { id: 2, name: "Emeka Obi", type: "Business inventory · 8 months", amount: "$320,000", badge: "TIER 1", badgeColor: "text-amber-700 bg-amber-100", selected: false },
    { id: 3, name: "Ngozi Adesanya", type: "Personal · 6 months", amount: "$75,000", badge: "INSUFFICIENT", badgeColor: "text-black/50 bg-black/5", selected: false },
  ];

  const mockOffers = [
    { id: 1, name: "School fees", desc: "Short-term loan timed to school fee season. Auto-deducted from contributions.", rate: "3.5%", term: "12 mo", cap: "$200k", guarantor: "50%", outstanding: "$1.4M OUTSTANDING" },
    { id: 2, name: "Business inventory", desc: "Bridges working capital for vendors and small business owners.", rate: "5%", term: "8 mo", cap: "$500k", guarantor: "60%", outstanding: "$2.1M OUTSTANDING" },
    { id: 3, name: "Personal", desc: "Everyday cash relief for established members.", rate: "4%", term: "6 mo", cap: "$100k", guarantor: "50%", outstanding: "$820K OUTSTANDING" },
    { id: 4, name: "Emergency", desc: "Same-day disbursement for medical or family emergencies.", rate: "2.5%", term: "3 mo", cap: "$75k", guarantor: "0%", outstanding: "WINTER FREEZE" },
  ];

  const mockCosigns = [
    { id: 1, init: "FA", name: "Folake Adeleke", desc: "School fees · 12 months", amount: "$180,000", sigs: 1, totalSigs: 3, status: "AWAITING YOU", statusColor: "bg-amber-100 text-amber-700", action: "Cosign" },
    { id: 2, init: "EO", name: "Emeka Obi", desc: "Business inventory · 8 months", amount: "$320,000", sigs: 0, totalSigs: 3, status: "AWAITING YOU", statusColor: "bg-amber-100 text-amber-700", action: "Cosign" },
    { id: 3, init: "NA", name: "Ngozi Adesanya", desc: "Personal · 6 months", amount: "$75,000", sigs: 2, totalSigs: 3, status: "YOU SIGNED", statusColor: "bg-green-100 text-green-700", action: "Waiting" },
    { id: 4, init: "CO", name: "Chinedu Okeke", desc: "Home repair · 18 months", amount: "$240,000", sigs: 2, totalSigs: 3, status: "YOU SIGNED", statusColor: "bg-green-100 text-green-700", action: "Waiting" },
  ];

  return (
    <div className="text-[#111110] relative">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6">
        <div>
          <div className="text-xs font-semibold tracking-widest text-black/40 uppercase mb-2">
            LOANS
          </div>
          <h1 className="text-5xl font-medium tracking-tight">Loans</h1>
        </div>
        
        {/* Top actions - change based on tab */}
        {activeTab === 'approvals' && (
          <div className="flex flex-wrap items-center gap-3 relative">
            <button className="px-4 py-2.5 rounded-full bg-white flex items-center gap-2 font-medium text-sm border border-black/5 hover:bg-black/5 transition shadow-sm">
              <Calendar className="w-4 h-4 text-black/50" /> Apr 1 – 30
            </button>
            <div className="relative">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`px-5 py-2.5 rounded-full flex items-center gap-2 font-medium text-sm border transition shadow-sm ${
                  isFilterOpen ? 'bg-black text-white border-black' : 'bg-white border-black/5 hover:bg-black/5'
                }`}
              >
                <Filter className="w-4 h-4" /> Tier · status
              </button>
              
              {/* Filter Popover */}
              {isFilterOpen && (
                <div className="absolute top-full right-0 mt-2 w-[280px] bg-white rounded-3xl shadow-xl border border-black/5 p-6 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="text-[10px] font-semibold tracking-widest text-black/40 uppercase mb-4">
                    FILTER LOANS
                  </div>
                  
                  <div className="mb-8">
                    <label className="block text-sm font-medium mb-3">Status</label>
                    <div className="flex flex-wrap gap-2">
                      {['Eligible', 'Pending', 'Insufficient'].map(status => (
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

                  <div className="flex items-center justify-between mt-2">
                    <button className="text-sm font-medium text-black/40 hover:text-black transition">
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
            <button className="px-5 py-2.5 rounded-full bg-white font-medium text-sm border border-black/5 hover:bg-black/5 transition shadow-sm">
              Issue manual loan
            </button>
            <button className="px-6 py-2.5 rounded-full bg-black text-white font-medium text-sm hover:bg-black/80 transition shadow-sm">
              Run eligibility
            </button>
          </div>
        )}

        {activeTab === 'offers' && (
          <div className="flex items-center gap-3">
            <button className="px-5 py-2.5 rounded-full bg-white font-medium text-sm border border-black/5 hover:bg-black/5 transition shadow-sm">
              Filter
            </button>
            <button className="px-6 py-2.5 rounded-full bg-black text-white font-medium text-sm hover:bg-black/80 transition shadow-sm">
              Create offer
            </button>
          </div>
        )}

        {activeTab === 'cosign' && (
          <div className="flex items-center gap-3">
            <button className="px-4 py-2.5 rounded-full bg-white flex items-center gap-2 font-medium text-sm border border-black/5 hover:bg-black/5 transition shadow-sm">
              <Calendar className="w-4 h-4 text-black/50" /> Apr 1 – 30
            </button>
            <button className="px-4 py-2.5 rounded-full bg-white flex items-center gap-2 font-medium text-sm border border-black/5 hover:bg-black/5 transition shadow-sm">
              <Filter className="w-4 h-4 text-black/50" />
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-black/10 mb-8 overflow-x-auto hide-scrollbar">
        {[
          { id: 'approvals', label: 'Approvals', count: 3, badgeColor: 'bg-black text-white' },
          { id: 'offers', label: 'Offers', count: 4, badgeColor: 'bg-black text-white' },
          { id: 'cosign', label: 'Cosign', count: 2, badgeColor: 'bg-[#E8D94B] text-black' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 text-[15px] font-medium transition-colors relative whitespace-nowrap flex items-center gap-2 ${
              activeTab === tab.id ? 'text-black' : 'text-black/40 hover:text-black/70'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === tab.id ? tab.badgeColor : 'bg-black/10 text-black/50'
              }`}>
                {tab.count}
              </span>
            )}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-black" />
            )}
          </button>
        ))}
      </div>

      {/* Top Stats for Approvals & Offers */}
      {(activeTab === 'approvals' || activeTab === 'offers') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-12 py-8 border-b border-black/5">
          <div>
            <div className="text-[10px] font-semibold tracking-widest text-black/40 uppercase mb-2">OUTSTANDING</div>
            <div className="text-3xl md:text-[40px] font-semibold tracking-tight">$3.62M</div>
          </div>
          <div>
            <div className="text-[10px] font-semibold tracking-widest text-black/40 uppercase mb-2">AVAILABLE CAPITAL</div>
            <div className="text-3xl md:text-[40px] font-semibold tracking-tight">$8.78M</div>
          </div>
        </div>
      )}

      {/* Top Stats for Cosign */}
      {activeTab === 'cosign' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-12 py-8 border-b border-black/5">
          <div>
            <div className="text-[10px] font-semibold tracking-widest text-black/40 uppercase mb-2">AWAITING YOUR COSIGN</div>
            <div className="text-3xl md:text-[40px] font-semibold tracking-tight">2</div>
          </div>
          <div>
            <div className="text-[10px] font-semibold tracking-widest text-black/40 uppercase mb-2">PENDING ALL ADMINS</div>
            <div className="text-3xl md:text-[40px] font-semibold tracking-tight">5</div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* APPROVALS TAB CONTENT */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'approvals' && (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.5fr] gap-8 items-start">
          {/* List Pane */}
          <div>
            <div className="text-[10px] font-semibold tracking-widest text-black/40 uppercase mb-4 pl-1">
              PENDING APPLICATIONS - 3
            </div>
            <div className="flex flex-col gap-2">
              {mockApplications.map((app) => (
                <div 
                  key={app.id}
                  onClick={() => setSelectedApp(app.id)}
                  className={`p-5 rounded-2xl flex items-center justify-between cursor-pointer transition-colors border ${
                    selectedApp === app.id 
                      ? 'bg-gradient-to-r from-[#FEFBE8] to-white border-[#E8D94B]/40 shadow-sm' 
                      : 'bg-white border-transparent hover:border-black/10 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Minimal left bar indicator for selected state could go here, omitting to match design */}
                    <div>
                      <div className="font-semibold text-[15px] mb-0.5">{app.name}</div>
                      <div className="text-xs text-black/50">{app.type}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-[15px] mb-1">{app.amount}</div>
                    <div className={`text-[10px] font-bold tracking-widest ${app.badgeColor}`}>
                      {app.badge}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Details Pane */}
          {selectedApp && (
            <div className="bg-white rounded-3xl p-6 md:p-10 border border-black/5 shadow-sm xl:sticky xl:top-24">
              <div className="text-[10px] font-semibold tracking-widest text-black/40 uppercase mb-3">
                SCHOOL FEES
              </div>
              <h2 className="text-4xl font-semibold tracking-tight mb-2">Folake Adeleke</h2>
              <p className="text-[15px] text-black/60 mb-10">
                Member since Aug 2023 · 4 prior loans repaid on time
              </p>

              {/* Stats Boxes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                <div className="bg-[#FAF9F5] border border-black/5 rounded-2xl p-6 text-center">
                  <div className="text-[10px] font-semibold tracking-widest text-black/40 uppercase mb-2">REQUESTED</div>
                  <div className="text-2xl font-semibold">$180,000</div>
                </div>
                <div className="bg-[#FAF9F5] border border-black/5 rounded-2xl p-6 text-center">
                  <div className="text-[10px] font-semibold tracking-widest text-black/40 uppercase mb-2">MONTHLY</div>
                  <div className="text-2xl font-semibold">$16,500</div>
                </div>
                <div className="bg-[#FAF9F5] border border-black/5 rounded-2xl p-6 text-center">
                  <div className="text-[10px] font-semibold tracking-widest text-black/40 uppercase mb-2">TOTAL PAYBACK</div>
                  <div className="text-2xl font-semibold">$198,000</div>
                </div>
              </div>

              {/* Checklist */}
              <div className="space-y-6 mb-12">
                <div className="flex justify-between items-center text-[15px]">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-black" strokeWidth={2} />
                    <span className="font-medium">Contribution history <span className="font-normal text-black/60">- 18 months on schedule</span></span>
                  </div>
                  <span className="text-[10px] font-semibold tracking-widest text-black/40 uppercase">PASS</span>
                </div>
                <div className="flex justify-between items-center text-[15px]">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-black" strokeWidth={2} />
                    <span className="font-medium">Debt-to-income ratio <span className="font-normal text-black/60">- 18%</span></span>
                  </div>
                  <span className="text-[10px] font-semibold tracking-widest text-black/40 uppercase">PASS</span>
                </div>
                <div className="flex justify-between items-center text-[15px]">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-black" strokeWidth={2} />
                    <span className="font-medium">Guarantor verified <span className="font-normal text-black/60">- Adaeze Okonkwo</span></span>
                  </div>
                  <span className="text-[10px] font-semibold tracking-widest text-black/40 uppercase">PASS</span>
                </div>
                <div className="flex justify-between items-center text-[15px]">
                  <div className="flex items-center gap-3">
                    <Info className="w-5 h-5 text-black/40" strokeWidth={2} />
                    <span className="font-medium text-black/60">Existing repayment <span className="font-normal">- $8,200/mo on prior loan</span></span>
                  </div>
                  <span className="text-[10px] font-semibold tracking-widest text-black/40 uppercase">NOTE</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => setShowCosignModal(true)}
                  className="px-8 py-3.5 rounded-full bg-black text-white font-medium text-[15px] hover:bg-black/80 transition shadow-sm"
                >
                  Approve loan
                </button>
                <button className="px-8 py-3.5 rounded-full bg-white font-medium text-[15px] border border-black/10 hover:bg-black/5 transition shadow-sm">
                  Adjust terms
                </button>
                <button className="px-8 py-3.5 rounded-full bg-white font-medium text-[15px] border border-black/10 hover:bg-black/5 transition shadow-sm text-black/60 ml-auto">
                  Reject
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* OFFERS TAB CONTENT */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'offers' && (
        <div>
          <div className="text-[10px] font-semibold tracking-widest text-black/40 uppercase mb-4 pl-1">
            ACTIVE OFFERS - 4
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockOffers.map((offer) => (
              <div key={offer.id} className="bg-white rounded-3xl p-6 md:p-8 border border-black/5 shadow-sm flex flex-col h-full">
                <h3 className="text-2xl font-semibold mb-2">{offer.name}</h3>
                <p className="text-[15px] text-black/60 mb-8 min-h-[44px]">
                  {offer.desc}
                </p>
                
                <div className="grid grid-cols-4 gap-4 mb-8">
                  <div>
                    <div className="text-[10px] font-semibold tracking-widest text-black/40 uppercase mb-1">RATE</div>
                    <div className="font-semibold text-lg">{offer.rate}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold tracking-widest text-black/40 uppercase mb-1">TERM</div>
                    <div className="font-semibold text-lg">{offer.term}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold tracking-widest text-black/40 uppercase mb-1">CAP</div>
                    <div className="font-semibold text-lg">{offer.cap}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold tracking-widest text-black/40 uppercase mb-1">GUARANTOR</div>
                    <div className="font-semibold text-lg">{offer.guarantor}</div>
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between pt-6 border-t border-black/5">
                  <div className="text-[10px] font-semibold tracking-widest text-black/40 uppercase">
                    {offer.outstanding}
                  </div>
                  <div className="flex gap-2">
                    <button className="px-5 py-2 rounded-full bg-white font-medium text-sm border border-black/10 hover:bg-black/5 transition">
                      Edit
                    </button>
                    <button className="px-5 py-2 rounded-full bg-white font-medium text-sm border border-black/10 hover:bg-black/5 transition text-black/60">
                      Disable
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* COSIGN TAB CONTENT */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'cosign' && (
        <div className="bg-white/40 rounded-3xl p-2 md:p-6 border border-black/5 shadow-sm">
          <div className="flex justify-between items-center px-4 md:px-6 py-4 mb-2">
            <div className="text-[10px] font-semibold tracking-widest text-black/40 uppercase">
              LOANS AWAITING YOUR COSIGN
            </div>
            <div className="text-[10px] font-semibold tracking-widest text-black/40 uppercase hidden md:block">
              Disburse only after all 3 admins sign
            </div>
          </div>

          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 text-[10px] font-semibold tracking-widest text-black/40 uppercase">
            <div className="col-span-4">MEMBER · PURPOSE</div>
            <div className="col-span-3 text-center">AMOUNT</div>
            <div className="col-span-2 text-center">SIGNATURES</div>
            <div className="col-span-3 text-right pr-2">STATUS</div>
          </div>

          {/* Table Rows */}
          <div className="space-y-2">
            {mockCosigns.map((item) => (
              <div 
                key={item.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6 bg-white rounded-2xl items-center border border-black/5 shadow-sm"
              >
                <div className="col-span-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-medium text-sm shrink-0">
                    {item.init}
                  </div>
                  <div>
                    <div className="font-semibold text-[15px] mb-0.5">{item.name}</div>
                    <div className="text-xs text-black/50">{item.desc}</div>
                  </div>
                </div>
                
                <div className="col-span-3 flex justify-between md:block md:text-center mt-4 md:mt-0">
                  <span className="md:hidden text-xs text-black/40 uppercase tracking-wider font-semibold">Amount</span>
                  <span className="text-[15px] font-semibold">{item.amount}</span>
                </div>
                
                <div className="col-span-2 flex justify-between md:flex-col md:items-center mt-2 md:mt-0">
                  <span className="md:hidden text-xs text-black/40 uppercase tracking-wider font-semibold">Signatures</span>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[...Array(item.totalSigs)].map((_, i) => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < item.sigs ? 'bg-black' : 'bg-black/20'}`}></div>
                      ))}
                    </div>
                    <span className="text-xs font-medium text-black/60">{item.sigs}/{item.totalSigs}</span>
                  </div>
                </div>
                
                <div className="col-span-3 flex justify-between md:justify-end items-center mt-4 md:mt-0 gap-4">
                  <span className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-widest uppercase ${item.statusColor}`}>
                    {item.status}
                  </span>
                  
                  {item.action === "Cosign" ? (
                    <button className="px-6 py-2.5 rounded-full bg-black text-white font-medium text-sm hover:bg-black/80 transition">
                      Cosign
                    </button>
                  ) : (
                    <div className="px-4 py-2.5 flex items-center gap-2 text-sm font-medium text-black/60">
                      <Check className="w-4 h-4" /> Waiting
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* COSIGN MODAL OVERLAY */}
      {/* ───────────────────────────────────────────────────────────── */}
      {showCosignModal && (
        <div 
          className="fixed top-0 right-0 bottom-0 z-50 flex items-center justify-center p-4"
          style={{
            left: 0,
            marginLeft: `var(--admin-sidebar-offset, 0px)`,
          }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCosignModal(false)}></div>
          
          <div className="relative bg-[#F5F3EC] w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 md:p-10">
              <div className="flex justify-between items-start mb-8">
                <div className="text-[10px] font-semibold tracking-widest text-black/40 uppercase">
                  LOANS / APPROVALS / FOLAKE ADELEKE
                </div>
                <button 
                  onClick={() => setShowCosignModal(false)}
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-black/5 hover:bg-black/5 transition text-black/60 hover:text-black"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-[10px] font-semibold tracking-widest text-black/40 uppercase mb-2">
                    SCHOOL FEES OFFER · TIER 2
                  </div>
                  <div className="text-[40px] font-semibold tracking-tight">
                    $180,000
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-[#E8D94B] text-black text-[10px] font-bold tracking-widest uppercase mt-6">
                  AWAITING COSIGN
                </div>
              </div>
              
              <div className="text-[15px] text-black/60 mb-10">
                Folake Adeleke · 12 months · $16,500/mo
              </div>

              {/* Admin signatures */}
              <div className="mb-10">
                <div className="text-[10px] font-semibold tracking-widest text-black/40 uppercase mb-4">
                  3 ADMINS REQUIRED · 1 / 3
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Signed */}
                  <div className="bg-[#FAF9F5] border border-black/20 rounded-2xl p-4 relative shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-medium text-xs">
                        AO
                      </div>
                      <div>
                        <div className="font-semibold text-sm">Adaeze Okonkwo</div>
                        <div className="text-[11px] text-black/50 leading-tight mt-0.5">Secretary · Apr 30, 09:14</div>
                      </div>
                    </div>
                    <Check className="w-4 h-4 absolute top-4 right-4 text-black" strokeWidth={3} />
                  </div>
                  
                  {/* Pending */}
                  <div className="bg-white border border-black/10 border-dashed rounded-2xl p-4 opacity-70">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-black/5 text-black/40 flex items-center justify-center font-medium text-xs">
                        SK
                      </div>
                      <div>
                        <div className="font-semibold text-sm">Sade Kuti</div>
                        <div className="text-[11px] text-black/50 leading-tight mt-0.5">Treasurer · pending</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Pending */}
                  <div className="bg-white border border-black/10 border-dashed rounded-2xl p-4 opacity-70">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-black/5 text-black/40 flex items-center justify-center font-medium text-xs">
                        NA
                      </div>
                      <div>
                        <div className="font-semibold text-sm">Ngozi Adesanya</div>
                        <div className="text-[11px] text-black/50 leading-tight mt-0.5">Loan officer · pending</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guarantor block */}
              <div className="mb-12">
                <div className="text-[10px] font-semibold tracking-widest text-black/40 uppercase mb-4">
                  GUARANTOR
                </div>
                <div className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm">
                  <div className="flex justify-between items-start border-b border-black/5 pb-6 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-medium">
                        AO
                      </div>
                      <div>
                        <div className="font-semibold text-[15px]">Adaeze Okonkwo</div>
                        <div className="text-sm text-black/50">adezuo@gmail.com</div>
                      </div>
                    </div>
                    <div className="px-2.5 py-1 rounded bg-green-100 text-green-800 text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>
                      VERIFIED
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[15px] text-black/60">Required hold (50% of $180,000)</span>
                      <span className="font-semibold">$90,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[15px] text-black/60">Available balance</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">$1,210,800</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E8D94B]/30 text-black">13.5× MIN</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer actions */}
              <div className="flex items-center justify-between pt-6 border-t border-black/5">
                <div className="text-sm text-black/50 font-medium">
                  Disburse only after all 3 admins sign.
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowCosignModal(false)}
                    className="px-6 py-3 rounded-full bg-white font-medium text-sm border border-black/5 hover:bg-black/5 transition"
                  >
                    Reject
                  </button>
                  <button 
                    onClick={() => setShowCosignModal(false)}
                    className="px-8 py-3 rounded-full bg-black text-white font-medium text-sm hover:bg-black/80 transition shadow-sm"
                  >
                    Cosign
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
