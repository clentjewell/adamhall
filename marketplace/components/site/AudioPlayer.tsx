"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import type { CSSProperties } from "react";
import type { Episode } from "@/lib/site-data/episodes";

function fmt(t: number) {
  if (!isFinite(t) || t < 0) t = 0;
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/* Transcripts are large, so they live in /data/transcripts.json and are
   fetched once on first use, then cached module-wide. */
let transcriptsCache: Record<string, string> | null = null;
let transcriptsPromise: Promise<Record<string, string>> | null = null;
function loadTranscripts(): Promise<Record<string, string>> {
  if (transcriptsCache) return Promise.resolve(transcriptsCache);
  if (!transcriptsPromise) {
    transcriptsPromise = fetch("/data/transcripts.json")
      .then((r) => (r.ok ? r.json() : {}))
      .then((d) => (transcriptsCache = d))
      .catch(() => (transcriptsCache = {}));
  }
  return transcriptsPromise;
}

/** Episode player card replicating the reference (AudioIgniter "full" player + Transcript toggle). */
export default function AudioPlayer({ episode }: { episode: Episode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  const [ready, setReady] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);

  useEffect(() => {
    if (showTranscript && transcript === null) {
      loadTranscripts().then((d) =>
        setTranscript(d[episode.id] || "Transcript unavailable."),
      );
    }
  }, [showTranscript, transcript, episode.id]);

  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      document.querySelectorAll("audio").forEach((el) => el !== a && el.pause());
      void a.play();
    } else {
      a.pause();
    }
  }, []);

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const a = audioRef.current;
    if (!a) return;
    const v = Number(e.target.value);
    a.currentTime = v;
    setCur(v);
  };

  return (
    <article className="ap reveal">
      <div className="ap__main">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="ap__cover"
          src={episode.cover}
          alt={`${episode.title} cover`}
          loading="lazy"
          width={96}
          height={96}
        />
        <div className="ap__body">
          <div className="ap__head">
            <button
              type="button"
              className={`ap__play ${playing ? "is-playing" : ""}`}
              onClick={toggle}
              aria-label={playing ? `Pause ${episode.title}` : `Play ${episode.title}`}
            >
              {playing ? (
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <rect x="6" y="5" width="4" height="14" fill="currentColor" />
                  <rect x="14" y="5" width="4" height="14" fill="currentColor" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M7 4l13 8-13 8z" fill="currentColor" />
                </svg>
              )}
            </button>
            <h3 className="ap__title">{episode.title}</h3>
          </div>

          <div className="ap__controls">
            <input
              className="ap__seek"
              type="range"
              min={0}
              max={dur || 0}
              step={0.1}
              value={cur}
              onChange={onSeek}
              disabled={!ready}
              aria-label="Seek"
              style={
                { ["--pct"]: `${dur ? (cur / dur) * 100 : 0}%` } as CSSProperties
              }
            />
            <span className="ap__time">
              {playing || cur > 0 ? fmt(cur) : fmt(dur)}
            </span>
          </div>
        </div>
      </div>

      {/* Now-playing track bar */}
      <div className="ap__track" aria-hidden="true">
        {episode.title}
      </div>

      {/* Transcript toggle */}
      <div className={`ap__transcript ${showTranscript ? "is-open" : ""}`}>
        <h4 className="ap__transcript-head">
          <button
            type="button"
            aria-expanded={showTranscript}
            onClick={() => setShowTranscript((s) => !s)}
          >
            <span className="wavy">Transcript</span>
            <svg
              className="ap__transcript-chev"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M9 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </h4>
        {showTranscript && (
          <div className="ap__transcript-body">
            {transcript === null ? (
              <p>Loading transcript…</p>
            ) : (
              <p>{transcript}</p>
            )}
          </div>
        )}
      </div>

      <audio
        ref={audioRef}
        src={episode.audio}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onLoadedMetadata={(e) => {
          setDur(e.currentTarget.duration);
          setReady(true);
        }}
        onTimeUpdate={(e) => setCur(e.currentTarget.currentTime)}
      />
    </article>
  );
}
