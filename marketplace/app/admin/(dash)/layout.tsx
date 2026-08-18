import { requireAdmin } from "@/lib/admin";
import AdminNav2 from "@/components/site/AdminNav2";

export const metadata = {
  robots: { index: false, follow: false },
};

/**
 * The dealer console shell (route: /admin), built to the
 * "Carmarketplace UI mockups" artifact, frame 1l.
 *
 * Every console page renders inside this, so the redesign reaches the
 * sub-pages — inventory, enquiries, buyers and the rest — without each
 * needing its own change.
 *
 * Security note: requireAdmin() here is session plus an admin_users allowlist
 * row, redirecting to /admin/login otherwise, and RLS enforces the same thing
 * at the data layer. Every page calls it again for itself.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="ah-site mp-admin2">
      <div className="mp2-console">
        <AdminNav2 adminName={admin.name} />
        <div className="mp2-console__main">{children}</div>
      </div>
    </div>
  );
}
