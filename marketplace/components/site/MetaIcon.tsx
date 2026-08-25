/**
 * The two spec-row glyphs TypeIcon cannot provide: an odometer and a
 * transmission are facts about a car, not types of car, so they live apart
 * from the type set — but they are drawn in the same idiom (one stroke,
 * currentColor, round caps, no fill) so a listing card's meta row reads as
 * one vocabulary with the body and fuel glyphs beside them.
 */

const GLYPHS = {
  // A gauge: the dial's upper sweep, a needle leaning into it, and the pivot.
  odometer: [
    "M4.5 15.5 a7.5 7.5 0 0 1 15 0",
    "M12 15.5 L16.2 10.2",
    "M12 15.5 l0.01 0",
  ],
  // A shift gate: three gates off one bar, knob resting in the first.
  transmission: [
    "M6 6 v12",
    "M12 6 v6",
    "M18 6 v12",
    "M6 12 h12",
    "M6 6 a0.01 0.01 0 0 0 0 0",
  ],
} as const;

export type MetaIconKind = keyof typeof GLYPHS;

export default function MetaIcon({
  kind,
  className,
}: {
  kind: MetaIconKind;
  className?: string;
}) {
  return (
    <svg
      className={className}
      // The square family, same as TypeIcon's fuels, so one CSS rule sizes
      // every square glyph in a row alike.
      data-icon="square"
      viewBox="0 0 24 24"
      width={16}
      height={16}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {GLYPHS[kind].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
