"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { nav, site } from "@/lib/site-data/site";
import { parentSite, parentUrl } from "@/lib/brand";
import BrandLockup from "@/components/BrandLockup";
import GarageCount from "@/components/garage/GarageCount";
import Button from "@/components/site/Button";
import "@/components/site/site.css";

/**
 * Public site header. Six buy-side items, the Car Marketplace lockup, and the
 * crossing to Adam set apart from the nav rather than dropped in as a seventh
 * link — the identity is explicit that the crossing must be named, not buried
 * in a list. The phone number is shared with the parent brand on purpose: one
 * number, one person, both sites, and the strongest proof it is one business.
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
        <div className="site-header__logo" onClick={() => setOpen(false)}>
          <BrandLockup />
        </div>

        <div className="site-header__right">
          <nav className="site-header__nav" aria-label="Primary">
            <ul>
              {nav.map((item) => (
                <li key={item.to}>
                  <Link
                    href={item.to}
                    className={isActive(item.to) ? "is-active" : undefined}
                  >
                    {item.label}
                    {item.garage && <GarageCount kind={item.garage} />}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* The crossing, worded as a service to the seller rather than a
              cross-sell, and visually separate from the nav list. */}
          <a
            href={parentUrl("/", "marketplace-header")}
            className="site-header__crossing"
          >
            {parentSite.headerLink}
          </a>

          <Button
            href={site.phoneHref}
            variant="green"
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
            {nav.map((item) => (
              <li key={item.to}>
                <Link href={item.to} onClick={() => setOpen(false)}>
                  {item.label}
                  {item.garage && <GarageCount kind={item.garage} />}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={parentUrl("/", "marketplace-mobile-menu")}
                onClick={() => setOpen(false)}
                className="mobile-menu__crossing"
              >
                {parentSite.headerLink}
              </a>
            </li>
          </ul>
        </nav>
        <Button
          href={site.phoneHref}
          variant="white"
          className="mobile-menu__call"
        >
          Call Adam {site.phoneDisplay}
        </Button>
      </div>
    </header>
  );
}
