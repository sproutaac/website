async function verifyToken(email, token, secret) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(email.toLowerCase()));
  const expected = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return expected === token;
}

function page(title, headline, body, isError) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} · Sprout AAC</title>
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root { --forest: #0F5C2E; --green: #1A8C45; --fresh: #A8F0C0; --cream: #FAF7F2; --line: #E8E3DB; --charcoal: #1A1A1A; --muted: #6B6860; }
    body { background: var(--cream); font-family: 'DM Sans', system-ui, sans-serif; min-height: 100vh; display: flex; flex-direction: column; }
    nav { background: var(--forest); padding: 18px 48px; display: flex; align-items: center; gap: 10px; }
    .logo { font-family: 'Lora', Georgia, serif; font-size: 18px; font-weight: 700; color: white; text-decoration: none; }
    .badge { font-size: 9px; font-weight: 600; letter-spacing: 2px; color: var(--fresh); }
    main { flex: 1; display: flex; align-items: center; justify-content: center; padding: 60px 24px; }
    .card { background: white; border-radius: 20px; border: 1.5px solid var(--line); padding: 52px 48px; max-width: 480px; width: 100%; text-align: center; }
    .icon { font-size: 48px; margin-bottom: 20px; }
    h1 { font-family: 'Lora', Georgia, serif; font-size: 28px; font-weight: 700; color: var(--charcoal); margin-bottom: 12px; line-height: 1.2; }
    p { font-size: 16px; color: var(--muted); line-height: 1.7; margin-bottom: 20px; }
    a.btn { display: inline-block; background: var(--forest); color: white; border-radius: 10px; padding: 12px 28px; font-size: 14px; font-weight: 600; text-decoration: none; margin-top: 8px; }
    a.btn:hover { background: var(--green); }
    @media (max-width: 520px) { .card { padding: 36px 24px; } nav { padding: 16px 20px; } }
  </style>
</head>
<body>
  <nav>
    <a href="/" class="logo">Sprout</a>
    <span class="badge">AAC</span>
  </nav>
  <main>
    <div class="card">
      <div class="icon">${isError ? '⚠️' : '👋'}</div>
      <h1>${headline}</h1>
      <p>${body}</p>
      <a href="/" class="btn">Back to sproutaac.org</a>
    </div>
  </main>
</body>
</html>`;
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const email = (url.searchParams.get('email') || '').toLowerCase().trim();
  const token = url.searchParams.get('token') || '';

  if (!email || !token) {
    return new Response(
      page('Invalid link', 'Invalid unsubscribe link', 'This unsubscribe link is missing required information. Please contact <a href="mailto:hello@sproutaac.org">hello@sproutaac.org</a> if you need help.', true),
      { status: 400, headers: { 'Content-Type': 'text/html;charset=UTF-8' } }
    );
  }

  const valid = await verifyToken(email, token, env.ADMIN_KEY || '');
  if (!valid) {
    return new Response(
      page('Invalid link', 'This link has expired', 'This unsubscribe link is invalid or has already been used. Please contact <a href="mailto:hello@sproutaac.org">hello@sproutaac.org</a> to be removed manually.', true),
      { status: 400, headers: { 'Content-Type': 'text/html;charset=UTF-8' } }
    );
  }

  try {
    await env.DB.prepare(
      `UPDATE "WaitlistSignup" SET unsubscribed = 1 WHERE email = ?`
    ).bind(email).run();
  } catch (err) {
    console.error('DB error:', err);
    return new Response(
      page('Error', 'Something went wrong', 'We couldn\'t process your request. Please contact <a href="mailto:hello@sproutaac.org">hello@sproutaac.org</a> and we\'ll remove you right away.', true),
      { status: 500, headers: { 'Content-Type': 'text/html;charset=UTF-8' } }
    );
  }

  return new Response(
    page('Unsubscribed', 'You\'ve been unsubscribed.', `We've removed <strong>${email}</strong> from the Sprout AAC waitlist. You won't hear from us again. If you change your mind, you're always welcome back at <a href="https://sproutaac.org">sproutaac.org</a>.`, false),
    { headers: { 'Content-Type': 'text/html;charset=UTF-8' } }
  );
}
