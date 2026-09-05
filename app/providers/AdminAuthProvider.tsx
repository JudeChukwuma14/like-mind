"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { adminApiFetch } from "@/app/lib/api-client";
import { getAdminApiToken, setAdminApiToken, clearAdminApiToken } from "@/app/lib/auth-token";
import { computeFingerprint, getDeviceId } from "@/app/lib/device-info";
import { decodeJwtPayload, mapJwtUser, isJwtExpired, type JwtUser } from "@/app/lib/jwt";
import { extractAuthToken, authNeedsTwoFactor, extractAuthMessage } from "@/app/lib/auth-response";

/** User info derived from the admin JWT's claims, for display (sidebar, greetings, etc.). */
export type AdminUser = JwtUser;

/** Result of a login attempt that didn't error but also didn't hand back a session yet. */
type LoginResult = { requires2FA: true; message?: string } | { requires2FA: false; message?: string };

type AdminAuthContextValue = {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  loginByEmailOnly: (email: string) => Promise<LoginResult>;
  verify2fa: (email: string, code: string) => Promise<{ message?: string }>;
  resendOtp: (email: string) => Promise<{ message?: string }>;
  logout: () => void;
  checkAuth: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = () => {
    const token = getAdminApiToken();
    const claims = token ? decodeJwtPayload<Record<string, unknown>>(token) : null;
    if (!token || !claims || isJwtExpired(claims)) {
      if (token) clearAdminApiToken();
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }
    setUser(mapJwtUser(claims));
    setIsAuthenticated(true);
    setIsLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const applySession = (token: string) => {
    setAdminApiToken(token);
    const claims = decodeJwtPayload<Record<string, unknown>>(token);
    const nextUser = claims ? mapJwtUser(claims) : null;
    console.log("[AdminAuth] Logged in as:", nextUser);
    setUser(nextUser);
    setIsAuthenticated(true);
  };

  const login = async (email: string, password: string): Promise<LoginResult> => {
    const res = await adminApiFetch<unknown>("/api/Auth/AdminLogin", {
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
      console.info("[AdminAuth] AdminLogin response had no recognizable token:", res);
      throw new Error(
        extractAuthMessage(res) ?? "Login didn't return a session token. Check the console for the raw response.",
      );
    }

    applySession(token);
    return { requires2FA: false, message: extractAuthMessage(res) };
  };

  // Same request/response shape as login() but no password — the backend
  // requires a previously-trusted device for this to succeed; otherwise it
  // errors and the caller should fall back to the password-based login().
  const loginByEmailOnly = async (email: string): Promise<LoginResult> => {
    const res = await adminApiFetch<unknown>("/api/Auth/AdminLoginByEmailOnlyAnd2FA", {
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

    applySession(token);
    return { requires2FA: false, message: extractAuthMessage(res) };
  };

  const verify2fa = async (email: string, code: string) => {
    const res = await adminApiFetch<unknown>("/api/Auth/AdminVerify2fa", {
      method: "POST",
      headers: {
        "X-Device-Id": getDeviceId(),
        "X-Fingerprint": await computeFingerprint(),
      },
      body: { email, code },
    });

    const token = extractAuthToken(res);
    if (!token) {
      console.info("[AdminAuth] AdminVerify2fa response had no recognizable token:", res);
      throw new Error(extractAuthMessage(res) ?? "That code didn't complete sign-in. Please try again.");
    }

    applySession(token);
    return { message: extractAuthMessage(res) };
  };

  const resendOtp = async (email: string) => {
    const res = await adminApiFetch<unknown>("/api/Auth/ResendOtp", {
      method: "POST",
      body: { email },
    });
    return { message: extractAuthMessage(res) };
  };

  const logout = () => {
    // No /api/Auth/Logout endpoint exists on this backend (confirmed
    // against its swagger spec) — clear client-side session state only.
    clearAdminApiToken();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        loginByEmailOnly,
        verify2fa,
        resendOtp,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  return ctx;
}
