"use client";

import Image from "next/image";
import { useEffect, useId, useMemo, useState } from "react";
import { Link } from "next-view-transitions";
import { applyFilters, type Filterable } from "@/lib/filters";
import "@/components/site/HeroSearch.css";

/**
 * The search panel in the home hero, and the marketplace's snapshot of itself.
 *
 * Modelled on the pattern every Australian car buyer already knows — a panel
 * floating on the hero, tiles of the body types with a photograph in each, a
 * live "show N cars" button — but built for this lot rather than copied from a
 * site with two hundred thousand cars on it.
 *
 * That difference decides the whole design. On a national classifieds site the
 * dropdowns are a way through a haystack, and it does not matter that most
 * combinations return nothing, because something always remains. On a lot of
 * six the same controls would mostly return one car or none, and a search
 * that dead-ends makes a curated range look empty rather than chosen.
 *
 * So every option here is DERIVED FROM STOCK and carries its own count. If a
 * make is not on the lot it is not in the list; if a price step would return
 * nothing it is not offered; a type tile that the other choices have ruled out
 * goes flat and stops responding rather than promising cars it cannot deliver.
 *
 * The tiles are the reason the panel is worth looking at, and they are REAL
 * CARS — the lead photograph of a car of that type currently on the lot, not a
 * stock silhouette. A dealer with six cars has one advantage over carsales
 * here and it is exactly this: the categories can be photographs of the actual
 * stock, so the tile row IS the snapshot Adam asked for. It also means the
 * tiles change as the lot does, with no artwork to maintain.
 *
 * The tiles select rather than navigate. Everything else in the panel counts
 * live, and a tile that jumped straight to /cars would be a second mechanism
 * competing with the first — pick a type, watch the number on the button move,
 * go when it says what you want. There is no body-type dropdown because the
 * tiles are it.
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

/** The fields filtering reads, plus the one photograph the tiles need. The
    panel runs in the browser, so what it is given is what the page ships —
    see the projection in app/page.tsx. */
export type HeroSearchCar = Filterable & { photo: string | null };

/** Price ceilings offered, coarsest first. Only those that would actually
    return something are shown, so the ladder shortens with the lot. */
const PRICE_CEILINGS = [25000, 35000, 50000, 75000];

const money = (n: number) =>
  n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n.toLocaleString("en-AU")}`;

export default function HeroSearch({ cars }: { cars: HeroSearchCar[] }) {
  const [make, setMake] = useState("");
  const [body, setBody] = useState("");
  const [priceMax, setPriceMax] = useState("");
  /** Phone only: the card collapses to its own head so it cannot push the
      hero's words off a pinned screen. Desktop ignores this entirely — the
      body is shown by the stylesheet and the toggle is not rendered to the
      accessibility tree at all. */
  const [open, setOpen] = useState(false);
  /** Whether the card is in its collapsing range at all. The head is a real
      button there and an inert heading above it: a control that reports
      aria-expanded while the stylesheet keeps the body open regardless would
      be lying to anyone not looking at it. Starts false so the server and the
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

  const ceilings = useMemo(
    () =>
      PRICE_CEILINGS.map((p) => ({ value: p, count: countWith({ priceMax: p }) }))
        // A ceiling that catches everything left is the same as no ceiling,
        // and one that catches nothing is a dead end. Neither is offered.
        .filter((p) => p.count > 0 && p.count < cars.length),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cars, selection],
  );

  /** One tile per body type on the lot, biggest group first, each carrying the
      lead photograph of a car of that type. `total` is the size of the group
      and never moves — it is what the tile is advertising. `count` is what is
      left of it under the current make and price, and is what decides whether
      the tile still leads anywhere. */
  const types = useMemo(() => {
    const names = [...new Set(cars.map((c) => c.body_type).filter(Boolean))];
    return names
      .map((name) => {
        const group = cars.filter((c) => c.body_type === name);
        return {
          name,
          total: group.length,
          count: countWith({ body: name }),
          photo: group.find((c) => c.photo)?.photo ?? null,
        };
      })
      .sort((a, z) => z.total - a.total || a.name.localeCompare(z.name));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cars, selection]);

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
      {/* The head is the card's cap on a wide screen and its whole collapsed
          state on a phone, which is why the count lives in it: closed, it is
          the only thing there is to read. */}
      {(() => {
        const inside = (
          <>
            <span className="hsearch__headtext">
              <span className="hsearch__title">Find your next car</span>
              <span className="hsearch__snap">
                {cars.length} on the lot &middot; every one PPSR checked
              </span>
            </span>
            <span className="hsearch__headcount">
              {matches} car{matches === 1 ? "" : "s"}
            </span>
            <span className="hsearch__chev" aria-hidden="true" />
          </>
        );
        return narrow ? (
          <button
            type="button"
            className="hsearch__head"
            aria-expanded={open}
            aria-controls={bodyId}
            onClick={() => setOpen((v) => !v)}
          >
            {inside}
          </button>
        ) : (
          <p className="hsearch__head">{inside}</p>
        );
      })()}

      <div id={bodyId} className={`hsearch__body${open ? " is-open" : ""}`}>
        {/* Only worth showing when there is more than one type to choose
            between: a single tile is a label, not a choice. */}
        {types.length > 1 && (
          <div className="hsearch__types">
            <p className="hsearch__label">Browse by type</p>
            <div className="hsearch__tiles">
              {types.map((t) => {
                const on = body === t.name;
                const dead = t.count === 0 && !on;
                return (
                  <button
                    key={t.name}
                    type="button"
                    className={`hsearch__tile${on ? " is-on" : ""}${dead ? " is-dead" : ""}`}
                    aria-pressed={on}
                    disabled={dead}
                    onClick={() => setBody(on ? "" : t.name)}
                  >
                    <span className="hsearch__tileimg">
                      {t.photo ? (
                        <Image
                          src={t.photo}
                          // Decorative: the type is named in text beside it,
                          // and the car in the photograph is an example of the
                          // type rather than the thing being chosen.
                          alt=""
                          fill
                          sizes="180px"
                          className="hsearch__tilephoto"
                        />
                      ) : null}
                    </span>
                    <span className="hsearch__tileline">
                      <span className="hsearch__tilename">{t.name}</span>
                      {/* Always what is actually there under the current
                          choices — which with nothing chosen is the whole
                          group. A tile that kept advertising three while a
                          make had cut it to one would be the panel's one
                          lie. */}
                      <span className="hsearch__tilen">{t.count}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

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
      </div>
    </search>
  );
}
