import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your Kajola profile and personal information.",
};

export default function ProfilePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-4 md:space-y-6 text-[#171717] pb-10">
      {/* Top Avatar Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-amber-100 flex items-center justify-center text-3xl font-medium text-[#111] shrink-0">
            AO
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">
              Adaeze Okonkwo
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              JOINED 02 JAN 2025
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 flex items-center gap-1.5 border border-green-100/50">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Identity verified
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 flex items-center gap-1.5 border border-green-100/50">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Bank verified
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 flex items-center gap-1.5 border border-amber-100/50">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                ID expires soon
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
          <button className="flex-1 md:flex-none px-5 py-2.5 rounded-full text-sm font-semibold bg-white border border-gray-200 text-[#111] hover:bg-gray-50 transition-colors">
            Change photo
          </button>
          <button className="flex-1 md:flex-none px-5 py-2.5 rounded-full text-sm font-semibold bg-[#111] text-white hover:bg-black transition-colors">
            Edit profile
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 items-start">
        {/* LEFT COLUMN */}
        <div className="space-y-4 md:space-y-6">
          {/* 01 - PERSONAL */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">
                  01 — PERSONAL
                </p>
                <h2 className="text-xl font-bold">Personal information</h2>
              </div>
              <button className="text-xs font-bold text-amber-600 hover:text-amber-700 mt-1">
                Edit
              </button>
            </div>
            <div className="space-y-5 text-sm">
              <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                <span className="text-gray-500">Full name</span>
                <span className="font-semibold">Adaeze Okonkwo</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                <span className="text-gray-500">Date of birth</span>
                <span className="font-semibold">14 August 1992</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                <span className="text-gray-500">Gender</span>
                <span className="font-semibold">Female</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Marital status</span>
                <span className="font-semibold">Married</span>
              </div>
            </div>
          </div>

          {/* 02 - CONTACT */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">
                  02 — CONTACT
                </p>
                <h2 className="text-xl font-bold">Contact information</h2>
              </div>
              <button className="text-xs font-bold text-amber-600 hover:text-amber-700 mt-1">
                Edit
              </button>
            </div>
            <div className="space-y-5 text-sm">
              <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                <span className="text-gray-500">Email</span>
                <span className="font-semibold">adaeze.okonkwo@gmail.com</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                <span className="text-gray-500">Phone</span>
                <span className="font-semibold">+1 403 248 9921</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-gray-500 pt-0.5">Address</span>
                <span className="font-semibold text-right max-w-50">
                  12 Adeola Odeku Street
                  <br />
                  <span className="text-gray-400 font-normal mt-0.5 inline-block">
                    Victoria Island, Lagos
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* 03 - INTERAC */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">
                  03 — INTERAC
                </p>
                <h2 className="text-xl font-bold">Interac e-Transfer</h2>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-green-50 text-green-700 flex items-center gap-1.5 border border-green-100/50 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Verified
              </span>
            </div>
            <div className="space-y-5 text-sm mb-7">
              <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                <span className="text-gray-500">Interac email</span>
                <span className="font-semibold">adaeze@likemind.co</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Linked name</span>
                <span className="font-semibold">Adaeze Okonkwo</span>
              </div>
            </div>
            <button className="px-5 py-2.5 rounded-full text-xs font-semibold bg-white border border-gray-200 text-[#111] hover:bg-gray-50 transition-colors">
              Update Interac
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-4 md:space-y-6">
          {/* 04 - NEXT OF KIN */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">
                  04 — NEXT OF KIN
                </p>
                <h2 className="text-xl font-bold">Next of kin</h2>
              </div>
              <button className="text-xs font-bold text-amber-600 hover:text-amber-700 mt-1">
                Edit
              </button>
            </div>
            <div className="space-y-5 text-sm">
              <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                <span className="text-gray-500">Full name</span>
                <span className="font-semibold">Daniel Okonkwo</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                <span className="text-gray-500">Relationship</span>
                <span className="font-semibold">Spouse</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Phone</span>
                <span className="font-semibold">+1 403 119 4427</span>
              </div>
            </div>
          </div>

          {/* 05 - DOCUMENTS */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">
                  05 — DOCUMENTS
                </p>
                <h2 className="text-xl font-bold">Documents</h2>
              </div>
              <button className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white border border-gray-200 text-[#111] hover:bg-gray-50 transition-colors flex items-center gap-1.5 mt-1">
                + Upload
              </button>
            </div>
            <div className="space-y-6">
              {/* Doc 1 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0 border border-green-100/50">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-[#111] truncate">
                      National ID - NIN
                    </p>
                    <button className="text-[11px] font-bold text-amber-600 hover:text-amber-700 shrink-0">
                      View
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Verified · Uploaded 28 Dec 2024
                  </p>
                </div>
              </div>

              {/* Doc 2 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100/50">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-[#111] truncate">
                      Passport photo
                    </p>
                    <button className="text-[11px] font-bold text-amber-600 hover:text-amber-700 shrink-0">
                      Re-upload
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Expires 18 May 2026 · Re-upload soon
                  </p>
                </div>
              </div>

              {/* Doc 3 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0 border border-green-100/50">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-[#111] truncate">
                      Proof of address
                    </p>
                    <button className="text-[11px] font-bold text-amber-600 hover:text-amber-700 shrink-0">
                      View
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Verified · Uploaded 28 Dec 2024
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 06 - SECURITY */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <div className="mb-6">
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">
                06 — SECURITY
              </p>
              <h2 className="text-xl font-bold">Password & security</h2>
            </div>
            <div className="space-y-7">
              {/* Password */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#111]">Password</p>
                  <p className="text-[11px] text-gray-400 mt-0.5 tracking-wide">
                    Last changed 14 days ago
                  </p>
                </div>
                <button className="text-[11px] font-bold text-amber-600 hover:text-amber-700 mt-0.5">
                  Change
                </button>
              </div>

              {/* 2FA */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#111]">
                    Two-factor authentication
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5 tracking-wide">
                    SMS to +234 803 248 9921
                  </p>
                </div>
                <div className="w-9 h-5 bg-green-600 rounded-full relative cursor-pointer mt-0.5 shrink-0 transition-colors">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                </div>
              </div>

              {/* Active Sessions */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#111]">
                    Active sessions
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5 tracking-wide">
                    2 devices · Lagos, Abuja
                  </p>
                </div>
                <button className="text-[11px] font-bold text-amber-600 hover:text-amber-700 mt-0.5">
                  Manage
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
