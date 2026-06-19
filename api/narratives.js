/**
 * api/narratives.js — Narrative Radar Data Endpoint
 * Reads from Supabase (written by narrative_scanner.py worker)
 */
import { createClient } from "@supabase/supabase-js";
export const config = { maxDuration: 10 };

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req,res) {
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Cache-Control","s-maxage=1800,stale-while-revalidate=3600");
  if (req.method==="OPTIONS") return res.status(200).end();

  try {
    const {data,error} = await sb.from("narratives").select("*").order("score",{ascending:false});
    if (error) throw error;
    if (!data||data.length===0) return res.status(200).json({narratives:[],stale:true,message:"First scan pending"});

    // Format for frontend consumption
    const formatted = data.map(n=>({
      id: n.id, name: n.name, icon: n.icon, category: n.category,
      score: n.score, heat: n.heat, momentum: n.momentum,
      lifecycle: n.lifecycle_stage, lifecycleV2: n.lifecycle_stage,
      capitalFlow: n.capital_flow, volume7d: n.volume_7d_usd,
      dominance: n.dominance_pct, change7d: n.change_7d_pct,
      topTokens: n.top_tokens||[], signal: n.signal_text||"",
      confidenceScore: n.confidence_score, persistenceScore: n.persistence_score,
      engagementScore: n.engagement_score, capitalFlowScore: n.capital_flow_score,
      emergingStatus: n.emerging_status,
      rotation: n.rotation_from ? {from:n.rotation_from,to:n.rotation_to,strength:n.rotation_strength} : null,
      ai: {summary:n.ai_summary,risks:n.ai_risks,outlook:n.ai_outlook,confidence:n.ai_confidence},
      calculatedAt: n.calculated_at,
    }));

    return res.status(200).json({
      narratives: formatted,
      count: formatted.length,
      updatedAt: data[0]?.calculated_at,
      stale: false,
    });
  } catch(err) {
    console.error("Narratives API:",err);
    return res.status(500).json({error:"Failed to load narratives",details:err.message});
  }
}
