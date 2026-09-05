import type { SetupData } from "./useSetupStore";

export type CompleteSetupRequest = {
  profile: {
    cooperativeName: string;
    registrationNumber: string;
    foundedDate: string;
    headquartersAddress: string;
    defaultCurrencyCode: string;
    timeZoneId: string;
    publicMotto?: string;
    brand: {
      brandAccentHex: string;
      logo?: {
        assetId: string;
        fileName: string;
      };
    };
  };
  cooperativeLogo?: {
    fileName: string;
  };
  cycles: {
    cycleFrequency: string;
    dueDayOfMonth: number;
    lateGraceDays: number;
    minimumContributionAmount: number;
    maximumContributionAmount: number;
  };
  loanPolicy: {
    annualInterestRatePercent: number;
    interestRateType: "Flat";
    maxTermMonths: number;
    latePenaltyPercentPerMonth: number;
    eligibilityRequirements: {
      requireMinimumMembershipDuration: boolean;
      minimumMembershipMonths: number;
      requireGuarantor: boolean;
      minimumGuarantorCount: number;
      guarantorMustHaveNoActiveLoan: boolean;
      requireDebtToIncomeCheck: boolean;
      maximumDebtToIncomeRatioPercent: number;
      requireBankStatementUpload: boolean;
    };
  };
  withdrawalPolicy: {
    maximumPerCyclePercent: number;
    maxWithdrawalsPerCycle: number;
    blockRules: {
      blockIfActiveLoanExists: boolean;
      blockIfGuarantorOnOutstandingLoan: boolean;
      blockIfCycleContributionsInArrears: boolean;
      blockIfRecentlyJoined: boolean;
      minimumDaysSinceJoining: number;
    };
  };
  interacDestinations: {
    displayName: string;
    interacEmail: string;
    description: string;
    verificationStatus: "Pending" | "Verified";
  }[];
};

function toNumber(value: string, fieldLabel: string, stepName: string): number {
  const n = Number(value);
  if (value.trim() === "" || Number.isNaN(n)) {
    throw new Error(`Please enter a valid ${fieldLabel} on the ${stepName} step.`);
  }
  return n;
}

export function buildCompleteSetupRequest(data: SetupData): CompleteSetupRequest {
  if (!data.cooperativeAccountId) {
    throw new Error("Please create your account on the Welcome step first.");
  }
  if (
    !data.cooperativeName.trim() ||
    !data.rcNumber.trim() ||
    !data.founded.trim() ||
    !data.headquartersAddress.trim()
  ) {
    throw new Error("Please complete the Cooperative profile step before finalizing.");
  }

  return {
    profile: {
      cooperativeName: data.cooperativeName,
      registrationNumber: data.rcNumber,
      foundedDate: data.founded,
      headquartersAddress: data.headquartersAddress,
      defaultCurrencyCode: data.defaultCurrency,
      timeZoneId: data.timezone,
      publicMotto: data.publicMotto || undefined,
      brand: {
        brandAccentHex: data.brandAccentColor,
        logo:
          data.logoAssetId && data.logoFileName
            ? { assetId: data.logoAssetId, fileName: data.logoFileName }
            : undefined,
      },
    },
    cooperativeLogo: data.logoFileName ? { fileName: data.logoFileName } : undefined,
    cycles: {
      cycleFrequency: data.cycleFrequency,
      dueDayOfMonth: toNumber(data.dueDay, "due day", "Cycles & contributions"),
      lateGraceDays: toNumber(data.lateGrace, "late grace period", "Cycles & contributions"),
      minimumContributionAmount: toNumber(
        data.minMonthly,
        "minimum monthly contribution",
        "Cycles & contributions",
      ),
      maximumContributionAmount: toNumber(
        data.maxMonthly,
        "maximum monthly contribution",
        "Cycles & contributions",
      ),
    },
    loanPolicy: {
      annualInterestRatePercent: toNumber(data.interestRate, "interest rate", "Loan policy"),
      interestRateType: "Flat",
      maxTermMonths: toNumber(data.maxTermMonths, "max term", "Loan policy"),
      latePenaltyPercentPerMonth: toNumber(data.latePenalty, "late penalty", "Loan policy"),
      eligibilityRequirements: {
        requireMinimumMembershipDuration: data.requiresActiveMember,
        minimumMembershipMonths: toNumber(
          data.minimumMembershipMonths,
          "minimum membership duration",
          "Loan policy",
        ),
        requireGuarantor: data.requiresGuarantor,
        minimumGuarantorCount: toNumber(
          data.minimumGuarantorCount,
          "minimum guarantor count",
          "Loan policy",
        ),
        guarantorMustHaveNoActiveLoan: data.requiresGuarantor,
        requireDebtToIncomeCheck: data.requiresDebtToIncome,
        maximumDebtToIncomeRatioPercent: toNumber(
          data.maximumDebtToIncomeRatioPercent,
          "maximum debt-to-income ratio",
          "Loan policy",
        ),
        requireBankStatementUpload: data.requiresBankStatement,
      },
    },
    withdrawalPolicy: {
      maximumPerCyclePercent: toNumber(data.maxPerCycle, "maximum per cycle", "Withdrawal policy"),
      maxWithdrawalsPerCycle: toNumber(
        data.withdrawalFrequency,
        "withdrawal frequency",
        "Withdrawal policy",
      ),
      blockRules: {
        blockIfActiveLoanExists: data.blockActiveLoan,
        blockIfGuarantorOnOutstandingLoan: data.blockGuarantor,
        blockIfCycleContributionsInArrears: data.blockArrears,
        blockIfRecentlyJoined: data.blockNewMember,
        minimumDaysSinceJoining: toNumber(
          data.minimumDaysSinceJoining,
          "minimum days since joining",
          "Withdrawal policy",
        ),
      },
    },
    interacDestinations: data.destinations.map((d) => ({
      displayName: d.displayName,
      interacEmail: d.email,
      description: d.description,
      verificationStatus: d.verified ? "Verified" : "Pending",
    })),
  };
}
