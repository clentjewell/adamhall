/**
 * Curved section divider. `color` is the colour of the wave shape.
 * Ported from the reference WaveDivider.
 */
export default function WaveDivider({
  color = "green",
  flip = false,
}: {
  color?: "green" | "cream";
  flip?: boolean;
}) {
  return (
    <div
      className={`wave-divider wave-divider--${color} ${flip ? "is-flip" : ""}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 1440 90" preserveAspectRatio="none">
        <path d="M0,60 C360,0 1080,120 1440,40 L1440,90 L0,90 Z" fill="currentColor" />
      </svg>
    </div>
  );
}
