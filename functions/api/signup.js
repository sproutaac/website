export async function onRequestPost(context) {
  const { request, env } = context;

  let email;
  try {
    const body = await request.json();
    email = (body.email || '').toLowerCase().trim();
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'Invalid email' }, { status: 400 });
  }

  // Store in D1 — INSERT OR IGNORE silently handles duplicates
  try {
    await env.DB.prepare(
      `INSERT OR IGNORE INTO "WaitlistSignup" (id, email, createdAt) VALUES (?, ?, ?)`
    ).bind(crypto.randomUUID(), email, new Date().toISOString()).run();
  } catch (err) {
    console.error('DB error:', err);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }

  // Notify hello@sproutaac.org via Resend
  if (env.RESEND_API_KEY) {
    context.waitUntil(
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Sprout AAC <hello@sproutaac.org>',
          to: env.NOTIFICATION_EMAIL || 'hello@sproutaac.org',
          subject: `New waitlist signup: ${email}`,
          text: `New Sprout AAC waitlist signup\n\nEmail: ${email}\nTime: ${new Date().toUTCString()}\n\nView all signups in your D1 database (sproutaac-db → WaitlistSignup).`,
        }),
      }).catch(err => console.error('Resend error:', err))
    );
  }

  return Response.json({ ok: true });
}
