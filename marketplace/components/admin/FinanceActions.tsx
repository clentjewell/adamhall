"use client";

import { useTransition } from "react";
import { setFinanceEnquiryStatus } from "@/app/actions/finance";
import type { EnquiryStatus } from "@/lib/types";

export default function FinanceActions({
  enquiryId,
  status,
}: {
  enquiryId: string;
  status: EnquiryStatus;
}) {
  const [pending, startTransition] = useTransition();
  const move = (next: EnquiryStatus) =>
    startTransition(async () => {
      await setFinanceEnquiryStatus(enquiryId, next);
    });

  return (
    <div className="flex gap-2">
      {status === "new" && (
        <button onClick={() => move("contacted")} disabled={pending} className="btn-secondary !py-1.5 !px-3 text-xs">
          Mark contacted
        </button>
      )}
      {status !== "closed" && (
        <button onClick={() => move("closed")} disabled={pending} className="btn-ghost !py-1.5 !px-3 text-xs !text-stone-500">
          Close
        </button>
      )}
      {status === "closed" && (
        <button onClick={() => move("new")} disabled={pending} className="btn-ghost !py-1.5 !px-3 text-xs !text-stone-500">
          Reopen
        </button>
      )}
    </div>
  );
}
