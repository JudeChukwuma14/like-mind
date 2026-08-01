import { SetupSidebar } from "./SetupSidebar";
import { SetupTopBar } from "./SetupTopBar";

export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#f4efe6] text-[#171717]">
      {/* Left Sidebar — desktop only */}
      <div className="hidden md:block shrink-0">
        <SetupSidebar />
      </div>

      {/* Right — Top bar + content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <SetupTopBar />

        {/* Main content */}
        <main className="flex-1 w-full max-w-4xl mx-auto px-5 py-8 md:px-10 md:py-12 lg:px-16 lg:py-16">
          {children}
        </main>
      </div>
    </div>
  );
}
