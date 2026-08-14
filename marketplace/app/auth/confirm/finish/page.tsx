import type { Metadata } from "next";
import { Suspense } from "react";
import ConfirmFinish from "@/components/account/ConfirmFinish";

export const metadata: Metadata = {
  title: "Confirming your account",
  robots: { index: false, follow: false },
};

// Nobody navigates here on purpose — /auth/confirm sends people through when
// the session came back in the URL fragment, which only a browser can read.
export default function ConfirmFinishPage() {
  return (
    <div className="page-shell section-y">
      <div className="mx-auto max-w-2xl">
        <Suspense fallback={<p className="type-lead text-stone-600">Confirming your account…</p>}>
          <ConfirmFinish />
        </Suspense>
      </div>
    </div>
  );
}
