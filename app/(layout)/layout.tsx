"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Programs & Services" },
  { href: "/resources", label: "Resources" },
  { href: "/faqs", label: "FAQs" },
  { href: "/contact", label: "Contact" },
];

function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 border-b transition-all duration-500 ${
        scrolled
          ? "border-[#facc15]/15 bg-[#0a0a0a]/95 backdrop-blur-xl shadow-[0_4px_40px_rgba(0,0,0,0.5)]"
          : "border-white/5 bg-[#0a0a0a]"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center group">
          <Image
            src="/Likemind.png"
            alt="LikeMinds Cooperative Logo"
            width={70}
            height={70}
            className="object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-[#facc15]/15 text-[#facc15] border border-[#facc15]/30"
                    : "text-white/70 hover:text-white hover:bg-white/8"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/dashboard"
            className="px-4 py-2 text-sm font-medium text-white/80 border border-white/20 rounded-full hover:border-white/40 hover:text-white transition-all duration-200"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="px-5 py-2 rounded-full text-sm font-semibold text-[#0a0a0a] bg-[#facc15] transition-all duration-200 hover:bg-[#fde68a] hover:scale-105 animate-pulse-glow"
          >
            Become a member
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          id="mobile-menu-toggle"
          className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span
            className={`block h-0.5 bg-white rounded-full transition-all duration-300 ${menuOpen ? "w-6 rotate-45 translate-y-2" : "w-6"}`}
          />
          <span
            className={`block h-0.5 bg-white rounded-full transition-all duration-300 ${menuOpen ? "opacity-0 w-0" : "w-5"}`}
          />
          <span
            className={`block h-0.5 bg-white rounded-full transition-all duration-300 ${menuOpen ? "w-6 -rotate-45 -translate-y-2" : "w-6"}`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-white/10 px-6 py-4 flex flex-col gap-1 bg-[#0a0a0a]">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? "text-[#facc15] bg-[#facc15]/10"
                    : "text-white/70 hover:text-white hover:bg-white/8"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-white/10 mt-2 flex flex-col gap-2">
            <Link
              href="/dashboard"
              onClick={() => setMenuOpen(false)}
              className="py-2.5 px-3 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/8 transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMenuOpen(false)}
              className="py-3 px-3 rounded-full text-sm font-semibold text-[#0a0a0a] bg-[#facc15] text-center hover:bg-[#fde68a] transition-colors"
            >
              Become a member
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-[#0a0a0a] text-white border-t border-white/8">
      <div className="mx-auto max-w-7xl px-6 py-16">
        {/* Top row */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Image
              src="/Likemind.png"
              alt="LikeMinds Cooperative Logo"
              width={100}
              height={100}
              className="object-contain"
            />
            <p className="text-sm text-white/50 max-w-xs leading-relaxed">
              A member-owned cooperative pooling capital across real estate,
              agriculture, tech and welfare since 2014.
            </p>
          </div>

          {/* Link columns */}
          <div className="flex flex-wrap gap-12">
            <div>
              <p className="text-xs font-semibold tracking-widest text-[#facc15] uppercase mb-4">
                Navigation
              </p>
              <nav className="flex flex-col gap-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-widest text-[#facc15] uppercase mb-4">
                Get Started
              </p>
              <nav className="flex flex-col gap-3">
                <Link
                  href="/dashboard"
                  className="text-sm text-white/60 hover:text-white transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/dashboard"
                  className="text-sm text-white/60 hover:text-white transition-colors duration-200"
                >
                  Become a Member
                </Link>
                <Link
                  href="/apply"
                  className="text-sm text-white/60 hover:text-white transition-colors duration-200"
                >
                  Apply Now
                </Link>
              </nav>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40 font-medium">
          <p>© 2026 LikeMinds Cooperative · Federally registered Canadian co-op</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white/80 transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-white/80 transition-colors">
              Terms
            </Link>
            <Link href="#" className="hover:text-white/80 transition-colors">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f6f4eb]">
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
}
