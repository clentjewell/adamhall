"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import Button from "@/components/site/Button";
import HeroSearch, { type HeroSearchCar } from "@/components/site/HeroSearch";
import { site } from "@/lib/site-data/site";
import "@/components/site/HeroFilm.css";

/**
 * The home page opener: one film looping quietly behind the words and the
 * marketplace's own search panel.
 *
 * This replaces the scroll film, at Adam's direction — "lose the scrolling
 * animation, just make it a video playing nonstop in the background, looping".
 * Which also settles an open question rather than leaving it hanging: the
 * scroll treatment was a deliberate departure from Edition 1, which rules out
 * scroll-driven motion in absolute terms, and Liz was being asked to rule on
 * it. She no longer needs to. A looping film behind a band is the site's own
 * established device — HeaderFilm does exactly this on every other page — so
 * the opener is back inside the identity instead of arguing with it.
 *
 * What went with the scrubbing: the four beats. They were a function of scroll
 * progress, and the only ways to keep four sequential messages without scroll
 * are a timed carousel — which the identity's motion rules rule out, and which
 * would swap a call to action under the reader's thumb — or nothing. So the
 * opener says one thing, which is the beat that was always the h1. The other
 * three are not lost so much as already elsewhere on the page: the stock count
 * is in the search panel's own head, and the buy/sell split is the section
 * immediately below.
 *
 * The film is a different file to the one that was being scrubbed, and
 * deliberately: see homeHeroFilm in lib/heroes.ts. Five seconds built to come
 * back round on itself rather than nineteen seconds of one-way journey, and
 * 352KB rather than 4.9MB — which matters far more now that it starts on every
 * visit instead of only for the readers who were going to scrub it.
 *
 * It degrades the way every film on this site does:
 *
 *   - Reduced motion gets the poster and nothing that moves.
 *   - Save-data gets the same. Neither ever fetches the film: it is not in the
 *     server's HTML, so nothing starts downloading before the preference is
 *     known.
 *   - If autoplay is refused — low power mode, and it is refused often — the
 *     poster simply stays. The words and the panel were designed to sit on it.
 */

export default function HeroFilm({
  src,
  poster,
  cars,
}: {
  src: string;
  /** The film's own first frame. Carries the panel until playback starts, and
      permanently for anyone who is not getting the film. */
  poster: string;
  /** The lot itself, projected down to the fields filtering reads, for the
      search panel on the frame. Adam asked for the marketplace to be visible
      and searchable from the hero rather than a scroll away; the panel is what
      does that, and it needs the real stock to count against. */
  cars: HeroSearchCar[];
}) {
  const reduce = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [saveData, setSaveData] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const conn = (navigator as { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) setSaveData(true);
    setMounted(true);
  }, []);

  // Before hydration neither preference is knowable, so the film is not in the
  // server's HTML at all. A src in the initial markup would start the download
  // before React could ask whether this reader wanted it, which is exactly the
  // download that reduced motion and save-data are asking not to happen.
  const showFilm = mounted && !reduce && !saveData;

  useEffect(() => {
    if (!showFilm) return;
    // autoPlay is on the element; this is the belt to that brace, and the same
    // pairing HeaderFilm uses. Autoplay is refused often enough — low power
    // mode, some data settings — that the refusal is a supported state rather
    // than an error: the poster stays and nothing else changes.
    videoRef.current?.play().catch(() => {});
  }, [showFilm]);

  return (
    <section className="hfilm">
      <div className="hfilm__panel">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={poster}
          alt=""
          className={`hfilm__media hfilm__poster${playing ? " is-gone" : ""}`}
        />
        {showFilm && (
          <video
            ref={videoRef}
            src={src}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            tabIndex={-1}
            aria-hidden="true"
            onPlaying={() => setPlaying(true)}
            className={`hfilm__media${playing ? " is-ready" : ""}`}
          />
        )}
        <span className="hfilm__scrim" />

        {/* One column of words above, one band across the foot — Adam's
            mockup. The band used to be a card floating on the right of the
            frame, which covered the only part of the film the scrim ever
            clears; across the bottom it leaves the picture alone. */}
        <div className="hfilm__stage">
          <div className="container container--wide hfilm__inner">
            <div className="hfilm__content">
              <span className="hfilm__eyebrow">
                {/* A pin, from the mockup. The site already draws its own
                    icons inline (the footer, the spec lists, the accordion),
                    so this brings in no new dependency and no icon font. */}
                <svg
                  className="hfilm__pin"
                  viewBox="0 0 24 24"
                  width="13"
                  height="13"
                  aria-hidden="true"
                >
                  <path
                    d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.6A2.6 2.6 0 1 1 12 6.4a2.6 2.6 0 0 1 0 5.2Z"
                    fill="currentColor"
                  />
                </svg>
                Gold Coast &middot; Brisbane &middot; Northern Rivers
              </span>

              {/* One sand word, the accent device the valuation band and the
                  stock flags already use: the accent marks the thing that
                  matters rather than the whole line. */}
              <h1 className="hfilm__title">
                Cars worth putting our <span className="hfilm__accent">name</span> on
              </h1>

              <p className="hfilm__sub">
                Every car here is one we decided was worth buying. What the
                listing says is what you get.
              </p>

              {/* Neither of these is the buy path: the band below them is, at
                  every width — open on a wide screen, collapsed to its head on
                  a phone. So the buttons are the two things the band cannot
                  do, which is also the two halves of the business. */}
              <div className="hfilm__actions">
                <Button href={site.phoneHref} variant="outline-white">
                  Call {site.phoneDisplay}
                </Button>
                <Button to="/car-valuations" variant="outline-white" arrow>
                  What&rsquo;s my car worth?
                </Button>
              </div>
            </div>
          </div>

          {/* The marketplace, across the foot of the frame: the range's size,
              three fields counted against real stock, and a tile per slice of
              the lot with a real car in it. */}
          {cars.length > 0 && (
            <div className="container container--wide hfilm__base">
              <HeroSearch cars={cars} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
