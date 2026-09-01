"use client";

// Guest-first localStorage store for saved vehicles, comparison, and
// recently-viewed. Every mutation is synchronous and broadcasts a window
// event so any mounted UI (nav badge, card buttons, detail buttons) can
// re-read state and stay in sync.
//
// This stays the store the UI reads and writes, signed in or not, so nothing
// here has to become async. When somebody is signed in, GarageSync mirrors
// the saved list to their account in the background — see lib/garage-sync.ts.
// Compare and recently-viewed are deliberately not mirrored: both are
// working state for the current visit, not something worth carrying between
// devices.

const SAVED_KEY = "ah-saved-v1";
const COMPARE_KEY = "ah-compare-v1";
const RECENT_KEY = "ah-recent-v1";
const GARAGE_EVENT = "ah-garage";

const COMPARE_MAX = 3;
const RECENT_MAX = 12;

export const COMPARE_FULL_ERROR = "Compare holds three cars — remove one first.";

function readList(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string");
  } catch {
    // Corrupt JSON, storage disabled, or private-mode quirks — treat as empty.
    return [];
  }
}

function writeList(key: string, list: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // Quota exceeded or storage unavailable — nothing more we can do here.
  }
  window.dispatchEvent(new CustomEvent(GARAGE_EVENT));
}

// ---------------------------------------------------------------------------
// Saved
// ---------------------------------------------------------------------------

export function getSaved(): string[] {
  return readList(SAVED_KEY);
}

export function isSaved(id: string): boolean {
  return getSaved().includes(id);
}

/** Toggles the saved state of a car. Returns the new saved state. */
export function toggleSaved(id: string): boolean {
  const list = getSaved();
  const already = list.includes(id);
  const next = already ? list.filter((v) => v !== id) : [...list, id];
  writeList(SAVED_KEY, next);
  return !already;
}

/**
 * Overwrites the saved list wholesale. Used by the account sync when it
 * reconciles this device against the signed-in buyer's stored shortlist, and
 * to empty the list on sign-out so the next person on a shared computer does
 * not inherit it.
 *
 * Everything else still goes through toggleSaved. This exists because a
 * merge is one write, not a run of toggles, each of which would broadcast.
 */
export function replaceSaved(ids: string[]): void {
  writeList(SAVED_KEY, [...new Set(ids)]);
}

// ---------------------------------------------------------------------------
// Compare
// ---------------------------------------------------------------------------

export function getCompare(): string[] {
  return readList(COMPARE_KEY);
}

/** How many cars the comparison table holds. Exported so the account sync
    trims a merged list to the same limit the UI enforces. */
export const COMPARE_LIMIT = COMPARE_MAX;

/**
 * Overwrites the comparison wholesale, trimmed to the limit. Used by the
 * account sync when reconciling this device against the signed-in buyer's
 * stored comparison, and to empty it on sign-out.
 */
export function replaceCompare(ids: string[]): void {
  writeList(COMPARE_KEY, [...new Set(ids)].slice(0, COMPARE_MAX));
}

export function isCompared(id: string): boolean {
  return getCompare().includes(id);
}

/**
 * Toggles a car's membership in the comparison list (max three cars).
 * Adding a fourth car is rejected with `ok: false` and an inline error
 * message rather than silently dropping the oldest entry.
 */
export function toggleCompare(id: string): { ok: boolean; list: string[]; error?: string } {
  const list = getCompare();
  if (list.includes(id)) {
    const next = list.filter((v) => v !== id);
    writeList(COMPARE_KEY, next);
    return { ok: true, list: next };
  }
  if (list.length >= COMPARE_MAX) {
    return { ok: false, list, error: COMPARE_FULL_ERROR };
  }
  const next = [...list, id];
  writeList(COMPARE_KEY, next);
  return { ok: true, list: next };
}

// ---------------------------------------------------------------------------
// Recently viewed
// ---------------------------------------------------------------------------

export function getRecent(): string[] {
  return readList(RECENT_KEY);
}

/** Records a car view: moves it to the front, de-duped, capped at 12. */
export function recordRecentView(id: string): void {
  const withoutId = getRecent().filter((v) => v !== id);
  const next = [id, ...withoutId].slice(0, RECENT_MAX);
  writeList(RECENT_KEY, next);
}

// ---------------------------------------------------------------------------
// Subscription
// ---------------------------------------------------------------------------

/**
 * Subscribes to any garage mutation (saved/compare/recent, from this tab or
 * another). Returns an unsubscribe function.
 */
export function onGarageChange(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(GARAGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(GARAGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
