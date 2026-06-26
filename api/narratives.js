/**
 * api/narratives.js — Narrative Radar data endpoint
 */
import { log }                    from "./lib/http.js";
import { ok, err, handleOptions } from "./lib/respond.js";
import { sbSelect }               from "./lib/supabase.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  log("info", "GET /api/narratives");

  try {
    const data = await sbSelect("narratives", "select=*&order=score.desc");

    if (!data?.length) {
      return ok(res, { narratives:[], stale:true, message:"First scan pending" }, 300);
    }

    const narratives = data.map(n => ({
      id:              n.id,
      name:            n.name,
      icon:            n.icon,
      category:        n.category,
      score:           n.score,
      heat:            n.heat,
      momentum:        n.momentum,
      lifecycle:       n.lifecycle_stage,
      lifecycleV2:     n.lifecycle_stage,
      capitalFlow:     n.capital_flow,
      dominance:       n.dominance_pct,
      change7d:        n.change_7d_pct,
      topTokens:       n.top_tokens || [],
      signal:          n.signal_text || "",
      confidenceScore: n.confidence_score,
      emergingStatus:  n.emerging_status,
      rotation:        n.rotation_from ? {from:n.rotation_from,to:n.rotation_to,strength:n.rotation_strength} : null,
      ai:              {summary:n.ai_summary,risks:n.ai_risks,outlook:n.ai_outlook,confidence:n.ai_confidence},
      calculatedAt:    n.calculated_at,
    }));

    log("info", "Narratives served", { count: narratives.length });
    return ok(res, { narratives, count: narratives.length, updatedAt: data[0]?.calculated_at }, 1800);
  } catch(e) {
    log("error", "Narratives endpoint failed", { error: e.message });
    return err(res, "Failed to load narratives", 500, e.message);
  }
}
