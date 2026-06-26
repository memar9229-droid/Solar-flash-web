    /**
 * api/cron/narratives.js
 * Uses DexScreener instead of CoinGecko
 * DexScreener does NOT block Vercel IPs
 */
export const config = { maxDuration: 30 };

const SB_URL = () => process.env.SUPABASE_URL;
const SB_KEY = () => process.env.SUPABASE_SERVICE_KEY;

// Token mint addresses on Solana for each sector
const SECTOR_TOKENS = {
  ai:     ["TAO","FET","RNDR","OCEAN"],
  depin:  ["HNT","MOBILE","IOTX"],
  rwa:    ["ONDO","PENDLE"],
  layer1: ["SOL","SUI","AVAX"],
  defi:   ["JUP","RAY","JTO"],
  gaming: ["IMX","BEAM"],
  infra:  ["LINK","PYTH"],
  layer2: ["ARB","OP","STRK"],
  meme:   ["WIF","BONK","DOGE"],
};

const SECTOR_META = {
  ai:     { name:"AI Infrastructure", icon:"🧠" },
  depin:  { name:"DePIN",             icon:"📡" },
  rwa:    { name:"RWA",               icon:"🏛" },
  layer1: { name:"Layer 1",           icon:"⛓" },
  defi:   { name:"DeFi",              icon:"⚡" },
  gaming: { name:"Gaming",            icon:"🎮" },
  infra:  { name:"Infrastructure",    icon:"🔧" },
  layer2: { name:"Layer 2",           icon:"⬡" },
  meme:   { name:"Memecoins",         icon:"🐸" },
};

function calcScore(pairs) {
  if (!pairs.length) return 50;
  const changes = pairs
    .map(p => parseFloat(p.priceChange?.h24 || 0))
    .filter(n => !isNaN(n));
  const avg = changes.length
    ? changes.reduce((a,b)=>a+b,0) / changes.length
    : 0;
  return Math.max(5, Math.min(95, Math.round(50 + avg * 1.2)));
}

function heat(s)       { return s>=80?"Explosive":s>=65?"Hot":s>=45?"Warm":"Cold"; }
function momentum(s)   { return s>=62?"Rising":s<=38?"Falling":"Stable"; }
function lifecycle(s)  { return s>=70?"Expansion":s>=55?"Growth":s>=35?"Maturity":s>=20?"Saturation":"Decline"; }
function emerging(s,lc){ return (lc==="Expansion"&&s>=65)?"Dominant":(lc==="Growth"&&s>=50)?"Confirmed":s>=35?"Emerging":"EarlySignal"; }

async function sbUpsert(row) {
  const r = await fetch(`${SB_URL()}/rest/v1/narratives`, {
    method: "POST",
    headers: {
      "apikey":        SB_KEY(),
      "Authorization": `Bearer ${SB_KEY()}`,
      "Content-Type":  "application/json",
      "Prefer":        "resolution=merge-duplicates",
    },
    body: JSON.stringify(row),
  });
  return r.ok;
}

export default async function handler(req, res) {
  const sectorId = req.query.sector;
  if (!sectorId || !SECTOR_META[sectorId]) {
    return res.status(400).json({
      error:  "sector param required",
      valid:  Object.keys(SECTOR_META),
      usage:  "/api/cron/narratives?sector=ai",
    });
  }

  const meta   = SECTOR_META[sectorId];
  const tokens = SECTOR_TOKENS[sectorId] || [];

  // Fetch from DexScreener — works from Vercel IPs
  const pairs = [];
  for (const symbol of tokens.slice(0,3)) {
    try {
      const r = await fetch(
        `https://api.dexscreener.com/latest/dex/search?q=${symbol}`,
      );
      if (!r.ok) continue;
      const data = await r.json();
      const best = (data.pairs || []).find(p =>
        p.baseToken?.symbol?.toUpperCase() === symbol.toUpperCase() &&
        parseFloat(p.liquidity?.usd || 0) > 50000
      );
      if (best) pairs.push(best);
    } catch(e) {
      continue;
    }
  }

  const score = calcScore(pairs);
  const lc    = lifecycle(score);
  const mom   = momentum(score);
  const avg24h = pairs.length
    ? pairs.map(p=>parseFloat(p.priceChange?.h24||0)).reduce((a,b)=>a+b,0)/pairs.length
    : 0;

  const row = {
    id:               sectorId,
    name:             meta.name,
    icon:             meta.icon,
    category:         meta.name,
    score,
    confidence_score: Math.round(score * 0.9),
    heat:             heat(score),
    momentum:         mom,
    lifecycle_stage:  lc,
    emerging_status:  emerging(score, lc),
    change_7d_pct:    parseFloat(avg24h.toFixed(2)),
    top_tokens:       tokens.slice(0,5),
    signal_text:      `Score: ${score}/100 | ${lc} | ${mom} | DexScreener live`,
    calculated_at:    new Date().toISOString(),
  };

  const saved = await sbUpsert(row);

  // Log history
  if (saved) {
    await fetch(`${SB_URL()}/rest/v1/narrative_history`, {
      method: "POST",
      headers: {
        "apikey":        SB_KEY(),
        "Authorization": `Bearer ${SB_KEY()}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        narrative_id:     sectorId,
        score,
        confidence_score: row.confidence_score,
        momentum:         mom,
        heat:             heat(score),
        lifecycle_stage:  lc,
      }),
    });
  }

  return res.status(200).json({
    success:   saved,
    sector:    sectorId,
    name:      meta.name,
    score,
    momentum:  mom,
    lifecycle: lc,
    pairsFound:pairs.length,
    timestamp: new Date().toISOString(),
  });
}

    
