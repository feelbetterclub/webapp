"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { LanguageSwitcher } from "./LanguageSwitcher";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useI18n();

  const navLinks = [
    { href: "/#servicios", label: t.nav.rituals },
    { href: "/#nosotros", label: t.nav.about },
    { href: "/#contacto", label: t.nav.contact },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-brand-light/90 backdrop-blur-md border-b border-brand-sage/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Feel Better Club" width={40} height={40} className="rounded-lg" />
            <span className="font-heading text-xl font-semibold text-brand-deep">Feel Better Club</span>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="text-sm font-medium text-brand-dark hover:text-brand-teal transition-colors">
                {link.label}
              </a>
            ))}
            <LanguageSwitcher />
            <a href="/reservar" className="bg-brand-teal text-brand-cream px-5 py-2 rounded-full text-sm font-semibold hover:bg-brand-dark transition-colors">
              {t.nav.bookClass}
            </a>
          </nav>

          <button className="md:hidden text-brand-dark" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-brand-light border-t border-brand-sage/30">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="block text-sm font-medium text-brand-dark hover:text-brand-teal transition-colors" onClick={() => setMenuOpen(false)}>
                {link.label}
              </a>
            ))}
            <div className="py-2"><LanguageSwitcher /></div>
            <a href="/reservar" className="block bg-brand-teal text-brand-cream px-5 py-2 rounded-full text-sm font-semibold text-center hover:bg-brand-dark transition-colors" onClick={() => setMenuOpen(false)}>
              {t.nav.bookClass}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
