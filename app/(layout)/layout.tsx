"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

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

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-white">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-[#111111] text-[#facc15] font-semibold text-lg">
            L
          </div>
          <span className="text-lg font-bold tracking-tight text-black">
            LikeMinds
          </span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-black text-white"
                    : "text-black/70 hover:text-black hover:bg-white/10"
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
            className="px-4 py-2 text-sm font-medium text-black border border-black rounded-full"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="px-5 py-2 rounded-full text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 hover:scale-105 bg-black"
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
            className={`block h-0.5 bg-black rounded-full transition-all duration-300 ${menuOpen ? "w-6 rotate-45 translate-y-2" : "w-6"}`}
          />
          <span
            className={`block h-0.5 bg-black rounded-full transition-all duration-300 ${menuOpen ? "opacity-0 w-0" : "w-5"}`}
          />
          <span
            className={`block h-0.5 bg-black rounded-full transition-all duration-300 ${menuOpen ? "w-6 -rotate-45 -translate-y-2" : "w-6"}`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/10 px-6 py-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="py-1 px-3 rounded-lg text-black/80 hover:text-black hover:bg-black/10 transition-colors font-medium"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-gray-900/10 mt-2 flex flex-col gap-2">
            <Link
              href="/dashboard"
              onClick={() => setMenuOpen(false)}
              className="py-2.5 px-3 rounded-lg text-black hover:text-black hover:bg-white/10 transition-colors  font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMenuOpen(false)}
              className="py-3 px-3 rounded-full text-sm font-semibold text-white text-center bg-black"
            >
              Become a member
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-[#f6f4eb] text-gray-900">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-[#111111] text-[#facc15] font-semibold text-lg">
              L
            </div>
            <span className="text-lg font-bold tracking-tight">LikeMinds</span>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap justify-center gap-6 md:gap-8 text-sm font-medium">
            <Link
              href="/about"
              className="hover:text-gray-600 transition-colors"
            >
              About
            </Link>
            <Link
              href="/services"
              className="hover:text-gray-600 transition-colors"
            >
              Programs
            </Link>
            <Link
              href="/resources"
              className="hover:text-gray-600 transition-colors"
            >
              Resources
            </Link>
            <Link
              href="/contact"
              className="hover:text-gray-600 transition-colors"
            >
              Contact
            </Link>
          </nav>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-900/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-medium">
          <p>
            © 2026 LikeMinds Cooperative · Federally registered Canadian co-op
          </p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-gray-900 transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-gray-900 transition-colors">
              Terms
            </Link>
            <Link href="#" className="hover:text-gray-900 transition-colors">
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
    <div
      className="min-h-screen flex flex-col bg-[#f6f4eb]"
    >
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
}
