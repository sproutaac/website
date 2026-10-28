// Shared helpers for the Pages Functions (imported by functions/**).
// Lives outside functions/ so Pages doesn't treat it as a route.

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Practical email check: the usual local-part characters, a dotted domain,
// and nothing that could be HTML (no < > " ' or spaces).
const EMAIL_RE = /^[a-z0-9.!#$%&*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;

export function isValidEmail(email) {
  return typeof email === 'string' && email.length <= 254 && EMAIL_RE.test(email);
}

async function hmac(secret, message) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message)));
}

// Constant-time string comparison: compare HMACs of both values under a
// random key, so the time taken doesn't depend on where they differ.
export async function safeEqual(a, b) {
  const k = crypto.getRandomValues(new Uint8Array(32));
  const secret = String.fromCharCode(...k);
  const [x, y] = await Promise.all([hmac(secret, String(a)), hmac(secret, String(b))]);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

// Admin pages use HTTP Basic auth (any username, ADMIN_KEY as the password),
// so the key travels in a header instead of the URL, history, or emails.
// Returns a 401 Response when the request isn't authorised, otherwise null.
export async function requireAdmin(request, env) {
  const header = request.headers.get('Authorization') || '';
  let password = '';
  if (header.startsWith('Basic ')) {
    try {
      const decoded = atob(header.slice(6));
      password = decoded.slice(decoded.indexOf(':') + 1);
    } catch { /* malformed header: treat as no password */ }
  }
  if (env.ADMIN_KEY && password && await safeEqual(password, env.ADMIN_KEY)) return null;
  return new Response('Unauthorized', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Sprout admin", charset="UTF-8"', 'Cache-Control': 'no-store' },
  });
}

// Unsubscribe links are signed with their own secret. Links sent before
// UNSUB_SECRET existed were signed with ADMIN_KEY, so those still verify.
function toBase64Url(bytes) {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export async function makeUnsubToken(email, env) {
  return toBase64Url(await hmac(env.UNSUB_SECRET || env.ADMIN_KEY || '', email.toLowerCase()));
}

export async function verifyUnsubToken(email, token, env) {
  for (const secret of [env.UNSUB_SECRET, env.ADMIN_KEY]) {
    if (!secret) continue;
    const expected = toBase64Url(await hmac(secret, email.toLowerCase()));
    if (await safeEqual(expected, token)) return true;
  }
  return false;
}

// Per-IP rate limit backed by D1. Stores only a salted hash of the IP, and
// rows older than the window are deleted as they're checked.
export async function rateLimit(env, request, { bucket, limit, windowSeconds }) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const salt = env.UNSUB_SECRET || env.ADMIN_KEY || 'sprout';
  const ipHash = toBase64Url(await hmac(salt, `${bucket}:${ip}`)).slice(0, 22);
  const now = Math.floor(Date.now() / 1000);
  const since = now - windowSeconds;

  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS "RateLimitHit" ("bucket" TEXT NOT NULL, "ipHash" TEXT NOT NULL, "at" INTEGER NOT NULL)`
  ).run();
  await env.DB.prepare(`DELETE FROM "RateLimitHit" WHERE "at" < ?`).bind(since).run();
  const row = await env.DB.prepare(
    `SELECT COUNT(*) AS n FROM "RateLimitHit" WHERE "bucket" = ? AND "ipHash" = ? AND "at" >= ?`
  ).bind(bucket, ipHash, since).first();
  if ((row?.n ?? 0) >= limit) return false;
  await env.DB.prepare(`INSERT INTO "RateLimitHit" ("bucket", "ipHash", "at") VALUES (?, ?, ?)`).bind(bucket, ipHash, now).run();
  return true;
}
