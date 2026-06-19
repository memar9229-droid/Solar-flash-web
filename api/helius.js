/**
 * api/helius.js — Helius RPC Secure Proxy
 * Vercel Serverless Function
 * API key stays server-side — never exposed to browser
 */
export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const API_KEY = process.env.HELIUS_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: "HELIUS_API_KEY not set" });

  const { method, params } = req.body || {};
  if (!method) return res.status(400).json({ error: "method required" });

  const ALLOWED = [
    "getBalance","getTokenAccountsByOwner","getTokenLargestAccounts",
    "getAccountInfo","getSignaturesForAddress","getAsset","getAssets",
    "getAssetsByOwner","getAssetBatch","searchAssets","getTokenAccounts",
  ];
  if (!ALLOWED.includes(method)) {
    return res.status(403).json({ error: `Method '${method}' not permitted via proxy` });
  }

  const CACHE_TIMES = {
    getBalance: "s-maxage=30,stale-while-revalidate=60",
    getTokenAccountsByOwner: "s-maxage=60,stale-while-revalidate=120",
    getTokenLargestAccounts: "s-maxage=300,stale-while-revalidate=600",
    getAccountInfo: "s-maxage=300,stale-while-revalidate=600",
    getAsset: "s-maxage=600,stale-while-revalidate=1200",
  };

  try {
    const r = await fetch(`https://mainnet.helius-rpc.com/?api-key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    });
    if (!r.ok) return res.status(r.status).json({ error: `Helius ${r.status}` });
    const data = await r.json();
    res.setHeader("Cache-Control", CACHE_TIMES[method] || "s-maxage=60");
    return res.status(200).json(data);
  } catch (e) {
    console.error("Helius proxy:", e);
    return res.status(500).json({ error: "Proxy error", details: e.message });
  }
}
