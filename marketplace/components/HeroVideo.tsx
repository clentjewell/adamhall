"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

// Looping background video for the home hero. The still hero image is the
// poster and the permanent fallback: reduced-motion users, save-data users
// and any playback failure all get the photo instead of the loop.
export default function HeroVideo({
  src,
  poster,
  posterAlt,
}: {
  src: string;
  poster: string;
  posterAlt: string;
}) {
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
    // Autoplay can be rejected (low-power mode etc.) — the poster stays.
    videoRef.current?.play().catch(() => {});
  }, [wantVideo]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <Image
        src={poster}
        alt={posterAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {wantVideo && (
        <video
          ref={videoRef}
          src={src}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
          tabIndex={-1}
          onPlaying={() => setPlaying(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            playing ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}
