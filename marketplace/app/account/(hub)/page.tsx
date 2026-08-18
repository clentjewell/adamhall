import type { Metadata } from "next";
import { requireBuyer } from "@/lib/buyer";
import DetailsForm from "@/components/account/DetailsForm";

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// The default panel. Details rather than a menu of tiles: it is the one thing
// on the account that is actually about the person, and it is what they came
// to check or change.
export default async function AccountDetailsPage() {
  const buyer = await requireBuyer("/account");

  return (
    <section>
      <h2 className="type-card-title">Your details</h2>
      <p className="text-sm text-stone-600 mt-1.5 max-w-[52ch]">
        Only what we need to get back to you about a car. Nothing here is
        shared with anyone else.
      </p>
      <div className="mt-6">
        <DetailsForm buyer={buyer} />
      </div>
    </section>
  );
}
