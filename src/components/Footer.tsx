"use client";

import Image from "next/image";
import { Globe, Heart } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

export default function Footer() {
  const { t } = useI18n();

  const navLinks = [
    { href: "/#servicios", label: t.nav.rituals },
    { href: "/#nosotros", label: t.nav.about },
    { href: "/#contacto", label: t.nav.contact },
  ];

  return (
    <footer className="bg-brand-deep text-brand-cream/80 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image src="/logo.png" alt="Feel Better Club" width={36} height={36} className="rounded-lg" />
              <span className="font-heading text-lg font-semibold text-brand-cream">Feel Better Club</span>
            </div>
            <p className="text-sm leading-relaxed text-brand-cream/60">
              {t.footer.holisticHealth}<br />{t.footer.tagline}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-brand-cream mb-4">{t.footer.links}</h4>
            <ul className="space-y-2 text-sm">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="hover:text-brand-cream transition-colors">{link.label}</a>
                </li>
              ))}
              <li>
                <a href="/reservar" className="hover:text-brand-cream transition-colors">{t.nav.bookClass}</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-brand-cream mb-4">{t.footer.followUs}</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-brand-cream/10 rounded-full flex items-center justify-center hover:bg-brand-cream/20 transition-colors" aria-label="Web">
                <Globe className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-brand-cream/10 rounded-full flex items-center justify-center hover:bg-brand-cream/20 transition-colors" aria-label="Community">
                <Heart className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-brand-cream/10 mt-12 pt-8 text-center text-sm text-brand-cream/40">
          <p>&copy; {new Date().getFullYear()} Feel Better Club. {t.footer.rights}</p>
        </div>
      </div>
    </footer>
  );
}
