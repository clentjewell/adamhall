import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import LoginForm from "@/components/admin/LoginForm";
import BrandLockup from "@/components/BrandLockup";

export const metadata: Metadata = {
  title: "Dealer login",
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: Promise<{ denied?: string }>;
}

export default async function AdminLoginPage({ searchParams }: Props) {
  const { denied } = await searchParams;
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="card p-8 w-full max-w-sm">
        {/* The Car Marketplace lockup, not the parent brand's. This console
            administers the marketplace, so it signs itself with the
            marketplace's own mark. BrandLockup reads lib/brand.ts, which keeps
            the logo path in the one place the identity allows it to live —
            this page previously hard-coded the Adam Hall Buy My Car artwork. */}
        <div className="mb-3">
          <BrandLockup href={null} size="sm" />
        </div>
        <p className="text-sm font-semibold text-forest-600 mb-6">Dealer console</p>
        {denied && (
          <p className="error-text mb-4" role="alert">
            That account isn&apos;t on the admin list. Talk to the site owner if it should be.
          </p>
        )}
        <LoginForm />
        <Link
          href="/admin/forgot-password"
          className="btn-ghost text-sm mt-4 !px-0"
        >
          Forgot your password?
        </Link>
        <p className="helper mt-6">
          No public signups here. Accounts are added by the site owner only.
        </p>
        <Link href="/" className="btn-ghost text-sm mt-4 !px-0">
          <ArrowLeft size={16} weight="bold" />
          Back to the site
        </Link>
      </div>
    </div>
  );
}
