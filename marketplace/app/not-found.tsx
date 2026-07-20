import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-24 text-center">
      <h1 className="font-display font-extrabold text-4xl">That page has moved on</h1>
      <p className="mt-3 text-stone-600 max-w-[46ch] mx-auto">
        Like a good car, whatever was here didn&apos;t stick around. The current
        stock is one tap away.
      </p>
      <Link href="/cars" className="btn-primary mt-8">
        Browse the cars
      </Link>
    </div>
  );
}
