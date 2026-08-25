import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Keeps Supabase auth cookies fresh and bounces signed-out visitors off
// /admin. The allowlist check itself happens server-side in the admin
// layout (and RLS backs everything regardless).
// The only /admin pages a signed-out visitor may see. /admin/reset-password
// is not among them by design: the recovery link signs the visitor in before
// sending them there, so arriving without a session means the link was spent
// or faked, and the bounce to login is the right answer.
const PUBLIC_ADMIN_PATHS = new Set(["/admin/login", "/admin/forgot-password"]);

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[],
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin") && !PUBLIC_ADMIN_PATHS.has(pathname) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }
  if (pathname === "/admin/login" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return response;
}

// `/admin-old` is the previous console, kept for comparison. It has to be
// listed explicitly: `/admin/:path*` matches `/admin` and `/admin/...` but
// NOT `/admin-old`, so without this entry the middleware would never run for
// it and the route would sit outside the signed-out redirect. The guard above
// is `pathname.startsWith("/admin")`, which already covers it, and every
// admin page still calls requireAdmin() server-side regardless.
//
// `/account/:path*` is here to refresh the buyer's session cookie, not to
// guard anything: the redirect above only fires for `/admin`, and every
// account page calls requireBuyer() server-side itself. Without it a buyer's
// token would go stale on exactly the pages that read it, and the account
// hub would bounce a signed-in person to the sign-in form.
export const config = {
  matcher: ["/admin/:path*", "/admin-old/:path*", "/account/:path*"],
};
