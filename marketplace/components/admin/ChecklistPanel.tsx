"use client";

import { useState, useTransition } from "react";
import { CheckSquare, Square } from "@phosphor-icons/react";
import { tickChecklistItem } from "@/app/actions/admin";
import { CHECKLIST_ITEMS, type ChecklistKey, type SettlementChecklist } from "@/lib/types";
import { formatDateTime } from "@/lib/format";

// High-control items (money, ID, PPSR, ownership) are explicit ticks with
// name + timestamp. Nothing here is ever assumed or bulk-set.
export default function ChecklistPanel({
  submissionId,
  checklist,
}: {
  submissionId: string;
  checklist: SettlementChecklist | null;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const tick = (key: ChecklistKey, done: boolean) =>
    startTransition(async () => {
      setError(null);
      const r = await tickChecklistItem(submissionId, key, done);
      if (!r.ok) setError(r.error ?? "Couldn't save that.");
    });

  const doneCount = CHECKLIST_ITEMS.filter(
    (i) => checklist?.[`${i.key}_done` as keyof SettlementChecklist],
  ).length;

  return (
    <div className="card p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="font-bold">Settlement checklist</h2>
        <span className={`text-sm font-bold ${doneCount === CHECKLIST_ITEMS.length ? "text-forest-700" : "text-stone-400"}`}>
          {doneCount}/{CHECKLIST_ITEMS.length}
        </span>
      </div>
      <p className="text-xs text-stone-500 mt-1 mb-4">
        Money doesn&apos;t move until every box is deliberately ticked.
      </p>
      <ul className="space-y-1">
        {CHECKLIST_ITEMS.map((item) => {
          const done = Boolean(checklist?.[`${item.key}_done` as keyof SettlementChecklist]);
          const at = checklist?.[`${item.key}_at` as keyof SettlementChecklist] as string | null | undefined;
          const by = checklist?.[`${item.key}_by` as keyof SettlementChecklist] as string | null | undefined;
          return (
            <li key={item.key}>
              <button
                onClick={() => tick(item.key, !done)}
                disabled={pending}
                className="w-full flex items-start gap-3 px-2 py-2 rounded-lg hover:bg-stone-50 text-left disabled:opacity-60"
                aria-pressed={done}
              >
                {done ? (
                  <CheckSquare size={22} weight="fill" className="text-forest-600 shrink-0" />
                ) : (
                  <Square size={22} className="text-stone-300 shrink-0" />
                )}
                <span className="min-w-0">
                  <span className={`block text-sm font-semibold ${done ? "text-ink" : "text-stone-600"}`}>
                    {item.label}
                  </span>
                  {done && at && (
                    <span className="block text-xs text-stone-400">
                      {by} · {formatDateTime(at)}
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
