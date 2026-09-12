"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserAuth } from "@/app/providers/UserAuthProvider";

/**
 * Redirects to /signin once the initial session check finishes and finds
 * no valid member session. Waits for isLoading to complete so we never
 * flash a redirect on an already-authenticated page refresh.
 */
export function useRequireUserAuth() {
  const { isAuthenticated, isLoading } = useUserAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/signin");
    }
  }, [isLoading, isAuthenticated, router]);

  return { isLoading, isAuthenticated };
}
