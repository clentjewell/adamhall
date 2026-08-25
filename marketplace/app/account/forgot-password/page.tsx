import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import ForgotPasswordForm from "@/components/account/ForgotPasswordForm";
import BrandLockup from "@/components/BrandLockup";

export const metadata: Metadata = {
  title: "Forgot your password",
  robots: { index: false, follow: false },
};

// The buy side's equivalent of /admin/forgot-password. Buyers previously had
// no way back into an account whose password they had lost — the sign-in form
// offered no route and none existed.
export default function BuyerForgotPasswordPage() {
  return (
    <div className="page-shell section-y">
      <div className="card p-8 w-full max-w-sm mx-auto">
        <div className="mb-3">
          <BrandLockup href={null} size="sm" />
        </div>
        <h1 className="type-card-title mb-2">Forgot your password</h1>
        <p className="helper mb-6">
          Put in the address you signed up with and we&apos;ll send you a link
          to set a new one.
        </p>
        <ForgotPasswordForm />
        <Link href="/" className="btn-ghost text-sm mt-6 !px-0">
          <ArrowLeft size={16} weight="bold" />
          Back to the Marketplace
        </Link>
      </div>
    </div>
  );
}
