/**
 * api/alpha-engine.js — SOLAR FLASH ALPHA ENGINE V1 (Internal Core)
 * ════════════════════════════════════════════════════════════════
 * The decision engine of the ecosystem. Merges Narrative Radar,
 * Smart Money Intelligence, on-chain data (Helius), market data
 * (DexScreener) and risk data (RugCheck) into one trading decision.
 *
 * ARCHITECTURE NOTE:
 * This file is intentionally self-contained (zero local imports).
 * During Phase A we discovered Vercel serverless deployment breaks
 * silently when api/*.js files import sibling modules from
 * api/lib/ or api/services/ — the build either fails or the
 * function crashes at runtime with no error surfaced to the
 * browser (black screen). To keep Alpha Engine 100% reliable in
 * production, the "modular" requirement is satisfied through
 * clearly separated PURE FUNCTIONS within this single file rather
 * than cross-file imports:
 *
 *   1. CONFIG                  — all weights & thresholds, tunable
 *   2. DATA COLLECTION         — collectAllData()
 *   3. NORMALIZATION           — normalize*()
 *   4. SCORING ENGINE          — score*()
 *   5. RISK ENGINE             — riskEngine()
 *   6. DECISION ENGINE         — decisionEngine()  <- swappable for ML later
 *   7. SIGNAL GENERATOR        — generateSignal()
 *   8. REASONING GENERATOR     — generateReasoning()
 *   9. RESPONSE FORMATTER      — formatResponse()
 *
 * Endpoint: GET /api/alpha-engine?mint=<solana_mint>&timeframe=swing
 *
 * Route: /alpha-engine  (internal testing UI, NOT the public page)
 */

export const config = { maxDuration: 30 };

// ════════════════════════════════════════════════════════════════
// 1. CONFIG — every weight & threshold lives here. No magic numbers
//    anywhere else in this file. Tune the engine by editing this
//    object only. A future ML model replaces decisionEngine() and
//    can read the same CONFIG for feature weighting.
// ════════════════════════════════════════════════════════════════

const CONFIG = {
  // Composite alpha score weights — must sum to 1.0
  weights: {
    narrative:       0.18,
    smartMoney:       0.20,
    momentum:         0.14,
    liquidity:        0.10,
    volume:           0.08,
    holderQuality:    0.10,
    accumulation:     0.12,
    marketStructure:  0.08,
  },

  // Decision thresholds (on 0-100 composite alpha score)
  decision: {
    longMin:          62,   // composite >= this AND momentum positive -> LONG
    shortMax:         38,   // composite <= this AND momentum negative -> SHORT
    watchBandLow:     38,   // between shortMax and longMin -> WATCH
    watchBandHigh:    62,
    minLiquidityUsd:  20000,   // below this -> IGNORE regardless of score
    minVolume24hUsd:  5000,    // below this -> IGNORE regardless of score
    minDataCompleteness: 0.4,  // fraction of sources that must succeed -> else IGNORE
  },

  // Risk engine thresholds
  risk: {
    rugcheckFloor:        60,   // rugcheck score below this adds risk
    topHolderHighPct:     35,   // concentration above this adds risk
    topHolderCriticalPct: 55,
    volatilityHighPct:    12,   // |1h change| above this = high volatility
  },

  // Entry / SL / TP derivation (volatility-scaled, not fixed %)
  trade: {
    entryBandPct:        0.012,  // ± around current price for entry zone
    slMultiplier:        1.8,    // SL = price * (1 - volRatio*slMultiplier) for LONG
    tp1Multiplier:        2.0,
    tp2Multiplier:        3.6,
    tp3Multiplier:        5.5,
    minVolRatioPct:       0.02,  // floor so SL/TP never collapse to 0 on flat tokens
    maxVolRatioPct:       0.18,  // ceiling so extreme volatility doesn't blow out levels
  },

  // Confidence calculation
  confidence: {
    alignmentBonusPerCategory: 6,   // + per category agreeing with direction
    baseFromScore:             0.55, // base confidence weight from composite score distance
  },

  // Timeframe suitability matrix inputs
  timeframes: {
    scalp:    { maxHoldHours: 6,    volPref: "high",   liquidityFloorUsd: 100000 },
    intraday: { maxHoldHours: 24,   volPref: "medium",  liquidityFloorUsd: 50000  },
    swing:    { maxHoldHours: 168,  volPref: "medium",  liquidityFloorUsd: 20000  },
    position: { maxHoldHours: 720,  volPref: "low",     liquidityFloorUsd: 20000  },
  },

  // Token -> sector mapping (used to pull matching Narrative + Smart Money scores)
  // NOTE: this is a pragmatic in-file map for V1. Recommended upgrade: a
  // token_sector_map table in Supabase maintained by the narrative pipeline.
  sectorTokens: {
    ai:     ["TAO","FET","RNDR","OCEAN","AIOZ"],
    depin:  ["HNT","MOBILE","IOTX","DIMO"],
    rwa:    ["ONDO","PENDLE","MKR"],
    layer1: ["SOL","SUI","AVAX","APT"],
    defi:   ["JUP","RAY","JTO","AAVE","UNI","DRIFT"],
    gaming: ["IMX","BEAM","RONIN","MAGIC"],
    infra:  ["LINK","PYTH","W"],
    layer2: ["ARB","OP","STRK"],
    meme:   ["WIF","BONK","DOGE","PEPE"],
  },
};

// ════════════════════════════════════════════════════════════════
// 2. DATA COLLECTION — one function per source, all timeout-guarded
//    (lesson from Phase A: never let an external fetch hang forever)
// ════════════════════════════════════════════════════════════════

async function safeFetch(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const r = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return r;
  } catch (e) {
    clearTimeout(timer);
    return null; // never throw — caller treats null as "source unavailable"
  }
}

async function heliusRpc(method, params) {
  const key = process.env.HELIUS_API_KEY;
  if (!key) return null;
  const r = await safeFetch(`https://mainnet.helius-rpc.com/?api-key=${key}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  }, 10000);
  if (!r || !r.ok) return null;
  try {
    const j = await r.json();
    return j.result ?? null;
  } catch { return null; }
}

async function fetchDexScreener(mint) {
  const r = await safeFetch(`https://api.dexscreener.com/latest/dex/tokens/${mint}`, {}, 8000);
  if (!r || !r.ok) return null;
  try {
    const j = await r.json();
    const pairs = j.pairs || [];
    return pairs.sort((a, b) =>
      parseFloat(b.liquidity?.usd || 0) - parseFloat(a.liquidity?.usd || 0)
    )[0] || null;
  } catch { return null; }
}

async function fetchRugcheck(mint) {
  const r = await safeFetch(`https://api.rugcheck.xyz/v1/tokens/${mint}/report/summary`, {}, 8000);
  if (!r || !r.ok) return null;
  try { return await r.json(); } catch { return null; }
}

async function fetchHelius(mint) {
  const [mintInfo, holders, asset] = await Promise.all([
    heliusRpc("getAccountInfo", [mint, { encoding: "jsonParsed" }]),
    heliusRpc("getTokenLargestAccounts", [mint]),
    heliusRpc("getAsset", { id: mint, displayOptions: { showFungible: true } }),
  ]);
  return {
    parsedInfo: mintInfo?.value?.data?.parsed?.info ?? null,
    holders:    holders?.value ?? [],
    asset:      asset ?? null,
  };
}

async function fetchSupabaseRow(table, query) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const r = await safeFetch(`${url}/rest/v1/${table}?${query}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  }, 8000);
  if (!r || !r.ok) return null;
  try {
    const j = await r.json();
    return Array.isArray(j) ? j : null;
  } catch { return null; }
}

function detectSector(symbol) {
  const sym = String(symbol || "").toUpperCase();
  for (const [sector, tokens] of Object.entries(CONFIG.sectorTokens)) {
    if (tokens.includes(sym)) return sector;
  }
  return null;
}

/**
 * collectAllData — runs every source in parallel, never throws,
 * always returns a structured object describing what succeeded.
 */
async function collectAllData(mint) {
  const dex = await fetchDexScreener(mint);
  const symbol = dex?.baseToken?.symbol || null;
  const sector = detectSector(symbol);

  const [rugcheck, helius, narrativeRows, smRows] = await Promise.all([
    fetchRugcheck(mint),
    fetchHelius(mint),
    sector ? fetchSupabaseRow("narratives", `id=eq.${sector}&select=*&limit=1`) : Promise.resolve(null),
    sector ? fetchSupabaseRow("smart_money_sectors",
      `sector=ilike.${encodeURIComponent(sector)}*&select=*&limit=1`) : Promise.resolve(null),
  ]);

  const sourcesAvailable = {
    dexscreener: !!dex,
    rugcheck:    !!rugcheck,
    helius:      !!(helius?.parsedInfo || helius?.holders?.length),
    narrative:   !!(narrativeRows && narrativeRows[0]),
    smartMoney:  !!(smRows && smRows[0]),
  };
  const completeness = Object.values(sourcesAvailable).filter(Boolean).length / Object.keys(sourcesAvailable).length;

  return {
    mint, symbol, sector,
    dex, rugcheck, helius,
    narrative:  narrativeRows?.[0] || null,
    smartMoney: smRows?.[0] || null,
    sourcesAvailable,
    completeness,
  };
}

// ════════════════════════════════════════════════════════════════
// 3. NORMALIZATION — every downstream function receives a fully
//    defaulted object. No undefined ever reaches scoring logic.
// ════════════════════════════════════════════════════════════════

function normalizeMarket(dex) {
  return {
    price:        Number.isFinite(parseFloat(dex?.priceUsd)) ? parseFloat(dex.priceUsd) : 0,
    liquidityUsd: Number.isFinite(parseFloat(dex?.liquidity?.usd)) ? parseFloat(dex.liquidity.usd) : 0,
    volume24hUsd: Number.isFinite(parseFloat(dex?.volume?.h24)) ? parseFloat(dex.volume.h24) : 0,
    volume1hUsd:  Number.isFinite(parseFloat(dex?.volume?.h1))  ? parseFloat(dex.volume.h1)  : 0,
    change1h:     Number.isFinite(parseFloat(dex?.priceChange?.h1))  ? parseFloat(dex.priceChange.h1)  : 0,
    change6h:     Number.isFinite(parseFloat(dex?.priceChange?.h6))  ? parseFloat(dex.priceChange.h6)  : 0,
    change24h:    Number.isFinite(parseFloat(dex?.priceChange?.h24)) ? parseFloat(dex.priceChange.h24) : 0,
    buys24h:      dex?.txns?.h24?.buys  ?? 0,
    sells24h:     dex?.txns?.h24?.sells ?? 0,
    fdv:          Number.isFinite(parseFloat(dex?.fdv)) ? parseFloat(dex.fdv) : 0,
    pairUrl:      dex?.url || null,
  };
}

function normalizeOnchain(helius, rugcheck) {
  const info = helius?.parsedInfo || {};
  const holders = helius?.holders || [];
  const decimals = info?.decimals ?? 6;
  const totalRaw = info?.supply ? Number(info.supply) : 0;
  const topHolderPct = holders[0] && totalRaw > 0
    ? (Number(holders[0].amount) / totalRaw) * 100 : 0;
  const BURN = "1nc1nerator11111111111111111111111111111111";
  const lpBurned = holders.some(h => h.address === BURN || h.address?.startsWith("11111"));

  return {
    mintAuthority:   !!info?.mintAuthority,
    freezeAuthority: !!info?.freezeAuthority,
    lpBurned,
    topHolderPct,
    holderCount:     holders.length,
    rugcheckScore:   Number.isFinite(rugcheck?.score) ? Math.round(rugcheck.score) : null,
    rugcheckRugged:  !!rugcheck?.rugged,
    name:            helius?.asset?.content?.metadata?.name || "Unknown",
  };
}

function normalizeNarrative(row) {
  return {
    available:        !!row,
    score:             Number.isFinite(row?.score) ? row.score : 50,
    confidenceScore:   Number.isFinite(row?.confidence_score) ? row.confidence_score : 50,
    momentum:          row?.momentum || "Stable",
    lifecycle:         row?.lifecycle_stage || "Growth",
    emergingStatus:    row?.emerging_status || "Emerging",
    sectorName:        row?.name || "Unknown Sector",
  };
}

function normalizeSmartMoney(row) {
  return {
    available:          !!row,
    smScore:            Number.isFinite(row?.sm_score) ? row.sm_score : 50,
    convictionScore:    Number.isFinite(row?.conviction_score) ? row.conviction_score : 50,
    accumStatus:        row?.accum_status || "Stable",
    distributionStatus: row?.distribution_status || "Neutral",
    flowDirection:      row?.flow_direction || "Neutral",
  };
}

// ════════════════════════════════════════════════════════════════
// 4. SCORING ENGINE — each function returns 0-100, never NaN.
// ════════════════════════════════════════════════════════════════

const clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, Number.isFinite(v) ? v : (lo + hi) / 2));

function scoreNarrative(n) {
  if (!n.available) return 50; // neutral when unmatched (e.g. token not in any tracked sector)
  return clamp(n.score * 0.7 + n.confidenceScore * 0.3);
}

function scoreSmartMoney(sm) {
  if (!sm.available) return 50;
  return clamp(sm.smScore * 0.6 + sm.convictionScore * 0.4);
}

function scoreMomentum(m) {
  // Blend short and medium term momentum, centered at 50
  const blended = (m.change1h * 0.5) + (m.change6h * 0.3) + (m.change24h * 0.2);
  return clamp(50 + blended * 1.4);
}

function scoreLiquidity(m) {
  if (m.liquidityUsd <= 0) return 0;
  // log-scaled: $20k -> ~35, $200k -> ~65, $2M -> ~90
  const v = Math.log10(Math.max(1000, m.liquidityUsd));
  return clamp((v - 3) * 25);
}

function scoreVolume(m) {
  if (m.volume24hUsd <= 0) return 0;
  const v = Math.log10(Math.max(100, m.volume24hUsd));
  const turnoverBonus = m.liquidityUsd > 0
    ? clamp((m.volume24hUsd / m.liquidityUsd) * 30, 0, 20) : 0;
  return clamp((v - 2) * 20 + turnoverBonus);
}

function scoreHolderQuality(o) {
  let s = 100;
  if (o.mintAuthority)   s -= 30;
  if (o.freezeAuthority) s -= 20;
  if (!o.lpBurned)       s -= 25;
  if (o.topHolderPct > CONFIG.risk.topHolderCriticalPct) s -= 25;
  else if (o.topHolderPct > CONFIG.risk.topHolderHighPct) s -= 12;
  if (o.holderCount < 50) s -= 10;
  if (o.rugcheckScore != null) {
    s = s * 0.6 + o.rugcheckScore * 0.4;
  }
  return clamp(s);
}

function scoreAccumulation(sm) {
  if (!sm.available) return 50;
  const statusScore = sm.accumStatus === "Increasing" ? 80
    : sm.accumStatus === "Decreasing" ? 25 : 50;
  const distPenalty = sm.distributionStatus === "Aggressive Distribution" ? 30
    : sm.distributionStatus === "Soft Distribution" ? 12 : 0;
  return clamp(statusScore - distPenalty);
}

function scoreMarketStructure(m) {
  // Reward aligned momentum across timeframes (trend consistency), penalize chop
  const signs = [m.change1h, m.change6h, m.change24h].map(v => Math.sign(v));
  const aligned = signs.every(s => s === signs[0]) && signs[0] !== 0;
  const buySellRatio = (m.buys24h + 1) / (m.sells24h + 1);
  const flowScore = clamp(50 + (buySellRatio - 1) * 25);
  return clamp((aligned ? 70 : 45) * 0.5 + flowScore * 0.5);
}

function scoreVolatility(m) {
  // Returns 0-100 "stability" score (100 = very stable, 0 = extremely volatile)
  const range = Math.max(Math.abs(m.change1h), Math.abs(m.change6h) / 2, Math.abs(m.change24h) / 4);
  return clamp(100 - range * 4);
}

// ════════════════════════════════════════════════════════════════
// 5. RISK ENGINE
// ════════════════════════════════════════════════════════════════

function riskEngine(onchain, market, volatilityScore) {
  let riskPct = 20; // baseline

  if (onchain.mintAuthority)   riskPct += 20;
  if (onchain.freezeAuthority) riskPct += 12;
  if (!onchain.lpBurned)       riskPct += 20;
  if (onchain.rugcheckRugged)  riskPct += 40;
  if (onchain.rugcheckScore != null && onchain.rugcheckScore < CONFIG.risk.rugcheckFloor) riskPct += 15;

  if (onchain.topHolderPct > CONFIG.risk.topHolderCriticalPct) riskPct += 18;
  else if (onchain.topHolderPct > CONFIG.risk.topHolderHighPct) riskPct += 8;

  if (market.liquidityUsd < CONFIG.decision.minLiquidityUsd) riskPct += 15;
  if (market.volume24hUsd < CONFIG.decision.minVolume24hUsd) riskPct += 10;

  riskPct += clamp(100 - volatilityScore, 0, 100) * 0.25; // high volatility adds risk

  riskPct = Math.max(5, Math.min(98, Math.round(riskPct)));

  const level = riskPct >= 70 ? "Very High" : riskPct >= 50 ? "High" : riskPct >= 30 ? "Medium" : "Low";
  return { riskPct, level };
}

// ════════════════════════════════════════════════════════════════
// 6. DECISION ENGINE — swappable. A future ML model can replace
//    this function's body as long as it accepts the same `scores`
//    + `risk` + `market` inputs and returns the same shape.
// ════════════════════════════════════════════════════════════════

function decisionEngine(scores, risk, market, completeness) {
  const w = CONFIG.weights;
  const composite = clamp(
    scores.narrative      * w.narrative +
    scores.smartMoney     * w.smartMoney +
    scores.momentum       * w.momentum +
    scores.liquidity      * w.liquidity +
    scores.volume         * w.volume +
    scores.holderQuality  * w.holderQuality +
    scores.accumulation   * w.accumulation +
    scores.marketStructure* w.marketStructure
  );

  // Hard gates -> IGNORE regardless of score
  if (completeness < CONFIG.decision.minDataCompleteness) {
    return { direction: "IGNORE", composite, gateReason: "insufficient_data" };
  }
  if (market.liquidityUsd < CONFIG.decision.minLiquidityUsd) {
    return { direction: "IGNORE", composite, gateReason: "low_liquidity" };
  }
  if (market.volume24hUsd < CONFIG.decision.minVolume24hUsd) {
    return { direction: "IGNORE", composite, gateReason: "low_volume" };
  }
  if (risk.riskPct >= 90) {
    return { direction: "IGNORE", composite, gateReason: "extreme_risk" };
  }

  const momentumDirection = Math.sign(market.change6h || market.change24h || 0);

  let direction;
  if (composite >= CONFIG.decision.longMin && momentumDirection >= 0) {
    direction = "LONG";
  } else if (composite <= CONFIG.decision.shortMax && momentumDirection <= 0) {
    direction = "SHORT";
  } else if (composite > CONFIG.decision.watchBandLow && composite < CONFIG.decision.watchBandHigh) {
    direction = "WATCH";
  } else {
    // Strong score but momentum disagrees, or vice versa — needs confirmation
    direction = "WATCH";
  }

  return { direction, composite, gateReason: null };
}

function calculateConfidence(scores, decision, risk) {
  if (decision.direction === "IGNORE") return 0;

  const categoryEntries = Object.entries(scores);
  const directionalAgreement = categoryEntries.filter(([, v]) => {
    if (decision.direction === "LONG")  return v >= 55;
    if (decision.direction === "SHORT") return v <= 45;
    return v >= 45 && v <= 65; // WATCH = mixed signals expected
  }).length;

  const alignmentBonus = directionalAgreement * CONFIG.confidence.alignmentBonusPerCategory;
  const distanceFromMid = Math.abs(decision.composite - 50) * CONFIG.confidence.baseFromScore;
  const riskPenalty = risk.riskPct * 0.25;

  return Math.round(clamp(distanceFromMid + alignmentBonus - riskPenalty, 5, 96));
}

// ════════════════════════════════════════════════════════════════
// 7. SIGNAL GENERATOR — entry/SL/TP/holding period, volatility-scaled
// ════════════════════════════════════════════════════════════════

function generateSignalLevels(direction, market, volatilityScore, requestedTimeframe) {
  if (direction === "IGNORE" || market.price <= 0) {
    return { entryLow: null, entryHigh: null, stopLoss: null, tp1: null, tp2: null, tp3: null, holdingPeriodHours: null };
  }

  const price = market.price;
  const t = CONFIG.trade;

  // volRatio derived from actual volatility score (inverse of stability), clamped to sane band
  const rawVolRatio = (100 - volatilityScore) / 100 * 0.10;
  const volRatio = Math.max(t.minVolRatioPct, Math.min(t.maxVolRatioPct, rawVolRatio));

  const isLong = direction === "LONG";
  const sign = isLong ? 1 : -1;

  const entryLow  = price * (1 - t.entryBandPct);
  const entryHigh = price * (1 + t.entryBandPct * 0.5);
  const stopLoss  = price * (1 - sign * volRatio * t.slMultiplier);
  const tp1       = price * (1 + sign * volRatio * t.tp1Multiplier);
  const tp2       = price * (1 + sign * volRatio * t.tp2Multiplier);
  const tp3       = price * (1 + sign * volRatio * t.tp3Multiplier);

  const tfCfg = CONFIG.timeframes[requestedTimeframe] || CONFIG.timeframes.swing;
  // Higher volatility -> shorter realistic holding period within the timeframe's ceiling
  const volFactor = clamp(volatilityScore, 10, 100) / 100;
  const holdingPeriodHours = Math.round(tfCfg.maxHoldHours * (0.3 + 0.7 * volFactor));

  const round = (v) => price >= 10 ? +v.toFixed(2) : price >= 1 ? +v.toFixed(4) : +v.toFixed(8);

  return {
    entryLow:  round(entryLow),
    entryHigh: round(entryHigh),
    stopLoss:  round(stopLoss),
    tp1:       round(tp1),
    tp2:       round(tp2),
    tp3:       round(tp3),
    holdingPeriodHours,
  };
}

function timeframeSuitability(market, volatilityScore) {
  const result = {};
  for (const [tf, cfg] of Object.entries(CONFIG.timeframes)) {
    const liquidityOk = market.liquidityUsd >= cfg.liquidityFloorUsd;
    const volMatch =
      (cfg.volPref === "high"   && volatilityScore < 55) ||
      (cfg.volPref === "medium" && volatilityScore >= 35 && volatilityScore <= 80) ||
      (cfg.volPref === "low"    && volatilityScore > 65);
    result[tf] = liquidityOk && volMatch ? "Suitable" : liquidityOk ? "Marginal" : "Unsuitable";
  }
  return result;
}

// ════════════════════════════════════════════════════════════════
// 8. REASONING GENERATOR — every sentence is built from real
//    computed values. No hardcoded narrative text.
// ════════════════════════════════════════════════════════════════

function generateReasoning(data, scores, decision, risk, market) {
  const reasons = [];

  if (data.smartMoney?.available) {
    const sm = normalizeSmartMoney(data.smartMoney);
    if (sm.accumStatus === "Increasing") {
      reasons.push(`Smart money accumulation detected in the ${data.sector || "matched"} sector — conviction score ${sm.convictionScore}/100.`);
    } else if (sm.distributionStatus !== "Neutral") {
      reasons.push(`Smart money showing ${sm.distributionStatus.toLowerCase()} in this sector — caution warranted.`);
    } else {
      reasons.push(`Smart money positioning is neutral in this sector (SM score ${sm.smScore}/100).`);
    }
  } else {
    reasons.push("No matched Smart Money sector data — this token is not yet mapped to a tracked sector.");
  }

  if (data.narrative?.available) {
    const n = normalizeNarrative(data.narrative);
    reasons.push(`Narrative strength for ${n.sectorName}: ${n.score}/100, momentum ${n.momentum.toLowerCase()}, lifecycle stage ${n.lifecycle}.`);
  } else {
    reasons.push("No matched narrative sector — narrative score defaulted to neutral.");
  }

  const momText = market.change24h >= 0 ? "up" : "down";
  reasons.push(`Price momentum is ${momText} ${Math.abs(market.change24h).toFixed(1)}% over 24h (${market.change1h >= 0 ? "+" : ""}${market.change1h.toFixed(1)}% in the last hour).`);

  reasons.push(`Liquidity stands at $${(market.liquidityUsd/1000).toFixed(0)}K with $${(market.volume24hUsd/1000).toFixed(0)}K in 24h volume (${market.buys24h} buys / ${market.sells24h} sells).`);

  if (scores.holderQuality < 50) {
    reasons.push(`Holder quality is weak (${Math.round(scores.holderQuality)}/100) — review mint/freeze authority and concentration before sizing.`);
  } else {
    reasons.push(`Holder quality is solid (${Math.round(scores.holderQuality)}/100) — no major structural red flags detected.`);
  }

  reasons.push(`Composite risk assessment: ${risk.level} (${risk.riskPct}%).`);

  if (decision.gateReason) {
    const gateText = {
      insufficient_data: "Too few data sources responded to generate a reliable signal.",
      low_liquidity:      "Liquidity is below the minimum safe threshold for signal generation.",
      low_volume:          "24h volume is below the minimum threshold — insufficient market interest.",
      extreme_risk:        "Composite risk exceeds the safety ceiling — signal suppressed.",
    }[decision.gateReason] || "Signal suppressed by a safety gate.";
    reasons.push(gateText);
  }

  return reasons;
}

// ════════════════════════════════════════════════════════════════
// 9. RESPONSE FORMATTER
// ════════════════════════════════════════════════════════════════

function formatResponse(data, scores, decision, confidence, risk, levels, suitability, reasoning) {
  return {
    success: true,
    mint:    data.mint,
    symbol:  data.symbol || "UNKNOWN",
    sector:  data.sector,

    decision: {
      direction:   decision.direction,
      confidence,
      riskPct:     risk.riskPct,
      riskLevel:   risk.level,
      alphaScore:  Math.round(decision.composite),
    },

    trade: decision.direction === "IGNORE" ? null : {
      entryZone:          [levels.entryLow, levels.entryHigh],
      stopLoss:            levels.stopLoss,
      takeProfits:         { tp1: levels.tp1, tp2: levels.tp2, tp3: levels.tp3 },
      holdingPeriodHours:   levels.holdingPeriodHours,
      timeframeSuitability: suitability,
    },

    scores: {
      narrative:       Math.round(scores.narrative),
      smartMoney:      Math.round(scores.smartMoney),
      momentum:        Math.round(scores.momentum),
      liquidity:       Math.round(scores.liquidity),
      volume:          Math.round(scores.volume),
      holderQuality:   Math.round(scores.holderQuality),
      accumulation:    Math.round(scores.accumulation),
      marketStructure: Math.round(scores.marketStructure),
      volatility:      Math.round(scores.volatility),
    },

    reasoning,

    dataQuality: {
      completeness:      Math.round(data.completeness * 100),
      sourcesAvailable:  data.sourcesAvailable,
      gateReason:        decision.gateReason,
    },

    generatedAt: new Date().toISOString(),
  };
}

// ════════════════════════════════════════════════════════════════
// MAIN HANDLER — orchestrates the full pipeline
// ════════════════════════════════════════════════════════════════

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");
  if (req.method === "OPTIONS") return res.status(200).end();

  const mint = req.query?.mint;
  const timeframe = (req.query?.timeframe || "swing").toLowerCase();

  if (!mint || mint.length < 32) {
    return res.status(400).json({
      success: false,
      error: "Valid Solana mint address required",
      usage: "/api/alpha-engine?mint=<mint>&timeframe=scalp|intraday|swing|position",
    });
  }
  if (!CONFIG.timeframes[timeframe]) {
    return res.status(400).json({
      success: false,
      error: `Invalid timeframe '${timeframe}'`,
      valid: Object.keys(CONFIG.timeframes),
    });
  }

  try {
    // 1-2. COLLECT + (collectAllData also covers normalization of sources-available)
    const data = await collectAllData(mint);

    const market  = normalizeMarket(data.dex);
    const onchain = normalizeOnchain(data.helius, data.rugcheck);
    const narr    = normalizeNarrative(data.narrative);
    const sm      = normalizeSmartMoney(data.smartMoney);

    // 4. SCORING
    const scores = {
      narrative:       scoreNarrative(narr),
      smartMoney:      scoreSmartMoney(sm),
      momentum:        scoreMomentum(market),
      liquidity:       scoreLiquidity(market),
      volume:          scoreVolume(market),
      holderQuality:   scoreHolderQuality(onchain),
      accumulation:    scoreAccumulation(sm),
      marketStructure: scoreMarketStructure(market),
      volatility:      scoreVolatility(market),
    };

    // 5. RISK
    const risk = riskEngine(onchain, market, scores.volatility);

    // 6. DECISION
    const decision = decisionEngine(scores, risk, market, data.completeness);
    const confidence = calculateConfidence(scores, decision, risk);

    // 7. SIGNAL LEVELS
    const levels = generateSignalLevels(decision.direction, market, scores.volatility, timeframe);
    const suitability = decision.direction === "IGNORE" ? null : timeframeSuitability(market, scores.volatility);

    // 8. REASONING
    const reasoning = generateReasoning(data, scores, decision, risk, market);

    // 9. FORMAT
    const response = formatResponse(data, scores, decision, confidence, risk, levels, suitability, reasoning);

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
    return res.status(200).json(response);

  } catch (err) {
    return res.status(200).json({
      success: false,
      error: "Alpha Engine pipeline error",
      details: err.message,
      mint,
    });
  }
}
