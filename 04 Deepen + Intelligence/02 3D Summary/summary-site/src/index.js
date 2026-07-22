// Adam Hall — Buy My Car · 3D Process Summary
// Password gate + static assets. Mirrors the Beyond the Clinic summary worker.

const COOKIE_NAME = "amh_session";
const SESSION_TTL = 60 * 60 * 24 * 7; // 7 days
const LOGIN_PATH = "/__auth";
const LOGO = "/assets/ah-buymycar-logo.png";

const SECURITY_HEADERS = {
  "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet",
  "X-Content-Type-Options": "nosniff",
  "Cache-Control": "no-store",
};

export default {
  async fetch(request, env) {
    const expected = env.SITE_PASSWORD;
    if (!expected) {
      return textResponse(
        "This site is not configured yet (missing SITE_PASSWORD).",
        503
      );
    }

    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === LOGIN_PATH) {
      return handleLogin(request, expected);
    }

    // The login page needs the logo before authentication.
    if (url.pathname === LOGO) {
      return env.ASSETS.fetch(request);
    }

    if (await hasValidSession(request, expected)) {
      const asset = await env.ASSETS.fetch(request);
      const ct = asset.headers.get("Content-Type") || "";
      if (!ct.includes("text/html")) {
        return asset;
      }
      const res = new Response(asset.body, asset);
      applySecurityHeaders(res.headers);
      return res;
    }

    return loginPage(safeNext(url.pathname + url.search), false);
  },
};

async function handleLogin(request, expected) {
  let password = "";
  let next = "/";
  try {
    const form = await request.formData();
    password = form.get("password") || "";
    next = safeNext(form.get("next") || "/");
  } catch {
    return loginPage("/", true);
  }
  if (!timingSafeEqual(password, expected)) {
    return loginPage(next, true);
  }
  const token = await makeToken(expected);
  const headers = new Headers({ Location: next });
  headers.append(
    "Set-Cookie",
    `${COOKIE_NAME}=${token}; Path=/; Max-Age=${SESSION_TTL}; HttpOnly; Secure; SameSite=Lax`
  );
  applySecurityHeaders(headers);
  return new Response(null, { status: 303, headers });
}

async function hasValidSession(request, secret) {
  const token = readCookie(request, COOKIE_NAME);
  if (!token) return false;
  const dot = token.lastIndexOf(".");
  if (dot < 1) return false;
  const exp = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!/^\d+$/.test(exp)) return false;
  if (Number(exp) < nowSeconds()) return false;
  const wanted = await sign(secret, exp);
  return timingSafeEqual(sig, wanted);
}

function nowSeconds() {
  return Math.floor(Date.now() / 1000);
}

async function makeToken(secret) {
  const exp = String(nowSeconds() + SESSION_TTL);
  return `${exp}.${await sign(secret, exp)}`;
}

async function sign(secret, message) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const buf = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message)
  );
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function readCookie(request, name) {
  const header = request.headers.get("Cookie") || "";
  for (const part of header.split(/;\s*/)) {
    const eq = part.indexOf("=");
    if (eq !== -1 && part.slice(0, eq) === name) return part.slice(eq + 1);
  }
  return null;
}

function safeNext(path) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return "/";
  if (path.includes("\\")) return "/";
  if (path === LOGIN_PATH || path.startsWith(LOGIN_PATH + "?")) return "/";
  return path;
}

function applySecurityHeaders(headers) {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(key, value);
  }
}

function textResponse(body, status) {
  const headers = new Headers({ "Content-Type": "text/plain; charset=UTF-8" });
  applySecurityHeaders(headers);
  return new Response(body, { status, headers });
}

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function loginPage(next, showError) {
  const error = showError
    ? `<p class="err">Incorrect password. Please try again.</p>`
    : "";
  const body = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Adam Hall &middot; Buy My Car</title>
<link rel="icon" href="${LOGO}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box}
  body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;color:#FAF8F4;
    font-family:'Poppins',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
    background:radial-gradient(1200px 700px at 20% 0%,rgba(45,91,255,.28),transparent 60%),
      linear-gradient(150deg,#0E171F 0%,#111827 55%,#0E171F 100%)}
  .card{width:100%;max-width:392px;text-align:center}
  .logo{height:56px;margin:0 0 22px;filter:invert(1)}
  h1{font-weight:600;margin:0 0 6px;font-size:28px;letter-spacing:-0.02em}
  p.sub{opacity:.8;margin:0 0 22px;font-weight:300}
  p.err{background:rgba(45,91,255,.18);border:1px solid rgba(45,91,255,.55);
    border-radius:5px;padding:10px 12px;margin:0 0 14px;font-size:14.5px}
  form{display:flex;flex-direction:column;gap:12px}
  input{padding:13px 14px;border-radius:6px;border:1px solid rgba(250,248,244,.3);
    background:rgba(250,248,244,.1);color:#FAF8F4;font-size:16px;font-family:inherit}
  input::placeholder{color:rgba(250,248,244,.55)}
  input:focus{outline:none;border-color:#2D5BFF;background:rgba(250,248,244,.16)}
  button{padding:13px 14px;border-radius:6px;border:0;background:#2D5BFF;color:#fff;
    font-size:16px;font-weight:600;font-family:inherit;cursor:pointer;box-shadow:rgba(0,0,0,.25) 0px 10px 20px 0px}
  button:hover{opacity:.93}
  .foot{opacity:.55;font-size:11px;margin-top:22px;text-transform:uppercase;letter-spacing:.14em}
</style>
</head>
<body>
  <main class="card">
    <img class="logo" src="${LOGO}" alt="Adam Hall Buy My Car">
    <p class="sub">This pack is private. Enter the password to continue.</p>
    ${error}
    <form method="POST" action="${LOGIN_PATH}">
      <input type="hidden" name="next" value="${escapeAttr(next)}">
      <input type="password" name="password" placeholder="Password" autofocus
             autocomplete="current-password" aria-label="Password" required>
      <button type="submit">View the pack</button>
    </form>
    <p class="foot">Jewell Projects &middot; 3D Process</p>
  </main>
</body>
</html>`;
  const headers = new Headers({ "Content-Type": "text/html; charset=UTF-8" });
  applySecurityHeaders(headers);
  return new Response(body, { status: 401, headers });
}

function timingSafeEqual(a, b) {
  const encoder = new TextEncoder();
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  const sameLength = aBytes.length === bBytes.length;
  const probe = sameLength ? aBytes : bBytes;
  let diff = sameLength ? 0 : 1;
  for (let i = 0; i < bBytes.length; i++) {
    diff |= bBytes[i] ^ probe[i];
  }
  return diff === 0;
}
