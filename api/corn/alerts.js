    export const config = { maxDuration: 20 };

export default async function handler(req, res) {
  res.setHeader("Content-Type","application/json");
  res.setHeader("Access-Control-Allow-Origin","*");

  let alerts=[], created=0;
  try {
    const r = await fetch("https://api.dexscreener.com/latest/dex/search?q=solana");
    if (r.ok) {
      const data = await r.json();
      for (const p of (data.pairs||[]).slice(0,20)) {
        const vol=parseFloat(p.volume?.h24||0), liq=parseFloat(p.liquidity?.usd||0);
        if (liq<50000||vol<100000) continue;
        const sym=p.baseToken?.symbol||"?", mint=p.baseToken?.address||"";
        const hr=new Date().toISOString().slice(0,13);
        alerts.push({type:"volume",severity:vol>1000000?"HIGH":"MEDIUM",token_mint:mint,token_symbol:sym,
          chain:"Solana",value_usd:Math.round(vol),confidence:70,
          ai_summary:`Volume spike $${(vol/1000).toFixed(0)}K on $${sym}`,
          source:"dexscreener_cron",dedupe_key:`vol_${mint}_${hr}`.replace(/[^a-zA-Z0-9_]/g,"").slice(0,200),is_active:true});
      }
      if (alerts.length) {
        const sr = await fetch(`${process.env.SUPABASE_URL}/rest/v1/alerts`,{
          method:"POST",headers:{"apikey":process.env.SUPABASE_SERVICE_KEY,"Authorization":`Bearer ${process.env.SUPABASE_SERVICE_KEY}`,"Content-Type":"application/json","Prefer":"resolution=ignore-duplicates"},
          body:JSON.stringify(alerts),
        });
        created=sr.ok?alerts.length:0;
      }
    }
  } catch(e) { return res.status(200).json({success:false,error:e.message}); }

  return res.status(200).json({success:true,alerts_created:created,ts:new Date().toISOString()});
}

    
