"use client";

import Image from "next/image";
import { Link } from "next-view-transitions";
import { ArrowRight } from "@phosphor-icons/react";

/**
 * The crossing to the valuation tool.
 *
 * One component for every place it appears, so the home page and the band
 * above the footer cannot drift apart again: the home page had the full
 * treatment while every other page got a pale strip with a single button,
 * which read as a lesser offer of the same thing.
 *
 * Full bleed on purpose. It is a change of ground rather than a card, which
 * is what lets it close a page without competing with whatever sits above
 * it. Words left and actions right from 1280px so a full-width band is not
 * half empty; below that they stack and the photograph stands down, since a
 * letterboxed strip of it would say nothing.
 *
 * Marked "use client" so one component can serve both callers: the footer is
 * already a client component, and @phosphor-icons/react's client entry builds
 * a React context, which a Server Component cannot import. The band itself is
 * static; the only JavaScript it costs is the icon.
 */
export default function ValuationBand({
  phoneDisplay,
  phoneHref,
}: {
  phoneDisplay: string;
  phoneHref: string;
}) {
  return (
    <section
      aria-label="Instant car valuation"
      className="grid bg-forest-700 lg:grid-cols-[minmax(0,28rem)_1fr]"
    >
      {/* Flush to the left edge of the window, full height of the band. Adam
          is doing the exact thing the button offers. */}
      <div className="relative hidden lg:block">
        <Image
          src="/assets/images/Adam-Hall-Value-My-Car.jpg"
          alt="Adam Hall valuing a car with its owner in their driveway"
          fill
          sizes="28rem"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col justify-center gap-7 px-4 py-11 sm:px-8 lg:py-20 lg:pl-14 lg:pr-10 xl:flex-row xl:items-center xl:justify-between xl:gap-12">
        {/* Held to a reading measure: the band is full width, the words
            are not. */}
        <div className="max-w-[46ch]">
          <p className="type-label text-sand">Selling or trading in?</p>
          <h2 className="type-heading mt-2 text-white">
            What&rsquo;s my car <span className="text-sand">worth?</span>
          </h2>
          <p className="mt-3 text-stone-200">
            Tell us the car and see the range it sits in, straight away. No
            account, no contact details, just the number.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row xl:shrink-0">
          <Link href="/car-valuations" className="btn-cta">
            Get an instant range
            <ArrowRight size={18} weight="bold" />
          </Link>
          <a
            href={phoneHref}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/45 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10 active:translate-y-px"
          >
            Call {phoneDisplay}
          </a>
        </div>
      </div>
    </section>
  );
}
