"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * The looping film behind a page header band.
 *
 * Distinct from HeroVideo, which is the home page's full-height treatment and
 * pairs a film with a separate still. Here the film carries its own first
 * frame as the poster, so there is nothing to fall out of step with it and no
 * jump when playback starts.
 *
 * It fades in once it is actually playing. Until then, and permanently for
 * anyone on reduced motion or save-data, the band is the green ground with
 * the scrim over it, which is what the headings were designed to sit on
 * anyway. So the header reads correctly whether or not the film ever arrives.
 */
export default function HeaderFilm({ src }: { src: string }) {
  const reduce = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [saveData, setSaveData] = useState(false);

  useEffect(() => {
    const conn = (navigator as { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) setSaveData(true);
  }, []);

  const wantVideo = !reduce && !saveData;

  useEffect(() => {
    if (!wantVideo) return;
    // Autoplay can be refused (low power mode and similar). The band simply
    // stays on its green ground when that happens.
    videoRef.current?.play().catch(() => {});
  }, [wantVideo]);

  return (
    <div className="mp2-headfilm" aria-hidden="true">
      {wantVideo && (
        <video
          ref={videoRef}
          src={src}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          tabIndex={-1}
          onPlaying={() => setPlaying(true)}
          className={playing ? "is-playing" : undefined}
        />
      )}
      <span className="mp2-headfilm__scrim" />
    </div>
  );
}
