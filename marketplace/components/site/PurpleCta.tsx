import type { ReactNode } from "react";
import Button from "./Button";

/** Call-to-action band — centred, with an outline pill on the first line and a
    tan underline on the second, then an arrow-shaped "Start with" box.
    Defaults to the parent brand's seller CTA, which is what the Adam Hall pages
    hosted here still use. The buy side passes its own lines and destination. */
export default function PurpleCta({
  lineOne,
  lineTwo,
  startLabel = "Start with",
  ctaLabel = "Buy My Car",
  ctaTo = "/buy-my-car",
}: {
  lineOne?: ReactNode;
  lineTwo?: ReactNode;
  startLabel?: string;
  ctaLabel?: string;
  ctaTo?: string;
}) {
  return (
    <section className="pcta bg-purple" aria-label="Get started">
      <div className="container">
        <div className="pcta__inner reveal">
          <h4 className="pcta__title">
            <span className="pcta__line">
              {lineOne ?? (
                <>
                  Time&rsquo;s precious and{" "}
                  <span className="pcta__pill">life&rsquo;s busy</span>
                </>
              )}
            </span>
            <span className="pcta__line">
              {lineTwo ?? (
                <>
                  <span className="pcta__feet">Put your feet up</span> and let Adam
                  do all the leg work.
                </>
              )}
            </span>
          </h4>
          <div className="pcta__action">
            <span className="pcta__start">{startLabel}</span>
            <Button to={ctaTo} variant="green" arrow>
              {ctaLabel}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
