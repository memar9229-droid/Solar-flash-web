/**
 * OrbitMetrics.jsx — Solar Flash Design System v2
 * Orbit Metrics System — nodes arranged around the Survival Reactor
 * Desktop: orbit layout | Mobile: horizontal scroll cards
 */

import { useState, useEffect, useRef } from "react";
import { SurvivalReactor, ThreatRadar, SolarPulseTimeline, IntelPanel } from "./SurvivalReactor.jsx";

// ─── DESIGN TOKENS ────────────────────────────────────────────
const T = {
  orange: "#ff8c00", gold: "#ffd700", cyan: "#00e5ff",
  blue:   "#0080ff", ok:   "#50ffa0", purple: "#b060ff",
  danger: "#ff3535", black: "#050403",
  font:   "'Orbitron', monospace", body: "'Rajdhani', sans-serif",
};

// ─── ORBIT NODE DATA ──────────────────────────────────────────
function buildNodes(data) {
  return [
    {
      id: "liquidity",
      label: "LIQUIDITY",
      icon: "💧",
      value: data?.liquidity?.value  ?? "$2.4M",
      sub:   data?.liquidity?.sub    ?? "Depth",
      trend: data?.liquidity?.trend  ?? "UP",
      color: T.cyan,
      detail: "Liquidity pool depth — higher means safer exits",
    },
    {
      id: "holders",
      label: "HOLDERS",
      icon: "👥",
      value: data?.holders?.value    ?? "14.2K",
      sub:   data?.holders?.sub      ?? "Unique",
      trend: data?.holders?.trend    ?? "UP",
      color: T.gold,
      detail: "Number of unique wallet holders",
    },
    {
      id: "activity",
      label: "ACTIVITY",
      icon: "⚡",
      value: data?.activity?.value   ?? "HIGH",
      sub:   data?.activity?.sub     ?? "On-chain",
      trend: data?.activity?.trend   ?? "STABLE",
      color: T.orange,
      detail: "On-chain transaction velocity over 24h",
    },
    {
      id: "smart",
      label: "SMART MONEY",
      icon: "🧠",
      value: data?.smartMoney?.value ?? "ACTIVE",
      sub:   data?.smartMoney?.sub   ?? "Wallets",
      trend: data?.smartMoney?.trend ?? "UP",
      color: T.purple,
      detail: "Smart wallet accumulation detected",
    },
    {
      id: "risk",
      label: "RISK",
      icon: "🛡",
      value: data?.risk?.value       ?? "LOW",
      sub:   data?.risk?.sub         ?? "Overall",
      trend: data?.risk?.trend       ?? "STABLE",
      color: T.ok,
      detail: "Composite risk rating across all vectors",
    },
  ];
}

// ─── TREND INDICATOR ──────────────────────────────────────────
function TrendArrow({ trend, color }) {
  const arrow = trend === "UP" ? "↑" : trend === "DOWN" ? "↓" : "→";
  const c     = trend === "UP" ? T.ok : trend === "DOWN" ? T.danger : "rgba(255,255,255,.4)";
  return (
    <span style={{ fontFamily: T.font, fontSize: ".55rem", color: c, marginLeft: ".3rem" }}>
      {arrow}
    </span>
  );
}

// ─── DESKTOP ORBIT NODE ───────────────────────────────────────
// Positioned absolutely around the reactor core
function DesktopOrbitNode({ node, angle, orbitR, cx, cy, active, onClick }) {
  const rad   = (angle * Math.PI) / 180;
  const x     = cx + orbitR * Math.cos(rad);
  const y     = cy + orbitR * Math.sin(rad);
  const W     = 110;
  const H     = 88;

  return (
    <div
      onClick={() => onClick(node.id)}
      style={{
        position:   "absolute",
        left:       x - W / 2,
        top:        y - H / 2,
        width:      W,
        height:     H,
        borderRadius: "12px",
        border:     `1px solid ${active ? node.color + "66" : node.color + "28"}`,
        background: active ? `${node.color}10` : "rgba(0,0,0,.55)",
        backdropFilter: "blur(10px)",
        display:    "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap:        ".25rem",
        cursor:     "pointer",
        transition: "all .28s",
        boxShadow:  active ? `0 0 28px ${node.color}28` : "none",
        zIndex:     active ? 10 : 5,
        animation:  `orbit-fade-in .5s ease both`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = `${node.color}55`;
        e.currentTarget.style.boxShadow   = `0 0 24px ${node.color}24`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = active ? `${node.color}66` : `${node.color}28`;
        e.currentTarget.style.boxShadow   = active ? `0 0 28px ${node.color}28` : "none";
      }}
    >
      {/* Top accent line */}
      <div style={{ position:"absolute", top:0, left:"15%", right:"15%", height:"2px", background:`linear-gradient(to right,transparent,${node.color}${active?"66":"33"},transparent)`, borderRadius:"99px" }}/>

      <span style={{ fontSize: "1.1rem" }}>{node.icon}</span>
      <div style={{ fontFamily: T.body, fontSize: ".85rem", fontWeight: 700, color: node.color, letterSpacing: ".04em" }}>
        {node.value}
        <TrendArrow trend={node.trend} />
      </div>
      <div style={{ fontFamily: T.font, fontSize: ".3rem", letterSpacing: ".14em", color: "rgba(255,255,255,.35)" }}>
        {node.label}
      </div>
    </div>
  );
}

// ─── ORBIT CONNECTOR LINE ─────────────────────────────────────
function OrbitConnector({ angle, orbitR, cx, cy, color }) {
  const rad  = (angle * Math.PI) / 180;
  const x2   = cx + orbitR * Math.cos(rad);
  const y2   = cy + orbitR * Math.sin(rad);
  const innerR = 145; // edge of the reactor SVG
  const x1   = cx + innerR * Math.cos(rad);
  const y1   = cy + innerR * Math.sin(rad);

  return (
    <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", zIndex:3 }}>
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={`${color}22`} strokeWidth="1"
        strokeDasharray="4 4"
      />
      <circle cx={x2} cy={y2} r="3" fill={color} opacity=".5">
        <animate attributeName="opacity" values=".5;1;.5" dur="2.5s" repeatCount="indefinite"/>
      </circle>
    </svg>
  );
}

// ─── DETAIL PANEL ─────────────────────────────────────────────
function NodeDetail({ node }) {
  if (!node) return null;
  const trendColor = node.trend === "UP" ? T.ok : node.trend === "DOWN" ? T.danger : "rgba(255,255,255,.5)";

  return (
    <div style={{
      padding: "1rem 1.3rem",
      borderRadius: "12px",
      border: `1px solid ${node.color}28`,
      background: `${node.color}07`,
      backdropFilter: "blur(8px)",
      animation: "orbit-fade-in .25s ease",
      marginTop: "1rem",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:".6rem", marginBottom:".6rem" }}>
        <span style={{ fontSize:"1.2rem" }}>{node.icon}</span>
        <span style={{ fontFamily:T.font, fontSize:".55rem", fontWeight:700, color:node.color, letterSpacing:".12em" }}>{node.label}</span>
        <span style={{ marginLeft:"auto", fontFamily:T.font, fontSize:".7rem", fontWeight:900, color:node.color }}>{node.value}</span>
        <span style={{ fontFamily:T.font, fontSize:".6rem", color:trendColor }}>
          {node.trend === "UP" ? "↑" : node.trend === "DOWN" ? "↓" : "→"}
        </span>
      </div>
      <p style={{ fontFamily:T.body, fontSize:".9rem", color:"rgba(255,255,255,.5)", lineHeight:1.6, letterSpacing:".04em" }}>
        {node.detail}
      </p>
    </div>
  );
}

// ─── MOBILE ORBIT CARD ────────────────────────────────────────
function MobileOrbitCard({ node, active, onClick }) {
  return (
    <div
      onClick={() => onClick(node.id)}
      style={{
        flexShrink: 0,
        width:      "120px",
        padding:    "1rem .9rem",
        borderRadius: "12px",
        border:     `1px solid ${active ? node.color + "55" : node.color + "22"}`,
        background: active ? `${node.color}0d` : "rgba(0,0,0,.5)",
        backdropFilter: "blur(8px)",
        display:    "flex",
        flexDirection: "column",
        alignItems: "center",
        gap:        ".35rem",
        cursor:     "pointer",
        transition: "all .25s",
        boxShadow:  active ? `0 0 20px ${node.color}22` : "none",
        position:   "relative",
        overflow:   "hidden",
      }}
    >
      <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:`linear-gradient(to right,transparent,${node.color}${active?"55":"22"},transparent)` }}/>
      <span style={{ fontSize:"1.3rem" }}>{node.icon}</span>
      <div style={{ fontFamily:T.body, fontSize:".92rem", fontWeight:700, color:node.color, letterSpacing:".04em", display:"flex", alignItems:"center", gap:".2rem" }}>
        {node.value}
        <TrendArrow trend={node.trend} />
      </div>
      <div style={{ fontFamily:T.font, fontSize:".3rem", letterSpacing:".14em", color:"rgba(255,255,255,.38)", textAlign:"center" }}>
        {node.label}
      </div>
    </div>
  );
}

// ─── MAIN: ORBIT METRICS SYSTEM ───────────────────────────────
export function OrbitMetrics({
  score      = 82,
  confidence = 88,
  trend      = "UP",
  token      = "",
  metricsData = null,
}) {
  const [activeNode, setActiveNode] = useState(null);
  const [isMobile,   setIsMobile]   = useState(false);
  const containerRef = useRef(null);

  const nodes = buildNodes(metricsData);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 800);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const toggleNode = (id) => setActiveNode(prev => prev === id ? null : id);
  const selected   = nodes.find(n => n.id === activeNode) || null;

  // Orbit geometry
  const SIZE   = 580; // container px on desktop
  const cx     = SIZE / 2;
  const cy     = SIZE / 2;
  const ORBIT_R = 240;
  // Distribute nodes evenly, start from top
  const angles  = nodes.map((_, i) => -90 + (i * 360) / nodes.length);

  return (
    <>
      <style>{`
        /* ── SF Brand Micro-interactions ── */
      .sf-card-hover{transition:transform .28s cubic-bezier(.4,0,.2,1),border-color .28s,box-shadow .28s;will-change:transform;}
      .sf-card-hover:hover{transform:translateY(-3px);}
      .sf-btn-shimmer{position:relative;overflow:hidden;}
      .sf-btn-shimmer::after{content:'';position:absolute;top:0;left:-100%;width:50%;height:100%;background:linear-gradient(to right,transparent,rgba(255,255,255,.08),transparent);transform:skewX(-20deg);}
      .sf-btn-shimmer:hover::after{animation:sf-shimmer .55s ease;}
      .sf-btn-shimmer:active{transform:scale(.97);}
      @keyframes sf-shimmer{0%{left:-100%;}100%{left:200%;}}
      @keyframes sf-icon-pop{0%,100%{transform:scale(1);}50%{transform:scale(1.15);}}
      @keyframes sf-glow-pulse{0%,100%{opacity:.5;}50%{opacity:1;}}
      @keyframes orbit-fade-in { from{opacity:0;transform:scale(.92);} to{opacity:1;transform:scale(1);} }
        @keyframes orbit-ring-spin { to{ transform:rotate(360deg); } }
        @keyframes orbit-ring-spin-r { to{ transform:rotate(-360deg); } }
        .orbit-scroll { display:flex; gap:.7rem; overflow-x:auto; padding-bottom:.5rem; scroll-snap-type:x mandatory; -webkit-overflow-scrolling:touch; }
        .orbit-scroll::-webkit-scrollbar { height:3px; }
        .orbit-scroll::-webkit-scrollbar-track { background:rgba(0,0,0,.3); }
        .orbit-scroll::-webkit-scrollbar-thumb { background:rgba(255,180,0,.3); border-radius:99px; }
        .orbit-scroll > * { scroll-snap-align:start; }
      `}</style>

      {/* ── MOBILE LAYOUT ── */}
      {isMobile && (
        <div style={{ display:"flex", flexDirection:"column", gap:"1.2rem" }}>
          {/* Compact Reactor */}
          <div style={{ display:"flex", justifyContent:"center" }}>
            <SurvivalReactor score={score} confidence={confidence} trend={trend} token={token} metrics={[]}/>
          </div>

          {/* Orbit cards — horizontal scroll */}
          <div>
            <div style={{ fontFamily:T.font, fontSize:".38rem", letterSpacing:".28em", color:"rgba(255,180,0,.45)", marginBottom:".7rem" }}>
              ORBIT METRICS
            </div>
            <div className="orbit-scroll">
              {nodes.map(n => (
                <MobileOrbitCard key={n.id} node={n} active={activeNode===n.id} onClick={toggleNode}/>
              ))}
            </div>
          </div>

          {/* Detail panel */}
          {selected && <NodeDetail node={selected}/>}
        </div>
      )}

      {/* ── DESKTOP LAYOUT ── */}
      {!isMobile && (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"1.5rem" }}>
          {/* Orbit system container */}
          <div ref={containerRef} style={{ position:"relative", width:SIZE, height:SIZE, maxWidth:"100%" }}>

            {/* Outer orbit ring (decorative) */}
            <div style={{
              position:   "absolute",
              left:       cx - ORBIT_R - 12,
              top:        cy - ORBIT_R - 12,
              width:      (ORBIT_R + 12) * 2,
              height:     (ORBIT_R + 12) * 2,
              borderRadius: "50%",
              border:     "1px dashed rgba(255,180,0,.1)",
              animation:  "orbit-ring-spin 60s linear infinite",
              pointerEvents: "none",
            }}/>
            <div style={{
              position:   "absolute",
              left:       cx - ORBIT_R + 14,
              top:        cy - ORBIT_R + 14,
              width:      (ORBIT_R - 14) * 2,
              height:     (ORBIT_R - 14) * 2,
              borderRadius: "50%",
              border:     "1px dashed rgba(255,180,0,.06)",
              animation:  "orbit-ring-spin-r 40s linear infinite",
              pointerEvents: "none",
            }}/>

            {/* Connector lines */}
            {nodes.map((node, i) => (
              <OrbitConnector key={node.id} angle={angles[i]} orbitR={ORBIT_R} cx={cx} cy={cy} color={node.color}/>
            ))}

            {/* Reactor core — centered */}
            <div style={{ position:"absolute", left:cx - 140, top:cy - 200, width:280, zIndex:6 }}>
              <SurvivalReactor score={score} confidence={confidence} trend={trend} token={token} metrics={[]}/>
            </div>

            {/* Orbit nodes */}
            {nodes.map((node, i) => (
              <DesktopOrbitNode
                key={node.id}
                node={node}
                angle={angles[i]}
                orbitR={ORBIT_R}
                cx={cx}
                cy={cy}
                active={activeNode === node.id}
                onClick={toggleNode}
              />
            ))}
          </div>

          {/* Selected node detail */}
          {selected && (
            <div style={{ width:"100%", maxWidth:"480px" }}>
              <NodeDetail node={selected}/>
            </div>
          )}

          {/* Hint text */}
          {!selected && (
            <p style={{ fontFamily:T.body, fontSize:".82rem", color:"rgba(255,255,255,.2)", letterSpacing:".1em", textAlign:"center" }}>
              Click any orbit node to view details
            </p>
          )}
        </div>
      )}
    </>
  );
}

// ─── SURVIVAL SCORE PAGE ──────────────────────────────────────
export default function SurvivalScorePage() {
  const [inputToken, setInputToken] = useState("");
  const [token,      setToken]      = useState("");
  const [score,      setScore]      = useState(75);
  const [scanning,   setScanning]   = useState(false);
  const [scanned,    setScanned]    = useState(false);

  const handleScan = () => {
    if (!inputToken.trim()) return;
    setScanning(true);
    setScanned(false);
    setTimeout(() => {
      // Simulate scan result
      const s = 40 + Math.floor(Math.random() * 55);
      setScore(s);
      setToken(inputToken.trim().toUpperCase().replace("$",""));
      setScanning(false);
      setScanned(true);
    }, 1800);
  };

  return (
    <div style={{ minHeight:"100vh", background:T.black, color:"#fff", fontFamily:T.font, overflowX:"hidden", position:"relative", isolation:"isolate" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-track{background:#050403;} ::-webkit-scrollbar-thumb{background:#ffd70066;}
        @keyframes grid-glow{0%,100%{opacity:.015;}50%{opacity:.028;}}
        @keyframes scan-pulse{0%{transform:scaleX(0);opacity:0;}30%{opacity:1;}100%{transform:scaleX(1);opacity:0;}}
        @keyframes spin{to{transform:rotate(360deg);}}
        input::placeholder{color:rgba(255,255,255,.2);}
      `}</style>

      {/* Background */}
      <div style={{ position:"absolute", inset:0, zIndex:0, pointerEvents:"none", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(80,255,160,.012) 1px,transparent 1px),linear-gradient(90deg,rgba(80,255,160,.012) 1px,transparent 1px)", backgroundSize:"65px 65px", animation:"grid-glow 10s ease-in-out infinite" }}/>
        <div style={{ position:"absolute", top:"5%", right:"-10%", width:"600px", height:"600px", borderRadius:"50%", background:"radial-gradient(circle,rgba(80,255,160,.04),transparent 65%)" }}/>
        <div style={{ position:"absolute", bottom:"5%", left:"-10%", width:"500px", height:"500px", borderRadius:"50%", background:"radial-gradient(circle,rgba(255,100,0,.04),transparent 65%)" }}/>
      </div>

      <div style={{ position:"relative", zIndex:10, maxWidth:"1000px", margin:"0 auto", padding:"clamp(1.5rem,4vw,3rem) clamp(1rem,4vw,2rem)" }}>

        {/* Top nav */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"2.5rem", flexWrap:"wrap", gap:"1rem" }}>
          <a href="/" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:".6rem" }}>
            <div style={{ width:"28px", height:"28px", borderRadius:"50%", background:"radial-gradient(circle,#ffd700,#ff8c00)", boxShadow:"0 0 16px rgba(255,150,0,.5)" }}/>
            <span style={{ fontFamily:T.font, fontSize:".56rem", letterSpacing:".22em", color:"rgba(255,215,0,.9)" }}>$FLASH</span>
          </a>
          <div style={{ display:"flex", gap:".5rem", flexWrap:"wrap" }}>
            {[{l:"ECOSYSTEM",href:"/ecosystem"},{l:"DASHBOARD",href:"/dashboard"},{l:"ALERTS",href:"/alerts"},{l:"REPORT",href:"/report"}].map(b=>(
              <a key={b.l} href={b.href} style={{textDecoration:"none"}}>
                <button style={{ padding:".38rem .9rem", borderRadius:"6px", border:"1px solid rgba(255,255,255,.1)", background:"rgba(0,0,0,.35)", color:"rgba(255,255,255,.45)", fontFamily:T.font, fontSize:".38rem", letterSpacing:".16em", cursor:"pointer", transition:"all .2s" }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(80,255,160,.4)";e.currentTarget.style.color="rgba(80,255,160,.8)";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,.1)";e.currentTarget.style.color="rgba(255,255,255,.45)";}}>
                  {b.l}
                </button>
              </a>
            ))}
          </div>
        </div>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:"clamp(2rem,5vw,3rem)" }}>
          <div style={{ fontFamily:T.font, fontSize:".44rem", letterSpacing:".4em", color:"rgba(80,255,160,.55)", marginBottom:".8rem" }}>INTELLIGENCE MODULE</div>
          <h1 style={{ fontFamily:T.font, fontSize:"clamp(1.8rem,5vw,3rem)", fontWeight:900, background:"linear-gradient(135deg,#fff,#50ffa0,#00e5ff)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", letterSpacing:".1em", marginBottom:".8rem" }}>
            SURVIVAL REACTOR
          </h1>
          <p style={{ fontFamily:T.body, fontSize:"clamp(.9rem,2vw,1.05rem)", color:"rgba(255,255,255,.38)", letterSpacing:".1em", maxWidth:"520px", margin:"0 auto" }}>
            Real-time token safety scoring. Paste any Solana contract address to scan.
          </p>
        </div>

        {/* Input scanner */}
        <div style={{ maxWidth:"560px", margin:"0 auto 2.5rem", position:"relative" }}>
          <div style={{ display:"flex", gap:".7rem", alignItems:"center" }}>
            <div style={{ flex:1, position:"relative" }}>
              <input
                value={inputToken}
                onChange={e => setInputToken(e.target.value)}
                onKeyDown={e => e.key==="Enter" && handleScan()}
                placeholder="Paste token address or symbol…"
                style={{ width:"100%", padding:".85rem 1.2rem", borderRadius:"10px", border:"1.5px solid rgba(80,255,160,.3)", background:"rgba(0,0,0,.5)", color:"#fff", fontFamily:T.body, fontSize:"1rem", letterSpacing:".04em", outline:"none", backdropFilter:"blur(8px)", transition:"border-color .2s" }}
                onFocus={e  =>{e.target.style.borderColor="rgba(80,255,160,.65)";}}
                onBlur={e   =>{e.target.style.borderColor="rgba(80,255,160,.3)";}}
              />
              {scanning && (
                <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"2px", background:"linear-gradient(to right,transparent,rgba(80,255,160,.7),transparent)", animation:"scan-pulse 1.5s linear infinite", borderRadius:"99px" }}/>
              )}
            </div>
            <button onClick={handleScan} disabled={scanning || !inputToken.trim()}
              style={{ padding:".85rem 1.5rem", borderRadius:"10px", border:"1.5px solid rgba(80,255,160,.5)", background:"linear-gradient(135deg,rgba(80,255,160,.18),rgba(0,229,255,.1))", color:"rgba(80,255,160,.95)", fontFamily:T.font, fontSize:".52rem", letterSpacing:".18em", cursor: scanning||!inputToken.trim() ? "not-allowed" : "pointer", opacity: scanning||!inputToken.trim() ? .5 : 1, transition:"all .3s", fontWeight:700, flexShrink:0 }}
              onMouseEnter={e=>{if(!scanning&&inputToken)e.currentTarget.style.boxShadow="0 0 28px rgba(80,255,160,.25)";}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";}}>
              {scanning ? (
                <span style={{ display:"flex", alignItems:"center", gap:".5rem" }}>
                  <span style={{ width:"12px", height:"12px", borderRadius:"50%", border:"2px solid rgba(80,255,160,.3)", borderTop:"2px solid #50ffa0", display:"inline-block", animation:"spin 1s linear infinite" }}/>
                  SCANNING
                </span>
              ) : "⊙ SCAN"}
            </button>
          </div>
        </div>

        {/* Result — Orbit Metrics */}
        {scanned && !scanning && (
          <div style={{ animation:"orbit-fade-in .5s ease" }}>
            <OrbitMetrics
              score={score}
              confidence={72 + Math.floor(Math.random()*20)}
              trend={score > 70 ? "UP" : score > 50 ? "STABLE" : "DOWN"}
              token={token}
            />
          </div>
        )}

        {/* Empty state */}
        {!scanned && !scanning && (
          <div style={{ textAlign:"center", padding:"3rem 1rem", border:"1px solid rgba(80,255,160,.08)", borderRadius:"16px", background:"rgba(0,0,0,.25)" }}>
            <div style={{ fontSize:"3rem", marginBottom:"1rem", opacity:.25 }}>🛡</div>
            <p style={{ fontFamily:T.body, fontSize:"1.05rem", color:"rgba(255,255,255,.28)", letterSpacing:".1em" }}>
              Paste a contract address to generate a Survival Report
            </p>
          </div>
        )}

        {/* Link to full Report Card */}
        <div style={{ textAlign:"center", marginTop:"2rem" }}>
          <a href="/report" style={{ textDecoration:"none" }}>
            <button style={{ padding:".6rem 1.5rem", borderRadius:"8px", border:"1px solid rgba(255,180,0,.25)", background:"rgba(255,180,0,.06)", color:"rgba(255,215,0,.7)", fontFamily:T.font, fontSize:".42rem", letterSpacing:".2em", cursor:"pointer", transition:"all .3s" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,180,0,.5)";e.currentTarget.style.color="rgba(255,215,0,.9)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,180,0,.25)";e.currentTarget.style.color="rgba(255,215,0,.7)";}}>
              FULL REPORT CARD →
            </button>
          </a>
        </div>

        <div style={{ textAlign:"center", padding:"1.5rem 0", marginTop:"2rem", borderTop:"1px solid rgba(255,255,255,.05)" }}>
          <span style={{ fontFamily:T.body, fontSize:".75rem", color:"rgba(255,255,255,.18)", letterSpacing:".1em" }}>
            Solar Flash Survival Score — $FLASH on Solana — Not financial advice
          </span>
        </div>
      </div>
    </div>
  );
}
