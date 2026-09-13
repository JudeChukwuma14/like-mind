import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FaqAccordion } from "./FaqAccordion";
import {
  FadeUp,
  FadeIn,
  StaggerChildren,
  StaggerItem,
  HoverScale,
  ScaleIn,
} from "@/app/components/Motion";

export const metadata: Metadata = {
  title: "Home | LikeMinds Cooperative",
  description:
    "LikeMinds Cooperative — a member-owned co-op pooling capital across real estate, agriculture, tech and welfare. Build wealth together with honest returns and no hidden fees.",
};

/* ── Static data ──────────────────────────────────────────────── */
const stats = [
  { value: "$84M", label: "Pooled capital" },
  { value: "1,200+", label: "Active members" },
  { value: "6", label: "Investment sectors" },
  { value: "7", label: "Provinces served" },
];

const features = [
  {
    icon: "🏠",
    title: "Real Estate",
    desc: "Pooled co-investment in residential and commercial properties across Canada.",
  },
  {
    icon: "🌾",
    title: "Agriculture",
    desc: "Long-horizon farmland and agri-business holdings with stable returns.",
  },
  {
    icon: "💻",
    title: "Technology",
    desc: "Equity participation in vetted African-Canadian tech ventures.",
  },
  {
    icon: "❤️",
    title: "Welfare Schemes",
    desc: "Emergency funds, health support, and education grants for members.",
  },
  {
    icon: "📈",
    title: "Transparent Returns",
    desc: "Quarterly statements. Open books. No hidden management fees.",
  },
  {
    icon: "🗳️",
    title: "Democratic Governance",
    desc: "Every member has exactly one vote at the annual council, regardless of capital.",
  },
];

const steps = [
  {
    num: "01",
    title: "Apply Online",
    desc: "Complete a 10-minute application with your basic personal and financial details.",
    cta: "Start application",
    href: "/apply",
  },
  {
    num: "02",
    title: "We Review",
    desc: "Our member-elected committee reviews applications within 5 business days.",
    cta: null,
    href: null,
  },
  {
    num: "03",
    title: "Welcome In",
    desc: "Upon approval you get full access to the member portal, investments, and voting rights.",
    cta: "Learn more",
    href: "/about",
  },
];

const testimonials = [
  {
    quote:
      "I joined LikeMinds in 2018 as a newcomer with $500. Today I co-own a stake in three properties. The transparency is what keeps me here.",
    name: "Amaka O.",
    role: "Member since 2018 · Nurse, Ottawa",
    initials: "AO",
  },
  {
    quote:
      "As a small business owner I couldn't afford solo real estate investment. Pooling with 1,200 others changed everything for my family.",
    name: "Chukwuemeka B.",
    role: "Member since 2019 · Entrepreneur, Toronto",
    initials: "CB",
  },
  {
    quote:
      "What I love most is the governance model — my vote matters as much as the founding members'. That's rare in finance.",
    name: "Ngozi A.",
    role: "Member since 2021 · Software Engineer, Calgary",
    initials: "NA",
  },
];

const partners = [
  "CMHC",
  "BDC Canada",
  "FCC",
  "Co-operatives Canada",
  "NCBA CLUSA",
  "Scotiabank",
  "TD Canada Trust",
  "MNP LLP",
];

const values = [
  { num: "01", title: "Transparency", desc: "Open books. Quarterly disclosures." },
  { num: "02", title: "Inclusivity", desc: "Newcomers and veterans share the floor." },
  { num: "03", title: "Sustainability", desc: "Investments built to last decades." },
  { num: "04", title: "Ethics", desc: "No interest-bearing instruments." },
  { num: "05", title: "One member, one vote", desc: "No silos in council." },
];

/* ── Page ─────────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <>
      {/* ══════════════════════════════════════════════════════════
          1. HERO
          ══════════════════════════════════════════════════════════ */}
      <section className="relative flex flex-col items-center justify-center text-center min-h-[92vh] px-6 py-24 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-bg.png"
            alt="Hero background — abstract golden light on dark"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/80 via-[#0a0a0a]/55 to-[#0a0a0a]/90" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.55)_100%)]" />
        </div>

        {/* Gold orb */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#facc15]/5 rounded-full blur-3xl pointer-events-none z-0" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center max-w-5xl mx-auto">
          {/* Badge */}
          <div className="animate-fade-up mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#facc15]/30 bg-[#facc15]/10 text-[#facc15] text-xs font-semibold tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#facc15] animate-pulse inline-block" />
              Federally Registered Canadian Co-op · Est. 2014
            </span>
          </div>

          {/* Headline */}
          <h1 className="animate-fade-up delay-100 text-5xl sm:text-6xl md:text-8xl font-extrabold text-white leading-[1.05] tracking-tight max-w-4xl">
            Let&apos;s Build{" "}
            <span className="shimmer-text">Wealth</span>
            <br />
            Together
          </h1>

          <p className="animate-fade-up delay-300 mt-8 text-lg sm:text-xl text-white/65 max-w-2xl mx-auto leading-relaxed font-light">
            A member-owned co-op pooling capital across real estate, agriculture,
            tech and welfare. Honest returns, no hidden fees, one member one vote.
          </p>

          {/* CTAs */}
          <div className="animate-fade-up delay-400 mt-12 flex flex-wrap items-center justify-center gap-4">
            <Link
              id="hero-cta-primary"
              href="/apply"
              className="group relative px-8 py-4 rounded-full font-semibold bg-[#facc15] text-[#0a0a0a] text-base transition-all duration-300 hover:bg-[#fde68a] hover:scale-105 shadow-[0_0_30px_rgba(250,204,21,0.3)] hover:shadow-[0_0_50px_rgba(250,204,21,0.5)]"
            >
              Become a member
              <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
            <Link
              id="hero-cta-secondary"
              href="/about"
              className="px-8 py-4 rounded-full font-semibold text-white text-base border border-white/25 hover:border-white/50 hover:bg-white/8 transition-all duration-300 backdrop-blur-sm"
            >
              Learn more
            </Link>
          </div>

          {/* Trust signals */}
          <div className="animate-fade-up delay-500 mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-white/40 font-medium">
            {["No hidden fees", "Federally registered", "Member-governed"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-[#facc15]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div className="animate-fade-up delay-600 relative z-10 mt-20 w-full max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 rounded-2xl overflow-hidden border border-white/10 backdrop-blur-sm">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center py-6 px-4 bg-[#0a0a0a]/60 hover:bg-[#facc15]/5 transition-colors duration-300"
              >
                <span className="text-3xl md:text-4xl font-bold text-[#facc15]">{stat.value}</span>
                <span className="text-xs text-white/50 mt-1 font-medium tracking-wide">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-float">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-white/30 tracking-widest uppercase font-medium">Scroll</span>
            <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          2. TRUSTED BY / PARTNERS
          ══════════════════════════════════════════════════════════ */}
      <section
        className="py-12 border-y overflow-hidden"
        style={{ borderColor: "var(--mkt-border)", background: "var(--mkt-card)" }}
      >
        <FadeIn>
          <p className="text-center text-xs font-semibold tracking-widest uppercase mb-8" style={{ color: "var(--mkt-accent)" }}>
            Trusted & Recognised By
          </p>
        </FadeIn>
        {/* Marquee strip */}
        <div className="relative flex overflow-hidden">
          <div className="animate-marquee flex items-center gap-16 whitespace-nowrap">
            {[...partners, ...partners].map((p, i) => (
              <span
                key={i}
                className="text-sm font-bold tracking-widest uppercase shrink-0"
                style={{ color: "var(--mkt-muted)" }}
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          3. ABOUT
          ══════════════════════════════════════════════════════════ */}
      <section
        className="py-24 px-6 max-w-7xl mx-auto"
      >
        <div className="flex flex-col md:flex-row gap-8 md:gap-24 items-start">
          <FadeUp className="md:w-1/3">
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--mkt-accent)" }}>
              — Background
            </p>
            <h2 className="text-3xl font-bold" style={{ color: "var(--mkt-text)" }}>About Us</h2>
          </FadeUp>
          <FadeUp delay={0.15} className="md:w-2/3">
            <p className="text-lg leading-relaxed" style={{ color: "var(--mkt-muted)" }}>
              LikeMinds Cooperative was founded in Toronto, 2014 by twelve
              members of the Canadan-Canadian diaspora — engineers, nurses,
              teachers, small business owners — who pooled their first $50,000
              to buy a duplex together. By 2017, we had 200 members and a
              federally registered cooperative charter. By 2026, we manage{" "}
              <strong style={{ color: "var(--mkt-text)" }}>$84M of pooled capital</strong>{" "}
              across six sectors and seven provinces.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          4. FEATURES / BENEFITS
          ══════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6" style={{ background: "var(--mkt-card)" }}>
        <div className="max-w-7xl mx-auto">
          <FadeUp className="text-center mb-16">
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--mkt-accent)" }}>
              Programs & Services
            </p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ color: "var(--mkt-text)" }}>
              Six ways we build<br />
              <span className="shimmer-text">wealth together</span>
            </h2>
          </FadeUp>

          <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <StaggerItem key={f.title}>
                <HoverScale scale={1.02}>
                  <div
                    className="group p-8 rounded-3xl border h-full cursor-default"
                    style={{
                      background: "var(--mkt-bg)",
                      borderColor: "var(--mkt-border)",
                    }}
                  >
                    <div className="text-4xl mb-5">{f.icon}</div>
                    <h3 className="text-lg font-bold mb-3 group-hover:text-[#facc15] transition-colors" style={{ color: "var(--mkt-text)" }}>
                      {f.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--mkt-muted)" }}>
                      {f.desc}
                    </p>
                  </div>
                </HoverScale>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          5. HOW IT WORKS
          ══════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="text-center mb-16">
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--mkt-accent)" }}>
              How It Works
            </p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ color: "var(--mkt-text)" }}>
              Join in three steps
            </h2>
          </FadeUp>

          <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line (desktop) */}
            <div
              className="hidden md:block absolute top-10 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px"
              style={{ background: "var(--mkt-border)" }}
            />

            {steps.map((step) => (
              <StaggerItem key={step.num}>
                <div className="flex flex-col items-center text-center relative">
                  {/* Step number circle */}
                  <div className="w-20 h-20 rounded-full border-2 border-[#facc15] bg-[#facc15]/10 flex items-center justify-center mb-6 relative z-10">
                    <span className="text-xl font-bold text-[#facc15]">{step.num}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: "var(--mkt-text)" }}>{step.title}</h3>
                  <p className="text-sm leading-relaxed max-w-xs" style={{ color: "var(--mkt-muted)" }}>{step.desc}</p>
                  {step.cta && step.href && (
                    <Link
                      href={step.href}
                      className="mt-5 text-sm font-semibold text-[#facc15] hover:text-[#fde68a] transition-colors inline-flex items-center gap-1"
                    >
                      {step.cta} →
                    </Link>
                  )}
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          6. STATISTICS / METRICS (animated counters)
          ══════════════════════════════════════════════════════════ */}
      <section
        className="py-24 px-6 relative overflow-hidden"
        style={{ background: "var(--nav-bg)" }}
      >
        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#facc15]/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <FadeUp className="text-center mb-16">
            <p className="text-xs font-semibold tracking-widest uppercase mb-4 text-[#facc15]/70">
              By the Numbers
            </p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
              A decade of impact
            </h2>
          </FadeUp>

          <StaggerChildren className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "$84M", label: "Pooled capital under management", sub: "↑ 23% YoY" },
              { value: "1,200+", label: "Active members nationally", sub: "7 provinces" },
              { value: "6", label: "Investment sectors", sub: "Real estate · Agri · Tech · Welfare · …" },
              { value: "12", label: "Years of operation", sub: "Est. 2014, Toronto" },
            ].map((stat, i) => (
              <StaggerItem key={stat.label}>
                <div className="p-8 rounded-3xl border border-white/10 bg-white/3 flex flex-col">
                  <span className="text-4xl md:text-5xl font-extrabold text-[#facc15] mb-2">{stat.value}</span>
                  <span className="text-sm font-medium text-white/80 mb-1">{stat.label}</span>
                  <span className="text-xs text-white/35">{stat.sub}</span>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          7. TESTIMONIALS
          ══════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6" style={{ background: "var(--mkt-card)" }}>
        <div className="max-w-7xl mx-auto">
          <FadeUp className="text-center mb-16">
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--mkt-accent)" }}>
              Testimonials
            </p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ color: "var(--mkt-text)" }}>
              What members say
            </h2>
          </FadeUp>

          <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <StaggerItem key={t.name}>
                <HoverScale>
                  <div
                    className="flex flex-col h-full p-8 rounded-3xl border"
                    style={{
                      background: "var(--mkt-bg)",
                      borderColor: "var(--mkt-border)",
                    }}
                  >
                    {/* Stars */}
                    <div className="flex gap-1 mb-6">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg key={i} className="w-4 h-4 text-[#facc15]" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      ))}
                    </div>
                    {/* Quote */}
                    <p className="flex-1 text-sm leading-relaxed mb-6" style={{ color: "var(--mkt-muted)" }}>
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    {/* Author */}
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-[#0a0a0a] shrink-0"
                        style={{ background: "#facc15" }}
                      >
                        {t.initials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "var(--mkt-text)" }}>{t.name}</p>
                        <p className="text-xs" style={{ color: "var(--mkt-muted)" }}>{t.role}</p>
                      </div>
                    </div>
                  </div>
                </HoverScale>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          8. CORE VALUES / PRINCIPLES
          ══════════════════════════════════════════════════════════ */}
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <div
          className="rounded-3xl p-10 md:p-16 border"
          style={{ background: "var(--mkt-card)", borderColor: "var(--mkt-border)" }}
        >
          <div className="flex flex-col lg:flex-row gap-8 justify-between items-start mb-16">
            <FadeUp>
              <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--mkt-accent)" }}>
                Principles
              </p>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ color: "var(--mkt-text)" }}>
                Our core values
              </h2>
            </FadeUp>
            <FadeUp delay={0.15} className="lg:w-1/3">
              <p className="text-sm leading-relaxed mt-2 lg:mt-8" style={{ color: "var(--mkt-muted)" }}>
                A co-op is only as honest as its books, ambitious as its members,
                and durable as its values. We hold all these to a high bar.
              </p>
            </FadeUp>
          </div>

          <StaggerChildren
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 border-t pt-10"
            style={{ borderColor: "var(--mkt-border)" }}
          >
            {values.map((v) => (
              <StaggerItem key={v.num}>
                <HoverScale>
                  <div
                    className="group flex flex-col p-4 rounded-2xl cursor-default"
                    style={{}}
                  >
                    <span className="text-xs font-mono mb-3" style={{ color: "var(--mkt-accent)" }}>{v.num}</span>
                    <h3 className="font-bold mb-2 group-hover:text-[#facc15] transition-colors" style={{ color: "var(--mkt-text)" }}>
                      {v.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--mkt-muted)" }}>{v.desc}</p>
                  </div>
                </HoverScale>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          9. FAQ
          ══════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-16">
          <FadeUp className="lg:w-1/3">
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--mkt-accent)" }}>
              — FAQs
            </p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6" style={{ color: "var(--mkt-text)" }}>
              Common<br />questions,<br />and answers.
            </h2>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: "var(--mkt-muted)" }}>
              If your question isn&apos;t covered here, message us — every member rep
              is also a member.
            </p>
          </FadeUp>
          <FadeIn delay={0.2} className="flex-1">
            <FaqAccordion />
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          10. MEMBER INTAKE CTA BANNER
          ══════════════════════════════════════════════════════════ */}
      <section className="py-8 px-6">
        <ScaleIn>
          <div
            className="max-w-5xl mx-auto rounded-3xl p-12 md:p-16 text-center relative overflow-hidden"
            style={{ background: "var(--nav-bg)" }}
          >
            {/* Background glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-[#facc15]/8 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10">
              <p className="text-xs font-semibold tracking-widest text-[#facc15]/70 uppercase mb-4">
                Member Intake
              </p>
              <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
                Ten minutes to apply.
              </h2>
              <p className="text-white/60 mb-10 max-w-sm mx-auto text-base leading-relaxed">
                Complete one application. We review within five business days.
                Full member access on approval.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/apply"
                  className="px-8 py-4 bg-[#facc15] text-[#0a0a0a] rounded-full font-bold text-sm hover:bg-[#fde68a] hover:scale-105 transition-all duration-200 shadow-[0_0_30px_rgba(250,204,21,0.25)]"
                >
                  Start your application →
                </Link>
                <Link
                  href="/contact"
                  className="px-8 py-4 bg-transparent text-white border border-white/20 rounded-full font-semibold text-sm hover:bg-white/8 hover:border-white/40 transition-all duration-200"
                >
                  Talk to a member rep
                </Link>
              </div>
            </div>
          </div>
        </ScaleIn>
      </section>

      {/* ══════════════════════════════════════════════════════════
          11. CONTACT
          ══════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6" style={{ background: "var(--mkt-card)" }}>
        <div className="max-w-5xl mx-auto">
          <FadeUp className="text-center mb-16">
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--mkt-accent)" }}>
              Get In Touch
            </p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ color: "var(--mkt-text)" }}>
              We&apos;re here to help.
            </h2>
          </FadeUp>

          <div className="flex flex-col lg:flex-row justify-center gap-8 lg:gap-12 items-start">
            {/* Contact Form */}
            <FadeUp delay={0.1} className="w-full lg:w-3/5">
              <div
                className="rounded-3xl p-10 lg:p-12 border"
                style={{
                  background: "var(--mkt-bg)",
                  borderColor: "var(--mkt-border)",
                }}
              >
                <p className="text-xs font-semibold tracking-widest text-indigo-500 uppercase mb-4">
                  — Contact Form
                </p>
                <h3 className="text-3xl font-bold tracking-tight mb-10" style={{ color: "var(--mkt-text)" }}>
                  Tell us how we can help.
                </h3>

                <form className="flex flex-col gap-6">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold mb-2" style={{ color: "var(--mkt-text)" }}>
                        Full name
                      </label>
                      <input
                        type="text"
                        placeholder="Alexandra Morgan"
                        className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all text-sm"
                        style={{
                          background: "var(--mkt-card)",
                          borderColor: "var(--mkt-border)",
                          color: "var(--mkt-text)",
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-semibold mb-2" style={{ color: "var(--mkt-text)" }}>
                        Email
                      </label>
                      <input
                        type="email"
                        placeholder="alex@example.com"
                        className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all text-sm"
                        style={{
                          background: "var(--mkt-card)",
                          borderColor: "var(--mkt-border)",
                          color: "var(--mkt-text)",
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-2" style={{ color: "var(--mkt-text)" }}>
                      I&apos;d like to ask about
                    </label>
                    <div className="relative">
                      <select
                        className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all text-sm appearance-none"
                        style={{
                          background: "var(--mkt-card)",
                          borderColor: "var(--mkt-border)",
                          color: "var(--mkt-text)",
                        }}
                      >
                        <option>Membership application</option>
                        <option>General inquiries</option>
                        <option>Investment information</option>
                        <option>Loan queries</option>
                      </select>
                      <svg className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--mkt-muted)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-2" style={{ color: "var(--mkt-text)" }}>
                      Your message
                    </label>
                    <textarea
                      rows={4}
                      placeholder="I'd like to learn more about the Generations Trust scheme..."
                      className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all text-sm resize-none"
                      style={{
                        background: "var(--mkt-card)",
                        borderColor: "var(--mkt-border)",
                        color: "var(--mkt-text)",
                      }}
                    />
                    <p className="text-xs mt-2" style={{ color: "var(--mkt-muted)" }}>
                      Avg response time: 8 hours on business days.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                        style={{ background: "var(--fg)", color: "var(--bg)" }}
                      >
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium" style={{ color: "var(--mkt-muted)" }}>
                        I agree to the privacy policy
                      </span>
                    </label>
                    <button
                      type="button"
                      className="px-6 py-3 rounded-full font-semibold text-sm hover:scale-105 transition-transform flex items-center gap-2"
                      style={{ background: "var(--fg)", color: "var(--bg)" }}
                    >
                      Send message <span>→</span>
                    </button>
                  </div>
                </form>
              </div>
            </FadeUp>

            {/* Contact Info */}
            <FadeUp delay={0.25} className="w-full lg:w-80 lg:mt-28">
              <div
                className="rounded-3xl p-10 lg:p-12"
                style={{ background: "var(--nav-bg)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
              >
                <p className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-8">
                  — Direct Lines
                </p>
                <div className="flex flex-col gap-8">
                  {[
                    { label: "General inquiries", value: "support@likeminds.coop" },
                    { label: "Member relations", value: "members@likeminds.coop" },
                    { label: "Phone (toll-free)", value: "1—800—LIKEMIND" },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center border-b border-white/10 pb-6 last:border-none last:pb-0">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                        <p className="font-semibold text-sm">{item.value}</p>
                      </div>
                      <div className="text-[#facc15] text-xs">↗</div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>
    </>
  );
}
