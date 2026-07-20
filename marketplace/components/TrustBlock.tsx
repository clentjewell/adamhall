import { SealCheck, Wrench, BookOpen, Quotes } from "@phosphor-icons/react/dist/ssr";
import type { Car } from "@/lib/types";

const serviceLabels: Record<Car["service_history"], string> = {
  full: "Full service history, books supplied",
  partial: "Partial history, receipts supplied",
  none: "No books — priced accordingly",
  unknown: "History being confirmed",
};

export default function TrustBlock({ car }: { car: Car }) {
  return (
    <div className="card p-6 bg-forest-50/60 !border-forest-100">
      <ul className="space-y-3.5">
        {car.ppsr_clear && (
          <li className="flex gap-3 items-start">
            <SealCheck size={22} weight="fill" className="text-forest-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">PPSR clear</p>
              <p className="text-sm text-stone-600">
                No money owing, not written off, not stolen. Certificate available on request.
              </p>
            </div>
          </li>
        )}
        <li className="flex gap-3 items-start">
          <BookOpen size={22} weight="fill" className="text-forest-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm">Service history</p>
            <p className="text-sm text-stone-600">{serviceLabels[car.service_history]}</p>
          </div>
        </li>
        {car.inspection_summary && (
          <li className="flex gap-3 items-start">
            <Wrench size={22} weight="fill" className="text-forest-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Our inspection</p>
              <p className="text-sm text-stone-600">{car.inspection_summary}</p>
            </div>
          </li>
        )}
      </ul>
      {car.adams_take && (
        <figure className="mt-5 pt-5 border-t border-forest-100">
          <div className="flex gap-3">
            <Quotes size={22} weight="fill" className="text-forest-400 shrink-0" />
            <div>
              <blockquote className="text-ink leading-relaxed font-medium">
                {car.adams_take}
              </blockquote>
              <figcaption className="mt-2 text-sm font-semibold text-forest-700">
                Adam Hall
              </figcaption>
            </div>
          </div>
        </figure>
      )}
    </div>
  );
}
