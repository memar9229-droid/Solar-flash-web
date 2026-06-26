    // Uses Supabase REST API directly via fetch — no SDK needed
// Works in all Vercel runtimes without extra dependencies

export const config = { maxDuration: 55 };

export default async function handler(req, res) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("X-Accel-Buffering", "no");

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

  const send = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const fetchAlerts = async (since = null) => {
    let url = `${SUPABASE_URL}/rest/v1/alerts?select=*&is_active=eq.true&order=created_at.desc&limit=20`;
    if (since) url += `&created_at=gt.${since}`;
    const r = await fetch(url, {
      headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` },
    });
    if (!r.ok) return [];
    return await r.json();
  };

  // Initial batch
  try {
    const initial = await fetchAlerts();
    send("init", { alerts: initial, timestamp: new Date().toISOString() });
  } catch(e) {
    send("init", { alerts: [], timestamp: new Date().toISOString() });
  }

  let lastCheck = new Date().toISOString();
  const interval = setInterval(async () => {
    try {
      const newAlerts = await fetchAlerts(lastCheck);
      if (newAlerts && newAlerts.length > 0) {
        lastCheck = newAlerts[0].created_at;
        send("alerts", { alerts: newAlerts, timestamp: new Date().toISOString() });
      } else {
        send("heartbeat", { timestamp: new Date().toISOString() });
      }
    } catch(e) {}
  }, 15000);

  req.on("close", () => { clearInterval(interval); res.end(); });
  setTimeout(() => { clearInterval(interval); send("reconnect", {}); res.end(); }, 54000);
}

    
