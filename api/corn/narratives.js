    export const config = { maxDuration: 20 };

export default async function handler(req, res) {
  res.setHeader("Content-Type","application/json");
  res.setHeader("Access-Control-Allow-Origin","*");

  const SECTORS = {
    ai:{name:"AI Infrastructure",icon:"🧠",token:"TAO"},
    depin:{name:"DePIN",icon:"📡",token:"HNT"},
    rwa:{name:"RWA",icon:"🏛",token:"ONDO"},
    layer1:{name:"Layer 1",icon:"⛓",token:"SOL"},
    defi:{name:"DeFi",icon:"⚡",token:"JUP"},
    gaming:{name:"Gaming",icon:"🎮",token:"IMX"},
    infra:{name:"Infrastructure",icon:"🔧",token:"LINK"},
    layer2:{name:"Layer 2",icon:"⬡",token:"ARB"},
    meme:{name:"Memecoins",icon:"🐸",token:"WIF"},
  };

  const sid = req.query?.sector;
  if (!sid||!SECTORS[sid]) return res.status(400).json({error:"sector required",valid:Object.keys(SECTORS)});

  const cfg = SECTORS[sid];
  let change24h=0, pairsFound=0;

  try {
    const controller = new AbortController();
    setTimeout(()=>controller.abort(),8000);
    const r = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${cfg.token}`,{signal:controller.signal});
    if (r.ok) {
      const d = await r.json();
      const p = (d.pairs||[]).find(p=>p.baseToken?.symbol?.toUpperCase()===cfg.token.toUpperCase()&&parseFloat(p.liquidity?.usd||0)>10000);
      if (p) { pairsFound=1; change24h=parseFloat(p.priceChange?.h24||0); }
    }
  } catch(e) {}

  const score = Math.max(5,Math.min(95,Math.round(50+change24h*1.2)));
  const lc    = score>=70?"Expansion":score>=55?"Growth":score>=35?"Maturity":score>=20?"Saturation":"Decline";
  const mom   = score>=63?"Rising":score<=37?"Falling":"Stable";

  let saved=false;
  try {
    const sr = await fetch(`${process.env.SUPABASE_URL}/rest/v1/narratives`,{
      method:"POST",
      headers:{"apikey":process.env.SUPABASE_SERVICE_KEY,"Authorization":`Bearer ${process.env.SUPABASE_SERVICE_KEY}`,"Content-Type":"application/json","Prefer":"resolution=merge-duplicates"},
      body:JSON.stringify({id:sid,name:cfg.name,icon:cfg.icon,category:cfg.name,score,confidence_score:Math.round(score*0.9),
        heat:score>=65?"Hot":score>=45?"Warm":"Cold",momentum:mom,lifecycle_stage:lc,
        emerging_status:lc==="Expansion"&&score>=65?"Dominant":score>=50?"Confirmed":"Emerging",
        top_tokens:[cfg.token],signal_text:`Score:${score}/100 | ${lc} | ${mom} | DexScreener`,
        calculated_at:new Date().toISOString()}),
    });
    saved=sr.ok;
  } catch(e) {}

  return res.status(200).json({success:true,sector:sid,score,momentum:mom,lifecycle:lc,pairs:pairsFound,saved,ts:new Date().toISOString()});
}

    
