import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// The only /admin pages a signed-out visitor may see. /admin/reset-password
// is not among them by design: the recovery link signs the visitor in before
// sending them there, so arriving without a session means the link was spent
// or faked, and the bounce to login is the right answer.
const PUBLIC_ADMIN_PATHS = new Set(["/admin/login", "/admin/forgot-password"]);

// The only paths that read a Supabase session. The matcher below covers the
// whole site so the preview gate can sit in front of it, and refreshing a
// token on the FAQ page would put a network round-trip on every request.
const SESSION_PATHS = ["/admin", "/admin-old", "/account"];

// ---------------------------------------------------------------------------
// Preview gate
//
// The real domain resolves but the site is not being announced yet, so every
// route sits behind a password screen. This is a page with a form rather than
// HTTP Basic auth: the browser's native dialog is unbranded, gives no room to
// say what the site is or who to ask for access, and cannot be signed out of
// without closing the browser.
//
// Keyed off an environment variable, not a constant in the code, so going
// live is `wrangler secret delete SITE_LOCK_PASSWORD` plus a redeploy — no
// diff to review and nothing anyone has to remember to revert. No password
// set means the site is open, which is the correct end state.
// ---------------------------------------------------------------------------
const GATE_COOKIE = "cm_preview";
const GATE_LOGIN_PATH = "/__preview-login";
const GATE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// The wordmark on the gate is the one asset allowed through it. It is a 36KB
// path-heavy SVG, so inlining it would bloat every render of this page, and
// it is public brand material that already appears on Adam's main site — no
// harm in serving it, and the page looks like the business it belongs to.
const GATE_ASSETS = new Set(["/brand/car-marketplace-logo-white.svg"]);

const encoder = new TextEncoder();

// Length-independent comparison, so the password cannot be recovered a
// character at a time by timing the response.
function equal(a: string, b: string): boolean {
  const x = encoder.encode(a);
  const y = encoder.encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  }
  return diff === 0;
}

// The cookie holds an HMAC of a fixed string keyed by the password, never the
// password itself. Nothing readable is stored on the visitor's machine, and a
// cookie cannot be forged without knowing the secret. Changing the password
// changes the digest, which signs everyone out — which is what you want.
async function sessionToken(password: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode("carmarketplace-preview-v1"),
  );
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Only ever bounce back to a path on this site. Without this the redirect
// field on the form would be an open redirect: anyone could send a link that
// lands on the gate and forwards to a site of their choosing once entered.
function safeRedirect(value: string): string {
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function gatePage(redirectTo: string, failed: boolean): string {
  return `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Car Marketplace — private preview</title>
<link rel="stylesheet" href="https://use.typekit.net/knr6tgk.css">
<style>
  :root {
    --green: #004438;
    --green-deep: #003a30;
    --sand: #f3dcb3;
    --sand-dark: #e7c68e;
    --cream: #f7f6f2;
    --ink: #2f3833;
    --meta: #7b827d;
    --hairline: #e4e1d8;
    --display: "neue-haas-grotesk-display", "Helvetica Neue", Helvetica, Arial, sans-serif;
    --body: "mr-eaves-modern", "Avenir Next", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100dvh;
    display: grid;
    place-items: center;
    padding: 2rem 1.25rem;
    background: var(--green);
    color: var(--ink);
    font-family: var(--body);
    font-size: 1.3125rem;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }
  .wrap { width: 100%; max-width: 27rem; }
  .mark { display: block; width: 190px; height: auto; margin: 0 auto 2rem; }
  .card {
    background: var(--cream);
    border-radius: 16px;
    padding: 2.25rem 2rem 2rem;
    box-shadow: 0 18px 50px rgba(0, 0, 0, 0.22);
  }
  .eyebrow {
    font-family: var(--display);
    font-size: 0.8125rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--meta);
    margin: 0 0 0.5rem;
  }
  h1 {
    font-family: var(--display);
    font-weight: 900;
    font-size: 2rem;
    line-height: 1.05;
    letter-spacing: -0.03em;
    color: #000;
    margin: 0 0 0.75rem;
  }
  p.lead { margin: 0 0 1.75rem; color: var(--ink); text-wrap: pretty; }
  label {
    display: block;
    font-family: var(--display);
    font-size: 0.8125rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--meta);
    margin-bottom: 0.5rem;
  }
  /* Selected on the wrapper, not on [type="password"]: the reveal button
     switches the input to type="text", and an attribute selector would drop
     every one of these rules the moment it did. */
  .field input {
    width: 100%;
    min-height: 52px;
    padding: 0.75rem 1rem;
    font-family: var(--body);
    font-size: 1.3125rem;
    color: var(--ink);
    background: #fff;
    border: 1px solid var(--hairline);
    border-radius: 10px;
  }
  .field input:focus-visible {
    outline: 3px solid var(--green);
    outline-offset: 1px;
    border-color: var(--green);
  }
  /* The reveal sits inside the field's box rather than beside it, so the
     input keeps the full width and the row height stays at the 52px target. */
  .field { position: relative; }
  .field input { padding-right: 4.5rem; }
  #reveal {
    position: absolute;
    top: 50%;
    right: 0.375rem;
    transform: translateY(-50%);
    margin: 0;
    width: auto;
    min-height: 44px;
    padding: 0 0.75rem;
    font-family: var(--display);
    font-size: 0.8125rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--meta);
    background: none;
    border-radius: 8px;
  }
  #reveal:hover { background: none; color: var(--green); transform: translateY(-50%); }
  button {
    margin-top: 1.25rem;
    width: 100%;
    min-height: 52px;
    padding: 0.875rem 1.5rem;
    font-family: var(--display);
    font-size: 1.3125rem;
    font-weight: 700;
    letter-spacing: 0.5px;
    color: #000;
    background: var(--sand);
    border: 0;
    border-radius: 999px;
    cursor: pointer;
    transition: background-color 0.25s ease, transform 0.25s ease;
  }
  button:hover { background: var(--sand-dark); transform: translateY(-2px); }
  button:focus-visible { outline: 3px solid var(--green); outline-offset: 2px; }
  .error {
    margin: 0 0 1.25rem;
    padding: 0.75rem 1rem;
    border-radius: 10px;
    background: #f9f0e0;
    border: 1px solid #d99a4e;
    font-size: 1.0625rem;
    color: var(--ink);
  }
  .foot {
    margin: 1.5rem 0 0;
    text-align: center;
    font-size: 1.0625rem;
    color: rgba(255, 255, 255, 0.62);
  }
  @media (prefers-reduced-motion: reduce) {
    button { transition: none; }
    button:hover { transform: none; }
  }
</style>
</head>
<body>
  <main class="wrap">
    <img class="mark" src="/brand/car-marketplace-logo-white.svg" alt="Car Marketplace by Adam Hall">
    <div class="card">
      <p class="eyebrow">Private preview</p>
      <h1>Not open to the public yet</h1>
      <p class="lead">This site is still being built. Enter the preview password to take a look.</p>
      ${failed ? '<p class="error" role="alert">That password is not right. Try again.</p>' : ""}
      <!-- The field is deliberately not called "password" and asks for no
           autocomplete. A shared preview password gets changed and re-shared,
           and a browser that has saved the previous one will refill it into a
           masked field where nobody can see it is stale — which reads to the
           person as "the password you gave me is wrong". -->
      <form method="POST" action="${GATE_LOGIN_PATH}" autocomplete="off">
        <label for="preview-key">Preview password</label>
        <!-- autocapitalize off matters on a phone: the first letter of a
             lowercase password gets capitalised silently, and in a masked
             field there is no way to see it happened. -->
        <div class="field">
          <input id="preview-key" type="password" name="preview_key"
                 autocomplete="off" autocapitalize="none" autocorrect="off"
                 spellcheck="false" autofocus required>
          <button type="button" id="reveal" aria-label="Show password">Show</button>
        </div>
        <input type="hidden" name="redirect" value="${escapeHtml(redirectTo)}">
        <button type="submit">Continue</button>
      </form>
    </div>
    <p class="foot">Car Marketplace by Adam Hall</p>
  </main>
  <script>
    // Lets someone see what is actually in the box. A masked field hides the
    // two things that break this most often — a password manager quietly
    // refilling an old value, and a trailing space carried in from a paste —
    // and turns both into "the password you gave me is wrong".
    (function () {
      var input = document.getElementById("preview-key");
      var toggle = document.getElementById("reveal");
      if (!input || !toggle) return;
      toggle.addEventListener("click", function () {
        var masked = input.type === "password";
        input.type = masked ? "text" : "password";
        toggle.textContent = masked ? "Hide" : "Show";
        toggle.setAttribute("aria-label", masked ? "Hide password" : "Show password");
        input.focus();
      });
    })();
  </script>
</body>
</html>`;
}

function gateResponse(redirectTo: string, failed: boolean): NextResponse {
  return new NextResponse(gatePage(redirectTo, failed), {
    // 401 rather than 200, so a crawler that reaches this records "not
    // authorised" rather than indexing the gate as if it were the site. No
    // WWW-Authenticate header, so the browser renders this page instead of
    // opening its own dialog over the top of it.
    status: 401,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

async function preview(
  request: NextRequest,
  password: string,
): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;
  if (GATE_ASSETS.has(pathname)) return null;

  const expected = await sessionToken(password);

  if (pathname === GATE_LOGIN_PATH) {
    // Someone landing here by typing the URL or hitting back gets the gate,
    // not a method-not-allowed page.
    if (request.method !== "POST") return gateResponse("/", false);

    const form = await request.formData();
    // "password" is still read as a fallback so a page left open in someone's
    // tab from before this change still submits successfully.
    //
    // Trimmed, because this password gets pasted out of chat messages and
    // emails, and a copied trailing space is invisible in a masked field. It
    // failed, the person saw "that password is not right", and there was no
    // way for them to tell why. A leading or trailing space is never part of
    // a password anyone means to type.
    const supplied = String(
      form.get("preview_key") ?? form.get("password") ?? "",
    ).trim();
    const redirectTo = safeRedirect(String(form.get("redirect") ?? "/"));

    if (!equal(supplied, password)) return gateResponse(redirectTo, true);

    // 303, so the browser follows with GET rather than re-POSTing the form.
    const response = NextResponse.redirect(new URL(redirectTo, request.url), 303);
    response.cookies.set(GATE_COOKIE, expected, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: GATE_MAX_AGE,
    });
    return response;
  }

  if (equal(request.cookies.get(GATE_COOKIE)?.value ?? "", expected)) return null;

  return gateResponse(`${pathname}${request.nextUrl.search}`, false);
}

export async function middleware(request: NextRequest) {
  const password = process.env.SITE_LOCK_PASSWORD;
  if (password) {
    const blocked = await preview(request, password);
    if (blocked) return blocked;
  }

  const { pathname } = request.nextUrl;

  const needsSession = SESSION_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (!needsSession) return NextResponse.next();

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

  // `startsWith("/admin")` covers /admin-old too, which is intended: the old
  // console is kept for comparison and should not be readable signed out.
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

// Everything, with no exclusions, so the gate is genuinely in front of the
// whole site: pages, API routes, robots.txt, the sitemap, the files in /public
// and Next's own compiled CSS and JS alike.
//
// The compiled bundles could defensibly be left out — they carry a content
// hash and are useless without the HTML that references them — but "password
// protected" should not come with an asterisk, and the check is a hash and a
// string comparison. The Supabase round-trip, which is the part that actually
// costs something, is narrowed to SESSION_PATHS above.
export const config = {
  matcher: ["/(.*)"],
};
