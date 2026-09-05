"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  User,
  Phone,
  MapPin,
  Briefcase,
  Users,
  FileCheck,
  Monitor,
} from "lucide-react";
import { adminApiFetch, getApiErrorMessage } from "@/app/lib/api-client";
import { pluckMember, formatDate, formatDateTime } from "@/app/lib/member-profile";

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeading({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-4 h-4 shrink-0" style={{ color: "var(--admin-primary)" }} />
      <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "var(--admin-muted)" }}>
        {label}
      </p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      className="flex justify-between items-start gap-4 py-2.5 border-b last:border-0"
      style={{ borderColor: "var(--admin-border)" }}
    >
      <span className="text-xs shrink-0" style={{ color: "var(--admin-muted)" }}>{label}</span>
      <span className="text-xs text-right font-medium" style={{ color: "var(--admin-text)" }}>
        {value || "—"}
      </span>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}
    >
      {children}
    </div>
  );
}

function BoolBadge({
  value,
  trueLabel = "Yes",
  falseLabel = "No",
}: {
  value: boolean | null;
  trueLabel?: string;
  falseLabel?: string;
}) {
  if (value === null) return <span style={{ color: "var(--admin-muted)" }}>—</span>;
  return (
    <span
      className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase"
      style={
        value
          ? { background: "#dcfce7", color: "#166534" }
          : { background: "var(--admin-border)", color: "var(--admin-muted)" }
      }
    >
      {value ? trueLabel : falseLabel}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: member,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin-user", id],
    queryFn: async () => {
      // The members list (/api/User/Users) mixes regular members and staff
      // together with no isStaff field to tell them apart in advance, so
      // there's no way to know which detail endpoint applies before trying.
      // GetById is the common case; if the target turns out to be staff,
      // fall back to the staff-specific lookup.
      try {
        const res = await adminApiFetch<unknown>(`/api/User/GetById?userId=${encodeURIComponent(id)}`);
        console.info("[AdminUsers] GET /api/User/GetById raw response:", res);
        return pluckMember(res);
      } catch (primaryErr) {
        try {
          const res = await adminApiFetch<unknown>(`/api/User/GetStaffById?userId=${encodeURIComponent(id)}`);
          console.info("[AdminUsers] GET /api/User/GetStaffById raw response:", res);
          return pluckMember(res);
        } catch {
          throw primaryErr;
        }
      }
    },
    enabled: Boolean(id),
  });

  const verify = useMutation({
    mutationFn: () =>
      adminApiFetch<unknown>(`/api/Auth/${id}/VerifyUser`, { method: "POST" }),
    onSuccess: () => {
      toast.success("Member verified.");
      queryClient.invalidateQueries({ queryKey: ["admin-user", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err));
    },
  });

  const activate = useMutation({
    mutationFn: () =>
      adminApiFetch<unknown>(`/api/Auth/${id}/activate`, { method: "POST" }),
    onSuccess: () => {
      toast.success("Member activated.");
      queryClient.invalidateQueries({ queryKey: ["admin-user", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err));
    },
  });

  const firstName = member?.basicInfo?.firstName ?? null;
  const lastName = member?.basicInfo?.lastName ?? null;
  const middleName = member?.basicInfo?.middleName ?? null;
  const name =
    [firstName, middleName, lastName].filter(Boolean).join(" ") ||
    member?.email ||
    "Unnamed member";

  const initials =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]!.toUpperCase())
      .join("") || "?";

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Back */}
      <button
        type="button"
        onClick={() => router.push("/admin/members")}
        className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
        style={{ color: "var(--admin-muted)" }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to members
      </button>

      {/* Loading / Error */}
      {isLoading && (
        <div className="p-10 text-center text-sm" style={{ color: "var(--admin-muted)" }}>
          Loading member…
        </div>
      )}
      {isError && (
        <div className="p-10 text-center text-sm" style={{ color: "var(--admin-accent)" }}>
          {getApiErrorMessage(error)}
        </div>
      )}

      {member && (
        <>
          {/* ── Hero card ── */}
          <div
            className="rounded-3xl border p-6 sm:p-8"
            style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}
          >
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold shrink-0"
                style={{ background: "var(--admin-primary)", color: "#000" }}
              >
                {initials}
              </div>
              <div className="min-w-0">
                {member.title && (
                  <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: "var(--admin-muted)" }}>
                    {member.title}
                  </p>
                )}
                <h1 className="text-2xl font-bold truncate" style={{ color: "var(--admin-text)" }}>
                  {name}
                </h1>
                <p className="text-sm mt-0.5 truncate" style={{ color: "var(--admin-muted)" }}>
                  {member.email ?? "—"}
                </p>
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase"
                    style={
                      member.isActive
                        ? { background: "#dcfce7", color: "#166534" }
                        : { background: "var(--admin-border)", color: "var(--admin-muted)" }
                    }
                  >
                    {member.isActive ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                    {member.isActive ? "Active" : "Inactive"}
                  </span>
                  {member.status && (
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase"
                      style={{ background: "var(--admin-border)", color: "var(--admin-muted)" }}
                    >
                      {member.status}
                    </span>
                  )}
                  {member.isVerified && (
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase"
                      style={{ background: "#dbeafe", color: "#1d4ed8" }}
                    >
                      Verified
                    </span>
                  )}
                  {member.isStaff && (
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase"
                      style={{ background: "#fef9c3", color: "#854d0e" }}
                    >
                      Staff
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick meta row */}
            <div
              className="mt-6 pt-6 border-t grid grid-cols-1 sm:grid-cols-3 gap-4"
              style={{ borderColor: "var(--admin-border)" }}
            >
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: "var(--admin-muted)" }}>Joined</p>
                <p className="text-sm" style={{ color: "var(--admin-text)" }}>{formatDate(member.createdAt)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: "var(--admin-muted)" }}>Last login</p>
                <p className="text-sm" style={{ color: "var(--admin-text)" }}>{formatDateTime(member.lastLogin)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: "var(--admin-muted)" }}>Terms accepted</p>
                <p className="text-sm" style={{ color: "var(--admin-text)" }}>{member.termsAccepted ? "Yes" : "No"}</p>
              </div>
            </div>
          </div>

          {/* ── Actions ── */}
          <div
            className="rounded-2xl border p-5 space-y-3"
            style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}
          >
            <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "var(--admin-muted)" }}>
              Actions
            </p>

            {/* Step 1 — Verify */}
            <div
              className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl"
              style={
                member.isVerified
                  ? { background: "#f0fdf4", border: "1px solid #bbf7d0" }
                  : { background: "var(--admin-bg)", border: "1px solid var(--admin-border)" }
              }
            >
              <div className="flex items-center gap-3">
                {/* Step indicator */}
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                  style={
                    member.isVerified
                      ? { background: "#16a34a", color: "#fff" }
                      : { background: "var(--admin-border)", color: "var(--admin-muted)" }
                  }
                >
                  {member.isVerified ? <ShieldCheck className="w-3 h-3" /> : "1"}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: member.isVerified ? "#15803d" : "var(--admin-text)" }}>
                    {member.isVerified ? "Identity verified" : "Step 1 — Verify member"}
                  </p>
                  <p className="text-xs" style={{ color: member.isVerified ? "#16a34a" : "var(--admin-muted)" }}>
                    {member.isVerified
                      ? "KYC and identity checks passed."
                      : "Confirm the member's identity before activation."}
                  </p>
                </div>
              </div>
              {!member.isVerified && (
                <button
                  type="button"
                  onClick={() => verify.mutate()}
                  disabled={verify.isPending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed shrink-0 hover:opacity-90 active:scale-95"
                  style={{ background: "var(--admin-text)", color: "var(--admin-bg)" }}
                >
                  {verify.isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</>
                  ) : (
                    <><ShieldCheck className="w-4 h-4" /> Verify member</>
                  )}
                </button>
              )}
            </div>

            {/* Step 2 — Activate */}
            <div
              className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl"
              style={
                member.isActive
                  ? { background: "#f0fdf4", border: "1px solid #bbf7d0" }
                  : member.isVerified
                    ? { background: "var(--admin-bg)", border: "1px solid var(--admin-border)" }
                    : { background: "var(--admin-bg)", border: "1px solid var(--admin-border)", opacity: 0.45 }
              }
            >
              <div className="flex items-center gap-3">
                {/* Step indicator */}
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                  style={
                    member.isActive
                      ? { background: "#16a34a", color: "#fff" }
                      : { background: "var(--admin-border)", color: "var(--admin-muted)" }
                  }
                >
                  {member.isActive ? <ShieldCheck className="w-3 h-3" /> : "2"}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: member.isActive ? "#15803d" : "var(--admin-text)" }}>
                    {member.isActive ? "Account activated" : "Step 2 — Activate member"}
                  </p>
                  <p className="text-xs" style={{ color: member.isActive ? "#16a34a" : "var(--admin-muted)" }}>
                    {member.isActive
                      ? "Member can log in and use the platform."
                      : member.isVerified
                        ? "Verified — ready to activate."
                        : "Complete Step 1 first."}
                  </p>
                </div>
              </div>
              {!member.isActive && member.isVerified && (
                <button
                  type="button"
                  onClick={() => activate.mutate()}
                  disabled={activate.isPending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed shrink-0 hover:opacity-90 active:scale-95"
                  style={{ background: "var(--admin-text)", color: "var(--admin-bg)" }}
                >
                  {activate.isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Activating…</>
                  ) : (
                    <><ShieldCheck className="w-4 h-4" /> Activate member</>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* ── Detail sections ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Info */}
            {member.basicInfo && (
              <Card>
                <SectionHeading icon={User} label="Basic Information" />
                <InfoRow label="First name" value={member.basicInfo.firstName} />
                <InfoRow label="Middle name" value={member.basicInfo.middleName} />
                <InfoRow label="Last name" value={member.basicInfo.lastName} />
                <InfoRow label="Gender" value={member.basicInfo.gender} />
                <InfoRow label="Date of birth" value={formatDate(member.basicInfo.dateOfBirth)} />
                <InfoRow label="Residency status" value={member.basicInfo.residencyStatus} />
                <InfoRow label="Province of residence" value={member.basicInfo.provinceOfResidence} />
              </Card>
            )}

            {/* Contact */}
            {member.contact && (
              <Card>
                <SectionHeading icon={Phone} label="Contact" />
                <InfoRow label="Phone" value={member.contact.phoneNumber} />
                <InfoRow label="Personal email" value={member.contact.personalEmail} />
                <InfoRow label="Address" value={member.contact.homeAddress} />
                <InfoRow label="City" value={member.contact.city} />
                <InfoRow label="Province" value={member.contact.province} />
                <InfoRow label="Postal code" value={member.contact.postalCode} />
                <InfoRow label="Country" value={member.contact.country} />
              </Card>
            )}

            {/* Employment */}
            {member.employment && (
              <Card>
                <SectionHeading icon={Briefcase} label="Employment" />
                <InfoRow label="Status" value={member.employment.status} />
                <InfoRow label="Employer" value={member.employment.employerName} />
                <InfoRow label="Industry" value={member.employment.industry} />
                <InfoRow label="Job title" value={member.employment.jobTitle} />
                <InfoRow label="Work location" value={member.employment.workLocation} />
                <InfoRow
                  label="Years in role"
                  value={
                    member.employment.yearsInRole !== null
                      ? `${member.employment.yearsInRole} yr${member.employment.yearsInRole === 1 ? "" : "s"}`
                      : null
                  }
                />
              </Card>
            )}

            {/* Next of Kin */}
            {member.nextOfKin && (
              <Card>
                <SectionHeading icon={Users} label="Next of Kin" />
                <InfoRow label="Full name" value={member.nextOfKin.fullName} />
                <InfoRow label="Relationship" value={member.nextOfKin.relationship} />
                <InfoRow label="Email" value={member.nextOfKin.email} />
                <InfoRow label="Phone" value={member.nextOfKin.phoneNumber} />
                <InfoRow
                  label="Share"
                  value={
                    member.nextOfKin.sharePercentage !== null
                      ? `${member.nextOfKin.sharePercentage}%`
                      : null
                  }
                />
                <InfoRow
                  label="Primary beneficiary"
                  value={<BoolBadge value={member.nextOfKin.isPrimaryBeneficiary} />}
                />
              </Card>
            )}

            {/* Referee */}
            {member.referee && (
              <Card>
                <SectionHeading icon={MapPin} label="Referee" />
                {member.referee.skipReferee ? (
                  <p className="text-xs" style={{ color: "var(--admin-muted)" }}>Referee was skipped.</p>
                ) : (
                  <>
                    <InfoRow label="Full name" value={member.referee.refereeFullName} />
                    <InfoRow label="Member ID" value={member.referee.memberId} />
                    <InfoRow label="Email" value={member.referee.refereeEmail} />
                    <InfoRow label="Relationship" value={member.referee.relationship} />
                    <InfoRow
                      label="How long known"
                      value={
                        member.referee.howLongKnown !== null
                          ? `${member.referee.howLongKnown} yr${member.referee.howLongKnown === 1 ? "" : "s"}`
                          : null
                      }
                    />
                  </>
                )}
              </Card>
            )}

            {/* KYC Attestation */}
            {member.kycAttestation && (
              <Card>
                <SectionHeading icon={FileCheck} label="KYC Attestation" />
                <InfoRow label="Signature kind" value={member.kycAttestation.signatureKind} />
                <InfoRow label="Signature name" value={member.kycAttestation.signatureName} />
                <InfoRow label="Bylaws version" value={member.kycAttestation.bylawsVersion} />
                <InfoRow label="Signed at" value={formatDateTime(member.kycAttestation.signedAtUtc)} />
                <InfoRow label="Signed from IP" value={member.kycAttestation.signedFromIp} />
                <InfoRow label="Info accurate" value={<BoolBadge value={member.kycAttestation.informationAccurate} />} />
                <InfoRow label="Agreed to bylaws" value={<BoolBadge value={member.kycAttestation.agreedToBylaws} />} />
                <InfoRow label="Data consent" value={<BoolBadge value={member.kycAttestation.consentToDataProcessing} />} />
              </Card>
            )}
          </div>

          {/* ── Devices ── */}
          {member.deviceInfos.length > 0 && (
            <Card>
              <SectionHeading icon={Monitor} label={`Devices (${member.deviceInfos.length})`} />
              <div className="space-y-3">
                {member.deviceInfos.map((d) => (
                  <div
                    key={d.id}
                    className="rounded-xl border p-3 text-xs space-y-1"
                    style={{ borderColor: "var(--admin-border)" }}
                  >
                    <div className="flex justify-between gap-2">
                      <span style={{ color: "var(--admin-muted)" }}>Device OS</span>
                      <span className="font-medium" style={{ color: "var(--admin-text)" }}>{d.deviceOS ?? "—"}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span style={{ color: "var(--admin-muted)" }}>Device ID</span>
                      <span className="font-mono truncate max-w-[180px]" style={{ color: "var(--admin-text)" }}>{d.deviceID ?? "—"}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span style={{ color: "var(--admin-muted)" }}>Last IP</span>
                      <span style={{ color: "var(--admin-text)" }}>{d.lastIp ?? "—"}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span style={{ color: "var(--admin-muted)" }}>Trusted until</span>
                      <span style={{ color: "var(--admin-text)" }}>{formatDateTime(d.trustedUntil)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Member ID footer */}
          {member.id && (
            <p className="pt-4 text-[10px] font-mono truncate" style={{ color: "var(--admin-muted)" }}>
              ID: {member.id}
            </p>
          )}
        </>
      )}
    </div>
  );
}
