import { ApiError, adminApiFetch } from "@/app/lib/api-client";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * GET /api/CooperativeAccount/GetCooperativeId — single-cooperative-per-deployment
 * model. Takes no parameters; returns this deployment's one cooperative id. Call
 * once and reuse the id for every cooperative-scoped endpoint instead of asking
 * the admin to pick one — see `useCooperativeId`, the shared hook every
 * cooperative-scoped screen should use.
 */
export async function getCooperativeId(): Promise<string> {
  const response = await adminApiFetch<unknown>("/api/CooperativeAccount/GetCooperativeId");
  if (!response || typeof response !== "object" || Array.isArray(response)) {
    throw new Error("GetCooperativeId returned an invalid response.");
  }
  const envelope = response as Record<string, unknown>;
  if (envelope.success === false) {
    throw new ApiError(
      typeof envelope.message === "string" && envelope.message.trim()
        ? envelope.message
        : "Could not load the cooperative ID.",
      typeof envelope.statusCode === "number" ? envelope.statusCode : 0,
      response,
    );
  }
  const data = envelope.data;
  const id = data && typeof data === "object" ? (data as Record<string, unknown>).cooperativeId : undefined;
  if (typeof id !== "string" || !UUID.test(id)) {
    throw new Error("GetCooperativeId did not return a valid cooperative ID.");
  }
  return id.toLowerCase();
}
