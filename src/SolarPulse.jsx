/**
 * SolarPulse.jsx — Solar Flash Design System v4
 * Solar Pulse Timeline — /pulse
 * Living market heartbeat • Desktop + Mobile
 */

import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ─── TOKENS ───────────────────────────────────────────────────
const T = {
  orange: "#ff8c00", gold: "#ffd700", cyan: "#00e5ff",
  ok:     "#50ffa0", purple: "#b060ff", danger: "#ff3535",
  black:  "#050403",
  font:   "'Orbitron', monospace", body: "'Rajdhani', sans-serif",
};

// ─── PULSE CATEGORIES ─────────────────────────────────────────
const CATEGORIES = [
  { id:"whale",     label:"Whale",       icon:"🐋", color:T.cyan   },
  { id:"smart",     label:"Smart Money", icon:"🧠", color:T.purple },
  { id:"liquidity", label:"Liquidity",   icon:"💧", color:T.ok     },
  { id:"risk",      label:"Risk",        icon:"☠️", color:T.danger },
  { id:"narrative", label:"Narrative",   icon:"📡", color:T.orange },
];

// ─── AI SIGNAL TEXTS ──────────────────────────────────────────
const SIGNALS = {
  whale: [
    "Large accumulation detected — wallet history: consistently profitable.",
    "Coordinated buy pressure across 3 wallets. Volume: $2.1M in 8 minutes.",
    "Whale exit pattern identified — similar signature preceded 3 prior corrections.",
    "Smart whale entered position 2 blocks ago. Confidence: HIGH.",
    "Unusual wallet cluster active — 6 addresses coordinating buys.",
  ],
  smart: [
    "Alpha wallet entering position — historical win rate: 91%.",
    "Smart money rotation into meme sector detected.",
    "Wallet cluster associated with 4 prior 10x events accumulating quietly.",
    "Notable exit from classified Alpha Tier wallet. Risk posture: cautious.",
    "Early accumulation pattern — 12h before last major move, same wallets moved.",
  ],
  liquidity: [
    "LP depth increased 38%. Operator confidence signal.",
    "Rapid liquidity removal — 68% pool depth withdrawn in 4 minutes.",
    "New liquidity position opened by classified smart money wallet.",
    "LP concentration narrowing — spread manipulation risk elevated.",
    "Liquidity depth at 90-day high. Strong backing signal.",
  ],
  risk: [
    "Mint authority detected as active. Token creation risk elevated.",
    "Dev wallet began selling — 12% of supply moved in 6 hours.",
    "Freeze authority enabled. Centralized control — exercise caution.",
    "Contract interaction pattern matches known exit scam vector.",
    "Top holder concentration at 62%. Coordinated dump risk: HIGH.",
  ],
  narrative: [
    "Narrative momentum accelerating — 340% above baseline signal volume.",
    "Cross-channel emergence detected. Early-stage trend confirmed.",
    "AI + token narrative correlation spiking across 7 monitored channels.",
    "Sentiment shift from neutral to strongly bullish in last 90 minutes.",
    "New category narrative emerging — monitored in 12 intelligence feeds.",
  ],
};

const TOKENS = [
  "FLASH","WIF","BONK","JUP","POPCAT","BOME","SLERF","MYRO",
  "ORCA","RAY","PYTH","JTO","MOODENG","PNUT","GIGA","MEW",
  "TRUMP","FARTCOIN","PEPE","DOGE","SHIB","FLOKI","BRETT",
];

// ─── EVENT GENERATOR ──────────────────────────────────────────
let _eid = 2000;
function makeEvent() {
  const cat   = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  const sigs  = SIGNALS[cat.id];
  const sig   = sigs[Math.floor(Math.random() * sigs.length)];
  const token = TOKENS[Math.floor(Math.random() * TOKENS.length)];
  const mag   = (Math.random() * 2.8 + 0.1).toFixed(2);
  const isNew = true;
  return {
    id:        ++_eid,
    cat,
    token,
    signal:    sig,
    value:     `$${mag}M`,
    ts:        Date.now(),
    isNew,
    intensity: Math.random(), // 0-1 — drives heartbeat amplitude
  };
}

function seedEvents() {
  return Array.from({ length: 14 }, (_, i) => ({
    ...makeEvent(),
    isNew: false,
    ts:    Date.now() - i * 38000 - Math.random() * 20000,
  }));
}

// ─── HELPERS ──────────────────────────────────────────────────
function ago(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s <  60)   return `${s}s ago`;
  if (s < 3600)  return `${Math.floor(s/60)}m ago`;
  return `${Math.floor(s/3600)}h ago`;
}

function LiveDot({ color, size = 7 }) {
  return (
    <span style={{ position:"relative", display:"inline-flex", width:size, height:size, flexShrink:0 }}>
      <span style={{ position:"absolute", inset:0, borderRadius:"50%", background:color, opacity:.65, animation:"sp-ping 1.5s ease-out infinite" }}/>
      <span style={{ position:"relative", width:"100%", height:"100%", borderRadius:"50%", background:color }}/>
    </span>
  );
}

// ─── HEARTBEAT CANVAS ─────────────────────────────────────────
function HeartbeatCanvas({ events }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const offsetRef = useRef(0);

  // Build waveform from event intensities
  const wave = useMemo(() => {
    const pts = [];
    const W   = 900;
    const gap = W / Math.max(events.length, 1);
    events.forEach((ev, i) => {
      const x = W - i * gap;
      const h = 0.15 + ev.intensity * 0.75; // 0.15–0.9
      pts.push({ x, h, color: ev.cat.color, isNew: ev.isNew });
    });
    return pts;
  }, [events]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W   = canvas.width;
    const H   = canvas.height;
    const cy  = H / 2;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Grid lines
      for (let y = 0; y < H; y += H/4) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.strokeStyle = "rgba(255,180,0,.04)";
        ctx.lineWidth   = 1;
        ctx.stroke();
      }

      // Baseline
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(W, cy);
      ctx.strokeStyle = "rgba(255,180,0,.1)";
      ctx.lineWidth   = 1;
      ctx.stroke();

      // Waveform
      ctx.beginPath();
      ctx.moveTo(0, cy);

      const scrolled = wave.map(p => ({ ...p, x: p.x - offsetRef.current }));

      scrolled.forEach((p, i) => {
        if (p.x < -60 || p.x > W + 60) return;
        const x = p.x;

        // Spike up
        ctx.lineTo(x + 8, cy);
        ctx.lineTo(x + 14, cy - p.h * cy * .85);
        ctx.lineTo(x + 18, cy + p.h * cy * .35);
        ctx.lineTo(x + 24, cy - p.h * cy * .15);
        ctx.lineTo(x + 30, cy);
      });

      ctx.lineTo(W, cy);

      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "rgba(255,200,0,.55)");
      grad.addColorStop(.5, "rgba(255,140,0,.38)");
      grad.addColorStop(1, "rgba(255,80,0,.15)");

      ctx.strokeStyle = "rgba(255,200,60,.65)";
      ctx.lineWidth   = 1.5;
      ctx.shadowColor = "rgba(255,200,0,.4)";
      ctx.shadowBlur  = 6;
      ctx.stroke();
      ctx.shadowBlur  = 0;

      // Fill under wave
      ctx.lineTo(W, cy);
      ctx.lineTo(0, cy);
      ctx.closePath();
      ctx.fillStyle = "rgba(255,140,0,.04)";
      ctx.fill();

      // Color dots at spike peaks
      scrolled.forEach(p => {
        if (p.x < -10 || p.x > W + 10) return;
        const px = p.x + 14;
        const py = cy - p.h * cy * .85;
        ctx.beginPath();
        ctx.arc(px, py, p.isNew ? 4 : 2.5, 0, Math.PI * 2);
        ctx.fillStyle   = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur  = p.isNew ? 12 : 5;
        ctx.fill();
        ctx.shadowBlur  = 0;
      });

      // Scan line (moving right edge indicator)
      const scanX = W - (offsetRef.current % W);
      ctx.beginPath();
      ctx.moveTo(scanX, 0);
      ctx.lineTo(scanX, H);
      ctx.strokeStyle = "rgba(255,200,60,.12)";
      ctx.lineWidth   = 1;
      ctx.stroke();

      offsetRef.current += 0.4;
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [wave]);

  return (
    <canvas
      ref={canvasRef}
      width={900} height={80}
      style={{ width:"100%", height:"80px", display:"block" }}
    />
  );
}

// ─── PULSE EVENT CARD ─────────────────────────────────────────
function PulseCard({ event, isFirst }) {
  const [expanded, setExpanded] = useState(isFirst);

  return (
    <div
      onClick={() => setExpanded(e => !e)}
      style={{
        display:       "flex",
        gap:           "0",
        position:      "relative",
        cursor:        "pointer",
        animation:     event.isNew ? "sp-enter .4s ease both" : "none",
      }}
    >
      {/* Timeline spine */}
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", width:"40px", flexShrink:0, paddingTop:".15rem" }}>
        {/* Node */}
        <div style={{
          width:  "32px", height: "32px", borderRadius:"50%", flexShrink:0,
          background: `${event.cat.color}14`,
          border:     `1px solid ${event.cat.color}${event.isNew?"55":"30"}`,
          display:    "flex", alignItems:"center", justifyContent:"center",
          fontSize:   ".95rem", zIndex:1,
          boxShadow:  event.isNew ? `0 0 18px ${event.cat.color}28` : "none",
          transition: "all .3s",
        }}>
          {event.cat.icon}
        </div>
        {/* Connector */}
        <div style={{
          flex:       1,
          width:      "1px",
          minHeight:  "24px",
          background: `linear-gradient(to bottom,${event.cat.color}33,transparent)`,
          animation:  "sp-pulse-line 3s ease-in-out infinite",
          marginTop:  "4px",
        }}/>
      </div>

      {/* Content */}
      <div style={{
        flex:           1,
        marginLeft:     ".8rem",
        paddingBottom:  "1.2rem",
        borderRadius:   "12px",
        border:         `1px solid ${expanded ? event.cat.color+"30" : event.cat.color+"14"}`,
        background:     expanded ? `${event.cat.color}07` : "rgba(0,0,0,.4)",
        padding:        ".85rem 1.1rem",
        transition:     "all .25s",
        marginBottom:   ".5rem",
      }}
        onMouseEnter={e=>{e.currentTarget.style.borderColor=`${event.cat.color}30`;}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor=`${event.cat.color}${expanded?"30":"14"}`;}}
      >
        {/* Top row */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:".5rem", flexWrap:"wrap", gap:".4rem" }}>
          <div style={{ display:"flex", alignItems:"center", gap:".5rem" }}>
            <span style={{ fontFamily:T.font, fontSize:".48rem", fontWeight:700, color:event.cat.color, letterSpacing:".1em" }}>
              {event.cat.label.toUpperCase()}
            </span>
            {event.isNew && (
              <span style={{ padding:".1rem .45rem", borderRadius:"4px", background:"rgba(80,255,160,.12)", border:"1px solid rgba(80,255,160,.3)", fontFamily:T.font, fontSize:".3rem", color:T.ok, letterSpacing:".15em" }}>
                NEW
              </span>
            )}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:".55rem" }}>
            <span style={{ fontFamily:T.body, fontSize:".82rem", color:"rgba(255,255,255,.28)" }}>{ago(event.ts)}</span>
            <LiveDot color={event.cat.color} size={6}/>
          </div>
        </div>

        {/* Token + value */}
        <div style={{ display:"flex", alignItems:"center", gap:".6rem", marginBottom:".55rem" }}>
          <span style={{ fontFamily:T.font, fontSize:".68rem", fontWeight:900, color:"rgba(255,255,255,.88)", letterSpacing:".08em" }}>
            ${event.token}
          </span>
          <span style={{ fontFamily:T.body, fontSize:".82rem", color:"rgba(255,255,255,.25)" }}>·</span>
          <span style={{ fontFamily:T.font, fontSize:".55rem", fontWeight:700, color:event.cat.color }}>
            {event.value}
          </span>
        </div>

        {/* Signal text */}
        <p style={{ fontFamily:T.body, fontSize:".92rem", color:"rgba(255,255,255,.5)", lineHeight:1.65, letterSpacing:".04em" }}>
          <span style={{ color:event.cat.color, fontSize:".7rem", letterSpacing:".1em", fontWeight:700 }}>⊙ </span>
          {event.signal}
        </p>

        {/* Expanded detail */}
        {expanded && (
          <div style={{ marginTop:".75rem", padding:".65rem .8rem", borderRadius:"8px", background:"rgba(0,0,0,.35)", border:"1px solid rgba(255,255,255,.06)", animation:"sp-fade .25s ease" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:".6rem" }}>
              {[
                { label:"SIGNAL ID",  val:`#${event.id}` },
                { label:"CATEGORY",   val:event.cat.label },
                { label:"TOKEN",      val:`$${event.token}` },
                { label:"VOLUME",     val:event.value },
                { label:"NETWORK",    val:"Solana" },
                { label:"CONFIDENCE", val:`${64 + Math.floor(event.intensity * 30)}%` },
              ].map((f,i) => (
                <div key={i}>
                  <div style={{ fontFamily:T.font, fontSize:".3rem", letterSpacing:".18em", color:"rgba(255,255,255,.2)", marginBottom:".2rem" }}>{f.label}</div>
                  <div style={{ fontFamily:T.body, fontSize:".88rem", color:"rgba(255,255,255,.6)", fontWeight:600 }}>{f.val}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expand hint */}
        <div style={{ marginTop:".5rem", textAlign:"right" }}>
          <span style={{ fontFamily:T.font, fontSize:".3rem", letterSpacing:".18em", color:"rgba(255,255,255,.18)" }}>
            {expanded ? "▲ COLLAPSE" : "▼ EXPAND"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── SYSTEM STATUS BAR ────────────────────────────────────────
function StatusBar({ events, paused }) {
  const newCount = events.filter(e => e.isNew).length;
  const stats = [
    { label:"LIVE SIGNALS",    val:events.length,  color:T.gold  },
    { label:"NEW",             val:newCount,        color:T.ok    },
    { label:"WHALES",          val:events.filter(e=>e.cat.id==="whale").length, color:T.cyan },
    { label:"RISK ALERTS",     val:events.filter(e=>e.cat.id==="risk").length,  color:T.danger },
    { label:"FEED STATUS",     val:paused?"PAUSED":"LIVE",  color:paused?T.danger:T.ok },
  ];
  return (
    <div style={{ display:"flex", gap:".6rem", flexWrap:"wrap", marginBottom:"1.2rem" }}>
      {stats.map((s,i) => (
        <div key={i} style={{ padding:".55rem .9rem", borderRadius:"8px", border:`1px solid ${s.color}20`, background:"rgba(0,0,0,.45)", backdropFilter:"blur(8px)", display:"flex", flexDirection:"column", gap:".2rem" }}>
          <div style={{ fontFamily:T.font, fontSize:".3rem", letterSpacing:".2em", color:"rgba(255,255,255,.28)" }}>{s.label}</div>
          <div style={{ fontFamily:T.font, fontSize:".72rem", fontWeight:900, color:s.color, lineHeight:1 }}>{s.val}</div>
        </div>
      ))}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────
export default function SolarPulsePage() {
  const [events,  setEvents]  = useState(() => seedEvents());
  const [filter,  setFilter]  = useState("ALL");
  const [paused,  setPaused]  = useState(false);
  const timerRef = useRef(null);

  // Live feed
  useEffect(() => {
    if (paused) return;
    const tick = () => {
      setEvents(prev => [makeEvent(), ...prev.slice(0, 49)]);
      timerRef.current = setTimeout(tick, 7000 + Math.random() * 9000);
    };
    timerRef.current = setTimeout(tick, 7000 + Math.random() * 9000);
    return () => clearTimeout(timerRef.current);
  }, [paused, events]);

  // Age out isNew
  useEffect(() => {
    const id = setInterval(() => {
      setEvents(prev => prev.map(e => ({
        ...e, isNew: e.isNew && Date.now() - e.ts < 14000,
      })));
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    if (filter === "ALL") return events;
    return events.filter(e => e.cat.id === filter);
  }, [events, filter]);

  return (
    <div style={{ minHeight:"100vh", background:T.black, color:"#fff", fontFamily:T.font, overflowX:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-track{background:#050403;} ::-webkit-scrollbar-thumb{background:#ffd70055;}
        @keyframes sp-ping       { 0%{transform:scale(1);opacity:.65;} 100%{transform:scale(2.4);opacity:0;} }
        @keyframes sp-enter      { from{opacity:0;transform:translateX(-10px);} to{opacity:1;transform:translateX(0);} }
        @keyframes sp-fade       { from{opacity:0;} to{opacity:1;} }
        @keyframes sp-pulse-line { 0%,100%{opacity:.25;} 50%{opacity:.65;} }
        @keyframes grid-dim      { 0%,100%{opacity:.013;} 50%{opacity:.025;} }
        @keyframes hb-glow       { 0%,100%{box-shadow:0 0 20px rgba(255,180,0,.08);} 50%{box-shadow:0 0 40px rgba(255,180,0,.16);} }
        @keyframes sp-spin       { to{transform:rotate(360deg);} }
        .filter-btn { padding:.42rem .9rem; border-radius:6px; border:1px solid rgba(255,255,255,.1); background:rgba(0,0,0,.35); color:rgba(255,255,255,.4); font-family:'Orbitron',monospace; font-size:.36rem; letter-spacing:.16em; cursor:pointer; transition:all .2s; }
        .filter-btn.active { border-color:currentColor; background:rgba(0,0,0,.5); }
        @media(max-width:640px){
          .pulse-layout { grid-template-columns:1fr !important; }
          .sp-sidebar { display:none !important; }
        }
      `}</style>

      {/* Background */}
      <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(255,150,0,.013) 1px,transparent 1px),linear-gradient(90deg,rgba(255,150,0,.013) 1px,transparent 1px)", backgroundSize:"65px 65px", animation:"grid-dim 10s ease-in-out infinite" }}/>
        <div style={{ position:"absolute", top:"8%",   right:"-8%",  width:"600px", height:"600px", borderRadius:"50%", background:"radial-gradient(circle,rgba(255,140,0,.045),transparent 65%)" }}/>
        <div style={{ position:"absolute", bottom:"5%", left:"-8%",  width:"500px", height:"500px", borderRadius:"50%", background:"radial-gradient(circle,rgba(0,100,255,.03),transparent 65%)" }}/>
      </div>

      <div style={{ position:"relative", zIndex:10, maxWidth:"1200px", margin:"0 auto", padding:"clamp(1.5rem,4vw,3rem) clamp(1rem,4vw,2rem)" }}>

        {/* ── NAVBAR ── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"2.5rem", flexWrap:"wrap", gap:"1rem" }}>
          <a href="/" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:".6rem" }}>
            <div style={{ width:"28px", height:"28px", borderRadius:"50%", background:"radial-gradient(circle,#ffd700,#ff8c00)", boxShadow:"0 0 16px rgba(255,150,0,.5)" }}/>
            <span style={{ fontFamily:T.font, fontSize:".56rem", letterSpacing:".22em", color:"rgba(255,215,0,.9)" }}>$FLASH</span>
          </a>
          <div style={{ display:"flex", gap:".5rem", flexWrap:"wrap" }}>
            {[
              {l:"ECOSYSTEM",href:"/ecosystem"},
              {l:"DASHBOARD",href:"/dashboard"},
              {l:"ALERTS",   href:"/alerts"},
              {l:"THREAT",   href:"/threat"},
            ].map(b=>(
              <a key={b.l} href={b.href} style={{ textDecoration:"none" }}>
                <button style={{ padding:".38rem .9rem", borderRadius:"6px", border:"1px solid rgba(255,255,255,.1)", background:"rgba(0,0,0,.35)", color:"rgba(255,255,255,.45)", fontFamily:T.font, fontSize:".38rem", letterSpacing:".16em", cursor:"pointer", transition:"all .2s" }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,180,0,.4)";e.currentTarget.style.color="rgba(255,215,0,.8)";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,.1)";e.currentTarget.style.color="rgba(255,255,255,.45)";}}>
                  {b.l}
                </button>
              </a>
            ))}
          </div>
        </div>

        {/* ── HEADER ── */}
        <div style={{ marginBottom:"clamp(1.5rem,4vw,2.5rem)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:".8rem", marginBottom:".7rem" }}>
            <LiveDot color={paused ? T.danger : T.ok} size={9}/>
            <span style={{ fontFamily:T.font, fontSize:".4rem", letterSpacing:".32em", color:paused?"rgba(255,53,53,.7)":"rgba(80,255,160,.7)" }}>
              {paused ? "FEED PAUSED" : "LIVE INTELLIGENCE FEED"}
            </span>
          </div>
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:"1rem" }}>
            <div>
              <h1 style={{ fontFamily:T.font, fontSize:"clamp(1.8rem,5vw,3rem)", fontWeight:900, background:"linear-gradient(135deg,#fff 0%,#ffd700 40%,#ff8c00 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", letterSpacing:".1em", lineHeight:1.1 }}>
                SOLAR PULSE
              </h1>
              <p style={{ fontFamily:T.body, fontSize:"clamp(.88rem,2vw,1rem)", color:"rgba(255,255,255,.38)", letterSpacing:".1em", marginTop:".4rem" }}>
                The living market heartbeat — intelligence as it happens
              </p>
            </div>
            <button onClick={() => setPaused(p => !p)}
              style={{ padding:".55rem 1.3rem", borderRadius:"8px", border:`1px solid ${paused?"rgba(80,255,160,.4)":"rgba(255,53,53,.4)"}`, background:paused?"rgba(80,255,160,.07)":"rgba(255,53,53,.07)", color:paused?T.ok:T.danger, fontFamily:T.font, fontSize:".4rem", letterSpacing:".2em", cursor:"pointer", transition:"all .25s" }}>
              {paused ? "▶ RESUME" : "⏸ PAUSE"}
            </button>
          </div>
        </div>

        {/* ── HEARTBEAT ── */}
        <div style={{ borderRadius:"14px", border:"1px solid rgba(255,180,0,.14)", background:"rgba(0,0,0,.5)", backdropFilter:"blur(10px)", padding:"1rem 1.4rem", marginBottom:"1.5rem", overflow:"hidden", position:"relative", animation:"hb-glow 5s ease-in-out infinite" }}>
          <div style={{ fontFamily:T.font, fontSize:".34rem", letterSpacing:".28em", color:"rgba(255,180,0,.4)", marginBottom:".6rem" }}>
            MARKET HEARTBEAT
          </div>
          <HeartbeatCanvas events={events}/>
        </div>

        {/* ── STATUS ── */}
        <StatusBar events={events} paused={paused}/>

        {/* ── FILTER BAR ── */}
        <div style={{ display:"flex", gap:".45rem", flexWrap:"wrap", marginBottom:"1.4rem", alignItems:"center" }}>
          <button
            onClick={() => setFilter("ALL")}
            className={`filter-btn${filter==="ALL"?" active":""}`}
            style={{ color:filter==="ALL"?"rgba(255,215,0,.9)":"rgba(255,255,255,.4)", borderColor:filter==="ALL"?"rgba(255,180,0,.45)":"rgba(255,255,255,.1)" }}>
            ALL
          </button>
          {CATEGORIES.map(cat => (
            <button key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`filter-btn${filter===cat.id?" active":""}`}
              style={{ color:filter===cat.id?cat.color:"rgba(255,255,255,.4)", borderColor:filter===cat.id?`${cat.color}55`:"rgba(255,255,255,.1)" }}>
              {cat.icon} {cat.label.toUpperCase()}
            </button>
          ))}
        </div>

        {/* ── MAIN LAYOUT ── */}
        <div className="pulse-layout" style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:"1.5rem", alignItems:"start" }}>

          {/* Timeline */}
          <div>
            {filtered.length === 0 ? (
              <div style={{ textAlign:"center", padding:"3rem", border:"1px solid rgba(255,255,255,.06)", borderRadius:"12px", background:"rgba(0,0,0,.3)" }}>
                <div style={{ fontSize:"2rem", opacity:.25, marginBottom:".8rem" }}>⊙</div>
                <p style={{ fontFamily:T.body, color:"rgba(255,255,255,.3)", letterSpacing:".1em" }}>No events for this filter</p>
              </div>
            ) : (
              filtered.map((ev, i) => (
                <PulseCard key={ev.id} event={ev} isFirst={i===0}/>
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="sp-sidebar" style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>

            {/* Category breakdown */}
            <div style={{ padding:"1.2rem", borderRadius:"12px", border:"1px solid rgba(255,180,0,.14)", background:"rgba(0,0,0,.5)", backdropFilter:"blur(8px)" }}>
              <div style={{ fontFamily:T.font, fontSize:".36rem", letterSpacing:".25em", color:"rgba(255,180,0,.5)", marginBottom:"1rem" }}>SIGNAL MIX</div>
              {CATEGORIES.map(cat => {
                const count = events.filter(e => e.cat.id === cat.id).length;
                const pct   = Math.round(count / events.length * 100);
                return (
                  <div key={cat.id} style={{ marginBottom:".7rem", cursor:"pointer" }} onClick={() => setFilter(filter===cat.id?"ALL":cat.id)}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:".28rem" }}>
                      <span style={{ fontFamily:T.font, fontSize:".34rem", letterSpacing:".12em", color:cat.color }}>{cat.icon} {cat.id.toUpperCase()}</span>
                      <span style={{ fontFamily:T.body, fontSize:".85rem", color:"rgba(255,255,255,.4)" }}>{count}</span>
                    </div>
                    <div style={{ height:"3px", borderRadius:"99px", background:"rgba(255,255,255,.06)", overflow:"hidden" }}>
                      <div style={{ width:`${pct}%`, height:"100%", background:`linear-gradient(to right,${cat.color}66,${cat.color})`, borderRadius:"99px" }}/>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Telegram bot CTA */}
            <div style={{ padding:"1.2rem", borderRadius:"12px", border:"1px solid rgba(255,140,0,.2)", background:"linear-gradient(135deg,rgba(255,80,0,.07),rgba(0,0,0,.5))", textAlign:"center" }}>
              <div style={{ fontSize:"1.8rem", marginBottom:".6rem" }}>⚡</div>
              <div style={{ fontFamily:T.font, fontSize:".46rem", fontWeight:700, color:"rgba(255,215,0,.9)", letterSpacing:".12em", marginBottom:".5rem" }}>
                GET ALERTS INSTANTLY
              </div>
              <p style={{ fontFamily:T.body, fontSize:".88rem", color:"rgba(255,255,255,.38)", lineHeight:1.6, marginBottom:"1rem" }}>
                Critical signals delivered to Telegram in real time.
              </p>
              <a href="https://t.me/SolarFlashbot" target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
                <button style={{ width:"100%", padding:".65rem 1rem", borderRadius:"8px", border:"1px solid rgba(255,180,0,.4)", background:"linear-gradient(135deg,rgba(255,180,0,.15),rgba(255,80,0,.08))", color:"rgba(255,215,0,.9)", fontFamily:T.font, fontSize:".4rem", letterSpacing:".18em", cursor:"pointer", transition:"all .3s", fontWeight:700 }}
                  onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 0 28px rgba(255,180,0,.25)";}}
                  onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";}}>
                  ⚡ CONNECT BOT
                </button>
              </a>
            </div>

            {/* Quick links */}
            <div style={{ padding:"1.1rem", borderRadius:"12px", border:"1px solid rgba(255,255,255,.07)", background:"rgba(0,0,0,.4)" }}>
              <div style={{ fontFamily:T.font, fontSize:".34rem", letterSpacing:".24em", color:"rgba(255,255,255,.22)", marginBottom:".8rem" }}>QUICK ACCESS</div>
              {[
                {l:"Smart Alerts",   href:"/alerts",    color:T.orange},
                {l:"Threat Radar",   href:"/threat",    color:T.danger},
                {l:"Token Scanner",  href:"/report",    color:T.gold  },
                {l:"Dashboard",      href:"/dashboard", color:T.cyan  },
              ].map((lnk,i) => (
                <a key={i} href={lnk.href} style={{ textDecoration:"none", display:"flex", alignItems:"center", justifyContent:"space-between", padding:".5rem .6rem", borderRadius:"6px", marginBottom:".3rem", transition:"background .2s" }}
                  onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,.04)";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="transparent";}}>
                  <span style={{ fontFamily:T.body, fontSize:".9rem", color:"rgba(255,255,255,.48)" }}>{lnk.l}</span>
                  <span style={{ fontFamily:T.font, fontSize:".55rem", color:lnk.color }}>→</span>
                </a>
              ))}
            </div>

          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign:"center", padding:"1.5rem 0", marginTop:"2rem", borderTop:"1px solid rgba(255,255,255,.05)" }}>
          <span style={{ fontFamily:T.body, fontSize:".75rem", color:"rgba(255,255,255,.18)", letterSpacing:".1em" }}>
            Solar Flash Solar Pulse — Live intelligence feed — Data is simulated for demonstration
          </span>
        </div>

      </div>
    </div>
  );
}

// ─── MINI EMBED (for homepage) ────────────────────────────────
export function SolarPulseMini() {
  const [events, setEvents] = useState(() => seedEvents().slice(0,5));

  useEffect(() => {
    const id = setInterval(() => {
      setEvents(prev => [makeEvent(), ...prev.slice(0,4)]);
    }, 8000 + Math.random()*6000);
    return () => clearInterval(id);
  }, []);

  return (
    <section style={{ position:"relative", zIndex:10, padding:"clamp(3rem,8vw,6rem) clamp(1rem,5vw,3rem)" }}>
      <div style={{ maxWidth:"1000px", margin:"0 auto" }}>
        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:"clamp(1.5rem,4vw,2.5rem)", flexWrap:"wrap", gap:"1rem" }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:".6rem", marginBottom:".6rem" }}>
              <LiveDot color={T.ok} size={7}/>
              <span style={{ fontFamily:T.font, fontSize:".38rem", letterSpacing:".3em", color:"rgba(80,255,160,.65)" }}>LIVE PULSE</span>
            </div>
            <h2 style={{ fontFamily:T.font, fontSize:"clamp(1.4rem,4vw,2.2rem)", fontWeight:900, letterSpacing:".1em", background:"linear-gradient(135deg,#fff,#ffd700,#ff8c00)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
              SOLAR PULSE
            </h2>
          </div>
          <a href="/pulse" style={{ textDecoration:"none" }}>
            <button style={{ padding:".55rem 1.3rem", borderRadius:"8px", border:"1px solid rgba(255,180,0,.3)", background:"rgba(255,180,0,.06)", color:"rgba(255,215,0,.75)", fontFamily:T.font, fontSize:".4rem", letterSpacing:".2em", cursor:"pointer", transition:"all .3s" }}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 0 22px rgba(255,180,0,.18)";e.currentTarget.style.borderColor="rgba(255,180,0,.6)";}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";e.currentTarget.style.borderColor="rgba(255,180,0,.3)";}}>
              FULL TIMELINE →
            </button>
          </a>
        </div>
        <div>
          {events.map((ev,i) => <PulseCard key={ev.id} event={ev} isFirst={i===0}/>)}
        </div>
      </div>
    </section>
  );
}
