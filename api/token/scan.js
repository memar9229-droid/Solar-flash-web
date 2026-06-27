    export const config = { maxDuration: 30 };

async function helius(method, params) {
  const r = await fetch(`https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc:"2.0", id:1, method, params }),
  });
  return (await r.json()).result;
}

function calcScore(d) {
  let s = 100, flags = [], goods = [];
  if (d.mintAuth)  { s-=30; flags.push({sev:"critical",icon:"🚨",text:"Mint authority ACTIVE"}); } else goods.push({icon:"✅",text:"Mint authority revoked"});
  if (d.freezeAuth){ s-=20; flags.push({sev:"high",icon:"⚠️",text:"Freeze authority active"}); } else goods.push({icon:"✅",text:"Freeze authority revoked"});
  if (!d.lpBurned) { s-=30; flags.push({sev:"critical",icon:"🚨",text:"Liquidity NOT secured"}); } else goods.push({icon:"🔥",text:"Liquidity burned"});
  if (d.topHolderPct>50)      { s-=25; flags.push({sev:"critical",icon:"🚨",text:`Top holder ${d.topHolderPct.toFixed(1)}%`}); }
  else if (d.topHolderPct>20) { s-=10; flags.push({sev:"medium",icon:"⚠️",text:`Top holder ${d.topHolderPct.toFixed(1)}%`}); }
  if (d.rugScore&&d.rugScore<70){ s-=15; flags.push({sev:"high",icon:"⚠️",text:`RugCheck ${d.rugScore}/100`}); }
  if (d.holders<50){ s-=10; flags.push({sev:"low",icon:"⚠️",text:`Only ${d.holders} holders`}); }
  s = Math.max(0,Math.min(100,s));
  return { score:s, grade:s>=80?"A":s>=60?"B":s>=40?"C":"D",
    verdict:s>=80?"SAFE SIGNAL":s>=60?"PROCEED WITH CAUTION":s>=40?"HIGH RISK":"DANGER — AVOID", flags, goods };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin","*");
  if (req.method==="OPTIONS") return res.status(200).end();
  const {mint} = req.query;
  if (!mint||mint.length<32) return res.status(400).json({error:"Valid mint required"});

  try {
    const [meta,mintInfo,holders,dex,rug] = await Promise.all([
      helius("getAsset",{id:mint,displayOptions:{showFungible:true}}).catch(()=>null),
      helius("getAccountInfo",[mint,{encoding:"jsonParsed"}]).then(r=>r?.value?.data?.parsed?.info).catch(()=>null),
      helius("getTokenLargestAccounts",[mint]).then(r=>r?.value??[]).catch(()=>[]),
      fetch(`https://api.dexscreener.com/latest/dex/tokens/${mint}`).then(r=>r.json()).then(j=>j.pairs?.[0]??null).catch(()=>null),
      fetch(`https://api.rugcheck.xyz/v1/tokens/${mint}/report/summary`).then(r=>r.json()).catch(()=>null),
    ]);

    const dec=mintInfo?.decimals??6, raw=mintInfo?.supply?Number(mintInfo.supply):0;
    const topHolderPct=holders[0]&&raw>0?(Number(holders[0].amount)/raw)*100:0;
    const lpBurned=holders.some(h=>h.address==="1nc1nerator11111111111111111111111111111111");
    const scored=calcScore({mintAuth:mintInfo?.mintAuthority,freezeAuth:mintInfo?.freezeAuthority,
      lpBurned,topHolderPct,rugScore:rug?.score!=null?Math.round(rug.score):null,holders:holders.length});

    res.setHeader("Cache-Control","s-maxage=300");
    return res.status(200).json({
      mint, name:meta?.content?.metadata?.name??"Unknown", symbol:meta?.token_info?.symbol??"???",
      survival_score:scored.score, grade:scored.grade, verdict:scored.verdict,
      flags:scored.flags, goods:scored.goods,
      price_usd:dex?Number(dex.priceUsd):null, liquidity_usd:dex?.liquidity?.usd?Number(dex.liquidity.usd):null,
      volume_24h_usd:dex?.volume?.h24?Number(dex.volume.h24):null,
      change_24h_pct:dex?.priceChange?.h24!=null?Number(dex.priceChange.h24):null,
      mint_authority:!!mintInfo?.mintAuthority, freeze_authority:!!mintInfo?.freezeAuthority,
      lp_burned:lpBurned, top_holder_pct:topHolderPct, holder_count:holders.length,
      rugcheck_score:rug?.score!=null?Math.round(rug.score):null,
      scanned_at:new Date().toISOString(),
    });
  } catch(e) {
    return res.status(500).json({error:e.message});
  }
}

    
