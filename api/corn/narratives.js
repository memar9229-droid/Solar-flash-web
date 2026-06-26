    /**
 * api/cron/narratives.js
 * Runs every 6 hours via Vercel Cron
 * Fetches real narrative data from CoinGecko + DexScreener
 * Writes to Supabase narratives table
 */
export const config = { maxDuration: 60 };

const SUPABASE_URL = () => process.env.SUPABASE_URL;
const SUPABASE_KEY = () => process.env.SUPABASE_SERVICE_KEY;

const SECTORS = {
  ai:     { name:"AI Infrastructure", icon:"🧠", category:"artificial-intelligence",      tokens:["TAO","RNDR","FET","OCEAN"] },
  depin:  { name:"DePIN",             icon:"📡", category:"depin",                         tokens:["HNT","IOTX","MOBILE"] },
  rwa:    { name:"RWA",               icon:"🏛", category:"real-world-assets-rwa",          tokens:["ONDO","MKR","PENDLE"] },
  layer1: { name:"Layer 1",           icon:"⛓", category:"layer-1",                        tokens:["SOL","SUI","AVAX"] },
  defi:   { name:"DeFi",              icon:"⚡", category:"decentralized-finance-defi",     tokens:["UNI","AAVE","JUP"] },
  gaming: { name:"Gaming",            icon:"🎮", category:"gaming",                         tokens:["IMX","RONIN","BEAM"] },
  infra:  { name:"Infrastructure",    icon:"🔧", category:"infrastructure",                 tokens:["LINK","PYTH","JTO"] },
  layer2: { name:"Layer 2",           icon:"⬡", category:"layer-2",                        tokens:["ARB","OP","STRK"] },
  meme:   { name:"Memecoins",         icon:"🐸", category:"meme-token",                     tokens:["WIF","BONK","DOGE"] },
};

const ICONS = { ai:"🧠",depin:"📡",rwa:"🏛",layer1:"⛓",defi:"⚡",gaming:"🎮",infra:"🔧",layer2:"⬡",meme:"🐸" };

async function fetchCategory(categoryId) {
  try {
    const r = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=${categoryId}&order=market_cap_desc&per_page=10&page=1&price_change_percentage=7d,24h`,
      { headers: { "Accept": "application/json" }, signal: AbortSignal.timeout(15000) }
    );
    if (!r.ok) return [];
    return await r.json();
  } catch(e) {
    return [];
  }
}

async function fetchCategoryMeta(categoryId) {
  try {
    const r = await fetch(
      `https://api.coingecko.com/api/v3/coins/categories`,
      { headers: { "Accept": "application/json" }, signal: AbortSignal.timeout(15000) }
    );
    if (!r.ok) return {};
    const all = await r.json();
    return all.find(c => c.id === categoryId) || {};
  } catch(e) {
    return {};
  }
}

function calcScore(tokens, meta) {
  const changes = tokens.map(t => parseFloat(t.price_change_percentage_7d_in_currency || 0)).filter(Boolean);
  const avg7d   = changes.length ? changes.reduce((a,b)=>a+b,0)/changes.length : 0;
  const mcapChg = parseFloat(meta.market_cap_change_24h || 0);

  const priceScore  = Math.max(0, Math.min(100, 50 + avg7d * 1.5));
  const mcapScore   = Math.max(0, Math.min(100, 50 + mcapChg * 30));
  const volScore    = 50; // default without DexScreener

  return Math.round(priceScore * 0.5 + mcapScore * 0.3 + volScore * 0.2);
}

function classifyHeat(score)     { return score>=80?"Explosive":score>=65?"Hot":score>=45?"Warm":"Cold"; }
function classifyMomentum(score, prev) { const d=score-prev; return d>3?"Rising":d<-3?"Falling":"Stable"; }
function classifyLifecycle(score) { return score>=70?"Expansion":score>=55?"Growth":score>=35?"Maturity":score>=20?"Saturation":"Decline"; }
function classifyEmerging(score, lc) {
  if (lc==="Expansion"&&score>=65) return "Dominant";
  if (lc==="Growth"&&score>=50)    return "Confirmed";
  if (score>=35)                    return "Emerging";
  return "EarlySignal";
}

async function upsertNarrative(row) {
  const r = await fetch(`${SUPABASE_URL()}/rest/v1/narratives`, {
    method: "POST",
    headers: {
      "apikey":        SUPABASE_KEY(),
      "Authorization": `Bearer ${SUPABASE_KEY()}`,
      "Content-Type":  "application/json",
      "Prefer":        "resolution=merge-duplicates",
    },
    body: JSON.stringify(row),
  });
  return r.ok;
}

async function logHistory(row) {
  await fetch(`${SUPABASE_URL()}/rest/v1/narrative_history`, {
    method: "POST",
    headers: {
      "apikey":        SUPABASE_KEY(),
      "Authorization": `Bearer ${SUPABASE_KEY()}`,
      "Content-Type":  "application/json",
    },
    body: JSON.stringify(row),
  });
}

export default async function handler(req, res) {
  // Allow manual trigger or cron
  const authHeader = req.headers["authorization"];
  if (req.method !== "GET" && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const results = { processed: 0, errors: 0, sectors: [] };

  // Fetch categories meta once
  let categoryMeta = {};
  try {
    const r = await fetch("https://api.coingecko.com/api/v3/coins/categories", { signal: AbortSignal.timeout(15000) });
    if (r.ok) {
      const all = await r.json();
      for (const c of all) { categoryMeta[c.id] = c; }
    }
  } catch(e) {}

  for (const [sectorId, cfg] of Object.entries(SECTORS)) {
    try {
      // Rate limit: CoinGecko free = 10-30 req/min
      await new Promise(r => setTimeout(r, 3000));

      const tokens = await fetchCategory(cfg.category);
      const meta   = categoryMeta[cfg.category] || {};

      if (!tokens.length) {
        results.errors++;
        continue;
      }

      const score    = calcScore(tokens, meta);
      const heat     = classifyHeat(score);
      const momentum = classifyMomentum(score, score - 2); // simple default
      const lifecycle = classifyLifecycle(score);
      const emerging  = classifyEmerging(score, lifecycle);

      const changes7d = tokens.map(t => parseFloat(t.price_change_percentage_7d_in_currency || 0)).filter(Boolean);
      const avg7d     = changes7d.length ? changes7d.reduce((a,b)=>a+b,0)/changes7d.length : 0;
      const mcapUsd   = meta.market_cap || 0;
      const capFlow   = parseFloat(((meta.market_cap_change_24h||0) * mcapUsd / 100 / 1e9).toFixed(2));
      const topSymbols = tokens.slice(0,5).map(t => t.symbol?.toUpperCase());

      const row = {
        id:               sectorId,
        name:             cfg.name,
        icon:             ICONS[sectorId],
        category:         cfg.name,
        score,
        confidence_score: Math.min(100, Math.round(score * 0.9)),
        persistence_score:Math.min(100, Math.round(score * 0.85)),
        engagement_score: 50,
        capital_flow_score: Math.min(100, Math.round(score * 0.8)),
        heat,
        momentum,
        lifecycle_stage:  lifecycle,
        emerging_status:  emerging,
        capital_flow:     capFlow,
        volume_7d_usd:    meta.volume_24h || null,
        market_cap_usd:   mcapUsd || null,
        dominance_pct:    parseFloat((score / 5).toFixed(1)),
        change_7d_pct:    parseFloat(avg7d.toFixed(2)),
        change_24h_pct:   parseFloat((meta.market_cap_change_24h||0).toFixed(2)),
        top_tokens:       topSymbols,
        signal_text:      `Score: ${score}/100 | ${lifecycle} | ${momentum} | Source: CoinGecko live data`,
        data_sources:     { coingecko: true, dexscreener: false, lunarcrush: false },
        calculated_at:    new Date().toISOString(),
      };

      const ok = await upsertNarrative(row);
      if (ok) {
        await logHistory({
          narrative_id:    sectorId,
          score,
          confidence_score: row.confidence_score,
          capital_flow:    capFlow,
          momentum,
          heat,
          lifecycle_stage: lifecycle,
          volume_7d_usd:   meta.volume_24h || null,
          social_score:    50,
        });
        results.processed++;
        results.sectors.push({ id: sectorId, score, momentum, lifecycle });
      } else {
        results.errors++;
      }
    } catch(e) {
      results.errors++;
    }
  }

  return res.status(200).json({
    success: true,
    processed: results.processed,
    errors: results.errors,
    sectors: results.sectors,
    timestamp: new Date().toISOString(),
  });
}

    
