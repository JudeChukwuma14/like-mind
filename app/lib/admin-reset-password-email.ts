/**
 * Carries the admin's email across the forgot-password -> reset-password
 * step without putting it in the URL — same approach as
 * reset-password-email.ts for the member flow, kept under a separate key
 * since these are two different security domains (see auth-token.ts).
 */
const ADMIN_RESET_EMAIL_KEY = "kajola_admin_reset_email";

export function getStoredAdminResetEmail(): string {
  try {
    return sessionStorage.getItem(ADMIN_RESET_EMAIL_KEY) ?? "";
  } catch {
    return "";
  }
}

export function setStoredAdminResetEmail(email: string) {
  try {
    sessionStorage.setItem(ADMIN_RESET_EMAIL_KEY, email);
  } catch {
    // ignore (e.g. private browsing restrictions)
  }
}

export function clearStoredAdminResetEmail() {
  try {
    sessionStorage.removeItem(ADMIN_RESET_EMAIL_KEY);
  } catch {
    // ignore
  }
}
