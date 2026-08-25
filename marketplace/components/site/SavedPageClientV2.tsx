"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { Link } from "next-view-transitions";
import { createClient } from "@/lib/supabase/client";
import type { Car } from "@/lib/types";
import { carTitle, formatDate, formatPrice } from "@/lib/format";
import { getRecent, getSaved, toggleSaved, onGarageChange } from "@/lib/garage";

/**
 * Redesigned saved page (artifact frame 1i).
 *
 * The garage is unchanged: the list still lives in localStorage via
 * lib/garage, the cars still come from the browser Supabase client, and the
 * recently-viewed strip is kept. What changes is the reading — saved cars sit
 * in a grid with a dashed "room for more" slot at the end, and a sold car
 * says plainly that it has gone rather than just dimming.
 */
export default function SavedPageClientV2({
  watchPanel,
  basePath = "/cars",
}: {
  watchPanel?: ReactNode;
  basePath?: string;
}) {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const saved = getSaved();
      const recent = getRecent();
      setSavedIds(saved);
      setRecentIds(recent);

      const ids = [...new Set([...saved, ...recent])];
      if (ids.length === 0) {
        setCars([]);
        setFailed(false);
        setLoading(false);
        return;
      }

      setLoading(true);
      setFailed(false);
      try {
        const supabase = createClient();
        // RLS restricts anon reads to published + recently sold cars, so a
        // stale saved id for a since-removed car just drops out here.
        const { data, error } = await supabase.from("cars").select("*").in("id", ids);
        if (cancelled) return;
        if (error) throw new Error(error.message);
        setCars((data ?? []) as Car[]);
      } catch (err) {
        if (cancelled) return;
        console.error("SavedPageClientV2:", err);
        setCars([]);
        setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const unsubscribe = onGarageChange(load);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [nonce]);

  const savedCars = savedIds
    .map((id) => cars.find((c) => c.id === id))
    .filter((c): c is Car => Boolean(c));
  const recentCars = recentIds
    .map((id) => cars.find((c) => c.id === id))
    .filter((c): c is Car => Boolean(c));

  return (
    <div className="ah-site mp-saved2">
      <div className="container container--wide mp2-saved">
        <p className="eyebrow">Kept on this device &mdash; no account needed</p>
        <h1 className="mp2-saved__title">Saved cars</h1>

        {loading ? (
          <div className="mp2-saved__grid">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <div className="skeleton mp2-saved__skeleton-img" />
                <div className="skeleton mp2-saved__skeleton-line" />
                <div className="skeleton mp2-saved__skeleton-line is-short" />
              </div>
            ))}
          </div>
        ) : failed ? (
          <div className="mp2-empty">
            <p className="mp2-empty__title">Couldn&apos;t load your saved cars</p>
            <p className="mp2-empty__body">
              Something went wrong reaching our cars just now. Your list is safe
              on this device &mdash; check your connection and try again.
            </p>
            <button
              type="button"
              onClick={() => setNonce((n) => n + 1)}
              className="btn btn--green"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="mp2-saved__grid">
            {savedCars.map((car) => {
              const sold = car.status === "sold";
              return (
                <div key={car.id} className={`mp2-scard${sold ? " is-sold" : ""}`}>
                  <Link href={`${basePath}/${car.slug}`} className="mp2-scard__link">
                    <div className="mp2-scard__media">
                      {car.photos[0] ? (
                        <Image
                          src={car.photos[0].url}
                          alt={car.photos[0].alt ?? carTitle(car)}
                          fill
                          sizes="(max-width: 639px) 100vw, 33vw"
                          className="mp2-scard__img"
                        />
                      ) : (
                        <span className="mp2-lcard__nophoto">Photos coming</span>
                      )}
                      {sold && <span className="mp2-scard__sold">SOLD</span>}
                    </div>
                    <div className="mp2-scard__body">
                      <h2 className="mp2-scard__title">{carTitle(car)}</h2>
                      <p className={`mp2-scard__price${sold ? " is-sold" : ""}`}>
                        {sold ? "Sold" : formatPrice(car.price)}
                      </p>
                      {sold ? (
                        <p className="mp2-scard__note is-sold">
                          Sold {car.sold_at ? formatDate(car.sold_at) : ""} &mdash;
                          want one like it? Set a watch below.
                        </p>
                      ) : (
                        <p className="mp2-scard__note">Still available</p>
                      )}
                    </div>
                  </Link>
                  {/* The heart is filled here: everything on this page is
                      already saved, so the control is "remove", not "save". */}
                  <button
                    type="button"
                    onClick={() => toggleSaved(car.id)}
                    aria-label={`Remove ${carTitle(car)} from saved cars`}
                    className="mp2-scard__heart"
                  >
                    ♥
                  </button>
                </div>
              );
            })}

            {/* The artifact's dashed slot. It doubles as the empty state, so
                a first-time visitor is told what the page is for rather than
                shown a blank grid. */}
            <div className="mp2-slot">
              <p className="mp2-slot__icon" aria-hidden="true">♡</p>
              <p className="mp2-slot__title">
                {savedCars.length === 0 ? "Nothing saved yet" : "Room for more"}
              </p>
              <p className="mp2-slot__body">
                Tap the heart on any listing and it turns up here. Nothing to
                sign up for.
              </p>
              <Link href={basePath} className="btn btn--outline-green">
                Browse cars
              </Link>
            </div>
          </div>
        )}

        {watchPanel && (
          <div className="mp2-saved__watch">
            <div className="mp2-saved__watch-intro">
              <h2 className="mp2-saved__watch-title">Saved cars move fast</h2>
              <p>
                Tell us what you&rsquo;re after and we&rsquo;ll email you the
                moment a matching car lands.
              </p>
            </div>
            {watchPanel}
          </div>
        )}

        {(loading || recentCars.length > 0) && (
          <section className="mp2-recent">
            <h2 className="mp2-recent__title">Recently viewed</h2>
            <div className="mp2-recent__strip">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="mp2-recent__item">
                      <div className="skeleton mp2-recent__img" />
                      <div className="skeleton mp2-saved__skeleton-line" />
                    </div>
                  ))
                : recentCars.map((car) => (
                    <Link
                      key={car.id}
                      href={`${basePath}/${car.slug}`}
                      className="mp2-recent__item"
                    >
                      <div className="mp2-recent__img">
                        {car.photos[0] ? (
                          <Image
                            src={car.photos[0].url}
                            alt={car.photos[0].alt ?? carTitle(car)}
                            fill
                            sizes="176px"
                            className="mp2-scard__img"
                          />
                        ) : (
                          <span className="mp2-lcard__nophoto">Photos coming</span>
                        )}
                      </div>
                      <p className="mp2-recent__name">{carTitle(car)}</p>
                      <p className="mp2-recent__price">
                        {car.status === "sold" ? "Sold" : formatPrice(car.price)}
                      </p>
                    </Link>
                  ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
