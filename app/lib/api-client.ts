import axios, { type AxiosInstance, type Method } from "axios";
import { getApiToken, getAdminApiToken } from "@/app/lib/auth-token";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
// The cooperative/admin setup backend (e.g. /api/CooperativeAccount/*) is a
// separate deployment from the member-facing Kajola+ API above.
const ADMIN_API_BASE_URL = process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL;

function createClient(baseURL: string | undefined, getToken: () => string | null): AxiosInstance {
  const client = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  client.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return client;
}

export const apiClient = createClient(API_BASE_URL, getApiToken);
export const adminApiClient = createClient(ADMIN_API_BASE_URL, getAdminApiToken);
// /api/User/GetById and /api/User/UpdateUserData live on the admin backend
// host (ADMIN_API_BASE_URL) but are what ordinary members use to read/edit
// their own profile — authenticated with their own member token, not an
// admin token. Confirmed by testing that a member's token is valid there.
export const memberProfileApiClient = createClient(ADMIN_API_BASE_URL, getApiToken);

/** Every KajolaPlus API response is wrapped in this envelope. */
export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
  errors: unknown;
  timestamp: string;
};

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

/** Some endpoints return HTTP 200 with a failed application-level envelope. */
export function ensureApiSuccess<T extends ApiEnvelope<unknown>>(response: T): T {
  if (response.success === false) {
    throw new ApiError(response.message || "The request was not accepted.", response.statusCode || 0, response);
  }
  return response;
}

/** "$.basicInfo.dateOfBirth" or "nextOfKinDto.SharePercentage" -> "Date of birth" */
function humanizeFieldPath(path: string): string {
  const lastSegment = path.replace(/^\$\./, "").split(".").pop() ?? path;
  const spaced = lastSegment.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}

/**
 * The API returns errors in three different shapes depending on where they
 * come from:
 *  - ASP.NET's ValidationProblemDetails on model-binding/validation
 *    failures: { errors: { "field.path": ["message", ...] } }
 *  - The API's own envelope on business-logic failures: { message: "..." }
 *  - A bare text/plain string on some auth failures (no JSON at all)
 * This normalizes any of them into one readable string for display.
 */
export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const payload = error.payload;
    if (typeof payload === "string" && payload.trim()) return payload;
    if (payload && typeof payload === "object") {
      if ("errors" in payload && payload.errors && typeof payload.errors === "object") {
        const errors = payload.errors as Record<string, string[]>;
        const keys = Object.keys(errors);
        // "dto" is ASP.NET's generic "request body didn't bind" error — it
        // shows up alongside the real cause when one exists, so drop it then.
        const relevantKeys = keys.length > 1 ? keys.filter((k) => k !== "dto") : keys;
        const messages = relevantKeys.flatMap((key) =>
          (errors[key] ?? []).map((msg) => `${humanizeFieldPath(key)}: ${msg}`),
        );
        if (messages.length > 0) return messages.join("\n");
      }
      if ("message" in payload && typeof (payload as { message: unknown }).message === "string") {
        return (payload as { message: string }).message;
      }
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

type ApiFetchOptions = {
  method?: Method;
  body?: unknown;
  headers?: Record<string, string>;
};

async function fetchWithClient<T>(
  client: AxiosInstance,
  baseURL: string | undefined,
  envVarName: string,
  path: string,
  { method = "GET", body, headers }: ApiFetchOptions = {},
): Promise<T> {
  if (!baseURL) {
    throw new Error(`${envVarName} is not set. Add it to .env.local.`);
  }

  try {
    const res = await client.request<T>({
      url: path,
      method,
      data: body,
      // FormData bodies (file uploads) need the browser to set its own
      // multipart boundary — the instance-level "Content-Type: application/
      // json" default would otherwise stomp on it.
      headers: body instanceof FormData ? { ...headers, "Content-Type": undefined } : headers,
    });
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const payload = err.response?.data;
      // Not every endpoint replies with JSON — /api/Auth/Login, for one,
      // sends its error as a bare text/plain string ("Invalid email or
      // password."), no object wrapper at all.
      let message = err.message;
      if (typeof payload === "string" && payload.trim()) {
        message = payload;
      } else if (payload && typeof payload === "object" && "message" in payload) {
        message = String((payload as { message: unknown }).message);
      }
      throw new ApiError(message, err.response?.status ?? 0, payload);
    }
    throw err;
  }
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  return fetchWithClient<T>(apiClient, API_BASE_URL, "NEXT_PUBLIC_API_BASE_URL", path, options);
}

/** For the cooperative/admin setup backend — see `adminApiClient` above. */
export async function adminApiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  return fetchWithClient<T>(
    adminApiClient,
    ADMIN_API_BASE_URL,
    "NEXT_PUBLIC_ADMIN_API_BASE_URL",
    path,
    options,
  );
}

/** For a member's own profile endpoints on the admin host — see `memberProfileApiClient` above. */
export async function memberProfileApiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  return fetchWithClient<T>(
    memberProfileApiClient,
    ADMIN_API_BASE_URL,
    "NEXT_PUBLIC_ADMIN_API_BASE_URL",
    path,
    options,
  );
}
