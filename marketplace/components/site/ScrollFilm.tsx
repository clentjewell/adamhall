"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
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
 * Each beat carries its own eyebrow, headline and line, and they change on
 * the half screen. Only the first headline is an h1; the other three are
 * paragraphs wearing its type, so the document keeps exactly one heading
 * whatever the scroll position is and a crawler still finds the page's real
 * headline in the markup.
 *
 * Every beat is mounted from the first paint and only its visibility changes,
 * so nothing mounts or unmounts as the reader scrolls, and all four share one
 * grid cell so the line below them never moves.
 *
 * It degrades to the treatment it replaced:
 *
 *   - Reduced motion gets one still frame, no pinning, no scroll linkage.
 *   - Save-data gets the same. Neither ever fetches the film: it is not in
 *     the server's HTML, so nothing starts downloading before the preference
 *     is known.
 *   - If the film never decodes, the panel keeps its poster and its words.
 */

/* The title is a node, not a string: each one carries a single sand word —
   the accent device the valuation band and the stock flags already use, where
   the accent marks the thing that matters rather than the whole line. The
   eyebrow is the key everywhere below, since it is the beat's one unique
   string. */
type Beat = { eyebrow: string; title: ReactNode; body: string };


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
  // The headlines are one sentence told in four parts — worth, chosen,
  // checked, waiting — so each one carries the last forward instead of
  // restarting the pitch. Read end to end they are the whole proposition:
  // cars worth our name, chosen one at a time, checked before you see them,
  // waiting on the lot.
  const beats: Beat[] = [
    {
      eyebrow: "Gold Coast · Brisbane · Northern Rivers",
      title: (
        <>
          Cars worth putting our <span className="sfilm__accent">name</span> on
        </>
      ),
      body:
        "Every car here is one we decided was worth buying. What the listing says is what you get.",
    },
    {
      eyebrow: "On the lot now",
      title: (
        <>
          Chosen <span className="sfilm__accent">one at a time</span>
        </>
      ),
      body:
        inStock > 0
          ? `${inStock} car${inStock === 1 ? "" : "s"} in the range right now. A short list, not a classifieds wall.`
          : "A short, hand-picked range rather than a classifieds wall.",
    },
    {
      eyebrow: "Nothing left out",
      title: (
        <>
          <span className="sfilm__accent">Checked</span> before you see them
        </>
      ),
      body:
        "PPSR checked, the books gone through, and any fault named in the description.",
    },
    {
      // The film lands on the lot, and the words turn to face both jobs the
      // site does: the body offers the trade-in path and the second button
      // below swaps from the phone to the valuation tool on this beat, so the
      // hero unpins straight into the buying/selling split it sits above.
      eyebrow: "Twenty-seven years picking cars",
      title: (
        <>
          Waiting for you on the <span className="sfilm__accent">lot</span>
        </>
      ),
      body:
        "Have a look at what is on the lot, or see what yours is worth if you are trading in.",
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
    //
    // That the whole file is in memory before the first seek is also why the
    // film no longer has to be all-intra. See lib/heroes.ts — dropping that
    // requirement is what paid for the picture quality.
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
      // Land on the right frame rather than easing up to it. Someone who
      // reloaded half way down the page should not watch the film sweep from
      // the beginning to catch them up; the easing is for scrolling, not for
      // arriving.
      shown = target;
      video.currentTime = shown;
      video.removeEventListener("loadeddata", check);
    };

    let frame = 0;
    /** Where the scroll says the film should be. */
    let target = 0;
    /** Where the film actually is, easing toward the target. */
    let shown = 0;

    // Easing the film toward the scroll, rather than pinning it to the scroll,
    // is what makes this read as motion instead of stepping.
    //
    // Scroll events do not arrive smoothly: they come in bursts, at whatever
    // rate the device feels like, and a wheel notch delivers a large jump in
    // one event. A film pinned straight to that inherits every bit of the
    // jitter, which is what made the first version feel steppy. Following the
    // target by a fixed fraction of the remaining distance each painted frame
    // turns a burst of events into one continuous move, and keeps the film
    // going for a few frames after the reader stops, which is the part that
    // actually reads as smooth.
    //
    // 0.12 a frame settles ~95% inside about 400ms at 60Hz: the identity's
    // longest step, and still tight enough to feel like direct control of the
    // film rather than the film drifting on its own. It came down from 0.18
    // when the section shortened to 300vh: the same film over less scroll
    // means a given flick of the wheel asks for more film, and holding the
    // old figure would have made each painted step visibly bigger. Measured: it
    // holds the largest painted step near the 0.07s the longer section gave.
    const EASE = 0.12;
    // Seeking by less than half a frame is work the viewer cannot see. At
    // 24fps a frame is 41ms, so anything under 20ms is skipped.
    const MIN_SEEK = 0.02;

    const step = () => {
      frame = 0;
      const diff = target - shown;
      if (Math.abs(diff) < 0.006) {
        shown = target; // land exactly, then let the loop stop
      } else {
        shown += diff * EASE;
        frame = requestAnimationFrame(step);
      }
      if (readyRef.current && Math.abs(video.currentTime - shown) > MIN_SEEK) {
        video.currentTime = shown;
      }
    };

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
        target = Math.min(progress * duration, duration - 0.05);
      }

      // The words track the scroll directly rather than the eased film, so
      // they answer the reader immediately. Tying them to the easing instead
      // would make every caption arrive a beat late.
      setBeat(Math.min(Math.floor(progress * beats.length), beats.length - 1));

      if (!frame) frame = requestAnimationFrame(step);
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

        {/* The headline changes with the film, but only the first one is an
            h1. The other three are paragraphs wearing the same type, so the
            document keeps exactly one heading no matter where the reader has
            scrolled to, and a crawler still finds the page's real headline in
            the markup. */}
        <div className="sfilm__stack sfilm__stack--title">
          {beats.map((b, i) =>
            i === 0 ? (
              <h1
                key={b.eyebrow}
                className={`sfilm__title${i === beat ? " is-on" : ""}`}
              >
                {b.title}
              </h1>
            ) : (
              <p
                key={b.eyebrow}
                className={`sfilm__title${i === beat ? " is-on" : ""}`}
              >
                {b.title}
              </p>
            ),
          )}
        </div>

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
          {/* The second action is a stack like the words: the phone for the
              buy-side beats, the valuation tool once the film lands on the
              lot. Both are mounted from first paint; visibility swaps them
              with the beats' own fade and keeps only one in the
              accessibility tree. */}
          <span className="sfilm__stack sfilm__stack--cta">
            <Button
              href={site.phoneHref}
              variant="outline-white"
              className={beat < beats.length - 1 ? "is-on" : ""}
            >
              Call {site.phoneDisplay}
            </Button>
            <Button
              to="/car-valuations"
              variant="outline-white"
              arrow
              className={beat === beats.length - 1 ? "is-on" : ""}
            >
              What&rsquo;s my car worth?
            </Button>
          </span>
        </div>

        {/* Four ticks for four beats, so a pinned screen says there is more
            film behind it. Decorative: the words already read one beat at a
            time. Hidden in the still treatment, where there is no sequence
            to mark. */}
        {scrub && (
          <div className="sfilm__progress" aria-hidden="true">
            {beats.map((b, i) => (
              <span key={b.eyebrow} className={i === beat ? "is-on" : ""} />
            ))}
          </div>
        )}
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
      </div>
    </section>
  );
}
