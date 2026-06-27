export const config = { maxDuration: 15 };

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");

  const results = {};

  // Test 1: instant response check
  results.functionStarted = true;
  results.ts = new Date().toISOString();

  // Test 2: fetch httpbin (reliable external endpoint)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const r = await fetch("https://httpbin.org/get", { signal: controller.signal });
    clearTimeout(timer);
    results.httpbin = { ok: r.ok, status: r.status };
  } catch(e) {
    results.httpbin = { ok: false, error: e.message };
  }

  // Test 3: fetch DexScreener
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const r = await fetch("https://api.dexscreener.com/latest/dex/search?q=SOL", { signal: controller.signal });
    clearTimeout(timer);
    const data = await r.json();
    results.dexscreener = { ok: r.ok, status: r.status, pairsCount: data.pairs?.length || 0 };
  } catch(e) {
    results.dexscreener = { ok: false, error: e.message };
  }

  return res.status(200).json(results);
}
