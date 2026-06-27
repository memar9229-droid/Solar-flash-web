/**
 * api/services/dexscreener.js
 * Clean DexScreener API service
 */
import { httpGet, log } from "../lib/http.js";

const BASE = "https://api.dexscreener.com/latest/dex";

export async function searchPairs(query) {
  log("info", "DexScreener search", { query });
  const r = await httpGet(`${BASE}/search?q=${encodeURIComponent(query)}`, {}, 10000);
  if (!r.ok) throw new Error(`DexScreener search failed: ${r.status}`);
  const data = await r.json();
  return data.pairs || [];
}

export async function getTokenPairs(mint) {
  log("info", "DexScreener token", { mint: mint.slice(0,8) });
  const r = await httpGet(`${BASE}/tokens/${mint}`, {}, 10000);
  if (!r.ok) throw new Error(`DexScreener token failed: ${r.status}`);
  const data = await r.json();
  return data.pairs || [];
}

export function bestPair(pairs, minLiquidityUsd = 50000) {
  return pairs
    .filter(p => parseFloat(p.liquidity?.usd || 0) >= minLiquidityUsd)
    .sort((a,b) => parseFloat(b.liquidity?.usd||0) - parseFloat(a.liquidity?.usd||0))[0] || null;
}

export function pairToMarketData(pair) {
  if (!pair) return null;
  return {
    price:       parseFloat(pair.priceUsd || 0),
    change24h:   parseFloat(pair.priceChange?.h24 || 0),
    change1h:    parseFloat(pair.priceChange?.h1  || 0),
    volume24h:   parseFloat(pair.volume?.h24      || 0),
    liquidity:   parseFloat(pair.liquidity?.usd   || 0),
    fdv:         parseFloat(pair.fdv              || 0),
    buys24h:     pair.txns?.h24?.buys  || 0,
    sells24h:    pair.txns?.h24?.sells || 0,
    dexUrl:      pair.url || null,
  };
}

// Required by Vercel — lib files need default export
export default function handler(req, res) {
  return res.status(404).json({ error: "Library file — not a public endpoint" });
}
