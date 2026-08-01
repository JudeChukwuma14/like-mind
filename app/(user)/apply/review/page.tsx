"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useApplyStore } from "../useApplyStore";

export default function ReviewPage() {
  const router = useRouter();
  const { data, isClient } = useApplyStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isClient || !mounted) return null;

  const handleNext = () => {
    router.push("/apply/acknowledgement");
  };

  const sections = [
    {
      id: "02",
      title: "Basic information",
      subtitle: "Identity & legal status",
      path: "/apply/basic-information",
      fields: [
        { label: "NAME", value: `${data.firstName} ${data.middleName ? data.middleName + " " : ""}${data.lastName}` },
        { label: "DOB", value: data.dob || "—" },
        { label: "STATUS", value: `${data.statusInCanada} · ${data.provinceOfResidence}` },
      ],
    },
    {
      id: "03",
      title: "Contact information",
      subtitle: "Address & direct lines",
      path: "/apply/contact-information",
      fields: [
        { label: "ADDRESS", value: `${data.homeAddress}, ${data.city}\n${data.postalCode}` },
        { label: "PHONE", value: data.phone || "—" },
        { label: "EMAIL", value: data.email || "—" },
      ],
    },
    {
      id: "04",
      title: "Employment",
      subtitle: "Income & vocation",
      path: "/apply/employment",
      fields: [
        { label: "EMPLOYER", value: data.employerName || "—" },
        { label: "ROLE", value: data.jobTitle || "—" },
        { label: "TENURE", value: `${data.yearsInRole} - ${data.workLocation}` },
      ],
    },
    {
      id: "05",
      title: "Next of kin",
      subtitle: "Beneficiary contact",
      path: "/apply/next-of-kin",
      fields: [
        { label: "NAME", value: `${data.nokFullName} ·\n${data.nokRelationship}` },
        { label: "PHONE", value: data.nokPhone || "—" },
        { label: "BENEFICIARY", value: data.nokPrimaryBeneficiary ? "Primary · Generations Trust" : "Standard" },
      ],
    },
    {
      id: "06",
      title: "Referee",
      subtitle: "Verifying member",
      path: "/apply/referee",
      fields: [
        { label: "REFEREE", value: `${data.refereeFullName} · ${data.refereeMemberId}` },
        { label: "EMAIL", value: data.refereeEmail || "—" },
        { label: "VERIFIED", value: data.refereeEmail.includes("@likeminds.coop") ? "✓ Tier 04 · Steward" : "Pending" },
      ],
    },
  ];

  return (
    <div className="flex flex-col h-full justify-between min-h-full">
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest flex items-center gap-4">
            <span>STEP 07 OF 09</span>
            <span className="w-8 h-px bg-gray-300"></span>
            <span className="font-semibold text-gray-700">REVIEW DETAILS</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-xs text-green-700 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>All sections complete</span>
          </div>
        </div>

        <div className="mt-8 max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-[#171717] mb-4">
            Review.
          </h1>
          <p className="text-lg text-gray-600 mb-10">Tap any section to edit before submit.</p>

          <div className="space-y-4">
            {sections.map((section) => (
              <div
                key={section.id}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center gap-6"
              >
                <div className="flex items-center gap-5 md:w-1/4 shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-[#171717] text-white flex items-center justify-center font-bold font-mono text-sm shrink-0">
                    {section.id}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#171717]">{section.title}</h3>
                    <p className="text-sm text-gray-500">{section.subtitle}</p>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-6">
                  {section.fields.map((field, i) => (
                    <div key={i}>
                      <div className="text-[10px] font-mono tracking-widest text-gray-400 mb-1">
                        {field.label}
                      </div>
                      <div className="text-sm text-gray-800 whitespace-pre-line leading-snug">
                        {field.value}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="shrink-0 flex justify-end">
                  <Link
                    href={section.path}
                    className="px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-20 pt-6 border-t border-gray-200 border-dashed flex items-center justify-between">
        <Link
          href="/apply/referee"
          className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-[#171717] px-6 py-3 rounded-full font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        
        <span className="text-xs text-gray-400 font-mono tracking-widest uppercase hidden md:inline-block">
          77% complete
        </span>

        <button
          onClick={handleNext}
          className="inline-flex items-center gap-2 bg-[#171717] hover:bg-black text-white px-6 py-3 rounded-full font-medium transition-colors"
        >
          Looks good — sign & submit
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
