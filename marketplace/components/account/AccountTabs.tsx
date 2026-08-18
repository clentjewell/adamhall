"use client";

import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import {
  ArrowSquareOut,
  Bank,
  ChatCircleText,
  Heart,
  Lock,
  Scales,
  UserCircle,
} from "@phosphor-icons/react";

/**
 * The account's vertical tabs.
 *
 * Two groups on purpose. The top group is the account itself — details,
 * enquiries, password — and those are real tabs: the panel beside them
 * changes and you stay put. The bottom group leaves for a full page, because
 * the shortlist and the comparison table need the whole width and already
 * exist; rebuilding them inside a panel would be two copies of the same
 * screen to keep in step.
 *
 * They still share one rail so there is one place that answers "what can I do
 * from here", which is the point of an account page.
 */

interface Item {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; weight?: "bold" | "fill" | "regular" }>;
  /** Cross-domain, so it opens in its own tab. */
  external?: boolean;
}

export default function AccountTabs({ sellUrl }: { sellUrl: string }) {
  const pathname = usePathname();

  const tabs: Item[] = [
    { href: "/account", label: "Your details", icon: UserCircle },
    { href: "/account/enquiries", label: "Your enquiries", icon: ChatCircleText },
    { href: "/account/password", label: "Password", icon: Lock },
  ];

  const elsewhere: Item[] = [
    { href: "/saved", label: "Saved cars", icon: Heart },
    { href: "/compare", label: "Compare cars", icon: Scales },
    { href: "/finance", label: "Finance calculator", icon: Bank },
    { href: sellUrl, label: "Sell your car", icon: ArrowSquareOut, external: true },
  ];

  const base =
    "flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-colors min-h-11";

  return (
    // min-w-0 because a grid item defaults to min-width auto, which lets a
    // child wider than the track push the column out. Nothing depends on it
    // today — the phone layout uses a fixed single track and the page clips
    // its horizontal axis anyway — but a rail whose job is to hold scrolling
    // rows should not be relying on either of those to stay in its column.
    <nav aria-label="Your account" className="min-w-0 lg:sticky lg:top-24">
      <ul className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible list-none p-0 pb-1 lg:pb-0">
        {tabs.map(({ href, label, icon: Icon }) => {
          // "Your details" is the default panel, so it only lights up on an
          // exact match — otherwise it would stay active on every tab.
          const active = pathname === href;
          return (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`${base} whitespace-nowrap ${
                  active
                    ? "bg-forest-600 text-white"
                    : "text-stone-600 hover:bg-forest-50 hover:text-forest-700"
                }`}
              >
                <Icon size={18} weight={active ? "fill" : "regular"} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="type-label mt-6 mb-2 px-3.5 text-stone-400 hidden lg:block">
        Elsewhere
      </p>
      <ul className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible list-none p-0 mt-2 lg:mt-0 pb-1 lg:pb-0">
        {elsewhere.map(({ href, label, icon: Icon, external }) =>
          external ? (
            <li key={href} className="shrink-0">
              {/* Another domain, so it gets its own tab and the account is
                  still here when they come back. noopener because the opened
                  page must not get a handle on this one. */}
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${base} whitespace-nowrap text-stone-600 hover:bg-forest-50 hover:text-forest-700`}
              >
                <Icon size={18} />
                {label}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ) : (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                className={`${base} whitespace-nowrap text-stone-600 hover:bg-forest-50 hover:text-forest-700`}
              >
                <Icon size={18} />
                {label}
              </Link>
            </li>
          ),
        )}
      </ul>
    </nav>
  );
}
