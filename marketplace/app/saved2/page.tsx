import type { Metadata } from "next";
import { fetchPublicCars } from "@/lib/cars";
import SavedPageClientV2 from "@/components/site/SavedPageClientV2";
import WatchlistForm from "@/components/WatchlistForm";

export const metadata: Metadata = {
  title: "Saved cars",
  robots: { index: false, follow: false },
};

export const revalidate = 60;

/**
 * Redesigned saved page (route: /saved2), built to the "Carmarketplace UI
 * mockups" artifact, frame 1i.
 *
 * The saved list is guest-first and lives entirely in localStorage, so the
 * page itself is a shell — the same arrangement as /saved. The one server-side
 * job is fetching the make list for the watchlist form, which is the real
 * form with its real server action rather than the artifact's bare email box.
 */
export default async function Saved2Page() {
  const cars = await fetchPublicCars();
  const makes = [...new Set(cars.map((c) => c.make))].sort();

  return (
    <SavedPageClientV2
      basePath="/cars2"
      watchPanel={<WatchlistForm makes={makes} />}
    />
  );
}
