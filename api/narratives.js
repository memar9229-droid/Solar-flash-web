    export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");
  if (req.method === "OPTIONS") return res.status(200).end();

  const SB_URL = process.env.SUPABASE_URL;
  const SB_KEY = process.env.SUPABASE_ANON_KEY;
  if (!SB_URL || !SB_KEY) return res.status(500).json({ error: "Supabase env vars missing" });

  try {
    const r = await fetch(`${SB_URL}/rest/v1/narratives?select=*&order=score.desc`, {
      headers: { "apikey": SB_KEY, "Authorization": `Bearer ${SB_KEY}` }
    });
    if (!r.ok) return res.status(500).json({ error: `Supabase error ${r.status}` });
    const data = await r.json();
    res.setHeader("Cache-Control", "s-maxage=1800");
    return res.status(200).json({ narratives: data, count: data.length, updatedAt: data[0]?.calculated_at });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}

    
