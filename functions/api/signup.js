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

  // Notify via Resend
  if (env.RESEND_API_KEY) {
    const time = new Date().toUTCString();
    const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F4F1EC;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F1EC;padding:40px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">

        <!-- Header -->
        <tr><td style="background:#0F5C2E;border-radius:12px 12px 0 0;padding:28px 36px;text-align:center">
          <span style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px">Sprout</span>
          <span style="display:inline-block;font-size:9px;font-weight:700;letter-spacing:2px;color:#A8F0C0;vertical-align:middle;margin-left:6px;margin-bottom:2px">AAC</span>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:36px 36px 28px">
          <p style="margin:0 0 6px;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#1A8C45">New Waitlist Signup</p>
          <h1 style="margin:0 0 28px;font-family:Georgia,serif;font-size:26px;font-weight:700;color:#1A1A1A;line-height:1.2">Someone just joined<br>the waitlist.</h1>

          <!-- Email pill -->
          <table cellpadding="0" cellspacing="0" style="margin-bottom:28px">
            <tr><td style="background:#F4F1EC;border-radius:8px;padding:14px 20px">
              <p style="margin:0 0 2px;font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#888">Email address</p>
              <p style="margin:0;font-size:16px;font-weight:600;color:#0F5C2E">${email}</p>
            </td></tr>
          </table>

          <p style="margin:0;font-size:13px;color:#999">${time}</p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#F4F1EC;border-radius:0 0 12px 12px;padding:20px 36px;border-top:1px solid #E8E3DB">
          <p style="margin:0;font-size:12px;color:#aaa;text-align:center">
            <a href="https://sproutaac.org/admin/signups?key=${env.ADMIN_KEY}" style="color:#1A8C45;text-decoration:none;font-weight:600">View all signups →</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

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
          subject: `🌱 New waitlist signup: ${email}`,
          html,
          text: `New Sprout AAC waitlist signup\n\nEmail: ${email}\nTime: ${time}\n\nView all signups in your D1 database (sproutaac-db → WaitlistSignup).`,
        }),
      }).catch(err => console.error('Resend error:', err))
    );
  }

  return Response.json({ ok: true });
}
