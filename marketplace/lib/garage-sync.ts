"use client";

import { createClient } from "@/lib/supabase/client";
import { getSaved, replaceSaved } from "@/lib/garage";

/**
 * Mirrors the saved-cars list to the signed-in buyer's account.
 *
 * The design keeps localStorage as the thing the UI reads and writes. Every
 * existing consumer — the card hearts, the nav badge, the saved page — stays
 * synchronous and untouched, and this module reconciles the account behind
 * them. The alternative, making every read async, would have rewritten eight
 * components to gain nothing a visitor can see.
 *
 * Rules:
 *   - Signing in MERGES rather than replaces. Somebody who saved three cars
 *     as a guest and then registers keeps all three, and anything already on
 *     the account comes down to this device.
 *   - Signing out empties the local list. The cars are safe on the account,
 *     and leaving them on a shared computer would show the next person what
 *     the last one was looking at.
 *   - Writes are one-way: local is the truth, and this pushes the difference
 *     up. Nothing here writes back to localStorage except the merge on
 *     sign-in, which is what stops the two from ping-ponging.
 */

/** What we last knew the account to hold, so a change becomes a diff. */
let mirrored = new Set<string>();

export function resetMirror(): void {
  mirrored = new Set();
}

async function fetchAccountSaved(userId: string): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("saved_cars")
    .select("car_id")
    .eq("user_id", userId);
  if (error) {
    console.error("garage-sync: could not read saved cars:", error.message);
    return [];
  }
  return (data ?? []).map((r) => r.car_id as string);
}

/**
 * Called on sign-in. Merges whatever this device has into the account, pulls
 * the account's list back down, and leaves both sides holding the union.
 */
export async function adoptAndPull(userId: string): Promise<void> {
  const local = getSaved();
  const remote = await fetchAccountSaved(userId);

  const remoteSet = new Set(remote);
  const toUpload = local.filter((id) => !remoteSet.has(id));

  if (toUpload.length > 0) {
    const supabase = createClient();
    const { error } = await supabase
      .from("saved_cars")
      .upsert(
        toUpload.map((car_id) => ({ user_id: userId, car_id })),
        { onConflict: "user_id,car_id", ignoreDuplicates: true },
      );
    if (error) {
      console.error("garage-sync: could not adopt guest saves:", error.message);
    }
  }

  const merged = [...new Set([...remote, ...local])];
  mirrored = new Set(merged);
  replaceSaved(merged);
}

/**
 * Called whenever the local list changes while signed in. Works out what
 * moved and applies just that to the account.
 */
export async function pushLocalChanges(userId: string): Promise<void> {
  const local = new Set(getSaved());
  const added = [...local].filter((id) => !mirrored.has(id));
  const removed = [...mirrored].filter((id) => !local.has(id));
  if (added.length === 0 && removed.length === 0) return;

  // Assume success and record it up front: a failed call logs and the next
  // change re-sends the difference, which is better than a retry loop
  // fighting a visitor who is still clicking.
  mirrored = local;

  const supabase = createClient();
  if (added.length > 0) {
    const { error } = await supabase
      .from("saved_cars")
      .upsert(
        added.map((car_id) => ({ user_id: userId, car_id })),
        { onConflict: "user_id,car_id", ignoreDuplicates: true },
      );
    if (error) console.error("garage-sync: save failed:", error.message);
  }
  if (removed.length > 0) {
    const { error } = await supabase
      .from("saved_cars")
      .delete()
      .eq("user_id", userId)
      .in("car_id", removed);
    if (error) console.error("garage-sync: unsave failed:", error.message);
  }
}
