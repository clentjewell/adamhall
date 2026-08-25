"use client";

import { motion, useReducedMotion } from "motion/react";

// Route-change transition: a quick fade-and-rise on every navigation so
// pages arrive instead of snapping. Fast enough to never feel like a wait.
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
