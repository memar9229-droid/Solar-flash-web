    /**
 * api/smart-money/sectors.js — Smart Money Sectors
 * Reads from Supabase (written by wallet_tracker.py)
 */
import { createClient } from "@supabase/supabase-js";
export const config = { maxDuration: 10 };

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req,res) {
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Cache-Control","s-maxage=1800,stale-while-revalidate=3600");
  if (req.method==="OPTIONS") return res.status(200).end();

  try {
    const {data,error} = await sb.from("smart_money_sectors").select("*").order("sm_score",{ascending:false});
    if (error) throw error;

    // Derive overall intelligence
    const avg = data.reduce((s,n)=>s+n.sm_score,0)/data.length;
    const flow = avg>=70?"Strong Inflow":avg>=55?"Moderate Inflow":avg>=45?"Neutral":avg>=30?"Moderate Outflow":"Strong Outflow";
    const overall = avg>=70?"Accumulation":avg>=50?"Neutral":"Distribution";

    return res.status(200).json({
      sectors: data,
      meta: {
        avgSmScore: Math.round(avg),
        flow, overall,
        accumulatingCount: data.filter(s=>s.sm_score>65).length,
        distributingCount: data.filter(s=>s.sm_score<40).length,
        risingCount: data.filter(s=>s.momentum==="Rising").length,
        risk: data.filter(s=>s.risk_score>60).length>=3?"Elevated":"Moderate",
        updatedAt: data[0]?.calculated_at,
      }
    });
  } catch(err) {
    console.error("SM Sectors:",err);
    return res.status(500).json({error:"Failed to load SM sectors"});
  }
}

    
