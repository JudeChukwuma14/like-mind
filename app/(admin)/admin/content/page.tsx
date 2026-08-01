import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Content Management | Admin",
  description: "Review and moderate all platform content.",
};

const contentItems = [
  {
    id: 1,
    title: "Getting Started with Kajola",
    type: "Article",
    author: "Ada Okafor",
    status: "published",
    date: "Jul 10, 2026",
    flagged: false,
  },
  {
    id: 2,
    title: "Q3 Marketing Strategy",
    type: "Document",
    author: "Yemi Adeyemi",
    status: "draft",
    date: "Jul 14, 2026",
    flagged: false,
  },
  {
    id: 3,
    title: "Inappropriate Post #4821",
    type: "Post",
    author: "Unknown",
    status: "flagged",
    date: "Jul 15, 2026",
    flagged: true,
  },
  {
    id: 4,
    title: "Team Onboarding Guide",
    type: "Document",
    author: "Fatima Diallo",
    status: "published",
    date: "Jul 8, 2026",
    flagged: false,
  },
  {
    id: 5,
    title: "Sprint Retrospective Notes",
    type: "Note",
    author: "Kwame Mensah",
    status: "published",
    date: "Jul 12, 2026",
    flagged: false,
  },
  {
    id: 6,
    title: "Spam submission #892",
    type: "Post",
    author: "Sola Bello",
    status: "removed",
    date: "Jul 13, 2026",
    flagged: true,
  },
];

const statusStyles: Record<string, { bg: string; color: string }> = {
  published: { bg: "rgba(34,197,94,0.12)", color: "#4ade80" },
  draft: { bg: "rgba(99,102,241,0.12)", color: "#818cf8" },
  flagged: { bg: "rgba(245,158,11,0.15)", color: "#f59e0b" },
  removed: { bg: "rgba(239,68,68,0.12)", color: "#f87171" },
};

export default function AdminContentPage() {
  const flaggedCount = contentItems.filter((c) => c.flagged).length;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--admin-text)" }}
          >
            Content Management
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--admin-muted)" }}>
            Review, moderate, and manage all platform content.
          </p>
        </div>
        {flaggedCount > 0 && (
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
            style={{
              background: "rgba(239,68,68,0.12)",
              color: "#f87171",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            <span>⚑</span>
            <span>{flaggedCount} items need review</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div
        className="flex flex-wrap gap-2 p-4 rounded-2xl border"
        style={{
          background: "var(--admin-surface)",
          borderColor: "var(--admin-border)",
        }}
      >
        {["All", "Published", "Draft", "Flagged", "Removed"].map((filter) => (
          <button
            key={filter}
            id={`admin-content-filter-${filter.toLowerCase()}`}
            className="px-4 py-2 rounded-lg text-xs font-medium transition-all"
            style={
              filter === "All"
                ? {
                    background: "rgba(245,158,11,0.15)",
                    color: "#f59e0b",
                    border: "1px solid rgba(245,158,11,0.3)",
                  }
                : {
                    color: "var(--admin-muted)",
                    border: "1px solid var(--admin-border)",
                  }
            }
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Content table */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ borderColor: "var(--admin-border)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                className="text-xs uppercase tracking-wider border-b"
                style={{
                  background: "var(--admin-surface)",
                  borderColor: "var(--admin-border)",
                  color: "var(--admin-muted)",
                }}
              >
                {["Title", "Type", "Author", "Status", "Date", "Actions"].map(
                  (h) => (
                    <th key={h} className="px-5 py-4 text-left font-medium">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody
              className="divide-y"
              style={{ borderColor: "var(--admin-border)" }}
            >
              {contentItems.map((item) => (
                <tr
                  key={item.id}
                  id={`admin-content-row-${item.id}`}
                  className="transition-colors hover:bg-white/5"
                  style={{
                    background: item.flagged
                      ? "rgba(245,158,11,0.03)"
                      : "var(--admin-bg)",
                  }}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {item.flagged && (
                        <span style={{ color: "#f59e0b" }} title="Flagged">
                          ⚑
                        </span>
                      )}
                      <span
                        className="font-medium"
                        style={{ color: "var(--admin-text)" }}
                      >
                        {item.title}
                      </span>
                    </div>
                  </td>
                  <td
                    className="px-5 py-4 text-xs"
                    style={{ color: "var(--admin-muted)" }}
                  >
                    {item.type}
                  </td>
                  <td
                    className="px-5 py-4 text-xs"
                    style={{ color: "var(--admin-muted)" }}
                  >
                    {item.author}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-medium"
                      style={statusStyles[item.status]}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td
                    className="px-5 py-4 text-xs"
                    style={{ color: "var(--admin-muted)" }}
                  >
                    {item.date}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        id={`admin-view-content-${item.id}`}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-white/10"
                        style={{
                          color: "#f59e0b",
                          border: "1px solid rgba(245,158,11,0.2)",
                        }}
                      >
                        View
                      </button>
                      {item.status !== "removed" && (
                        <button
                          id={`admin-remove-content-${item.id}`}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-white/5"
                          style={{
                            color: "#f87171",
                            border: "1px solid rgba(239,68,68,0.2)",
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
