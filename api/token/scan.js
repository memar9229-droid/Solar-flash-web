    /**
 * api/token/scan.js — Token Intelligence Engine
 * Aggregates: Helius + DexScreener + RugCheck → unified token report
 * Caches results in Supabase for 5 minutes
 */
import { createClient } from "@supabase/supabase-js";
export const config = { maxDuration: 30 };

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function helius(method, params) {
  const r = await fetch(`https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc:"2.0", id:1, method, params }),
  });
  return (await r.json()).result;
}

function calcScore(d) {
  let score = 100; const flags = [], goods = [];
  if (d.mintAuthority) { score-=30; flags.push({sev:"critical",icon:"🚨",text:"Mint authority ACTIVE — dev can print tokens"}); }
  else goods.push({icon:"✅",text:"Mint authority revoked"});
  if (d.freezeAuthority) { score-=20; flags.push({sev:"high",icon:"⚠️",text:"Freeze authority active"}); }
  else goods.push({icon:"✅",text:"Freeze authority revoked"});
  if (!d.lpBurned) { score-=30; flags.push({sev:"critical",icon:"🚨",text:"Liquidity NOT secured — rug pull risk"}); }
  else goods.push({icon:"🔥",text:"Liquidity burned"});
  if (d.topHolderPct>50) { score-=25; flags.push({sev:"critical",icon:"🚨",text:`Top holder ${d.topHolderPct.toFixed(1)}% — extreme concentration`}); }
  else if (d.topHolderPct>20) { score-=10; flags.push({sev:"medium",icon:"⚠️",text:`Top holder ${d.topHolderPct.toFixed(1)}%`}); }
  else if (d.topHolderPct>0) goods.push({icon:"✅",text:`Top holder ${d.topHolderPct.toFixed(1)}% — healthy`});
  if (d.rugcheckScore && d.rugcheckScore<70) { score-=15; flags.push({sev:"high",icon:"⚠️",text:`RugCheck ${d.rugcheckScore}/100 — risks detected`}); }
  else if (d.rugcheckScore>=80) goods.push({icon:"✅",text:`RugCheck ${d.rugcheckScore}/100 — safe`});
  if (d.holderCount<50) { score-=10; flags.push({sev:"low",icon:"⚠️",text:`Only ${d.holderCount} holders`}); }
  else if (d.holderCount>500) goods.push({icon:"✅",text:`${d.holderCount} holders`});
  score = Math.max(0,Math.min(100,score));
  const grade = score>=80?"A":score>=60?"B":score>=40?"C":"D";
  const verdict = score>=80?"SAFE SIGNAL":score>=60?"PROCEED WITH CAUTION":score>=40?"HIGH RISK":"DANGER — AVOID";
  return {score,grade,verdict,flags,goods};
}

export default async function handler(req,res) {
  res.setHeader("Access-Control-Allow-Origin","*");
  if (req.method==="OPTIONS") return res.status(200).end();
  const {mint} = req.query;
  if (!mint||mint.length<32) return res.status(400).json({error:"Valid mint address required"});

  // Cache check
  try {
    const {data:c} = await sb.from("token_scans").select("*").eq("mint",mint)
      .gte("updated_at", new Date(Date.now()-5*60*1000).toISOString()).maybeSingle();
    if (c) { res.setHeader("X-Cache","HIT"); res.setHeader("Cache-Control","s-maxage=300"); return res.status(200).json({...c,cached:true}); }
  } catch(e) { console.warn("Cache check:",e.message); }

  try {
    const [meta,mintInfo,holders,dex,rugcheck] = await Promise.all([
      helius("getAsset",{id:mint,displayOptions:{showFungible:true}}).catch(()=>null),
      helius("getAccountInfo",[mint,{encoding:"jsonParsed"}]).then(r=>r?.value?.data?.parsed?.info).catch(()=>null),
      helius("getTokenLargestAccounts",[mint]).then(r=>r?.value??[]).catch(()=>[]),
      fetch(`https://api.dexscreener.com/latest/dex/tokens/${mint}`,{signal:AbortSignal.timeout(8000)}).then(r=>r.json()).then(j=>j.pairs?.[0]??null).catch(()=>null),
      fetch(`https://api.rugcheck.xyz/v1/tokens/${mint}/report/summary`,{signal:AbortSignal.timeout(8000)}).then(r=>r.json()).catch(()=>null),
    ]);

    const decimals  = mintInfo?.decimals??6;
    const totalRaw  = mintInfo?.supply?Number(mintInfo.supply):0;
    const supply    = totalRaw/10**decimals;
    const BURN      = "1nc1nerator11111111111111111111111111111111";
    const topHolderPct = holders[0]&&totalRaw>0?(Number(holders[0].amount)/totalRaw)*100:0;
    const lpBurned  = holders.some(h=>h.address===BURN||h.address?.startsWith("11111"));
    const rugcheckScore = rugcheck?.score!==undefined?Math.round(rugcheck.score):rugcheck?.rugged===false?85:null;

    const d = {
      mint, name:meta?.content?.metadata?.name??meta?.token_info?.symbol??"Unknown",
      symbol:meta?.token_info?.symbol??"???", image_url:meta?.content?.links?.image??null,
      mintAuthority:mintInfo?.mintAuthority??null, freezeAuthority:mintInfo?.freezeAuthority??null,
      supply,decimals,holderCount:holders.length,topHolderPct,lpBurned,
      rugcheckScore, rugcheckRisks:rugcheck?.risks??[],
      price:dex?Number(dex.priceUsd):null, marketCap:dex?.fdv?Number(dex.fdv):null,
      liquidity:dex?.liquidity?.usd?Number(dex.liquidity.usd):null,
      volume24h:dex?.volume?.h24?Number(dex.volume.h24):null,
      change24h:dex?.priceChange?.h24!=null?Number(dex.priceChange.h24):null,
      buys24h:dex?.txns?.h24?.buys??null, sells24h:dex?.txns?.h24?.sells??null,
      dexUrl:dex?.url??null, holders:holders.slice(0,5),
    };

    const scored = calcScore(d);
    const result = {...d,...scored,scanned_at:new Date().toISOString()};

    sb.from("token_scans").upsert({
      mint,symbol:d.symbol,name:d.name,image_url:d.image_url,
      survival_score:scored.score,grade:scored.grade,
      mint_authority:!!d.mintAuthority,freeze_authority:!!d.freezeAuthority,
      lp_burned:d.lpBurned,top_holder_pct:d.topHolderPct,holder_count:d.holderCount,
      supply:d.supply,decimals:d.decimals,price_usd:d.price,market_cap_usd:d.marketCap,
      liquidity_usd:d.liquidity,volume_24h_usd:d.volume24h,change_24h_pct:d.change24h,
      buys_24h:d.buys24h,sells_24h:d.sells24h,rugcheck_score:d.rugcheckScore,
      rugcheck_risks:d.rugcheckRisks,full_report:result,
    },{onConflict:"mint"}).then(()=>{}).catch(e=>console.warn("Cache write:",e.message));

    res.setHeader("Cache-Control","s-maxage=300,stale-while-revalidate=60");
    res.setHeader("X-Cache","MISS");
    return res.status(200).json({...result,cached:false});
  } catch(err) {
    console.error("Token scan:",err);
    return res.status(500).json({error:"Scan failed",details:err.message});
  }
}

    
