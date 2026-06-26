/**
 * api/services/narratives.js
 * Narrative scoring business logic
 * Used by both cron and API endpoint
 */

export const SECTORS = {
  ai:     { name:"AI Infrastructure", icon:"🧠", tokens:["TAO","FET","RNDR","OCEAN","AIOZ"] },
  depin:  { name:"DePIN",             icon:"📡", tokens:["HNT","MOBILE","IOTX","DIMO"]      },
  rwa:    { name:"RWA",               icon:"🏛", tokens:["ONDO","PENDLE","MKR"]              },
  layer1: { name:"Layer 1",           icon:"⛓", tokens:["SOL","SUI","AVAX","APT"]           },
  defi:   { name:"DeFi",              icon:"⚡", tokens:["JUP","RAY","JTO","AAVE","UNI"]     },
  gaming: { name:"Gaming",            icon:"🎮", tokens:["IMX","BEAM","RONIN","MAGIC"]       },
  infra:  { name:"Infrastructure",    icon:"🔧", tokens:["LINK","PYTH","JTO","W"]            },
  layer2: { name:"Layer 2",           icon:"⬡", tokens:["ARB","OP","STRK"]                  },
  meme:   { name:"Memecoins",         icon:"🐸", tokens:["WIF","BONK","DOGE","PEPE"]         },
};

export function scoreFromPairs(pairs) {
  if (!pairs.length) return 50;
  const changes = pairs
    .map(p => parseFloat(p.priceChange?.h24 || 0))
    .filter(n => !isNaN(n) && isFinite(n));
  const avg = changes.length
    ? changes.reduce((a,b)=>a+b,0) / changes.length
    : 0;
  return Math.max(5, Math.min(95, Math.round(50 + avg * 1.2)));
}

export function heat(s)       { return s>=80?"Explosive":s>=65?"Hot":s>=45?"Warm":"Cold"; }
export function momentum(s)   { return s>=63?"Rising":s<=37?"Falling":"Stable"; }
export function lifecycle(s)  { return s>=70?"Expansion":s>=55?"Growth":s>=35?"Maturity":s>=20?"Saturation":"Decline"; }
export function emerging(s,lc){
  if (lc==="Expansion"&&s>=65) return "Dominant";
  if (lc==="Growth"&&s>=50)    return "Confirmed";
  return s>=35 ? "Emerging" : "EarlySignal";
}

export function buildNarrativeRow(sectorId, pairs, score) {
  const cfg = SECTORS[sectorId];
  if (!cfg) throw new Error(`Unknown sector: ${sectorId}`);
  const lc  = lifecycle(score);
  const mom = momentum(score);
  const avg24h = pairs.length
    ? pairs.map(p=>parseFloat(p.priceChange?.h24||0)).reduce((a,b)=>a+b,0)/pairs.length
    : 0;
  return {
    id:               sectorId,
    name:             cfg.name,
    icon:             cfg.icon,
    category:         cfg.name,
    score,
    confidence_score: Math.round(score * 0.9),
    heat:             heat(score),
    momentum:         mom,
    lifecycle_stage:  lc,
    emerging_status:  emerging(score, lc),
    change_7d_pct:    parseFloat(avg24h.toFixed(2)),
    top_tokens:       cfg.tokens.slice(0,5),
    signal_text:      `Score:${score}/100 | ${lc} | ${mom} | DexScreener live`,
    calculated_at:    new Date().toISOString(),
  };
}
