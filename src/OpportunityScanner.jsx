/**
 * OpportunityScanner.jsx — Solar Flash Phase 2 — NEW VERSION
 * Opportunity Scanner — Discovery Layer
 * Route: /scanner
 */

import { useState, useEffect, useRef, useMemo, useCallback } from "react";

const T = {
  orange:"#ff8c00",gold:"#ffd700",cyan:"#00e5ff",
  ok:"#50ffa0",purple:"#b060ff",danger:"#ff3535",
  warn:"#ffaa00",black:"#050403",
  font:"'Orbitron',monospace",body:"'Rajdhani',sans-serif",
};

const ALL_OPPS = [
  {id:"sol",rank:1,coin:"SOL",pair:"SOL/USDT",icon:"☀️",sector:"Layer 1",narrative:"DePIN",opScore:94,confidence:"Very High",risk:"Medium",timeframe:"Mid",smStatus:"Accumulating",marketTrend:"Bullish",health:"Excellent",change24h:+8.4,volume:"$2.8B",liquidity:"$920M",reason:"Strong DePIN narrative momentum combined with increasing smart money accumulation and excellent token metrics.",full:"SOL leads ecosystem growth with dominant DePIN and AI narrative exposure. Multiple High Conviction wallets building large positions. Narrative score at multi-month high.",chain:"Solana",mcap:"Large",narrativeScore:88,smScore:91,marketScore:82,tokenScore:94},
  {id:"tao",rank:2,coin:"TAO",pair:"TAO/USDT",icon:"🧠",sector:"AI",narrative:"AI",opScore:92,confidence:"Very High",risk:"Medium",timeframe:"Long",smStatus:"Accumulating",marketTrend:"Bullish",health:"Excellent",change24h:+12.1,volume:"$480M",liquidity:"$210M",reason:"AI narrative dominance with persistent smart money accumulation. Highest conviction score in current scan cycle.",full:"TAO is the central node of the AI infrastructure narrative. Smart money wallets are building concentrated positions. Narrative momentum is at multi-quarter highs.",chain:"ETH",mcap:"Mid",narrativeScore:95,smScore:89,marketScore:88,tokenScore:90},
  {id:"hnt",rank:3,coin:"HNT",pair:"HNT/USDT",icon:"📡",sector:"DePIN",narrative:"DePIN",opScore:88,confidence:"High",risk:"Low",timeframe:"Mid",smStatus:"Accumulating",marketTrend:"Bullish",health:"Good",change24h:+9.2,volume:"$180M",liquidity:"$95M",reason:"DePIN narrative in early growth phase. Smart money rotating from Memecoins into DePIN. Discovery window open.",full:"HNT leads the wireless DePIN narrative with real-world infrastructure. Capital rotation from speculative plays into utility-driven DePIN is measurable and persistent.",chain:"Solana",mcap:"Mid",narrativeScore:81,smScore:82,marketScore:76,tokenScore:88},
  {id:"ondo",rank:4,coin:"ONDO",pair:"ONDO/USDT",icon:"🏛",sector:"RWA",narrative:"RWA",opScore:85,confidence:"High",risk:"Low",timeframe:"Long",smStatus:"Accumulating",marketTrend:"Bullish",health:"Excellent",change24h:+6.8,volume:"$320M",liquidity:"$180M",reason:"RWA tokenization attracting institutional capital. TradFi integration signals accelerating.",full:"ONDO represents the institutional gateway to RWA tokenization. High Conviction cluster wallets entering with long-horizon positioning.",chain:"ETH",mcap:"Mid",narrativeScore:78,smScore:76,marketScore:82,tokenScore:92},
  {id:"rndr",rank:5,coin:"RNDR",pair:"RNDR/USDT",icon:"🖥",sector:"AI",narrative:"AI",opScore:84,confidence:"High",risk:"Low",timeframe:"Mid",smStatus:"Accumulating",marketTrend:"Bullish",health:"Good",change24h:+7.3,volume:"$290M",liquidity:"$140M",reason:"AI compute narrative benefiting from GPU demand surge. Smart money accumulation persistent.",full:"RNDR connects AI compute demand to decentralized GPU networks. Growing revenue signals genuine product-market fit.",chain:"ETH",mcap:"Large",narrativeScore:86,smScore:80,marketScore:78,tokenScore:82},
  {id:"fet",rank:6,coin:"FET",pair:"FET/USDT",icon:"🤖",sector:"AI",narrative:"AI",opScore:82,confidence:"High",risk:"Medium",timeframe:"Mid",smStatus:"Accumulating",marketTrend:"Bullish",health:"Good",change24h:+5.9,volume:"$380M",liquidity:"$190M",reason:"AI agent narrative momentum. Fetch.ai ecosystem expanding. Smart money maintaining positions.",full:"FET is the leading AI agent infrastructure play. Convergence narrative with DePIN adds multi-sector appeal.",chain:"ETH",mcap:"Large",narrativeScore:84,smScore:78,marketScore:76,tokenScore:80},
  {id:"jup",rank:7,coin:"JUP",pair:"JUP/USDT",icon:"⚡",sector:"DeFi",narrative:"Solana",opScore:78,confidence:"High",risk:"Low",timeframe:"Short",smStatus:"Accumulating",marketTrend:"Bullish",health:"Excellent",change24h:+4.8,volume:"$420M",liquidity:"$280M",reason:"Solana DEX dominance. JUP capturing majority of Solana trading volume. Protocol fundamentals at all-time high.",full:"JUP controls the Solana DEX aggregator market with expanding product suite. Revenue growth is exceptional.",chain:"Solana",mcap:"Large",narrativeScore:72,smScore:74,marketScore:84,tokenScore:90},
  {id:"jto",rank:8,coin:"JTO",pair:"JTO/USDT",icon:"🔧",sector:"Infrastructure",narrative:"Infrastructure",opScore:76,confidence:"High",risk:"Low",timeframe:"Mid",smStatus:"Accumulating",marketTrend:"Neutral",health:"Good",change24h:+3.2,volume:"$140M",liquidity:"$88M",reason:"Solana liquid staking infrastructure. Jito MEV revenue creating consistent protocol value.",full:"JTO captures MEV revenue while providing liquid staking. Dual revenue model creates structural demand.",chain:"Solana",mcap:"Mid",narrativeScore:68,smScore:72,marketScore:72,tokenScore:84},
  {id:"sui",rank:9,coin:"SUI",pair:"SUI/USDT",icon:"💎",sector:"Layer 1",narrative:"Layer 1",opScore:74,confidence:"Medium",risk:"Medium",timeframe:"Mid",smStatus:"Neutral",marketTrend:"Bullish",health:"Good",change24h:+6.1,volume:"$680M",liquidity:"$380M",reason:"SUI ecosystem growth accelerating. TVL expansion and developer activity at new highs.",full:"SUI is showing differentiated L1 growth with object-centric model attracting new developer mindshare.",chain:"SUI",mcap:"Large",narrativeScore:66,smScore:62,marketScore:78,tokenScore:82},
  {id:"imx",rank:10,coin:"IMX",pair:"IMX/USDT",icon:"🎮",sector:"Gaming",narrative:"Gaming",opScore:72,confidence:"Medium",risk:"Medium",timeframe:"Short",smStatus:"Accumulating",marketTrend:"Neutral",health:"Good",change24h:+7.8,volume:"$120M",liquidity:"$72M",reason:"Gaming narrative early recovery. IMX ecosystem seeing new game launches. Smart wallets re-entering.",full:"IMX is the leading L2 for gaming with major title partnerships. Smart wallets with prior gaming wins are positioning early.",chain:"IMX",mcap:"Mid",narrativeScore:62,smScore:58,marketScore:68,tokenScore:80},
  {id:"ocean",rank:11,coin:"OCEAN",pair:"OCEAN/USDT",icon:"🌊",sector:"AI",narrative:"AI",opScore:70,confidence:"Medium",risk:"Medium",timeframe:"Mid",smStatus:"Neutral",marketTrend:"Neutral",health:"Good",change24h:+3.5,volume:"$85M",liquidity:"$42M",reason:"AI data marketplace narrative. OCEAN positioned at intersection of AI and data monetization.",full:"OCEAN provides the data infrastructure layer for AI model training. Narrative alignment is strong.",chain:"ETH",mcap:"Small",narrativeScore:78,smScore:52,marketScore:62,tokenScore:74},
  {id:"link",rank:12,coin:"LINK",pair:"LINK/USDT",icon:"🔗",sector:"Infrastructure",narrative:"Infrastructure",opScore:68,confidence:"Medium",risk:"Low",timeframe:"Long",smStatus:"Neutral",marketTrend:"Bullish",health:"Excellent",change24h:+2.8,volume:"$520M",liquidity:"$340M",reason:"Oracle infrastructure essential to RWA and DeFi expansion. LINK positioned as systemic infrastructure.",full:"LINK oracle network is foundational to the RWA and DeFi ecosystem. Steady institutional-grade demand.",chain:"ETH",mcap:"Large",narrativeScore:65,smScore:60,marketScore:72,tokenScore:88},
  {id:"beam",rank:13,coin:"BEAM",pair:"BEAM/USDT",icon:"🎯",sector:"Gaming",narrative:"Gaming",opScore:62,confidence:"Medium",risk:"Medium",timeframe:"Short",smStatus:"Neutral",marketTrend:"Neutral",health:"Good",change24h:+6.4,volume:"$48M",liquidity:"$28M",reason:"Gaming L1 with strong game pipeline. BEAM ecosystem showing signs of early recovery.",full:"BEAM provides dedicated gaming infrastructure with a growing game portfolio.",chain:"BEAM",mcap:"Small",narrativeScore:58,smScore:54,marketScore:62,tokenScore:76},
  {id:"pyth",rank:14,coin:"PYTH",pair:"PYTH/USDT",icon:"🐍",sector:"Infrastructure",narrative:"Infrastructure",opScore:58,confidence:"Medium",risk:"Medium",timeframe:"Mid",smStatus:"Neutral",marketTrend:"Neutral",health:"Good",change24h:+2.1,volume:"$72M",liquidity:"$48M",reason:"Solana oracle infrastructure. PYTH data feeds expanding cross-chain.",full:"PYTH provides high-frequency price data critical to DeFi and RWA infrastructure.",chain:"Solana",mcap:"Mid",narrativeScore:64,smScore:58,marketScore:60,tokenScore:74},
  {id:"uni",rank:15,coin:"UNI",pair:"UNI/USDT",icon:"🦄",sector:"DeFi",narrative:"DeFi",opScore:48,confidence:"Low",risk:"Medium",timeframe:"Short",smStatus:"Neutral",marketTrend:"Neutral",health:"Good",change24h:+0.8,volume:"$210M",liquidity:"$140M",reason:"DeFi mature cycle. UNI governance upgrade could create catalyst. Selective opportunity.",full:"UNI is the leading DEX with upcoming governance upgrade. Mature DeFi cycle limits upside but protocol cash flows are strong.",chain:"ETH",mcap:"Large",narrativeScore:55,smScore:46,marketScore:52,tokenScore:80},
  {id:"arb",rank:16,coin:"ARB",pair:"ARB/USDT",icon:"⬡",sector:"Layer 2",narrative:"Layer 2",opScore:32,confidence:"Low",risk:"High",timeframe:"Short",smStatus:"Distributing",marketTrend:"Bearish",health:"Fair",change24h:-3.2,volume:"$285M",liquidity:"$160M",reason:"L2 saturation. Token unlock pressure. Smart money distribution detected.",full:"ARB faces structural headwinds from token unlocks and smart money distribution. Capital rotating from L2 to alternative L1s.",chain:"ARB",mcap:"Large",narrativeScore:52,smScore:32,marketScore:42,tokenScore:58},
  {id:"wif",rank:17,coin:"WIF",pair:"WIF/USDT",icon:"🐕",sector:"Memecoins",narrative:"Meme",opScore:18,confidence:"Very Low",risk:"Very High",timeframe:"Short",smStatus:"Distributing",marketTrend:"Bearish",health:"Poor",change24h:-8.4,volume:"$420M",liquidity:"$85M",reason:"Memecoin cycle peak passed. Smart money has exited. Volume is retail-driven noise.",full:"WIF and broader memecoin sector are in distribution. Volume is misleading — retail chasing not conviction.",chain:"Solana",mcap:"Large",narrativeScore:42,smScore:18,marketScore:38,tokenScore:32},
  {id:"bonk",rank:18,coin:"BONK",pair:"BONK/USDT",icon:"🐶",sector:"Memecoins",narrative:"Meme",opScore:15,confidence:"Very Low",risk:"Very High",timeframe:"Short",smStatus:"Distributing",marketTrend:"Bearish",health:"Poor",change24h:-10.2,volume:"$285M",liquidity:"$62M",reason:"Memecoin distribution cycle. Not an opportunity — capital rotation out is accelerating.",full:"BONK shows aggressive distribution across all monitored wallet clusters. No intelligence signal supports new positioning.",chain:"Solana",mcap:"Large",narrativeScore:40,smScore:15,marketScore:35,tokenScore:28},
];

const SECTORS=["All","Layer 1","AI","DePIN","RWA","Infrastructure","DeFi","Gaming","Layer 2","Memecoins"];
const RISKS=["All","Low","Medium","High","Very High"];
const MCAPS=["All","Large","Mid","Small"];
const TIMEFRAMES=["All","Short","Mid","Long"];
const CHAINS=["All","Solana","ETH","SUI","BEAM","ARB","IMX"];

function sc(s){return s>=80?T.ok:s>=65?T.cyan:s>=50?T.gold:s>=35?T.warn:T.danger;}
function tc(t){return t==="Bullish"?T.ok:t==="Bearish"?T.danger:T.warn;}
function smc(s){return s==="Accumulating"?T.ok:s==="Distributing"?T.danger:T.warn;}
function MiniBar({v,c}){return(<div style={{height:"3px",borderRadius:"99px",background:"rgba(255,255,255,.07)",overflow:"hidden"}}><div style={{width:`${Math.min(100,v)}%`,height:"100%",background:`linear-gradient(to right,${c}55,${c})`,borderRadius:"99px"}}/></div>);}

function OpCard({opp,view,onClick}){
  const col=sc(opp.opScore);
  if(view==="list") return(
    <div onClick={()=>onClick(opp)} style={{borderRadius:"10px",border:`1px solid ${col}1e`,background:"rgba(0,0,0,.48)",backdropFilter:"blur(10px)",cursor:"pointer",transition:"all .25s",padding:".85rem 1.2rem",display:"flex",alignItems:"center",gap:"1rem"}}
      onMouseEnter={e=>{e.currentTarget.style.borderColor=`${col}44`;e.currentTarget.style.background=`${col}07`;}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor=`${col}1e`;e.currentTarget.style.background="rgba(0,0,0,.48)";}}>
      <span style={{fontFamily:T.font,fontSize:".5rem",fontWeight:900,color:`${col}55`,width:"28px",flexShrink:0}}>#{opp.rank}</span>
      <span style={{fontSize:"1.2rem",flexShrink:0}}>{opp.icon}</span>
      <div style={{width:"90px",flexShrink:0}}>
        <div style={{fontFamily:T.font,fontSize:".58rem",fontWeight:900,color:"#fff",letterSpacing:".1em"}}>{opp.coin}</div>
        <div style={{fontFamily:T.body,fontSize:".75rem",color:"rgba(255,255,255,.38)"}}>{opp.narrative}</div>
      </div>
      <div style={{width:"72px",flexShrink:0,textAlign:"center"}}>
        <div style={{fontFamily:T.font,fontSize:"1.4rem",fontWeight:900,color:col,textShadow:`0 0 20px ${col}66`,lineHeight:1}}>{opp.opScore}</div>
        <div style={{fontFamily:T.font,fontSize:".24rem",color:"rgba(255,255,255,.25)",letterSpacing:".12em"}}>SCORE</div>
      </div>
      <span style={{fontFamily:T.body,fontSize:".85rem",fontWeight:700,color:smc(opp.smStatus),width:"110px",flexShrink:0}}>{opp.smStatus}</span>
      <span style={{fontFamily:T.body,fontSize:".85rem",fontWeight:700,color:tc(opp.marketTrend),width:"80px",flexShrink:0}}>{opp.marketTrend}</span>
      <span style={{fontFamily:T.body,fontSize:".85rem",fontWeight:700,color:opp.risk==="Low"?T.ok:opp.risk==="Medium"?T.gold:T.danger,width:"80px",flexShrink:0}}>{opp.risk}</span>
      <span style={{fontFamily:T.body,fontSize:".85rem",fontWeight:700,color:opp.change24h>=0?T.ok:T.danger,flex:1,textAlign:"right"}}>{(opp.change24h>=0?"+":"")+opp.change24h+"%"}</span>
    </div>
  );
  return(
    <div onClick={()=>onClick(opp)} style={{borderRadius:"14px",border:`1px solid ${col}22`,background:"rgba(0,0,0,.52)",backdropFilter:"blur(12px)",cursor:"pointer",transition:"all .28s",position:"relative",overflow:"hidden",padding:"1.1rem 1.2rem"}}
      onMouseEnter={e=>{e.currentTarget.style.borderColor=`${col}55`;e.currentTarget.style.boxShadow=`0 0 32px ${col}14`;e.currentTarget.style.transform="translateY(-2px)";}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor=`${col}22`;e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="translateY(0)";}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:`linear-gradient(to right,transparent,${col}55,transparent)`}}/>
      <div style={{display:"flex",alignItems:"center",gap:".5rem",marginBottom:".7rem"}}>
        <span style={{fontFamily:T.font,fontSize:".55rem",fontWeight:900,color:`${col}33`}}>#{opp.rank}</span>
        <span style={{fontSize:"1.1rem"}}>{opp.icon}</span>
        <div style={{flex:1}}>
          <div style={{fontFamily:T.font,fontSize:".6rem",fontWeight:900,color:"#fff",letterSpacing:".1em"}}>{opp.coin}</div>
          <div style={{fontFamily:T.body,fontSize:".72rem",color:"rgba(255,255,255,.38)"}}>{opp.chain}</div>
        </div>
        <span style={{fontFamily:T.font,fontSize:".28rem",letterSpacing:".14em",color:"rgba(255,255,255,.28)"}}>{opp.timeframe}</span>
      </div>
      <div style={{textAlign:"center",marginBottom:".8rem",padding:".5rem",borderRadius:"10px",border:`1px solid ${col}18`,background:`${col}06`}}>
        <div style={{fontFamily:T.font,fontSize:"2.2rem",fontWeight:900,color:col,lineHeight:1,textShadow:`0 0 28px ${col}66`}}>{opp.opScore}</div>
        <div style={{fontFamily:T.font,fontSize:".28rem",letterSpacing:".2em",color:"rgba(255,255,255,.28)"}}>OPP SCORE / 100</div>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:".3rem",marginBottom:".7rem",justifyContent:"center"}}>
        <span style={{padding:".14rem .55rem",borderRadius:"50px",border:`1px solid ${col}35`,background:`${col}0a`,fontFamily:T.font,fontSize:".28rem",letterSpacing:".12em",color:col}}>{opp.narrative}</span>
        <span style={{padding:".14rem .55rem",borderRadius:"50px",border:`1px solid ${smc(opp.smStatus)}35`,background:`${smc(opp.smStatus)}0a`,fontFamily:T.font,fontSize:".28rem",letterSpacing:".12em",color:smc(opp.smStatus)}}>{opp.smStatus}</span>
        <span style={{padding:".14rem .55rem",borderRadius:"50px",border:`1px solid ${opp.risk==="Low"?T.ok:opp.risk==="Medium"?T.gold:T.danger}35`,background:`${opp.risk==="Low"?T.ok:opp.risk==="Medium"?T.gold:T.danger}0a`,fontFamily:T.font,fontSize:".28rem",letterSpacing:".12em",color:opp.risk==="Low"?T.ok:opp.risk==="Medium"?T.gold:T.danger}}>{opp.risk}</span>
      </div>
      <p style={{fontFamily:T.body,fontSize:".8rem",color:"rgba(255,255,255,.45)",lineHeight:1.55,marginBottom:".7rem",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{opp.reason}</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:".4rem",borderTop:"1px solid rgba(255,255,255,.06)",paddingTop:".6rem"}}>
        {[{l:"VOL",v:opp.volume},{l:"LIQ",v:opp.liquidity},{l:"24H",v:(opp.change24h>=0?"+":"")+opp.change24h+"%",c:opp.change24h>=0?T.ok:T.danger}].map((s,i)=>(
          <div key={i} style={{textAlign:"center"}}>
            <div style={{fontFamily:T.font,fontSize:".24rem",letterSpacing:".12em",color:"rgba(255,255,255,.25)",marginBottom:".15rem"}}>{s.l}</div>
            <div style={{fontFamily:T.body,fontSize:".78rem",fontWeight:700,color:s.c||"rgba(255,255,255,.65)"}}>{s.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailPanel({opp,onClose,onSendToAlpha}){
  if(!opp) return null;
  const col=sc(opp.opScore);
  return(
    <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex"}}>
      <div onClick={onClose} style={{flex:1,background:"rgba(0,0,0,.6)",backdropFilter:"blur(4px)",cursor:"pointer"}}/>
      <div style={{width:"clamp(min(100vw,340px),42vw,520px)",height:"100vh",background:"#060402",borderLeft:`1px solid ${col}28`,overflowY:"auto",display:"flex",flexDirection:"column",animation:"dp-slide .3s ease"}}>
        <style>{`@keyframes dp-slide{from{transform:translateX(100%);}to{transform:translateX(0);}}`}</style>
        <div style={{padding:"1.4rem 1.6rem",borderBottom:`1px solid ${col}18`,background:`${col}06`,display:"flex",alignItems:"center",gap:".9rem",position:"sticky",top:0,zIndex:10,backdropFilter:"blur(12px)"}}>
          <span style={{fontSize:"1.8rem"}}>{opp.icon}</span>
          <div style={{flex:1}}>
            <div style={{fontFamily:T.font,fontSize:".88rem",fontWeight:900,color:"#fff",letterSpacing:".1em"}}>{opp.coin} <span style={{fontSize:".5rem",color:"rgba(255,255,255,.4)"}}>/ {opp.pair}</span></div>
            <div style={{fontFamily:T.body,fontSize:".82rem",color:"rgba(255,255,255,.4)",marginTop:".1rem"}}>{opp.sector} · {opp.chain} · {opp.mcap} Cap</div>
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:T.font,fontSize:"2rem",fontWeight:900,color:col,lineHeight:1,textShadow:`0 0 24px ${col}77`}}>{opp.opScore}</div>
            <div style={{fontFamily:T.font,fontSize:".28rem",letterSpacing:".16em",color:"rgba(255,255,255,.3)"}}>SCORE</div>
          </div>
          <button onClick={onClose} style={{width:"28px",height:"28px",borderRadius:"50%",border:"1px solid rgba(255,255,255,.15)",background:"rgba(255,255,255,.05)",color:"rgba(255,255,255,.5)",cursor:"pointer",fontFamily:T.font,fontSize:".6rem",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        <div style={{padding:"1.4rem 1.6rem",flex:1,display:"flex",flexDirection:"column",gap:"1.1rem"}}>
          {/* Status badges */}
          <div style={{display:"flex",flexWrap:"wrap",gap:".4rem"}}>
            {[{l:"CONFIDENCE",v:opp.confidence,c:col},{l:"RISK",v:opp.risk,c:opp.risk==="Low"?T.ok:opp.risk==="Medium"?T.gold:T.danger},{l:"TIMEFRAME",v:opp.timeframe,c:T.purple},{l:"SM STATUS",v:opp.smStatus,c:smc(opp.smStatus)},{l:"MARKET",v:opp.marketTrend,c:tc(opp.marketTrend)},{l:"HEALTH",v:opp.health,c:opp.health==="Excellent"?T.ok:T.cyan}].map((b,i)=>(
              <div key={i} style={{padding:".25rem .65rem",borderRadius:"7px",border:`1px solid ${b.c}30`,background:`${b.c}0a`}}>
                <div style={{fontFamily:T.font,fontSize:".26rem",letterSpacing:".14em",color:"rgba(255,255,255,.28)"}}>{b.l}</div>
                <div style={{fontFamily:T.body,fontSize:".88rem",fontWeight:700,color:b.c}}>{b.v}</div>
              </div>
            ))}
          </div>
          {/* Intelligence bars */}
          <div style={{padding:"1rem 1.1rem",borderRadius:"12px",border:"1px solid rgba(255,255,255,.08)",background:"rgba(0,0,0,.4)"}}>
            <div style={{fontFamily:T.font,fontSize:".34rem",letterSpacing:".22em",color:"rgba(255,255,255,.28)",marginBottom:".8rem"}}>INTELLIGENCE BREAKDOWN</div>
            {[{label:"Narrative Score",val:opp.narrativeScore,c:T.gold},{label:"Smart Money",val:opp.smScore,c:T.cyan},{label:"Market Signals",val:opp.marketScore,c:T.purple},{label:"Token Health",val:opp.tokenScore,c:T.ok}].map((r,i)=>(
              <div key={i} style={{marginBottom:".6rem"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:".22rem"}}>
                  <span style={{fontFamily:T.body,fontSize:".85rem",color:"rgba(255,255,255,.55)"}}>{r.label}</span>
                  <span style={{fontFamily:T.font,fontSize:".48rem",fontWeight:700,color:r.c}}>{r.val}</span>
                </div>
                <MiniBar v={r.val} c={r.c}/>
              </div>
            ))}
          </div>
          {/* Quick stats */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:".5rem"}}>
            {[{l:"Volume 24H",v:opp.volume},{l:"Liquidity",v:opp.liquidity},{l:"24H Change",v:(opp.change24h>=0?"+":"")+opp.change24h+"%",c:opp.change24h>=0?T.ok:T.danger},{l:"Market Cap",v:opp.mcap}].map((s,i)=>(
              <div key={i} style={{padding:".6rem .8rem",borderRadius:"8px",border:"1px solid rgba(255,255,255,.07)",background:"rgba(255,255,255,.03)"}}>
                <div style={{fontFamily:T.font,fontSize:".26rem",letterSpacing:".14em",color:"rgba(255,255,255,.28)",marginBottom:".2rem"}}>{s.l}</div>
                <div style={{fontFamily:T.body,fontSize:".9rem",fontWeight:700,color:s.c||"rgba(255,255,255,.7)"}}>{s.v}</div>
              </div>
            ))}
          </div>
          {/* AI Summary */}
          <div style={{padding:"1rem 1.1rem",borderRadius:"10px",border:`1px solid ${T.cyan}22`,background:`${T.cyan}07`}}>
            <div style={{fontFamily:T.font,fontSize:".32rem",letterSpacing:".2em",color:`${T.cyan}88`,marginBottom:".5rem"}}>🤖 AI INTELLIGENCE SUMMARY</div>
            <p style={{fontFamily:T.body,fontSize:".9rem",color:"rgba(255,255,255,.62)",lineHeight:1.75,letterSpacing:".04em"}}>{opp.full}</p>
          </div>
          <p style={{fontFamily:T.body,fontSize:".75rem",color:"rgba(255,255,255,.2)",textAlign:"center",letterSpacing:".06em"}}>Discovery only — not a trading signal — not financial advice</p>
        </div>
        {opp.opScore>=50&&(
          <div style={{padding:"1.2rem 1.6rem",borderTop:`1px solid ${col}18`,background:"#060402",position:"sticky",bottom:0}}>
            <button onClick={()=>onSendToAlpha(opp)} style={{width:"100%",padding:".9rem",borderRadius:"10px",border:`1.5px solid ${col}55`,background:`linear-gradient(135deg,${col}22,${col}0d)`,color:col,fontFamily:T.font,fontSize:".52rem",letterSpacing:".2em",cursor:"pointer",fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:".6rem",transition:"all .3s"}}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow=`0 0 36px ${col}28`;e.currentTarget.style.borderColor=col;}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";e.currentTarget.style.borderColor=`${col}55`;}}>
              ⚡ SEND TO ALPHA ENGINE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OpportunityScanner(){
  const [scanning,setScanning]=useState(true);
  const [lastScan,setLastScan]=useState("");
  const [view,setView]=useState("grid");
  const [selected,setSelected]=useState(null);
  const [filters,setFilters]=useState({sector:"All",risk:"All",mcap:"All",timeframe:"All",chain:"All"});
  const timerRef=useRef(null);

  useEffect(()=>{
    timerRef.current=setTimeout(()=>{setScanning(false);setLastScan(new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}));},2200);
    return()=>clearTimeout(timerRef.current);
  },[]);

  const rescan=()=>{setScanning(true);setLastScan("");timerRef.current=setTimeout(()=>{setScanning(false);setLastScan(new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}));},2200);};

  const filtered=useMemo(()=>ALL_OPPS.filter(o=>{
    if(filters.sector!=="All"&&o.sector!==filters.sector)return false;
    if(filters.risk!=="All"&&o.risk!==filters.risk)return false;
    if(filters.mcap!=="All"&&o.mcap!==filters.mcap)return false;
    if(filters.timeframe!=="All"&&o.timeframe!==filters.timeframe)return false;
    if(filters.chain!=="All"&&o.chain!==filters.chain)return false;
    return true;
  }),[filters]);

  const sendToAlpha=useCallback((opp)=>{
    sessionStorage.setItem("sf_alpha_opp",JSON.stringify(opp));
    window.location.href="/alpha-engine";
  },[]);

  const setFilter=(k,v)=>setFilters(f=>({...f,[k]:v}));

  return(
    <div style={{minHeight:"100vh",background:T.black,color:"#fff",fontFamily:T.font,overflowX:"hidden",position:"relative",isolation:"isolate"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;height:3px;} ::-webkit-scrollbar-track{background:#050403;} ::-webkit-scrollbar-thumb{background:rgba(255,140,0,.4);}
        @keyframes scan-beam{0%{left:-100%;}100%{left:200%;}}
        @keyframes blink{0%,100%{opacity:1;}50%{opacity:.2;}}
        @keyframes fade-in{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes grid-p{0%,100%{opacity:.012;}50%{opacity:.024;}}
        .flt{padding:.3rem .7rem;border-radius:6px;border:1px solid rgba(255,255,255,.1);background:rgba(0,0,0,.35);color:rgba(255,255,255,.4);font-family:'Orbitron',monospace;font-size:.28rem;letter-spacing:.12em;cursor:pointer;transition:all .2s;white-space:nowrap;}
        .flt.on{border-color:rgba(255,140,0,.5);background:rgba(255,140,0,.08);color:rgba(255,215,0,.9);}
        .flt:hover:not(.on){border-color:rgba(255,255,255,.2);color:rgba(255,255,255,.6);}
        @media(max-width:900px){.op-grid{grid-template-columns:1fr 1fr!important;}}
        @media(max-width:580px){.op-grid{grid-template-columns:1fr!important;}.flt-wrap{flex-wrap:wrap!important;}}
        @media(max-width:480px){
          .op-grid{grid-template-columns:1fr!important;}
          .list-view-row{grid-template-columns:auto auto 1fr auto auto!important;}
        }
      `}</style>
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(255,140,0,.012) 1px,transparent 1px),linear-gradient(90deg,rgba(255,140,0,.012) 1px,transparent 1px)",backgroundSize:"65px 65px",animation:"grid-p 12s ease-in-out infinite"}}/>
        <div style={{position:"absolute",top:"8%",right:"-8%",width:"600px",height:"600px",borderRadius:"50%",background:"radial-gradient(circle,rgba(255,140,0,.04),transparent 65%)"}}/>
        <div style={{position:"absolute",bottom:"5%",left:"-8%",width:"500px",height:"500px",borderRadius:"50%",background:"radial-gradient(circle,rgba(0,150,255,.03),transparent 65%)"}}/>
      </div>
      <div style={{position:"relative",zIndex:10,maxWidth:"1500px",margin:"0 auto",padding:"clamp(.8rem,2.5vw,1.8rem) clamp(.8rem,2.5vw,1.5rem)"}}>
        {/* Navbar */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.2rem",flexWrap:"wrap",gap:".8rem"}}>
          <a href="/app" style={{textDecoration:"none",display:"flex",alignItems:"center",gap:".6rem"}}>
            <div style={{width:"24px",height:"24px",borderRadius:"50%",background:"radial-gradient(circle,#ffd700,#ff8c00)",boxShadow:"0 0 12px rgba(255,150,0,.5)"}}/>
            <span style={{fontFamily:T.font,fontSize:".5rem",letterSpacing:".2em",color:"rgba(255,215,0,.9)"}}>$FLASH</span>
          </a>
          <div style={{display:"flex",gap:".4rem",flexWrap:"wrap"}}>
            {[{l:"NARRATIVE",h:"/narrative"},{l:"SMART MONEY",h:"/smart-money"},{l:"ALPHA ENGINE",h:"/alpha-engine"},{l:"ALERTS",h:"/alerts"}].map(b=>(
              <a key={b.l} href={b.h} style={{textDecoration:"none"}}>
                <button style={{padding:".32rem .8rem",borderRadius:"6px",border:"1px solid rgba(255,255,255,.1)",background:"rgba(0,0,0,.35)",color:"rgba(255,255,255,.45)",fontFamily:T.font,fontSize:".3rem",letterSpacing:".14em",cursor:"pointer",transition:"all .2s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,180,0,.4)";e.currentTarget.style.color="rgba(255,215,0,.8)";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,.1)";e.currentTarget.style.color="rgba(255,255,255,.45)";}}>
                  {b.l}
                </button>
              </a>
            ))}
          </div>
        </div>

        {/* Top Bar */}
        <div style={{padding:".9rem 1.4rem",borderRadius:"12px",border:"1px solid rgba(255,140,0,.2)",background:"rgba(0,0,0,.6)",backdropFilter:"blur(12px)",marginBottom:"1rem",position:"relative",overflow:"hidden"}}>
          {scanning&&<div style={{position:"absolute",top:0,bottom:0,width:"40%",background:"linear-gradient(to right,transparent,rgba(255,140,0,.05),transparent)",animation:"scan-beam 1.8s ease-in-out infinite",pointerEvents:"none"}}/>}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:".8rem",position:"relative",zIndex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:"1.2rem",flexWrap:"wrap"}}>
              <div style={{display:"flex",alignItems:"center",gap:".5rem"}}>
                {scanning
                  ?<span style={{width:"12px",height:"12px",borderRadius:"50%",border:"2px solid rgba(255,140,0,.3)",borderTop:"2px solid #ff8c00",display:"inline-block",animation:"spin 1s linear infinite"}}/>
                  :<span style={{width:"7px",height:"7px",borderRadius:"50%",background:T.ok,boxShadow:`0 0 10px ${T.ok}`,animation:"blink 1.4s infinite",display:"inline-block"}}/>
                }
                <span style={{fontFamily:T.font,fontSize:".36rem",letterSpacing:".2em",color:scanning?"rgba(255,140,0,.8)":"rgba(80,255,160,.75)"}}>
                  {scanning?"SCANNING ALL INTELLIGENCE LAYERS…":"SCAN COMPLETE — READY"}
                </span>
              </div>
              {!scanning&&(
                <div style={{display:"flex",gap:"1.2rem",flexWrap:"wrap",alignItems:"center"}}>
                  <div>
                    <span style={{fontFamily:T.font,fontSize:"clamp(.9rem,3vw,1.5rem)",fontWeight:900,color:T.gold}}>{filtered.length}</span>
                    <span style={{fontFamily:T.body,fontSize:".85rem",color:"rgba(255,255,255,.38)",marginLeft:".4rem"}}>opportunities found</span>
                  </div>
                  <span style={{fontFamily:T.body,fontSize:".82rem",color:"rgba(255,255,255,.3)"}}>Last: <span style={{color:"rgba(255,255,255,.6)"}}>{lastScan}</span></span>
                </div>
              )}
            </div>
            {!scanning&&(
              <div style={{display:"flex",gap:".5rem",alignItems:"center"}}>
                <div style={{display:"flex",gap:".2rem"}}>
                  {["grid","list"].map(v=>(
                    <button key={v} onClick={()=>setView(v)} style={{padding:".35rem .65rem",borderRadius:"6px",border:`1px solid ${view===v?"rgba(255,180,0,.5)":"rgba(255,255,255,.1)"}`,background:view===v?"rgba(255,180,0,.1)":"rgba(0,0,0,.3)",color:view===v?"rgba(255,215,0,.9)":"rgba(255,255,255,.4)",fontFamily:T.font,fontSize:".28rem",letterSpacing:".1em",cursor:"pointer",transition:"all .2s"}}>
                      {v==="grid"?"▦":"≡"} {v.toUpperCase()}
                    </button>
                  ))}
                </div>
                <button onClick={rescan} style={{padding:".38rem 1rem",borderRadius:"7px",border:"1px solid rgba(255,140,0,.4)",background:"rgba(255,140,0,.08)",color:"rgba(255,215,0,.9)",fontFamily:T.font,fontSize:".32rem",letterSpacing:".18em",cursor:"pointer",transition:"all .3s"}}
                  onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 0 20px rgba(255,140,0,.18)";}}
                  onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";}}>
                  ↺ RESCAN
                </button>
              </div>
            )}
          </div>
          {scanning&&<div style={{position:"absolute",bottom:0,left:0,right:0,height:"2px",background:"rgba(255,255,255,.05)"}}><div style={{height:"100%",background:"linear-gradient(to right,transparent,rgba(255,180,0,.7),transparent)",animation:"scan-beam 1.8s ease-in-out infinite"}}/></div>}
        </div>

        {/* Filter Panel */}
        <div style={{padding:".75rem 1.2rem",borderRadius:"10px",border:"1px solid rgba(255,255,255,.07)",background:"rgba(0,0,0,.45)",backdropFilter:"blur(8px)",marginBottom:"1rem"}}>
          <div style={{display:"flex",gap:".5rem",flexWrap:"wrap",alignItems:"center"}}>
            {[{label:"SECTOR",key:"sector",opts:SECTORS},{label:"RISK",key:"risk",opts:RISKS},{label:"MCAP",key:"mcap",opts:MCAPS},{label:"TIMEFRAME",key:"timeframe",opts:TIMEFRAMES},{label:"CHAIN",key:"chain",opts:CHAINS}].map(f=>(
              <div key={f.key} style={{display:"flex",alignItems:"center",gap:".3rem",flexWrap:"wrap"}} className="flt-wrap">
                <span style={{fontFamily:T.font,fontSize:".26rem",letterSpacing:".16em",color:"rgba(255,255,255,.28)"}}>{f.label}:</span>
                {f.opts.map(o=>(
                  <button key={o} onClick={()=>setFilter(f.key,o)} className={`flt${filters[f.key]===o?" on":""}`}>{o}</button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* List header */}
        {!scanning&&view==="list"&&(
          <div style={{display:"flex",alignItems:"center",gap:"1rem",padding:".4rem 1.2rem",marginBottom:".4rem"}}>
            {["#","","COIN / NARRATIVE","SCORE","SMART MONEY","MARKET","RISK","24H CHANGE"].map((h,i)=>(
              <span key={i} style={{fontFamily:T.font,fontSize:".26rem",letterSpacing:".14em",color:"rgba(255,255,255,.25)",width:i===0?"28px":i===1?"40px":i===3?"72px":i===4?"110px":i===5?"80px":i===6?"80px":i===2?"1fr":undefined,flex:i===2?1:undefined}}>{h}</span>
            ))}
          </div>
        )}

        {/* Opportunities */}
        {!scanning?(
          filtered.length===0?(
            <div style={{textAlign:"center",padding:"4rem 2rem",border:"1px solid rgba(255,255,255,.06)",borderRadius:"14px",background:"rgba(0,0,0,.3)"}}>
              <div style={{fontSize:"2.5rem",opacity:.25,marginBottom:"1rem"}}>⊙</div>
              <p style={{fontFamily:T.body,fontSize:"1rem",color:"rgba(255,255,255,.35)",letterSpacing:".1em"}}>No opportunities match current filters</p>
            </div>
          ):(
            view==="grid"
              ?<div className="op-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,210px),1fr))",gap:".7rem",animation:"fade-in .4s ease"}}>
                  {filtered.map(o=><OpCard key={o.id} opp={o} view="grid" onClick={setSelected}/>)}
                </div>
              :<div style={{display:"flex",flexDirection:"column",gap:".4rem",animation:"fade-in .4s ease"}}>
                  {filtered.map(o=><OpCard key={o.id} opp={o} view="list" onClick={setSelected}/>)}
                </div>
          )
        ):(
          <div style={{textAlign:"center",padding:"5rem 2rem"}}>
            <div style={{fontSize:"3rem",opacity:.3,marginBottom:"1.2rem"}}>⊙</div>
            <p style={{fontFamily:T.body,fontSize:"1rem",color:"rgba(255,255,255,.3)",letterSpacing:".1em"}}>Scanning Narrative · Smart Money · Market · Token layers…</p>
          </div>
        )}

        <div style={{textAlign:"center",padding:"1.4rem 0 0",marginTop:"1.2rem",borderTop:"1px solid rgba(255,255,255,.05)"}}>
          <p style={{fontFamily:T.body,fontSize:".75rem",color:"rgba(255,255,255,.18)",letterSpacing:".1em"}}>Opportunity Scanner — Discovery only — No trading signals — Not financial advice</p>
        </div>
      </div>
      {selected&&<DetailPanel opp={selected} onClose={()=>setSelected(null)} onSendToAlpha={sendToAlpha}/>}
    </div>
  );
}
