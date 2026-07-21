"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { List, X, Phone } from "@phosphor-icons/react";
import GarageNavBadge from "@/components/garage/GarageNavBadge";

const links = [
  { href: "/cars", label: "Cars for sale" },
  { href: "/sell", label: "Sell your car" },
  { href: "/finance", label: "Finance" },
];

export default function Header({
  phone,
  phoneHref,
}: {
  phone: string;
  phoneHref: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // On the home page the header floats transparent over the full-page
  // video hero, then turns solid once the user scrolls.
  const isHome = pathname === "/";
  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  if (pathname?.startsWith("/admin")) return null;

  const transparent = isHome && !scrolled && !open;

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-300 ${
        transparent
          ? "bg-transparent border-b border-transparent"
          : "bg-paper/95 backdrop-blur border-b border-stone-200"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex flex-col leading-none" onClick={() => setOpen(false)}>
          <span
            className={`font-display font-extrabold text-xl tracking-tight ${transparent ? "text-white" : "text-ink"}`}
          >
            ADAM HALL
          </span>
          <span
            className={`text-[11px] font-semibold tracking-wide ${transparent ? "text-forest-100" : "text-forest-600"}`}
          >
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
                  : transparent
                    ? "text-white hover:bg-white/15"
                    : "text-ink hover:bg-stone-100"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <GarageNavBadge
            className={`px-3 py-2 rounded-full text-sm font-semibold transition-colors ${
              transparent ? "text-white hover:bg-white/15" : "text-ink hover:bg-stone-100"
            }`}
          />
          <a
            href={phoneHref}
            className={`btn text-sm ml-2 px-6 py-2.5 ${
              transparent
                ? "bg-white text-forest-800 hover:bg-forest-50"
                : "bg-forest-600 text-white hover:bg-forest-700"
            }`}
          >
            <Phone size={16} weight="bold" />
            {phone}
          </a>
        </nav>

        <button
          className={`md:hidden p-2 -mr-2 ${transparent ? "text-white" : "text-ink"}`}
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
          <a href={phoneHref} className="btn-primary mt-2 justify-center">
            <Phone size={16} weight="bold" />
            Call {phone}
          </a>
        </nav>
      )}
    </header>
  );
}
