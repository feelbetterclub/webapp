"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  UserCircle,
  MapPin,
  Heart,
  BarChart3,
  ArrowLeft,
  Menu,
  X,
} from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/clases", label: "Classes", icon: BookOpen },
  { href: "/admin/instructores", label: "Instructors", icon: UserCircle },
  { href: "/admin/locations", label: "Locations", icon: MapPin },
  { href: "/admin/alumnos", label: "Students", icon: Users },
  { href: "/admin/community", label: "Community", icon: Heart },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="w-64 bg-white border-r border-brand-sage/30 min-h-screen p-6 hidden md:block">
        <div className="flex items-center gap-2 mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-v4.svg" alt="Feel Better" className="h-8" />
        </div>

        <nav className="space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-teal/10 text-brand-teal"
                    : "text-brand-dark hover:bg-brand-sage/20"
                }`}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-12">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-brand-teal transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to site
          </Link>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-brand-sage/30 h-14 px-4 flex items-center justify-between md:hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-v4.svg" alt="Feel Better" className="h-6" />
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="text-brand-dark p-1"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col md:hidden">
          <div className="flex items-center justify-between h-14 px-4 border-b border-brand-sage/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-v4.svg" alt="Feel Better" className="h-6" />
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="text-brand-dark p-1"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-colors ${
                    isActive
                      ? "bg-brand-teal/10 text-brand-teal"
                      : "text-brand-dark hover:bg-brand-sage/20"
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="px-8 py-6 border-t border-brand-sage/30">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-brand-teal transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to site
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
