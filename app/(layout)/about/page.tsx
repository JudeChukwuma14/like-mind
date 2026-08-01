import type { Metadata } from "next";
import { Users, Building2, ClipboardCheck, Clock } from "lucide-react";

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
    icon: <Users className="w-5 h-5 text-gray-700" />,
    dark: false,
  },
  {
    title: "Board of Directors",
    description:
      "Nine elected directors serve three-year staggered terms. They oversee strategy, risk and member services.",
    stat: "9",
    statLabel: "DIRECTORS",
    icon: <Building2 className="w-5 h-5 text-gray-700" />,
    dark: false,
  },
  {
    title: "Audit & Ethics Committee",
    description:
      "Independent committee reviewing every disbursement, sector allocation and member-impacting policy.",
    stat: "5",
    statLabel: "AUDITORS",
    icon: <ClipboardCheck className="w-5 h-5 text-gray-700" />,
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
  {
    name: "Folake Adeyemi",
    role: "Chair · 2024 — 2027",
    description:
      "Former CIBC compliance officer. Co-founder. Re-elected unanimously in the 2024 General Assembly.",
    image:
      "https://images.unsplash.com/photo-1500829243541-74b67eecdf65?w=200&h=200&fit=crop", // yellow flowers placeholder
  },
  {
    name: "Emmanuel Okoye",
    role: "Vice Chair · 2024 — 2027",
    description:
      "Real estate developer, Calgary. Leads housing investment council. 11 years on board.",
    image:
      "https://images.unsplash.com/photo-1500829243541-74b67eecdf65?w=200&h=200&fit=crop",
  },
  {
    name: "Ngozi Kalu",
    role: "Treasurer · 2025 — 2028",
    description:
      "CPA, ex-EY. Oversees audit, treasury and quarterly disclosures. Joined the cooperative in 2018.",
    image:
      "https://images.unsplash.com/photo-1500829243541-74b67eecdf65?w=200&h=200&fit=crop",
  },
  {
    name: "Sade Makinde",
    role: "Secretary · 2025 — 2028",
    description:
      "Lawyer specializing in cooperative law. Drafted the 2023 bylaw amendments and welfare policy.",
    image:
      "https://images.unsplash.com/photo-1500829243541-74b67eecdf65?w=200&h=200&fit=crop",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-[#fcfbf9] min-h-screen pb-32">
      {/* Hero Section */}
      <section className="bg-[#f6f4eb] rounded-b-[3rem] pt-12 md:pt-20 pb-20 md:pb-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-[10px] font-mono font-bold tracking-[0.2em] text-gray-500 uppercase mb-16 md:mb-24">
            HOME &gt; ABOUT
          </div>
          <h1 className="text-6xl sm:text-7xl md:text-[5.5rem] font-bold text-gray-900 tracking-tight leading-[1.05]">
            About LikeMinds
            <br />
            Cooperative
          </h1>
        </div>
      </section>

      {/* Intro Text */}
      <section className="px-6 py-20 md:py-28">
        <div className="max-w-5xl mx-auto">
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-4xl">
            LikeMinds Cooperative was founded in Toronto, 2014 by twelve members
            of the Nigerian-Canadian diaspora — engineers, nurses, teachers, small
            business owners — who pooled their first $50,000 to buy a duplex
            together. By 2017, we had 200 members and a federally registered
            cooperative charter. By 2026, we manage $84M of pooled capital across
            six sectors and seven provinces.
          </p>
        </div>
      </section>

      {/* Structure & Governance */}
      <section className="px-6 py-16">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-12 md:gap-20">
          <div className="md:w-1/3">
            <p className="text-xs font-semibold tracking-widest text-indigo-500 uppercase mb-4">
              — STRUCTURE & GOVERNANCE
            </p>
            <h2 className="text-4xl md:text-[2.75rem] font-bold text-gray-900 tracking-tight leading-[1.1] md:sticky md:top-32">
              One member, one vote. No exceptions.
            </h2>
          </div>
          <div className="md:w-2/3 flex flex-col gap-5">
            {governanceBlocks.map((block) => (
              <div
                key={block.title}
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 md:p-8 rounded-3xl gap-6 ${
                  block.dark
                    ? "bg-[#111111] text-white shadow-xl shadow-black/5"
                    : "bg-white border border-gray-100 shadow-sm"
                }`}
              >
                <div className="flex items-start gap-5 flex-1">
                  <div
                    className={`shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl ${
                      block.dark
                        ? "bg-white/5 border border-white/10"
                        : "bg-[#f4efe6] text-gray-700"
                    }`}
                  >
                    {block.icon}
                  </div>
                  <div>
                    <h3
                      className={`font-bold text-lg mb-1.5 ${
                        block.dark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {block.title}
                    </h3>
                    <p
                      className={`text-sm leading-relaxed ${
                        block.dark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {block.description}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-left sm:text-right mt-2 sm:mt-0 pl-17 sm:pl-0">
                  <div
                    className={`text-[1.75rem] font-bold leading-none ${
                      block.dark ? "text-[#facc15]" : "text-gray-900"
                    }`}
                  >
                    {block.stat}
                  </div>
                  <div
                    className={`text-[10px] font-mono font-semibold tracking-widest mt-2 ${
                      block.dark ? "text-gray-400" : "text-gray-500 uppercase"
                    }`}
                  >
                    {block.statLabel}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Profiles */}
      <section className="px-6 py-24 md:py-32">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-widest text-indigo-500 uppercase mb-4">
            — LEADERSHIP PROFILES
          </p>
          <h2 className="text-4xl md:text-[3rem] font-bold text-gray-900 tracking-tight leading-tight mb-16">
            Elected by members. Accountable to members.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {leadership.map((leader) => (
              <div
                key={leader.name}
                className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm flex flex-col"
              >
                <div className="w-16 h-16 rounded-2xl overflow-hidden mb-6 bg-gray-100 shrink-0 border border-gray-100">
                  <img
                    src={leader.image}
                    alt={leader.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-bold text-gray-900 text-[1.1rem]">
                  {leader.name}
                </h3>
                <p className="text-[11px] font-semibold text-indigo-500 mb-5 mt-1 tracking-wide uppercase">
                  {leader.role}
                </p>
                <p className="text-[13px] text-gray-600 leading-relaxed">
                  {leader.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

