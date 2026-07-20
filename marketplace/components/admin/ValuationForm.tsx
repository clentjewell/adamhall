"use client";

import { useActionState, useState } from "react";
import { saveValuation, type AdminActionState } from "@/app/actions/admin";
import { formatPrice } from "@/lib/format";
import type { Valuation } from "@/lib/types";

const initial: AdminActionState = { ok: false };

// Adam's worksheet. Every saved row quietly grows the pricing dataset:
// what he offered, what he expected to retail, what he saw.
export default function ValuationForm({
  submissionId,
  valuation,
  askingPrice,
}: {
  submissionId: string;
  valuation: Valuation | null;
  askingPrice: number | null;
}) {
  const [state, action, pending] = useActionState(saveValuation, initial);
  const [offer, setOffer] = useState(valuation?.offer_amount?.toString() ?? "");
  const [retail, setRetail] = useState(valuation?.expected_retail?.toString() ?? "");
  const [recon, setRecon] = useState(valuation?.expected_recon?.toString() ?? "");

  const margin =
    (Number(retail) || 0) - (Number(offer) || 0) - (Number(recon) || 0);
  const marginShown = retail || offer || recon;

  return (
    <form action={action} className="card p-5">
      <h2 className="font-bold">Valuation worksheet</h2>
      {askingPrice != null && (
        <p className="text-sm text-stone-500 mt-0.5">
          Seller wants {formatPrice(askingPrice)}
        </p>
      )}
      <input type="hidden" name="submission_id" value={submissionId} />
      <div className="grid grid-cols-3 gap-3 mt-4">
        <div>
          <label htmlFor="v-offer" className="label !text-xs">My offer</label>
          <input id="v-offer" name="offer_amount" type="number" inputMode="numeric" className="input !px-2.5" value={offer} onChange={(e) => setOffer(e.target.value)} placeholder="24500" />
        </div>
        <div>
          <label htmlFor="v-retail" className="label !text-xs">Retail at</label>
          <input id="v-retail" name="expected_retail" type="number" inputMode="numeric" className="input !px-2.5" value={retail} onChange={(e) => setRetail(e.target.value)} placeholder="29990" />
        </div>
        <div>
          <label htmlFor="v-recon" className="label !text-xs">Recon</label>
          <input id="v-recon" name="expected_recon" type="number" inputMode="numeric" className="input !px-2.5" value={recon} onChange={(e) => setRecon(e.target.value)} placeholder="1100" />
        </div>
      </div>
      <div className={`mt-3 rounded-lg px-3 py-2.5 text-sm font-bold ${marginShown ? (margin > 0 ? "bg-forest-50 text-forest-700" : "bg-red-50 text-red-700") : "bg-stone-100 text-stone-400"}`}>
        Margin: {marginShown ? formatPrice(margin) : "fill the numbers in"}
      </div>
      <div className="mt-4">
        <label htmlFor="v-notes" className="label">
          What I saw, why this number
        </label>
        <textarea
          id="v-notes"
          name="notes"
          rows={3}
          className="input resize-none text-sm"
          defaultValue={valuation?.notes ?? ""}
          placeholder="Private — never shown to the seller."
        />
      </div>
      {state.error && <p className="error-text">{state.error}</p>}
      {state.ok && <p className="text-sm font-medium text-forest-700 mt-2" role="status">Saved.</p>}
      <button type="submit" disabled={pending} className="btn-secondary w-full mt-4 !py-2.5 text-sm">
        {pending ? "Saving…" : "Save worksheet"}
      </button>
    </form>
  );
}
