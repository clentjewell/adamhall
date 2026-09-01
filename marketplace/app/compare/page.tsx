import type { Metadata } from "next";
import ComparePageClientV2 from "@/components/site/ComparePageClientV2";

export const metadata: Metadata = {
  title: "Compare cars",
  robots: { index: false, follow: false },
};

/**
 * The compare page (route: /compare), built to the "Carmarketplace UI
 * mockups" artifact, frame 1h.
 *
 * Guest-first compare list still lives entirely in localStorage, so this shell
 * just hands off to the client component that reads it and fetches the cars —
 * the same arrangement as /compare.
 */
export default function Compare2Page() {
  return <ComparePageClientV2 />;
}
