/**
 * api/cron/narratives.js — Production cron
 * Uses shared lib/services — never hangs
 */
export const config = { maxDuration: 25 };

import { log }                 from "../lib/http.js";
import { ok, err, handleOptions } from "../lib/respond.js";
import { sbUpsert, sbInsert }  from "../lib/supabase.js";
import { searchPairs, bestPair } from "../services/dexscreener.js";
import { SECTORS, scoreFromPairs, buildNarrativeRow } from "../services/narratives.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;

  const start    = Date.now();
  const sectorId = req.query.sector;

  log("info", "Cron narratives start", { sectorId, ts: new Date().toISOString() });

  if (!sectorId || !SECTORS[sectorId]) {
    return err(res, "sector param required", 400, {
      valid: Object.keys(SECTORS),
      usage: "/api/cron/narratives?sector=ai",
    });
  }

  const cfg = SECTORS[sectorId];

  try {
    // Fetch pairs for top 3 tokens in sector
    const pairs = [];
    for (const symbol of cfg.tokens.slice(0,3)) {
      try {
        log("info", "Fetching DexScreener", { symbol });
        const found = await searchPairs(symbol);
        const best  = bestPair(found.filter(p =>
          p.baseToken?.symbol?.toUpperCase() === symbol.toUpperCase()
        ), 10000);
        if (best) {
          pairs.push(best);
          log("info", "Pair found", { symbol, change24h: best.priceChange?.h24, liq: best.liquidity?.usd });
        }
      } catch(e) {
        log("warn", "Pair fetch failed", { symbol, error: e.message });
      }
    }

    log("info", "Pairs collected", { count: pairs.length });

    const score = scoreFromPairs(pairs);
    const row   = buildNarrativeRow(sectorId, pairs, score);

    log("info", "Saving to Supabase", { sectorId, score });
    const saved = await sbUpsert("narratives", row);

    if (saved) {
      await sbInsert("narrative_history", {
        narrative_id:     sectorId,
        score:            row.score,
        confidence_score: row.confidence_score,
        momentum:         row.momentum,
        heat:             row.heat,
        lifecycle_stage:  row.lifecycle_stage,
      }).catch(e => log("warn", "History insert failed", { error: e.message }));
    }

    const elapsed = Date.now() - start;
    log("info", "Cron narratives complete", { sectorId, score, saved, elapsed });

    return ok(res, {
      sector:    sectorId,
      name:      cfg.name,
      score,
      momentum:  row.momentum,
      lifecycle: row.lifecycle_stage,
      pairs:     pairs.length,
      saved,
      elapsed,
    });

  } catch(e) {
    log("error", "Cron narratives failed", { sectorId, error: e.message });
    return err(res, "Cron execution failed", 500, e.message);
  }
}
