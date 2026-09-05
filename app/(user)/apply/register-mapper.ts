import type { ApplyData } from "./useApplyStore";
import { collectDeviceInfo } from "@/app/lib/device-info";

/**
 * ⚠️ UNVERIFIED against the actual backend enum source. Unlike gender/
 * relationship/signatureType (confirmed to accept plain strings), the
 * backend rejected a string for employmentInfoDto.status with a JSON
 * conversion error against `EmploymentStatus` — this one specifically
 * wants a number. Which number maps to which option below is still a
 * guess (order matches this app's UI) — confirm with the backend team.
 */
const EMPLOYMENT_STATUS_MAP: Record<string, number> = {
  Employed: 0,
  "Self-employed": 1,
  "Business owner": 2,
  Student: 3,
  Retired: 4,
};

export type RegisterRequest = {
  basicInfo: {
    firstName: string;
    middleName?: string;
    lastName: string;
    gender: string;
    dateOfBirth: string;
    residencyStatus: string;
    provinceOfResidence: string;
  };
  contactInfo: {
    homeAddress: string;
    city: string;
    postalCode: string;
    province: string;
    country: string;
    phoneNumber: string;
    personalEmail: string;
  };
  employmentInfoDto: {
    status: number;
    employerName?: string;
    industry?: string;
    jobTitle?: string;
    workLocation?: string;
    yearsInRole?: number;
  };
  DeviceInfo: {
    deviceID?: string;
    deviceOS?: string;
    fingerprint?: string;
    lastIp: string;
  };
  Password: string;
  nextOfKinDto: {
    fullName: string;
    relationship: string;
    email: string;
    phoneNumber: string;
    isPrimaryBeneficiary: boolean;
    sharePercentage: number;
  };
  refereeDto: {
    skipReferee: boolean;
    refereeFullName?: string;
    memberId?: string;
    refereeEmail?: string;
    relationship?: string;
    howLongKnown?: number;
  };
  signSubmitDto: {
    signatureType: string;
    signatureName?: string;
    signatureImageDataUrl?: string;
    informationAccurate: boolean;
    agreedToBylaws: boolean;
    consentToDataProcessing: boolean;
  };
  termsAccepted: boolean;
  title: string;
};

/** The native date input gives us ISO "YYYY-MM-DD" — the backend wants "DD-MM-YYYY". */
function toDdMmYyyy(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}-${month}-${year}`;
}

export const PASSWORD_RULES: { test: (p: string) => boolean; label: string }[] = [
  { test: (p) => p.length >= 8, label: "at least 8 characters" },
  { test: (p) => /[A-Z]/.test(p), label: "one uppercase letter" },
  { test: (p) => /[a-z]/.test(p), label: "one lowercase letter" },
  { test: (p) => /\d/.test(p), label: "one digit" },
  { test: (p) => /[^A-Za-z0-9]/.test(p), label: "one special character" },
];

export async function buildRegisterRequest(data: ApplyData): Promise<RegisterRequest> {
  const yearsInRole = data.yearsInRole.trim() === "" ? undefined : Number(data.yearsInRole);
  const howLongKnown =
    data.refereeKnownDuration.trim() === "" ? undefined : Number(data.refereeKnownDuration);

  // gender is the one enum-ish field with no native <select required> behind
  // it (it's a button group), so it's the only one that can reach here empty.
  if (!data.gender) {
    throw new Error("Please select a gender on the Basic Information step.");
  }

  const employmentStatus = EMPLOYMENT_STATUS_MAP[data.employmentStatus];
  if (employmentStatus === undefined) {
    throw new Error("Please select a valid employment status before submitting.");
  }

  // Some browsers' native date input lets an extra keystroke produce a
  // malformed year (e.g. "20000-02-09") that still looks like a value —
  // the backend's strict DateOnly parser then rejects it. Catch it here too.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.dob)) {
    throw new Error("Please re-enter a valid date of birth on the Basic Information step.");
  }

  const failedPasswordRules = PASSWORD_RULES.filter((rule) => !rule.test(data.password));
  if (failedPasswordRules.length > 0) {
    throw new Error(`Password must contain ${failedPasswordRules.map((r) => r.label).join(", ")}.`);
  }

  const sharePercentage = Number(data.nokSharePercentage);
  if (Number.isNaN(sharePercentage) || sharePercentage < 0 || sharePercentage > 100) {
    throw new Error("Please enter a valid share percentage (0-100) on the Next of Kin step.");
  }

  return {
    basicInfo: {
      firstName: data.firstName,
      middleName: data.middleName || undefined,
      lastName: data.lastName,
      gender: data.gender,
      dateOfBirth: toDdMmYyyy(data.dob),
      residencyStatus: data.residencyStatus,
      provinceOfResidence: data.provinceOfResidence,
    },
    contactInfo: {
      homeAddress: data.homeAddress,
      city: data.city,
      postalCode: data.postalCode,
      province: data.province,
      country: data.country,
      phoneNumber: data.phone,
      personalEmail: data.email,
    },
    employmentInfoDto: {
      status: employmentStatus,
      employerName: data.employerName || undefined,
      industry: data.industry || undefined,
      jobTitle: data.jobTitle || undefined,
      workLocation: data.workLocation || undefined,
      yearsInRole: yearsInRole === undefined || Number.isNaN(yearsInRole) ? undefined : yearsInRole,
    },
    DeviceInfo: await collectDeviceInfo(),
    Password: data.password,
    nextOfKinDto: {
      fullName: data.nokFullName,
      relationship: data.nokRelationship,
      email: data.nokEmail,
      phoneNumber: data.nokPhone,
      isPrimaryBeneficiary: data.nokPrimaryBeneficiary,
      sharePercentage,
    },
    refereeDto: data.refereeSkipped
      ? { skipReferee: true }
      : {
          skipReferee: false,
          refereeFullName: data.refereeFullName || undefined,
          memberId: data.refereeMemberId || undefined,
          refereeEmail: data.refereeEmail || undefined,
          relationship: data.refereeRelationship || undefined,
          howLongKnown: howLongKnown === undefined || Number.isNaN(howLongKnown) ? undefined : howLongKnown,
        },
    signSubmitDto: {
      signatureType: data.signatureMode === "drawn" ? "Drawn" : "Typed",
      // Always populated: the typed signature text when typed, otherwise
      // the applicant's legal name (there's no name text at all in drawn
      // mode, but the backend expects signatureName regardless of type).
      signatureName: data.signature || `${data.firstName} ${data.lastName}`.trim(),
      signatureImageDataUrl:
        data.signatureMode === "drawn" && data.signatureImageDataUrl
          ? data.signatureImageDataUrl
          : undefined,
      informationAccurate: data.agreeInfoTrue,
      agreedToBylaws: data.agreeBylaws,
      consentToDataProcessing: data.agreeConsent,
    },
    termsAccepted: data.agreeInfoTrue && data.agreeBylaws && data.agreeConsent,
    title: data.title,
  };
}
