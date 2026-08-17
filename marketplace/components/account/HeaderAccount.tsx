"use client";

import { useEffect, useState } from "react";
import { Link } from "next-view-transitions";
import { createClient } from "@/lib/supabase/client";
import { signOutBuyer } from "@/app/actions/account";

/**
 * The account control in the header. Signed out it is one quiet link to
 * sign in; signed in it is the person's first name and a way back out.
 *
 * It renders the signed-out link on the server and swaps once the session
 * resolves, rather than rendering nothing until it knows. Most visitors are
 * signed out, so the common case has no shift in the header, and a signed-in
 * visitor sees one swap on their first paint instead of everyone seeing the
 * header settle.
 *
 * Dealer accounts are deliberately not surfaced here. The console has its own
 * chrome and its own login; this is the buy side.
 */
export default function HeaderAccount({ mobile = false }: { mobile?: boolean }) {
  const [firstName, setFirstName] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    const read = (meta: Record<string, unknown> | undefined) => {
      const full = typeof meta?.full_name === "string" ? meta.full_name : "";
      // First word only. A header is not the place for someone's full name,
      // and a long one would push the phone number off the row.
      return full.trim().split(/\s+/)[0] || null;
    };

    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) setFirstName(read(data.session?.user.user_metadata));
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setFirstName(read(session?.user.user_metadata));
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const cls = mobile ? "mobile-menu__account" : "site-header__account";

  if (!firstName) {
    return (
      <Link href="/account/sign-in" className={cls}>
        Sign in
      </Link>
    );
  }

  return (
    <span className={`${cls} ${cls}--in`}>
      {/* The name goes to the account hub, not straight to the shortlist:
          the hub is where everything the account holds is listed, and Saved
          already has its own item in the nav. */}
      <Link href="/account" className={`${cls}-name`}>
        {firstName}
      </Link>
      {/* A server action, so signing out clears the cookie server-side rather
          than only emptying the browser's copy of the session. */}
      <form action={signOutBuyer}>
        <button type="submit" className={`${cls}-out`}>
          Sign out
        </button>
      </form>
    </span>
  );
}
