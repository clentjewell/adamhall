"use client";

import { Link } from "next-view-transitions";
import { ArrowRight } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { nav, site, preFooterTrust, marketplaceTagline } from "@/lib/site-data/site";
import { brand } from "@/lib/brand";
import BrandLockup from "@/components/BrandLockup";
import ValuationBand from "@/components/ValuationBand";
import "@/components/site/site.css";

// The five legal documents. Every one of these was live and loading but
// unlinked from anywhere on the site, so nothing could reach them.
const legalLinks = [
  { href: "/legal/privacy", label: "Privacy Policy" },
  { href: "/legal/terms", label: "Terms of Use" },
  { href: "/legal/website-disclaimer", label: "Website Disclaimer" },
  { href: "/legal/finance-disclaimer", label: "Finance Disclaimer" },
  { href: "/legal/complaints", label: "Complaints" },
];

/**
 * Public site footer — buy-side only. The pre-footer trust band, the Car
 * Marketplace lockup, the six nav pages, and the legal set.
 */
export default function Footer() {
  const pathname = usePathname();
  // Admin has its own chrome.
  if (pathname?.startsWith("/admin")) return null;

  // The instant valuation tool had no entry point anywhere on the site.
  // This band puts one on every page, above the footer, and steps aside
  // on the pages that already make the pitch: the seller journey, and both
  // home pages, which carry their own valuation CTA after the stock section.
  const showValuationCta =
    pathname !== "/" &&
    pathname !== "/car-valuations" &&
    !pathname?.startsWith("/sell");

  return (
    <>
      {/* Outside the .ah-site wrapper below: that scope's element margins are
          unlayered, so they beat the band's Tailwind spacing and would
          distort it. Same reason the home page keeps it out of the wrapper. */}
      {showValuationCta && (
        <ValuationBand
          phoneDisplay={site.phoneDisplay}
          phoneHref={site.phoneHref}
        />
      )}

      <div className="ah-site vt-site-footer">
      {/* Black pre-footer trust band */}
      <section className="prefooter" aria-label="Why buy here">
        <div className="container container--wide">
          <ul className="prefooter__items">
            {preFooterTrust.map((t) => (
              <li key={t}>
                <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                  <path
                    d="M20 6L9 17l-5-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="site-footer">
        <div className="container container--wide site-footer__grid">
          <div className="site-footer__brand">
            <BrandLockup reverse />
            <p>{marketplaceTagline}</p>
          </div>

          <div className="site-footer__col">
            <h6>Buying a car</h6>
            <ul>
              {nav.map((item) => (
                <li key={item.to}>
                  <Link href={item.to}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="site-footer__col">
            <h6>Legal</h6>
            <ul>
              {legalLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="site-footer__col">
            <h6>Contact Us</h6>
            <ul>
              <li>
                <a href={site.phoneHref}>
                  <span aria-hidden="true">☎</span> {site.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={site.linkedin} target="_blank" rel="noreferrer noopener">
                  LinkedIn
                </a>
              </li>
              <li>
                <Link href="/admin">Dealer login</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="container container--wide site-footer__legal">
          <p>
            © {new Date().getFullYear()} {brand.domain}. {brand.fullName}.
          </p>
          <Link href="/legal">Legal</Link>
        </div>
      </footer>
      </div>
    </>
  );
}
