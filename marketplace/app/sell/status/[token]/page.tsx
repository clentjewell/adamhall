import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle, Circle, Phone } from "@phosphor-icons/react/dist/ssr";
import { createServiceClient } from "@/lib/supabase/service";
import { carTitle, formatDateTime, formatPrice } from "@/lib/format";
import type { Submission, StatusEvent } from "@/lib/types";

export const metadata: Metadata = {
  title: "Your submission",
  robots: { index: false, follow: false },
};

// Public pipeline view. Declined shows as a kind close-out, not a red X.
const PIPELINE = [
  { status: "new", label: "Received", blurb: "Your car is in the queue." },
  { status: "reviewing", label: "Adam's reviewing it", blurb: "He's looking at your photos and the numbers." },
  { status: "offer_made", label: "Offer made", blurb: "Check your email — the number is there." },
  { status: "accepted", label: "Deal agreed", blurb: "We're organising inspection and paperwork." },
  { status: "settled", label: "Settled", blurb: "Money moved. Done." },
] as const;

interface Props {
  params: Promise<{ token: string }>;
}

export default async function StatusPage({ params }: Props) {
  const { token } = await params;

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h1 className="font-display font-extrabold text-2xl">Status tracking is warming up</h1>
        <p className="text-stone-600 mt-3">
          This page isn&apos;t wired up in this environment yet. Your submission
          is safe — Adam will be in touch within 1 business day.
        </p>
      </div>
    );
  }

  const supabase = createServiceClient();
  const { data: submission } = await supabase
    .from("submissions")
    .select("*")
    .eq("token", token)
    .maybeSingle<Submission>();
  if (!submission) notFound();

  const { data: events } = await supabase
    .from("status_events")
    .select("*")
    .eq("entity_type", "submission")
    .eq("entity_id", submission.id)
    .order("created_at", { ascending: true })
    .returns<StatusEvent[]>();

  const eventByStatus = new Map((events ?? []).map((e) => [e.to_status, e]));
  const declined = submission.status === "declined";
  const currentIdx = PIPELINE.findIndex((p) => p.status === submission.status);

  const title = carTitle(submission) || submission.rego || "your car";

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <p className="text-sm font-semibold text-forest-700">Your submission</p>
      <h1 className="font-display font-extrabold text-3xl tracking-tight mt-1">
        {title}
      </h1>
      <p className="text-stone-500 text-sm mt-1">
        Submitted {formatDateTime(submission.created_at)}
      </p>

      {declined ? (
        <div className="card p-6 mt-8">
          <p className="font-display font-bold text-lg">
            We passed on this one — and said why
          </p>
          <p className="text-stone-600 mt-2 leading-relaxed">
            {submission.declined_reason ??
              "Check your email for the full reason. It's about what we can retail right now, not about your car."}
          </p>
          <p className="text-stone-600 mt-2">
            Different car down the track? We&apos;d genuinely like to see it.
          </p>
        </div>
      ) : (
        <ol className="mt-8 space-y-0">
          {PIPELINE.map((p, i) => {
            const done = currentIdx >= i;
            const isCurrent = currentIdx === i;
            const event = eventByStatus.get(p.status);
            return (
              <li key={p.status} className="relative pl-10 pb-8 last:pb-0">
                {i < PIPELINE.length - 1 && (
                  <span
                    aria-hidden
                    className={`absolute left-[13px] top-7 bottom-1 w-0.5 ${done && currentIdx > i ? "bg-forest-600" : "bg-stone-200"}`}
                  />
                )}
                <span className="absolute left-0 top-0.5">
                  {done ? (
                    <CheckCircle size={28} weight="fill" className="text-forest-600" />
                  ) : (
                    <Circle size={28} className="text-stone-300" />
                  )}
                </span>
                <p className={`font-bold ${done ? "text-ink" : "text-stone-400"}`}>
                  {p.label}
                  {p.status === "offer_made" && submission.offer_amount && done && (
                    <span className="ml-2 text-forest-700">
                      {formatPrice(submission.offer_amount)}
                    </span>
                  )}
                </p>
                {isCurrent && <p className="text-sm text-stone-600 mt-0.5">{p.blurb}</p>}
                {event && (
                  <p className="text-xs text-stone-400 mt-0.5">
                    {formatDateTime(event.created_at)}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      )}

      <div className="card p-5 mt-10 flex items-center gap-4">
        <Phone size={24} className="text-forest-600 shrink-0" weight="duotone" />
        <p className="text-sm text-stone-600">
          Questions while you wait? Call us — a human answers, and it&apos;s
          usually Adam.
        </p>
      </div>

      <Link href="/cars" className="btn-ghost mt-6 text-sm">
        Browse the cars while you&apos;re here
      </Link>
    </div>
  );
}
