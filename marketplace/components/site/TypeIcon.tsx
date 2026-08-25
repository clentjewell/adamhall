/**
 * Line-art icons for the hero band's type tiles.
 *
 * Adam asked for "an icon of the type of the car instead of the actual
 * picture". The tiles carried the lead photograph of a real car of each type
 * before this, which was honest but not what a category marker is for: at
 * 88px a photograph of a specific Hilux is a picture of one car, where a
 * silhouette is the whole class. It also means the hero no longer fetches five
 * photographs to draw five buttons.
 *
 * Drawn in the site's own idiom — inline SVG, no fill, currentColor strokes,
 * round caps — the same as the footer's icons, the spec lists and the
 * accordion chevron. No icon font, no dependency, and they take the tile's
 * colour so the selected state needs nothing of its own.
 *
 * All the car profiles share one footprint: the same 48x24 box, the same sill,
 * the same two wheels in the same places. Only the roof and tail change, which
 * is what tells the types apart — a set where each shape also changed length
 * would read as a row of different drawings rather than one family. Fuels get
 * a square box of their own and are drawn smaller, so a leaf does not turn up
 * the size of a wagon.
 */

type Glyph = { box: string; w: number; d: string[] };

/* Shared geometry for the cars, so every profile lines up:
   sill at y=16.4, wheels r=3.4 centred at x=13 and x=35, arches cut into the
   sill either side of each. */
const SILL_AND_ARCHES =
  "L38.8 16.4 A3.8 3.8 0 0 0 31.2 16.4 L16.8 16.4 A3.8 3.8 0 0 0 9.2 16.4 Z";
const WHEELS = ["M13 20.2 A3.4 3.4 0 1 1 13 13.4 A3.4 3.4 0 1 1 13 20.2", "M35 20.2 A3.4 3.4 0 1 1 35 13.4 A3.4 3.4 0 1 1 35 20.2"];

const car = (top: string): Glyph => ({
  box: "0 0 48 24",
  w: 44,
  d: [`M3.4 16.4 ${top} ${SILL_AND_ARCHES}`, ...WHEELS],
});

/* The SUV gets its own base rather than the shared one. Drawn on the same
   sill with only a higher roof, it read as a wagon at tile size — two pixels
   of roofline is not a category. A body lifted clear of bigger wheels is what
   an SUV actually looks like from the side, and it is the difference you can
   still see at 88px. */
const SILL_AND_ARCHES_TALL =
  "L39 15.4 A4.2 4.2 0 0 0 30.8 15.4 L17.2 15.4 A4.2 4.2 0 0 0 9 15.4 Z";
const WHEELS_TALL = [
  "M13 19.6 A3.8 3.8 0 1 1 13 12 A3.8 3.8 0 1 1 13 19.6",
  "M35 19.6 A3.8 3.8 0 1 1 35 12 A3.8 3.8 0 1 1 35 19.6",
];
const carTall = (top: string): Glyph => ({
  box: "0 0 48 24",
  w: 44,
  d: [`M3.4 15.4 ${top} ${SILL_AND_ARCHES_TALL}`, ...WHEELS_TALL],
});

const GLYPHS: Record<string, Glyph> = {
  /* Steep tailgate, roof carried right over the rear wheel: the shape that
     says "no boot". */
  hatch: car(
    "L3.4 13.2 L10.8 10.6 L15.4 6.2 L31.4 6.2 L36.6 11.4 L41.6 12.6 L41.6 16.4",
  ),
  /* Three boxes: bonnet, cabin, and a boot deck running out to the tail. */
  sedan: car(
    "L3.4 13.4 L10.6 10.8 L15.2 6.6 L28.2 6.6 L33.4 10.8 L44.2 11.2 L44.2 16.4",
  ),
  /* Roof carried almost to the tail, then straight down. */
  wagon: car(
    "L3.4 13.4 L10.6 10.8 L15.2 6.4 L38.6 6.4 L41.8 7.2 L41.8 16.4",
  ),
  /* Taller and squarer, with the roofline higher than anything else in the
     set — which is the whole of what an SUV looks like from the side. */
  suv: carTall(
    "L3.4 10.8 L9.6 7.6 L13.4 3.2 L35.6 3.2 L40.4 7.8 L41.8 9 L41.8 15.4",
  ),
  /* A cab and then an open tray: the drop behind the cabin and the low tray
     line are the read. */
  ute: car(
    "L3.4 12.8 L10.2 9.8 L13.8 5.2 L25.8 5.2 L27.4 10.8 L43.6 10.8 L43.6 16.4",
  ),
  /* One tall box with a raked screen. */
  van: car("L3.4 13 L9.4 9 L11.4 3.8 L42.8 3.8 L42.8 16.4"),
  /* Low roof, long fastback run to the tail. */
  coupe: car(
    "L3.4 13.6 L10.4 11 L16.6 6.8 L26.6 6.8 L40.4 12.6 L44 12.8 L44 16.4",
  ),
  /* No roof: a short screen and a flat tonneau behind it. */
  convertible: car(
    "L3.4 13.6 L10.6 11.2 L15.4 7.6 L17.6 7.6 L18.8 11.4 L43.6 11.8 L43.6 16.4",
  ),

  /* --- Fuels. A square box and a smaller draw size, so a leaf does not
     arrive the size of a wagon. --- */
  hybrid: {
    box: "0 0 24 24",
    w: 26,
    // A leaf with its midrib: the mark every hybrid badge on the road uses.
    d: [
      "M20 4C11.7 4 5 8.5 5 15.2c0 1.9.6 3.6 1.6 4.8C9.4 16.6 13.6 13 20 11.4",
      "M6.6 20C13.4 20 20 14.6 20 4",
    ],
  },
  diesel: {
    box: "0 0 24 24",
    w: 26,
    // A pump: body, hose and nozzle.
    d: [
      "M4 20.5V6.2A2.2 2.2 0 0 1 6.2 4h5.6A2.2 2.2 0 0 1 14 6.2v14.3",
      "M2.6 20.5h12.8",
      "M4.6 8.4h8.8",
      "M14 10.4h3.4a2.6 2.6 0 0 1 2.6 2.6v4.2a1.8 1.8 0 1 0 3.6 0V9.2l-2.6-2.8",
    ],
  },
  petrol: {
    box: "0 0 24 24",
    w: 24,
    // A droplet, told apart from diesel's pump at a glance.
    d: ["M12 3.2c3.4 4.2 6.2 7.4 6.2 10.8a6.2 6.2 0 1 1-12.4 0C5.8 10.6 8.6 7.4 12 3.2Z"],
  },
  electric: {
    box: "0 0 24 24",
    w: 24,
    d: ["M13.6 2.6 5.2 13.8h5.4L9.8 21.4 18.8 10h-5.6l.4-7.4Z"],
  },
};

/** What each stock value is drawn as. The keys are the values the database
    actually holds, matched case-insensitively; anything unrecognised falls
    back to the sedan, which is the least wrong shape for a car of unknown
    type. Multi-word values are matched on their most specific word first, so
    "Plug-in Hybrid" gets the leaf rather than the fallback. */
const ALIASES: [RegExp, keyof typeof GLYPHS][] = [
  [/hatch/i, "hatch"],
  [/ute|pick[- ]?up|cab chassis|tray/i, "ute"],
  [/suv|wagon 4x4|4wd/i, "suv"],
  [/van|people mover|bus/i, "van"],
  [/wagon/i, "wagon"],
  [/coupe|liftback|fastback/i, "coupe"],
  [/convertible|cabriolet|roadster|targa/i, "convertible"],
  [/sedan|saloon/i, "sedan"],
  [/plug|hybrid/i, "hybrid"],
  [/diesel/i, "diesel"],
  [/electric|^ev$/i, "electric"],
  [/petrol|unleaded|gasoline|lpg/i, "petrol"],
];

export function glyphFor(value: string): keyof typeof GLYPHS {
  for (const [test, name] of ALIASES) if (test.test(value)) return name;
  return "sedan";
}

export default function TypeIcon({
  value,
  className,
}: {
  /** The body type or fuel as the database holds it. */
  value: string;
  className?: string;
}) {
  const g = GLYPHS[glyphFor(value)];
  const square = g.box.endsWith("24 24");
  return (
    <svg
      className={className}
      // Which family this is, so a stylesheet can size the two apart. A leaf
      // set to the same width as a wagon is drawn twice the height of it and
      // arrives twice the weight — measured on the band before this existed.
      data-icon={square ? "square" : "wide"}
      viewBox={g.box}
      width={g.w}
      // Height follows the box's own ratio, so the two families sit at the
      // proportions they were drawn at rather than being squared off.
      height={g.w * (square ? 1 : 0.5)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {g.d.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
