

export type BasicInfo = {
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  residencyStatus: string | null;
  provinceOfResidence: string | null;
};

export type Contact = {
  homeAddress: string | null;
  city: string | null;
  postalCode: string | null;
  province: string | null;
  country: string | null;
  phoneNumber: string | null;
  personalEmail: string | null;
};

export type Employment = {
  status: string | null;
  employerName: string | null;
  industry: string | null;
  jobTitle: string | null;
  workLocation: string | null;
  yearsInRole: number | null;
};

export type NextOfKin = {
  fullName: string | null;
  relationship: string | null;
  email: string | null;
  phoneNumber: string | null;
  sharePercentage: number | null;
  isPrimaryBeneficiary: boolean | null;
};

export type Referee = {
  skipReferee: boolean | null;
  refereeFullName: string | null;
  memberId: string | null;
  refereeEmail: string | null;
  relationship: string | null;
  howLongKnown: number | null;
};

export type KycAttestation = {
  signatureKind: string | null;
  signatureName: string | null;
  informationAccurate: boolean | null;
  agreedToBylaws: boolean | null;
  consentToDataProcessing: boolean | null;
  bylawsVersion: string | null;
  signedAtUtc: string | null;
  signedFromIp: string | null;
};

export type MemberDeviceInfo = {
  id: string;
  deviceID: string | null;
  deviceOS: string | null;
  fingerprint: string | null;
  lastIp: string | null;
  trustedUntil: string | null;
};

export type MemberDetail = {
  id: string;
  email: string | null;
  title: string | null;
  isActive: boolean;
  isVerified: boolean;
  isStaff: boolean;
  status: string | null;
  termsAccepted: boolean;
  lastLogin: string | null;
  createdAt: string | null;
  basicInfo: BasicInfo | null;
  contact: Contact | null;
  employment: Employment | null;
  nextOfKin: NextOfKin | null;
  referee: Referee | null;
  kycAttestation: KycAttestation | null;
  deviceInfos: MemberDeviceInfo[];
};

function s(obj: Record<string, unknown>, key: string): string | null {
  return typeof obj[key] === "string" ? (obj[key] as string) : null;
}
function b(obj: Record<string, unknown>, key: string): boolean {
  return typeof obj[key] === "boolean" ? (obj[key] as boolean) : false;
}
function n(obj: Record<string, unknown>, key: string): number | null {
  return typeof obj[key] === "number" ? (obj[key] as number) : null;
}
function asObj(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}
function asArr<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

export function pluckMember(raw: unknown): MemberDetail {
  const envelope = asObj(raw) ?? {};
  const data = asObj(envelope.data) ?? asObj(raw) ?? {};

  const bi = asObj(data.basicInfo);
  const co = asObj(data.contact);
  const em = asObj(data.employment);
  const nk = asObj(data.nextOfKin);
  const rf = asObj(data.referee);
  const kc = asObj(data.kycAttestation);
  const devices = asArr<Record<string, unknown>>(data.deviceInfos);

  return {
    id: s(data, "id") ?? "",
    email: s(data, "email"),
    title: s(data, "title"),
    isActive: b(data, "isActive"),
    isVerified: b(data, "isVerified"),
    isStaff: b(data, "isStaff"),
    status: s(data, "status"),
    termsAccepted: b(data, "termsAccepted"),
    lastLogin: s(data, "lastLogin"),
    createdAt: s(data, "createdAt"),
    basicInfo: bi
      ? {
          firstName: s(bi, "firstName"),
          middleName: s(bi, "middleName"),
          lastName: s(bi, "lastName"),
          gender: s(bi, "gender"),
          dateOfBirth: s(bi, "dateOfBirth"),
          residencyStatus: s(bi, "residencyStatus"),
          provinceOfResidence: s(bi, "provinceOfResidence"),
        }
      : null,
    contact: co
      ? {
          homeAddress: s(co, "homeAddress"),
          city: s(co, "city"),
          postalCode: s(co, "postalCode"),
          province: s(co, "province"),
          country: s(co, "country"),
          phoneNumber: s(co, "phoneNumber"),
          personalEmail: s(co, "personalEmail"),
        }
      : null,
    employment: em
      ? {
          status: s(em, "status"),
          employerName: s(em, "employerName"),
          industry: s(em, "industry"),
          jobTitle: s(em, "jobTitle"),
          workLocation: s(em, "workLocation"),
          yearsInRole: n(em, "yearsInRole"),
        }
      : null,
    nextOfKin: nk
      ? {
          fullName: s(nk, "fullName"),
          relationship: s(nk, "relationship"),
          email: s(nk, "email"),
          phoneNumber: s(nk, "phoneNumber"),
          sharePercentage: n(nk, "sharePercentage"),
          isPrimaryBeneficiary: typeof nk.isPrimaryBeneficiary === "boolean" ? nk.isPrimaryBeneficiary : null,
        }
      : null,
    referee: rf
      ? {
          skipReferee: typeof rf.skipReferee === "boolean" ? rf.skipReferee : null,
          refereeFullName: s(rf, "refereeFullName"),
          memberId: s(rf, "memberId"),
          refereeEmail: s(rf, "refereeEmail"),
          relationship: s(rf, "relationship"),
          howLongKnown: n(rf, "howLongKnown"),
        }
      : null,
    kycAttestation: kc
      ? {
          signatureKind: s(kc, "signatureKind"),
          signatureName: s(kc, "signatureName"),
          informationAccurate: typeof kc.informationAccurate === "boolean" ? kc.informationAccurate : null,
          agreedToBylaws: typeof kc.agreedToBylaws === "boolean" ? kc.agreedToBylaws : null,
          consentToDataProcessing:
            typeof kc.consentToDataProcessing === "boolean" ? kc.consentToDataProcessing : null,
          bylawsVersion: s(kc, "bylawsVersion"),
          signedAtUtc: s(kc, "signedAtUtc"),
          signedFromIp: s(kc, "signedFromIp"),
        }
      : null,
    deviceInfos: devices.map((d) => ({
      id: s(d, "id") ?? "",
      deviceID: s(d, "deviceID"),
      deviceOS: s(d, "deviceOS"),
      fingerprint: s(d, "fingerprint"),
      lastIp: s(d, "lastIp"),
      trustedUntil: s(d, "trustedUntil"),
    })),
  };
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}



export const GENDERS = ["Female", "Male", "NonBinary", "PreferNotToSay"] as const;
export type Gender = (typeof GENDERS)[number];

export const EMPLOYMENT_STATUSES = ["Employed", "SelfEmployed", "BusinessOwner", "Student", "Retired"] as const;
export type EmploymentStatus = (typeof EMPLOYMENT_STATUSES)[number];

export const KIN_RELATIONSHIPS = ["Spouse", "Parent", "Child", "Sibling", "Other"] as const;
export type KinRelationship = (typeof KIN_RELATIONSHIPS)[number];

export type BasicInfoDto = {
  firstName: string;
  middleName: string | null;
  lastName: string;
  gender: Gender;
  dateOfBirth: string;
  residencyStatus: string;
  provinceOfResidence: string;
};

export type EditContactInfoDto = {
  homeAddress: string;
  city: string;
  postalCode: string;
  province: string;
  country: string;
  phoneNumber: string;
  personalEmail: string;
  oldPersonalEmail: string;
  oldPersonalPhoneNumber: string;
};

export type EmploymentInfoDto = {
  status: EmploymentStatus;
  employerName: string | null;
  industry: string | null;
  jobTitle: string | null;
  workLocation: string | null;
  yearsInRole: number | null;
};

export type UpdateDeviceInfoDto = {
  deviceID: string | null;
  deviceOS: string | null;
  fingerprint: string | null;
  lastIp: string | null;
};

export type NextOfKinDto = {
  fullName: string;
  sharePercentage: number;
  relationship: KinRelationship;
  email: string;
  phoneNumber: string;
  isPrimaryBeneficiary: boolean;
};

export type RefereeDto = {
  skipReferee: boolean;
  refereeFullName: string | null;
  memberId: string | null;
  refereeEmail: string | null;
  relationship: string | null;
  howLongKnown: number;
};

export type EditUserDto = {
  basicInfo: BasicInfoDto;
  editcontactInfo: EditContactInfoDto;
  employmentInfoDto: EmploymentInfoDto;
  DeviceInfo: UpdateDeviceInfoDto;
  nextOfKinDto: NextOfKinDto;
  refereeDto: RefereeDto;
  title: string;
};


export function buildEditUserDto(
  current: MemberDetail,
  overrides: Partial<{
    basicInfo: BasicInfoDto;
    contact: EditContactInfoDto;
    employment: EmploymentInfoDto;
    nextOfKin: NextOfKinDto;
    referee: RefereeDto;
    title: string;
  }>,
  device: UpdateDeviceInfoDto,
): EditUserDto {
  const bi = current.basicInfo;
  const co = current.contact;
  const em = current.employment;
  const nk = current.nextOfKin;
  const rf = current.referee;

  return {
    basicInfo: overrides.basicInfo ?? {
      firstName: bi?.firstName ?? "",
      middleName: bi?.middleName ?? null,
      lastName: bi?.lastName ?? "",
      gender: (bi?.gender as Gender) ?? "PreferNotToSay",
      dateOfBirth: bi?.dateOfBirth ?? "",
      residencyStatus: bi?.residencyStatus ?? "",
      provinceOfResidence: bi?.provinceOfResidence ?? "",
    },
    editcontactInfo: overrides.contact ?? {
      homeAddress: co?.homeAddress ?? "",
      city: co?.city ?? "",
      postalCode: co?.postalCode ?? "",
      province: co?.province ?? "",
      country: co?.country ?? "",
      phoneNumber: co?.phoneNumber ?? "",
      personalEmail: co?.personalEmail ?? "",
      oldPersonalEmail: co?.personalEmail ?? "",
      oldPersonalPhoneNumber: co?.phoneNumber ?? "",
    },
    employmentInfoDto: overrides.employment ?? {
      status: (em?.status as EmploymentStatus) ?? "Employed",
      employerName: em?.employerName ?? null,
      industry: em?.industry ?? null,
      jobTitle: em?.jobTitle ?? null,
      workLocation: em?.workLocation ?? null,
      yearsInRole: em?.yearsInRole ?? null,
    },
    DeviceInfo: device,
    nextOfKinDto: overrides.nextOfKin ?? {
      fullName: nk?.fullName ?? "",
      sharePercentage: nk?.sharePercentage ?? 0,
      relationship: (nk?.relationship as KinRelationship) ?? "Other",
      email: nk?.email ?? "",
      phoneNumber: nk?.phoneNumber ?? "",
      isPrimaryBeneficiary: nk?.isPrimaryBeneficiary ?? false,
    },
    refereeDto: overrides.referee ?? {
      skipReferee: rf?.skipReferee ?? true,
      refereeFullName: rf?.refereeFullName ?? null,
      memberId: rf?.memberId ?? null,
      refereeEmail: rf?.refereeEmail ?? null,
      relationship: rf?.relationship ?? null,
      howLongKnown: rf?.howLongKnown ?? 0,
    },
    title: overrides.title ?? current.title ?? "",
  };
}
