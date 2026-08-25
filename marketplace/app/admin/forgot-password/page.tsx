import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import ForgotPasswordForm from "@/components/admin/ForgotPasswordForm";
import BrandLockup from "@/components/BrandLockup";

export const metadata: Metadata = {
  title: "Reset your password",
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: Promise<{ expired?: string }>;
}

export default async function ForgotPasswordPage({ searchParams }: Props) {
  const { expired } = await searchParams;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="card p-8 w-full max-w-sm">
        <div className="mb-3">
          <BrandLockup href={null} size="sm" />
        </div>
        <h1 className="type-card-title mb-2">Reset your password</h1>
        <p className="helper mb-6">
          We&apos;ll email you a link to set a new one.
        </p>
        {expired && (
          <p className="error-text mb-4" role="alert">
            That link had already been used or had run out. Here&apos;s a fresh
            one.
          </p>
        )}
        <ForgotPasswordForm />
        <Link href="/admin/login" className="btn-ghost text-sm mt-6 !px-0">
          <ArrowLeft size={16} weight="bold" />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
