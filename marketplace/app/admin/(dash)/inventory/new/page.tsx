import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import CarForm from "@/components/admin/CarForm";

export default function NewCarPage() {
  return (
    <div>
      <Link href="/admin/inventory" className="btn-ghost text-sm -ml-3 mb-3">
        <ArrowLeft size={16} weight="bold" />
        Inventory
      </Link>
      <h1 className="font-display font-extrabold text-2xl mb-6">New listing</h1>
      <CarForm car={null} />
    </div>
  );
}
