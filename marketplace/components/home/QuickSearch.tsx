"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlass } from "@phosphor-icons/react";

// Compact search bar for the home hero. Pushes straight to /cars with the
// same query params CarsBrowser reads (make, body, priceMax), so results
// are already filtered when the page lands.
const priceSteps = [15000, 25000, 35000, 50000, 80000];

export default function QuickSearch({
  makes,
  bodies,
}: {
  makes: string[];
  bodies: string[];
}) {
  const router = useRouter();
  const [make, setMake] = useState("");
  const [body, setBody] = useState("");
  const [priceMax, setPriceMax] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (make) params.set("make", make);
    if (body) params.set("body", body);
    if (priceMax) params.set("priceMax", priceMax);
    router.push(`/cars${params.size ? `?${params}` : ""}`);
  };

  return (
    <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-3 flex flex-col sm:flex-row gap-2.5">
      <div className="flex-1">
        <label htmlFor="qs-make" className="sr-only">Make</label>
        <select
          id="qs-make"
          className="w-full bg-white/90 rounded-lg text-sm px-3.5 py-2.5 text-ink focus:outline-none focus:ring-2 focus:ring-white/70"
          value={make}
          onChange={(e) => setMake(e.target.value)}
        >
          <option value="">Any make</option>
          {makes.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
      <div className="flex-1">
        <label htmlFor="qs-body" className="sr-only">Body type</label>
        <select
          id="qs-body"
          className="w-full bg-white/90 rounded-lg text-sm px-3.5 py-2.5 text-ink focus:outline-none focus:ring-2 focus:ring-white/70"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        >
          <option value="">Any body type</option>
          {bodies.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>
      <div className="flex-1">
        <label htmlFor="qs-price" className="sr-only">Max price</label>
        <select
          id="qs-price"
          className="w-full bg-white/90 rounded-lg text-sm px-3.5 py-2.5 text-ink focus:outline-none focus:ring-2 focus:ring-white/70"
          value={priceMax}
          onChange={(e) => setPriceMax(e.target.value)}
        >
          <option value="">Any price</option>
          {priceSteps.map((p) => (
            <option key={p} value={p}>Under ${(p / 1000).toFixed(0)}k</option>
          ))}
        </select>
      </div>
      <button
        type="button"
        onClick={handleSearch}
        className="btn bg-white text-forest-800 hover:bg-forest-50 px-6 py-2.5 shrink-0"
      >
        <MagnifyingGlass size={18} weight="bold" />
        Search cars
      </button>
    </div>
  );
}
