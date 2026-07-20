"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { List, X, Phone } from "@phosphor-icons/react";

const PHONE = "0400 000 000"; // placeholder until Adam's trading number is confirmed
const PHONE_HREF = "tel:+61400000000";

const links = [
  { href: "/cars", label: "Cars for sale" },
  { href: "/sell", label: "Sell your car" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  if (pathname?.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex flex-col leading-none" onClick={() => setOpen(false)}>
          <span className="font-display font-extrabold text-xl tracking-tight text-ink">
            ADAM HALL
          </span>
          <span className="text-[11px] font-semibold text-forest-600 tracking-wide">
            BUY MY CAR
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                pathname?.startsWith(l.href)
                  ? "bg-forest-50 text-forest-700"
                  : "text-ink hover:bg-stone-100"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <a href={PHONE_HREF} className="btn-primary text-sm ml-2 !py-2.5">
            <Phone size={16} weight="bold" />
            {PHONE}
          </a>
        </nav>

        <button
          className="md:hidden p-2 -mr-2 text-ink"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={24} /> : <List size={24} />}
        </button>
      </div>

      {open && (
        <nav className="md:hidden border-t border-stone-200 bg-paper px-4 py-3 flex flex-col gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="px-3 py-3 rounded-lg font-semibold text-ink hover:bg-stone-100"
            >
              {l.label}
            </Link>
          ))}
          <a href={PHONE_HREF} className="btn-primary mt-2 justify-center">
            <Phone size={16} weight="bold" />
            Call {PHONE}
          </a>
        </nav>
      )}
    </header>
  );
}
