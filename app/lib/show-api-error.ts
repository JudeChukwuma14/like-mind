import toast from "react-hot-toast";
import { getApiErrorMessage, isPermissionDenied } from "@/app/lib/api-client";

/**
 * Same text `getApiErrorMessage` would produce, except a 403 gets an
 * "Access denied — " prefix so a permission rejection reads differently from
 * a plain validation error. For screens that show the error inline (e.g.
 * `setFormError(apiErrorMessage(reason))`) rather than as a toast. The loan
 * screens already have their own distinct 403 copy via getLoanScreenError
 * and don't need this.
 */
export function apiErrorMessage(error: unknown): string {
  const message = getApiErrorMessage(error);
  return isPermissionDenied(error) ? `Access denied — ${message}` : message;
}

/**
 * Drop-in replacement for the `toast.error(getApiErrorMessage(error))` pattern
 * used throughout the admin app's mutation `onError` handlers. Same call
 * shape, same library — the only difference is a 403 gets a visually
 * distinct "access denied" toast (lock icon, longer duration) instead of a
 * generic one. No navigation, no dedicated page — the backend remains the
 * actual authorization boundary; this only changes how its "no" looks.
 */
export function showApiError(error: unknown) {
  if (isPermissionDenied(error)) {
    toast.error(apiErrorMessage(error), { icon: "🔒", duration: 6000 });
  } else {
    toast.error(apiErrorMessage(error));
  }
}
