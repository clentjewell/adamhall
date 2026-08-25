import { permanentRedirect } from "next/navigation";

/**
 * The marketplace lives on the home page now (Adam's direction), so the old
 * index redirects there — permanently, since every old link, bookmark and
 * search result should re-learn the address. The query rides along: a saved
 * filter link like /cars?fuel=Diesel still lands on the same filtered view,
 * because home reads exactly the same parameters (useCarFilters).
 *
 * Only the index moved. /cars/[slug] — the individual car pages — stay where
 * they are: their URLs are in the sitemap, in customer emails and in every
 * card on the site.
 */
export default async function CarsIndexRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (typeof value === "string" && value) q.set(key, value);
  }
  permanentRedirect(`/${q.size ? `?${q}` : ""}`);
}
