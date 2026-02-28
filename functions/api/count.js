export async function onRequestGet(context) {
  const { env } = context;
  try {
    const result = await env.DB.prepare(
      `SELECT COUNT(*) as count FROM "WaitlistSignup" WHERE unsubscribed = 0`
    ).first();
    return Response.json({ count: result.count ?? 0 }, {
      headers: { 'Cache-Control': 'public, max-age=300' },
    });
  } catch {
    return Response.json({ count: 0 });
  }
}
