"use client";

import { useId, useMemo, useState } from "react";
import { Link } from "next-view-transitions";
import { applyFilters, type Filterable } from "@/lib/filters";
import "@/components/site/HeroSearch.css";

/**
 * The search panel in the home hero, and the marketplace's snapshot of itself.
 *
 * Modelled on the pattern every Australian car buyer already knows — the
 * floating panel over the hero, a live "show N cars" button, quick categories
 * underneath — but built for this lot rather than copied from a site with two
 * hundred thousand cars on it.
 *
 * That difference decides the whole design. On a national classifieds site the
 * dropdowns are a way through a haystack, and it does not matter that most
 * combinations return nothing, because something always remains. On a lot of
 * eight the same controls would mostly return one car or none, and a search
 * that dead-ends makes a curated range look empty rather than chosen.
 *
 * So every option here is DERIVED FROM STOCK and carries its own count. If a
 * make is not on the lot it is not in the list; if a price step would return
 * nothing it is not offered. The panel cannot lead anywhere empty, which is
 * the honest version of the pattern at this scale — and it doubles as the
 * snapshot, because a reader can see the shape of the range without scrolling.
 *
 * There is no Location select, though the reference has one. There is one
 * dealer in one place; a state dropdown would be furniture.
 *
 * The panel holds nothing of its own in the URL: it is a way in, not the
 * results page. Choosing narrows the count in place, and the button hands the
 * whole selection to /cars as query parameters that page already reads
 * (useCarFilters), so a search started here arrives there intact and
 * shareable.
 */

/** Just the fields filtering reads — see Filterable. The panel runs in the
    browser, so what it is given is what the page ships. */
export type HeroSearchCar = Filterable;

/** Price ceilings offered, coarsest first. Only those that would actually
    return something are shown, so the ladder shortens with the lot. */
const PRICE_CEILINGS = [25000, 35000, 50000, 75000];

const money = (n: number) =>
  n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n.toLocaleString("en-AU")}`;

type Chip = { label: string; params: Record<string, string>; count: number };

export default function HeroSearch({ cars }: { cars: HeroSearchCar[] }) {
  const [make, setMake] = useState("");
  const [body, setBody] = useState("");
  const [priceMax, setPriceMax] = useState("");
  /** Phone only: the card collapses to its own top line so it cannot push the
      hero's words off a pinned screen. Desktop ignores this entirely — the
      fields are shown by the stylesheet and the toggle is not rendered to the
      accessibility tree at all. */
  const [open, setOpen] = useState(false);
  const bodyId = useId();

  const selection = useMemo(
    () => ({
      make: make || undefined,
      body: body || undefined,
      priceMax: priceMax ? Number(priceMax) : undefined,
    }),
    [make, body, priceMax],
  );

  /** The live count. The same applyFilters the results page uses, so the
      number on the button is the number of cards that will be there. */
  const matches = useMemo(() => applyFilters(cars, selection).length, [cars, selection]);

  /** Options are counted against the OTHER choices, not against the whole
      lot, so a make that has been ruled out by the body type shows (0) rather
      than promising cars it cannot deliver. */
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

  /** Quick ways in, each one a real slice of the lot with its real size.
      Built from what is actually here: the body types that dominate, the
      fuels worth naming, and the one price band that splits the range. */
  const chips = useMemo<Chip[]>(() => {
    const out: Chip[] = [];
    const bodyCounts = [...new Set(cars.map((c) => c.body_type).filter(Boolean))]
      .map((b) => ({ b, n: cars.filter((c) => c.body_type === b).length }))
      .sort((a, z) => z.n - a.n || a.b.localeCompare(z.b));
    for (const { b, n } of bodyCounts) out.push({ label: b, params: { body: b }, count: n });

    for (const f of ["Hybrid", "Diesel"]) {
      const n = cars.filter((c) => c.fuel === f).length;
      if (n) out.push({ label: f, params: { fuel: f }, count: n });
    }

    const under = cars.filter((c) => c.price <= 35000).length;
    if (under && under < cars.length)
      out.push({ label: "Under $35k", params: { priceMax: "35000" }, count: under });

    return out;
  }, [cars]);

  const href = useMemo(() => {
    const q = new URLSearchParams();
    if (make) q.set("make", make);
    if (body) q.set("body", body);
    if (priceMax) q.set("priceMax", priceMax);
    const s = q.toString();
    return `/cars${s ? `?${s}` : ""}`;
  }, [make, body, priceMax]);

  const touched = Boolean(make || body || priceMax);

  // Nothing to search, and a panel of empty dropdowns over the film would say
  // so louder than the words do. The hero falls back to its own single column.
  if (cars.length === 0) return null;

  return (
    <search className={`hsearch${open ? " is-open" : ""}`}>
      {/* Phone only. Carries the card's own title so the collapsed state is
          still labelled, and the count so it is worth tapping. */}
      <button
        type="button"
        className={`hsearch__toggle${open ? " is-open" : ""}`}
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={() => setOpen((v) => !v)}
      >
        <span>Find your next car</span>
        <span className="hsearch__togglen">
          {matches} car{matches === 1 ? "" : "s"}
        </span>
        <span className="hsearch__chev" aria-hidden="true" />
      </button>

      <div id={bodyId} className={`hsearch__body${open ? " is-open" : ""}`}>
        <div className="hsearch__head">
          <p className="hsearch__title">Find your next car</p>
          {/* The snapshot: what the lot is, in one line, before anyone
              scrolls past the film. */}
          <p className="hsearch__snap">
            {cars.length} on the lot &middot; every one PPSR checked
          </p>
        </div>

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
                <option key={m.value} value={m.value}>
                  {m.value} ({m.count})
                </option>
              ))}
            </select>
          </label>

          <label className="hsearch__field">
            <span className="hsearch__label">Body type</span>
            <select
              className="hsearch__select"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            >
              <option value="">Any body</option>
              {bodies.map((b) => (
                <option key={b.value} value={b.value}>
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
          {/* The count is the label, so the button never promises a page of
              results that is not there. At zero it says so and does not
              link — there is nowhere honest for it to go. */}
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
                setPriceMax("");
              }}
            >
              Clear
            </button>
          )}
        </div>

        {chips.length > 0 && (
          <div className="hsearch__chips">
            {chips.map((c) => (
              <Link
                key={c.label}
                href={`/cars?${new URLSearchParams(c.params)}`}
                className="hsearch__chip"
              >
                {c.label}
                <span className="hsearch__chipn">{c.count}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </search>
  );
}
