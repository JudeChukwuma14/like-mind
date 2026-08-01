import { Sidebar } from "./Sidebar";

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#f4efe6] text-[#171717] font-sans selection:bg-yellow-200">
      <div className="hidden lg:block shrink-0">
        <Sidebar />
      </div>
      
      {/* Mobile Header fallback - omitted for brevity, focusing on desktop sidebar as per design */}
      
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="flex-1 w-full max-w-4xl mx-auto p-6 md:p-12 lg:p-20">
          {children}
        </div>
      </main>
    </div>
  );
}
