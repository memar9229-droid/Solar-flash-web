import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

/* ── EYE_IMG must be imported from SolarFlashFull or inlined ──── */
/* In production, share via a shared constants file.               */
/* For now we use a placeholder — replace with actual base64.      */

const SECTIONS = [
  {
    id:"introduction",
    num:"01",
    title:"INTRODUCTION",
    content:`Solar Flash is a real-time crypto intelligence ecosystem built on Solana. What began as a community token has evolved into a serious infrastructure project — one designed to give retail participants the same intelligence capabilities once reserved for institutional operators.

We are building the tools that let you see the market before it moves. Not after.

The core thesis is simple: in crypto, information asymmetry is the primary source of alpha. Those who can detect threats early, track smart money in real time, and identify narratives before they become trends — consistently outperform. Solar Flash makes this possible.`,
    color:"#ffd700",
  },
  {
    id:"problem",
    num:"02",
    title:"THE PROBLEM",
    content:`The crypto market operates on asymmetric information. Retail participants consistently receive signals after the move has already happened. They buy into narratives that have peaked. They hold tokens that insiders are already exiting.

The tools that exist today are fragmented, expensive, and designed for institutions. Free tools are noisy, delayed, and lack the intelligence layer needed to act with conviction.

The result: retail consistently loses to those with better information, better tools, and better timing. Solar Flash is designed to close this gap permanently.`,
    color:"#ff8c00",
  },
  {
    id:"vision",
    num:"03",
    title:"SOLAR FLASH VISION",
    content:`Solar Flash is building a unified crypto intelligence infrastructure — a platform where every signal, every threat, every smart money movement is surfaced in real time and made actionable for every participant.

Our vision is a world where a retail trader has Bloomberg-level market intelligence in their pocket. Where risk detection is automatic. Where narrative shifts are visible before the crowd sees them. Where wallet behavior tells a story you can trade.

This is not a roadmap. This is a mission.`,
    color:"#00e5ff",
  },
  {
    id:"intelligence",
    num:"04",
    title:"CORE INTELLIGENCE SYSTEMS",
    subsections:[
      { name:"Survival Score", desc:"A real-time 0-100 token safety score analyzing mint authority, freeze authority, LP burn status, holder concentration, and market dynamics. Every token gets scored before you touch it." },
      { name:"Narrative Radar", desc:"AI-powered detection of emerging market narratives. Identifies trend shifts in on-chain data, social signals, and wallet flows before they become mainstream awareness." },
      { name:"Smart Money Vision", desc:"Wallet classification and tracking infrastructure. Identifies historically profitable wallets, tracks their current holdings and movements, and surfaces accumulation signals." },
      { name:"Threat Scanner", desc:"Automated rug detection, honeypot identification, suspicious contract analysis, and liquidity manipulation alerts. Real-time protection against malicious tokens." },
      { name:"Wallet Intelligence", desc:"Deep wallet profiling with PnL analysis, portfolio patterns, smart money correlation scores, and behavioral fingerprinting." },
      { name:"Flash Alerts", desc:"Instant notifications on material market events — liquidity pulls, whale exits, coordinated dumps, stealth launches, and emerging threats." },
    ],
    color:"#b060ff",
  },
  {
    id:"dashboard",
    num:"05",
    title:"SOLAR DASHBOARD",
    content:`The Solar Dashboard is the primary intelligence interface for $FLASH holders. It consolidates all intelligence systems into a single terminal experience.

Key capabilities:

— Connect any Solana wallet (Phantom, Solflare)
— Full portfolio visualization with live pricing
— Automatic Survival Score for every held token
— Smart money correlation analysis
— Risk exposure dashboard
— Real-time threat alerts
— AI-generated portfolio intelligence summaries

The dashboard operates as a freemium product. Basic access is available to all users. Advanced intelligence features are gated to $FLASH holders and subscribers.`,
    color:"#00e5ff",
  },
  {
    id:"infrastructure",
    num:"06",
    title:"SURVIVAL INFRASTRUCTURE",
    content:`The intelligence infrastructure powering Solar Flash is built on a combination of on-chain data indexing, real-time RPC streams, DexScreener market data, and proprietary signal processing.

Phase 1 infrastructure includes:
— Helius RPC for real-time Solana data
— DexScreener integration for market intelligence
— Custom scoring algorithms
— Telegram delivery infrastructure
— Web-based dashboard interface

Phase 2 infrastructure expands to:
— Dedicated indexing nodes
— Custom wallet behavior models
— AI inference layer for narrative detection
— Multi-chain data aggregation`,
    color:"#50ffa0",
  },
  {
    id:"ai",
    num:"07",
    title:"AI ECOSYSTEM",
    content:`Solar Flash integrates AI across the full intelligence stack.

The AI layer is responsible for:

— Token narrative classification (what is this token about, is the narrative mature or early?)
— Risk scoring contextualization (what makes this token specifically risky?)
— Portfolio intelligence summaries (plain English assessment of current holdings)
— Whale behavior pattern detection (is this accumulation or distribution?)
— Alert prioritization (which signals matter most right now?)

The goal is not to replace human judgment — it is to eliminate the information gap that causes poor judgment in the first place. With the right intelligence surface, the right decision becomes obvious.`,
    color:"#b060ff",
  },
  {
    id:"expansion",
    num:"08",
    title:"FUTURE EXPANSION",
    content:`Solar Flash is designed for expansion beyond its initial Solana-native implementation.

Planned future developments:

— Multi-chain intelligence (Ethereum, Base, Arbitrum, BSC)
— Browser extension for inline token intelligence while trading
— API access for developers and quantitative traders
— Institutional intelligence packages
— Intelligence network — aggregating signals from multiple sources into unified intelligence feeds
— Community intelligence layers — verified signal contributors

The token economy will evolve to reward intelligence contributors, accurate signal providers, and long-term ecosystem participants.`,
    color:"#ff8c00",
  },
  {
    id:"community",
    num:"09",
    title:"COMMUNITY & GROWTH",
    content:`$FLASH is the access token for the Solar Flash intelligence ecosystem. Holders gain:

— Priority access to new intelligence features
— Enhanced dashboard capabilities
— Reduced subscription costs
— Governance participation as the protocol matures
— Alpha stream access (Phase 2+)

The community is the foundation. Builders, traders, researchers, and signal providers who contribute to the ecosystem will be rewarded as the protocol grows.

Total supply: 1,392,000,000 $FLASH
(representing the sun's diameter in kilometers — 1.392 million km)

No taxes. No team wallets skimming transactions. Clean.`,
    color:"#ffd700",
  },
];

export default function Litepaper() {
  const [active, setActive] = useState("introduction");

  return (
    <div style={{minHeight:"100vh",background:"#050403",color:"#fff",fontFamily:"'Orbitron',monospace",display:"flex",flexDirection:"column"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-track{background:#050403;} ::-webkit-scrollbar-thumb{background:#ffd700;}
        @keyframes glow-pulse{0%,100%{box-shadow:0 0 20px rgba(255,180,0,.15);}50%{box-shadow:0 0 40px rgba(255,180,0,.35);}}
        @keyframes fade-in{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
        .nav-item{padding:.6rem 1rem;border-radius:6px;border:1px solid transparent;cursor:pointer;transition:all .2s;font-family:'Orbitron',monospace;font-size:.4rem;letter-spacing:.2em;color:rgba(255,255,255,.4);background:none;text-align:left;width:100%;}
        .nav-item:hover{color:rgba(255,255,255,.7);background:rgba(255,255,255,.04);}
        .nav-item.active{color:#ffd700;border-color:rgba(255,180,0,.3);background:rgba(255,180,0,.06);}
        .section-block{animation:fade-in .4s ease both;}
        @media(max-width:768px){.litepaper-layout{flex-direction:column!important;}.litepaper-sidebar{width:100%!important;position:relative!important;top:0!important;border-right:none!important;border-bottom:1px solid rgba(255,180,0,.1)!important;padding:1rem!important;}.nav-grid{display:grid!important;grid-template-columns:1fr 1fr!important;gap:.4rem;}}
      `}</style>

      {/* ── Topbar ── */}
      <div style={{borderBottom:"1px solid rgba(255,180,0,.1)",padding:".8rem 2rem",display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(0,0,0,.6)",backdropFilter:"blur(12px)",position:"sticky",top:0,zIndex:100}}>
        <a href="/" style={{textDecoration:"none",display:"flex",alignItems:"center",gap:".7rem"}}>
          <div style={{width:"28px",height:"28px",borderRadius:"50%",background:"radial-gradient(circle,#ffd700,#ff8c00)",boxShadow:"0 0 16px rgba(255,150,0,.5)"}}/>
          <span style={{fontFamily:"'Orbitron',monospace",fontSize:".58rem",letterSpacing:".22em",color:"rgba(255,215,0,.9)"}}>SOLAR FLASH</span>
        </a>
        <div style={{display:"flex",alignItems:"center",gap:"1.5rem"}}>
          <span style={{fontFamily:"'Orbitron',monospace",fontSize:".44rem",letterSpacing:".3em",color:"rgba(255,255,255,.35)"}}>LITEPAPER v1.0</span>
          <a href="/" style={{textDecoration:"none"}}>
            <button style={{padding:".4rem 1rem",borderRadius:"6px",border:"1px solid rgba(255,180,0,.3)",background:"rgba(255,180,0,.06)",color:"rgba(255,215,0,.8)",fontFamily:"'Orbitron',monospace",fontSize:".4rem",letterSpacing:".2em",cursor:"pointer"}}>
              ← BACK
            </button>
          </a>
        </div>
      </div>

      {/* ── Layout ── */}
      <div className="litepaper-layout" style={{display:"flex",flex:1,maxWidth:"1300px",margin:"0 auto",width:"100%"}}>

        {/* ── Sidebar ── */}
        <div className="litepaper-sidebar" style={{width:"260px",flexShrink:0,borderRight:"1px solid rgba(255,180,0,.1)",padding:"2rem 1.2rem",position:"sticky",top:"57px",height:"calc(100vh - 57px)",overflowY:"auto"}}>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:".36rem",letterSpacing:".3em",color:"rgba(255,180,0,.4)",marginBottom:"1rem",paddingLeft:".5rem"}}>CONTENTS</div>
          <div className="nav-grid">
            {SECTIONS.map(s => (
              <button key={s.id} className={`nav-item${active===s.id?" active":""}`} onClick={() => {
                setActive(s.id);
                document.getElementById(s.id)?.scrollIntoView({behavior:"smooth",block:"start"});
              }}>
                <span style={{color:"rgba(255,255,255,.25)",marginRight:".4rem"}}>{s.num}</span>
                {s.title}
              </button>
            ))}
          </div>

          {/* Token info card */}
          <div style={{marginTop:"2rem",padding:"1rem",borderRadius:"10px",border:"1px solid rgba(255,180,0,.15)",background:"rgba(255,180,0,.04)"}}>
            <div style={{fontSize:".36rem",letterSpacing:".2em",color:"rgba(255,180,0,.5)",marginBottom:".6rem"}}>TOKEN</div>
            <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:".9rem",color:"#ffd700",fontWeight:700,marginBottom:".3rem"}}>$FLASH</div>
            <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:".78rem",color:"rgba(255,255,255,.4)"}}>Solana Network</div>
            <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:".78rem",color:"rgba(255,255,255,.35)",marginTop:".4rem"}}>1,392,000,000 supply</div>
            <a href="https://x.com/solarflash_sol" target="_blank" rel="noopener noreferrer"
              style={{display:"block",marginTop:"1rem",textDecoration:"none",textAlign:"center",padding:".4rem",borderRadius:"6px",border:"1px solid rgba(255,180,0,.2)",background:"rgba(255,180,0,.05)",fontFamily:"'Orbitron',monospace",fontSize:".36rem",letterSpacing:".18em",color:"rgba(255,215,0,.7)"}}>
              FOLLOW $FLASH
            </a>
          </div>
        </div>

        {/* ── Content ── */}
        <div style={{flex:1,padding:"clamp(2rem,5vw,4rem) clamp(1.5rem,4vw,3.5rem)",overflowY:"auto"}}>

          {/* Header */}
          <div style={{marginBottom:"3rem",paddingBottom:"2rem",borderBottom:"1px solid rgba(255,180,0,.1)"}}>
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.8}}>
              <span style={{fontFamily:"'Orbitron',monospace",fontSize:".4rem",letterSpacing:".4em",color:"rgba(0,229,255,.6)",display:"block",marginBottom:"1rem"}}>INTELLIGENCE INFRASTRUCTURE DOCUMENT</span>
              <h1 style={{fontFamily:"'Orbitron',monospace",fontSize:"clamp(1.8rem,5vw,3.2rem)",fontWeight:900,background:"linear-gradient(135deg,#fff,#ffd700,#ff8c00)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",letterSpacing:".1em",marginBottom:"1rem",lineHeight:1.1}}>
                SOLAR FLASH<br/>LITEPAPER
              </h1>
              <p style={{fontFamily:"'Rajdhani',sans-serif",fontSize:"1.05rem",color:"rgba(255,255,255,.45)",letterSpacing:".08em",maxWidth:"600px",lineHeight:1.8}}>
                A real-time crypto intelligence ecosystem built on Solana. This document outlines the vision, architecture, and roadmap for the Solar Flash intelligence infrastructure.
              </p>
              <div style={{display:"flex",gap:"1.5rem",marginTop:"1.5rem",flexWrap:"wrap"}}>
                {[
                  {label:"VERSION",  val:"1.0"},
                  {label:"NETWORK",  val:"Solana"},
                  {label:"STATUS",   val:"Live"},
                  {label:"SUPPLY",   val:"1.392B"},
                ].map((m,i) => (
                  <div key={i} style={{padding:".5rem 1rem",borderRadius:"6px",border:"1px solid rgba(255,180,0,.15)",background:"rgba(255,180,0,.04)"}}>
                    <div style={{fontFamily:"'Orbitron',monospace",fontSize:".34rem",letterSpacing:".2em",color:"rgba(255,180,0,.45)",marginBottom:".2rem"}}>{m.label}</div>
                    <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:".9rem",fontWeight:700,color:"rgba(255,215,0,.8)"}}>{m.val}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sections */}
          {SECTIONS.map((s,idx) => (
            <div key={s.id} id={s.id} className="section-block" style={{marginBottom:"4rem",scrollMarginTop:"80px"}}>
              <div style={{display:"flex",alignItems:"baseline",gap:"1rem",marginBottom:"1.5rem"}}>
                <span style={{fontFamily:"'Orbitron',monospace",fontSize:"2.5rem",fontWeight:900,color:s.color,opacity:.18,lineHeight:1}}>{s.num}</span>
                <div>
                  <h2 style={{fontFamily:"'Orbitron',monospace",fontSize:"clamp(1rem,3vw,1.5rem)",fontWeight:900,letterSpacing:".12em",color:s.color,lineHeight:1.1}}>
                    {s.title}
                  </h2>
                  <div style={{width:"40px",height:"2px",background:`linear-gradient(to right,${s.color},transparent)`,marginTop:".4rem"}}/>
                </div>
              </div>

              {s.content && (
                <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:"clamp(.9rem,2vw,1.05rem)",color:"rgba(255,255,255,.62)",lineHeight:1.9,letterSpacing:".05em",maxWidth:"760px"}}>
                  {s.content.split("\n\n").map((para,pi) => (
                    <p key={pi} style={{marginBottom:"1.2rem"}}>{para}</p>
                  ))}
                </div>
              )}

              {s.subsections && (
                <div style={{display:"flex",flexDirection:"column",gap:"1rem",maxWidth:"760px"}}>
                  {s.subsections.map((sub,si) => (
                    <div key={si} style={{padding:"1.2rem 1.4rem",borderRadius:"10px",border:`1px solid ${s.color}22`,background:"rgba(0,0,0,.4)",backdropFilter:"blur(6px)",position:"relative",overflow:"hidden"}}>
                      <div style={{position:"absolute",left:0,top:0,bottom:0,width:"3px",background:`linear-gradient(to bottom,${s.color},transparent)`}}/>
                      <div style={{fontFamily:"'Orbitron',monospace",fontSize:".55rem",fontWeight:700,color:s.color,letterSpacing:".15em",marginBottom:".6rem"}}>{sub.name}</div>
                      <p style={{fontFamily:"'Rajdhani',sans-serif",fontSize:".95rem",color:"rgba(255,255,255,.52)",lineHeight:1.7,letterSpacing:".04em"}}>{sub.desc}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Divider */}
              {idx < SECTIONS.length-1 && (
                <div style={{marginTop:"3rem",height:"1px",background:`linear-gradient(to right,${s.color}22,transparent)`}}/>
              )}
            </div>
          ))}

          {/* Footer CTA */}
          <div style={{padding:"2.5rem",borderRadius:"16px",border:"1px solid rgba(255,180,0,.2)",background:"linear-gradient(135deg,rgba(255,180,0,.06),rgba(0,0,0,.4))",textAlign:"center",marginTop:"2rem"}}>
            <h3 style={{fontFamily:"'Orbitron',monospace",fontSize:"clamp(1rem,3vw,1.4rem)",fontWeight:900,background:"linear-gradient(135deg,#fff,#ffd700)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",letterSpacing:".1em",marginBottom:"1rem"}}>
              JOIN THE INTELLIGENCE NETWORK
            </h3>
            <p style={{fontFamily:"'Rajdhani',sans-serif",color:"rgba(255,255,255,.45)",fontSize:".95rem",letterSpacing:".08em",marginBottom:"1.5rem"}}>
              The infrastructure is live. The intelligence is real. Join the Solar Flash ecosystem.
            </p>
            <div style={{display:"flex",gap:"1rem",justifyContent:"center",flexWrap:"wrap"}}>
              {[
                {label:"JOIN TELEGRAM", href:"https://t.me/SolarFlash_Sol", color:"#ffd700"},
                {label:"LAUNCH DASHBOARD", href:"/dashboard", color:"#00e5ff"},
                {label:"INTELLIGENCE BOT", href:"https://t.me/SolarFlashbot", color:"#b060ff"},
              ].map((b,i) => (
                <a key={i} href={b.href} target={b.href.startsWith("http")?"_blank":undefined} rel="noopener noreferrer" style={{textDecoration:"none"}}>
                  <button style={{padding:".7rem 1.6rem",borderRadius:"8px",border:`1.5px solid ${b.color}55`,background:`${b.color}11`,color:b.color,fontFamily:"'Orbitron',monospace",fontSize:".48rem",letterSpacing:".2em",cursor:"pointer",transition:"all .3s",fontWeight:700}}
                    onMouseEnter={e=>{e.currentTarget.style.boxShadow=`0 0 24px ${b.color}33`;e.currentTarget.style.borderColor=b.color;}}
                    onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";e.currentTarget.style.borderColor=`${b.color}55`;}}>
                    {b.label}
                  </button>
                </a>
              ))}
            </div>
          </div>

          <div style={{marginTop:"2rem",textAlign:"center",fontFamily:"'Rajdhani',sans-serif",fontSize:".78rem",color:"rgba(255,255,255,.2)",letterSpacing:".1em",paddingBottom:"3rem"}}>
            Solar Flash Intelligence Ecosystem — $FLASH on Solana — This is not financial advice.
          </div>
        </div>
      </div>
    </div>
  );
}
