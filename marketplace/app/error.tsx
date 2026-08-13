"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="page-shell py-24 text-center">
      <h1 className="type-heading">Something hiccuped</h1>
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
