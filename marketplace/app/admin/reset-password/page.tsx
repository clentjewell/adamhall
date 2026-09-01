import type { Metadata } from "next";
import ResetPasswordForm from "@/components/admin/ResetPasswordForm";
import BrandLockup from "@/components/BrandLockup";

export const metadata: Metadata = {
  title: "Set a new password",
  robots: { index: false, follow: false },
};

/**
 * Where /auth/confirm sends the visitor once it has exchanged the recovery
 * code for a session.
 *
 * requireAdmin() is deliberately not called: setting your own password is not
 * an admin action, and the allowlist is checked the moment the form redirects
 * on to /admin. Reaching this page without a session is already handled — the
 * middleware bounces it to the login page.
 */
export default function ResetPasswordPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="card p-8 w-full max-w-sm">
        <div className="mb-3">
          <BrandLockup href={null} size="sm" />
        </div>
        <h1 className="type-card-title mb-2">Set a new password</h1>
        <p className="helper mb-6">
          Once it&apos;s saved you&apos;ll go straight to the console.
        </p>
        <ResetPasswordForm />
      </div>
    </div>
  );
}
