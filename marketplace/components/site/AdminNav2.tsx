"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/actions/admin";
import { ADMIN_NAV } from "@/components/admin/AdminNav";

/**
 * Console sidebar for the redesigned dashboard (artifact frame 1l).
 *
 * The item list and the sign-out action are imported from the existing nav,
 * so the two cannot list different pages. Every destination is the real admin
 * route — only the dashboard itself has a redesigned twin, so this is a
 * preview of the shell, not a second console.
 */
export default function AdminNav2({ adminName }: { adminName: string }) {
  const pathname = usePathname();

  return (
    <aside className="mp2-console__nav">
      <Link href="/" className="mp2-console__logo">
        <b>CAR MARKETPLACE</b>
        <span>DEALER CONSOLE</span>
      </Link>

      <p className="mp2-console__who">Signed in as {adminName}</p>

      <nav className="mp2-console__links" aria-label="Admin">
        {/* The redesigned dashboard is this route; everything else points at
            the working admin pages. */}
        <Link
          href="/admin2"
          className={`mp2-console__link${pathname === "/admin2" ? " is-on" : ""}`}
        >
          Dashboard
        </Link>
        {ADMIN_NAV.filter((i) => i.href !== "/admin").map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`mp2-console__link${pathname.startsWith(item.href) ? " is-on" : ""}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <Link href="/admin/inventory/new" className="btn btn--green mp2-console__add">
        + Add a car
      </Link>

      <form action={signOut} className="mp2-console__out">
        <button type="submit">Sign out</button>
      </form>
    </aside>
  );
}
