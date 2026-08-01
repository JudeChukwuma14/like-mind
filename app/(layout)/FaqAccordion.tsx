"use client";

import { useState } from "react";

const faqs = [
  {
    num: "01",
    question: "Who can become a member?",
    answer:
      "Any Canadian permanent resident, citizen or work-permit holder over 18 years of age. Members of the diaspora abroad may join as Associate (Tier 01) and upgrade to full membership upon arrival.",
  },
  {
    num: "02",
    question: "How long does the application review take?",
    answer: "We typically review completed applications within five business days. Once approved, you'll have full access to Kajola's platforms, tools, and investment opportunities.",
  },
  {
    num: "03",
    question: "What if I lose my job and can't pay dues?",
    answer: "We have hardship provisions in place. You can request a temporary pause on your dues without losing your membership status, though certain dividend accruals may be affected.",
  },
  {
    num: "04",
    question:
      "Can I withdraw my savings before the lock period ends?",
    answer: "Early withdrawals are generally subject to a penalty fee, but emergency exceptions can be granted by the member council upon review.",
  },
  {
    num: "05",
    question: "How do you decide which investments to fund?",
    answer: "Investments are proposed by the strategy committee and voted on quarterly by all full members. Each member has one vote, regardless of their capital contribution.",
  },
  { num: "06", question: "Are dividends taxable?", answer: "Yes, dividends are considered taxable income. We provide all necessary tax documentation (T5 slips) at the end of the fiscal year." },
  {
    num: "07",
    question:
      "What happens to my shares if I leave the cooperative?",
    answer: "Your shares will be bought back by the cooperative at their fair market value at the time of your departure, subject to a brief processing period.",
  },
  {
    num: "08",
    question: "Can my children inherit my membership?",
    answer: "Yes, memberships and associated capital can be transferred to designated beneficiaries upon death, through the Generations Trust scheme.",
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="lg:w-2/3 flex flex-col gap-3">
      {faqs.map((faq, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={faq.num}
            onClick={() => toggle(i)}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm cursor-pointer hover:border-gray-200 transition-colors"
          >
            <div className="flex gap-6 items-start">
              <span className="text-xs font-mono text-[#a89f91] mt-1">
                {faq.num}
              </span>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-900">
                    {faq.question}
                  </h3>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-sm text-gray-600 leading-relaxed pr-8">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
