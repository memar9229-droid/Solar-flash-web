    export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST required" });

  const API_KEY = process.env.HELIUS_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: "HELIUS_API_KEY not set" });

  const { method, params } = req.body || {};
  if (!method) return res.status(400).json({ error: "method required" });

  const ALLOWED = ["getBalance","getTokenAccountsByOwner","getTokenLargestAccounts",
    "getAccountInfo","getSignaturesForAddress","getAsset","getAssets",
    "getAssetsByOwner","getAssetBatch","searchAssets","getTokenAccounts"];
  if (!ALLOWED.includes(method)) return res.status(403).json({ error: "Method not permitted" });

  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 20000);
    const r = await fetch(`https://mainnet.helius-rpc.com/?api-key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
      signal: controller.signal,
    });
    if (!r.ok) return res.status(r.status).json({ error: `Helius ${r.status}` });
    return res.status(200).json(await r.json());
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}

    
