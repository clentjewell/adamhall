"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, MagnifyingGlass } from "@phosphor-icons/react";
import { duplicateCar } from "@/app/actions/admin";
import { carTitle, formatKm, formatPrice, timeAgo } from "@/lib/format";
import type { Car, CarStatus } from "@/lib/types";
import StatusBadge from "@/components/admin/StatusBadge";
import CarStatusButtons from "@/components/admin/CarStatusButtons";

const STATUS_ORDER: CarStatus[] = ["published", "draft", "sold", "archived"];

export default function InventoryList({ cars }: { cars: Car[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<CarStatus | "all">("all");
  const [dupPending, startDup] = useTransition();
  const [dupError, setDupError] = useState<string | null>(null);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of cars) map.set(c.status, (map.get(c.status) ?? 0) + 1);
    return map;
  }, [cars]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cars.filter((c) => {
      if (status !== "all" && c.status !== status) return false;
      if (!q) return true;
      return `${c.year} ${c.make} ${c.model} ${c.badge ?? ""} ${c.colour ?? ""}`
        .toLowerCase()
        .includes(q);
    });
  }, [cars, query, status]);

  const duplicate = (id: string) =>
    startDup(async () => {
      setDupError(null);
      const r = await duplicateCar(id);
      if (!r.ok || !r.id) {
        setDupError(r.error ?? "Couldn't duplicate that listing.");
        return;
      }
      router.push(`/admin/inventory/${r.id}`);
    });

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="relative flex-1 min-w-[220px]">
          <MagnifyingGlass
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search make, model, colour…"
            aria-label="Search inventory"
            className="input !pl-9"
          />
        </div>
        <button
          onClick={() => setStatus("all")}
          className={`px-3.5 py-1.5 rounded-full text-sm font-semibold ${status === "all" ? "bg-forest-600 text-white" : "bg-white border border-stone-200 text-stone-600"}`}
        >
          All ({cars.length})
        </button>
        {STATUS_ORDER.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-semibold capitalize ${status === s ? "bg-forest-600 text-white" : "bg-white border border-stone-200 text-stone-600"}`}
          >
            {s} ({counts.get(s) ?? 0})
          </button>
        ))}
      </div>

      {dupError && <p className="error-text mb-3">{dupError}</p>}

      {filtered.length === 0 ? (
        <div className="card p-10 text-center text-stone-500">
          {cars.length === 0
            ? "No listings yet. Create one, or convert an accepted submission."
            : "Nothing matches that search."}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((car) => (
            <div key={car.id} className="card p-4 flex flex-wrap items-center gap-4">
              <Link
                href={`/admin/inventory/${car.id}`}
                className="relative w-24 aspect-[3/2] rounded-lg overflow-hidden bg-stone-100 shrink-0"
              >
                {car.photos[0] && (
                  <Image src={car.photos[0].url} alt="" fill sizes="96px" className="object-cover" />
                )}
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/inventory/${car.id}`}
                  className="font-display font-bold hover:text-forest-700 truncate block"
                >
                  {carTitle(car)}
                </Link>
                <p className="text-sm text-stone-500">
                  {formatPrice(car.price)} · {formatKm(car.odometer_km)} · added {timeAgo(car.created_at)}
                </p>
              </div>
              <StatusBadge status={car.status} />
              <CarStatusButtons carId={car.id} status={car.status} slug={car.slug} />
              <button
                onClick={() => duplicate(car.id)}
                disabled={dupPending}
                title="Duplicate as a new draft"
                className="btn-ghost !py-2 !px-3 text-xs !text-stone-500"
              >
                <Copy size={14} weight="bold" />
                Duplicate
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
