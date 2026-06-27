    export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  const SB_URL = process.env.SUPABASE_URL;
  const SB_KEY = process.env.SUPABASE_SERVICE_KEY;

  try {
    const r = await fetch(`${SB_URL}/rest/v1/smart_money_sectors?select=*&order=sm_score.desc`, {
      headers: { "apikey": SB_KEY, "Authorization": `Bearer ${SB_KEY}` }
    });
    const data = await r.json();
    const avg = data.length ? data.reduce((s,n)=>s+n.sm_score,0)/data.length : 50;
    res.setHeader("Cache-Control", "s-maxage=1800");
    return res.status(200).json({ sectors: data, meta: { avgSmScore: Math.round(avg), updatedAt: data[0]?.calculated_at }});
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}

    
