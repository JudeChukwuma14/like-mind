function looksLikeJwt(value: string): boolean {
  return value.split(".").length === 3;
}

/**
 * Every login/verify-2fa endpoint on this backend shares the outer
 * envelope `{ success, message, data, statusCode, errors, timestamp,
 * correlationId }`, but `data` itself varies by endpoint — confirmed
 * against real responses:
 *  - Login/AdminLogin:          data: { token, requires2FA }  (an object)
 *  - Verify-2fa/AdminVerify2fa: data: "<jwt>"                 (a bare string)
 * Also checks a couple of nearby shapes (bare top-level `{ token }`,
 * `accessToken` instead of `token`) rather than hard-failing if a future
 * response varies slightly. Shared by both AdminAuthProvider and the
 * member-side useMemberLogin hook, since both backends use the same
 * conventions.
 */
export function extractAuthToken(raw: unknown): string | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  if (typeof obj.token === "string") return obj.token;
  if (typeof obj.accessToken === "string") return obj.accessToken;
  const data = obj.data;
  if (typeof data === "string" && looksLikeJwt(data)) return data;
  if (data && typeof data === "object") {
    const inner = data as Record<string, unknown>;
    if (typeof inner.token === "string") return inner.token;
    if (typeof inner.accessToken === "string") return inner.accessToken;
  }
  return null;
}

/** Confirmed shape: `data: { requires2FA: true }` (admin) or top-level `{ requires2FA: true }` (member) when a verification code was just emailed. */
export function authNeedsTwoFactor(raw: unknown): boolean {
  if (!raw || typeof raw !== "object") return false;
  const obj = raw as Record<string, unknown>;
  // Member login endpoint returns requires2FA at the top level
  if (obj.requires2FA === true) return true;
  // Admin login endpoint wraps it inside data
  const data = obj.data;
  if (!data || typeof data !== "object") return false;
  return (data as Record<string, unknown>).requires2FA === true;
}

export function extractAuthMessage(raw: unknown): string | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const message = (raw as Record<string, unknown>).message;
  return typeof message === "string" ? message : undefined;
}
