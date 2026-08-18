"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { onGarageChange, replaceSaved } from "@/lib/garage";
import { adoptAndPull, pushLocalChanges, resetMirror } from "@/lib/garage-sync";

/**
 * Keeps the saved-cars list and the signed-in buyer's account in step.
 *
 * Mounted once in the root layout and renders nothing. It lives here rather
 * than inside the save button because the list can change from several places
 * at once — a card heart, the detail page, another tab — and all of them
 * broadcast the same event.
 */
export default function GarageSync() {
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    // Coalesces a burst of changes — unsaving three cars in a row is one
    // round trip, not three.
    let timer: number | undefined;
    const schedulePush = () => {
      const userId = userIdRef.current;
      if (!userId) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        void pushLocalChanges(userId);
      }, 400);
    };

    const unsubscribeGarage = onGarageChange(schedulePush);

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      const userId = session?.user.id ?? null;
      const previous = userIdRef.current;
      userIdRef.current = userId;

      if (userId && userId !== previous) {
        // Signed in, or a different person signed in on this device.
        resetMirror();
        void adoptAndPull(userId).catch((err) =>
          console.error("GarageSync: adopt failed:", err),
        );
        return;
      }

      // Signed out. The cars are on the account; clearing here stops the next
      // person on a shared computer inheriting the last one's shortlist.
      if (!userId && previous) {
        resetMirror();
        replaceSaved([]);
      }

      // TOKEN_REFRESHED and the like arrive with the same user and need
      // nothing doing.
      void event;
    });

    return () => {
      cancelled = true;
      void cancelled;
      window.clearTimeout(timer);
      unsubscribeGarage();
      sub.subscription.unsubscribe();
    };
  }, []);

  return null;
}
