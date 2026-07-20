"use client";

// Guest-first localStorage store for saved vehicles, comparison, and
// recently-viewed. No accounts, no server round-trip — every mutation is
// synchronous and broadcasts a window event so any mounted UI (nav badge,
// card buttons, detail buttons) can re-read state and stay in sync.

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

// ---------------------------------------------------------------------------
// Compare
// ---------------------------------------------------------------------------

export function getCompare(): string[] {
  return readList(COMPARE_KEY);
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
