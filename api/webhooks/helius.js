    export const config = { maxDuration: 15 };

export default async function handler(req, res) {
  if (req.method!=="POST") return res.status(405).end();
  const secret = process.env.HELIUS_WEBHOOK_SECRET;
  if (secret && req.headers["authorization"]!==`Bearer ${secret}`) return res.status(401).json({error:"Unauthorized"});

  const SB_URL = process.env.SUPABASE_URL;
  const SB_KEY = process.env.SUPABASE_SERVICE_KEY;
  const txs    = Array.isArray(req.body)?req.body:[req.body];
  const alerts = [];

  for (const tx of txs) {
    const usd = (tx.nativeTransfers||[]).reduce((s,t)=>s+(t.amount/1e9*185),0);
    if (usd<10000) continue;
    alerts.push({
      type:tx.type==="SWAP"?"volume":"whale", severity:usd>=500000?"CRITICAL":usd>=250000?"HIGH":usd>=50000?"MEDIUM":"LOW",
      token_symbol:tx.tokenTransfers?.[0]?.symbol||"SOL", chain:"Solana",
      value_usd:Math.round(usd), confidence:Math.min(95,60+Math.floor(usd/10000)),
      ai_summary:`$${(usd/1000).toFixed(0)}K detected on Solana`,
      wallet_address:tx.feePayer||null, tx_signature:tx.signature,
      source:"helius_webhook", dedupe_key:`helius_${tx.signature}`, is_active:true,
    });
  }

  if (alerts.length) {
    await fetch(`${SB_URL}/rest/v1/alerts`,{
      method:"POST", headers:{"apikey":SB_KEY,"Authorization":`Bearer ${SB_KEY}`,"Content-Type":"application/json","Prefer":"resolution=ignore-duplicates"},
      body:JSON.stringify(alerts),
    });
  }
  return res.status(200).json({received:txs.length,alerts_created:alerts.length});
}

    
