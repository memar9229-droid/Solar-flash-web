    /**
 * api/cron/narratives.js
 * Each call processes ONE sector (faster, no timeout)
 * Pass ?sector=ai or run without param to process next in queue
 */
export const config = { maxDuration: 30 };

const SUPABASE_URL = () => process.env.SUPABASE_URL;
const SUPABASE_KEY = () => process.env.SUPABASE_SERVICE_KEY;

const SECTORS = {
  ai:     { name:"AI Infrastructure", icon:"🧠", category:"artificial-intelligence" },
  depin:  { name:"DePIN",             icon:"📡", category:"depin" },
  rwa:    { name:"RWA",               icon:"🏛", category:"real-world-assets-rwa" },
  layer1: { name:"Layer 1",           icon:"⛓", category:"layer-1" },
  defi:   { name:"DeFi",              icon:"⚡", category:"decentralized-finance-defi" },
  gaming: { name:"Gaming",            icon:"🎮", category:"gaming" },
  infra:  { name:"Infrastructure",    icon:"🔧", category:"infrastructure" },
  layer2: { name:"Layer 2",           icon:"⬡", category:"layer-2" },
  meme:   { name:"Memecoins",         icon:"🐸", category:"meme-token" },
};

function calcScore(tokens, meta) {
  const changes = tokens
    .map(t => parseFloat(t.price_change_percentage_7d_in_currency || 0))
    .filter(n => !isNaN(n));
  const avg7d   = changes.length ? changes.reduce((a,b)=>a+b,0)/changes.length : 0;
  const mcapChg = parseFloat(meta.market_cap_change_24h || 0);
  const priceScore = Math.max(0, Math.min(100, 50 + avg7d * 1.5));
  const mcapScore  = Math.max(0, Math.min(100, 50 + mcapChg * 30));
  return Math.round(priceScore * 0.6 + mcapScore * 0.4);
}

function classifyHeat(s)      { return s>=80?"Explosive":s>=65?"Hot":s>=45?"Warm":"Cold"; }
function classifyMomentum(s)  { return s>=65?"Rising":s<=35?"Falling":"Stable"; }
function classifyLifecycle(s) { return s>=70?"Expansion":s>=55?"Growth":s>=35?"Maturity":s>=20?"Saturation":"Decline"; }
function classifyEmerging(s,lc) {
  if (lc==="Expansion"&&s>=65) return "Dominant";
  if (lc==="Growth"&&s>=50)    return "Confirmed";
  if (s>=35)                    return "Emerging";
  return "EarlySignal";
}

export default async function handler(req, res) {
  // Pick which sector to process
  const sectorId = req.query.sector || Object.keys(SECTORS)[Math.floor(Date.now()/3600000) % 9];
  const cfg      = SECTORS[sectorId];

  if (!cfg) {
    return res.status(400).json({ error: `Unknown sector: ${sectorId}`, valid: Object.keys(SECTORS) });
  }

  try {
    // Fetch top tokens for this category
    const r = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=${cfg.category}&order=market_cap_desc&per_page=10&page=1&price_change_percentage=7d,24h`,
      { headers: { "Accept": "application/json" }, signal: AbortSignal.timeout(20000) }
    );

    if (!r.ok) {
      return res.status(200).json({ success: false, sector: sectorId, error: `CoinGecko ${r.status}` });
    }

    const tokens = await r.json();
    if (!tokens.length) {
      return res.status(200).json({ success: false, sector: sectorId, error: "No tokens returned" });
    }

    const changes7d = tokens
      .map(t => parseFloat(t.price_change_percentage_7d_in_currency || 0))
      .filter(n => !isNaN(n));
    const avg7d = changes7d.length ? changes7d.reduce((a,b)=>a+b,0)/changes7d.length : 0;
    const meta  = {};
    const score    = calcScore(tokens, meta);
    const heat     = classifyHeat(score);
    const momentum = classifyMomentum(score);
    const lifecycle = classifyLifecycle(score);
    const emerging  = classifyEmerging(score, lifecycle);
    const topSymbols = tokens.slice(0,5).map(t => t.symbol?.toUpperCase());

    const row = {
      id:               sectorId,
      name:             cfg.name,
      icon:             cfg.icon,
      category:         cfg.name,
      score,
      confidence_score: Math.min(100, Math.round(score * 0.9)),
      heat,
      momentum,
      lifecycle_stage:  lifecycle,
      emerging_status:  emerging,
      change_7d_pct:    parseFloat(avg7d.toFixed(2)),
      top_tokens:       topSymbols,
      signal_text:      `Score: ${score}/100 | ${lifecycle} | ${momentum} | CoinGecko live`,
      calculated_at:    new Date().toISOString(),
    };

    // Upsert to Supabase
    const ur = await fetch(`${SUPABASE_URL()}/rest/v1/narratives`, {
      method: "POST",
      headers: {
        "apikey":        SUPABASE_KEY(),
        "Authorization": `Bearer ${SUPABASE_KEY()}`,
        "Content-Type":  "application/json",
        "Prefer":        "resolution=merge-duplicates",
      },
      body: JSON.stringify(row),
    });

    // Log history
    await fetch(`${SUPABASE_URL()}/rest/v1/narrative_history`, {
      method: "POST",
      headers: {
        "apikey":        SUPABASE_KEY(),
        "Authorization": `Bearer ${SUPABASE_KEY()}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        narrative_id:    sectorId,
        score,
        confidence_score: row.confidence_score,
        momentum,
        heat,
        lifecycle_stage: lifecycle,
      }),
    });

    return res.status(200).json({
      success:    true,
      sector:     sectorId,
      name:       cfg.name,
      score,
      momentum,
      lifecycle,
      topTokens:  topSymbols,
      timestamp:  new Date().toISOString(),
    });

  } catch(err) {
    return res.status(200).json({
      success: false,
      sector:  sectorId,
      error:   err.message,
    });
  }
}

    
