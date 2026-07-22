import type { CSSProperties } from "react";
import { trustBar } from "@/lib/site-data/site";

/** Five-item icon strip (5 Star Reviews, Hassle-free Guarantee, …). */
export default function TrustBar() {
  return (
    <section className="trustbar" aria-label="Why sell to Adam Hall">
      <div className="container container--wide">
        <ul className="trustbar__items">
          {trustBar.map((item, i) => (
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
                width={40}
                height={40}
              />
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
