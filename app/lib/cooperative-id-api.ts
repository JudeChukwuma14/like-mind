import { ApiError, adminApiFetch } from "@/app/lib/api-client";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type CooperativeOption = { id: string; createdAt: string | null };

/** The temporary list endpoint is not user-scoped. Never infer authorization from it. */
export function parseCooperatives(response: unknown): CooperativeOption[] {
  if (!response || typeof response !== "object" || Array.isArray(response)) {
    throw new Error("GetAllCooperatives returned an invalid response.");
  }
  const envelope = response as Record<string, unknown>;
  if (envelope.success === false) {
    throw new ApiError(
      typeof envelope.message === "string" && envelope.message.trim()
        ? envelope.message
        : "Could not load cooperatives.",
      typeof envelope.statusCode === "number" ? envelope.statusCode : 0,
      response,
    );
  }
  if (envelope.success !== true || !Array.isArray(envelope.data)) {
    throw new Error("GetAllCooperatives did not return a cooperative list.");
  }

  const seen = new Set<string>();
  return envelope.data.map((item: unknown) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error("GetAllCooperatives returned an invalid cooperative entry.");
    }
    const entry = item as Record<string, unknown>;
    if (typeof entry.id !== "string" || !UUID.test(entry.id)) {
      throw new Error("GetAllCooperatives returned an invalid cooperative ID.");
    }
    const id = entry.id.toLowerCase();
    if (seen.has(id)) throw new Error("GetAllCooperatives returned duplicate cooperative IDs.");
    seen.add(id);
    if (entry.createdAt !== undefined && entry.createdAt !== null && typeof entry.createdAt !== "string") {
      throw new Error("GetAllCooperatives returned an invalid creation date.");
    }
    return { id, createdAt: typeof entry.createdAt === "string" ? entry.createdAt : null };
  });
}

export async function getAllCooperatives(): Promise<CooperativeOption[]> {
  return parseCooperatives(await adminApiFetch<unknown>("/api/CooperativeAccount/GetAllCooperatives"));
}
