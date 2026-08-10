import type { CSSProperties } from "react";
import { trustBar } from "@/lib/site-data/site";

/**
 * Five-item icon strip. Defaults to the seller claims used by the parent pages
 * hosted here; the buy side passes `buyerTrustBar` instead, because a promise
 * made to a seller is not a reason to buy.
 */
export default function TrustBar({
  items = trustBar,
  label = "Why sell to Adam Hall",
}: {
  items?: { icon: string; label: string }[];
  label?: string;
}) {
  return (
    <section className="trustbar" aria-label={label}>
      <div className="container container--wide">
        <ul className="trustbar__items">
          {items.map((item, i) => (
            <li
              key={item.label}
              className="trustbar__item reveal"
              style={{ ["--stagger" as string]: i } as CSSProperties}
            >
              <img
                src={item.icon}
                alt=""
                aria-hidden="true"
                loading="lazy"
                width={48}
                height={48}
              />
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
