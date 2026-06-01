import { useState } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────
const C = {
  orange: "#ff8c00", gold: "#ffd700", cyan: "#00e5ff",
  blue: "#0080ff",   ok: "#50ffa0",   purple: "#b060ff",
  danger: "#ff3535", black: "#050403",
  font: "'Orbitron', monospace", body: "'Rajdhani', sans-serif",
};

// ─── ECOSYSTEM DATA ───────────────────────────────────────────
const LAYERS = [
  {
    id: "active",
    label: "ACTIVE SYSTEMS",
    sublabel: "Layer 1 — Live Infrastructure",
    color: C.ok,
    modules: [
      { id:"dashboard",  name:"Solar Dashboard",  icon:"⊙", desc:"Portfolio intelligence terminal. Connect wallet, analyze holdings, track risk.", status:"LIVE", href:"/dashboard", color:C.cyan    },
      { id:"alerts",     name:"Smart Alerts",     icon:"⚡", desc:"Real-time intelligence feed. Whale, risk, liquidity and narrative signals.", status:"LIVE", href:"/alerts",    color:C.orange  },
      { id:"score",      name:"Survival Score",   icon:"🛡", desc:"Token safety scoring engine. Risk detection for any Solana asset.", status:"LIVE", href:"/report",    color:C.ok      },
      { id:"report",     name:"Report Card",      icon:"📋", desc:"Full token intelligence report. Deep analysis in seconds.", status:"LIVE", href:"/report",    color:C.gold    },
    ],
  },
  {
    id: "intelligence",
    label: "INTELLIGENCE SYSTEMS",
    sublabel: "Layer 2 — Growing Network",
    color: C.cyan,
    modules: [
      { id:"wallet",   name:"Wallet Intelligence", icon:"🔬", desc:"Deep wallet profiling. PnL patterns, smart money correlation, behavioral analysis.", status:"BUILDING", href:null, color:C.cyan   },
      { id:"smart",    name:"Smart Money",         icon:"🧠", desc:"Track historically profitable wallets. Follow the flow before the market moves.", status:"BUILDING", href:null, color:C.purple },
      { id:"narrative",name:"Narrative Radar",     icon:"📡", desc:"AI-powered narrative detection. Spot trends before they become mainstream.", status:"NEXT",     href:null, color:C.orange },
      { id:"threat",   name:"Threat Scanner",      icon:"☠️", desc:"Automated rug detection, honeypot analysis, and contract risk classification.", status:"NEXT",     href:null, color:C.danger },
    ],
  },
  {
    id: "future",
    label: "FUTURE SYSTEMS",
    sublabel: "Layer 3 — Expansion Horizon",
    color: C.purple,
    modules: [
      { id:"ai",       name:"Solar AI",    icon:"✦", desc:"AI-powered intelligence assistant. Bloomberg-level market analysis in plain language.", status:"FUTURE", href:null, color:C.purple },
      { id:"swallet",  name:"Smart Wallet",icon:"⬡", desc:"Next-generation Solana wallet with embedded intelligence layer.", status:"FUTURE", href:null, color:C.gold   },
      { id:"mobile",   name:"Mobile App",  icon:"📱", desc:"Full Solar Flash intelligence ecosystem in your pocket.", status:"FUTURE", href:null, color:C.cyan   },
      { id:"exchange", name:"Exchange",    icon:"⇄", desc:"Intelligence-powered DEX with survival scoring on every token.", status:"FUTURE", href:null, color:C.orange },
    ],
  },
];

const STATUS_META = {
  LIVE:     { color: C.ok,     label: "LIVE",     dot: true  },
  BUILDING: { color: C.gold,   label: "BUILDING", dot: true  },
  NEXT:     { color: C.cyan,   label: "NEXT",     dot: false },
  FUTURE:   { color: C.purple, label: "FUTURE",   dot: false },
};

// ─── MODULE CARD ──────────────────────────────────────────────
function ModuleCard({ module, layerColor }) {
  const [hovered, setHovered] = useState(false);
  const sm = STATUS_META[module.status];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        borderRadius: "14px",
        border: `1px solid ${hovered ? module.color + "50" : module.color + "1e"}`,
        background: hovered ? `${module.color}0b` : "rgba(0,0,0,.5)",
        backdropFilter: "blur(12px)",
        padding: "1.3rem 1.4rem",
        transition: "all .28s",
        boxShadow: hovered ? `0 0 32px ${module.color}18` : "none",
        cursor: module.href ? "pointer" : "default",
        overflow: "hidden",
      }}
      onClick={() => module.href && (window.location.href = module.href)}
    >
      {/* Top accent */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:`linear-gradient(to right,transparent,${module.color}${hovered?"80":"28"},transparent)`, transition:"opacity .3s" }}/>

      {/* Status badge */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:".9rem" }}>
        <div style={{ display:"flex", alignItems:"center", gap:".4rem", padding:".18rem .6rem", borderRadius:"50px", border:`1px solid ${sm.color}30`, background:`${sm.color}0e` }}>
          {sm.dot && <span style={{ width:"5px", height:"5px", borderRadius:"50%", background:sm.color, boxShadow:`0 0 6px ${sm.color}`, display:"inline-block", animation:"eco-blink 1.4s infinite" }}/>}
          <span style={{ fontFamily:C.font, fontSize:".3rem", letterSpacing:".2em", color:sm.color }}>{sm.label}</span>
        </div>
        <span style={{ fontSize:"1.4rem", filter:`drop-shadow(0 0 8px ${module.color}44)` }}>{module.icon}</span>
      </div>

      {/* Name */}
      <div style={{ fontFamily:C.font, fontSize:".58rem", fontWeight:700, color: hovered ? "#fff" : "rgba(255,255,255,.85)", letterSpacing:".1em", marginBottom:".5rem", transition:"color .2s" }}>
        {module.name}
      </div>

      {/* Desc */}
      <p style={{ fontFamily:C.body, fontSize:".87rem", color:"rgba(255,255,255,.4)", lineHeight:1.65, letterSpacing:".04em" }}>
        {module.desc}
      </p>

      {/* Arrow for live products */}
      {module.href && (
        <div style={{ marginTop:".9rem", display:"flex", alignItems:"center", gap:".4rem", color: module.color, opacity: hovered ? 1 : 0.5, transition:"opacity .2s" }}>
          <span style={{ fontFamily:C.font, fontSize:".34rem", letterSpacing:".18em" }}>LAUNCH</span>
          <span style={{ fontSize:".8rem" }}>→</span>
        </div>
      )}
    </div>
  );
}

// ─── LAYER SECTION ────────────────────────────────────────────
function EcosystemLayer({ layer, idx }) {
  return (
    <div style={{ marginBottom: "clamp(3rem,7vw,5rem)", animation: `eco-fade-up .6s ease ${idx * .12}s both` }}>
      {/* Layer header */}
      <div style={{ display:"flex", alignItems:"center", gap:"1.2rem", marginBottom:"1.6rem", flexWrap:"wrap" }}>
        <div style={{ display:"flex", alignItems:"center", gap:".7rem" }}>
          <div style={{ width:"3px", height:"32px", background:`linear-gradient(to bottom,${layer.color},transparent)`, borderRadius:"99px" }}/>
          <div>
            <div style={{ fontFamily:C.font, fontSize:"clamp(.6rem,2vw,.82rem)", fontWeight:900, color:layer.color, letterSpacing:".14em" }}>{layer.label}</div>
            <div style={{ fontFamily:C.body, fontSize:".82rem", color:"rgba(255,255,255,.3)", letterSpacing:".08em", marginTop:".1rem" }}>{layer.sublabel}</div>
          </div>
        </div>
        <div style={{ flex:1, height:"1px", background:`linear-gradient(to right,${layer.color}28,transparent)` }}/>
      </div>

      {/* Module grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,240px),1fr))", gap:"1rem" }}>
        {layer.modules.map(m => <ModuleCard key={m.id} module={m} layerColor={layer.color}/>)}
      </div>
    </div>
  );
}

// ─── CORE VISUAL ─────────────────────────────────────────────
function EcosystemCore() {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"clamp(2rem,6vw,4rem) 1rem", position:"relative" }}>
      {/* Glow rings */}
      <div style={{ position:"relative", width:"160px", height:"160px", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"1.5rem" }}>
        <div style={{ position:"absolute", inset:"-40px", borderRadius:"50%", border:"1px dashed rgba(255,180,0,.1)", animation:"eco-spin 30s linear infinite" }}/>
        <div style={{ position:"absolute", inset:"-20px", borderRadius:"50%", border:"1px dashed rgba(255,180,0,.15)", animation:"eco-spin-r 20s linear infinite" }}/>
        <div style={{ position:"absolute", inset:0, borderRadius:"50%", boxShadow:"0 0 60px rgba(255,140,0,.25), 0 0 120px rgba(255,80,0,.1)", animation:"eco-pulse 4s ease-in-out infinite" }}/>
        {/* Core circle */}
        <div style={{ width:"120px", height:"120px", borderRadius:"50%", background:"radial-gradient(circle at 38% 35%,#fffde7,#ffd700 25%,#ff8c00 55%,#cc2200 80%,#1a0500)", boxShadow:"0 0 40px rgba(255,150,0,.6), 0 0 80px rgba(255,80,0,.3)", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:".2rem" }}>
          <span style={{ fontFamily:C.font, fontSize:".38rem", letterSpacing:".2em", color:"rgba(255,255,255,.8)" }}>$FLASH</span>
          <span style={{ fontFamily:C.font, fontSize:".3rem", letterSpacing:".2em", color:"rgba(255,255,255,.4)" }}>CORE</span>
        </div>
      </div>

      <div style={{ fontFamily:C.font, fontSize:".42rem", letterSpacing:".4em", color:"rgba(255,180,0,.45)", marginBottom:".5rem" }}>SOLAR INTELLIGENCE NETWORK</div>
      <h2 style={{ fontFamily:C.font, fontSize:"clamp(1.2rem,3.5vw,2rem)", fontWeight:900, background:"linear-gradient(135deg,#fff,#ffd700,#ff8c00)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", letterSpacing:".1em", textAlign:"center", marginBottom:".8rem" }}>
        THE ECOSYSTEM
      </h2>
      <p style={{ fontFamily:C.body, fontSize:"clamp(.88rem,2vw,1.05rem)", color:"rgba(255,255,255,.38)", letterSpacing:".1em", maxWidth:"560px", textAlign:"center", lineHeight:1.75 }}>
        Solar Flash is not a single tool. It is an expanding crypto intelligence operating system built around a single mission — give every participant institutional-grade market intelligence.
      </p>

      {/* Stats row */}
      <div style={{ display:"flex", gap:"2rem", marginTop:"1.8rem", flexWrap:"wrap", justifyContent:"center" }}>
        {[
          { val:"4", label:"LIVE PRODUCTS" },
          { val:"4", label:"IN DEVELOPMENT" },
          { val:"4", label:"ON ROADMAP" },
          { val:"12+", label:"TOTAL MODULES" },
        ].map((s,i) => (
          <div key={i} style={{ textAlign:"center" }}>
            <div style={{ fontFamily:C.font, fontSize:"clamp(1rem,3vw,1.5rem)", fontWeight:900, color:C.gold }}>{s.val}</div>
            <div style={{ fontFamily:C.body, fontSize:".72rem", color:"rgba(255,255,255,.3)", letterSpacing:".1em" }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────
export default function Ecosystem() {
  return (
    <div style={{ minHeight:"100vh", background:C.black, color:"#fff", fontFamily:C.font, overflowX:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-track{background:#050403;} ::-webkit-scrollbar-thumb{background:#ffd70066;}
        @keyframes eco-spin   { to{ transform:rotate(360deg); }  }
        @keyframes eco-spin-r { to{ transform:rotate(-360deg); } }
        @keyframes eco-pulse  { 0%,100%{opacity:.7;} 50%{opacity:1;} }
        @keyframes eco-blink  { 0%,100%{opacity:1;} 50%{opacity:.25;} }
        @keyframes eco-fade-up{ from{opacity:0;transform:translateY(18px);} to{opacity:1;transform:translateY(0);} }
        @keyframes grid-glow  { 0%,100%{opacity:.014;} 50%{opacity:.026;} }
      `}</style>

      {/* Background */}
      <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(255,140,0,.014) 1px,transparent 1px),linear-gradient(90deg,rgba(255,140,0,.014) 1px,transparent 1px)", backgroundSize:"70px 70px", animation:"grid-glow 10s ease-in-out infinite" }}/>
        <div style={{ position:"absolute", top:"10%", left:"-10%", width:"700px", height:"700px", borderRadius:"50%", background:"radial-gradient(circle,rgba(255,80,0,.055),transparent 65%)" }}/>
        <div style={{ position:"absolute", bottom:"5%", right:"-8%", width:"600px", height:"600px", borderRadius:"50%", background:"radial-gradient(circle,rgba(0,100,200,.04),transparent 65%)" }}/>
      </div>

      <div style={{ position:"relative", zIndex:10, maxWidth:"1200px", margin:"0 auto", padding:"clamp(1.5rem,4vw,3rem) clamp(1rem,4vw,2rem)" }}>

        {/* ── TOP NAV ── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"clamp(2rem,5vw,3rem)", flexWrap:"wrap", gap:"1rem" }}>
          <a href="/" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:".6rem" }}>
            <div style={{ width:"28px", height:"28px", borderRadius:"50%", background:"radial-gradient(circle,#ffd700,#ff8c00)", boxShadow:"0 0 16px rgba(255,150,0,.5)" }}/>
            <span style={{ fontFamily:C.font, fontSize:".56rem", letterSpacing:".22em", color:"rgba(255,215,0,.9)" }}>$FLASH</span>
          </a>

          <div style={{ display:"flex", gap:".5rem", alignItems:"center", flexWrap:"wrap" }}>
            {[
              { label:"HOME",      href:"/"          },
              { label:"LITEPAPER", href:"/litepaper"  },
              { label:"ROADMAP",   href:"/#portal"    },
            ].map(l => (
              <a key={l.label} href={l.href} style={{ textDecoration:"none" }}>
                <button style={{ padding:".38rem .9rem", borderRadius:"6px", border:"1px solid rgba(255,255,255,.1)", background:"rgba(0,0,0,.35)", color:"rgba(255,255,255,.42)", fontFamily:C.font, fontSize:".34rem", letterSpacing:".18em", cursor:"pointer", transition:"all .2s" }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,180,0,.4)";e.currentTarget.style.color="rgba(255,215,0,.8)";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,.1)";e.currentTarget.style.color="rgba(255,255,255,.42)";}}>
                  {l.label}
                </button>
              </a>
            ))}
            <a href="/dashboard" style={{ textDecoration:"none" }}>
              <button style={{ padding:".42rem 1.1rem", borderRadius:"7px", border:"1.5px solid rgba(255,180,0,.5)", background:"linear-gradient(135deg,rgba(255,180,0,.18),rgba(255,80,0,.1))", color:"rgba(255,215,0,.95)", fontFamily:C.font, fontSize:".44rem", letterSpacing:".2em", cursor:"pointer", transition:"all .3s", fontWeight:700 }}
                onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 0 28px rgba(255,180,0,.3)";}}
                onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";}}>
                ⊙ LAUNCH APP
              </button>
            </a>
          </div>
        </div>

        {/* ── CORE ── */}
        <EcosystemCore/>

        {/* ── DIVIDER ── */}
        <div style={{ height:"1px", background:"linear-gradient(to right,transparent,rgba(255,180,0,.2),transparent)", margin:"clamp(1.5rem,4vw,2.5rem) 0" }}/>

        {/* ── LAYERS ── */}
        {LAYERS.map((layer, i) => (
          <EcosystemLayer key={layer.id} layer={layer} idx={i}/>
        ))}

        {/* ── BOTTOM CTA ── */}
        <div style={{ textAlign:"center", padding:"clamp(2rem,5vw,3.5rem) 1rem", borderTop:"1px solid rgba(255,180,0,.1)" }}>
          <div style={{ fontFamily:C.font, fontSize:".42rem", letterSpacing:".4em", color:"rgba(255,180,0,.4)", marginBottom:"1rem" }}>JOIN THE INTELLIGENCE NETWORK</div>
          <h3 style={{ fontFamily:C.font, fontSize:"clamp(1rem,3vw,1.6rem)", fontWeight:900, background:"linear-gradient(135deg,#fff,#ffd700)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", letterSpacing:".1em", marginBottom:".8rem" }}>
            THE ECOSYSTEM IS GROWING
          </h3>
          <p style={{ fontFamily:C.body, color:"rgba(255,255,255,.38)", fontSize:".95rem", letterSpacing:".08em", marginBottom:"1.8rem", maxWidth:"500px", margin:"0 auto 1.8rem" }}>
            Every module is built around one goal — give you the intelligence edge.
          </p>
          <div style={{ display:"flex", gap:"1rem", justifyContent:"center", flexWrap:"wrap" }}>
            {[
              { label:"⊙ LAUNCH DASHBOARD", href:"/dashboard", color:C.cyan   },
              { label:"⚡ SMART ALERTS",    href:"/alerts",    color:C.orange  },
              { label:"JOIN $FLASH",        href:"https://t.me/SolarFlash_Sol", color:C.gold, ext:true },
            ].map((b,i) => (
              <a key={i} href={b.href} target={b.ext?"_blank":undefined} rel="noopener noreferrer" style={{ textDecoration:"none" }}>
                <button style={{ padding:".7rem 1.6rem", borderRadius:"8px", border:`1.5px solid ${b.color}44`, background:`${b.color}0e`, color:b.color, fontFamily:C.font, fontSize:".48rem", letterSpacing:".18em", cursor:"pointer", transition:"all .3s", fontWeight:700 }}
                  onMouseEnter={e=>{e.currentTarget.style.boxShadow=`0 0 28px ${b.color}28`;e.currentTarget.style.borderColor=b.color;}}
                  onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";e.currentTarget.style.borderColor=`${b.color}44`;}}>
                  {b.label}
                </button>
              </a>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign:"center", padding:"1.5rem 0", borderTop:"1px solid rgba(255,255,255,.05)", marginTop:"2rem" }}>
          <span style={{ fontFamily:C.body, fontSize:".75rem", color:"rgba(255,255,255,.18)", letterSpacing:".1em" }}>
            Solar Flash Intelligence Ecosystem — $FLASH on Solana
          </span>
        </div>

      </div>
    </div>
  );
}
