"use client";

import { useEffect, useState } from "react";
import { getApiToken } from "@/app/lib/auth-token";
import { decodeJwtPayload, mapJwtUser, isJwtExpired, type JwtUser } from "@/app/lib/jwt";

/**
 * Decodes the member Kajola+ API token (set on /api/Auth/Login and
 * /api/Auth/google) for display purposes — e.g. the dashboard sidebar and
 * header. Not a route guard: it just returns null when there's no valid
 * token, and callers that need to redirect unauthenticated users should
 * check for that themselves.
 */
export function useCurrentUser(): JwtUser | null {
  const [user, setUser] = useState<JwtUser | null>(null);

  useEffect(() => {
    const token = getApiToken();
    if (!token) return;
    const claims = decodeJwtPayload<Record<string, unknown>>(token);
    if (!claims || isJwtExpired(claims)) return;
    setUser(mapJwtUser(claims));
  }, []);

  return user;
}
