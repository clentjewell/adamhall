"use client";

import { useActionState, useState, useTransition } from "react";
import {
  declineSubmission,
  sendOffer,
  setSubmissionStatus,
  type AdminActionState,
} from "@/app/actions/admin";
import type { Submission } from "@/lib/types";
import { formatPrice } from "@/lib/format";

const initial: AdminActionState = { ok: false };

export default function PipelinePanel({
  submission,
  offerDefault,
}: {
  submission: Submission;
  offerDefault: number | null;
}) {
  const [movePending, startMove] = useTransition();
  const [moveError, setMoveError] = useState<string | null>(null);
  const [offerState, offerAction, offerPending] = useActionState(sendOffer, initial);
  const [declineState, declineAction, declinePending] = useActionState(declineSubmission, initial);
  const [showDecline, setShowDecline] = useState(false);

  const move = (next: Submission["status"]) =>
    startMove(async () => {
      setMoveError(null);
      const r = await setSubmissionStatus(submission.id, next);
      if (!r.ok) setMoveError(r.error ?? "Couldn't update.");
    });

  const s = submission.status;

  return (
    <div className="card p-5">
      <h2 className="font-bold mb-4">Move it along</h2>

      <div className="space-y-3">
        {s === "new" && (
          <button onClick={() => move("reviewing")} disabled={movePending} className="btn-primary w-full !py-2.5 text-sm">
            Start reviewing
          </button>
        )}

        {(s === "new" || s === "reviewing") && (
          <form action={offerAction} className="space-y-2">
            <input type="hidden" name="submission_id" value={submission.id} />
            <input type="hidden" name="offer_amount" value={offerDefault ?? ""} />
            <button
              type="submit"
              disabled={offerPending || !offerDefault}
              className="btn-primary w-full !py-2.5 text-sm"
              title={offerDefault ? undefined : "Set the offer in the worksheet first"}
            >
              {offerPending
                ? "Sending…"
                : offerDefault
                  ? `Send offer: ${formatPrice(offerDefault)}`
                  : "Set offer in worksheet first"}
            </button>
            <p className="text-xs text-stone-500">
              Emails the seller the figure and next steps. Their status link
              updates instantly.
            </p>
            {offerState.error && <p className="error-text">{offerState.error}</p>}
          </form>
        )}

        {s === "offer_made" && (
          <>
            <button onClick={() => move("accepted")} disabled={movePending} className="btn-primary w-full !py-2.5 text-sm">
              Seller accepted — start settlement
            </button>
            <p className="text-xs text-stone-500">
              Offer of {formatPrice(submission.offer_amount)} sent{" "}
              {submission.offer_sent_at ? "— waiting on the seller." : "."}
            </p>
          </>
        )}

        {s === "accepted" && (
          <button onClick={() => move("settled")} disabled={movePending} className="btn-primary w-full !py-2.5 text-sm">
            Mark settled
          </button>
        )}

        {(s === "new" || s === "reviewing" || s === "offer_made") && (
          <>
            {!showDecline ? (
              <button onClick={() => setShowDecline(true)} className="btn-ghost w-full text-sm !text-stone-500">
                Decline this car
              </button>
            ) : (
              <form action={declineAction} className="space-y-2 border-t border-stone-100 pt-3">
                <input type="hidden" name="submission_id" value={submission.id} />
                <label htmlFor="decline-reason" className="label">
                  Why we&apos;re passing (goes to the seller, kindly)
                </label>
                <textarea
                  id="decline-reason"
                  name="reason"
                  rows={2}
                  className="input resize-none text-sm"
                  placeholder="we're overweight on utes this month and can't do your car justice."
                />
                <div className="flex gap-2">
                  <button type="submit" disabled={declinePending} className="btn-secondary flex-1 !py-2 text-sm">
                    {declinePending ? "Sending…" : "Decline + email"}
                  </button>
                  <button type="button" onClick={() => setShowDecline(false)} className="btn-ghost !py-2 text-sm">
                    Cancel
                  </button>
                </div>
                {declineState.error && <p className="error-text">{declineState.error}</p>}
              </form>
            )}
          </>
        )}

        {(s === "declined" || s === "settled") && (
          <p className="text-sm text-stone-500">
            This one&apos;s finished. It stays here for the record.
          </p>
        )}
      </div>
      {moveError && <p className="error-text">{moveError}</p>}
    </div>
  );
}
