"use client";

import { useState, useEffect } from "react";

export type BankingDestination = {
  id: string;
  displayName: string;
  email: string;
  description: string;
  verified: boolean;
};

export type SetupData = {
  // Set once CreateAccount succeeds; CompleteSetup's URL needs it.
  cooperativeAccountId: string;

  // Step 1 — Welcome / account creation
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  cooperativeAdminPhoneNumber: string;
  country: string;
  countryCode: string;
  societyOrProvince: string;
  societyOrProvinceCode: string;
  password: string;

  // Step 2 — Cooperative profile
  cooperativeName: string;
  rcNumber: string;
  founded: string; // ISO date (YYYY-MM-DD)
  headquartersAddress: string;
  defaultCurrency: string; // ISO 4217 code, e.g. "NGN"
  timezone: string; // IANA timezone id, e.g. "Africa/Lagos"
  publicMotto: string;
  brandAccentColor: string;
  logoAssetId: string;
  logoFileName: string;
  logoPreviewUrl: string;

  // Step 3 — Cycles & contributions
  cycleFrequency: string; // "Monthly" | "Weekly" | "Quarterly"
  dueDay: string; // day of month, 1-31
  lateGrace: string; // grace period in days
  minMonthly: string;
  maxMonthly: string;

  // Step 4 — Loan policy
  interestRate: string; // annual percent
  maxTermMonths: string;
  latePenalty: string; // percent per month
  requiresActiveMember: boolean;
  minimumMembershipMonths: string;
  requiresGuarantor: boolean;
  minimumGuarantorCount: string;
  requiresDebtToIncome: boolean;
  maximumDebtToIncomeRatioPercent: string;
  requiresBankStatement: boolean;

  // Step 5 — Withdrawal policy
  maxPerCycle: string; // percent of balance
  withdrawalFrequency: string; // max withdrawals per cycle
  blockActiveLoan: boolean;
  blockGuarantor: boolean;
  blockArrears: boolean;
  blockNewMember: boolean;
  minimumDaysSinceJoining: string;

  // Step 6 — Banking
  destinations: BankingDestination[];
};

const defaultData: SetupData = {
  cooperativeAccountId: "",
  email: "",
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  cooperativeAdminPhoneNumber: "",
  country: "Canada",
  countryCode: "CA",
  societyOrProvince: "Ontario",
  societyOrProvinceCode: "ON",
  password: "",
  cooperativeName: "",
  rcNumber: "",
  founded: "",
  headquartersAddress: "",
  defaultCurrency: "NGN",
  timezone: "Africa/Lagos",
  publicMotto: "",
  brandAccentColor: "#f5c518",
  logoAssetId: "",
  logoFileName: "",
  logoPreviewUrl: "",
  cycleFrequency: "Monthly",
  dueDay: "28",
  lateGrace: "5",
  minMonthly: "",
  maxMonthly: "",
  interestRate: "",
  maxTermMonths: "",
  latePenalty: "",
  requiresActiveMember: true,
  minimumMembershipMonths: "3",
  requiresGuarantor: true,
  minimumGuarantorCount: "1",
  requiresDebtToIncome: true,
  maximumDebtToIncomeRatioPercent: "40",
  requiresBankStatement: false,
  maxPerCycle: "75",
  withdrawalFrequency: "2",
  blockActiveLoan: true,
  blockGuarantor: true,
  blockArrears: true,
  blockNewMember: false,
  minimumDaysSinceJoining: "30",
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
