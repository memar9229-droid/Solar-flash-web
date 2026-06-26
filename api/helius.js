/**
 * api/helius.js — Helius RPC proxy
 */
export const config = { maxDuration: 30 };

import { log }                         from "./lib/http.js";
import { ok, err, handleOptions }      from "./lib/respond.js";

const ALLOWED = new Set([
  "getBalance","getTokenAccountsByOwner","getTokenLargestAccounts",
  "getAccountInfo","getSignaturesForAddress","getAsset","getAssets",
  "getAssetsByOwner","getAssetBatch","searchAssets","getTokenAccounts",
]);

const CACHE = {
  getBalance:              "s-maxage=30",
  getTokenAccountsByOwner: "s-maxage=60",
  getAccountInfo:          "s-maxage=300",
  getAsset:                "s-maxage=600",
};

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  if (req.method !== "POST") return err(res, "POST required", 405);

  const { method, params } = req.body || {};
  if (!method)               return err(res, "method required", 400);
  if (!ALLOWED.has(method))  return err(res, `Method '${method}' not permitted`, 403);

  const API_KEY = process.env.HELIUS_API_KEY;
  if (!API_KEY) return err(res, "HELIUS_API_KEY not configured", 500);

  log("info", "Helius proxy", { method });

  try {
    const timeout = new Promise((_,reject) =>
      setTimeout(() => reject(new Error("Helius timeout")), 20000)
    );
    const request = fetch(`https://mainnet.helius-rpc.com/?api-key=${API_KEY}`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ jsonrpc:"2.0", id:1, method, params }),
    });
    const r = await Promise.race([request, timeout]);
    if (!r.ok) return err(res, `Helius returned ${r.status}`, r.status);
    const data = await r.json();
    if (CACHE[method]) res.setHeader("Cache-Control", CACHE[method]);
    return res.status(200).json(data);
  } catch(e) {
    log("error", "Helius proxy failed", { method, error: e.message });
    return err(res, "Helius proxy error", 500, e.message);
  }
}
