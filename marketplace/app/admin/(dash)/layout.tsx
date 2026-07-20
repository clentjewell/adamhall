import { requireAdmin } from "@/lib/admin";
import AdminNav from "@/components/admin/AdminNav";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:grid md:grid-cols-[210px_1fr] md:gap-8">
      <AdminNav adminName={admin.name} />
      <div className="mt-6 md:mt-0 min-w-0">{children}</div>
    </div>
  );
}
