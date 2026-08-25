import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import SignInForm from "@/components/account/SignInForm";
import BrandLockup from "@/components/BrandLockup";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: Promise<{ expired?: string; next?: string }>;
}

export default async function SignInPage({ searchParams }: Props) {
  const { expired, next } = await searchParams;

  return (
    // page-shell + section-y, the same wrapper the register and confirm pages
    // use, so the card sits in the site's vertical rhythm. It previously
    // centred inside min-h-[70vh] with no padding of its own, which left it
    // pinned against the header and footer on a short viewport.
    <div className="page-shell section-y">
      <div className="card p-8 w-full max-w-sm mx-auto">
        <div className="mb-3">
          <BrandLockup href={null} size="sm" />
        </div>
        <h1 className="type-card-title mb-2">Sign in</h1>
        <p className="helper mb-6">
          Pick your shortlist back up where you left it.
        </p>
        {expired && (
          <p className="error-text mb-4" role="alert">
            That confirmation link had already been used. Sign in below, and
            if the address still needs confirming we&apos;ll send a new one.
          </p>
        )}
        <SignInForm next={next} />
        <Link href="/" className="btn-ghost text-sm mt-6 !px-0">
          <ArrowLeft size={16} weight="bold" />
          Back to the Marketplace
        </Link>
      </div>
    </div>
  );
}
