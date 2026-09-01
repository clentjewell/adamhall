"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowSquareOut,
  Bank,
  BookOpen,
  ChartBar,
  ChatCircleDots,
  Garage,
  House,
  PencilSimpleLine,
  SignOut,
  Sparkle,
  Tray,
  Users,
} from "@phosphor-icons/react";
import { signOut } from "@/app/actions/admin";
import BrandLockup from "@/components/BrandLockup";

/** Shared with the redesigned dashboard preview so the two navs cannot
    drift apart. */
export const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: House, exact: true },
  { href: "/admin/adam-ai", label: "Assistant", icon: Sparkle, exact: false },
  { href: "/admin/submissions", label: "Submissions", icon: Tray, exact: false },
  { href: "/admin/inventory", label: "Inventory", icon: Garage, exact: false },
  { href: "/admin/enquiries", label: "Enquiries", icon: ChatCircleDots, exact: false },
  { href: "/admin/buyers", label: "Buyers", icon: Users, exact: false },
  { href: "/admin/finance", label: "Finance", icon: Bank, exact: false },
  { href: "/admin/content", label: "Site copy", icon: PencilSimpleLine, exact: false },
  { href: "/admin/analytics", label: "Analytics", icon: ChartBar, exact: false },
  { href: "/admin/guide", label: "Site guide", icon: BookOpen, exact: false },
];

export default function AdminNav({ adminName }: { adminName: string }) {
  const pathname = usePathname();
  return (
    <aside>
      {/* The Car Marketplace lockup, not the parent brand's. This console
          administers the marketplace, so it signs itself with the
          marketplace's own mark — it previously carried the Adam Hall Buy My
          Car artwork, which is the other site. BrandLockup reads lib/brand.ts,
          so the logo path stays in the one place the identity allows. */}
      <div className="hidden md:block px-3 mb-3">
        <BrandLockup size="sm" />
      </div>
      <Link
        href="/"
        className="flex items-center gap-2.5 px-3 py-2.5 mb-3 rounded-lg text-sm font-semibold text-forest-700 bg-forest-50 hover:bg-forest-100 transition-colors"
      >
        <ArrowSquareOut size={18} weight="bold" />
        View site
      </Link>
      <p className="text-xs font-semibold text-stone-500 mb-2 px-3">
        Signed in as {adminName}
      </p>
      <nav className="flex md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0">
        {ADMIN_NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                active
                  ? "bg-forest-600 text-white"
                  : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              <Icon size={18} weight={active ? "fill" : "regular"} />
              {label}
            </Link>
          );
        })}
        <form action={signOut} className="md:mt-4">
          <button className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-stone-500 hover:bg-stone-100 w-full">
            <SignOut size={18} />
            Sign out
          </button>
        </form>
      </nav>
    </aside>
  );
}
