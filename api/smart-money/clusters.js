// Uses Supabase REST API directly via fetch — no SDK needed
// Works in all Vercel runtimes without extra dependencies

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=3600,stale-while-revalidate=7200");
  if (req.method === "OPTIONS") return res.status(200).end();

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: "Supabase env vars not set" });
  }

  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/wallet_clusters?select=*&order=conviction.desc`,
      {
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    if (!r.ok) return res.status(r.status).json({ error: await r.text() });

    const data = await r.json();
    return res.status(200).json({ clusters: data, updatedAt: data[0]?.calculated_at });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load clusters", details: err.message });
  }
}
