import Link from "next/link";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { requireAdmin } from "@/lib/admin";
import type { Car } from "@/lib/types";
import InventoryList from "@/components/admin/InventoryList";

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
      <InventoryList cars={cars ?? []} />
    </div>
  );
}
