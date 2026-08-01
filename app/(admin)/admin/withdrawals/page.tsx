"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, X } from "lucide-react";

export default function WithdrawalsPage() {
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );

  const mockRequests = [
    {
      id: "WD-2218",
      memberInitials: "BO",
      memberName: "Bisi Olatunji",
      memberDesc: "Personal savings",
      amount: "₦200,000",
      reason: "Medical · UCH",
      disburseToMain: "bisi.o@interac",
      disburseToSub: "GTBank · personal",
      eligibility: "REVIEW POLICY",
      eligibilityStyle: "bg-[#E8D94B] text-black border-transparent",
      details: {
        date: "APR 30",
        availableBalance: "₦485,200",
        fullReason: "Medical - UCH Ibadan",
        expectedPayout: "May 2 · 2-3 working days",
        activeLoan: "None",
      },
    },
    {
      id: "WD-2219",
      memberInitials: "JN",
      memberName: "Jide Ndubuisi",
      memberDesc: "Personal savings",
      amount: "₦400,000",
      reason: "School fees",
      disburseToMain: "jide.n@interac",
      disburseToSub: "GTBank · school",
      eligibility: "ELIGIBLE",
      eligibilityStyle: "bg-white border-black/10 text-black",
      details: {
        date: "APR 29",
        availableBalance: "₦1,240,000",
        fullReason: "School fees - University of Lagos",
        expectedPayout: "May 1 · 1-2 working days",
        activeLoan: "₦150,000",
      },
    },
    {
      id: "WD-2220",
      memberInitials: "RU",
      memberName: "Ronke Udom",
      memberDesc: "Personal savings",
      amount: "₦90,000",
      reason: "Personal",
      disburseToMain: "ronke.u@interac",
      disburseToSub: "UBA · personal",
      eligibility: "ELIGIBLE",
      eligibilityStyle: "bg-white border-black/10 text-black",
      details: {
        date: "APR 29",
        availableBalance: "₦310,500",
        fullReason: "Personal use",
        expectedPayout: "May 1 · 1-2 working days",
        activeLoan: "None",
      },
    },
    {
      id: "WD-2221",
      memberInitials: "TA",
      memberName: "Tomi Adesanya",
      memberDesc: "Investment",
      amount: "₦150,000",
      reason: "Investment",
      disburseToMain: "tomi.a@interac",
      disburseToSub: "UBA · investment",
      eligibility: "ELIGIBLE",
      eligibilityStyle: "bg-white border-black/10 text-black",
      details: {
        date: "APR 28",
        availableBalance: "₦850,000",
        fullReason: "Transfer to external investment portfolio",
        expectedPayout: "Apr 30 · 1-2 working days",
        activeLoan: "None",
      },
    },
    {
      id: "WD-2222",
      memberInitials: "SK",
      memberName: "Sade Kuti",
      memberDesc: "Personal savings",
      amount: "₦60,000",
      reason: "Personal",
      disburseToMain: "sade.k@interac",
      disburseToSub: "GTBank · personal",
      eligibility: "INSUFFICIENT",
      eligibilityStyle: "bg-black/5 text-black/40 border-transparent",
      details: {
        date: "APR 28",
        availableBalance: "₦45,000",
        fullReason: "Personal use",
        expectedPayout: "N/A",
        activeLoan: "None",
      },
    },
  ];

  const selectedRequest = mockRequests.find((r) => r.id === selectedRequestId);

  return (
    <div className="text-[#111110]">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="text-xs font-semibold tracking-widest text-black/40 uppercase mb-2">
            WITHDRAWALS
          </div>
          <h1 className="text-5xl font-medium tracking-tight">Approvals</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-2.5 rounded-full bg-white font-medium text-sm border border-black/5 hover:bg-black/5 transition shadow-sm">
            Select requests
          </button>
          <button className="px-6 py-2.5 rounded-full bg-black text-white font-medium text-sm hover:bg-black/80 transition shadow-sm">
            Approve payout
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="text-[10px] font-semibold tracking-widest text-black/40 uppercase pl-2">
            REQUESTS · 5
          </div>
          <button className="px-4 py-2 rounded-full bg-white flex items-center gap-2 font-medium text-xs border border-black/5 hover:bg-black/5 transition shadow-sm">
            CYCLE ENDS APR 30 <ChevronDown className="w-3 h-3 text-black/50" />
          </button>
        </div>

        <div className="bg-white rounded-3xl overflow-hidden border border-black/5 shadow-sm">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-black/5 bg-white text-[10px] font-semibold tracking-widest text-black/40 uppercase">
                <div className="col-span-4 pl-2">MEMBER</div>
                <div className="col-span-2">AMOUNT</div>
                <div className="col-span-2">REASON</div>
                <div className="col-span-2">DISBURSE TO</div>
                <div className="col-span-2 text-right pr-8">ELIGIBILITY</div>
              </div>

              {/* Table Rows */}
              <div className="flex flex-col">
                {mockRequests.map((request, idx) => {
                  const isSelected = selectedRequestId === request.id;
                  const isLast = idx === mockRequests.length - 1;

                  return (
                    <div
                      key={request.id}
                      onClick={() => setSelectedRequestId(request.id)}
                      className={`grid grid-cols-12 gap-4 px-6 py-4 items-center cursor-pointer transition-colors border-b last:border-b-0 ${
                        isSelected
                          ? "bg-[#FEFBE8] border-black/5"
                          : "bg-white border-black/5 hover:bg-black/[0.02]"
                      }`}
                    >
                      <div className="col-span-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#111110] text-white flex items-center justify-center font-medium text-sm shrink-0">
                          {request.memberInitials}
                        </div>
                        <div>
                          <div className="font-medium text-[15px]">
                            {request.memberName}
                          </div>
                          <div className="text-xs text-black/50">
                            {request.memberDesc}
                          </div>
                        </div>
                      </div>

                      <div className="col-span-2">
                        <span className="text-[15px] font-semibold">
                          {request.amount}
                        </span>
                      </div>

                      <div className="col-span-2">
                        <span className="text-[14px] text-black/70">
                          {request.reason}
                        </span>
                      </div>

                      <div className="col-span-2">
                        <div className="text-[14px] font-medium">
                          {request.disburseToMain}
                        </div>
                        <div className="text-xs text-black/40">
                          {request.disburseToSub}
                        </div>
                      </div>

                      <div className="col-span-2 flex items-center justify-end gap-4 pr-2">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${request.eligibilityStyle}`}
                        >
                          {request.eligibility}
                        </span>
                        <ChevronRight
                          className={`w-4 h-4 transition-colors ${isSelected ? "text-black" : "text-black/30"}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between mt-6 px-2">
          <div className="text-[10px] font-semibold tracking-widest text-black/40 uppercase">
            SHOWING 1-5 OF 5
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
            <button className="px-3 py-1.5 text-sm font-medium hover:bg-black/5 transition rounded-lg text-black bg-white border border-black/5">
              Next &gt;
            </button>
          </div>
        </div>
      </div>

      {selectedRequest && (
        <div 
          className="fixed top-0 right-0 bottom-0 z-50 flex items-center justify-center p-4"
          style={{
            left: 0,
            marginLeft: `var(--admin-sidebar-offset, 0px)`,
          }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedRequestId(null)}
          ></div>

          {/* Modal Panel */}
          <div className="relative w-full max-w-[480px] bg-white rounded-[32px] shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden">
            {/* Drawer Header */}
            <div className="px-8 py-6 border-b border-black/5">
              <div className="flex justify-between items-center mb-8">
                <div className="text-[10px] font-semibold tracking-widest text-black/40 uppercase">
                  WITHDRAWALS / {selectedRequest.id}
                </div>
                <button
                  onClick={() => setSelectedRequestId(null)}
                  className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition text-black/60 hover:text-black"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-[10px] font-semibold tracking-widest text-black/40 uppercase mb-2">
                REQUEST · {selectedRequest.details.date}
              </div>
              <div className="text-[40px] font-semibold tracking-tight mb-6">
                {selectedRequest.amount}
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-medium text-xs shrink-0">
                  {selectedRequest.memberInitials}
                </div>
                <div>
                  <div className="font-semibold text-[15px] leading-tight">
                    {selectedRequest.memberName}
                  </div>
                  <div className="text-sm text-black/50">
                    {selectedRequest.memberDesc}
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Content */}
            <div className="p-8 flex-1 overflow-y-auto">
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-black/5 pb-4">
                  <span className="text-[14px] text-black/50">
                    Available balance
                  </span>
                  <span className="font-semibold text-[15px]">
                    {selectedRequest.details.availableBalance}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-black/5 pb-4">
                  <span className="text-[14px] text-black/50">Reason</span>
                  <span className="font-medium text-[15px]">
                    {selectedRequest.details.fullReason}
                  </span>
                </div>
                <div className="flex justify-between items-start border-b border-black/5 pb-4">
                  <span className="text-[14px] text-black/50">Disburse to</span>
                  <div className="text-right">
                    <div className="font-medium text-[15px]">
                      {selectedRequest.disburseToMain}
                    </div>
                    <div className="text-[13px] text-black/40 mt-0.5">
                      {selectedRequest.disburseToSub}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center border-b border-black/5 pb-4">
                  <span className="text-[14px] text-black/50">
                    Expected payout
                  </span>
                  <span className="font-medium text-[15px]">
                    {selectedRequest.details.expectedPayout}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[14px] text-black/50">Active loan</span>
                  <span className="font-medium text-[15px]">
                    {selectedRequest.details.activeLoan}
                  </span>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-6 border-t border-black/5 bg-white flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setSelectedRequestId(null)}
                className="px-6 py-3 rounded-full bg-white font-medium text-[15px] border border-black/10 hover:bg-black/5 transition shadow-sm"
              >
                Reject
              </button>
              <button
                onClick={() => setSelectedRequestId(null)}
                className="px-8 py-3 rounded-full bg-black text-white font-medium text-[15px] hover:bg-black/80 transition shadow-sm"
              >
                Approve & process payout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
