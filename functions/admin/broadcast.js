const STYLE = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --forest: #0F5C2E; --green: #1A8C45; --fresh: #A8F0C0;
    --cream: #FAF7F2; --line: #E8E3DB; --charcoal: #1A1A1A;
  }
  body { background: var(--cream); color: var(--charcoal); font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif; min-height: 100vh; }
  nav { background: var(--forest); padding: 18px 48px; display: flex; align-items: center; gap: 10px; }
  .logo { font-family: Georgia, serif; font-size: 18px; font-weight: 700; color: white; text-decoration: none; }
  .badge { font-size: 9px; font-weight: 600; letter-spacing: 2px; color: var(--fresh); }
  main { max-width: 680px; margin: 0 auto; padding: 60px 24px 80px; }
  .eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 2.5px; text-transform: uppercase; color: var(--green); margin-bottom: 12px; }
  h1 { font-family: Georgia, serif; font-size: 32px; font-weight: 700; line-height: 1.15; margin-bottom: 8px; }
  .subtitle { font-size: 14px; color: #888; margin-bottom: 40px; }
  .subtitle strong { color: var(--green); }
  .card { background: white; border-radius: 20px; border: 1.5px solid var(--line); padding: 36px; margin-bottom: 20px; }
  label { display: block; font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: #888; margin-bottom: 8px; }
  input, textarea { width: 100%; padding: 12px 14px; border: 1.5px solid var(--line); border-radius: 10px; font-size: 15px; font-family: inherit; color: var(--charcoal); background: var(--cream); transition: border-color 0.2s; outline: none; resize: vertical; }
  input:focus, textarea:focus { border-color: var(--green); background: white; }
  .field { margin-bottom: 24px; }
  .field:last-child { margin-bottom: 0; }
  .hint { font-size: 12px; color: #aaa; margin-top: 6px; }
  .divider { height: 1.5px; background: var(--line); margin: 28px 0; }
  .row { display: flex; gap: 12px; }
  .row .field { flex: 1; }
  .actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 28px; }
  .btn { padding: 12px 24px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; font-family: inherit; }
  .btn-primary { background: var(--forest); color: white; }
  .btn-primary:hover { background: var(--green); }
  .btn-secondary { background: white; color: var(--charcoal); border: 1.5px solid var(--line); }
  .btn-secondary:hover { border-color: var(--green); color: var(--green); }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .confirm-box { display: none; background: #FFF8F0; border: 1.5px solid #F0B429; border-radius: 12px; padding: 16px 20px; margin-top: 16px; }
  .confirm-box p { font-size: 14px; color: #92400E; margin-bottom: 12px; }
  .confirm-box input { background: white; }
  .alert { padding: 14px 18px; border-radius: 10px; font-size: 14px; font-weight: 500; margin-top: 20px; display: none; }
  .alert-success { background: #F0FDF4; color: #166534; border: 1.5px solid #86EFAC; }
  .alert-error { background: #FFF1F2; color: #9F1239; border: 1.5px solid #FDA4AF; }
`;

function buildEmailHtml({ subject, previewText, heading, body, ctaLabel, ctaUrl }) {
  const paragraphs = body.split(/\n\n+/).map(p =>
    `<p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#333">${p.replace(/\n/g, '<br>')}</p>`
  ).join('');

  const ctaBlock = ctaLabel && ctaUrl ? `
    <table cellpadding="0" cellspacing="0" style="margin: 28px 0">
      <tr><td style="background:#0F5C2E;border-radius:8px;padding:14px 28px">
        <a href="${ctaUrl}" style="color:white;text-decoration:none;font-size:15px;font-weight:600;font-family:'Helvetica Neue',sans-serif">${ctaLabel}</a>
      </td></tr>
    </table>` : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  ${previewText ? `<meta name="x-preview-text" content="${previewText}">
  <div style="display:none;max-height:0;overflow:hidden">${previewText}&nbsp;&zwnj;</div>` : ''}
</head>
<body style="margin:0;padding:0;background:#F4F1EC;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F1EC;padding:40px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">

        <tr><td style="background:#0F5C2E;border-radius:12px 12px 0 0;padding:24px 36px">
          <span style="font-family:Georgia,serif;font-size:20px;font-weight:700;color:#fff">Sprout</span>
          <span style="font-size:9px;font-weight:700;letter-spacing:2px;color:#A8F0C0;vertical-align:middle;margin-left:6px">AAC</span>
        </td></tr>

        <tr><td style="background:#fff;padding:36px 36px 28px">
          <h1 style="margin:0 0 24px;font-family:Georgia,serif;font-size:28px;font-weight:700;color:#1A1A1A;line-height:1.2">${heading}</h1>
          ${paragraphs}
          ${ctaBlock}
        </td></tr>

        <tr><td style="background:#F4F1EC;border-radius:0 0 12px 12px;padding:20px 36px;border-top:1px solid #E8E3DB">
          <p style="margin:0;font-size:12px;color:#aaa;text-align:center;line-height:1.6">
            You're receiving this because you signed up for the Sprout AAC waitlist at
            <a href="https://sproutaac.org" style="color:#1A8C45;text-decoration:none">sproutaac.org</a>.<br>
            To unsubscribe, reply to this email or contact
            <a href="mailto:hello@sproutaac.org" style="color:#1A8C45;text-decoration:none">hello@sproutaac.org</a>.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const key = new URL(request.url).searchParams.get('key');
  if (!key || key !== env.ADMIN_KEY) return new Response('Unauthorized', { status: 401 });

  const { results } = await env.DB.prepare(
    `SELECT COUNT(*) as count FROM "WaitlistSignup"`
  ).first();
  const count = results?.count ?? (await env.DB.prepare(`SELECT COUNT(*) as count FROM "WaitlistSignup"`).first()).count;

  const { meta } = await env.DB.prepare(`SELECT COUNT(*) as count FROM "WaitlistSignup"`).run();
  const total = (await env.DB.prepare(`SELECT COUNT(*) as count FROM "WaitlistSignup"`).first()).count;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Broadcast · Sprout AAC</title>
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>${STYLE}
    body { font-family: 'DM Sans', sans-serif; }
    h1 { font-family: 'Lora', serif; }
    label { font-family: 'DM Sans', sans-serif; }
  </style>
</head>
<body>
  <nav>
    <a href="/" class="logo">Sprout</a>
    <span class="badge">AAC</span>
  </nav>
  <main>
    <p class="eyebrow">Admin</p>
    <h1>Send Broadcast</h1>
    <p class="subtitle">Sending to <strong>${total} subscriber${total === 1 ? '' : 's'}</strong> from <strong>hello@sproutaac.org</strong></p>

    <form id="broadcast-form">
      <div class="card">
        <p style="font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#888;margin-bottom:20px">Email content</p>

        <div class="field">
          <label for="subject">Subject line</label>
          <input type="text" id="subject" name="subject" placeholder="Sprout AAC is almost here 🌱" required>
        </div>

        <div class="field">
          <label for="previewText">Preview text <span style="font-weight:400;text-transform:none;letter-spacing:0">(shown in inbox before opening)</span></label>
          <input type="text" id="previewText" name="previewText" placeholder="Here's what we've been building for your family…">
          <p class="hint">Keep under 90 characters for best results.</p>
        </div>

        <div class="divider"></div>

        <div class="field">
          <label for="heading">Heading</label>
          <input type="text" id="heading" name="heading" placeholder="We're almost ready." required>
        </div>

        <div class="field">
          <label for="body">Message body</label>
          <textarea id="body" name="body" rows="10" placeholder="Write your message here…

Separate paragraphs with a blank line.

You can write as much as you need." required></textarea>
          <p class="hint">Blank lines become paragraph breaks.</p>
        </div>

        <div class="divider"></div>

        <p style="font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#888;margin-bottom:20px">Call to action <span style="font-weight:400;text-transform:none;letter-spacing:0">(optional)</span></p>

        <div class="row">
          <div class="field">
            <label for="ctaLabel">Button label</label>
            <input type="text" id="ctaLabel" name="ctaLabel" placeholder="Download on App Store">
          </div>
          <div class="field">
            <label for="ctaUrl">Button URL</label>
            <input type="url" id="ctaUrl" name="ctaUrl" placeholder="https://apps.apple.com/…">
          </div>
        </div>
      </div>

      <div class="actions">
        <button type="button" class="btn btn-secondary" onclick="sendTest()">Send test to me</button>
        <button type="button" class="btn btn-primary" onclick="showConfirm()">Send to all ${total} subscribers →</button>
      </div>

      <div class="confirm-box" id="confirm-box">
        <p>⚠️ This will send to all <strong>${total} subscribers</strong>. Type <strong>SEND</strong> to confirm.</p>
        <input type="text" id="confirm-input" placeholder="Type SEND to confirm" autocomplete="off" style="margin-bottom:12px">
        <div style="display:flex;gap:10px">
          <button type="button" class="btn btn-primary" id="confirm-btn" onclick="sendAll()" disabled>Send now</button>
          <button type="button" class="btn btn-secondary" onclick="hideConfirm()">Cancel</button>
        </div>
      </div>

      <div class="alert alert-success" id="alert-success"></div>
      <div class="alert alert-error" id="alert-error"></div>
    </form>
  </main>

  <script>
    const KEY = '${key}';

    function getPayload() {
      return {
        subject: document.getElementById('subject').value,
        previewText: document.getElementById('previewText').value,
        heading: document.getElementById('heading').value,
        body: document.getElementById('body').value,
        ctaLabel: document.getElementById('ctaLabel').value,
        ctaUrl: document.getElementById('ctaUrl').value,
      };
    }

    function showAlert(type, msg) {
      const el = document.getElementById('alert-' + type);
      el.textContent = msg;
      el.style.display = 'block';
      setTimeout(() => el.style.display = 'none', 6000);
    }

    async function sendTest() {
      const payload = getPayload();
      if (!payload.subject || !payload.heading || !payload.body) {
        return showAlert('error', 'Fill in subject, heading, and body first.');
      }
      const btn = event.target;
      btn.disabled = true; btn.textContent = 'Sending…';
      try {
        const res = await fetch('/admin/broadcast?key=' + KEY, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, test: true }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed');
        showAlert('success', '✓ Test email sent — check your inbox.');
      } catch (e) {
        showAlert('error', e.message);
      } finally {
        btn.disabled = false; btn.textContent = 'Send test to me';
      }
    }

    function showConfirm() {
      const payload = getPayload();
      if (!payload.subject || !payload.heading || !payload.body) {
        return showAlert('error', 'Fill in subject, heading, and body first.');
      }
      document.getElementById('confirm-box').style.display = 'block';
      document.getElementById('confirm-input').focus();
    }

    function hideConfirm() {
      document.getElementById('confirm-box').style.display = 'none';
      document.getElementById('confirm-input').value = '';
      document.getElementById('confirm-btn').disabled = true;
    }

    document.getElementById('confirm-input').addEventListener('input', function() {
      document.getElementById('confirm-btn').disabled = this.value !== 'SEND';
    });

    async function sendAll() {
      const payload = getPayload();
      const btn = document.getElementById('confirm-btn');
      btn.disabled = true; btn.textContent = 'Sending…';
      try {
        const res = await fetch('/admin/broadcast?key=' + KEY, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, test: false }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed');
        hideConfirm();
        showAlert('success', '✓ Sent to ' + data.sent + ' subscribers.');
      } catch (e) {
        showAlert('error', e.message);
        btn.disabled = false; btn.textContent = 'Send now';
      }
    }
  </script>
</body>
</html>`;

  return new Response(html, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const key = new URL(request.url).searchParams.get('key');
  if (!key || key !== env.ADMIN_KEY) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  let payload;
  try { payload = await request.json(); } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { subject, previewText, heading, body, ctaLabel, ctaUrl, test } = payload;
  if (!subject || !heading || !body) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const html = buildEmailHtml({ subject, previewText, heading, body, ctaLabel, ctaUrl });
  const text = `${heading}\n\n${body}${ctaLabel && ctaUrl ? `\n\n${ctaLabel}: ${ctaUrl}` : ''}\n\n---\nYou received this because you signed up at sproutaac.org. To unsubscribe, reply to this email.`;

  if (test) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'Sprout AAC <hello@sproutaac.org>', to: env.NOTIFICATION_EMAIL, subject: `[TEST] ${subject}`, html, text }),
    });
    if (!res.ok) {
      const err = await res.json();
      return Response.json({ error: err.message || 'Resend error' }, { status: 500 });
    }
    return Response.json({ ok: true });
  }

  const { results } = await env.DB.prepare(`SELECT email FROM "WaitlistSignup"`).all();
  let sent = 0;
  for (const row of results) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'Sprout AAC <hello@sproutaac.org>', to: row.email, subject, html, text }),
    });
    if (res.ok) sent++;
  }

  return Response.json({ ok: true, sent });
}
