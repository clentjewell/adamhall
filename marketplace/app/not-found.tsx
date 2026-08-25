import { Link } from "next-view-transitions";

export default function NotFound() {
  return (
    <div className="page-shell section-y-lg text-center">
      <h1 className="type-heading">That page has moved on</h1>
      <p className="mt-3 text-stone-600 max-w-[46ch] mx-auto">
        Like a good car, whatever was here didn&apos;t stick around. The current
        stock is one tap away.
      </p>
      <Link href="/" className="btn-primary mt-8">
        Browse the cars
      </Link>
    </div>
  );
}
