"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, FileText, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyDraftById } from "@/app/lib/savings-api";
import { submitPayment, getPaymentProofBlobUrl } from "@/app/lib/payments-api";
import { getApiErrorMessage } from "@/app/lib/api-client";
import toast from "react-hot-toast";

function fmt(n: number | null | undefined): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);
}

export default function ReviewPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftId = searchParams?.get("draftId") || "";
  const queryClient = useQueryClient();

  const [confirmed, setConfirmed] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  async function openProof(fileName: string) {
    setPreviewLoading(true);
    setPreviewError(null);
    try { setPreviewUrl(await getPaymentProofBlobUrl(fileName, "member")); }
    catch (error) { setPreviewError(getApiErrorMessage(error)); }
    finally { setPreviewLoading(false); }
  }

  const { data: draft, isLoading, error } = useQuery({
    queryKey: ["my-draft", draftId],
    queryFn: () => getMyDraftById(draftId),
    enabled: Boolean(draftId),
  });

  const { mutate: submit, isPending } = useMutation({
    mutationFn: () => submitPayment(draftId),
    onSuccess: () => {
      toast.success("Payment submitted for confirmation!");
      queryClient.invalidateQueries({ queryKey: ["my-drafts"] });
      queryClient.invalidateQueries({ queryKey: ["my-draft"] });
      queryClient.invalidateQueries({ queryKey: ["my-payments"] });
      router.push("/dashboard/cash-wallet/confirm-payment/success");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err));
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmed) {
      submit();
    }
  };

  if (!draftId) {
    return <div className="p-12 text-center text-gray-500">No draft selected.</div>;
  }

  if (isLoading) {
    return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-300" /></div>;
  }

  if (error) {
    return <div role="alert" className="p-12 text-center text-red-700">{getApiErrorMessage(error)}</div>;
  }

  if (!draft) {
    return <div className="p-12 text-center text-gray-500">Draft not found.</div>;
  }

  // Handle potentially mismatched type/contributionType fields gracefully
  const typeStr = draft.type ?? "Unknown type";
  const refStr = draft.interacReferenceNumber || "No reference";

  return (
    <div className="space-y-8 pb-12">
      
      {/* ─── Header ───────────────────────────────────── */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-[#111] mb-2">
          Confirm a payment
        </h1>
        <p className="text-sm text-gray-500">
          Tell us about a payment you&apos;ve already made. Admin will confirm.
        </p>
      </div>

      {/* ─── Steps Indicator ──────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-transparent rounded-full border border-transparent">
          <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
            <Check size={12} strokeWidth={3} />
          </div>
          <span className="text-xs font-medium text-emerald-600">Payment details</span>
        </div>
        <div className="h-[1px] w-12 bg-gray-200"></div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-gray-200 shadow-sm">
          <div className="w-5 h-5 rounded-full bg-[#111] text-white flex items-center justify-center text-[10px] font-bold">
            2
          </div>
          <span className="text-xs font-bold text-[#111]">Review</span>
        </div>
      </div>

      {/* ─── Main Content Grid ────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left: Review Area */}
        <div className="flex-1 w-full bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-2">
            Step 2 of 2
          </p>
          <h2 className="text-2xl font-bold text-[#111] mb-6">Review and submit</h2>
          
          <div className="bg-gray-50/50 rounded-xl border border-gray-100 mb-6">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <span className="text-sm text-gray-500">Type</span>
              <span className="text-sm font-medium text-[#111]">{typeStr}</span>
            </div>
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
              <span className="text-sm text-gray-500">Amount paid</span>
              <span className="text-lg font-bold text-[#111]">{fmt(draft.amountPaid)}</span>
            </div>
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <span className="text-sm text-gray-500">Interac/Bank reference</span>
              <span className="text-sm font-medium text-[#111]">{refStr}</span>
            </div>
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
               <span className="text-sm text-gray-500">Note</span>
               <span className="text-sm font-medium text-[#111] truncate max-w-[200px]">{draft.note || "None"}</span>
            </div>
            {draft.proofFileName && (
              <div className="flex items-center justify-between p-4">
                <span className="text-sm text-gray-500">Proof</span>
                <button
                  type="button"
                  onClick={() => openProof(draft.proofFileName!)}
                  disabled={previewLoading}
                  className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors max-w-[200px]"
                >
                  <FileText size={16} className="shrink-0" />
                  <span className="truncate">{previewLoading ? "Opening..." : draft.proofFileName.split('/').pop() || "Document"}</span>
                </button>
              </div>
            )}
          </div>
          {previewError && <p role="alert" className="mb-4 text-sm text-red-700">{previewError}</p>}

          <form onSubmit={handleSubmit}>
            {/* Checkbox */}
            <label className="flex items-center gap-3 p-4 mb-8 bg-white border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
              <input 
                type="checkbox" 
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="h-5 w-5 shrink-0 accent-[#111]"
              />
              <span className="text-sm font-medium text-[#111]">
                I confirm the details above are accurate. Admin will be notified.
              </span>
            </label>

            {/* Buttons */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-gray-50">
              <button 
                type="button" 
                onClick={() => router.back()}
                className="px-6 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-[#111] hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-4">
                <Link 
                  href={`/dashboard/cash-wallet/confirm-payment?draftId=${draftId}`}
                  className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-[#111] transition-colors"
                >
                  Edit details
                </Link>
                <button 
                  type="submit" 
                  disabled={!confirmed || isPending}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-full text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check size={16} strokeWidth={3} />}
                  Submit confirmation
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      {/* Document Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold text-lg">Document Preview</h3>
              <button onClick={() => setPreviewUrl(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-50 flex items-center justify-center min-h-[60vh]">
              <iframe src={previewUrl} className="w-full h-full min-h-[65vh] rounded-xl border-none" title="Payment proof" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
