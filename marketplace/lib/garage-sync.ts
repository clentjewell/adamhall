"use client";

import { createClient } from "@/lib/supabase/client";
import {
  COMPARE_LIMIT,
  getCompare,
  getSaved,
  replaceCompare,
  replaceSaved,
} from "@/lib/garage";

/**
 * Mirrors the saved and compare lists to the signed-in buyer's account.
 *
 * The design keeps localStorage as the thing the UI reads and writes. Every
 * existing consumer — the card hearts, the nav badge, the saved and compare
 * pages — stays synchronous and untouched, and this module reconciles the
 * account behind them. The alternative, making every read async, would have
 * rewritten eight components to gain nothing a visitor can see.
 *
 * Rules:
 *   - Signing in MERGES rather than replaces. Somebody who picked three cars
 *     as a guest and then registers keeps them, and anything already on the
 *     account comes down to this device.
 *   - Signing out empties both local lists. They are safe on the account, and
 *     leaving them on a shared computer would show the next person what the
 *     last one was looking at.
 *   - Writes are one-way: local is the truth and the account follows. Nothing
 *     here writes back to localStorage except the merge on sign-in, which is
 *     what stops the two ping-ponging.
 *
 * Recently-viewed is deliberately not mirrored. It is a convenience for the
 * current visit, and a list of every car someone glanced at is not something
 * worth storing against their name.
 */

/** One shape for both lists, so there is a single code path to reason about. */
interface ListSpec {
  table: "saved_cars" | "compare_cars";
  read: () => string[];
  write: (ids: string[]) => void;
  /** Compare holds three; saved is unbounded. */
  limit?: number;
}

const LISTS: ListSpec[] = [
  { table: "saved_cars", read: getSaved, write: replaceSaved },
  { table: "compare_cars", read: getCompare, write: replaceCompare, limit: COMPARE_LIMIT },
];

/** What we last knew each account list to hold, so a change becomes a diff. */
const mirrored = new Map<string, Set<string>>();

export function resetMirror(): void {
  mirrored.clear();
}

async function fetchAccountList(table: string, userId: string): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from(table)
    .select("car_id")
    .eq("user_id", userId);
  if (error) {
    console.error(`garage-sync: could not read ${table}:`, error.message);
    return [];
  }
  return (data ?? []).map((r) => r.car_id as string);
}

/**
 * Called on sign-in. Merges whatever this device has into the account, pulls
 * the account's list back down, and leaves both sides holding the union.
 */
export async function adoptAndPull(userId: string): Promise<void> {
  const supabase = createClient();

  for (const list of LISTS) {
    const local = list.read();
    const remote = await fetchAccountList(list.table, userId);

    // Local first: it is the selection the visitor is looking at right now,
    // so when a merged comparison overflows three it is their current picks
    // that survive rather than something chosen on another device weeks ago.
    const merged = [...new Set([...local, ...remote])].slice(
      0,
      list.limit ?? Number.MAX_SAFE_INTEGER,
    );

    const remoteSet = new Set(remote);
    const toUpload = merged.filter((id) => !remoteSet.has(id));
    if (toUpload.length > 0) {
      const { error } = await supabase
        .from(list.table)
        .upsert(
          toUpload.map((car_id) => ({ user_id: userId, car_id })),
          { onConflict: "user_id,car_id", ignoreDuplicates: true },
        );
      if (error) {
        console.error(`garage-sync: could not adopt into ${list.table}:`, error.message);
      }
    }

    // Anything the account held that the merge trimmed away has to go, or the
    // account would quietly keep a fourth compare car this device cannot see.
    const mergedSet = new Set(merged);
    const toDrop = remote.filter((id) => !mergedSet.has(id));
    if (toDrop.length > 0) {
      const { error } = await supabase
        .from(list.table)
        .delete()
        .eq("user_id", userId)
        .in("car_id", toDrop);
      if (error) {
        console.error(`garage-sync: could not trim ${list.table}:`, error.message);
      }
    }

    mirrored.set(list.table, new Set(merged));
    list.write(merged);
  }
}

/**
 * Called whenever a local list changes while signed in. Works out what moved
 * and applies just that to the account.
 */
export async function pushLocalChanges(userId: string): Promise<void> {
  const supabase = createClient();

  for (const list of LISTS) {
    const local = new Set(list.read());
    const known = mirrored.get(list.table) ?? new Set<string>();
    const added = [...local].filter((id) => !known.has(id));
    const removed = [...known].filter((id) => !local.has(id));
    if (added.length === 0 && removed.length === 0) continue;

    // Assume success and record it up front: a failed call logs and the next
    // change re-sends the difference, which is better than a retry loop
    // fighting a visitor who is still clicking.
    mirrored.set(list.table, local);

    if (added.length > 0) {
      const { error } = await supabase
        .from(list.table)
        .upsert(
          added.map((car_id) => ({ user_id: userId, car_id })),
          { onConflict: "user_id,car_id", ignoreDuplicates: true },
        );
      if (error) console.error(`garage-sync: add to ${list.table} failed:`, error.message);
    }
    if (removed.length > 0) {
      const { error } = await supabase
        .from(list.table)
        .delete()
        .eq("user_id", userId)
        .in("car_id", removed);
      if (error) console.error(`garage-sync: remove from ${list.table} failed:`, error.message);
    }
  }
}

/** Empties both local lists on sign-out. */
export function clearLocalLists(): void {
  for (const list of LISTS) list.write([]);
}
