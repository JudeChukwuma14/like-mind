"use client";

const logs = [
  {
    time: "09:42 WAT",
    badge: { text: "PAYMENT CONFIRMED", type: "warning" },
    description: "Adaeze Okonkwo - $50,000 to personal savings - TX-4471",
    actor: "Mary Olufor - admin",
  },
  {
    time: "09:18 WAT",
    badge: { text: "APPLICATION APPROVED", type: "neutral" },
    description: "Member Adachi Nwosu activated",
    actor: "Mary Olufor - admin",
  },
  {
    time: "08:52 WAT",
    badge: { text: "LOAN APPROVED", type: "neutral" },
    description: "Folake Adeleke - $180,000 - 12 months",
    actor: "Chidi Eze - loan officer",
  },
  {
    time: "08:30 WAT",
    badge: { text: "RECORD EDITED", type: "neutral" },
    description: "Bisi Olatunji bank account updated - old ending 4471 -> 9881",
    actor: "Adaeze Okonkwo - secretary",
  },
  {
    time: "07:55 WAT",
    badge: { text: "ROLE CHANGED", type: "neutral" },
    description: "User T. Balogun granted loan-officer permission",
    actor: "Adeyera Triumph - super",
  },
  {
    time: "07:21 WAT",
    badge: { text: "FAILED SIGN-IN", type: "danger" },
    description: "3 attempts on admin@likemind.coop - IP locked for 30 min",
    actor: "Unknown - 102.89.1.22",
  },
  {
    time: "06:48 WAT",
    badge: { text: "REPORT GENERATED", type: "neutral" },
    description: "April monthly financial summary - PDF + CSV pack",
    actor: "Sade Kuti - treasurer",
  },
];

export default function AuditLogsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">
            AUDIT LOGS
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Activity
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
            Apr 30
          </button>
          <button className="px-5 py-2 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm">
            Export as csv
          </button>
        </div>
      </div>

      {/* Stats & Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-2">
        <div className="flex items-center gap-6 sm:gap-10 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          <div>
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">
              TODAY
            </p>
            <p className="text-2xl font-bold text-gray-900">1,284</p>
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">
              APPROVALS
            </p>
            <p className="text-2xl font-bold text-gray-900">38</p>
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1 whitespace-nowrap">
              FAILED SIGN-INS
            </p>
            <p className="text-2xl font-bold text-gray-900">2</p>
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">
              RETENTION
            </p>
            <p className="text-2xl font-bold text-gray-900">365 days</p>
          </div>
        </div>

        <div className="flex items-center gap-2 relative shrink-0">
          <button className="px-5 py-2 rounded-full bg-black text-white text-sm font-medium shadow-sm">
            All actions
          </button>
          <button className="px-5 py-2 rounded-full border border-gray-200 bg-white text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
            Admins
          </button>
          <button className="px-5 py-2 rounded-full border border-gray-200 bg-white text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
            Members
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mt-4">
        <div className="divide-y divide-gray-100 flex flex-col">
          {logs.map((log, i) => (
            <div key={i} className="flex flex-col lg:flex-row lg:items-center p-4 px-6 gap-3 lg:gap-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4 lg:w-[280px] shrink-0">
                <span className="text-xs font-medium text-gray-400 w-20 shrink-0">
                  {log.time}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase text-center w-full max-w-[170px] ${
                  log.badge.type === 'warning' ? 'bg-[#fef9c3] text-yellow-800' :
                  log.badge.type === 'danger' ? 'bg-black text-white' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {log.badge.text}
                </span>
              </div>
              
              <div className="flex-1 text-sm font-medium text-gray-900 pl-24 lg:pl-0">
                {log.description}
              </div>
              
              <div className="text-xs text-gray-500 lg:w-[220px] text-left lg:text-right shrink-0 pl-24 lg:pl-0">
                {log.actor}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase text-center sm:text-left">
          SHOWING 1-7 OF 1,284
        </p>
        
        <div className="flex items-center justify-center gap-1">
          <button className="px-3 py-1.5 text-gray-400 font-medium hover:text-gray-900 flex items-center gap-1 transition-colors text-sm">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Prev
          </button>
          
          <button className="w-8 h-8 rounded-lg bg-black text-white font-medium flex items-center justify-center text-sm shadow-sm">
            1
          </button>
          <button className="w-8 h-8 rounded-lg text-gray-600 font-medium flex items-center justify-center hover:bg-gray-100 transition-colors text-sm">
            2
          </button>
          <button className="w-8 h-8 rounded-lg text-gray-600 font-medium flex items-center justify-center hover:bg-gray-100 transition-colors text-sm">
            3
          </button>
          
          <button className="px-3 py-1.5 text-gray-900 font-medium hover:text-black flex items-center gap-1 transition-colors border-gray-200 border rounded-full bg-white ml-2 text-sm shadow-sm">
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
