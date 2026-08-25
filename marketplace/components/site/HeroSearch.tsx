"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Link } from "next-view-transitions";
import { applyFilters, type Filterable } from "@/lib/filters";
import TypeIcon from "@/components/site/TypeIcon";
import "@/components/site/HeroSearch.css";

/**
 * The search band across the foot of the home hero, and the marketplace's
 * snapshot of itself.
 *
 * Laid out to Adam's mockup: one band the width of the page, the fields and
 * the count button on the left, a row of type tiles on the right behind a
 * hairline. It was a cream card floating on the right of the frame before
 * that; the band is the shape he drew, and it gives the film its right-hand
 * half back — which is the half the scrim clears, and the only part of the
 * picture that was ever properly visible.
 *
 * Glass rather than cream, also from the mockup: forest at 62% over the film
 * with a blur behind it, so the band belongs to the frame instead of sitting
 * on top of it. The blur is the same device the header already uses when it
 * floats over a page.
 *
 * The tiles carry a drawn icon of the type. They held the lead photograph of a
 * real car of that type until Adam asked for icons instead, and he is right:
 * at 88px a photograph of one particular Hilux is a picture of one car, where a
 * silhouette is the whole class. It also means the hero no longer fetches five
 * photographs to draw five buttons. See TypeIcon for the set.
 *
 * The mockup's own tiles read New Cars, EV, Hybrid, SUV, Ute. Two of those
 * cannot be honest here: there are no new cars on a used-car lot and no EV in
 * the range, and a tile leading to an empty page is worse than a shorter row.
 * So the row is built from what is actually on the lot — the body types, then
 * the fuels worth naming — which today is five tiles, the same five the
 * mockup has room for.
 *
 * Everything in the band is DERIVED FROM STOCK and carries its own count. If a
 * make is not on the lot it is not in the list; if a price step would return
 * nothing it is not offered; a tile the other choices have ruled out goes flat
 * and stops responding. The count is the button's label, so it can never
 * promise a page of results that is not there.
 *
 * The tiles select rather than navigate. Everything else counts live, and a
 * tile that jumped straight to /cars would be a second mechanism competing
 * with the first — pick a type, watch the number on the button move, go when
 * it says what you want. The body tiles and the body-type select are two ways
 * into the same state, so choosing in one lights up the other.
 *
 * There is no Location select, though the reference has one. There is one
 * dealer in one place; a state dropdown would be furniture.
 *
 * The marketplace lives on this same page now, directly below the hero, so
 * the band is the top of the results rather than a way to another route. Two
 * speeds, deliberately: the QUICK SEARCH box writes the q filter to the URL
 * as it is typed (debounced), so the list below narrows live under the
 * reader's hands; the selects still commit as one selection when the count
 * button is pressed, which scrolls to the list. The URL is the shared state
 * either way — useCarFilters reads it — so a search stays shareable.
 */

/** Just the fields filtering reads. The band runs in the browser, so what it
    is given is what the page ships — see the projection in app/page.tsx. It
    carried one photo URL per car until the tiles became drawn icons. */
export type HeroSearchCar = Filterable;

/** Price ceilings offered, coarsest first. Only those that would actually
    return something are shown, so the ladder shortens with the lot. */
const PRICE_CEILINGS = [25000, 35000, 50000, 75000];

/** Fuels worth a tile of their own, in the order a buyer would ask for them.
    Only the ones actually on the lot get one. */
const FUELS = ["Hybrid", "Diesel"];

/** More than this and the row stops being a row. */
const MAX_TILES = 6;

const money = (n: number) =>
  n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n.toLocaleString("en-AU")}`;

type Tile = {
  /** Which filter the tile sets. Body tiles share their state with the
      body-type select; fuel tiles have no select of their own. */
  key: "body" | "fuel";
  value: string;
  /** The size of the group, which is what decides the row's order. */
  total: number;
  /** What is left of the group under the other choices. */
  count: number;
};

export default function HeroSearch({ cars }: { cars: HeroSearchCar[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const [make, setMake] = useState("");
  const [body, setBody] = useState("");
  const [fuel, setFuel] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [quick, setQuick] = useState("");
  /** Only a keystroke may write the URL — not the mount, and not the
      initial read-back of a shared link's q. */
  const quickTouched = useRef(false);
  /** The debounce in flight, so a deliberate commit can cancel it — measured
      without this, the stale write landed 250ms after the glass was pressed
      and took the scroll with it. */
  const quickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Phone and small tablet only: the band collapses to its own head so it
      cannot push the hero's words off a pinned screen. Wide screens ignore
      this entirely — the stylesheet shows the body and the toggle is not
      rendered to the accessibility tree at all. */
  const [open, setOpen] = useState(false);
  /** Whether the band is in its collapsing range. The head is a real button
      there and an inert heading above it: a control reporting aria-expanded
      while the stylesheet keeps the body open regardless would be lying to
      anyone not looking at the screen. Starts false so the server and the
      first client render agree, then corrects on mount. */
  const [narrow, setNarrow] = useState(false);
  const bodyId = useId();

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 899px)");
    const sync = () => setNarrow(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  // A shared link arrives with q already in the URL; the box should say so.
  // Read once on mount rather than via useSearchParams, which would demand a
  // Suspense boundary over the whole hero for one initial value.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setQuick(q);
  }, []);

  // The live half of the band: typing narrows the list below. Debounced so
  // the URL is written when the reader pauses, not on every keystroke.
  useEffect(() => {
    if (!quickTouched.current) return;
    quickTimer.current = setTimeout(() => {
      quickTimer.current = null;
      const next = new URLSearchParams(window.location.search);
      const v = quick.trim();
      if (v) next.set("q", v);
      else next.delete("q");
      router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
    }, 250);
    return () => {
      if (quickTimer.current) clearTimeout(quickTimer.current);
      quickTimer.current = null;
    };
  }, [quick, router, pathname]);

  const selection = useMemo(
    () => ({
      q: quick.trim() || undefined,
      make: make || undefined,
      body: body || undefined,
      fuel: fuel || undefined,
      priceMax: priceMax ? Number(priceMax) : undefined,
    }),
    [quick, make, body, fuel, priceMax],
  );

  /** The live count. The same applyFilters the results page uses, so the
      number on the button is the number of cards that will be there. */
  const matches = useMemo(() => applyFilters(cars, selection).length, [cars, selection]);

  /** Options are counted against the OTHER choices, not against the whole
      lot, so a make that has been ruled out by the type shows (0) rather than
      promising cars it cannot deliver. */
  const countWith = (over: Partial<typeof selection>) =>
    applyFilters(cars, { ...selection, ...over }).length;

  const makes = useMemo(
    () =>
      [...new Set(cars.map((c) => c.make))]
        .sort()
        .map((m) => ({ value: m, count: countWith({ make: m }) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cars, selection],
  );
  const bodies = useMemo(
    () =>
      [...new Set(cars.map((c) => c.body_type).filter(Boolean))]
        .sort()
        .map((b) => ({ value: b, count: countWith({ body: b }) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cars, selection],
  );
  const ceilings = useMemo(
    () =>
      PRICE_CEILINGS.map((p) => ({ value: p, count: countWith({ priceMax: p }) }))
        // A ceiling that catches everything left is the same as no ceiling,
        // and one that catches nothing is a dead end. Neither is offered.
        .filter((p) => p.count > 0 && p.count < cars.length),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cars, selection],
  );

  const tiles = useMemo<Tile[]>(() => {
    const group = (key: Tile["key"], value: string) =>
      cars.filter((c) => (key === "body" ? c.body_type : c.fuel) === value);

    const bodyNames = [...new Set(cars.map((c) => c.body_type).filter(Boolean))];
    const fuelNames = FUELS.filter((f) => cars.some((c) => c.fuel === f));

    const ordered: { key: Tile["key"]; value: string }[] = [
      // Body types first, then fuels: like with like, and each block biggest
      // first, so the row opens on the largest thing in the range.
      ...bodyNames
        .map((value) => ({ key: "body" as const, value }))
        .sort((a, z) => group("body", z.value).length - group("body", a.value).length ||
          a.value.localeCompare(z.value)),
      ...fuelNames
        .map((value) => ({ key: "fuel" as const, value }))
        .sort((a, z) => group("fuel", z.value).length - group("fuel", a.value).length),
    ].slice(0, MAX_TILES);

    return ordered.map(({ key, value }) => {
      const g = group(key, value);
      return {
        key,
        value,
        total: g.length,
        count: countWith({ [key]: value } as Partial<typeof selection>),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cars, selection]);

  const href = useMemo(() => {
    const q = new URLSearchParams();
    if (quick.trim()) q.set("q", quick.trim());
    if (make) q.set("make", make);
    if (body) q.set("body", body);
    if (fuel) q.set("fuel", fuel);
    if (priceMax) q.set("priceMax", priceMax);
    const s = q.toString();
    // The results are this page: the button commits the selection to the URL
    // and the hash walks the reader down to the grid.
    return `/${s ? `?${s}` : ""}#browse`;
  }, [quick, make, body, fuel, priceMax]);

  const touched = Boolean(quick || make || body || fuel || priceMax);

  /** Enter or the search button: apply q immediately and go to the results.
      The debounced write covers typing; this is the deliberate act. */
  const commitQuick = () => {
    if (quickTimer.current) {
      clearTimeout(quickTimer.current);
      quickTimer.current = null;
    }
    const next = new URLSearchParams(window.location.search);
    const v = quick.trim();
    if (v) next.set("q", v);
    else next.delete("q");
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
    document.getElementById("browse")?.scrollIntoView({ behavior: "smooth" });
  };

  const pick = (t: Tile) => {
    const on = t.key === "body" ? body === t.value : fuel === t.value;
    if (t.key === "body") setBody(on ? "" : t.value);
    else setFuel(on ? "" : t.value);
  };

  // Nothing to search, and a band of empty dropdowns across the film would
  // say so louder than the words do.
  if (cars.length === 0) return null;

  const head = (
    <>
      <span className="hsearch__headtext">
        <span className="hsearch__title">Find your next car</span>
        <span className="hsearch__snap">
          {cars.length} on the lot &middot; every one PPSR checked
        </span>
      </span>
      {/* Only shown collapsed, where the head is the whole band and this is
          the one number there is to read. */}
      <span className="hsearch__headcount">
        {matches} car{matches === 1 ? "" : "s"}
      </span>
      <span className="hsearch__chev" aria-hidden="true" />
    </>
  );

  return (
    <search className={`hsearch${open ? " is-open" : ""}`}>
      {narrow ? (
        <button
          type="button"
          className="hsearch__head"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setOpen((v) => !v)}
        >
          {head}
        </button>
      ) : (
        <p className="hsearch__head">{head}</p>
      )}

      {/* display: contents on a wide screen, so the row and the tiles sit in
          the band's own grid beside the head rather than nested inside a box
          of their own. A plain block below the split, where it is what the
          head opens and closes. */}
      <div id={bodyId} className={`hsearch__body${open ? " is-open" : ""}`}>
        {/* The quick search: type the car instead of building it from the
            selects. Filters the list below as it is typed; Enter or the
            glass jumps to it. On a wide screen it sits beside the head, one
            bar to the band's edge, per Adam's sketch. */}
        <div className="hsearch__quick">
          <input
            type="search"
            className="hsearch__input"
            value={quick}
            onChange={(e) => {
              quickTouched.current = true;
              setQuick(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitQuick();
              }
            }}
            placeholder={`Try “Hilux” or “Toyota diesel”`}
            aria-label="Quick search"
            autoComplete="off"
            enterKeyHint="search"
          />
          <button
            type="button"
            className="hsearch__qbtn"
            aria-label="Search"
            onClick={commitQuick}
          >
            {/* A glass, drawn like every other stroke on the band. */}
            <svg
              viewBox="0 0 24 24"
              width={18}
              height={18}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="10.5" cy="10.5" r="6" />
              <path d="M15 15 L20 20" />
            </svg>
          </button>
        </div>
        <div className="hsearch__row">
          <div className="hsearch__fields">
            <label className="hsearch__field">
              <span className="hsearch__label">Make</span>
              <select
                className="hsearch__select"
                value={make}
                onChange={(e) => setMake(e.target.value)}
              >
                <option value="">Any make</option>
                {makes.map((m) => (
                  // Shown, so the reader can see what the lot carries, but not
                  // selectable at zero: the count is there to explain why.
                  <option key={m.value} value={m.value} disabled={m.count === 0}>
                    {m.value} ({m.count})
                  </option>
                ))}
              </select>
            </label>

            {/* The same state the body tiles set, from the other end: choose
                here and the tile lights up. It stands down under 1200px,
                where the row cannot hold three fields, the button and the
                tiles at once — and it is the field the tiles already are. */}
            <label className="hsearch__field hsearch__field--body">
              <span className="hsearch__label">Body type</span>
              <select
                className="hsearch__select"
                value={body}
                onChange={(e) => setBody(e.target.value)}
              >
                <option value="">Any body</option>
                {bodies.map((b) => (
                  <option key={b.value} value={b.value} disabled={b.count === 0}>
                    {b.value} ({b.count})
                  </option>
                ))}
              </select>
            </label>

            <label className="hsearch__field">
              <span className="hsearch__label">Up to</span>
              <select
                className="hsearch__select"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
              >
                <option value="">Any price</option>
                {ceilings.map((p) => (
                  <option key={p.value} value={String(p.value)}>
                    {money(p.value)} ({p.count})
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="hsearch__go">
            {/* The count is the label. At zero it says so and does not link —
                there is nowhere honest for it to go. */}
            {matches > 0 ? (
              <Link href={href} className="hsearch__btn">
                Show {matches} car{matches === 1 ? "" : "s"}
                <span className="hsearch__arrow" aria-hidden="true">
                  &rarr;
                </span>
              </Link>
            ) : (
              <span className="hsearch__btn is-empty" aria-disabled="true">
                Nothing matches yet
              </span>
            )}
            {touched && (
              <button
                type="button"
                className="hsearch__clear"
                onClick={() => {
                  setMake("");
                  setBody("");
                  setFuel("");
                  setPriceMax("");
                  if (quick) {
                    quickTouched.current = true;
                    setQuick("");
                  }
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {tiles.length > 1 && (
          <div className="hsearch__types">
            <p className="hsearch__label">Explore by type</p>
            <div className="hsearch__tiles">
              {tiles.map((t) => {
                const on = t.key === "body" ? body === t.value : fuel === t.value;
                const dead = t.count === 0 && !on;
                return (
                  <button
                    key={`${t.key}:${t.value}`}
                    type="button"
                    className={`hsearch__tile${on ? " is-on" : ""}${dead ? " is-dead" : ""}`}
                    aria-pressed={on}
                    disabled={dead}
                    onClick={() => pick(t)}
                  >
                    <span className="hsearch__tileimg">
                      {/* Decorative: the type is named in text directly
                          below it. */}
                      <TypeIcon value={t.value} className="hsearch__ico" />
                    </span>
                    <span className="hsearch__tileline">
                      <span className="hsearch__tilename">{t.value}</span>
                      {/* Always what is actually there under the current
                          choices — which with nothing chosen is the whole
                          group. A tile that kept advertising three while a
                          make had cut it to one would be the band's one
                          lie. */}
                      <span className="hsearch__tilen">{t.count}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </search>
  );
}
