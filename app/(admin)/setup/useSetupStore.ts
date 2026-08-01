"use client";

import { useState, useEffect } from "react";

export type BankingDestination = {
  displayName: string;
  email: string;
  verified: boolean;
};

export type SetupData = {
  // Step 1 — Welcome / account creation
  email: string;
  password: string;

  // Step 2 — Cooperative profile
  cooperativeName: string;
  rcNumber: string;
  founded: string;
  headquartersAddress: string;
  defaultCurrency: string;
  timezone: string;
  publicMotto: string;
  brandAccentColor: string;

  // Step 3 — Cycles & contributions
  cycleFrequency: string; // "Monthly" | "Weekly" | "Quarterly"
  dueDay: string;
  lateGrace: string;
  minMonthly: string;
  maxMonthly: string;

  // Step 4 — Loan policy
  interestRate: string;
  maxTermMonths: string;
  latePenalty: string;
  requiresActiveMember: boolean;
  requiresGuarantor: boolean;
  requiresDebtToIncome: boolean;
  requiresBankStatement: boolean;

  // Step 5 — Withdrawal policy
  maxPerCycle: string;
  withdrawalFrequency: string;
  blockActiveLoan: boolean;
  blockGuarantor: boolean;
  blockArrears: boolean;
  blockNewMember: boolean;

  // Step 6 — Banking
  destinations: BankingDestination[];
};

const defaultData: SetupData = {
  email: "",
  password: "",
  cooperativeName: "",
  rcNumber: "",
  founded: "",
  headquartersAddress: "",
  defaultCurrency: "NGN - ₦",
  timezone: "WAT - UTC+1",
  publicMotto: "",
  brandAccentColor: "#f5c518",
  cycleFrequency: "Monthly",
  dueDay: "28th of month",
  lateGrace: "5 days",
  minMonthly: "",
  maxMonthly: "",
  interestRate: "",
  maxTermMonths: "",
  latePenalty: "",
  requiresActiveMember: true,
  requiresGuarantor: true,
  requiresDebtToIncome: true,
  requiresBankStatement: false,
  maxPerCycle: "75% of balance",
  withdrawalFrequency: "2 per month",
  blockActiveLoan: true,
  blockGuarantor: true,
  blockArrears: true,
  blockNewMember: false,
  destinations: [],
};

export function useSetupStore() {
  const [data, setDataState] = useState<SetupData>(defaultData);
  const [isClient, setIsClient] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem("kajola_setup_data");
    if (saved) {
      try {
        setDataState({ ...defaultData, ...JSON.parse(saved) });
      } catch (e) {
        console.error("Failed to parse setup data", e);
      }
    }
  }, []);

  const setData = (newData: Partial<SetupData>) => {
    setDataState((prev) => {
      const updated = { ...prev, ...newData };
      localStorage.setItem("kajola_setup_data", JSON.stringify(updated));
      setLastSaved(new Date());
      return updated;
    });
  };

  const clearData = () => {
    setDataState(defaultData);
    localStorage.removeItem("kajola_setup_data");
    setLastSaved(null);
  };

  return { data, setData, clearData, isClient, lastSaved };
}
