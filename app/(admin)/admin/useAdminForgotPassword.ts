"use client";

import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { adminApiFetch, getApiErrorMessage, type ApiEnvelope } from "@/app/lib/api-client";
import { setStoredAdminResetEmail } from "@/app/lib/admin-reset-password-email";

/**
 * Mirrors app/(user)/signin/forgot-password's flow, against the admin
 * backend instead. No page wires this up yet (no UI built for it), but
 * it's ready to import once one exists — same mutate(email), same
 * toast/error handling, same sessionStorage hand-off to whatever consumes
 * useAdminResetPassword next.
 */
export function useAdminForgotPassword() {
  return useMutation({
    mutationFn: (email: string) =>
      adminApiFetch<ApiEnvelope<unknown>>("/api/Auth/admin-forgot-password", {
        method: "POST",
        body: { email },
      }),
    onSuccess: (res, email) => {
      toast.success(res.message || "Reset code sent — check your email.");
      setStoredAdminResetEmail(email);
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err));
    },
  });
}
