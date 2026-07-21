"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { List, X, Phone } from "@phosphor-icons/react";
import GarageNavBadge from "@/components/garage/GarageNavBadge";

const links = [
  { href: "/cars", label: "Cars for sale" },
  { href: "/sell", label: "Sell your car" },
  { href: "/finance", label: "Finance" },
  { href: "/about", label: "About Adam" },
];

// Routes whose first screenful sits on a light background (no dark hero).
// The header should start solid-light on these to avoid a first-paint flash.
const LIGHT_TOP = ["/saved", "/compare", "/legal", "/sell/status"];

function initialTone(pathname: string | null): "dark" | "light" {
  if (!pathname) return "dark";
  return LIGHT_TOP.some((p) => pathname.startsWith(p)) ? "light" : "dark";
}

// useLayoutEffect warns during SSR; fall back to useEffect on the server.
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function Header({
  phone,
  phoneHref,
}: {
  phone: string;
  phoneHref: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // Tone of the content sitting directly behind the header. "dark" content
  // → light header (white type, inverted logo); "light" content → a frosted
  // light bar with dark type. Driven by data-header-tone markers below.
  const [tone, setTone] = useState<"dark" | "light">(() => initialTone(pathname));
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  // Close the mobile menu whenever the route changes.
  useEffect(() => setOpen(false), [pathname]);

  // Watch the dark regions on the page. A ~1px trip line just below the top
  // of the viewport decides the tone: if any dark-toned section crosses it,
  // the header goes light; otherwise it goes dark-on-light.
  useIsoLayoutEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    setTone(initialTone(pathname));
    const trip = 34; // px from the top — roughly the header's vertical centre
    let observer: IntersectionObserver | null = null;
    const active = new Set<Element>();

    const build = () => {
      observer?.disconnect();
      active.clear();
      const marks = document.querySelectorAll<HTMLElement>('[data-header-tone="dark"]');
      observer = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) active.add(e.target);
            else active.delete(e.target);
          }
          setTone(active.size > 0 ? "dark" : "light");
        },
        { rootMargin: `-${trip}px 0px -${Math.max(0, window.innerHeight - trip - 1)}px 0px` }
      );
      marks.forEach((m) => observer!.observe(m));
    };

    // Content mounts a frame after route change; build on the next frame.
    const raf = requestAnimationFrame(build);
    const onResize = () => build();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      observer?.disconnect();
    };
  }, [pathname]);

  // Auto-hide on scroll down, reveal on scroll up. Always shown near the top.
  useEffect(() => {
    lastY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y < 8) setHidden(false);
      else if (y > lastY.current + 4 && y > 120) setHidden(true);
      else if (y < lastY.current - 4) setHidden(false);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  // The menu forces a solid light bar so the open panel reads cleanly.
  const onDark = tone === "dark" && !open;

  return (
    <header
      className={`sticky top-0 z-40 will-change-transform transition-[transform,background-color,border-color,backdrop-filter] duration-300 ease-out ${
        hidden && !open ? "-translate-y-full" : "translate-y-0"
      } ${
        onDark
          ? "bg-transparent border-b border-transparent"
          : "bg-paper/85 backdrop-blur-md border-b border-stone-200/70 supports-[backdrop-filter]:bg-paper/70"
      }`}
    >
      {/* A whisper of shade on dark heroes keeps the type legible over the
          brightest frames of the video/photo without reading as a bar. */}
      {onDark && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/35 to-transparent"
        />
      )}

      <div className="relative max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" aria-label="Adam Hall — Buy My Car, home" onClick={() => setOpen(false)}>
          {/* One two-tone badge, recoloured by tone: as-is (dark plate) on
              light backgrounds, inverted to a white plate on dark ones. */}
          <img
            src="/brand/logo.png"
            alt="Adam Hall — Buy My Car"
            width={1100}
            height={496}
            className={`h-9 md:h-10 w-auto transition-[filter] duration-300 ${
              onDark ? "[filter:invert(1)_brightness(1.06)]" : ""
            }`}
          />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => {
            const activeLink = pathname === l.href || pathname?.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  activeLink
                    ? onDark
                      ? "bg-white/20 text-white"
                      : "bg-forest-50 text-forest-700"
                    : onDark
                      ? "text-white/90 hover:bg-white/15 hover:text-white"
                      : "text-ink hover:bg-stone-100"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <GarageNavBadge
            className={`px-3 py-2 rounded-full text-sm font-semibold transition-colors ${
              onDark ? "text-white/90 hover:bg-white/15 hover:text-white" : "text-ink hover:bg-stone-100"
            }`}
          />
          <a
            href={phoneHref}
            className={`btn text-sm ml-2 px-6 py-2.5 ${
              onDark
                ? "bg-white text-forest-800 hover:bg-forest-50"
                : "bg-forest-600 text-white hover:bg-forest-700"
            }`}
          >
            <Phone size={16} weight="bold" />
            <span data-edit="phone.display">{phone}</span>
          </a>
        </nav>

        <button
          className={`md:hidden p-2 -mr-2 transition-colors ${onDark ? "text-white" : "text-ink"}`}
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={24} /> : <List size={24} />}
        </button>
      </div>

      {open && (
        <nav className="md:hidden relative border-t border-stone-200 bg-paper px-4 py-3 flex flex-col gap-1">
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
            Call <span data-edit="phone.display">{phone}</span>
          </a>
        </nav>
      )}
    </header>
  );
}
