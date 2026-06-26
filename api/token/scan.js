    // Uses Supabase REST API directly via fetch — no SDK needed
// Works in all Vercel runtimes without extra dependencies

export const config = { maxDuration: 30 };

async function helius(method, params) {
  const r = await fetch(`https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  return (await r.json()).result;
}

function calcScore(d) {
  let score = 100;
  const flags = [], goods = [];
  if (d.mintAuthority)  { score -= 30; flags.push({ sev:"critical", icon:"🚨", text:"Mint authority ACTIVE" }); }
  else goods.push({ icon:"✅", text:"Mint authority revoked" });
  if (d.freezeAuthority){ score -= 20; flags.push({ sev:"high", icon:"⚠️", text:"Freeze authority active" }); }
  else goods.push({ icon:"✅", text:"Freeze authority revoked" });
  if (!d.lpBurned)      { score -= 30; flags.push({ sev:"critical", icon:"🚨", text:"Liquidity NOT secured" }); }
  else goods.push({ icon:"🔥", text:"Liquidity burned" });
  if (d.topHolderPct > 50)      { score -= 25; flags.push({ sev:"critical", icon:"🚨", text:`Top holder ${d.topHolderPct.toFixed(1)}%` }); }
  else if (d.topHolderPct > 20) { score -= 10; flags.push({ sev:"medium",   icon:"⚠️", text:`Top holder ${d.topHolderPct.toFixed(1)}%` }); }
  if (d.rugcheckScore && d.rugcheckScore < 70) { score -= 15; flags.push({ sev:"high", icon:"⚠️", text:`RugCheck ${d.rugcheckScore}/100` }); }
  if (d.holderCount < 50) { score -= 10; flags.push({ sev:"low", icon:"⚠️", text:`Only ${d.holderCount} holders` }); }
  score = Math.max(0, Math.min(100, score));
  const grade   = score >= 80 ? "A" : score >= 60 ? "B" : score >= 40 ? "C" : "D";
  const verdict = score >= 80 ? "SAFE SIGNAL" : score >= 60 ? "PROCEED WITH CAUTION" : score >= 40 ? "HIGH RISK" : "DANGER — AVOID";
  return { score, grade, verdict, flags, goods };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { mint } = req.query;
  if (!mint || mint.length < 32) return res.status(400).json({ error: "Valid mint address required" });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

  // Check cache
  try {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const cr = await fetch(
      `${SUPABASE_URL}/rest/v1/token_scans?mint=eq.${mint}&updated_at=gte.${fiveMinAgo}&select=*&limit=1`,
      { headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` } }
    );
    const cached = await cr.json();
    if (cached && cached[0]) {
      res.setHeader("X-Cache", "HIT");
      return res.status(200).json({ ...cached[0], cached: true });
    }
  } catch(e) {}

  try {
    const [meta, mintInfo, holders, dex, rugcheck] = await Promise.all([
      helius("getAsset", { id: mint, displayOptions: { showFungible: true } }).catch(() => null),
      helius("getAccountInfo", [mint, { encoding: "jsonParsed" }]).then(r => r?.value?.data?.parsed?.info).catch(() => null),
      helius("getTokenLargestAccounts", [mint]).then(r => r?.value ?? []).catch(() => []),
      fetch(`https://api.dexscreener.com/latest/dex/tokens/${mint}`).then(r => r.json()).then(j => j.pairs?.[0] ?? null).catch(() => null),
      fetch(`https://api.rugcheck.xyz/v1/tokens/${mint}/report/summary`).then(r => r.json()).catch(() => null),
    ]);

    const decimals     = mintInfo?.decimals ?? 6;
    const totalRaw     = mintInfo?.supply ? Number(mintInfo.supply) : 0;
    const supply       = totalRaw / 10 ** decimals;
    const BURN         = "1nc1nerator11111111111111111111111111111111";
    const topHolderPct = holders[0] && totalRaw > 0 ? (Number(holders[0].amount) / totalRaw) * 100 : 0;
    const lpBurned     = holders.some(h => h.address === BURN || h.address?.startsWith("11111"));
    const rugcheckScore = rugcheck?.score !== undefined ? Math.round(rugcheck.score) : null;

    const d = {
      mint, mintAuthority: mintInfo?.mintAuthority ?? null,
      freezeAuthority: mintInfo?.freezeAuthority ?? null,
      supply, decimals, holderCount: holders.length, topHolderPct, lpBurned, rugcheckScore,
    };
    const scored = calcScore(d);

    const result = {
      mint,
      name:           meta?.content?.metadata?.name ?? "Unknown Token",
      symbol:         meta?.token_info?.symbol ?? "???",
      image_url:      meta?.content?.links?.image ?? null,
      mint_authority: !!d.mintAuthority,
      freeze_authority: !!d.freezeAuthority,
      lp_burned:      d.lpBurned,
      top_holder_pct: d.topHolderPct,
      holder_count:   d.holderCount,
      supply:         d.supply,
      decimals:       d.decimals,
      price_usd:      dex ? Number(dex.priceUsd) : null,
      market_cap_usd: dex?.fdv ? Number(dex.fdv) : null,
      liquidity_usd:  dex?.liquidity?.usd ? Number(dex.liquidity.usd) : null,
      volume_24h_usd: dex?.volume?.h24 ? Number(dex.volume.h24) : null,
      change_24h_pct: dex?.priceChange?.h24 != null ? Number(dex.priceChange.h24) : null,
      buys_24h:       dex?.txns?.h24?.buys ?? null,
      sells_24h:      dex?.txns?.h24?.sells ?? null,
      dexUrl:         dex?.url ?? null,
      holders:        holders.slice(0, 5),
      rugcheck_score: d.rugcheckScore,
      rugcheck_risks: rugcheck?.risks ?? [],
      survival_score: scored.score,
      grade:          scored.grade,
      verdict:        scored.verdict,
      flags:          scored.flags,
      goods:          scored.goods,
      scanned_at:     new Date().toISOString(),
    };

    // Cache to Supabase
    fetch(`${SUPABASE_URL}/rest/v1/token_scans`, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates",
      },
      body: JSON.stringify({ ...result, updated_at: new Date().toISOString() }),
    }).catch(() => {});

    res.setHeader("Cache-Control", "s-maxage=300");
    res.setHeader("X-Cache", "MISS");
    return res.status(200).json({ ...result, cached: false });
  } catch (err) {
    return res.status(500).json({ error: "Scan failed", details: err.message });
  }
}

    
