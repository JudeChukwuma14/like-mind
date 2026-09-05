"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ArrowRight, Loader2 } from "lucide-react";
import { GoogleIcon } from "@/app/components/GoogleIcon";
import { StepHeader } from "../StepHeader";
import { apiFetch, getApiErrorMessage } from "@/app/lib/api-client";
import { setApiToken } from "@/app/lib/auth-token";
import { computeFingerprint, getDeviceId } from "@/app/lib/device-info";
import { decodeJwtPayload } from "@/app/lib/jwt";

type GoogleAuthResponse = {
  token: string;
};

type GoogleJwtClaims = {

  requiresRegistration?: string;
  email?: string;
  sub?: string; //
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"?: string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"?: string;
};

export default function WelcomePage() {
  const router = useRouter();
  const { data: session } = useSession();

  const exchangeGoogleToken = useMutation({
    mutationFn: async (idToken: string) =>
      apiFetch<GoogleAuthResponse>("/api/Auth/google", {
        method: "POST",
        headers: {
          "X-Device-Id": getDeviceId(),
          "X-Fingerprint": await computeFingerprint(),
        },
        body: { idToken },
      }),
    onSuccess: (res) => {
      setApiToken(res.token);
      const claims = decodeJwtPayload<GoogleJwtClaims>(res.token);
      console.log("Decoded Token Payload:", claims);
      console.log("Extracted User ID:", claims?.sub);
      // New/partial Google sign-ups get requiresRegistration: "true" and
      // must finish the apply flow; existing complete members go straight in.
      if (claims?.requiresRegistration === "true") {
        toast.success("Signed in with Google — let's finish your application.");
        router.push("/apply/basic-information");
      } else {
        toast.success("Signed in with Google.");
        router.push("/dashboard");
      }
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err));
    },
  });

  // Session only carries a Google idToken after the OAuth redirect completes.
  // hasExchanged guards against React Strict Mode's double effect invocation
  // firing the exchange twice.
  const hasExchanged = useRef(false);
  useEffect(() => {
    if (!session?.idToken || hasExchanged.current) return;
    hasExchanged.current = true;
    exchangeGoogleToken.mutate(session.idToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.idToken]);

  const googleBusy = Boolean(session?.idToken) || exchangeGoogleToken.isPending;

  const handleRetryGoogle = async () => {
    // Google id tokens expire ~1hr after issuance, but the NextAuth session
    // cookie holding one lives much longer — so a returning session can
    // carry a stale, already-expired token. Sign out first to force a
    // genuinely fresh Google round trip instead of reusing it.
    await signOut({ redirect: false });
    await signIn("google");
  };

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <StepHeader step={1} totalSteps={9} title="WELCOME" />

        <div className="mt-20 max-w-xl">
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-[#171717] mb-6">
            Welcome.
          </h1>
          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            Apply for LikeMinds membership in 9 short steps. We auto-save as you go.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/apply/basic-information"
              className="inline-flex items-center justify-center gap-2 bg-[#171717] hover:bg-black text-white px-8 py-3.5 rounded-full font-medium transition-colors"
            >
              Continue with email
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              type="button"
              disabled={googleBusy}
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-[#171717] px-8 py-3.5 rounded-full font-medium border border-gray-200 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={() => {
                signIn("google").catch((err) => {
                  toast.error(getApiErrorMessage(err));
                });
              }}
            >
              {googleBusy ? <Loader2 className="w-5 h-5 animate-spin" /> : <GoogleIcon />}
              {googleBusy ? "Connecting…" : "Continue with Google"}
            </button>
          </div>

          {exchangeGoogleToken.isError && (
            <button
              type="button"
              onClick={handleRetryGoogle}
              className="text-sm text-red-700 underline hover:text-red-800 mt-4"
            >
              Try signing in again
            </button>
          )}
        </div>
      </div>

      <div className="mt-24 pt-8 border-t border-gray-200 border-dashed">
        <p className="text-sm text-gray-500 max-w-2xl">
          By continuing, you confirm you're 18+ and have valid Canadian residency status. We'll
          verify these in step 02.
        </p>
      </div>
    </div>
  );
}
