"use client";

import { useEffect } from "react";
import { recordRecentView } from "@/lib/garage";

/**
 * Invisible tracker for the car detail page: records this car as recently
 * viewed on mount. Mount once per detail page (e.g. inside app/cars/[slug]/page.tsx).
 */
export default function RecentViewTracker({ carId }: { carId: string }) {
  useEffect(() => {
    recordRecentView(carId);
  }, [carId]);

  return null;
}
