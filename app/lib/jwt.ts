/**
 * Decodes a JWT payload for reading claims client-side (e.g. to branch UI
 * flow). This does NOT verify the signature — never use it for anything
 * security-sensitive; the server is the source of truth for that.
 */
export function decodeJwtPayload<T = Record<string, unknown>>(token: string): T | null {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join(""),
    );
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export function isJwtExpired(claims: Record<string, unknown>): boolean {
  const exp = claims.exp;
  if (typeof exp !== "number") return false;
  return Date.now() >= exp * 1000;
}

// ASP.NET's default claim URIs — used across every JWT this backend issues
// (confirmed on both the admin AdminLogin token and the Google id-token
// exchange's claims in apply/welcome/page.tsx).
const CLAIM_NAME = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name";
const CLAIM_ROLE = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

export type JwtUser = {
  id?: string;
  cooperativeId?: string;
  email?: string;
  name?: string;
  role?: string;
  phoneNumber?: string;
  claims: Record<string, unknown>;
};

function claimString(claims: Record<string, unknown>, key: string): string | undefined {
  const value = claims[key];
  return typeof value === "string" ? value : undefined;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Read the cooperative ID, not `sub` (user ID) or cooperativeAccountId (setup account ID). */
export function cooperativeIdFromJwtClaims(claims: Record<string, unknown>): string | undefined {
  for (const [key, rawValue] of Object.entries(claims)) {
    const claimName = (key.split(/[/:]/).pop() ?? key).replace(/[^a-z0-9]/gi, "").toLowerCase();
    if (claimName !== "cooperativeid") continue;
    if (typeof rawValue !== "string") continue;
    const value = rawValue.trim();
    if (UUID_PATTERN.test(value)) return value;
  }
  return undefined;
}

/** Maps a decoded JWT's claims into the handful of fields the UI actually displays. */
export function mapJwtUser(claims: Record<string, unknown>): JwtUser {
  return {
    id: claimString(claims, "sub"),
    cooperativeId: cooperativeIdFromJwtClaims(claims),
    email: claimString(claims, "email"),
    name: claimString(claims, CLAIM_NAME),
    role: claimString(claims, CLAIM_ROLE),
    phoneNumber: claimString(claims, "PhoneNumber"),
    claims,
  };
}
