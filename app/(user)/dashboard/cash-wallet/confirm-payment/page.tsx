"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Calendar, ChevronRight, Copy, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPaymentDraft, type CreatePaymentDraftPayload } from "@/app/lib/payments-api";
import { getApiErrorMessage } from "@/app/lib/api-client";
import toast from "react-hot-toast";

export default function ConfirmPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftId = searchParams?.get("draftId") || "";
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    type: "SavingsContribution",
    month: new Date().toISOString().slice(0, 7), // YYYY-MM
    amount: "25000",
    date: new Date().toISOString().slice(0, 10),
    interacEmail: "pay@likemind.co",
    method: "InteracETransfer",
    reference: "",
    note: ""
  });
  const [file, setFile] = useState<File | null>(null);

  const { mutate: saveDraft, isPending } = useMutation({
    mutationFn: async (isFinalSubmit: boolean) => {
      if (!formData.amount || !formData.date || !formData.interacEmail || !formData.method) {
        throw new Error("Please fill out all required fields.");
      }
      
      const payload: CreatePaymentDraftPayload = {
        Id: draftId || undefined,
        Type: formData.type,
        ContributionMonth: formData.month + "-01", // Convert YYYY-MM to YYYY-MM-DD
        AmountPaid: parseFloat(formData.amount),
        Currency: "NGN",
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
      // The API returns success message or draft details. 
      // We assume data.res contains the saved draft or its ID.
      // If we don't have the new draft ID easily from res, we might have to fetch it, 
      // but let's assume the user can just go back to cash wallet if they save as draft.
      if (data.isFinalSubmit) {
        // We need the draft ID to review. If res has an ID, use it. 
        // For now, if we don't know the new ID, we just go back to wallet or we use a hack.
        // Assuming the backend returns { data: { id: "..." } } or similar, we'd do:
        const newDraftId = (data.res as any)?.data?.id || (data.res as any)?.id || draftId;
        if (newDraftId) {
          router.push(`/dashboard/cash-wallet/confirm-payment/review?draftId=${newDraftId}`);
        } else {
          toast.success("Draft saved successfully!");
          router.push("/dashboard/cash-wallet");
        }
      } else {
        toast.success("Draft saved successfully!");
        router.push("/dashboard/cash-wallet");
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
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-[#111] outline-none focus:border-[#111] transition-colors appearance-none"
              >
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
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-amber-600">$</span>
                <input 
                  type="number" 
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border-2 border-[#111] rounded-lg text-sm font-medium text-[#111] outline-none transition-colors shadow-sm"
                />
              </div>
            </div>

            {/* Payment date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600">Payment date</label>
              <div className="relative">
                <input 
                  type="date" 
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-[#111] outline-none focus:border-[#111] transition-colors pr-10"
                />
              </div>
            </div>
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
                value={formData.method}
                onChange={e => setFormData({...formData, method: e.target.value})}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-[#111] outline-none focus:border-[#111] transition-colors appearance-none"
              >
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
            <label className="text-xs font-bold text-gray-600">Proof of Payment</label>
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
          
          {/* Interac Card */}
          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-gray-800">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl"></div>
            
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-6 relative z-10">
              Send Interac E-Transfer to
            </p>
            
            <div className="space-y-4 relative z-10">
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">
                  Interac Email
                </p>
                <p className="font-bold text-base">pay@likemind.co</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">
                  Security Question
                </p>
                <p className="font-bold text-base">Your member ID</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
