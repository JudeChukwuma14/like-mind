"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";


export function useRequireAccount(isClient: boolean, cooperativeAccountId: string, skip = false) {
  const router = useRouter();
  useEffect(() => {
    if (isClient && !cooperativeAccountId && !skip) {
      router.replace("/setup/welcome");
    }
  }, [isClient, cooperativeAccountId, skip, router]);
}

/** Welcome creates the account — re-visiting it afterward would create a duplicate. */
export function useRedirectIfAccountExists(isClient: boolean, cooperativeAccountId: string) {
  const router = useRouter();
  useEffect(() => {
    if (isClient && cooperativeAccountId) {
      router.replace("/setup/cooperative-profile");
    }
  }, [isClient, cooperativeAccountId, router]);
}
