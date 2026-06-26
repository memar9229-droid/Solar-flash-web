// Uses Supabase REST API directly via fetch — no SDK needed
// Works in all Vercel runtimes without extra dependencies

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=1800,stale-while-revalidate=3600");
  if (req.method === "OPTIONS") return res.status(200).end();

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: "Supabase env vars not set" });
  }

  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/smart_money_sectors?select=*&order=sm_score.desc`,
      {
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    if (!r.ok) return res.status(r.status).json({ error: await r.text() });

    const data = await r.json();
    const avg  = data.length > 0 ? data.reduce((s, n) => s + n.sm_score, 0) / data.length : 50;
    const flow = avg >= 70 ? "Strong Inflow" : avg >= 55 ? "Moderate Inflow" : avg >= 45 ? "Neutral" : avg >= 30 ? "Moderate Outflow" : "Strong Outflow";

    return res.status(200).json({
      sectors: data,
      meta: {
        avgSmScore:        Math.round(avg),
        flow,
        overall:           avg >= 70 ? "Accumulation" : avg >= 50 ? "Neutral" : "Distribution",
        accumulatingCount: data.filter(s => s.sm_score > 65).length,
        distributingCount: data.filter(s => s.sm_score < 40).length,
        risingCount:       data.filter(s => s.momentum === "Rising").length,
        updatedAt:         data[0]?.calculated_at,
      }
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load SM sectors", details: err.message });
  }
}
