import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with LikeMinds Cooperative.",
};

export default function ContactPage() {
  return (
    <div className="bg-[#fcfbf9] min-h-screen pb-32">
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="bg-[#f6f4eb] rounded-b-[3rem] pt-12 md:pt-20 pb-20 md:pb-28 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-[10px] font-mono font-bold tracking-[0.2em] text-gray-500 uppercase mb-16 md:mb-20">
            HOME / CONTACT
          </div>
          <div className="max-w-2xl">
            <h1 className="text-6xl sm:text-7xl md:text-[6rem] font-bold text-gray-900 tracking-tight leading-[1.05] mb-8">
              Let's talk.
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
              Have a question, a partnership idea, or just want to say hi? We'd
              love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* ── Content ───────────────────────────────────────────── */}
      <section className="px-6 -mt-10 md:-mt-16 relative z-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between gap-8 lg:gap-12 items-start">
            
            {/* Contact Form */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100 w-full lg:w-3/5">
              <p className="text-xs font-semibold tracking-widest text-indigo-500 uppercase mb-4">
                — Contact Form
              </p>
              <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-10">
                Tell us how we can help.
              </h2>

              <form className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex-1">
                    <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                      Full name
                    </label>
                    <input
                      type="text"
                      placeholder="Alexandra Morgan"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all text-sm bg-gray-50/50"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="alex@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all text-sm bg-gray-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                    I'd like to ask about
                  </label>
                  <div className="relative">
                    <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all text-sm appearance-none bg-gray-50/50">
                      <option>Membership application</option>
                      <option>General inquiries</option>
                      <option>Partnerships</option>
                    </select>
                    <svg
                      className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
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
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                    Your message
                  </label>
                  <textarea
                    rows={5}
                    placeholder="I'd like to learn more about..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all text-sm resize-none bg-gray-50/50"
                  ></textarea>
                  <p className="text-xs text-gray-500 mt-2">
                    Avg response time: 8 hours on business days.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-6 pt-4 border-t border-gray-100">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="w-5 h-5 rounded border border-gray-300 flex items-center justify-center">
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
                    <span className="text-[13px] font-medium text-gray-600">
                      I agree to the privacy policy
                    </span>
                  </label>
                  <button
                    type="button"
                    className="px-6 py-3 bg-[#111111] text-white rounded-full font-semibold text-sm hover:scale-105 transition-transform flex items-center gap-2"
                  >
                    Send message <span aria-hidden="true">→</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Contact Info Box */}
            <div className="bg-[#111111] rounded-[2.5rem] p-10 lg:p-12 text-white w-full lg:w-2/5 lg:mt-32 shadow-xl shadow-black/5">
              <p className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-8">
                — Direct Lines
              </p>
              <div className="flex flex-col gap-8">
                <div className="flex justify-between items-center border-b border-white/10 pb-6 group cursor-pointer">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">
                      General inquiries
                    </p>
                    <p className="font-semibold text-sm">
                      support@likeminds.coop
                    </p>
                  </div>
                  <div className="text-[#facc15] text-xs transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">↗</div>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-6 group cursor-pointer">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">
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
                    <p className="text-xs text-gray-400 mb-1">
                      Phone (toll-free)
                    </p>
                    <p className="font-semibold text-sm">1—800—LIKEMIND</p>
                  </div>
                  <div className="text-[#facc15] text-xs transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">↗</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
