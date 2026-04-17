"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { LanguageSwitcher } from "./LanguageSwitcher";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useI18n();

  const navLinks = [
    { href: "/#about", label: t.nav.about },
    { href: "/#class-info", label: t.nav.classInfo },
    { href: "/reservar", label: t.nav.classProgram },
    { href: "/reservar", label: t.nav.book },
    { href: "/#rituals", label: t.nav.rituals },
    { href: "/#contact", label: t.nav.contact },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-brand-light/90 backdrop-blur-md border-b border-brand-sage/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="/" className="flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-dark.svg" alt="The Feel Better Club" className="h-10" />
          </a>

          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link, i) => (
              <a
                key={`${link.href}-${i}`}
                href={link.href}
                className="text-sm font-medium text-brand-dark hover:text-brand-teal transition-colors whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
            <LanguageSwitcher />
          </nav>

          <button
            className="lg:hidden text-brand-dark"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden bg-brand-light border-t border-brand-sage/30">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link, i) => (
              <a
                key={`${link.href}-${i}`}
                href={link.href}
                className="block text-sm font-medium text-brand-dark hover:text-brand-teal transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="py-2">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
