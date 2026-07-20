"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="bg-ink text-stone-300 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12 grid gap-10 md:grid-cols-3">
        <div>
          <p className="font-display font-extrabold text-xl text-white">ADAM HALL</p>
          <p className="text-sm font-semibold text-forest-200 mb-3">BUY MY CAR</p>
          <p className="text-sm leading-relaxed max-w-[36ch]">
            Quality used cars, honestly described and fairly priced. Northern
            NSW and the Tweed–Gold Coast border.
          </p>
        </div>
        <div>
          <p className="font-semibold text-white mb-3">Get around</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/cars" className="hover:text-white">Cars for sale</Link></li>
            <li><Link href="/sell" className="hover:text-white">Sell your car</Link></li>
            <li><Link href="/finance" className="hover:text-white">Finance</Link></li>
            <li><Link href="/saved" className="hover:text-white">Saved cars</Link></li>
            <li><Link href="/compare" className="hover:text-white">Compare</Link></li>
            <li><Link href="/about" className="hover:text-white">About Adam</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
            <li><Link href="/admin" className="hover:text-white">Dealer login</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white mb-3">The deal with us</p>
          <ul className="space-y-2 text-sm">
            <li>Every car PPSR checked before listing</li>
            <li>Condition described straight, faults included</li>
            <li>Offers made within 1 business day</li>
            <li>Settlement the same day the paperwork clears</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-stone-400">
          <p>© {new Date().getFullYear()} Adam Hall Buy My Car. Licensed motor dealer.</p>
          <Link href="/legal/privacy" className="hover:text-white">Privacy</Link>
          <Link href="/legal/terms" className="hover:text-white">Terms</Link>
          <Link href="/legal/finance-disclaimer" className="hover:text-white">Finance disclaimer</Link>
          <Link href="/legal/website-disclaimer" className="hover:text-white">Website disclaimer</Link>
          <Link href="/legal/complaints" className="hover:text-white">Complaints</Link>
        </div>
      </div>
    </footer>
  );
}
