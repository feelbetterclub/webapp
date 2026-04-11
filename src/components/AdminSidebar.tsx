"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Users,
  ArrowLeft,
} from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/clases", label: "Clases", icon: BookOpen },
  { href: "/admin/horarios", label: "Horarios", icon: Calendar },
  { href: "/admin/alumnos", label: "Alumnos", icon: Users },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-brand-cream min-h-screen p-6 hidden md:block">
      <div className="flex items-center gap-2 mb-8">
        <Image
          src="/logo.png"
          alt="Feel Better Club"
          width={32}
          height={32}
          className="rounded-lg"
        />
        <span className="font-heading text-lg font-semibold text-brand-deep">
          Admin
        </span>
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
                  : "text-brand-dark hover:bg-brand-cream/50"
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
          Volver al sitio
        </Link>
      </div>
    </aside>
  );
}
