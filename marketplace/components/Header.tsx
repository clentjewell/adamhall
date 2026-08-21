"use client";

import { useEffect, useState } from "react";
import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { nav, site } from "@/lib/site-data/site";
import BrandLockup from "@/components/BrandLockup";
import GarageCount from "@/components/garage/GarageCount";
import HeaderAccount from "@/components/account/HeaderAccount";
import Button from "@/components/site/Button";
import "@/components/site/site.css";

/** Every dark ground the header can end up sitting on, found by walking the
    live pages for full-bleed bands with a dark computed background rather
    than by reading the stylesheets: the home film, the film band the other
    pages open on, the finance hero, the valuation call to action, the
    pre-footer strip, the footer, and the forest panels built from utilities.
    Anything new can opt in with data-header-tone="dark" instead of being
    added here.

    Deliberately generous, because it is filtered below: a selector like
    .bg-forest-700 also matches small green chips, and a chip passing under
    the header must not flip it. Only elements that actually span the screen
    are treated as the header's ground. */
const DARK_GROUNDS = [
  ".sfilm__panel",
  ".mp2-pagehead--film",
  ".mp2-fin-hero",
  ".mp2-valuation",
  ".prefooter",
  ".site-footer",
  ".bg-forest-700",
  '[data-header-tone="dark"]',
].join(",");

/** A band only counts as the header's ground if it spans the screen. */
const FULL_BLEED = 0.92;

/** The header's own height, measured rather than declared. It is set in one
    place, --header-h in globals.css, and reading it back off the element
    means this cannot fall out of step with it the next time that changes —
    which it already did once, when the header grew from 64px to 80px. */
function headerHeight() {
  const el = document.querySelector(".site-header");
  return el ? Math.round(el.getBoundingClientRect().height) : 64;
}

/**
 * Public site header. Six buy-side items and the Car Marketplace lockup.
 *
 * Two scroll behaviours, both added at Adam's direction and both departures
 * from the identity, which rules out scroll-driven motion outright. They join
 * the home page's scroll film as things Liz is being asked to rule on, and
 * they are recorded together in the Intelligence Brief. This file previously
 * said "always visible (no scroll hide/show, no tone logic)", which was the
 * position before that call.
 *
 *   - It gets out of the way going down and comes back the moment you go up,
 *     so reading reclaims the top of the screen without losing the nav.
 *   - It reads its own ground and inverts: cream with dark type over the pale
 *     pages, white type over the films and the footer.
 */
export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [onDark, setOnDark] = useState(false);
  const [condensed, setCondensed] = useState(false);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close the mobile menu on route change.
  useEffect(() => setOpen(false), [pathname]);

  // --- Out of the way going down, back on the way up ---------------------
  useEffect(() => {
    // With the menu open the header is the menu's own chrome, so it stays put
    // whatever the scroll does underneath.
    if (open) {
      setHidden(false);
      return;
    }
    let last = window.scrollY;
    let frame = 0;
    let hideTimer: ReturnType<typeof setTimeout>;
    let pendingHide = false;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        const dy = y - last;
        // Two stages, and they are deliberately spaced apart so they read as
        // two things rather than one. Half a screen of scroll draws the three
        // pods in to the middle, and the header then holds there — condensed
        // and fully visible — for another quarter screen before it will
        // consider going anywhere. Both are measured against the viewport
        // rather than fixed pixels, so the sequence keeps its proportions on
        // a laptop and on a phone.
        const vh = window.innerHeight;
        const condenseAt = vh * 0.5;
        const hideAt = condenseAt + vh * 0.25;
        setCondensed(y > condenseAt);
        // A trackpad settling sends a run of one and two pixel events. Waiting
        // for six pixels of travel in one direction stops the header flickering
        // on a hand that has not actually decided to go anywhere. `last` is
        // deliberately not updated below the threshold, so slow deliberate
        // scrolling still accumulates and counts.
        if (Math.abs(dy) < 6) return;
        last = y;

        // Coming back up is immediate: reaching for the nav should not be
        // met with a wait. Above the hide line it also simply stays.
        if (dy < 0 || y <= hideAt) {
          clearTimeout(hideTimer);
          pendingHide = false;
          setHidden(false);
          return;
        }

        // Past the hide line and still going down, it waits a moment more.
        // Without that wait the header vanishes on the first flick of the
        // wheel, which reads as twitchy and takes the nav away from someone
        // who was only nudging the page. The timer is armed once and left to
        // run, so a continuous scroll hides it 220ms after it started rather
        // than 220ms after it stops.
        if (!pendingHide) {
          pendingHide = true;
          hideTimer = setTimeout(() => {
            pendingHide = false;
            setHidden(true);
          }, 220);
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(hideTimer);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [open]);

  // --- Reading the ground it is sitting on -------------------------------
  useEffect(() => {
    const grounds = Array.from(document.querySelectorAll(DARK_GROUNDS)).filter(
      (el) => el.getBoundingClientRect().width >= window.innerWidth * FULL_BLEED,
    );
    if (!grounds.length) {
      setOnDark(false);
      return;
    }
    // A one pixel line across the viewport at the header's bottom edge. An
    // element only counts as the header's ground while it is crossing that
    // line, which is what makes the switch happen exactly as the band passes
    // under rather than when it happens to enter the viewport.
    const build = () => {
      const h = headerHeight();
      return new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) dark.add(e.target);
            else dark.delete(e.target);
          }
          setOnDark(dark.size > 0);
        },
        {
          rootMargin: `-${h - 1}px 0px -${Math.max(
            window.innerHeight - h,
            0,
          )}px 0px`,
        },
      );
    };
    const dark = new Set<Element>();
    let io = build();
    grounds.forEach((g) => io.observe(g));

    // The margin is baked in at construction, so a resize needs a new one.
    let t: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        io.disconnect();
        dark.clear();
        io = build();
        grounds.forEach((g) => io.observe(g));
      }, 150);
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", onResize);
      io.disconnect();
    };
  }, [pathname]);

  // Admin has its own chrome.
  if (pathname?.startsWith("/admin")) return null;

  const isActive = (to: string) =>
    pathname === to || pathname?.startsWith(to + "/");

  return (
    <header
      className={`ah-site site-header vt-site-header${
        hidden ? " is-hidden" : ""
      }${onDark ? " is-on-dark" : ""}${condensed ? " is-condensed" : ""}`}
    >
      <div className="site-header__inner">
        <div
          className="site-header__logo site-header__pod"
          onClick={() => setOpen(false)}
        >
          {/* The lockup has a white cut for exactly this. */}
          <BrandLockup reverse={onDark} />
        </div>

        {/* Three pods rather than one right-hand group: the mark, the nav and
            the actions each hold their own ground, and the row draws them in
            towards the middle once the page has been scrolled. */}
        <nav className="site-header__nav site-header__pod" aria-label="Primary">
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

        <div className="site-header__actions site-header__pod">
          <HeaderAccount />

          <Button
            href={site.phoneHref}
            variant="tan"
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
              <HeaderAccount mobile />
            </li>
          </ul>
        </nav>
        <Button
          href={site.phoneHref}
          variant="tan"
          className="mobile-menu__call"
        >
          Call {site.phoneDisplay}
        </Button>
      </div>
    </header>
  );
}
