"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  UserCircle,
  MapPin,
  ArrowLeft,
} from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/clases", label: "Classes", icon: BookOpen },
  { href: "/admin/instructores", label: "Instructors", icon: UserCircle },
  { href: "/admin/locations", label: "Locations", icon: MapPin },
  { href: "/admin/alumnos", label: "Students", icon: Users },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
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
  );
}
