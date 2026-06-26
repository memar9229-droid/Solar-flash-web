/**
 * api/smart-money/clusters.js
 */
import { log }                    from "../lib/http.js";
import { ok, err, handleOptions } from "../lib/respond.js";
import { sbSelect }               from "../lib/supabase.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  log("info", "GET /api/smart-money/clusters");

  try {
    const data = await sbSelect("wallet_clusters", "select=*&order=conviction.desc", true);
    return ok(res, { clusters: data, updatedAt: data[0]?.calculated_at }, 3600);
  } catch(e) {
    log("error", "SM clusters failed", { error: e.message });
    return err(res, "Failed to load clusters", 500, e.message);
  }
}
