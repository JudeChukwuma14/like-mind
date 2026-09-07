"use client";

import { apiFetch } from "@/app/lib/api-client";
import { setApiToken } from "@/app/lib/auth-token";
import { computeFingerprint, getDeviceId } from "@/app/lib/device-info";
import { extractAuthToken, authNeedsTwoFactor, extractAuthMessage } from "@/app/lib/auth-response";

/** Result of a login attempt that didn't error but also didn't hand back a session yet. */
export type MemberLoginResult =
  | { requires2FA: true; message?: string }
  | { requires2FA: false; message?: string };

/**
 * Not a Context/Provider like AdminAuthProvider — no other member page
 * needs shared auth state yet, just this sign-in flow. Same token/2FA
 * parsing (see auth-response.ts) and device headers, against the member
 * API instead of the admin one.
 */
export function useMemberLogin() {
  const login = async (email: string, password: string): Promise<MemberLoginResult> => {
    const res = await apiFetch<unknown>("/api/Auth/Login", {
      method: "POST",
      headers: {
        "X-Device-Id": getDeviceId(),
        "X-Fingerprint": await computeFingerprint(),
      },
      body: { email, password },
    });

    if (authNeedsTwoFactor(res)) {
      return { requires2FA: true, message: extractAuthMessage(res) };
    }

    const token = extractAuthToken(res);
    if (!token) {
      throw new Error(
        extractAuthMessage(res) ?? "Login didn't return a session token.",
      );
    }
    setApiToken(token);
    return { requires2FA: false, message: extractAuthMessage(res) };
  };

  // Same request/response shape as login() but no password — the backend
  // requires a previously-trusted device for this to succeed; otherwise it
  // errors and the caller should fall back to the password-based login().
  const loginByEmailOnly = async (email: string): Promise<MemberLoginResult> => {
    const res = await apiFetch<unknown>("/api/Auth/LoginByEmailOnlyAnd2FA", {
      method: "POST",
      headers: {
        "X-Device-Id": getDeviceId(),
        "X-Fingerprint": await computeFingerprint(),
      },
      body: { email },
    });

    if (authNeedsTwoFactor(res)) {
      return { requires2FA: true, message: extractAuthMessage(res) };
    }

    const token = extractAuthToken(res);
    if (!token) {
      throw new Error(
        extractAuthMessage(res) ?? "Couldn't sign in with just your email on this device.",
      );
    }
    setApiToken(token);
    return { requires2FA: false, message: extractAuthMessage(res) };
  };

  const verify2fa = async (email: string, code: string) => {
    const res = await apiFetch<unknown>("/api/Auth/Verify-2fa", {
      method: "POST",
      headers: {
        "X-Device-Id": getDeviceId(),
        "X-Fingerprint": await computeFingerprint(),
      },
      body: { email, code },
    });

    const token = extractAuthToken(res);
    if (!token) {
      throw new Error(extractAuthMessage(res) ?? "That code didn't complete sign-in. Please try again.");
    }
    setApiToken(token);
    return { message: extractAuthMessage(res) };
  };

  const resendOtp = async (email: string) => {
    const res = await apiFetch<unknown>("/api/Auth/ResendOtp", {
      method: "POST",
      body: { email },
    });
    return { message: extractAuthMessage(res) };
  };

  return { login, loginByEmailOnly, verify2fa, resendOtp };
}
