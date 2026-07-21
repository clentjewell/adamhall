import type { SubmissionStatus } from "@/lib/types";
import { SUBMISSION_STATUS_LABELS } from "@/lib/types";

const styles: Record<string, string> = {
  new: "bg-amber-soft text-amber-accent",
  reviewing: "bg-forest-50 text-forest-700",
  offer_made: "bg-forest-100 text-forest-800",
  accepted: "bg-forest-600 text-white",
  declined: "bg-stone-200 text-stone-600",
  settled: "bg-ink text-white",
  draft: "bg-stone-200 text-stone-600",
  published: "bg-forest-600 text-white",
  sold: "bg-amber-soft text-amber-accent",
  archived: "bg-stone-100 text-stone-400",
  contacted: "bg-forest-50 text-forest-700",
  closed: "bg-stone-200 text-stone-600",
};

export default function StatusBadge({ status }: { status: string }) {
  const label =
    SUBMISSION_STATUS_LABELS[status as SubmissionStatus] ??
    (status.charAt(0).toUpperCase() + status.slice(1)).replaceAll("_", " ");
  return (
    <span
      className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${styles[status] ?? "bg-stone-200 text-stone-600"}`}
    >
      {label}
    </span>
  );
}
