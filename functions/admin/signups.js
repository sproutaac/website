export async function onRequestGet(context) {
  const { request, env } = context;
  const key = new URL(request.url).searchParams.get('key');

  if (!key || key !== env.ADMIN_KEY) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { results } = await env.DB.prepare(
    `SELECT email, createdAt, betaTester, unsubscribed FROM "WaitlistSignup" ORDER BY createdAt DESC`
  ).all();

  const active = results.filter(r => !r.unsubscribed).length;
  const beta = results.filter(r => r.betaTester && !r.unsubscribed).length;

  const rows = results.map((r, i) => `
    <tr${r.unsubscribed ? ' style="opacity:0.4"' : ''}>
      <td class="num">${i + 1}</td>
      <td class="email">${r.email}${r.betaTester ? ' <span class="beta-badge">beta</span>' : ''}${r.unsubscribed ? ' <span class="unsub-badge">unsubscribed</span>' : ''}</td>
      <td class="date">${new Date(r.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Waitlist · Sprout AAC</title>
  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="icon" href="/favicon.png" type="image/png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --forest: #0F5C2E;
      --green:  #1A8C45;
      --fresh:  #A8F0C0;
      --cream:  #FAF7F2;
      --line:   #E8E3DB;
      --charcoal: #1A1A1A;
    }
    body {
      background: var(--cream);
      color: var(--charcoal);
      font-family: 'DM Sans', sans-serif;
      font-size: 16px;
      line-height: 1.6;
      min-height: 100vh;
    }

    nav {
      background: var(--forest);
      padding: 18px 48px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .logo-text { font-family: 'Lora', serif; font-size: 18px; font-weight: 700; color: white; text-decoration: none; }
    .logo-badge { font-size: 9px; font-weight: 600; letter-spacing: 2px; color: var(--fresh); }

    main { max-width: 760px; margin: 0 auto; padding: 60px 24px 80px; }

    .eyebrow {
      font-size: 11px; font-weight: 600; letter-spacing: 2.5px;
      text-transform: uppercase; color: var(--green); margin-bottom: 12px;
    }
    h1 {
      font-family: 'Lora', serif; font-size: clamp(28px, 4vw, 40px);
      font-weight: 700; line-height: 1.15; letter-spacing: -0.5px;
      color: var(--charcoal); margin-bottom: 10px;
    }
    .subtitle { font-size: 15px; color: #888; margin-bottom: 40px; }
    .subtitle strong { color: var(--green); font-weight: 600; }

    .card {
      background: white;
      border-radius: 20px;
      border: 1.5px solid var(--line);
      overflow: hidden;
    }
    table { width: 100%; border-collapse: collapse; }
    thead { background: var(--forest); }
    thead th {
      padding: 14px 20px; text-align: left;
      font-size: 10px; font-weight: 600; letter-spacing: 2px;
      text-transform: uppercase; color: var(--fresh);
    }
    tbody tr { border-bottom: 1px solid var(--line); transition: background 0.15s; }
    tbody tr:last-child { border-bottom: none; }
    tbody tr:hover { background: #F5FDF8; }
    td { padding: 14px 20px; font-size: 14px; }
    td.num { color: #ccc; font-size: 12px; width: 48px; }
    td.email { font-weight: 500; color: var(--forest); }
    td.date { color: #999; font-size: 13px; }
    .empty { text-align: center; padding: 60px 20px; color: #bbb; font-style: italic; font-size: 15px; }
    .beta-badge { display: inline-block; background: #EEF2FF; color: #4338CA; font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; border-radius: 4px; padding: 2px 6px; margin-left: 6px; vertical-align: middle; }
    .unsub-badge { display: inline-block; background: #FEF2F2; color: #B91C1C; font-size: 10px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; border-radius: 4px; padding: 2px 6px; margin-left: 6px; vertical-align: middle; }
    .stats { display: flex; gap: 20px; margin-bottom: 28px; flex-wrap: wrap; }
    .stat { background: white; border: 1.5px solid var(--line); border-radius: 12px; padding: 16px 24px; }
    .stat-num { font-family: 'Lora', serif; font-size: 28px; font-weight: 700; color: var(--forest); }
    .stat-label { font-size: 12px; color: #999; margin-top: 2px; }
  </style>
</head>
<body>
  <nav>
    <a href="/" class="logo-text">Sprout</a>
    <span class="logo-badge">AAC</span>
  </nav>
  <main>
    <p class="eyebrow">Admin</p>
    <h1>Waitlist Signups</h1>
    <div class="stats">
      <div class="stat"><div class="stat-num">${active}</div><div class="stat-label">Active subscribers</div></div>
      <div class="stat"><div class="stat-num">${beta}</div><div class="stat-label">Beta testers</div></div>
      <div class="stat"><div class="stat-num">${results.length}</div><div class="stat-label">Total signups (incl. unsub)</div></div>
    </div>
    <div class="card">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Email</th>
            <th>Signed up</th>
          </tr>
        </thead>
        <tbody>
          ${results.length ? rows : '<tr><td colspan="3" class="empty">No signups yet.</td></tr>'}
        </tbody>
      </table>
    </div>
  </main>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html;charset=UTF-8' },
  });
}
