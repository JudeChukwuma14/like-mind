"use client";

import { useEffect, useState } from "react";
import { getApiToken } from "@/app/lib/auth-token";
import { decodeJwtPayload, mapJwtUser, isJwtExpired, type JwtUser } from "@/app/lib/jwt";


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
