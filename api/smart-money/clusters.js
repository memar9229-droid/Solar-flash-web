/**
 * api/smart-money/clusters.js — Wallet Cluster Intelligence
 */
import { createClient } from "@supabase/supabase-js";
export const config = { maxDuration: 10 };

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req,res) {
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Cache-Control","s-maxage=3600,stale-while-revalidate=7200");
  if (req.method==="OPTIONS") return res.status(200).end();

  try {
    const {data,error} = await sb.from("wallet_clusters").select("*").order("conviction",{ascending:false});
    if (error) throw error;
    return res.status(200).json({clusters:data, updatedAt:data[0]?.calculated_at});
  } catch(err) {
    return res.status(500).json({error:"Failed to load clusters"});
  }
}
