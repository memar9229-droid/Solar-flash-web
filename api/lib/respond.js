/**
 * api/lib/respond.js — Standard response formatter
 * Every endpoint uses this — never leaves response hanging
 */

export function ok(res, data, cache = 0) {
  if (cache > 0) {
    res.setHeader("Cache-Control", `s-maxage=${cache},stale-while-revalidate=${cache*2}`);
  }
  res.setHeader("Content-Type", "application/json");
  return res.status(200).json({ success: true, ...data, ts: new Date().toISOString() });
}

export function err(res, message, status = 500, details = null) {
  res.setHeader("Content-Type", "application/json");
  return res.status(status).json({
    success: false,
    error:   message,
    ...(details ? { details: String(details) } : {}),
    ts:      new Date().toISOString(),
  });
}

export function corsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export function handleOptions(req, res) {
  if (req.method === "OPTIONS") {
    corsHeaders(res);
    res.status(200).end();
    return true;
  }
  corsHeaders(res);
  return false;
}
