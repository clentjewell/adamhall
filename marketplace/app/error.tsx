"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-24 text-center">
      <h1 className="font-display font-extrabold text-4xl">Something hiccuped</h1>
      <p className="mt-3 text-stone-600 max-w-[46ch] mx-auto">
        Not your fault. Give it another go, and if it keeps happening, call us
        and we&apos;ll sort you out the old-fashioned way.
      </p>
      <button onClick={reset} className="btn-primary mt-8">
        Try again
      </button>
    </div>
  );
}
