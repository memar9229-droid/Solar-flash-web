    export const config = { maxDuration: 55 };

export default async function handler(req, res) {
  res.setHeader("Content-Type","text/event-stream");
  res.setHeader("Cache-Control","no-cache,no-transform");
  res.setHeader("Connection","keep-alive");
  res.setHeader("Access-Control-Allow-Origin","*");

  const SB_URL = process.env.SUPABASE_URL;
  const SB_KEY = process.env.SUPABASE_ANON_KEY;
  const send = (e,d) => res.write(`event: ${e}\ndata: ${JSON.stringify(d)}\n\n`);

  try {
    const r = await fetch(`${SB_URL}/rest/v1/alerts?select=*&is_active=eq.true&order=created_at.desc&limit=20`,
      { headers:{"apikey":SB_KEY,"Authorization":`Bearer ${SB_KEY}`} });
    send("init", { alerts: r.ok ? await r.json() : [], timestamp: new Date().toISOString() });
  } catch(e) { send("init",{alerts:[],timestamp:new Date().toISOString()}); }

  let last = new Date().toISOString();
  const iv = setInterval(async()=>{
    try {
      const r = await fetch(`${SB_URL}/rest/v1/alerts?select=*&is_active=eq.true&created_at=gt.${last}&order=created_at.desc&limit=10`,
        { headers:{"apikey":SB_KEY,"Authorization":`Bearer ${SB_KEY}`} });
      const d = r.ok ? await r.json() : [];
      if (d.length) { last=d[0].created_at; send("alerts",{alerts:d,timestamp:new Date().toISOString()}); }
      else send("heartbeat",{timestamp:new Date().toISOString()});
    } catch(e){}
  },15000);

  req.on("close",()=>{ clearInterval(iv); res.end(); });
  setTimeout(()=>{ clearInterval(iv); send("reconnect",{}); res.end(); },54000);
}

    
