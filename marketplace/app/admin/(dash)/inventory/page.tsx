import Image from "next/image";
import Link from "next/link";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { requireAdmin } from "@/lib/admin";
import { carTitle, formatKm, formatPrice, timeAgo } from "@/lib/format";
import type { Car } from "@/lib/types";
import StatusBadge from "@/components/admin/StatusBadge";
import CarStatusButtons from "@/components/admin/CarStatusButtons";

export default async function InventoryPage() {
  const { supabase } = await requireAdmin();
  const { data: cars } = await supabase
    .from("cars")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Car[]>();

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="font-display font-extrabold text-2xl">Inventory</h1>
        <Link href="/admin/inventory/new" className="btn-primary !py-2.5 text-sm">
          <Plus size={16} weight="bold" />
          New listing
        </Link>
      </div>

      {(cars ?? []).length === 0 ? (
        <div className="card p-10 text-center text-stone-500">
          No listings yet. Create one, or convert an accepted submission.
        </div>
      ) : (
        <div className="space-y-3">
          {(cars ?? []).map((car) => (
            <div key={car.id} className="card p-4 flex flex-wrap items-center gap-4">
              <Link
                href={`/admin/inventory/${car.id}`}
                className="relative w-24 aspect-[3/2] rounded-lg overflow-hidden bg-stone-100 shrink-0"
              >
                {car.photos[0] && (
                  <Image src={car.photos[0].url} alt="" fill sizes="96px" className="object-cover" />
                )}
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/admin/inventory/${car.id}`} className="font-display font-bold hover:text-forest-700 truncate block">
                  {carTitle(car)}
                </Link>
                <p className="text-sm text-stone-500">
                  {formatPrice(car.price)} · {formatKm(car.odometer_km)} · added {timeAgo(car.created_at)}
                </p>
              </div>
              <StatusBadge status={car.status} />
              <CarStatusButtons carId={car.id} status={car.status} slug={car.slug} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
