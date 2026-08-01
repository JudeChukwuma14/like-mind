import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "System Settings | Admin",
  description: "Configure global Kajola platform settings.",
};

const toggleSettings = [
  {
    id: "admin-setting-maintenance",
    label: "Maintenance Mode",
    description:
      "Temporarily take the platform offline for maintenance. Users will see a maintenance page.",
    defaultChecked: false,
    danger: true,
  },
  {
    id: "admin-setting-registrations",
    label: "Open Registrations",
    description:
      "Allow new users to sign up. Disable to make the platform invite-only.",
    defaultChecked: true,
    danger: false,
  },
  {
    id: "admin-setting-email-verification",
    label: "Email Verification Required",
    description:
      "New users must verify their email before accessing the platform.",
    defaultChecked: true,
    danger: false,
  },
  {
    id: "admin-setting-audit-log",
    label: "Audit Logging",
    description:
      "Record all admin actions to the audit log for compliance purposes.",
    defaultChecked: true,
    danger: false,
  },
];

export default function AdminSettingsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--admin-text)" }}
        >
          System Settings
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--admin-muted)" }}>
          Configure global platform behaviour, security, and integrations.
        </p>
      </div>

      {/* General settings */}
      <div
        className="p-6 rounded-2xl border"
        style={{
          background: "var(--admin-surface)",
          borderColor: "var(--admin-border)",
        }}
      >
        <h2
          className="font-semibold mb-1"
          style={{ color: "var(--admin-text)" }}
        >
          General
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--admin-muted)" }}>
          Basic platform configuration.
        </p>
        <form id="admin-general-form" className="space-y-5">
          {[
            {
              id: "admin-platform-name",
              label: "Platform Name",
              value: "Kajola",
              type: "text",
            },
            {
              id: "admin-support-email",
              label: "Support Email",
              value: "support@kajola.io",
              type: "email",
            },
            {
              id: "admin-max-users",
              label: "Max Users per Workspace",
              value: "100",
              type: "number",
            },
          ].map((field) => (
            <div key={field.id} className="flex flex-col gap-1.5">
              <label
                htmlFor={field.id}
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--admin-muted)" }}
              >
                {field.label}
              </label>
              <input
                id={field.id}
                type={field.type}
                defaultValue={field.value}
                className="px-4 py-3 rounded-xl text-sm outline-none"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--admin-border)",
                  color: "var(--admin-text)",
                }}
              />
            </div>
          ))}
          <div className="flex justify-end">
            <button
              id="admin-save-general"
              type="submit"
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #f59e0b, #ef4444)",
              }}
            >
              Save changes
            </button>
          </div>
        </form>
      </div>

      {/* Toggle settings */}
      <div
        className="p-6 rounded-2xl border"
        style={{
          background: "var(--admin-surface)",
          borderColor: "var(--admin-border)",
        }}
      >
        <h2
          className="font-semibold mb-1"
          style={{ color: "var(--admin-text)" }}
        >
          Feature Flags
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--admin-muted)" }}>
          Toggle platform features on or off globally.
        </p>
        <ul
          className="space-y-1 divide-y"
          style={{ borderColor: "var(--admin-border)" }}
        >
          {toggleSettings.map((s) => (
            <li
              key={s.id}
              className="flex items-start justify-between gap-4 py-5"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--admin-text)" }}
                  >
                    {s.label}
                  </p>
                  {s.danger && (
                    <span
                      className="px-2 py-0.5 rounded text-xs font-semibold"
                      style={{
                        background: "rgba(239,68,68,0.15)",
                        color: "#f87171",
                      }}
                    >
                      Caution
                    </span>
                  )}
                </div>
                <p
                  className="text-xs mt-1 leading-relaxed"
                  style={{ color: "var(--admin-muted)" }}
                >
                  {s.description}
                </p>
              </div>
              <label
                htmlFor={s.id}
                className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1"
              >
                <input
                  id={s.id}
                  type="checkbox"
                  defaultChecked={s.defaultChecked}
                  className="sr-only peer"
                />
                <div
                  className="w-10 h-6 rounded-full peer-checked:opacity-100 transition-all"
                  style={{
                    background: s.danger
                      ? "rgba(239,68,68,0.5)"
                      : "rgba(245,158,11,0.5)",
                  }}
                />
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Danger zone */}
      <div
        className="p-6 rounded-2xl border"
        style={{
          background: "rgba(239,68,68,0.04)",
          borderColor: "rgba(239,68,68,0.2)",
        }}
      >
        <h2 className="font-semibold mb-1" style={{ color: "#f87171" }}>
          Danger Zone
        </h2>
        <p className="text-sm mb-5" style={{ color: "var(--admin-muted)" }}>
          Irreversible platform-level actions. Proceed with extreme caution.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            id="admin-reset-platform"
            type="button"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "rgba(239,68,68,0.6)" }}
          >
            Reset Platform Data
          </button>
          <button
            id="admin-purge-cache"
            type="button"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
            style={{
              color: "var(--admin-muted)",
              border: "1px solid var(--admin-border)",
            }}
          >
            Purge Cache
          </button>
        </div>
      </div>
    </div>
  );
}
