    export const config = { maxDuration: 20 };

export default async function handler(req, res) {
  // Step 1: immediately set headers and confirm function started
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");

  const log = [];
  log.push("function_started");

  const sid = (req.query && req.query.sector) || null;
  if (!sid) {
    return res.status(400).json({
      error: "sector param required",
      valid: ["ai","depin","rwa","layer1","defi","gaming","infra","layer2","meme"],
      log,
    });
  }

  const SECTORS = {
    ai:     { name:"AI Infrastructure", icon:"🧠", token:"TAO" },
    depin:  { name:"DePIN",             icon:"📡", token:"HNT" },
    rwa:    { name:"RWA",               icon:"🏛", token:"ONDO" },
    layer1: { name:"Layer 1",           icon:"⛓", token:"SOL" },
    defi:   { name:"DeFi",              icon:"⚡", token:"JUP" },
    gaming: { name:"Gaming",            icon:"🎮", token:"IMX" },
    infra:  { name:"Infrastructure",    icon:"🔧", token:"LINK" },
    layer2: { name:"Layer 2",           icon:"⬡", token:"ARB" },
    meme:   { name:"Memecoins",         icon:"🐸", token:"WIF" },
  };

  const cfg = SECTORS[sid];
  if (!cfg) {
    return res.status(400).json({ error: "Unknown sector", valid: Object.keys(SECTORS), log });
  }

  log.push("sector_validated:" + sid);

  // Step 2: fetch DexScreener with hard timeout
  let change24h = 0;
  let pairsFound = 0;

  try {
    log.push("fetch_start");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    const r = await fetch(
      `https://api.dexscreener.com/latest/dex/search?q=${cfg.token}`,
      { signal: controller.signal }
    );
    clearTimeout(timer);
    log.push("fetch_done:" + r.status);

    if (r.ok) {
      const data = await r.json();
      const pairs = (data.pairs || []).filter(p =>
        p.baseToken?.symbol?.toUpperCase() === cfg.token.toUpperCase()
      );
      pairsFound = pairs.length;
      if (pairs[0]) change24h = parseFloat(pairs[0].priceChange?.h24 || 0);
      log.push("pairs_parsed:" + pairsFound);
    }
  } catch(e) {
    log.push("fetch_error:" + e.message);
    // Continue — don't hang
  }

  // Step 3: calculate score
  const score = Math.max(5, Math.min(95, Math.round(50 + change24h * 1.2)));
  const lc    = score>=70?"Expansion":score>=55?"Growth":score>=35?"Maturity":score>=20?"Saturation":"Decline";
  const mom   = score>=63?"Rising":score<=37?"Falling":"Stable";

  log.push("score_calculated:" + score);

  // Step 4: save to Supabase
  let saved = false;
  const SB_URL = process.env.SUPABASE_URL;
  const SB_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (SB_URL && SB_KEY) {
    try {
      log.push("supabase_start");
      const sr = await fetch(`${SB_URL}/rest/v1/narratives`, {
        method: "POST",
        headers: {
          "apikey":        SB_KEY,
          "Authorization": `Bearer ${SB_KEY}`,
          "Content-Type":  "application/json",
          "Prefer":        "resolution=merge-duplicates",
        },
        body: JSON.stringify({
          id:               sid,
          name:             cfg.name,
          icon:             cfg.icon,
          category:         cfg.name,
          score,
          confidence_score: Math.round(score * 0.9),
          heat:             score>=80?"Explosive":score>=65?"Hot":score>=45?"Warm":"Cold",
          momentum:         mom,
          lifecycle_stage:  lc,
          emerging_status:  lc==="Expansion"&&score>=65?"Dominant":lc==="Growth"&&score>=50?"Confirmed":score>=35?"Emerging":"EarlySignal",
          top_tokens:       [cfg.token],
          signal_text:      `Score:${score}/100 | ${lc} | ${mom} | DexScreener`,
          calculated_at:    new Date().toISOString(),
        }),
      });
      saved = sr.ok;
      log.push("supabase_done:" + sr.status);
    } catch(e) {
      log.push("supabase_error:" + e.message);
    }
  } else {
    log.push("supabase_env_missing");
  }

  // Step 5: ALWAYS return JSON
  log.push("returning_response");
  return res.status(200).json({
    success:   true,
    sector:    sid,
    name:      cfg.name,
    score,
    momentum:  mom,
    lifecycle: lc,
    pairs:     pairsFound,
    saved,
    log,
    ts:        new Date().toISOString(),
  });
}

    
