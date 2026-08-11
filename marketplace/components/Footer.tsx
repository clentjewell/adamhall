"use client";

import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { nav, site, preFooterTrust, marketplaceTagline } from "@/lib/site-data/site";
import { brand } from "@/lib/brand";
import BrandLockup from "@/components/BrandLockup";
import CrossSiteBand from "@/components/CrossSiteBand";
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
 * Marketplace lockup, the six nav pages, the legal set, and the crossing band
 * back to Adam. This is the one place in the identity where both marks may
 * appear together.
 */
export default function Footer() {
  const pathname = usePathname();
  // Admin has its own chrome; Buy My Car is a standalone landing with its own footer.
  if (pathname?.startsWith("/admin") || pathname === "/buy-my-car") return null;

  return (
    <div className="ah-site vt-site-footer">
      {/* Black pre-footer trust band */}
      <section className="prefooter" aria-label="Why choose Adam Hall">
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
          <div className="prefooter__gauge" aria-hidden="true" />
        </div>
      </section>

      <CrossSiteBand />

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
  );
}
