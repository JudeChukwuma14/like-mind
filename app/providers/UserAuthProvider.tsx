"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getApiToken, clearApiToken } from "@/app/lib/auth-token";
import { decodeJwtPayload, mapJwtUser, isJwtExpired, type JwtUser } from "@/app/lib/jwt";

export type MemberUser = JwtUser;

type UserAuthContextValue = {
  user: MemberUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
  checkAuth: () => void;
};

const UserAuthContext = createContext<UserAuthContextValue | null>(null);

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MemberUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = () => {
    const token = getApiToken();
    const claims = token ? decodeJwtPayload<Record<string, unknown>>(token) : null;
    if (!token || !claims || isJwtExpired(claims)) {
      if (token) clearApiToken();
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

  const logout = () => {
    clearApiToken();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <UserAuthContext.Provider
      value={{ user, isAuthenticated, isLoading, logout, checkAuth }}
    >
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth(): UserAuthContextValue {
  const ctx = useContext(UserAuthContext);
  if (!ctx) throw new Error("useUserAuth must be used within a UserAuthProvider");
  return ctx;
}
