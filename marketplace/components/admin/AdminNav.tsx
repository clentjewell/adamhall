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
} from "@phosphor-icons/react";
import { signOut } from "@/app/actions/admin";

const items = [
  { href: "/admin", label: "Dashboard", icon: House, exact: true },
  { href: "/admin/adam-ai", label: "Adam AI", icon: Sparkle, exact: false },
  { href: "/admin/submissions", label: "Submissions", icon: Tray, exact: false },
  { href: "/admin/inventory", label: "Inventory", icon: Garage, exact: false },
  { href: "/admin/enquiries", label: "Enquiries", icon: ChatCircleDots, exact: false },
  { href: "/admin/finance", label: "Finance", icon: Bank, exact: false },
  { href: "/admin/content", label: "Site copy", icon: PencilSimpleLine, exact: false },
  { href: "/admin/analytics", label: "Analytics", icon: ChartBar, exact: false },
  { href: "/admin/guide", label: "Site guide", icon: BookOpen, exact: false },
];

export default function AdminNav({ adminName }: { adminName: string }) {
  const pathname = usePathname();
  return (
    <aside>
      {/* Homepage logo + back-to-site */}
      <Link href="/" className="hidden md:flex items-center px-3 mb-3" aria-label="Adam Hall — Buy My Car home">
        <img src="/brand/logo.png" alt="Adam Hall — Buy My Car" className="h-8 w-auto" />
      </Link>
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
        {items.map(({ href, label, icon: Icon, exact }) => {
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
