import type { ReactNode } from "react";
import { Link } from "next-view-transitions";
import { brand } from "@/lib/brand";

/**
 * The Car Marketplace mark. Reads lib/brand.ts and nothing else, so swapping
 * the wordmark for signed-off artwork is a one-line change there.
 *
 * The endorsement, when set, sits beneath the name in fixed relationship to
 * it. Car Marketplace currently carries no endorsement, so brand.endorsement
 * is an empty string and the line is skipped entirely.
 */
export default function BrandLockup({
  reverse = false,
  size = "md",
  href = "/",
}: {
  /** White-on-dark, for the green header and the footer. */
  reverse?: boolean;
  size?: "sm" | "md";
  /** Pass null to render the mark without wrapping it in a link. */
  href?: string | null;
}) {
  const nameSize = size === "sm" ? "text-lg" : "text-xl md:text-2xl";
  const endorsementSize = size === "sm" ? "text-[9px]" : "text-[10px] md:text-[11px]";
  const cartHeight = size === "sm" ? "h-7" : "h-9 md:h-10";
  // The full lockup stacks two lines of type plus the signature, so it needs a
  // little more height than the cart-and-wordmark pairing to read at the same
  // weight in the header.
  const lockupHeight = size === "sm" ? "h-10" : "h-12 md:h-14";

  const wordmark = (
    <span className="flex flex-col leading-[0.95]">
      <span
        className={`font-display font-black tracking-[-0.03em] ${nameSize} ${
          reverse ? "text-white" : "text-headline"
        }`}
      >
        {brand.name}
      </span>
      {brand.endorsement && (
        <span
          className={`font-display font-bold uppercase tracking-[0.14em] mt-1 ${endorsementSize} ${
            reverse ? "text-forest-200" : "text-meta"
          }`}
        >
          {brand.endorsement}
        </span>
      )}
    </span>
  );

  let mark: ReactNode;
  if (brand.logo.kind === "image") {
    // The supplied lockup already carries the name and the endorsement, so the
    // live wordmark is not rendered beside it. Height is set here and the width
    // follows the artwork's own ratio.
    mark = (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={reverse ? brand.logo.srcReverse : brand.logo.src}
        alt={brand.fullName}
        width={brand.logo.width}
        height={brand.logo.height}
        className={`${lockupHeight} w-auto`}
      />
    );
  } else if (brand.logo.kind === "mark") {
    // The primary horizontal lockup: cart artwork, then the wordmark. The cart
    // is decorative here because the wordmark beside it already names the brand,
    // so it carries an empty alt to avoid the name being read out twice.
    mark = (
      <span className="inline-flex items-center gap-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={reverse ? brand.logo.cartReverse : brand.logo.cart}
          alt=""
          aria-hidden="true"
          className={`${cartHeight} w-auto`}
        />
        {wordmark}
      </span>
    );
  } else {
    mark = wordmark;
  }

  if (href === null) return mark;

  return (
    <Link href={href} aria-label={`${brand.fullName}, home`} className="inline-flex">
      {mark}
    </Link>
  );
}
