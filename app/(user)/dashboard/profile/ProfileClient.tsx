"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Loader2, ShieldCheck, ShieldAlert, Monitor, X } from "lucide-react";
import { memberProfileApiFetch, getApiErrorMessage } from "@/app/lib/api-client";
import { collectDeviceInfo } from "@/app/lib/device-info";
import { useCurrentUser } from "@/app/lib/useCurrentUser";
import {
  pluckMember,
  formatDate,
  formatDateTime,
  buildEditUserDto,
  GENDERS,
  EMPLOYMENT_STATUSES,
  KIN_RELATIONSHIPS,
  type MemberDetail,
  type BasicInfoDto,
  type EditContactInfoDto,
  type EmploymentInfoDto,
  type NextOfKinDto,
  type RefereeDto,
} from "@/app/lib/member-profile";

type EditState =
  | { section: "personal"; data: BasicInfoDto & { title: string } }
  | { section: "contact"; data: EditContactInfoDto }
  | { section: "employment"; data: EmploymentInfoDto }
  | { section: "nextOfKin"; data: NextOfKinDto }
  | { section: "referee"; data: RefereeDto }
  | null;

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl p-6 md:p-8" style={{ background: "var(--dash-surface)" }}>
      {children}
    </div>
  );
}

function SectionHeader({ eyebrow, title, onEdit }: { eyebrow: string; title: string; onEdit?: () => void }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">{eyebrow}</p>
        <h2 className="text-xl font-bold" style={{ color: "var(--dash-text)" }}>
          {title}
        </h2>
      </div>
      {onEdit && (
        <button type="button" onClick={onEdit} className="text-xs font-bold text-amber-600 hover:text-amber-700 mt-1">
          Edit
        </button>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-4 border-b pb-4 last:border-0 last:pb-0" style={{ borderColor: "var(--dash-border)" }}>
      <span style={{ color: "var(--dash-muted)" }}>{label}</span>
      <span className="font-semibold text-right" style={{ color: "var(--dash-text)" }}>
        {value || "—"}
      </span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold mb-1.5" style={{ color: "var(--dash-muted)" }}>
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-amber-400/40 transition-all";

function inputStyle(): React.CSSProperties {
  return { background: "var(--dash-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text)" };
}

export function ProfileClient() {
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  const [editState, setEditState] = useState<EditState>(null);

  const { data: member, isLoading, isError, error } = useQuery({
    queryKey: ["my-profile", user?.id],
    queryFn: async () => {
      const res = await memberProfileApiFetch<unknown>(`/api/User/GetById?userId=${encodeURIComponent(user!.id!)}`);
      return pluckMember(res);
    },
    enabled: Boolean(user?.id),
  });

  const save = useMutation({
    mutationFn: async (state: NonNullable<EditState>) => {
      const device = await collectDeviceInfo();
      const overrides =
        state.section === "personal"
          ? { basicInfo: state.data, title: state.data.title }
          : state.section === "contact"
            ? { contact: state.data }
            : state.section === "employment"
              ? { employment: state.data }
              : state.section === "nextOfKin"
                ? { nextOfKin: state.data }
                : { referee: state.data };
      const body = buildEditUserDto(member as MemberDetail, overrides, device);
      return memberProfileApiFetch(`/api/User/UpdateUserData/${(member as MemberDetail).id}`, {
        method: "PUT",
        body,
      });
    },
    onSuccess: () => {
      toast.success("Profile updated.");
      queryClient.invalidateQueries({ queryKey: ["my-profile", user?.id] });
      setEditState(null);
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err));
    },
  });

  const name = member
    ? [member.basicInfo?.firstName, member.basicInfo?.lastName].filter(Boolean).join(" ") || member.email
    : undefined;
  const initials =
    (name ?? "?").trim().split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join("") || "?";

  const openEdit = (section: NonNullable<EditState>["section"]) => {
    if (!member) return;
    const seed = buildEditUserDto(member, {}, { deviceID: null, deviceOS: null, fingerprint: null, lastIp: null });
    if (section === "personal") setEditState({ section, data: { ...seed.basicInfo, title: seed.title } });
    else if (section === "contact") setEditState({ section, data: seed.editcontactInfo });
    else if (section === "employment") setEditState({ section, data: seed.employmentInfoDto });
    else if (section === "nextOfKin") setEditState({ section, data: seed.nextOfKinDto });
    else setEditState({ section, data: seed.refereeDto });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 md:space-y-6 pb-10" style={{ color: "var(--dash-text)" }}>
      {isLoading && (
        <div className="p-10 text-center text-sm" style={{ color: "var(--dash-muted)" }}>
          Loading your profile…
        </div>
      )}

      {isError && (
        <div className="p-10 text-center text-sm text-red-600">{getApiErrorMessage(error)}</div>
      )}

      {member && (
        <>
          {/* Top Avatar Card */}
          <div
            className="rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            style={{ background: "var(--dash-surface)" }}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-amber-100 flex items-center justify-center text-3xl font-medium text-[#111] shrink-0">
                {initials}
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-1">{name ?? "Unnamed member"}</h1>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--dash-muted)" }}>
                  Joined {formatDate(member.createdAt)}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border"
                    style={
                      member.isVerified
                        ? { background: "#f0fdf4", color: "#15803d", borderColor: "#bbf7d0" }
                        : { background: "var(--dash-bg)", color: "var(--dash-muted)", borderColor: "var(--dash-border)" }
                    }
                  >
                    {member.isVerified ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                    {member.isVerified ? "Identity verified" : "Not yet verified"}
                  </span>
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-semibold border"
                    style={
                      member.isActive
                        ? { background: "#f0fdf4", color: "#15803d", borderColor: "#bbf7d0" }
                        : { background: "var(--dash-bg)", color: "var(--dash-muted)", borderColor: "var(--dash-border)" }
                    }
                  >
                    {member.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 items-start">
            {/* LEFT COLUMN */}
            <div className="space-y-4 md:space-y-6">
              <Card>
                <SectionHeader eyebrow="01 — PERSONAL" title="Personal information" onEdit={() => openEdit("personal")} />
                <div className="space-y-5 text-sm">
                  <Row label="Full name" value={name} />
                  <Row label="Date of birth" value={formatDate(member.basicInfo?.dateOfBirth)} />
                  <Row label="Gender" value={member.basicInfo?.gender} />
                  <Row label="Residency status" value={member.basicInfo?.residencyStatus} />
                  <Row label="Province of residence" value={member.basicInfo?.provinceOfResidence} />
                </div>
              </Card>

              <Card>
                <SectionHeader eyebrow="02 — CONTACT" title="Contact information" onEdit={() => openEdit("contact")} />
                <div className="space-y-5 text-sm">
                  <Row label="Email" value={member.contact?.personalEmail ?? member.email} />
                  <Row label="Phone" value={member.contact?.phoneNumber} />
                  <Row
                    label="Address"
                    value={
                      [member.contact?.homeAddress, member.contact?.city, member.contact?.province, member.contact?.country]
                        .filter(Boolean)
                        .join(", ") || null
                    }
                  />
                </div>
              </Card>

              <Card>
                <SectionHeader eyebrow="03 — EMPLOYMENT" title="Employment" onEdit={() => openEdit("employment")} />
                <div className="space-y-5 text-sm">
                  <Row label="Status" value={member.employment?.status} />
                  <Row label="Employer" value={member.employment?.employerName} />
                  <Row label="Industry" value={member.employment?.industry} />
                  <Row label="Job title" value={member.employment?.jobTitle} />
                  <Row label="Work location" value={member.employment?.workLocation} />
                </div>
              </Card>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-4 md:space-y-6">
              <Card>
                <SectionHeader eyebrow="04 — NEXT OF KIN" title="Next of kin" onEdit={() => openEdit("nextOfKin")} />
                <div className="space-y-5 text-sm">
                  <Row label="Full name" value={member.nextOfKin?.fullName} />
                  <Row label="Relationship" value={member.nextOfKin?.relationship} />
                  <Row label="Phone" value={member.nextOfKin?.phoneNumber} />
                  <Row label="Email" value={member.nextOfKin?.email} />
                </div>
              </Card>

              <Card>
                <SectionHeader eyebrow="05 — REFEREE" title="Referee" onEdit={() => openEdit("referee")} />
                {member.referee?.skipReferee ? (
                  <p className="text-sm" style={{ color: "var(--dash-muted)" }}>
                    You skipped adding a referee.
                  </p>
                ) : (
                  <div className="space-y-5 text-sm">
                    <Row label="Full name" value={member.referee?.refereeFullName} />
                    <Row label="Relationship" value={member.referee?.relationship} />
                    <Row label="Email" value={member.referee?.refereeEmail} />
                  </div>
                )}
              </Card>

              {member.deviceInfos.length > 0 && (
                <Card>
                  <SectionHeader eyebrow="06 — DEVICES" title="Trusted devices" />
                  <div className="space-y-3">
                    {member.deviceInfos.map((d) => (
                      <div
                        key={d.id}
                        className="rounded-xl border p-3 text-xs space-y-1"
                        style={{ borderColor: "var(--dash-border)" }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Monitor className="w-3.5 h-3.5" style={{ color: "var(--dash-muted)" }} />
                          <span className="font-semibold" style={{ color: "var(--dash-text)" }}>
                            {d.deviceOS ?? "Unknown device"}
                          </span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span style={{ color: "var(--dash-muted)" }}>Last IP</span>
                          <span style={{ color: "var(--dash-text)" }}>{d.lastIp ?? "—"}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span style={{ color: "var(--dash-muted)" }}>Trusted until</span>
                          <span style={{ color: "var(--dash-text)" }}>{formatDateTime(d.trustedUntil)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </>
      )}

      {editState && (
        <EditModal
          state={editState}
          isSaving={save.isPending}
          onCancel={() => setEditState(null)}
          onSave={(next) => save.mutate(next)}
        />
      )}
    </div>
  );
}

function EditModal({
  state,
  isSaving,
  onCancel,
  onSave,
}: {
  state: NonNullable<EditState>;
  isSaving: boolean;
  onCancel: () => void;
  onSave: (state: NonNullable<EditState>) => void;
}) {
  const [form, setForm] = useState(state.data);

  const titles: Record<NonNullable<EditState>["section"], string> = {
    personal: "Edit personal information",
    contact: "Edit contact information",
    employment: "Edit employment",
    nextOfKin: "Edit next of kin",
    referee: "Edit referee",
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...state, data: form } as NonNullable<EditState>);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div
        className="w-full max-w-lg rounded-3xl p-6 sm:p-8 max-h-[85vh] overflow-y-auto"
        style={{ background: "var(--dash-surface)" }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold" style={{ color: "var(--dash-text)" }}>
            {titles[state.section]}
          </h2>
          <button type="button" onClick={onCancel} aria-label="Close" style={{ color: "var(--dash-muted)" }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {state.section === "personal" && (
            <PersonalFields data={form as typeof state.data & { section: "personal" }} onChange={setForm as never} />
          )}
          {state.section === "contact" && <ContactFields data={form as EditContactInfoDto} onChange={setForm as never} />}
          {state.section === "employment" && (
            <EmploymentFields data={form as EmploymentInfoDto} onChange={setForm as never} />
          )}
          {state.section === "nextOfKin" && <NextOfKinFields data={form as NextOfKinDto} onChange={setForm as never} />}
          {state.section === "referee" && <RefereeFields data={form as RefereeDto} onChange={setForm as never} />}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-full text-sm font-semibold border"
              style={{ borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-[#111] text-white hover:bg-black transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSaving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <Field label={label}>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} style={inputStyle()} />
    </Field>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <Field label={label}>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} style={inputStyle()}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </Field>
  );
}

function PersonalFields({
  data,
  onChange,
}: {
  data: BasicInfoDto & { title: string };
  onChange: (d: BasicInfoDto & { title: string }) => void;
}) {
  return (
    <>
      <TextField label="Title" value={data.title} onChange={(v) => onChange({ ...data, title: v })} />
      <div className="grid grid-cols-2 gap-3">
        <TextField label="First name" value={data.firstName} onChange={(v) => onChange({ ...data, firstName: v })} />
        <TextField label="Last name" value={data.lastName} onChange={(v) => onChange({ ...data, lastName: v })} />
      </div>
      <TextField
        label="Middle name"
        value={data.middleName ?? ""}
        onChange={(v) => onChange({ ...data, middleName: v || null })}
      />
      <SelectField
        label="Gender"
        value={data.gender}
        options={GENDERS}
        onChange={(v) => onChange({ ...data, gender: v as BasicInfoDto["gender"] })}
      />
      <TextField label="Date of birth" type="date" value={data.dateOfBirth} onChange={(v) => onChange({ ...data, dateOfBirth: v })} />
      <TextField
        label="Residency status"
        value={data.residencyStatus}
        onChange={(v) => onChange({ ...data, residencyStatus: v })}
      />
      <TextField
        label="Province of residence"
        value={data.provinceOfResidence}
        onChange={(v) => onChange({ ...data, provinceOfResidence: v })}
      />
    </>
  );
}

function ContactFields({ data, onChange }: { data: EditContactInfoDto; onChange: (d: EditContactInfoDto) => void }) {
  return (
    <>
      <TextField label="Email" type="email" value={data.personalEmail} onChange={(v) => onChange({ ...data, personalEmail: v })} />
      <TextField label="Phone" value={data.phoneNumber} onChange={(v) => onChange({ ...data, phoneNumber: v })} />
      <TextField label="Home address" value={data.homeAddress} onChange={(v) => onChange({ ...data, homeAddress: v })} />
      <div className="grid grid-cols-2 gap-3">
        <TextField label="City" value={data.city} onChange={(v) => onChange({ ...data, city: v })} />
        <TextField label="Postal code" value={data.postalCode} onChange={(v) => onChange({ ...data, postalCode: v })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Province" value={data.province} onChange={(v) => onChange({ ...data, province: v })} />
        <TextField label="Country" value={data.country} onChange={(v) => onChange({ ...data, country: v })} />
      </div>
    </>
  );
}

function EmploymentFields({ data, onChange }: { data: EmploymentInfoDto; onChange: (d: EmploymentInfoDto) => void }) {
  return (
    <>
      <SelectField
        label="Status"
        value={data.status}
        options={EMPLOYMENT_STATUSES}
        onChange={(v) => onChange({ ...data, status: v as EmploymentInfoDto["status"] })}
      />
      <TextField
        label="Employer name"
        value={data.employerName ?? ""}
        onChange={(v) => onChange({ ...data, employerName: v || null })}
      />
      <TextField label="Industry" value={data.industry ?? ""} onChange={(v) => onChange({ ...data, industry: v || null })} />
      <TextField label="Job title" value={data.jobTitle ?? ""} onChange={(v) => onChange({ ...data, jobTitle: v || null })} />
      <TextField
        label="Work location"
        value={data.workLocation ?? ""}
        onChange={(v) => onChange({ ...data, workLocation: v || null })}
      />
      <TextField
        label="Years in role"
        type="number"
        value={data.yearsInRole?.toString() ?? ""}
        onChange={(v) => onChange({ ...data, yearsInRole: v === "" ? null : Number(v) })}
      />
    </>
  );
}

function NextOfKinFields({ data, onChange }: { data: NextOfKinDto; onChange: (d: NextOfKinDto) => void }) {
  return (
    <>
      <TextField label="Full name" value={data.fullName} onChange={(v) => onChange({ ...data, fullName: v })} />
      <SelectField
        label="Relationship"
        value={data.relationship}
        options={KIN_RELATIONSHIPS}
        onChange={(v) => onChange({ ...data, relationship: v as NextOfKinDto["relationship"] })}
      />
      <TextField label="Email" type="email" value={data.email} onChange={(v) => onChange({ ...data, email: v })} />
      <TextField label="Phone" value={data.phoneNumber} onChange={(v) => onChange({ ...data, phoneNumber: v })} />
      <TextField
        label="Share percentage"
        type="number"
        value={data.sharePercentage.toString()}
        onChange={(v) => onChange({ ...data, sharePercentage: Number(v) })}
      />
    </>
  );
}

function RefereeFields({ data, onChange }: { data: RefereeDto; onChange: (d: RefereeDto) => void }) {
  return (
    <>
      <label className="flex items-center gap-2 text-sm" style={{ color: "var(--dash-text)" }}>
        <input
          type="checkbox"
          checked={data.skipReferee}
          onChange={(e) => onChange({ ...data, skipReferee: e.target.checked })}
        />
        I don&apos;t want to add a referee
      </label>
      {!data.skipReferee && (
        <>
          <TextField
            label="Referee full name"
            value={data.refereeFullName ?? ""}
            onChange={(v) => onChange({ ...data, refereeFullName: v || null })}
          />
          <TextField
            label="Referee email"
            type="email"
            value={data.refereeEmail ?? ""}
            onChange={(v) => onChange({ ...data, refereeEmail: v || null })}
          />
          <TextField
            label="Relationship"
            value={data.relationship ?? ""}
            onChange={(v) => onChange({ ...data, relationship: v || null })}
          />
          <TextField
            label="How long known (years)"
            type="number"
            value={data.howLongKnown.toString()}
            onChange={(v) => onChange({ ...data, howLongKnown: Number(v) })}
          />
        </>
      )}
    </>
  );
}
