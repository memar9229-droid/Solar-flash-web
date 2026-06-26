/**
 * api/cron/alerts.js — Volume spike detection
 */
export const config = { maxDuration: 20 };

import { log }                    from "../lib/http.js";
import { ok, err, handleOptions } from "../lib/respond.js";
import { sbInsert }               from "../lib/supabase.js";
import { searchPairs }            from "../services/dexscreener.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  log("info", "Cron alerts start");

  try {
    const r = await fetch("https://api.dexscreener.com/latest/dex/search?q=solana");
    if (!r.ok) return err(res, "DexScreener failed", 500);

    const data  = await r.json();
    const pairs = (data.pairs||[]).slice(0,20);
    const alerts = [];

    for (const pair of pairs) {
      const vol24h = parseFloat(pair.volume?.h24||0);
      const vol1h  = parseFloat(pair.volume?.h1||0);
      const liq    = parseFloat(pair.liquidity?.usd||0);
      if (liq<50000||vol24h<100000) continue;
      if (vol1h/vol24h<0.25) continue;

      const sym  = pair.baseToken?.symbol||"?";
      const mint = pair.baseToken?.address||"";
      const hourStr = new Date().toISOString().slice(0,13);

      alerts.push({
        type:"volume", severity:vol24h>1000000?"HIGH":"MEDIUM",
        token_mint:mint, token_symbol:sym, chain:"Solana",
        value_usd:Math.round(vol24h),
        confidence:Math.min(90,60+Math.round((vol1h/vol24h)*100)),
        ai_summary:`Volume spike on $${sym}: $${(vol24h/1000).toFixed(0)}K 24h.`,
        source:"dexscreener_cron",
        dedupe_key:`vol_${mint}_${hourStr}`.replace(/[^a-zA-Z0-9_]/g,"").slice(0,200),
        is_active:true,
      });
    }

    if (alerts.length) await sbInsert("alerts", alerts, true);
    log("info", "Cron alerts complete", { count:alerts.length });
    return ok(res, { alerts_created:alerts.length });
  } catch(e) {
    log("error", "Cron alerts failed", { error:e.message });
    return err(res, "Cron failed", 500, e.message);
  }
}
