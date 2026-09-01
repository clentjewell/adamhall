import type { Metadata } from "next";
import { requireBuyer } from "@/lib/buyer";
import PasswordForm from "@/components/account/PasswordForm";

export const metadata: Metadata = {
  title: "Change your password",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AccountPasswordPage() {
  // The layout already guards every tab. Repeated here because the session is
  // what authorises a password change, and that is not a check to leave to a
  // parent file somebody might refactor later.
  await requireBuyer("/account/password");

  return (
    <section>
      <h2 className="type-card-title">Change your password</h2>
      <p className="text-sm text-stone-600 mt-1.5 max-w-[52ch]">
        Being signed in is what lets you set a new one, so there is no old
        password to type in here.
      </p>
      <div className="mt-6 max-w-md">
        <PasswordForm />
      </div>
    </section>
  );
}
