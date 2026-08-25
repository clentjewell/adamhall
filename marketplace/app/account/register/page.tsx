import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import RegisterForm from "@/components/account/RegisterForm";

export const metadata: Metadata = {
  title: "Create an account",
  description:
    "Save the cars you like so your shortlist follows you from your phone to your desk.",
  robots: { index: false, follow: false },
};

// A buyer account, not a dealer one. Nothing here touches admin_users, so a
// person who registers can save cars and nothing else — the console is
// structurally out of reach.
export default function RegisterPage() {
  return (
    <div className="page-shell section-y">
      <div className="mx-auto max-w-2xl">
        <h1 className="type-hero">Save the cars you like</h1>
        <p className="type-lead mt-4 max-w-[52ch] text-stone-600">
          An account keeps your shortlist on every device you use, and means we
          can tell you when something you saved drops in price or sells. It
          takes a minute and we only ask for what we need.
        </p>

        <div className="mt-8">
          <RegisterForm />
        </div>

        <Link href="/" className="btn-ghost text-sm mt-6 !px-0">
          <ArrowLeft size={16} weight="bold" />
          Back to the Marketplace
        </Link>
      </div>
    </div>
  );
}
