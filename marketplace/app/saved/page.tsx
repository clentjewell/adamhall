import type { Metadata } from "next";
import SavedPageClient from "@/components/garage/SavedPageClient";
import AccountPrompt from "@/components/account/AccountPrompt";

export const metadata: Metadata = {
  title: "Saved cars",
  robots: { index: false, follow: false },
};

// Guest-first saved list lives entirely in localStorage, so this shell just
// hands off to the client component that reads it and fetches the cars.
export default function SavedPage() {
  return (
    <>
      <SavedPageClient />
      <div className="page-shell pb-[var(--rhythm-section)]">
        <AccountPrompt />
      </div>
    </>
  );
}
