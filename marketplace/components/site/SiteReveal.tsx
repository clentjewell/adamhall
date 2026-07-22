"use client";

import { useReveal } from "./useReveal";

/** Client-only helper: activates the scroll-reveal IntersectionObserver on a
    ported (server-rendered) page. Renders nothing. */
export default function SiteReveal() {
  useReveal();
  return null;
}
