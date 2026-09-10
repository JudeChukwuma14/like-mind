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
