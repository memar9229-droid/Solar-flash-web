    /**
 * api/alerts/stream.js — SSE endpoint
 */
export const config = { maxDuration: 55 };

import { sbSelect } from "../lib/supabase.js";
import { log }      from "../lib/http.js";

export default async function handler(req, res) {
  res.setHeader("Content-Type",  "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection",    "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("X-Accel-Buffering", "no");

  const send = (event, data) =>
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  log("info", "SSE stream connected");

  try {
    const initial = await sbSelect("alerts", "select=*&is_active=eq.true&order=created_at.desc&limit=20");
    send("init", { alerts: initial||[], timestamp: new Date().toISOString() });
  } catch(e) {
    send("init", { alerts:[], timestamp: new Date().toISOString() });
  }

  let lastCheck  = new Date().toISOString();
  const interval = setInterval(async () => {
    try {
      const newAlerts = await sbSelect("alerts",
        `select=*&is_active=eq.true&created_at=gt.${lastCheck}&order=created_at.desc&limit=10`);
      if (newAlerts?.length) {
        lastCheck = newAlerts[0].created_at;
        send("alerts", { alerts: newAlerts, timestamp: new Date().toISOString() });
      } else {
        send("heartbeat", { timestamp: new Date().toISOString() });
      }
    } catch(e) {}
  }, 15000);

  req.on("close", () => { clearInterval(interval); res.end(); });
  setTimeout(() => { clearInterval(interval); send("reconnect",{}); res.end(); }, 54000);
}

    
