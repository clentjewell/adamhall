"use client";

import { useEffect, useState } from "react";
import { Link } from "next-view-transitions";
import { createClient } from "@/lib/supabase/client";

/**
 * The signed-out invitation to make an account. Rendered client-side and
 * hidden until the session is known, so a signed-in buyer never sees a
 * "create an account" strip for the account they already have — and so the
 * page it sits on can stay static rather than turning dynamic just to ask
 * who is looking.
 *
 * Nothing here gates anything. The shortlist works signed out and always
 * will; this only offers to carry it between devices.
 */
export default function AccountPrompt() {
  const [signedOut, setSignedOut] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    // getSession, not getUser: this is a cosmetic decision about which strip
    // to show, so reading the stored session is enough and it does not put a
    // network round trip in front of the page. Nothing here reads data, so
    // there is nothing for a forged local session to reach.
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) setSignedOut(!data.session?.user);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedOut(!session?.user);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (signedOut !== true) return null;

  return (
    <div className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
      <div>
        <p className="type-card-title">Keep this list on every device</p>
        <p className="mt-1.5 max-w-[52ch] text-stone-600">
          Your saved cars live in this browser at the moment. An account moves
          them with you, and lets us tell you when one drops in price or sells.
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-3">
        <Link href="/account/register" className="btn-cta">
          Create an account
        </Link>
        <Link href="/account/sign-in" className="btn-secondary">
          Sign in
        </Link>
      </div>
    </div>
  );
}
