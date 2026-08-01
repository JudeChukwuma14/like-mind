import type { Metadata } from "next";
import Link from "next/link";
import { FaqAccordion } from "./FaqAccordion";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Kajola — your all-in-one platform for managing teams, workflows, and growth.",
};

export default function HomePage() {
  return (
    <>
      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 py-18 overflow-hidden">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-black leading-tight tracking-tight max-w-4xl">
          Let's Build wealth
        </h1>
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-black leading-tight tracking-tight max-w-4xl">
          Together
        </h1>

        <p className="mt-6 text-lg text-black/55 max-w-2xl mx-auto leading-relaxed">
          A member-owned co-op pooling capital across real estate, agriculture,
          tech and welfare. Honest returns, no hidden fees.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            id="hero-cta-primary"
            href="/dashboard"
            className="px-8 py-3.5 rounded-xl font-semibold bg-black text-white text-base  transition-all duration-200 hover:scale-105 "
          >
            Become a member →
          </Link>
          <Link
            id="hero-cta-secondary"
            href="/about"
            className="px-8 py-3.5 rounded-xl font-semibold text-black bg-white  text-base border border-white/15 hover:border-white/30 transition-all duration-200 hover:bg-white/5"
          >
            Learn more
          </Link>
        </div>
      </section>

      {/* ── About ───────────────────────────────────────────────── */}
      <section className="py-24 px-6 max-w-7xl mx-auto bg-white">
        <div className="flex flex-col md:flex-row gap-8 md:gap-24 items-start">
          <div className="md:w-1/3">
            <p className="text-xs font-semibold tracking-widest text-[#a89f91] uppercase mb-4">
              — Background
            </p>
            <h2 className="text-3xl font-bold text-gray-900">About Us</h2>
          </div>
          <div className="md:w-2/3">
            <p className="text-lg text-gray-700 leading-relaxed">
              LikeMinds Cooperative was founded in Toronto, 2014 by twelve
              members of the Nigerian-Canadian diaspora — engineers, nurses,
              teachers, small business owners — who pooled their first $50,000
              to buy a duplex together. By 2017, we had 200 members and a
              federally registered cooperative charter. By 2026, we manage $84M
              of pooled capital across six sectors and seven provinces.
            </p>
          </div>
        </div>
      </section>

      {/* ── Principles ──────────────────────────────────────────── */}
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl p-10 md:p-16 shadow-sm border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-8 justify-between items-start mb-16">
            <div>
              <p className="text-xs font-semibold tracking-widest text-[#a89f91] uppercase mb-4">
                Principles
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
                Our core values
              </h2>
            </div>
            <div className="lg:w-1/3">
              <p className="text-sm text-gray-600 leading-relaxed mt-2 lg:mt-8">
                A co-op is only as honest as its books, ambitious as its
                members, and durable as its values. We hold all these to a high
                bar.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 border-t border-gray-100 pt-10">
            {[
              {
                num: "01",
                title: "Transparency",
                desc: "Open books. Quarterly disclosures.",
              },
              {
                num: "02",
                title: "Inclusivity",
                desc: "Newcomers and veterans share the floor.",
              },
              {
                num: "03",
                title: "Sustainability",
                desc: "Investments built to last decades.",
              },
              {
                num: "04",
                title: "Ethics",
                desc: "No interest-bearing instruments.",
              },
              {
                num: "05",
                title: "One member, one vote",
                desc: "No silos in council.",
              },
            ].map((value) => (
              <div key={value.num} className="flex flex-col">
                <span className="text-xs font-mono text-[#a89f91] mb-3">
                  {value.num}
                </span>
                <h3 className="font-bold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Faqs ────────────────────────────────────────────────── */}
      <section className="py-24 px-6 max-w-7xl mx-auto bg-white">
        <div className="flex flex-col lg:flex-row gap-16">
          <div className="lg:w-1/3">
            <p className="text-xs font-semibold tracking-widest text-[#a89f91] uppercase mb-4">
              — Faqs
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight mb-6">
              Common
              <br />
              questions,
              <br />
              and answers.
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
              If your question isn't covered here, message us — every member rep
              is also a member.
            </p>
          </div>
          <FaqAccordion />
        </div>
      </section>

      {/* ── Member Intake ───────────────────────────────────────── */}
      <section className="py-24 px-6 text-center">
        <p className="text-xs font-semibold tracking-widest text-[#a89f91] uppercase mb-4">
          Member Intake
        </p>
        <h2 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight mb-6">
          Ten minutes to apply.
        </h2>
        <p className="text-gray-600 mb-10 max-w-sm mx-auto">
          Complete one application. We review within five business days.
          <br />
          Full member access on approval.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <Link
            href="/apply"
            className="px-6 py-3 bg-[#111111] text-white rounded-xl font-semibold text-sm hover:scale-105 transition-transform"
          >
            Start your application
          </Link>
          <Link
            href="/contact"
            className="px-6 py-3 bg-transparent text-gray-900 border border-gray-200 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            Talk to a member rep
          </Link>
        </div>

        {/* Placeholder image/video rectangle */}
        <div className="max-w-4xl mx-auto h-100 md:h-112.5 bg-[#e1e2dd] rounded-3xl w-full"></div>
      </section>

      {/* ── Contact ─────────────────────────────────────────────── */}
      <section className=" bg-white">
        <div className="py-24 px-6 max-w-5xl mx-auto ">
          <div className="flex flex-col lg:flex-row justify-center gap-8 lg:gap-12 items-start">
            {/* Contact Form */}
            <div className="bg-white rounded-3xl p-10 lg:p-12 shadow-sm border border-gray-100 w-full lg:w-3/5">
              <p className="text-xs font-semibold tracking-widest text-indigo-500 uppercase mb-4">
                — Contact Form
              </p>
              <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-10">
                Tell us how we can help.
              </h2>

              <form className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Full name
                    </label>
                    <input
                      type="text"
                      placeholder="Alexandra Morgan"
                      className="w-full px-4 py-3 rounded-xl border border-black/50 focus:outline-none focus:ring-2  focus:border-black/30 transition-all text-sm "
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="alex@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-black/50 focus:outline-none focus:ring-2  focus:border-black/30 transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    I'd like to ask about
                  </label>
                  <div className="relative">
                    <select className="w-full px-4 py-3 rounded-xl border border-black/50 focus:outline-none focus:ring-2  focus:border-black/30 transition-all text-sm appearance-none bg-white">
                      <option>Membership application</option>
                      <option>General inquiries</option>
                    </select>
                    <svg
                      className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
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
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Your message
                  </label>
                  <textarea
                    rows={4}
                    placeholder="I'd like to learn more about the Generations Trust scheme and what it means for my children's inheritance."
                    className="w-full px-4 py-3 rounded-xl border border-black/50 focus:outline-none ring-2 ring-black/10  transition-all text-sm resize-none"
                  ></textarea>
                  <p className="text-xs text-gray-500 mt-2">
                    Avg response time: 8 hours on business days.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="w-5 h-5 rounded bg-[#111111] flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
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
                    <span className="text-sm font-medium text-gray-600">
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
            <div className="bg-[#111111] rounded-3xl p-10 lg:p-12 text-white w-full lg:w-90 lg:mt-32">
              <p className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-8">
                — Direct Lines
              </p>
              <div className="flex flex-col gap-8">
                <div className="flex justify-between items-center border-b border-white/10 pb-6">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">
                      General inquiries
                    </p>
                    <p className="font-semibold text-sm">
                      support@likeminds.coop
                    </p>
                  </div>
                  <div className="text-[#facc15] text-xs">↗</div>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-6">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">
                      Member relations
                    </p>
                    <p className="font-semibold text-sm">
                      members@likeminds.coop
                    </p>
                  </div>
                  <div className="text-[#facc15] text-xs">↗</div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">
                      Phone (toll-free)
                    </p>
                    <p className="font-semibold text-sm">1—800—LIKEMIND</p>
                  </div>
                  <div className="text-[#facc15] text-xs">↗</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
