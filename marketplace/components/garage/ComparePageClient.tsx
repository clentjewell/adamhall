"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import type { Car, ServiceHistory } from "@/lib/types";
import { carTitle, formatKm, formatPrice } from "@/lib/format";
import { getCompare, toggleCompare, onGarageChange } from "@/lib/garage";

const SERVICE_HISTORY_LABELS: Record<ServiceHistory, string> = {
  full: "Full",
  partial: "Partial",
  none: "None",
  unknown: "Unknown",
};

// Rough guide only, not a finance offer: 10% deposit, 60-month term,
// 9.5% p.a. reducing rate, converted from a monthly amortised payment to a
// weekly figure. Local to this page — nowhere else needs this maths.
function estimateWeeklyRepayment(price: number): number {
  const principal = price * 0.9;
  const monthlyRate = 0.095 / 12;
  const months = 60;
  const factor = Math.pow(1 + monthlyRate, months);
  const monthlyPayment = (principal * monthlyRate * factor) / (factor - 1);
  return (monthlyPayment * 12) / 52;
}

interface Row {
  label: string;
  render: (car: Car) => ReactNode;
  highlight?: (car: Car) => boolean;
}

export default function ComparePageClient() {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [ids, setIds] = useState<string[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const compareIds = getCompare().slice(0, 3);
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
        console.error("ComparePageClient:", err);
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

  const orderedCars = ids
    .map((id) => cars.find((c) => c.id === id))
    .filter((c): c is Car => Boolean(c));

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="font-display font-bold text-3xl mb-8">Compare cars</h1>
        <div className="grid gap-6 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="skeleton aspect-[3/2]" />
              <div className="skeleton h-5 w-3/4" />
              <div className="skeleton h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (failed) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="font-display font-bold text-3xl mb-8">Compare cars</h1>
        <div className="card p-10 text-center">
          <p className="font-display font-bold text-lg">Couldn&apos;t load these cars</p>
          <p className="text-stone-600 mt-2 max-w-[46ch] mx-auto">
            Something went wrong reaching our cars just now. Check your
            connection and try again.
          </p>
          <button
            type="button"
            onClick={() => setNonce((n) => n + 1)}
            className="btn-primary mt-5 inline-flex"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (orderedCars.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="font-display font-bold text-3xl mb-8">Compare cars</h1>
        <div className="card p-10 text-center">
          <p className="font-display font-bold text-lg">Nothing to compare yet</p>
          <p className="text-stone-600 mt-2 max-w-[46ch] mx-auto">
            Tap the scales icon on any car to add it here — pick up to three
            to line them up side by side.
          </p>
          <Link href="/cars" className="btn-cta mt-5 inline-flex">
            Browse cars
          </Link>
        </div>
      </div>
    );
  }

  const multiple = orderedCars.length > 1;
  const lowestPrice = Math.min(...orderedCars.map((c) => c.price));
  const lowestKm = Math.min(...orderedCars.map((c) => c.odometer_km));
  const newestYear = Math.max(...orderedCars.map((c) => c.year));

  const rows: Row[] = [
    {
      label: "Price",
      render: (car) => (car.status === "sold" ? "Sold" : formatPrice(car.price)),
      highlight: (car) => multiple && car.price === lowestPrice,
    },
    {
      label: "Est. weekly repayment*",
      render: (car) => `~${formatPrice(Math.round(estimateWeeklyRepayment(car.price)))}/wk`,
    },
    {
      label: "Year",
      render: (car) => String(car.year),
      highlight: (car) => multiple && car.year === newestYear,
    },
    {
      label: "Odometer",
      render: (car) => formatKm(car.odometer_km),
      highlight: (car) => multiple && car.odometer_km === lowestKm,
    },
    { label: "Body", render: (car) => car.body_type },
    { label: "Transmission", render: (car) => car.transmission },
    { label: "Fuel", render: (car) => car.fuel },
    { label: "Drivetrain", render: (car) => car.drivetrain ?? "—" },
    { label: "Seats", render: (car) => (car.seats != null ? String(car.seats) : "—") },
    { label: "Colour", render: (car) => car.colour ?? "—" },
    { label: "Service history", render: (car) => SERVICE_HISTORY_LABELS[car.service_history] },
    { label: "PPSR", render: (car) => (car.ppsr_clear ? "Clear ✓" : "Check required") },
    { label: "Location", render: () => "Northern NSW" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="font-display font-bold text-3xl mb-2">Compare cars</h1>
      <p className="text-stone-500 mb-8">
        {multiple
          ? `Comparing ${orderedCars.length} cars.`
          : "Add up to two more cars to compare side by side."}
      </p>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[560px]">
          <thead>
            <tr>
              <th className="sticky left-0 bg-paper z-10 w-32" />
              {orderedCars.map((car) => (
                <th key={car.id} className="align-bottom p-3 min-w-[200px] text-left font-normal">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => toggleCompare(car.id)}
                      aria-label={`Remove ${carTitle(car)} from compare`}
                      className="absolute top-2 right-2 z-10 rounded-full bg-white/90 backdrop-blur p-1.5 shadow"
                    >
                      <X size={14} weight="bold" />
                    </button>
                    <div className="relative aspect-[3/2] rounded-xl overflow-hidden bg-stone-200">
                      {car.photos[0] ? (
                        <Image
                          src={car.photos[0].url}
                          alt={car.photos[0].alt ?? carTitle(car)}
                          fill
                          sizes="220px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-stone-400 text-xs">
                          Photos coming
                        </div>
                      )}
                    </div>
                    <Link
                      href={`/cars/${car.slug}`}
                      className="block mt-2 font-display font-bold text-ink hover:text-forest-700 transition-colors leading-snug"
                    >
                      {carTitle(car)}
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-stone-200">
                <th className="sticky left-0 bg-paper z-10 text-left align-top p-3 w-32 text-sm font-semibold text-stone-500">
                  {row.label}
                </th>
                {orderedCars.map((car) => {
                  const best = row.highlight?.(car) ?? false;
                  return (
                    <td
                      key={car.id}
                      className={`p-3 align-top min-w-[200px] ${best ? "text-forest-700 font-bold" : "text-ink"}`}
                    >
                      {row.render(car)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="helper mt-4">
        *Estimated repayment only — 10% deposit, 60-month term, 9.5% p.a.
        Actual finance terms depend on lender and approval.
      </p>
    </div>
  );
}
