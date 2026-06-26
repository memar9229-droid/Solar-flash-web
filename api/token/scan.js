    /**
 * api/token/scan.js — Token Intelligence Engine
 */
export const config = { maxDuration: 30 };

import { log }                         from "../lib/http.js";
import { ok, err, handleOptions }      from "../lib/respond.js";
import { sbSelect, sbUpsert }          from "../lib/supabase.js";
import { getTokenPairs, pairToMarketData } from "../services/dexscreener.js";
import { getAccountInfo, getTokenLargestAccounts, getAsset } from "../services/helius.js";

function calcScore(d) {
  let score = 100;
  const flags = [], goods = [];
  if (d.mintAuthority)  { score-=30; flags.push({sev:"critical",icon:"🚨",text:"Mint authority ACTIVE"}); }
  else goods.push({icon:"✅",text:"Mint authority revoked"});
  if (d.freezeAuthority){ score-=20; flags.push({sev:"high",icon:"⚠️",text:"Freeze authority active"}); }
  else goods.push({icon:"✅",text:"Freeze authority revoked"});
  if (!d.lpBurned)      { score-=30; flags.push({sev:"critical",icon:"🚨",text:"Liquidity NOT secured"}); }
  else goods.push({icon:"🔥",text:"Liquidity burned"});
  if (d.topHolderPct>50)     { score-=25; flags.push({sev:"critical",icon:"🚨",text:`Top holder ${d.topHolderPct.toFixed(1)}%`}); }
  else if (d.topHolderPct>20){ score-=10; flags.push({sev:"medium",icon:"⚠️",text:`Top holder ${d.topHolderPct.toFixed(1)}%`}); }
  if (d.rugcheckScore&&d.rugcheckScore<70){ score-=15; flags.push({sev:"high",icon:"⚠️",text:`RugCheck ${d.rugcheckScore}/100`}); }
  if (d.holderCount<50){ score-=10; flags.push({sev:"low",icon:"⚠️",text:`Only ${d.holderCount} holders`}); }
  score = Math.max(0, Math.min(100, score));
  return {
    score,
    grade:   score>=80?"A":score>=60?"B":score>=40?"C":"D",
    verdict: score>=80?"SAFE SIGNAL":score>=60?"PROCEED WITH CAUTION":score>=40?"HIGH RISK":"DANGER — AVOID",
    flags, goods,
  };
}

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;

  const { mint } = req.query;
  if (!mint||mint.length<32) return err(res, "Valid mint address required", 400);

  log("info", "Token scan start", { mint: mint.slice(0,8) });

  // Check 5-min cache
  try {
    const fiveAgo = new Date(Date.now()-5*60*1000).toISOString();
    const cached  = await sbSelect("token_scans",
      `mint=eq.${mint}&updated_at=gte.${fiveAgo}&select=*&limit=1`, true);
    if (cached?.[0]) {
      log("info", "Token scan cache hit", { mint: mint.slice(0,8) });
      res.setHeader("X-Cache","HIT");
      return ok(res, { ...cached[0], cached:true }, 300);
    }
  } catch(e) {}

  try {
    // Parallel fetch: Helius + DexScreener + RugCheck
    const [meta, mintInfo, holders, pairs, rugcheck] = await Promise.all([
      getAsset(mint).catch(()=>null),
      getAccountInfo(mint).then(r=>r?.value?.data?.parsed?.info).catch(()=>null),
      getTokenLargestAccounts(mint).catch(()=>[]),
      getTokenPairs(mint).catch(()=>[]),
      fetch(`https://api.rugcheck.xyz/v1/tokens/${mint}/report/summary`).then(r=>r.ok?r.json():null).catch(()=>null),
    ]);

    const dex      = pairs.sort((a,b)=>parseFloat(b.liquidity?.usd||0)-parseFloat(a.liquidity?.usd||0))[0]||null;
    const market   = pairToMarketData(dex);
    const decimals = mintInfo?.decimals??6;
    const totalRaw = mintInfo?.supply?Number(mintInfo.supply):0;
    const supply   = totalRaw/10**decimals;
    const BURN     = "1nc1nerator11111111111111111111111111111111";
    const topHolderPct = holders[0]&&totalRaw>0?(Number(holders[0].amount)/totalRaw)*100:0;
    const lpBurned = holders.some(h=>h.address===BURN||h.address?.startsWith("11111"));
    const rugcheckScore = rugcheck?.score!=null?Math.round(rugcheck.score):null;

    const d = { mintAuthority:mintInfo?.mintAuthority??null, freezeAuthority:mintInfo?.freezeAuthority??null,
                supply, decimals, holderCount:holders.length, topHolderPct, lpBurned, rugcheckScore };
    const scored = calcScore(d);

    const result = {
      mint,
      name:            meta?.content?.metadata?.name??"Unknown Token",
      symbol:          meta?.token_info?.symbol??"???",
      image_url:       meta?.content?.links?.image??null,
      mint_authority:  !!d.mintAuthority,
      freeze_authority:!!d.freezeAuthority,
      lp_burned:       d.lpBurned,
      top_holder_pct:  d.topHolderPct,
      holder_count:    d.holderCount,
      supply:          d.supply,
      decimals:        d.decimals,
      price_usd:       market?.price??null,
      market_cap_usd:  market?.fdv??null,
      liquidity_usd:   market?.liquidity??null,
      volume_24h_usd:  market?.volume24h??null,
      change_24h_pct:  market?.change24h??null,
      buys_24h:        market?.buys24h??null,
      sells_24h:       market?.sells24h??null,
      dexUrl:          market?.dexUrl??null,
      holders:         holders.slice(0,5),
      rugcheck_score:  d.rugcheckScore,
      rugcheck_risks:  rugcheck?.risks??[],
      survival_score:  scored.score,
      grade:           scored.grade,
      verdict:         scored.verdict,
      flags:           scored.flags,
      goods:           scored.goods,
      scanned_at:      new Date().toISOString(),
    };

    sbUpsert("token_scans", {...result, updated_at:new Date().toISOString()}).catch(()=>{});

    log("info", "Token scan complete", { mint:mint.slice(0,8), score:scored.score });
    res.setHeader("X-Cache","MISS");
    return ok(res, {...result, cached:false}, 300);
  } catch(e) {
    log("error", "Token scan failed", { mint:mint.slice(0,8), error:e.message });
    return err(res, "Token scan failed", 500, e.message);
  }
}

    
