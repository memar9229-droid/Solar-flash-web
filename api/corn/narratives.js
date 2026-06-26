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

function calcScore(tokens) {
  const changes = tokens
    .map(t => parseFloat(t.price_change_percentage_7d_in_currency || t.price_change_percentage_24h || 0))
    .filter(n => !isNaN(n));
  const avg = changes.length ? changes.reduce((a,b)=>a+b,0)/changes.length : 0;
  return Math.max(5, Math.min(95, Math.round(50 + avg * 1.5)));
}

function heat(s)      { return s>=80?"Explosive":s>=65?"Hot":s>=45?"Warm":"Cold"; }
function momentum(s)  { return s>=65?"Rising":s<=35?"Falling":"Stable"; }
function lifecycle(s) { return s>=70?"Expansion":s>=55?"Growth":s>=35?"Maturity":s>=20?"Saturation":"Decline"; }
function emerging(s,lc) {
  if (lc==="Expansion"&&s>=65) return "Dominant";
  if (lc==="Growth"&&s>=50)    return "Confirmed";
  return s>=35?"Emerging":"EarlySignal";
}

export default async function handler(req, res) {
  const sectorId = req.query.sector || Object.keys(SECTORS)[new Date().getHours() % 9];
  const cfg      = SECTORS[sectorId];
  if (!cfg) return res.status(400).json({ error:"Unknown sector", valid:Object.keys(SECTORS) });

  let tokens = [];
  try {
    const r = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=${cfg.category}&order=market_cap_desc&per_page=5&page=1&price_change_percentage=7d`
    );
    if (r.ok) tokens = await r.json();
  } catch(e) {
    return res.status(200).json({ success:false, sector:sectorId, error:"CoinGecko fetch failed: "+e.message });
  }

  if (!tokens.length) {
    return res.status(200).json({ success:false, sector:sectorId, error:"No tokens from CoinGecko" });
  }

  const score = calcScore(tokens);
  const lc    = lifecycle(score);
  const row   = {
    id:               sectorId,
    name:             cfg.name,
    icon:             cfg.icon,
    category:         cfg.name,
    score,
    confidence_score: Math.round(score * 0.9),
    heat:             heat(score),
    momentum:         momentum(score),
    lifecycle_stage:  lc,
    emerging_status:  emerging(score, lc),
    change_7d_pct:    parseFloat((tokens.map(t=>parseFloat(t.price_change_percentage_7d_in_currency||0)).reduce((a,b)=>a+b,0)/tokens.length).toFixed(2)),
    top_tokens:       tokens.slice(0,5).map(t=>t.symbol?.toUpperCase()),
    signal_text:      `Score: ${score}/100 | ${lc} | ${momentum(score)} | CoinGecko live data`,
    calculated_at:    new Date().toISOString(),
  };

  // Save to Supabase
  await fetch(`${SUPABASE_URL()}/rest/v1/narratives`, {
    method:"POST",
    headers:{
      "apikey":SUPABASE_KEY(),
      "Authorization":`Bearer ${SUPABASE_KEY()}`,
      "Content-Type":"application/json",
      "Prefer":"resolution=merge-duplicates",
    },
    body:JSON.stringify(row),
  });

  // Save history
  await fetch(`${SUPABASE_URL()}/rest/v1/narrative_history`, {
    method:"POST",
    headers:{
      "apikey":SUPABASE_KEY(),
      "Authorization":`Bearer ${SUPABASE_KEY()}`,
      "Content-Type":"application/json",
    },
    body:JSON.stringify({
      narrative_id:     sectorId,
      score,
      confidence_score: row.confidence_score,
      momentum:         row.momentum,
      heat:             row.heat,
      lifecycle_stage:  lc,
    }),
  });

  return res.status(200).json({
    success:   true,
    sector:    sectorId,
    name:      cfg.name,
    score,
    momentum:  row.momentum,
    lifecycle: lc,
    topTokens: row.top_tokens,
    timestamp: new Date().toISOString(),
  });
}

    
