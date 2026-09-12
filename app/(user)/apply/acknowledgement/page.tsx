"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import SignatureCanvas from "react-signature-canvas";
import toast from "react-hot-toast";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { useApplyStore } from "../useApplyStore";
import { buildRegisterRequest, PASSWORD_RULES } from "../register-mapper";
import { apiFetch, getApiErrorMessage, type ApiEnvelope } from "@/app/lib/api-client";
import { computeFingerprint, getDeviceId } from "@/app/lib/device-info";

export default function AcknowledgementPage() {
  const router = useRouter();
  const { data, setData, clearData, isClient } = useApplyStore();
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const sigPadRef = useRef<SignatureCanvas>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [canvasWidth, setCanvasWidth] = useState(0);

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date().toLocaleString('en-US', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute:'2-digit', timeZoneName: 'short'
    }));
  }, []);

  // Callback ref (not useRef+effect): fires exactly when the container div
  // actually attaches/detaches, so it isn't racy against the mount guard
  // above unmounting the real DOM on the first render.
  const sigContainerRef = useCallback((node: HTMLDivElement | null) => {
    resizeObserverRef.current?.disconnect();
    if (!node) return;
    setCanvasWidth(node.clientWidth);
    const observer = new ResizeObserver(([entry]) => setCanvasWidth(entry.contentRect.width));
    observer.observe(node);
    resizeObserverRef.current = observer;
  }, []);

  // Restore a previously-drawn signature once the canvas has a real size.
  useEffect(() => {
    if (
      data.signatureMode === "drawn" &&
      data.signatureImageDataUrl &&
      sigPadRef.current &&
      canvasWidth > 0
    ) {
      sigPadRef.current.fromDataURL(data.signatureImageDataUrl, {
        width: canvasWidth,
        height: 128,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasWidth, data.signatureMode]);

  const submitApplication = useMutation({
    mutationFn: async () => {
      const [body, fingerprint] = await Promise.all([buildRegisterRequest(data), computeFingerprint()]);
      return apiFetch<ApiEnvelope<unknown>>("/api/User/Register", {
        method: "POST",
        headers: {
          "X-Device-Id": getDeviceId(),
          "X-Fingerprint": fingerprint,
        },
        body,
      });
    },
    onSuccess: (res) => {
      toast.success(res.message || "Application submitted!");
      clearData();
      router.push("/apply/confirmation");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err));
    },
  });

  if (!isClient || !mounted) return null;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    submitApplication.mutate();
  };

  const handleSignatureEnd = () => {
    if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
      setData({ signatureImageDataUrl: sigPadRef.current.getTrimmedCanvas().toDataURL("image/png") });
    }
  };

  const handleClearSignature = () => {
    if (data.signatureMode === "drawn") {
      sigPadRef.current?.clear();
      setData({ signatureImageDataUrl: "" });
    } else {
      setData({ signature: "" });
    }
  };

  const handleToggleSignatureMode = () => {
    setData({ signatureMode: data.signatureMode === "typed" ? "drawn" : "typed" });
  };

  const passwordMeetsRules = PASSWORD_RULES.every((rule) => rule.test(data.password));
  const passwordValid = passwordMeetsRules && data.password === confirmPassword;
  const signatureValid =
    data.signatureMode === "typed"
      ? data.signature.trim() !== ""
      : data.signatureImageDataUrl !== "";
  const isFormValid =
    signatureValid &&
    data.agreeInfoTrue &&
    data.agreeBylaws &&
    data.agreeConsent &&
    passwordValid;

  return (
    <form onSubmit={handleNext} className="flex flex-col h-full justify-between min-h-full">
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest flex items-center gap-4">
            <span>STEP 08 OF 09</span>
            <span className="w-8 h-px bg-gray-300"></span>
            <span className="font-semibold text-gray-700">ACKNOWLEDGEMENT & SIGNATURE</span>
          </div>
        </div>

        <div className="mt-8 max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-[#171717] mb-4">
            Sign & submit.
          </h1>
          <p className="text-lg text-gray-600 mb-10">Confirms info accurate. Bylaws apply.</p>

          <div className="space-y-6">
            {/* Signature Box */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm relative">
              <div className="flex items-center justify-between mb-8">
                <div className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">
                  — DIGITAL SIGNATURE
                </div>
                <div className="text-xs text-gray-500 flex gap-2">
                  <button type="button" className="hover:text-gray-900" onClick={handleClearSignature}>Clear</button>
                  <span>·</span>
                  <button type="button" className="hover:text-gray-900" onClick={handleToggleSignatureMode}>
                    {data.signatureMode === "typed" ? "Draw instead" : "Type instead"}
                  </button>
                </div>
              </div>

              <div
                ref={sigContainerRef}
                className="h-32 flex items-center justify-center border-b border-gray-100 mb-6 relative"
              >
                {data.signatureMode === "typed" ? (
                  <input
                    type="text"
                    required
                    value={data.signature}
                    onChange={(e) => setData({ signature: e.target.value })}
                    className="w-full text-center text-6xl outline-none bg-transparent"
                    style={{ fontFamily: "'Cedarville Cursive', cursive", color: "#171717" }}
                    placeholder="Type your name"
                  />
                ) : (
                  canvasWidth > 0 && (
                    <SignatureCanvas
                      ref={sigPadRef}
                      penColor="#171717"
                      onEnd={handleSignatureEnd}
                      canvasProps={{
                        width: canvasWidth,
                        height: 128,
                        className: "cursor-crosshair",
                      }}
                    />
                  )
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 font-mono">
                <div>
                  Signed by{" "}
                  {data.signatureMode === "typed"
                    ? data.signature || "..."
                    : data.signatureImageDataUrl
                      ? "(drawn signature)"
                      : "..."}
                </div>
                <div>{currentTime}</div>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3 mt-8">
              <label className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-200 cursor-pointer hover:border-gray-300 transition-colors">
                <div className="mt-0.5">
                  <input
                    type="checkbox"
                    required
                    checked={data.agreeInfoTrue}
                    onChange={(e) => setData({ agreeInfoTrue: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-[#171717] focus:ring-[#171717]"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-[#171717] text-sm">All information provided is true, accurate and complete to the best of my knowledge</h3>
                  <p className="text-xs text-gray-500 mt-1">Misrepresentation may result in immediate termination of membership.</p>
                </div>
              </label>

              <label className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-200 cursor-pointer hover:border-gray-300 transition-colors">
                <div className="mt-0.5">
                  <input
                    type="checkbox"
                    required
                    checked={data.agreeBylaws}
                    onChange={(e) => setData({ agreeBylaws: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-[#171717] focus:ring-[#171717]"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-[#171717] text-sm">I have read and agree to the 2024 Bylaws, Member Code of Conduct, and Welfare Policy</h3>
                  <p className="text-xs text-gray-500 mt-1">Last revised: 2024-11-08 - 8 minute read combined.</p>
                </div>
              </label>

              <label className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-200 cursor-pointer hover:border-gray-300 transition-colors">
                <div className="mt-0.5">
                  <input
                    type="checkbox"
                    required
                    checked={data.agreeConsent}
                    onChange={(e) => setData({ agreeConsent: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-[#171717] focus:ring-[#171717]"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-[#171717] text-sm">I consent to PIPEDA-compliant data processing for KYC, member services and welfare claims</h3>
                  <p className="text-xs text-gray-500 mt-1">Data stays in Canadian data centers. Right to erasure on departure.</p>
                </div>
              </label>
            </div>

            {/* Account password */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 mt-8">
              <h3 className="font-medium text-[#171717] text-sm mb-1">Create your account password</h3>
              <p className="text-xs text-gray-500 mb-4">Used to sign in to your member dashboard once approved.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    required
                    value={data.password}
                    onChange={(e) => setData({ password: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white"
                    placeholder="Create a password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white"
                    placeholder="Re-enter password"
                  />
                </div>
              </div>
              {data.password && (
                <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                  {PASSWORD_RULES.map((rule) => {
                    const met = rule.test(data.password);
                    return (
                      <li
                        key={rule.label}
                        className={`text-xs flex items-center gap-1 ${met ? "text-emerald-600" : "text-gray-400"}`}
                      >
                        <Check className="w-3 h-3" />
                        {rule.label}
                      </li>
                    );
                  })}
                </ul>
              )}
              {data.password && confirmPassword && data.password !== confirmPassword && (
                <p className="text-xs text-red-600 mt-2">Passwords don't match.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-20 pt-6 border-t border-gray-200 border-dashed flex items-center justify-between">
        <Link
          href="/apply/review"
          className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-[#171717] px-6 py-3 rounded-full font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to review
        </Link>

        <span className="text-xs text-gray-400 font-mono tracking-widest uppercase hidden md:inline-block">
          88% complete
        </span>

        <button
          type="submit"
          disabled={!isFormValid || submitApplication.isPending}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-full font-medium transition-colors"
        >
          {submitApplication.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitApplication.isPending ? "Submitting…" : "Submit application"}
        </button>
      </div>
    </form>
  );
}
