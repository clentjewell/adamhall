"use client";

import { useEffect } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { EASE } from "./Reveal";

// A number that rolls to its new value like an odometer instead of
// snapping. First render shows the value as-is; only changes animate.
// Instant under reduced motion.
export default function RollingNumber({
  value,
  format,
  className,
}: {
  value: number;
  format: (v: number) => string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => format(v));
  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, { duration: 0.55, ease: EASE });
    return () => controls.stop();
  }, [value, reduce, mv]);
  return <motion.span className={className}>{text}</motion.span>;
}
