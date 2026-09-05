"use client";

import { useState, useEffect } from "react";

export type ApplyData = {
  // Basic Information
  title: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  dob: string;
  residencyStatus: string;
  provinceOfResidence: string;

  // Contact Information
  homeAddress: string;
  city: string;
  postalCode: string;
  province: string;
  provinceCode: string;
  country: string;
  countryCode: string;
  phone: string;
  email: string;

  // Employment
  employmentStatus: string;
  employerName: string;
  industry: string;
  jobTitle: string;
  workLocation: string;
  yearsInRole: string;

  // Next of kin
  nokFullName: string;
  nokRelationship: string;
  nokEmail: string;
  nokPhone: string;
  nokPrimaryBeneficiary: boolean;
  nokSharePercentage: string;

  // Referee
  refereeFullName: string;
  refereeMemberId: string;
  refereeEmail: string;
  refereeRelationship: string;
  refereeKnownDuration: string;
  refereeSkipped: boolean;

  // Acknowledgement
  signature: string;
  signatureMode: "typed" | "drawn";
  signatureImageDataUrl: string;
  agreeInfoTrue: boolean;
  agreeBylaws: boolean;
  agreeConsent: boolean;

  // Account (required by the API to create the member login)
  password: string;
};

const defaultData: ApplyData = {
  title: "",
  firstName: "",
  middleName: "",
  lastName: "",
  gender: "",
  dob: "",
  residencyStatus: "",
  provinceOfResidence: "",
  homeAddress: "",
  city: "",
  postalCode: "",
  province: "Ontario",
  provinceCode: "ON",
  country: "Canada",
  countryCode: "CA",
  phone: "",
  email: "",
  employmentStatus: "Employed",
  employerName: "",
  industry: "",
  jobTitle: "",
  workLocation: "",
  yearsInRole: "",
  nokFullName: "",
  nokRelationship: "Spouse",
  nokEmail: "",
  nokPhone: "",
  nokPrimaryBeneficiary: false,
  nokSharePercentage: "100",
  refereeFullName: "",
  refereeMemberId: "",
  refereeEmail: "",
  refereeRelationship: "Mentor / Colleague",
  refereeKnownDuration: "",
  refereeSkipped: false,
  signature: "",
  signatureMode: "typed",
  signatureImageDataUrl: "",
  agreeInfoTrue: false,
  agreeBylaws: false,
  agreeConsent: false,
  password: "",
};

export function useApplyStore() {
  const [data, setDataState] = useState<ApplyData>(defaultData);
  const [isClient, setIsClient] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem("kajola_apply_data");
    if (saved) {
      try {
        setDataState({ ...defaultData, ...JSON.parse(saved) });
      } catch (e) {
        console.error("Failed to parse apply data", e);
      }
    }
  }, []);

  const setData = (newData: Partial<ApplyData>) => {
    setDataState((prev) => {
      const updated = { ...prev, ...newData };
      localStorage.setItem("kajola_apply_data", JSON.stringify(updated));
      setLastSaved(new Date());
      return updated;
    });
  };

  const clearData = () => {
    setDataState(defaultData);
    localStorage.removeItem("kajola_apply_data");
    setLastSaved(null);
  };

  return { data, setData, clearData, isClient, lastSaved };
}
