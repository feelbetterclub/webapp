"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { LanguageSwitcher } from "./LanguageSwitcher";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useI18n();

  const nav = t.nav as Record<string, string>;

  const navLinks = [
    { href: "/#class-info", label: nav.method || nav.classInfo || "The Method" },
    { href: "/reservar", label: nav.classes || nav.classProgram || "Classes" },
    { href: "/#about", label: nav.moni || nav.about || "About Moni" },
    { href: "/#rituals", label: nav.rituals || "Rituals" },
    { href: "/#contact", label: nav.journal || nav.contact || "Contact" },
  ];

  return (
    <>
      <style>{`
        .fbc-nav-center { display: none; }
        .fbc-hamburger { display: flex; }
        @media (min-width: 820px) {
          .fbc-nav-center { display: flex; }
          .fbc-hamburger { display: none; }
        }
      `}</style>

      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: "color-mix(in oklab, var(--fb-bone) 88%, transparent)",
          backdropFilter: "saturate(1.1) blur(10px)",
          WebkitBackdropFilter: "saturate(1.1) blur(10px)",
          borderBottom: "1px solid color-mix(in oklab, var(--fb-green) 12%, transparent)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3" style={{ minHeight: "76px" }}>
            {/* Left — Logo */}
            <Link href="/" className="flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-v3.png"
                alt="The Feel Better Club"
                className="h-12"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                  if (fallback) fallback.style.display = "block";
                }}
              />
              <span className="hidden text-xl font-semibold text-fb-ink">FBC</span>
            </Link>

            {/* Center — Nav links (hidden below 820px) */}
            <nav className="fbc-nav-center items-center gap-7">
              {navLinks.map((link, i) => (
                <a
                  key={`${link.href}-${i}`}
                  href={link.href}
                  className="text-[14px] font-medium text-fb-ink hover:text-fb-green transition-colors whitespace-nowrap"
                  style={{ letterSpacing: "0.02em" }}
                >
                  <span className="relative pb-1 hover:border-b hover:border-fb-green">
                    {link.label}
                  </span>
                </a>
              ))}
            </nav>

            {/* Right — Language + CTA + Hamburger */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block">
                <LanguageSwitcher />
              </div>
              <Link
                href="/reservar"
                className="bg-fb-green text-fb-paper rounded-full px-6 py-3 text-[15px] font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                {nav.bookClass || nav.book || "Book a class"}
              </Link>
              <button
                className="fbc-hamburger items-center justify-center text-fb-ink"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            className="border-t border-fb-green/10"
            style={{ background: "color-mix(in oklab, var(--fb-bone) 95%, transparent)" }}
          >
            <div className="px-4 py-4 space-y-3 max-w-7xl mx-auto">
              {navLinks.map((link, i) => (
                <a
                  key={`${link.href}-${i}`}
                  href={link.href}
                  className="block text-[14px] font-medium text-fb-ink hover:text-fb-green transition-colors"
                  style={{ letterSpacing: "0.02em" }}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-2">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
