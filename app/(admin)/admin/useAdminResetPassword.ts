"use client";

import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { adminApiFetch, getApiErrorMessage, type ApiEnvelope } from "@/app/lib/api-client";
import { clearStoredAdminResetEmail, getStoredAdminResetEmail } from "@/app/lib/admin-reset-password-email";

export type AdminResetPasswordInput = {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
};

/**
 * Mirrors app/(user)/signin/reset-password's flow, against the admin
 * backend instead. No page wires this up yet — re-exports
 * getStoredAdminResetEmail so a future page can pre-fill the email field
 * the same way the member page does (useState(getStoredResetEmail())
 * pattern, no useSearchParams/Suspense needed).
 */
export function useAdminResetPassword() {
  return useMutation({
    mutationFn: (input: AdminResetPasswordInput) =>
      adminApiFetch<ApiEnvelope<unknown>>("/api/Auth/admin-reset-password", {
        method: "POST",
        body: input,
      }),
    onSuccess: (res) => {
      toast.success(res.message || "Password reset — you can now log in.");
      clearStoredAdminResetEmail();
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err));
    },
  });
}

export { getStoredAdminResetEmail };
