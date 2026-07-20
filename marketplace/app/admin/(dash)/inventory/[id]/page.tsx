import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { requireAdmin } from "@/lib/admin";
import { carTitle } from "@/lib/format";
import type { Car } from "@/lib/types";
import CarForm from "@/components/admin/CarForm";
import CarStatusButtons from "@/components/admin/CarStatusButtons";
import StatusBadge from "@/components/admin/StatusBadge";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCarPage({ params }: Props) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data: car } = await supabase
    .from("cars")
    .select("*")
    .eq("id", id)
    .maybeSingle<Car>();
  if (!car) notFound();

  return (
    <div>
      <Link href="/admin/inventory" className="btn-ghost text-sm -ml-3 mb-3">
        <ArrowLeft size={16} weight="bold" />
        Inventory
      </Link>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <h1 className="font-display font-extrabold text-2xl">{carTitle(car)}</h1>
        <StatusBadge status={car.status} />
        <CarStatusButtons carId={car.id} status={car.status} slug={car.slug} />
      </div>
      {car.source_submission_id && (
        <p className="text-sm text-stone-500 mb-6">
          Built from{" "}
          <Link href={`/admin/submissions/${car.source_submission_id}`} className="text-forest-700 font-semibold underline">
            this submission
          </Link>
          . The seller&apos;s photos were copied across.
        </p>
      )}
      <CarForm car={car} />
    </div>
  );
}
