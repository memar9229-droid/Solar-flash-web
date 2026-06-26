/**
 * api/smart-money/sectors.js
 */
import { log }                    from "../lib/http.js";
import { ok, err, handleOptions } from "../lib/respond.js";
import { sbSelect }               from "../lib/supabase.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  log("info", "GET /api/smart-money/sectors");

  try {
    const data = await sbSelect("smart_money_sectors", "select=*&order=sm_score.desc", true);
    const avg  = data.length ? data.reduce((s,n)=>s+n.sm_score,0)/data.length : 50;
    const flow = avg>=70?"Strong Inflow":avg>=55?"Moderate Inflow":avg>=45?"Neutral":avg>=30?"Moderate Outflow":"Strong Outflow";

    return ok(res, {
      sectors: data,
      meta: {
        avgSmScore:        Math.round(avg),
        flow,
        overall:           avg>=70?"Accumulation":avg>=50?"Neutral":"Distribution",
        accumulatingCount: data.filter(s=>s.sm_score>65).length,
        distributingCount: data.filter(s=>s.sm_score<40).length,
        risingCount:       data.filter(s=>s.momentum==="Rising").length,
        updatedAt:         data[0]?.calculated_at,
      }
    }, 1800);
  } catch(e) {
    log("error", "SM sectors failed", { error: e.message });
    return err(res, "Failed to load SM sectors", 500, e.message);
  }
}
