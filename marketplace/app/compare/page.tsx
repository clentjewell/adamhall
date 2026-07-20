import type { Metadata } from "next";
import ComparePageClient from "@/components/garage/ComparePageClient";

export const metadata: Metadata = {
  title: "Compare cars",
  robots: { index: false, follow: false },
};

// Guest-first compare list lives entirely in localStorage, so this shell
// just hands off to the client component that reads it and fetches the cars.
export default function ComparePage() {
  return <ComparePageClient />;
}
