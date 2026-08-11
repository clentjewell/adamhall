import { requireAdmin } from "@/lib/admin";
import AdminNav2 from "@/components/site/AdminNav2";

export const metadata = {
  robots: { index: false, follow: false },
};

/**
 * Redesigned dealer console shell (route: /admin2), built to the
 * "Carmarketplace UI mockups" artifact, frame 1l.
 *
 * Security note: this layout calls the SAME requireAdmin() gate as the live
 * admin layout — session plus an admin_users allowlist row, redirecting to
 * /admin/login otherwise — and RLS enforces the same thing at the data layer.
 * middleware.ts also lists /admin2 explicitly, because its `/admin/:path*`
 * matcher does not cover `/admin2`.
 */
export default async function Admin2Layout({
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
