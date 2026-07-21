import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import LoginForm from "@/components/admin/LoginForm";

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
        {/* Homepage logo */}
        <img src="/brand/logo.png" alt="Adam Hall — Buy My Car" className="h-10 w-auto mb-2" />
        <p className="text-sm font-semibold text-forest-600 mb-6">DEALER CONSOLE</p>
        {denied && (
          <p className="error-text mb-4" role="alert">
            That account isn&apos;t on the admin list. Talk to Adam if it should be.
          </p>
        )}
        <LoginForm />
        <p className="helper mt-6">
          No public signups here. Accounts are added by Adam only.
        </p>
        <Link href="/" className="btn-ghost text-sm mt-4 !px-0">
          <ArrowLeft size={16} weight="bold" />
          Back to the site
        </Link>
      </div>
    </div>
  );
}
