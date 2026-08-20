"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import Button from "@/components/site/Button";
import { site } from "@/lib/site-data/site";
import "@/components/site/ScrollFilm.css";

/**
 * The home page opener: one film, moved frame by frame by the scroll position.
 *
 * A departure from the identity, made deliberately rather than by accident.
 * Edition 1 rules out scroll-driven motion in absolute terms ("anything on
 * scroll: never — no parallax, no fade-up-on-scroll, no counters triggering in
 * the viewport"), which is why Reveal still renders its children statically.
 * Adam asked for this and is taking it back to Liz, so the edition can be
 * updated rather than quietly contradicted. If the answer comes back no,
 * deleting this component and restoring the mp2-hero block in app/page.tsx is
 * the whole reversal.
 *
 * How it works: a tall outer section supplies the scroll distance, and a
 * sticky panel holds the screen while the film runs. Progress through the
 * outer section maps to the film's currentTime, so the film only ever moves
 * when the reader moves, and it runs backwards just as willingly. Nothing
 * plays on its own.
 *
 * The headline does not change. Only the eyebrow and the line under it move
 * from beat to beat: a headline that flickers as you scroll reads as a
 * slideshow, and the page needs exactly one h1 that stays put whatever the
 * scroll position is. That also keeps the heading out of the churn — every
 * beat is mounted from the first paint and only its visibility changes, so
 * nothing mounts or unmounts as the reader scrolls.
 *
 * It degrades to the treatment it replaced:
 *
 *   - Reduced motion gets one still frame, no pinning, no scroll linkage.
 *   - Save-data gets the same. Neither ever fetches the film: it is not in
 *     the server's HTML, so nothing starts downloading before the preference
 *     is known.
 *   - If the film never decodes, the panel keeps its poster and its words.
 */

type Beat = { eyebrow: string; body: string };


export default function ScrollFilm({
  src,
  poster,
  inStock,
}: {
  src: string;
  /** First frame of the film. Carries the panel until the film decodes, and
      permanently for anyone who has asked not to be moved. */
  poster: string;
  /** Live count of published cars, so the middle beat states the range
      rather than describing it. */
  inStock: number;
}) {
  const reduce = useReducedMotion();
  const [saveData, setSaveData] = useState(false);
  const outerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  /** Mirrors `ready` for the scroll handler, which must not re-subscribe
      every time the state changes. */
  const readyRef = useRef(false);
  const [beat, setBeat] = useState(0);
  const [ready, setReady] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const conn = (navigator as { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) setSaveData(true);
    setMounted(true);
  }, []);

  // Before hydration neither preference is knowable, so the server renders the
  // scrolling shape and the reduced-motion media query in the stylesheet flattens
  // it for the readers who need that. What the server does NOT render is the
  // video: a src in the initial HTML starts a 2.3MB download before React can
  // ask whether this reader wanted it, which is exactly the download that
  // reduced motion and save-data are asking not to happen. The film is worth
  // a beat's delay to keep that promise, and the poster covers the wait.
  const scrub = !reduce && !saveData;
  const showFilm = mounted && scrub;

  // Four beats, each one grounded in something the rest of the site already
  // claims: the trust bar, the stock count and the footer strapline. The film
  // moves from an approach, along the row, into the detail, and out onto the
  // road, and the words follow it.
  const beats: Beat[] = [
    {
      eyebrow: "Gold Coast · Brisbane · Northern Rivers",
      body:
        "Every car here is one we decided was worth buying. What the listing says is what you get.",
    },
    {
      eyebrow: "On the lot now",
      body:
        inStock > 0
          ? `${inStock} car${inStock === 1 ? "" : "s"} in the range right now. A short list, not a classifieds wall.`
          : "A short, hand-picked range rather than a classifieds wall.",
    },
    {
      eyebrow: "Before anything is listed",
      body:
        "PPSR checked, the books gone through, and any fault named in the description.",
    },
    {
      eyebrow: "Twenty-seven years picking cars",
      body:
        "Have a look at what is on the lot, or call and we will talk it through.",
    },
  ];

  useEffect(() => {
    if (!showFilm) return;
    const outer = outerRef.current;
    const panel = panelRef.current;
    const video = videoRef.current;
    if (!outer || !panel || !video) return;

    // Fresh element, fresh film: nothing is scrubbable until this run's own
    // fetch has landed.
    readyRef.current = false;
    setReady(false);

    // The film is fetched and handed to the element as a blob, rather than
    // pointed at with a src, and that is the whole reason this works.
    //
    // Scrubbing means seeking, and a browser will only seek within what the
    // server told it it can ask for. Cloudflare's asset server does not answer
    // byte-range requests — a Range header comes back as the whole file with a
    // 200 — so Chromium reports the film as seekable across [0, 0] and refuses
    // every seek, even once the entire thing has downloaded and readyState is
    // 4. Measured, not assumed. A src straight at /brand would give us a film
    // on screen that will not move.
    //
    // A blob URL has no server behind it to ask, so the whole timeline is
    // seekable the moment it exists. The cost is that the film cannot start
    // until all of it has arrived, which the poster covers: it holds the panel,
    // with the words on it, exactly as it does for anyone who never gets the
    // film at all.
    let url = "";
    let dead = false;
    fetch(src)
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
      .then((blob) => {
        if (dead) return;
        url = URL.createObjectURL(blob);
        video.src = url;
      })
      // Nothing to do but leave the poster up, which is a complete treatment
      // in its own right.
      .catch(() => {});

    const check = () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;
      // Safari will not seek a video it has never played. Priming it muted and
      // pausing on the same tick makes the timeline seekable without anything
      // ever appearing to play by itself.
      video.play().then(() => video.pause()).catch(() => {});
      readyRef.current = true;
      setReady(true);
      onScroll();
      video.removeEventListener("loadeddata", check);
    };

    let frame = 0;
    let wanted = 0;

    const onScroll = () => {
      // Everything is measured rather than hardcoded, so a change to the
      // header's height needs no change here. The panel is shorter than the
      // viewport by exactly the header, which is where it sticks.
      const panelH = panel.offsetHeight;
      const stickTop = window.innerHeight - panelH;
      const distance = outer.offsetHeight - panelH;
      if (distance <= 0) return;

      const top = outer.getBoundingClientRect().top;
      const progress = Math.min(Math.max((stickTop - top) / distance, 0), 1);

      const duration = video.duration;
      if (Number.isFinite(duration) && duration > 0) {
        // Held a hair inside the end: seeking to exactly duration parks some
        // browsers on a blank frame.
        wanted = Math.min(progress * duration, duration - 0.05);
      }

      // Beats are evenly spaced, so the words change on the quarters of the
      // film rather than at points that have to be kept in step with it.
      setBeat(Math.min(Math.floor(progress * beats.length), beats.length - 1));

      if (!frame) {
        frame = requestAnimationFrame(() => {
          frame = 0;
          // Seeking is the expensive part, so it happens once per painted
          // frame rather than once per scroll event, and only when the target
          // has actually moved.
          if (readyRef.current && Math.abs(video.currentTime - wanted) > 0.01) {
            video.currentTime = wanted;
          }
        });
      }
    };

    video.addEventListener("loadeddata", check);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // A reload part-way down the page runs the first pass before the film
    // knows its own duration, which leaves it parked on frame one under words
    // from beat three. Running again on metadata puts it where the scroll
    // position says it should be.
    video.addEventListener("loadedmetadata", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      video.removeEventListener("loadedmetadata", onScroll);
      video.removeEventListener("loadeddata", check);
      dead = true;
      if (url) URL.revokeObjectURL(url);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [showFilm, beats.length]);

  const words = (
    <div className="container container--wide sfilm__inner">
      <div className="sfilm__content">
        {/* Both stacks keep every beat mounted and swap which one is visible.
            visibility:hidden takes the others out of the accessibility tree
            on its own, so there is no aria bookkeeping to fall out of step. */}
        <div className="sfilm__stack sfilm__stack--eyebrow">
          {beats.map((b, i) => (
            <span
              key={b.eyebrow}
              className={`sfilm__eyebrow${i === beat ? " is-on" : ""}`}
            >
              {b.eyebrow}
            </span>
          ))}
        </div>

        <h1 className="sfilm__title">Cars worth putting our name on</h1>

        <div className="sfilm__stack sfilm__stack--sub">
          {beats.map((b, i) => (
            <p key={b.eyebrow} className={`sfilm__sub${i === beat ? " is-on" : ""}`}>
              {b.body}
            </p>
          ))}
        </div>

        <div className="sfilm__actions">
          <Button to="/cars" variant="tan" arrow>
            See the cars
          </Button>
          <Button href={site.phoneHref} variant="outline-white">
            Call {site.phoneDisplay}
          </Button>
        </div>
      </div>
    </div>
  );

  // Reduced motion and save-data: one screen, one still, no pinning and
  // nothing tied to the scroll. The film is never fetched.
  if (!scrub) {
    return (
      <section className="sfilm sfilm--still">
        <div className="sfilm__panel">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={poster} alt="" className="sfilm__media" />
          <span className="sfilm__scrim" />
          {words}
        </div>
      </section>
    );
  }

  return (
    // Four screens of scroll for four beats: a screen of reading each. Any
    // less and the film runs out before the words have been read.
    <section ref={outerRef} className="sfilm">
      <div ref={panelRef} className="sfilm__panel sfilm__panel--sticky">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={poster}
          alt=""
          className={`sfilm__media sfilm__poster${ready ? " is-gone" : ""}`}
        />
        {showFilm && (
          <video
            ref={videoRef}
            /* No src: the effect fetches the film and assigns a blob URL. See
               the note there for why a plain src cannot be scrubbed here. */
            muted
            playsInline
            tabIndex={-1}
            aria-hidden="true"
            className={`sfilm__media${ready ? " is-ready" : ""}`}
          />
        )}
        <span className="sfilm__scrim" />
        {words}
        <span className="sfilm__dots" aria-hidden="true">
          {beats.map((b, i) => (
            <span key={b.eyebrow} className={i === beat ? "is-on" : undefined} />
          ))}
        </span>
      </div>
    </section>
  );
}
