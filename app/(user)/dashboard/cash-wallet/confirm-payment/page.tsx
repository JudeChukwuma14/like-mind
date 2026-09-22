"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ChevronRight, Loader2, FileText } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createPaymentDraft, type CreatePaymentDraftPayload } from "@/app/lib/payments-api";
import { getMyDraftById } from "@/app/lib/savings-api";
import { getApiErrorMessage } from "@/app/lib/api-client";
import toast from "react-hot-toast";

function savedDraftId(response: unknown): string | null {
  if (!response || typeof response !== "object") return null;
  const record = response as Record<string, unknown>;
  if (typeof record.data === "string") return record.data;
  const data = record.data && typeof record.data === "object" ? record.data as Record<string, unknown> : record;
  for (const key of ["id", "paymentId", "draftId"]) if (typeof data[key] === "string") return data[key] as string;
  return null;
}

export default function ConfirmPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftId = searchParams?.get("draftId") || "";
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    type: "",
    month: "",
    amount: "",
    currency: "",
    date: "",
    interacEmail: "",
    method: "",
    reference: "",
    note: "",
    existingProofFileName: ""
  });
  const [file, setFile] = useState<File | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { data: existingDraft, isLoading: draftsLoading, error: draftsError } = useQuery({
    queryKey: ["my-draft", draftId],
    queryFn: () => getMyDraftById(draftId),
    enabled: Boolean(draftId),
  });

  // Populate form if editing an existing draft

  useEffect(() => {
    if (draftId && existingDraft) {
        const nextForm = {
          type: existingDraft.type || "",
          month: existingDraft.contributionMonth?.slice(0, 7) || "",
          amount: existingDraft.amountPaid?.toString() || "",
          currency: existingDraft.currency || "",
          date: existingDraft.paymentDate?.slice(0, 10) || "",
          interacEmail: existingDraft.interacReferenceEmail || "",
          method: existingDraft.method || "",
          reference: existingDraft.interacReferenceNumber || "",
          note: existingDraft.note || "",
          existingProofFileName: existingDraft.proofFileName || ""
        };
        const timer = window.setTimeout(() => setFormData(nextForm), 0);
        return () => window.clearTimeout(timer);
    }
  }, [draftId, existingDraft]);

  const { mutate: saveDraft, isPending } = useMutation({
    mutationFn: async (isFinalSubmit: boolean) => {
      if (!formData.type || !formData.amount || !Number.isFinite(Number(formData.amount)) || Number(formData.amount) <= 0 || !formData.date || !formData.interacEmail || !formData.method) {
        throw new Error("Please fill out all required fields.");
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.interacEmail.trim())) throw new Error("Enter a valid payment reference email.");
      if (formData.currency.trim() && !/^[a-z]{3}$/i.test(formData.currency.trim())) throw new Error("Currency must be a three-letter code.");
      
      const payload: CreatePaymentDraftPayload = {
        Id: draftId || undefined,
        Type: formData.type,
        ContributionMonth: formData.month ? `${formData.month}-01` : undefined,
        AmountPaid: parseFloat(formData.amount),
        Currency: formData.currency.trim().toUpperCase() || undefined,
        PaymentDate: formData.date,
        InteracReferenceEmail: formData.interacEmail,
        Method: formData.method,
        InteracReferenceNumber: formData.reference,
        Note: formData.note,
        ProofOfPayment: file || undefined,
      };

      const res = await createPaymentDraft(payload);
      return { res, isFinalSubmit };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["my-drafts"] });
      queryClient.invalidateQueries({ queryKey: ["my-draft"] });
      // The API returns success message or draft details. 
      // We assume data.res contains the saved draft or its ID.
      // If we don't have the new draft ID easily from res, we might have to fetch it, 
      // but let's assume the user can just go back to cash wallet if they save as draft.
      if (data.isFinalSubmit) {
        // We need the draft ID to review. If res has an ID, use it. 
        // For now, if we don't know the new ID, we just go back to wallet or we use a hack.
        // Assuming the backend returns { data: { id: "..." } } or similar, we'd do:
        const newDraftId = savedDraftId(data.res) || draftId;
        if (newDraftId) {
          router.push(`/dashboard/cash-wallet/confirm-payment/review?draftId=${newDraftId}`);
        } else {
          setShowSuccessModal(true);
        }
      } else {
        setShowSuccessModal(true);
      }
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err));
    }
  });

  const handleAction = (e: React.FormEvent, isFinalSubmit: boolean) => {
    e.preventDefault();
    saveDraft(isFinalSubmit);
  };

  if (draftId && draftsLoading) return <div role="status" className="p-12 text-center text-sm text-gray-500">Loading payment draft...</div>;
  if (draftId && draftsError) return <div role="alert" className="p-12 text-center text-sm text-red-700">{getApiErrorMessage(draftsError)}</div>;
  if (draftId && existingDraft === null) return <div role="alert" className="p-12 text-center text-sm text-red-700">This payment draft was not found. Return to your wallet and select a draft from your payment history.</div>;

  return (
    <div className="space-y-8 pb-12">
      
      {/* ─── Header ───────────────────────────────────── */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-[#111] mb-2">
          {draftId ? "Edit payment draft" : "Confirm a payment"}
        </h1>
        <p className="text-sm text-gray-500">
          Tell us about a payment you&apos;ve already made. Admin will confirm.
        </p>
      </div>

      {/* ─── Steps Indicator ──────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-gray-200 shadow-sm">
          <div className="w-5 h-5 rounded-full bg-[#111] text-white flex items-center justify-center text-[10px] font-bold">
            1
          </div>
          <span className="text-xs font-bold text-[#111]">Payment details</span>
        </div>
        <div className="h-[1px] w-12 bg-gray-200"></div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-transparent rounded-full border border-transparent">
          <div className="w-5 h-5 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-[10px] font-bold">
            2
          </div>
          <span className="text-xs font-medium text-gray-400">Review</span>
        </div>
      </div>

      {/* ─── Main Content Grid ────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left: Form Area */}
        <form onSubmit={(e) => handleAction(e, true)} className="flex-1 w-full bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-[#111] mb-6">Payment details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            {/* Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600">Type</label>
              <select 
                required
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-[#111] outline-none focus:border-[#111] transition-colors appearance-none"
              >
                <option value="">Choose a contribution type</option>
                <option value="SavingsContribution">Savings contribution</option>
                <option value="ShareCapital">Share capital</option>
                <option value="CommitmentFee">Commitment fee</option>
              </select>
            </div>

            {/* Contribution month */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600">Contribution month (YYYY-MM)</label>
              <input 
                type="month"
                value={formData.month}
                onChange={e => setFormData({...formData, month: e.target.value})}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-[#111] outline-none focus:border-[#111] transition-colors"
              />
            </div>

            {/* Amount paid */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600">Amount paid</label>
              <div className="relative">
                <input 
                  type="number" 
                  min="0.01"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border-2 border-[#111] rounded-lg text-sm font-medium text-[#111] outline-none transition-colors shadow-sm"
                />
              </div>
            </div>

            {/* Payment date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600">Payment date</label>
              <div className="relative">
                <input 
                  type="date" 
                  required
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-[#111] outline-none focus:border-[#111] transition-colors pr-10"
                />
              </div>
            </div>
          </div>

          <div className="mb-6 space-y-1.5">
            <label htmlFor="payment-currency" className="text-xs font-bold text-gray-600">Currency code (optional)</label>
            <input id="payment-currency" value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})} maxLength={3} placeholder="e.g. CAD" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-[#111] outline-none focus:border-[#111]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
             {/* Interac reference Email */}
             <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600">Interac Reference Email</label>
              <input 
                type="email" 
                required
                value={formData.interacEmail}
                onChange={e => setFormData({...formData, interacEmail: e.target.value})}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-[#111] outline-none focus:border-[#111] transition-colors"
              />
            </div>
            
            {/* Method */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600">Payment Method</label>
              <select 
                required
                value={formData.method}
                onChange={e => setFormData({...formData, method: e.target.value})}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-[#111] outline-none focus:border-[#111] transition-colors appearance-none"
              >
                <option value="">Choose a payment method</option>
                <option value="InteracETransfer">Interac e-Transfer</option>
                <option value="BankTransfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
          </div>

          {/* Interac reference number */}
          <div className="space-y-1.5 mb-6">
            <label className="text-xs font-bold text-gray-600">Interac reference number (or bank reference)</label>
            <input 
              type="text" 
              value={formData.reference}
              onChange={e => setFormData({...formData, reference: e.target.value})}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-[#111] outline-none focus:border-[#111] transition-colors"
            />
          </div>

          {/* Proof of payment */}
          <div className="space-y-1.5 mb-6">
            <label className="text-xs font-bold text-gray-600">
              Proof of Payment {formData.existingProofFileName && "(Optional to replace)"}
            </label>
            {formData.existingProofFileName && !file && (
              <div className="text-sm text-gray-500 mb-2 p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center gap-2">
                <FileText size={16} className="text-emerald-600" />
                Current file: <span className="font-medium text-[#111]">{formData.existingProofFileName}</span>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*,.pdf"
              onChange={e => setFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-[#111] outline-none"
            />
          </div>

          {/* Note (optional) */}
          <div className="space-y-1.5 mb-10">
            <label className="text-xs font-bold text-gray-600">Note (optional)</label>
            <textarea 
              rows={3}
              value={formData.note}
              onChange={e => setFormData({...formData, note: e.target.value})}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-[#111] outline-none focus:border-[#111] transition-colors resize-none"
            ></textarea>
          </div>

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
              <button 
                type="button" 
                onClick={(e) => handleAction(e, false)}
                disabled={isPending}
                className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-[#111] transition-colors disabled:opacity-50"
              >
                Save draft
              </button>
              <button 
                type="submit" 
                disabled={isPending}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#111] text-white rounded-full text-sm font-medium hover:bg-black transition-colors disabled:opacity-50 shadow-sm"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Continue to proof
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </form>

        {/* Right: Instructions */}
        <div className="w-full lg:w-[320px] xl:w-[360px] space-y-4 shrink-0">
          
          {/* Payment guidance */}
          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-gray-800">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl"></div>
            
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-6 relative z-10">
              Before you submit
            </p>
            
            <div className="space-y-4 relative z-10">
              <div>
                <p className="text-sm leading-6 text-white/75">Use the official payment instructions your cooperative has provided. Enter the exact amount, reference and sender email from the payment you already made. Saving a draft does not credit savings; an admin must confirm the submitted payment.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* ─── Success Modal ─────────────────────────────── */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#111] mb-2">Draft Saved</h3>
            <p className="text-gray-500 mb-8 text-sm">
              Your payment draft has been securely saved. You can complete the submission anytime.
            </p>
            <button
              onClick={() => router.push("/dashboard/cash-wallet")}
              className="w-full py-3 bg-[#111] text-white rounded-full font-medium hover:bg-black transition-colors"
            >
              Back to Cash Wallet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
