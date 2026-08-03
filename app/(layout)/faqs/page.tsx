import { Metadata } from "next";
import { FaqAccordion } from "../FaqAccordion";
import { FadeUp, FadeIn } from "@/app/components/Motion";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQs & Support",
  description:
    "Frequently Asked Questions about Kajola. Get answers to your questions about our programs, services, and more.",
};

const FAQs = () => {
  return (
    <div className="min-h-screen pb-32" style={{ background: "var(--mkt-bg)" }}>
      {/* Hero Section */}
      <section 
        className="rounded-b-[3rem] pt-12 md:pt-20 pb-20 md:pb-28 px-6 border-b"
        style={{ background: "var(--mkt-card)", borderColor: "var(--mkt-border)" }}
      >
        <div className="max-w-7xl mx-auto">
            
          
          <div className="flex flex-col lg:flex-row gap-16">
            <div className="lg:w-1/3">
              <FadeUp delay={0.1}>
                <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--mkt-accent)" }}>
                  — Faqs
                </p>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6" style={{ color: "var(--mkt-text)" }}>
                  Common
                  <br />
                  questions,
                  <br />
                  and answers.
                </h2>
                <p className="text-sm leading-relaxed max-w-xs" style={{ color: "var(--mkt-muted)" }}>
                  If your question isn't covered here, message us — every member rep
                  is also a member.
                </p>
              </FadeUp>
            </div>
            
            <FadeIn delay={0.2} className="w-full lg:w-2/3">
              <FaqAccordion />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Support CTA ────────────────────────────────────────────── */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <FadeUp>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6" style={{ color: "var(--mkt-text)" }}>
              Still have questions?
            </h2>
            <p className="text-lg leading-relaxed mb-10 mx-auto max-w-xl" style={{ color: "var(--mkt-muted)" }}>
              Our support team is available Monday to Friday, 9am to 5pm EST. 
              We typically respond within a few hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <button 
                  className="px-8 py-3.5 rounded-full font-semibold transition-transform hover:scale-105"
                  style={{ background: "var(--fg)", color: "var(--bg)" }}
                >
                  Contact support
                </button>
              </Link>
              <Link href="/resources">
                <button 
                  className="px-8 py-3.5 rounded-full font-semibold transition-colors border hover:bg-black/5"
                  style={{ background: "transparent", color: "var(--mkt-text)", borderColor: "var(--mkt-border)" }}
                >
                  Browse resources
                </button>
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
};

export default FAQs;
