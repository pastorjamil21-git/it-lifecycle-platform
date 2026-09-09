"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/onboarding", label: "Onboarding", roles: ["ADMIN", "IT_TECH", "HR_MANAGER"] },
  { href: "/offboarding", label: "Offboarding", roles: ["ADMIN", "IT_TECH", "HR_MANAGER"] },
  { href: "/inventory", label: "Inventory", roles: ["ADMIN", "IT_TECH"] },
  { href: "/audit", label: "Audit trail", roles: ["ADMIN", "IT_TECH", "HR_MANAGER"] },
];

export default function Nav() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session?.user) return null;

  const role = (session.user as any).role as string;
  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  if (visibleItems.length === 0) return null;

  return (
    <nav className="mb-8 flex gap-1 border-b border-slate-200">
      {visibleItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`px-4 py-2.5 text-sm font-semibold transition ${
              active
                ? "border-b-2 border-slate-900 text-slate-900"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}