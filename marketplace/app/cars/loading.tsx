export default function CarsLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="skeleton h-10 w-64" />
      <div className="skeleton h-5 w-96 mt-3" />
      <div className="mt-10 grid gap-8 lg:grid-cols-[260px_1fr]">
        <div className="skeleton h-96 hidden lg:block rounded-2xl" />
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="skeleton aspect-[3/2] !rounded-none" />
              <div className="p-4 space-y-3">
                <div className="skeleton h-5 w-3/4" />
                <div className="skeleton h-6 w-1/3" />
                <div className="skeleton h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
