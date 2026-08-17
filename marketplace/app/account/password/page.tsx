import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { requireBuyer } from "@/lib/buyer";
import PasswordForm from "@/components/account/PasswordForm";

export const metadata: Metadata = {
  title: "Change your password",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AccountPasswordPage() {
  // The session is what authorises the change, so the page must not render
  // for anyone without one.
  await requireBuyer("/account/password");

  return (
    <div className="page-shell section-y">
      <div className="mx-auto max-w-xl">
        <Link href="/account" className="btn-ghost text-sm -ml-3 mb-3">
          <ArrowLeft size={16} weight="bold" />
          Your account
        </Link>
        <h1 className="type-hero">Change your password</h1>
        <p className="type-lead mt-3 text-stone-600">
          Being signed in is what lets you set a new one, so there is no old
          password to type in here.
        </p>
        <div className="mt-8">
          <PasswordForm />
        </div>
      </div>
    </div>
  );
}
