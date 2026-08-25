// CSS-driven marquee (one per page, max). The track is duplicated so the
// -50% translate loops seamlessly; reduced-motion users get a static row.
export default function Marquee({ items }: { items: string[] }) {
  const row = items.map((item, i) => (
    <span key={i} className="flex items-center gap-6 shrink-0">
      <span className="font-display font-bold uppercase tracking-wide text-2xl md:text-3xl text-stone-300">
        {item}
      </span>
      <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-amber-accent/60 shrink-0" />
    </span>
  ));

  return (
    <div className="marquee overflow-hidden py-6 border-b border-stone-200 bg-white" aria-hidden>
      <div className="marquee-track flex items-center gap-6 w-max">
        {row}
        {row}
      </div>
    </div>
  );
}
