"use client";

import { useEffect, useState } from "react";
import { Link } from "next-view-transitions";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type State = "working" | "expired" | "failed";

/**
 * The last step of an email confirmation, run in the browser because the
 * session arrives in the URL fragment and a fragment is never sent to a
 * server. Reads it, stores the session, and moves the person on.
 *
 * Nothing here decides whether the link was valid — Supabase already did that
 * before redirecting. This only picks up the result.
 */
export default function ConfirmFinish() {
  const router = useRouter();
  const params = useSearchParams();
  const [state, setState] = useState<State>("working");

  const nextRaw = params.get("next") ?? "/";
  const next = nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/";
  const isAdmin = next.startsWith("/admin");

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));

    // A spent or expired link comes back named, so it can be told apart from
    // a link that simply arrived without anything attached.
    if (hash.get("error") || hash.get("error_code")) {
      setState("expired");
      return;
    }

    const access_token = hash.get("access_token");
    const refresh_token = hash.get("refresh_token");
    if (!access_token || !refresh_token) {
      setState("failed");
      return;
    }

    const supabase = createClient();
    supabase.auth.setSession({ access_token, refresh_token }).then(({ error }) => {
      if (error) {
        setState("failed");
        return;
      }
      // Drop the tokens out of the address bar before going anywhere, so they
      // are not left sitting in history or in a shared screenshot.
      window.history.replaceState(null, "", window.location.pathname);
      router.replace(next);
    });
  }, [next, router]);

  if (state === "working") {
    return (
      <p className="type-lead text-stone-600" role="status">
        Confirming your account…
      </p>
    );
  }

  return (
    <div role="alert">
      <h1 className="type-card-title">
        {state === "expired" ? "That link had already been used" : "That link did not work"}
      </h1>
      <p className="mt-3 max-w-[52ch] text-stone-600">
        {state === "expired"
          ? "Confirmation links work once and then run out. Signing in will send you a fresh one if the address still needs confirming."
          : "Nothing came back with that link. Signing in again is the quickest way through."}
      </p>
      <Link
        href={isAdmin ? "/admin/forgot-password" : "/account/sign-in"}
        className="btn-cta mt-6 inline-flex"
      >
        {isAdmin ? "Send a new link" : "Sign in"}
      </Link>
    </div>
  );
}
