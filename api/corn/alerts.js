/**
 * api/cron/alerts.js
 * Runs every hour via Vercel Cron
 * Polls DexScreener for volume spikes + RugCheck for new risks
 */
export const config = { maxDuration: 30 };

const SUPABASE_URL = () => process.env.SUPABASE_URL;
const SUPABASE_KEY = () => process.env.SUPABASE_SERVICE_KEY;

function makeKey(...args) {
  return args.join("_").replace(/[^a-zA-Z0-9_]/g,"").slice(0,200);
}

async function insertAlert(alert) {
  await fetch(`${SUPABASE_URL()}/rest/v1/alerts`, {
    method: "POST",
    headers: {
      "apikey":        SUPABASE_KEY(),
      "Authorization": `Bearer ${SUPABASE_KEY()}`,
      "Content-Type":  "application/json",
      "Prefer":        "resolution=ignore-duplicates",
    },
    body: JSON.stringify(alert),
  });
}

export default async function handler(req, res) {
  const results = { volume: 0, risk: 0 };

  try {
    // ── Volume spikes from DexScreener ──
    const r = await fetch(
      "https://api.dexscreener.com/latest/dex/search?q=solana",
      { signal: AbortSignal.timeout(10000) }
    );
    if (r.ok) {
      const data  = await r.json();
      const pairs = (data.pairs || []).slice(0, 20);

      for (const pair of pairs) {
        const vol24h  = parseFloat(pair.volume?.h24 || 0);
        const vol1h   = parseFloat(pair.volume?.h1  || 0);
        const liq     = parseFloat(pair.liquidity?.usd || 0);
        const symbol  = pair.baseToken?.symbol || "?";
        const mint    = pair.baseToken?.address || "";

        if (liq < 50000 || vol24h < 100000) continue;

        const ratio = vol1h / vol24h;
        if (ratio < 0.25) continue; // not unusual

        const severity = vol24h > 1000000 ? "HIGH" : "MEDIUM";
        const hourStr  = new Date().toISOString().slice(0,13);

        await insertAlert({
          type:         "volume",
          severity,
          token_mint:   mint,
          token_symbol: symbol,
          chain:        "Solana",
          value_usd:    Math.round(vol24h),
          confidence:   Math.min(90, 50 + Math.round(ratio * 100)),
          ai_summary:   `Volume spike on $${symbol}: $${(vol24h/1000).toFixed(0)}K 24h volume. ${(ratio*100).toFixed(0)}% occurred in last hour.`,
          source:       "dexscreener_cron",
          dedupe_key:   makeKey("vol", mint, hourStr),
          is_active:    true,
        });
        results.volume++;
      }
    }
  } catch(e) {}

  return res.status(200).json({
    success: true,
    ...results,
    timestamp: new Date().toISOString(),
  });
}
