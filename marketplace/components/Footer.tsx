"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { nav, site, preFooterTrust } from "@/lib/site-data/site";
import "@/components/site/site.css";

/**
 * Public site footer — the ported reference footer: black pre-footer trust
 * band, brand + link columns, and a legal strip. A modest "Dealer login"
 * link into /admin is kept in the contact column.
 */
export default function Footer() {
  const pathname = usePathname();
  // Admin has its own chrome; Buy My Car is a standalone landing with its own footer.
  if (pathname?.startsWith("/admin") || pathname === "/buy-my-car") return null;

  return (
    <div className="ah-site">
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
          <div className="prefooter__wave" aria-hidden="true" />
        </div>
      </section>

      <footer className="site-footer">
        <div className="container container--wide site-footer__grid">
          <div className="site-footer__brand">
            <Link href="/" aria-label="Adam Hall Buy My Car — home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/logos/logo-white.svg"
                alt="Adam Hall Buy My Car"
                width={170}
                height={70}
              />
            </Link>
            <p>{site.tagline}</p>
          </div>

          <div className="site-footer__col">
            <h6>Get around</h6>
            <ul>
              {nav.map((item) => (
                <li key={item.to}>
                  <Link href={item.to}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="site-footer__col">
            <h6>Buying a car</h6>
            <ul>
              <li>
                <Link href="/cars">Cars for Sale</Link>
              </li>
              <li>
                <Link href="/finance">Finance</Link>
              </li>
              <li>
                <Link href="/compare">Compare cars</Link>
              </li>
              <li>
                <Link href="/saved">Saved cars</Link>
              </li>
              <li>
                <Link href="/faq">FAQ</Link>
              </li>
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
                <Link href="/buy-my-car">
                  <span aria-hidden="true">☺</span> Value my car
                </Link>
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
          <p>{site.copyright}</p>
          <Link href="/privacy-policy">Privacy Policy</Link>
        </div>
      </footer>
    </div>
  );
}
