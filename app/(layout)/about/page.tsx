import type { Metadata } from "next";
import { Users, Building2, ClipboardCheck, Clock, CheckCircle2 } from "lucide-react";
import { FadeUp, StaggerChildren, StaggerItem, HoverScale, FadeIn } from "@/app/components/Motion";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about LikeMinds Cooperative.",
};

const governanceBlocks = [
  {
    title: "Annual General Assembly",
    description:
      "Every member gets one vote on bylaws, leadership and major investments. Convened every January.",
    stat: "2,418",
    statLabel: "VOTING MEMBERS",
    icon: <Users className="w-5 h-5" style={{ color: "var(--mkt-text)" }} />,
    dark: false,
  },
  {
    title: "Board of Directors",
    description:
      "Nine elected directors serve three-year staggered terms. They oversee strategy, risk and member services.",
    stat: "9",
    statLabel: "DIRECTORS",
    icon: <Building2 className="w-5 h-5" style={{ color: "var(--mkt-text)" }} />,
    dark: false,
  },
  {
    title: "Audit & Ethics Committee",
    description:
      "Independent committee reviewing every disbursement, sector allocation and member-impacting policy.",
    stat: "5",
    statLabel: "AUDITORS",
    icon: <ClipboardCheck className="w-5 h-5" style={{ color: "var(--mkt-text)" }} />,
    dark: false,
  },
  {
    title: "Sector Investment Councils",
    description:
      "Six member-led councils — one per sector — that vet, propose and supervise individual investments.",
    stat: "6 × 7",
    statLabel: "42 COUNCIL SEATS",
    icon: <Clock className="w-5 h-5 text-[#facc15]" />,
    dark: true,
  },
];

const leadership = [
  { name: "Odee Nwafor", role: "President / Board Chairman" },
  { name: "Ibrahim Oladapo", role: "Vice President / Director" },
  { name: "Dare Adeyiga", role: "Secretary / Director" },
  { name: "Jaffa Brown", role: "Treasurer / Director" },
  { name: "Adeola Awopetu", role: "Investment Coordinator / Director" },
  { name: "Yinka Takode", role: "Investment Advisor / Director" },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const eligibility = [
  {
    title: "Age Requirement",
    description: "Must be at least 18 years old to join.",
  },
  {
    title: "Residency Status",
    description: "Must be a Canadian resident for tax purposes.",
  },
  {
    title: "Employment or Business Status",
    description: "Must be gainfully employed, self-employed, or involved in a verifiable business venture.",
  },
  {
    title: "Referral",
    description: "Must be referred by an existing member who is in good standing for at least 6 months, or a reputable community leader.",
  },
  {
    title: "Financial Capability",
    description: "Must demonstrate the ability to meet the financial obligations of membership — share capital contributions, savings requirements, and fees.",
  },
  {
    title: "Character and Integrity",
    description: "Must be of good moral standing with no criminal record.",
  },
  {
    title: "Shared Interest",
    description: "Must align with the cooperative's objectives and be willing to actively participate in its activities.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen pb-32" style={{ background: "var(--mkt-bg)" }}>
      {/* Hero Section */}
      <section 
        className="rounded-b-[3rem] pt-12 md:pt-20 pb-20 md:pb-28 px-6 border-b"
        style={{ background: "var(--mkt-card)", borderColor: "var(--mkt-border)" }}
      >
        <div className="max-w-5xl mx-auto">
          <FadeUp>
         
            <h1 className="text-6xl sm:text-7xl md:text-[5.5rem] font-bold tracking-tight leading-[1.05]" style={{ color: "var(--mkt-text)" }}>
              About LikeMinds
              <br />
              Cooperative
            </h1>
          </FadeUp>
        </div>
      </section>

      {/* Intro Text */}
      <section className="px-6 py-20 md:py-28">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <p className="text-lg md:text-xl leading-relaxed max-w-4xl" style={{ color: "var(--mkt-text)" }}>
              LikeMinds Cooperative was founded in Toronto, 2014 by twelve members
              of the Canadan-Canadian diaspora — engineers, nurses, teachers, small
              business owners — who pooled their first $50,000 to buy a duplex
              together. By 2017, we had 200 members and a federally registered
              cooperative charter. By 2026, we manage $84M of pooled capital across
              six sectors and seven provinces.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="px-6 pb-20 md:pb-28">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <FadeUp>
            <div
              className="h-full p-8 md:p-10 rounded-3xl border shadow-sm"
              style={{ background: "var(--mkt-card)", borderColor: "var(--mkt-border)" }}
            >
              <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--mkt-accent)" }}>
                — OUR MISSION
              </p>
              <p className="text-base leading-relaxed" style={{ color: "var(--mkt-text)" }}>
                Our mission is to create wealth and financial security for our members through
                collective investment in real estate, technology, agriculture, social services,
                renewable energy and other sectors. Grounded in ethical principles and a deep
                commitment to inclusivity, we unite professionals of African heritage in Canada to
                explore and seize growth opportunities. We are dedicated to fostering transparency,
                promoting sustainability, and empowering individuals to invest in — and benefit
                from — thriving real estate markets and other sectors beyond.
              </p>
            </div>
          </FadeUp>
          <FadeUp>
            <div
              className="h-full p-8 md:p-10 rounded-3xl border shadow-sm"
              style={{ background: "var(--mkt-card)", borderColor: "var(--mkt-border)" }}
            >
              <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--mkt-accent)" }}>
                — VISION
              </p>
              <p className="text-base leading-relaxed" style={{ color: "var(--mkt-text)" }}>
                To be a leading cooperative that champions shared prosperity, long-term economic
                growth, and financial empowerment for its members, building a future rooted in
                collaboration, inclusivity, and sustainable wealth creation.
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Structure & Governance */}
      <section className="px-6 py-16">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-12 md:gap-20">
          <div className="md:w-1/3">
            <FadeUp>
              <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--mkt-accent)" }}>
                — STRUCTURE & GOVERNANCE
              </p>
              <h2 className="text-4xl md:text-[2.75rem] font-bold tracking-tight leading-[1.1] md:sticky md:top-32" style={{ color: "var(--mkt-text)" }}>
                One member, one vote. No exceptions.
              </h2>
            </FadeUp>
          </div>
          <div className="md:w-2/3">
            <StaggerChildren className="flex flex-col gap-5">
              {governanceBlocks.map((block) => (
                <StaggerItem key={block.title}>
                  <HoverScale scale={1.02}>
                    <div
                      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 md:p-8 rounded-3xl gap-6 border ${
                        block.dark
                          ? "shadow-xl shadow-black/5"
                          : "shadow-sm"
                      }`}
                      style={block.dark
                        ? { background: "var(--nav-bg)", borderColor: "rgba(255,255,255,0.1)", color: "white" }
                        : { background: "var(--mkt-card)", borderColor: "var(--mkt-border)" }}
                    >
                      <div className="flex items-start gap-5 flex-1">
                        <div
                          className={`shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl ${
                            block.dark
                              ? "bg-white/5 border border-white/10"
                              : "border"
                          }`}
                          style={block.dark ? {} : { background: "var(--mkt-bg)", borderColor: "var(--mkt-border)" }}
                        >
                          {block.icon}
                        </div>
                        <div>
                          <h3
                            className="font-bold text-lg mb-1.5"
                            style={block.dark ? {} : { color: "var(--mkt-text)" }}
                          >
                            {block.title}
                          </h3>
                          <p
                            className="text-sm leading-relaxed"
                            style={block.dark ? { color: "#9ca3af" } : { color: "var(--mkt-muted)" }}
                          >
                            {block.description}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 text-left sm:text-right mt-2 sm:mt-0 pl-17 sm:pl-0">
                        <div
                          className="text-[1.75rem] font-bold leading-none"
                          style={block.dark ? { color: "#facc15" } : { color: "var(--mkt-text)" }}
                        >
                          {block.stat}
                        </div>
                        <div
                          className="text-[10px] font-mono font-semibold tracking-widest mt-2 uppercase"
                          style={block.dark ? { color: "#9ca3af" } : { color: "var(--mkt-muted)" }}
                        >
                          {block.statLabel}
                        </div>
                      </div>
                    </div>
                  </HoverScale>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </div>
      </section>

      {/* Who Can Join */}
      <section className="px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--mkt-accent)" }}>
              — WHO CAN JOIN
            </p>
            <h2 className="text-4xl md:text-[2.75rem] font-bold tracking-tight leading-[1.1] mb-12" style={{ color: "var(--mkt-text)" }}>
              Membership eligibility
            </h2>
          </FadeUp>

          <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {eligibility.map((item) => (
              <StaggerItem key={item.title}>
                <div
                  className="flex items-start gap-4 p-6 rounded-2xl border h-full"
                  style={{ background: "var(--mkt-card)", borderColor: "var(--mkt-border)" }}
                >
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "var(--mkt-accent)" }} />
                  <div>
                    <h3 className="font-bold text-sm mb-1.5" style={{ color: "var(--mkt-text)" }}>
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--mkt-muted)" }}>
                      {item.description}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Board Members */}
      <section className="px-6 py-24 md:py-32">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--mkt-accent)" }}>
              — BOARD MEMBERS
            </p>
            <h2 className="text-4xl md:text-[3rem] font-bold tracking-tight leading-tight mb-16" style={{ color: "var(--mkt-text)" }}>
              Elected by members. Accountable to members.
            </h2>
          </FadeUp>

          <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {leadership.map((leader) => (
              <StaggerItem key={leader.name}>
                <HoverScale scale={1.03}>
                  <div
                    className="rounded-3xl p-6 md:p-8 border shadow-sm flex flex-col h-full cursor-default"
                    style={{ background: "var(--mkt-card)", borderColor: "var(--mkt-border)" }}
                  >
                    <div
                      className="w-16 h-16 rounded-2xl mb-6 shrink-0 border flex items-center justify-center font-bold text-lg"
                      style={{ borderColor: "var(--mkt-border)", background: "var(--mkt-bg)", color: "var(--mkt-accent)" }}
                    >
                      {initials(leader.name)}
                    </div>
                    <h3 className="font-bold text-[1.1rem]" style={{ color: "var(--mkt-text)" }}>
                      {leader.name}
                    </h3>
                    <p className="text-[11px] font-semibold mt-1 tracking-wide uppercase" style={{ color: "var(--mkt-accent)" }}>
                      {leader.role}
                    </p>
                  </div>
                </HoverScale>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>
    </div>
  );
}
