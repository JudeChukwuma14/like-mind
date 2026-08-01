import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function ConfirmPaymentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-5xl mx-auto pb-12">
      <Link 
        href="/dashboard/cash-wallet"
        className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-[#111] transition-colors mb-6"
      >
        <ChevronLeft size={16} />
        Back to savings
      </Link>
      
      {children}
    </div>
  );
}
