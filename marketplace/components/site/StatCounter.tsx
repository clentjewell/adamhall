"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

export interface Stat {
  end: number;
  prefix?: string;
  suffix?: string;
  title: string;
  icon?: ReactNode;
}

function useCountUp(end: number, run: boolean, duration = 1800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    let start: number | null = null;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(eased * end));
      if (p < 1) raf = requestAnimationFrame(step);
      else setVal(end);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [end, run, duration]);
  return val;
}

function StatItem({ stat, run }: { stat: Stat; run: boolean }) {
  const val = useCountUp(stat.end, run);
  return (
    <div className="stat">
      <div className="stat__row">
        <div className="stat__number">
          {stat.prefix}
          {val.toLocaleString("en-AU")}
          {stat.suffix}
        </div>
        {stat.icon && (
          <span className="stat__icon" aria-hidden="true">
            {stat.icon}
          </span>
        )}
      </div>
      <div className="stat__title">{stat.title}</div>
    </div>
  );
}

export default function StatCounter({ stats }: { stats: Stat[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setRun(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div className="stats" ref={ref}>
      {stats.map((s) => (
        <StatItem key={s.title} stat={s} run={run} />
      ))}
    </div>
  );
}
