import type { Metadata } from "next";
import { FadeUp, FadeIn } from "@/app/components/Motion";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with LikeMinds Cooperative.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen pb-32" style={{ background: "var(--mkt-bg)" }}>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section 
        className="rounded-b-[3rem] pt-12 md:pt-20 pb-20 md:pb-28 px-6 relative z-10 border-b"
        style={{ background: "var(--mkt-card)", borderColor: "var(--mkt-border)" }}
      >
        <div className="max-w-6xl mx-auto">
          <FadeUp>
           
            <div className="max-w-2xl">
              <h1 className="text-6xl sm:text-7xl md:text-[6rem] font-bold tracking-tight leading-[1.05] mb-8" style={{ color: "var(--mkt-text)" }}>
                Let's talk.
              </h1>
              <p className="text-xl leading-relaxed max-w-lg" style={{ color: "var(--mkt-muted)" }}>
                Have a question, a partnership idea, or just want to say hi? We'd
                love to hear from you.
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Content ───────────────────────────────────────────── */}
      <section className="px-6 -mt-10 md:-mt-16 relative z-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between gap-8 lg:gap-12 items-start">
            
            {/* Contact Form */}
            <FadeIn delay={0.1} className="w-full lg:w-3/5">
              <div 
                className="rounded-[2.5rem] p-8 md:p-12 shadow-sm border"
                style={{ background: "var(--mkt-bg)", borderColor: "var(--mkt-border)" }}
              >
                <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--mkt-accent)" }}>
                  — Contact Form
                </p>
                <h2 className="text-4xl font-bold tracking-tight mb-10" style={{ color: "var(--mkt-text)" }}>
                  Tell us how we can help.
                </h2>

                <form className="flex flex-col gap-6">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-1">
                      <label className="block text-[13px] font-semibold mb-2" style={{ color: "var(--mkt-text)" }}>
                        Full name
                      </label>
                      <input
                        type="text"
                        placeholder="Alexandra Morgan"
                        className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                        style={{ background: "var(--mkt-card)", borderColor: "var(--mkt-border)", color: "var(--mkt-text)" }}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[13px] font-semibold mb-2" style={{ color: "var(--mkt-text)" }}>
                        Email
                      </label>
                      <input
                        type="email"
                        placeholder="alex@example.com"
                        className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                        style={{ background: "var(--mkt-card)", borderColor: "var(--mkt-border)", color: "var(--mkt-text)" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold mb-2" style={{ color: "var(--mkt-text)" }}>
                      I'd like to ask about
                    </label>
                    <div className="relative">
                      <select 
                        className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm appearance-none"
                        style={{ background: "var(--mkt-card)", borderColor: "var(--mkt-border)", color: "var(--mkt-text)" }}
                      >
                        <option>Membership application</option>
                        <option>General inquiries</option>
                        <option>Partnerships</option>
                      </select>
                      <svg
                        className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: "var(--mkt-muted)" }}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold mb-2" style={{ color: "var(--mkt-text)" }}>
                      Your message
                    </label>
                    <textarea
                      rows={5}
                      placeholder="I'd like to learn more about..."
                      className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm resize-none"
                      style={{ background: "var(--mkt-card)", borderColor: "var(--mkt-border)", color: "var(--mkt-text)" }}
                    ></textarea>
                    <p className="text-xs mt-2" style={{ color: "var(--mkt-muted)" }}>
                      Avg response time: 8 hours on business days.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-6 pt-4 border-t" style={{ borderColor: "var(--mkt-border)" }}>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className="w-5 h-5 rounded border flex items-center justify-center" style={{ borderColor: "var(--mkt-border)", background: "var(--mkt-card)" }}>
                        <svg
                          className="w-3 h-3 text-transparent"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <span className="text-[13px] font-medium" style={{ color: "var(--mkt-muted)" }}>
                        I agree to the privacy policy
                      </span>
                    </label>
                    <button
                      type="button"
                      className="px-6 py-3 rounded-full font-semibold text-sm hover:scale-105 transition-transform flex items-center gap-2"
                      style={{ background: "var(--fg)", color: "var(--bg)" }}
                    >
                      Send message <span aria-hidden="true">→</span>
                    </button>
                  </div>
                </form>
              </div>
            </FadeIn>

            {/* Contact Info Box */}
            <FadeIn delay={0.2} className="w-full lg:w-2/5 lg:mt-32">
              <div 
                className="rounded-[2.5rem] p-10 lg:p-12 shadow-xl flex flex-col justify-between"
                style={{ background: "#111111", border: "1px solid #2a2a2a", color: "white" }}
              >
                <div>
                  <p className="text-xs font-semibold tracking-widest uppercase mb-8" style={{ color: "var(--mkt-muted)" }}>
                    — Direct Lines
                  </p>
                  <div className="flex flex-col gap-8">
                    <div className="flex justify-between items-center border-b pb-6 group cursor-pointer" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                      <div>
                        <p className="text-xs mb-1 text-gray-400">
                          General inquiries
                        </p>
                        <p className="font-semibold text-sm">
                          support@likeminds.coop
                        </p>
                      </div>
                      <div className="text-[#facc15] text-xs transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">↗</div>
                    </div>
                    <div className="flex justify-between items-center border-b pb-6 group cursor-pointer" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                      <div>
                        <p className="text-xs mb-1 text-gray-400">
                          Member relations
                        </p>
                        <p className="font-semibold text-sm">
                          members@likeminds.coop
                        </p>
                      </div>
                      <div className="text-[#facc15] text-xs transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">↗</div>
                    </div>
                    <div className="flex justify-between items-center group cursor-pointer">
                      <div>
                        <p className="text-xs mb-1 text-gray-400">
                          Phone (toll-free)
                        </p>
                        <p className="font-semibold text-sm">1—800—LIKEMIND</p>
                      </div>
                      <div className="text-[#facc15] text-xs transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">↗</div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

          </div>
        </div>
      </section>
    </div>
  );
}
