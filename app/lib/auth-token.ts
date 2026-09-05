/** Kajola+ API JWT (returned after exchanging a Google id token, etc.) */
const API_TOKEN_KEY = "kajola_api_token";

export function getApiToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(API_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setApiToken(token: string) {
  try {
    localStorage.setItem(API_TOKEN_KEY, token);
  } catch {
    // ignore (e.g. private browsing restrictions)
  }
}

export function clearApiToken() {
  try {
    localStorage.removeItem(API_TOKEN_KEY);
  } catch {
    // ignore
  }
}

/**
 * Admin dashboard JWT, from /api/Auth/AdminLogin. Kept separate from
 * API_TOKEN_KEY above — the admin backend (NEXT_PUBLIC_ADMIN_API_BASE_URL)
 * is a different deployment/security domain from the member Kajola+ API,
 * so the two tokens must never be sent to each other's requests.
 */
const ADMIN_API_TOKEN_KEY = "kajola_admin_api_token";

export function getAdminApiToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(ADMIN_API_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAdminApiToken(token: string) {
  try {
    localStorage.setItem(ADMIN_API_TOKEN_KEY, token);
  } catch {
    // ignore (e.g. private browsing restrictions)
  }
}

export function clearAdminApiToken() {
  try {
    localStorage.removeItem(ADMIN_API_TOKEN_KEY);
  } catch {
    // ignore
  }
}
