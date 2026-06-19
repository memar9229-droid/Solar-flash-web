    /**
 * api/alerts/stream.js — Server-Sent Events for Smart Alerts
 * Polls Supabase for new alerts and streams to frontend
 * Frontend connects once and receives real-time updates
 */
import { createClient } from "@supabase/supabase-js";
export const config = { maxDuration: 55 }; // Vercel max = 60s on Pro, use 55 for safety

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req,res) {
  // SSE headers
  res.setHeader("Content-Type","text/event-stream");
  res.setHeader("Cache-Control","no-cache, no-transform");
  res.setHeader("Connection","keep-alive");
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("X-Accel-Buffering","no");

  const send = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  // Send initial batch of 20 most recent alerts
  try {
    const {data:initial} = await sb.from("alerts")
      .select("*").eq("is_active",true)
      .order("created_at",{ascending:false}).limit(20);
    send("init", {alerts: initial||[], timestamp: new Date().toISOString()});
  } catch(e) {
    send("error", {message:"Failed to load initial alerts"});
  }

  // Poll for new alerts every 15 seconds
  let lastCheck = new Date().toISOString();
  const interval = setInterval(async () => {
    try {
      const {data:newAlerts} = await sb.from("alerts")
        .select("*").eq("is_active",true)
        .gt("created_at", lastCheck)
        .order("created_at",{ascending:false}).limit(10);

      if (newAlerts && newAlerts.length > 0) {
        lastCheck = newAlerts[0].created_at;
        send("alerts", {alerts: newAlerts, timestamp: new Date().toISOString()});
      } else {
        send("heartbeat", {timestamp: new Date().toISOString()});
      }
    } catch(e) {
      console.warn("SSE poll error:", e.message);
    }
  }, 15000);

  // Clean up on client disconnect
  req.on("close", () => {
    clearInterval(interval);
    res.end();
  });

  // Vercel will close after maxDuration — client should reconnect
  setTimeout(() => {
    clearInterval(interval);
    send("reconnect", {message:"Please reconnect"});
    res.end();
  }, 54000);
}

    
