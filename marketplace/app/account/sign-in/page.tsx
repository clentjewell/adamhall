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
  searchParams: Promise<{ expired?: string }>;
}

export default async function SignInPage({ searchParams }: Props) {
  const { expired } = await searchParams;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="card p-8 w-full max-w-sm">
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
        <SignInForm />
        <Link href="/cars" className="btn-ghost text-sm mt-6 !px-0">
          <ArrowLeft size={16} weight="bold" />
          Back to the Marketplace
        </Link>
      </div>
    </div>
  );
}
