async function makeUnsubToken(email, secret) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(email.toLowerCase()));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function buildConfirmationEmail(email, unsubLink) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all">You're on the list — we'll let you know the moment Sprout is ready to download.&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
</head>
<body style="margin:0;padding:0;background:#FAF7F2;font-family:'DM Sans',Helvetica,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F2;padding:48px 0">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%">

        <!-- Header -->
        <tr><td style="background:#0F5C2E;border-radius:16px 16px 0 0;padding:28px 40px">
          <span style="font-family:'Lora',Georgia,serif;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px">Sprout</span>
          <span style="display:inline-block;font-size:9px;font-weight:700;letter-spacing:2.5px;color:#A8F0C0;vertical-align:middle;margin-left:8px;margin-bottom:1px">AAC</span>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:44px 40px 36px;border-left:1px solid #E8E3DB;border-right:1px solid #E8E3DB">
          <p style="margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:2.5px;text-transform:uppercase;color:#1A8C45;font-family:'DM Sans',Helvetica,Arial,sans-serif">You're on the list</p>
          <h1 style="margin:0 0 28px;font-family:'Lora',Georgia,serif;font-size:30px;font-weight:700;color:#1A1A1A;line-height:1.2;letter-spacing:-0.3px">We'll be in touch<br>when Sprout is ready.</h1>

          <p style="margin:0 0 20px;font-size:16px;line-height:1.75;color:#3D3D3A;font-family:'DM Sans',Helvetica,Arial,sans-serif;font-weight:300">Thanks for joining the waitlist for Sprout AAC — a free, offline-first AAC app for children who communicate differently. No subscription. No paywall. Ever.</p>

          <p style="margin:0 0 20px;font-size:16px;line-height:1.75;color:#3D3D3A;font-family:'DM Sans',Helvetica,Arial,sans-serif;font-weight:300">We'll send you one email when the app is ready to download on iOS and Android. If we reach out before then, it'll be because we want your input on shaping it.</p>

          <!-- Divider -->
          <table cellpadding="0" cellspacing="0" style="width:100%;margin:28px 0">
            <tr><td style="height:1px;background:#E8E3DB"></td></tr>
          </table>

          <p style="margin:0 0 16px;font-size:14px;line-height:1.65;color:#6B6860;font-family:'DM Sans',Helvetica,Arial,sans-serif">In the meantime, learn more about what we're building:</p>

          <!-- CTA -->
          <table cellpadding="0" cellspacing="0" style="margin:0 0 8px">
            <tr><td style="background:#0F5C2E;border-radius:10px;padding:14px 32px">
              <a href="https://sproutaac.org" style="color:white;text-decoration:none;font-size:15px;font-weight:600;font-family:'DM Sans',Helvetica,Arial,sans-serif;letter-spacing:0.2px">Visit sproutaac.org →</a>
            </td></tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#FAF7F2;border-radius:0 0 16px 16px;padding:24px 40px;border:1px solid #E8E3DB;border-top:none">
          <p style="margin:0;font-size:12px;color:#b0aa9f;text-align:center;line-height:1.7;font-family:'DM Sans',Helvetica,Arial,sans-serif">
            You're receiving this because you joined the Sprout AAC waitlist at
            <a href="https://sproutaac.org" style="color:#1A8C45;text-decoration:none">sproutaac.org</a>.<br>
            <a href="${unsubLink}" style="color:#1A8C45;text-decoration:none">Unsubscribe</a> · <a href="mailto:hello@sproutaac.org" style="color:#1A8C45;text-decoration:none">hello@sproutaac.org</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildAdminNotificationEmail(email, adminLink) {
  const time = new Date().toUTCString();
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F4F1EC;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F1EC;padding:40px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">
        <tr><td style="background:#0F5C2E;border-radius:12px 12px 0 0;padding:28px 36px;text-align:center">
          <span style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px">Sprout</span>
          <span style="display:inline-block;font-size:9px;font-weight:700;letter-spacing:2px;color:#A8F0C0;vertical-align:middle;margin-left:6px;margin-bottom:2px">AAC</span>
        </td></tr>
        <tr><td style="background:#ffffff;padding:36px 36px 28px">
          <p style="margin:0 0 6px;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#1A8C45">New Waitlist Signup</p>
          <h1 style="margin:0 0 28px;font-family:Georgia,serif;font-size:26px;font-weight:700;color:#1A1A1A;line-height:1.2">Someone just joined<br>the waitlist.</h1>
          <table cellpadding="0" cellspacing="0" style="margin-bottom:28px">
            <tr><td style="background:#F4F1EC;border-radius:8px;padding:14px 20px">
              <p style="margin:0 0 2px;font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#888">Email address</p>
              <p style="margin:0;font-size:16px;font-weight:600;color:#0F5C2E">${email}</p>
            </td></tr>
          </table>
          <p style="margin:0;font-size:13px;color:#999">${time}</p>
        </td></tr>
        <tr><td style="background:#F4F1EC;border-radius:0 0 12px 12px;padding:20px 36px;border-top:1px solid #E8E3DB">
          <p style="margin:0;font-size:12px;color:#aaa;text-align:center">
            <a href="${adminLink}" style="color:#1A8C45;text-decoration:none;font-weight:600">View all signups →</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

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
  let isNew = true;
  try {
    const result = await env.DB.prepare(
      `INSERT OR IGNORE INTO "WaitlistSignup" (id, email, createdAt) VALUES (?, ?, ?)`
    ).bind(crypto.randomUUID(), email, new Date().toISOString()).run();
    isNew = result.meta?.changes > 0;
  } catch (err) {
    console.error('DB error:', err);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }

  if (env.RESEND_API_KEY) {
    const token = await makeUnsubToken(email, env.ADMIN_KEY || '');
    const unsubLink = `https://sproutaac.org/api/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
    const adminLink = `https://sproutaac.org/admin/signups?key=${env.ADMIN_KEY}`;

    // Send confirmation to signee (only if new signup)
    if (isNew) {
      context.waitUntil(
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Sprout AAC <hello@sproutaac.org>',
            to: email,
            subject: "You're on the Sprout AAC waitlist 🌱",
            html: buildConfirmationEmail(email, unsubLink),
            text: `You're on the Sprout AAC waitlist!\n\nThanks for joining. We'll send you one email when the app is ready to download on iOS and Android.\n\nLearn more: https://sproutaac.org\n\nUnsubscribe: ${unsubLink}`,
          }),
        }).catch(err => console.error('Resend confirmation error:', err))
      );
    }

    // Notify admin
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
          html: buildAdminNotificationEmail(email, adminLink),
          text: `New Sprout AAC waitlist signup\n\nEmail: ${email}\nTime: ${new Date().toUTCString()}\n\nView all: ${adminLink}`,
        }),
      }).catch(err => console.error('Resend admin error:', err))
    );
  }

  return Response.json({ ok: true });
}
