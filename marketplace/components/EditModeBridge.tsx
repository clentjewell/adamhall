"use client";

import { useEffect } from "react";

// Mounted once in the root layout by the admin, never on the public site.
// When the mini-site is loaded inside the admin's edit iframe (with
// ?edit=1 on first load, remembered via sessionStorage after that), this
// makes every [data-edit] element inline-editable and bridges edits back
// to the parent admin frame via postMessage.
export default function EditModeBridge() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("edit") === "1") {
        window.sessionStorage.setItem("ah-edit", "1");
      }
    } catch {
      // sessionStorage can throw in some privacy modes — safe to ignore.
    }

    let active = false;
    try {
      active =
        window.self !== window.top &&
        window.sessionStorage.getItem("ah-edit") === "1";
    } catch {
      active = false;
    }
    if (!active) return;

    document.documentElement.classList.add("edit-mode");

    const editableEls = Array.from(
      document.querySelectorAll<HTMLElement>("[data-edit]"),
    );
    for (const el of editableEls) {
      try {
        el.contentEditable = "plaintext-only";
        if (el.contentEditable !== "plaintext-only") {
          el.contentEditable = "true";
        }
      } catch {
        el.contentEditable = "true";
      }
      el.spellcheck = false;
    }

    function handleInput(e: Event) {
      const target = e.target as Element | null;
      const el = target?.closest<HTMLElement>("[data-edit]");
      if (!el) return;
      const path = el.getAttribute("data-edit");
      if (!path) return;
      window.parent.postMessage(
        { type: "ah-edit", path, value: el.innerText },
        window.location.origin,
      );
    }

    function handleClickCapture(e: MouseEvent) {
      const target = e.target as Element | null;
      if (target?.closest("[data-edit]")) {
        e.preventDefault();
        e.stopPropagation();
      }
    }

    function handleMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      const data = e.data as { type?: string; edits?: Record<string, string> } | null;
      if (!data || data.type !== "ah-apply" || !data.edits) return;
      const edits = data.edits;
      const targets = document.querySelectorAll<HTMLElement>("[data-edit]");
      for (const [path, value] of Object.entries(edits)) {
        targets.forEach((el) => {
          if (el.getAttribute("data-edit") === path) {
            el.innerText = value;
          }
        });
      }
    }

    document.addEventListener("input", handleInput);
    document.addEventListener("click", handleClickCapture, true);
    window.addEventListener("message", handleMessage);

    window.parent.postMessage(
      { type: "ah-ready", path: window.location.pathname },
      window.location.origin,
    );

    return () => {
      document.removeEventListener("input", handleInput);
      document.removeEventListener("click", handleClickCapture, true);
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return null;
}
