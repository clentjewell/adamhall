import { requireAdmin } from "@/lib/admin";
import AdminNav from "@/components/admin/AdminNav";

export const metadata = {
  robots: { index: false, follow: false },
};

/**
 * The previous console shell, kept at /admin-old so the two can be looked at
 * side by side. Only the dashboard lives under it — every working sub-page
 * stayed at /admin and now renders in the redesigned shell, so this is an
 * archive of the chrome and the dashboard, not a second console.
 */

export default async function AdminOldLayout({
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
