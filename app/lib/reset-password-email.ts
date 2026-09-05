/**
 * Carries the email address across the forgot-password -> reset-password
 * navigation without putting it in the URL (sessionStorage, not
 * localStorage — this shouldn't outlive the current tab/reset attempt).
 */
const RESET_EMAIL_KEY = "kajola_reset_email";

export function getStoredResetEmail(): string {
  try {
    return sessionStorage.getItem(RESET_EMAIL_KEY) ?? "";
  } catch {
    return "";
  }
}

export function setStoredResetEmail(email: string) {
  try {
    sessionStorage.setItem(RESET_EMAIL_KEY, email);
  } catch {
    // ignore (e.g. private browsing restrictions)
  }
}

export function clearStoredResetEmail() {
  try {
    sessionStorage.removeItem(RESET_EMAIL_KEY);
  } catch {
    // ignore
  }
}
