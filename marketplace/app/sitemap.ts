import type { MetadataRoute } from "next";
import { fetchPublicCars } from "@/lib/cars";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const cars = await fetchPublicCars();

  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/cars`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/sell`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/finance`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/faq`, changeFrequency: "monthly", priority: 0.4 },
    ...cars.map((c) => ({
      url: `${base}/cars/${c.slug}`,
      lastModified: new Date(c.updated_at),
      changeFrequency: "weekly" as const,
      priority: c.status === "published" ? 0.8 : 0.3,
    })),
  ];
}
