    export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  const SB_URL = process.env.SUPABASE_URL;
  const SB_KEY = process.env.SUPABASE_SERVICE_KEY;

  try {
    const r = await fetch(`${SB_URL}/rest/v1/wallet_clusters?select=*&order=conviction.desc`, {
      headers: { "apikey": SB_KEY, "Authorization": `Bearer ${SB_KEY}` }
    });
    const data = await r.json();
    res.setHeader("Cache-Control", "s-maxage=3600");
    return res.status(200).json({ clusters: data, updatedAt: data[0]?.calculated_at });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}

    
