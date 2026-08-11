"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import { Link } from "next-view-transitions";
import { createClient } from "@/lib/supabase/client";
import type { Car, ServiceHistory } from "@/lib/types";
import { carTitle, formatKm, formatPrice } from "@/lib/format";
import { estimateWeekly } from "@/lib/finance";
import { getCompare, toggleCompare, onGarageChange } from "@/lib/garage";

/**
 * Redesigned compare page (artifact frame 1h).
 *
 * The garage itself is unchanged: the list still lives in localStorage via
 * lib/garage, the cars are still fetched with the browser Supabase client,
 * and the loading / failed / empty states are the same ones the current page
 * shows. What changes is how a comparison is read — cells where the cars
 * differ are tinted, and a toggle hides the rows where they agree, so the
 * page answers "what actually separates these?" at a glance.
 */
const SERVICE_HISTORY_LABELS: Record<ServiceHistory, string> = {
  full: "Full",
  partial: "Partial",
  none: "None",
  unknown: "Unknown",
};

const MAX_SLOTS = 3;

interface Row {
  label: string;
  render: (car: Car) => ReactNode;
  /** Compared as a string to decide whether the cars differ on this row. */
  key: (car: Car) => string;
}

export default function ComparePageClientV2() {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [ids, setIds] = useState<string[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [nonce, setNonce] = useState(0);
  const [diffOnly, setDiffOnly] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const compareIds = getCompare().slice(0, MAX_SLOTS);
      setIds(compareIds);
      if (compareIds.length === 0) {
        setCars([]);
        setFailed(false);
        setLoading(false);
        return;
      }
      setLoading(true);
      setFailed(false);
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from("cars").select("*").in("id", compareIds);
        if (cancelled) return;
        if (error) throw new Error(error.message);
        setCars((data ?? []) as Car[]);
      } catch (err) {
        // Never leave the page stuck on the skeleton — surface a retry
        // instead if the fetch rejects (network, config, etc.).
        if (cancelled) return;
        console.error("ComparePageClientV2:", err);
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

  const orderedCars = useMemo(
    () => ids.map((id) => cars.find((c) => c.id === id)).filter((c): c is Car => Boolean(c)),
    [ids, cars],
  );

  const rows: Row[] = useMemo(
    () => [
      {
        label: "Price",
        render: (car) => (car.status === "sold" ? "Sold" : formatPrice(car.price)),
        key: (car) => (car.status === "sold" ? "sold" : String(car.price)),
      },
      {
        label: "Est. weekly*",
        render: (car) => `~${formatPrice(estimateWeekly(car.price))}/wk`,
        key: (car) => String(estimateWeekly(car.price)),
      },
      { label: "Year", render: (car) => String(car.year), key: (car) => String(car.year) },
      {
        label: "Odometer",
        render: (car) => formatKm(car.odometer_km),
        key: (car) => String(car.odometer_km),
      },
      { label: "Body", render: (car) => car.body_type, key: (car) => car.body_type },
      { label: "Transmission", render: (car) => car.transmission, key: (car) => car.transmission },
      { label: "Fuel", render: (car) => car.fuel, key: (car) => car.fuel },
      { label: "Drivetrain", render: (car) => car.drivetrain ?? "—", key: (car) => car.drivetrain ?? "—" },
      {
        label: "Seats",
        render: (car) => (car.seats != null ? String(car.seats) : "—"),
        key: (car) => (car.seats != null ? String(car.seats) : "—"),
      },
      { label: "Colour", render: (car) => car.colour ?? "—", key: (car) => car.colour ?? "—" },
      {
        label: "Service history",
        render: (car) => SERVICE_HISTORY_LABELS[car.service_history],
        key: (car) => car.service_history,
      },
      {
        label: "PPSR",
        render: (car) => (car.ppsr_clear ? "Clear" : "Check required"),
        key: (car) => String(car.ppsr_clear),
      },
    ],
    [],
  );

  const shell = (children: ReactNode) => (
    <div className="ah-site mp-compare2">
      <div className="container container--wide mp2-cmp">{children}</div>
    </div>
  );

  if (loading) {
    return shell(
      <>
        <h1 className="mp2-cmp__title">Compare</h1>
        <div className="mp2-cmp__skeleton">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <div className="skeleton mp2-cmp__skeleton-img" />
              <div className="skeleton mp2-cmp__skeleton-line" />
              <div className="skeleton mp2-cmp__skeleton-line is-short" />
            </div>
          ))}
        </div>
      </>,
    );
  }

  if (failed) {
    return shell(
      <>
        <h1 className="mp2-cmp__title">Compare</h1>
        <div className="mp2-empty">
          <p className="mp2-empty__title">Couldn&apos;t load these cars</p>
          <p className="mp2-empty__body">
            Something went wrong reaching our cars just now. Check your
            connection and try again.
          </p>
          <button
            type="button"
            onClick={() => setNonce((n) => n + 1)}
            className="btn btn--green"
          >
            Try again
          </button>
        </div>
      </>,
    );
  }

  if (orderedCars.length === 0) {
    return shell(
      <>
        <h1 className="mp2-cmp__title">Compare</h1>
        <div className="mp2-empty">
          <p className="mp2-empty__title">Nothing to compare yet</p>
          <p className="mp2-empty__body">
            Tap the scales icon on any car to add it here. Pick up to three to
            line them up side by side.
          </p>
          <Link href="/cars2" className="btn btn--tan">
            Browse cars
          </Link>
        </div>
      </>,
    );
  }

  const multiple = orderedCars.length > 1;
  // A row "differs" when the cars do not all share the same value. With one
  // car there is nothing to differ from, so nothing is tinted.
  const differs = (row: Row) =>
    multiple && new Set(orderedCars.map(row.key)).size > 1;
  const visibleRows = diffOnly ? rows.filter(differs) : rows;
  const cols = `180px repeat(${orderedCars.length}, minmax(0, 1fr))`;

  return shell(
    <>
      <div className="mp2-cmp__head">
        <div>
          <p className="eyebrow">
            {orderedCars.length} of {MAX_SLOTS} slots used
          </p>
          <h1 className="mp2-cmp__title">Compare</h1>
        </div>
        <div className="mp2-cmp__tools">
          <label className="mp2-cmp__toggle">
            <input
              type="checkbox"
              checked={diffOnly}
              onChange={(e) => setDiffOnly(e.target.checked)}
              disabled={!multiple}
            />
            Only show differences
          </label>
          <button
            type="button"
            className="mp2-clear"
            onClick={() => orderedCars.forEach((c) => toggleCompare(c.id))}
          >
            Clear all
          </button>
        </div>
      </div>

      <div className="mp2-cmp__scroll">
        <div className="mp2-cmp__table">
          {/* Header: the cars themselves */}
          <div className="mp2-cmp__row mp2-cmp__row--head" style={{ gridTemplateColumns: cols }}>
            <div className="mp2-cmp__corner" />
            {orderedCars.map((car) => (
              <div key={car.id} className="mp2-cmp__car">
                <button
                  type="button"
                  onClick={() => toggleCompare(car.id)}
                  aria-label={`Remove ${carTitle(car)} from compare`}
                  className="mp2-cmp__remove"
                >
                  ✕
                </button>
                <Link href={`/cars2/${car.slug}`} className="mp2-cmp__carlink">
                  <div className="mp2-cmp__photo">
                    {car.photos[0] ? (
                      <Image
                        src={car.photos[0].url}
                        alt={car.photos[0].alt ?? carTitle(car)}
                        fill
                        sizes="240px"
                        className="mp2-cmp__img"
                      />
                    ) : (
                      <span className="mp2-lcard__nophoto">Photos coming</span>
                    )}
                  </div>
                  <h2 className="mp2-cmp__name">{carTitle(car)}</h2>
                </Link>
                <p className="mp2-cmp__price">
                  {car.status === "sold" ? "Sold" : formatPrice(car.price)}
                </p>
              </div>
            ))}
          </div>

          {visibleRows.map((row) => {
            const tinted = differs(row);
            return (
              <div
                key={row.label}
                className="mp2-cmp__row"
                style={{ gridTemplateColumns: cols }}
              >
                <div className="mp2-cmp__label">{row.label}</div>
                {orderedCars.map((car) => (
                  <div
                    key={car.id}
                    className={`mp2-cmp__cell${tinted ? " is-diff" : ""}`}
                  >
                    {row.render(car)}
                  </div>
                ))}
              </div>
            );
          })}

          {visibleRows.length === 0 && (
            <div className="mp2-cmp__same">
              These cars match on every line compared here.
            </div>
          )}

          {/* Footer: one action per car */}
          <div className="mp2-cmp__row mp2-cmp__row--foot" style={{ gridTemplateColumns: cols }}>
            <div className="mp2-cmp__corner" />
            {orderedCars.map((car, i) => (
              <div key={car.id} className="mp2-cmp__action">
                <Link
                  href={`/cars2/${car.slug}`}
                  className={`btn ${i === 0 ? "btn--green" : "btn--outline-green"}`}
                >
                  Enquire
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="mp2-cmp__legend">
        <span className="mp2-cmp__swatch" aria-hidden="true" />
        Highlighted cells are where these cars differ. *Estimated repayment
        only — 10% deposit, 60-month term, 9.5% p.a. Actual finance terms
        depend on lender and approval.
      </p>
    </>,
  );
}
