"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { nav, site } from "@/lib/site-data/site";
import Button from "@/components/site/Button";
import "@/components/site/site.css";

// Reference nav + the marketplace's buying-side pages so every public page
// is reachable from the top of the site, not just the footer.
const headerNav = [
  ...nav,
  { label: "Cars for Sale", to: "/cars" },
  { label: "Finance", to: "/finance" },
  { label: "FAQ", to: "/faq" },
];

/**
 * Public site header — the ported reference header (cream, black logo,
 * uppercase nav, purple phone bubble). Solid and always visible; the old
 * scroll hide/show + video-hero tone logic is intentionally dropped.
 */
export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close the mobile menu on route change.
  useEffect(() => setOpen(false), [pathname]);

  // Admin has its own chrome; the standalone Buy My Car landing brings its own.
  if (pathname?.startsWith("/admin") || pathname === "/buy-my-car") return null;

  const isActive = (to: string) =>
    pathname === to || pathname?.startsWith(to + "/");

  return (
    <header className="ah-site site-header">
      <div className="site-header__inner">
        <Link
          href="/"
          className="site-header__logo"
          aria-label="Adam Hall Buy My Car — home"
          onClick={() => setOpen(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/logos/logo-black.svg"
            alt="Adam Hall Buy My Car"
            width={200}
            height={90}
          />
        </Link>

        <div className="site-header__right">
          <nav className="site-header__nav" aria-label="Primary">
            <ul>
              {headerNav.map((item) => (
                <li key={item.to}>
                  <Link
                    href={item.to}
                    className={isActive(item.to) ? "is-active" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <Button
            href={site.phoneHref}
            variant="purple"
            className="btn--bubble site-header__phone"
          >
            {site.phoneDisplay}
          </Button>
        </div>

        <button
          className={`burger ${open ? "is-open" : ""}`}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`mobile-menu ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <nav aria-label="Mobile">
          <ul>
            {headerNav.map((item) => (
              <li key={item.to}>
                <Link href={item.to} onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Button
          href={site.phoneHref}
          variant="purple"
          className="mobile-menu__call"
        >
          Call Adam {site.phoneDisplay}
        </Button>
      </div>
    </header>
  );
}
