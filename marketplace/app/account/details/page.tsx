import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { requireBuyer } from "@/lib/buyer";
import DetailsForm from "@/components/account/DetailsForm";

export const metadata: Metadata = {
  title: "Your details",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AccountDetailsPage() {
  const buyer = await requireBuyer("/account/details");

  return (
    <div className="page-shell section-y">
      <div className="mx-auto max-w-xl">
        <Link href="/account" className="btn-ghost text-sm -ml-3 mb-3">
          <ArrowLeft size={16} weight="bold" />
          Your account
        </Link>
        <h1 className="type-hero">Your details</h1>
        <p className="type-lead mt-3 text-stone-600">
          Only what we need to get back to you about a car. Nothing here is
          shared with anyone else.
        </p>
        <div className="mt-8">
          <DetailsForm buyer={buyer} />
        </div>
      </div>
    </div>
  );
}
