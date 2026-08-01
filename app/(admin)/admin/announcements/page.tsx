"use client";

import { useState } from "react";

export default function AnnouncementsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">
            ANNOUNCEMENTS
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            New announcement
          </h1>
        </div>
        
        <div>
          <button className="px-5 py-2.5 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm w-full sm:w-auto">
            Publish announcement
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-6">
        {/* Form Column */}
        <div className="col-span-1 lg:col-span-7 space-y-8">
          <div>
            <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-3">
              TITLE
            </label>
            <input 
              type="text" 
              defaultValue="April cycle closes Friday"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-300 focus:ring-0 outline-none text-gray-900 font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-3">
              MESSAGE
            </label>
            <textarea 
              rows={4}
              defaultValue="Hi everyone — the April contribution cycle closes this Friday at 5pm. Please confirm your transfers before then so your savings and loan eligibility stay up to date. Reach out to the secretary with any questions."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-300 focus:ring-0 outline-none text-gray-700 resize-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-3">
              AUDIENCE
            </label>
            <div className="flex flex-wrap gap-2">
              <button className="px-4 py-1.5 rounded-full bg-black text-white text-sm font-medium">
                All members · 178
              </button>
              <button className="px-4 py-1.5 rounded-full border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">
                Active only
              </button>
              <button className="px-4 py-1.5 rounded-full border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">
                By role
              </button>
              <button className="px-4 py-1.5 rounded-full border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">
                Outstanding loans
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-8 sm:gap-16">
            <div>
              <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-3">
                CHANNELS
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="w-5 h-5 rounded bg-black flex items-center justify-center shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-900">In-app</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="w-5 h-5 rounded bg-black flex items-center justify-center shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-900">Email</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="w-5 h-5 rounded border border-gray-300 flex items-center justify-center shrink-0"></div>
                  <span className="text-sm text-gray-600">SMS</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-3">
                SCHEDULE
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="w-5 h-5 rounded-full border-[5px] border-black bg-white shrink-0"></div>
                  <span className="text-sm font-medium text-gray-900">Send now</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="w-5 h-5 rounded-full border border-gray-300 bg-white shrink-0"></div>
                  <span className="text-sm text-gray-600">Schedule for later</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Column */}
        <div className="col-span-1 lg:col-span-5">
          <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-3">
            PREVIEW · MEMBER APP
          </label>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 max-w-sm w-full mx-auto lg:mx-0">
            {/* Sender Info */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#fcd34d] flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                  <path d="M21 19a2 2 0 0 1-2 2h-1c-1.1 0-2-1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1c1.1 0 2-1 2-2v-3a2 2 0 0 0-2-2H3z"></path>
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-gray-900">LikeMind Admin</h4>
                <p className="text-xs text-gray-400 mt-0.5">Just now · to all members</p>
              </div>
            </div>

            {/* Content */}
            <div className="mt-5">
              <h3 className="font-bold text-gray-900 text-lg">April cycle closes Friday</h3>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                Hi everyone — the April contribution cycle closes this Friday at 5pm. Please confirm your transfers before then so your savings and loan eligibility stay up to date.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-6">
              <button className="px-5 py-2 rounded-full bg-[#fcd34d] text-yellow-900 text-sm font-bold shadow-sm">
                Confirm now
              </button>
              <button className="px-5 py-2 rounded-full text-gray-500 text-sm font-medium hover:bg-gray-50 transition-colors">
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
