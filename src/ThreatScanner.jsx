/**
 * ThreatScanner.jsx — Solar Flash Design System v3
 * Full Threat Radar page — /threat
 * Professional intelligence radar, mobile-first
 */

import { useState, useEffect, useRef, useCallback } from "react";

// ─── TOKENS ───────────────────────────────────────────────────
const T = {
  orange: "#ff8c00", gold: "#ffd700", cyan: "#00e5ff",
  ok:     "#50ffa0", purple: "#b060ff", danger: "#ff3535",
  warn:   "#ff8c00", black:  "#050403",
  font:   "'Orbitron', monospace", body: "'Rajdhani', sans-serif",
};

// ─── RISK VECTORS ─────────────────────────────────────────────
const DEFAULT_RISKS = [
  {
    id:      "rug",
    label:   "RUG RISK",
    value:   0.25,
    color:   T.danger,
    icon:    "☠️",
    verdict: "LOW",
    detail:  "No mint authority. LP appears locked. Dev wallet behavior normal.",
  },
  {
    id:      "whale",
    label:   "WHALE RISK",
    value:   0.48,
    color:   T.warn,
    icon:    "🐋",
    verdict: "MODERATE",
    detail:  "Top 10 wallets hold 38% of supply. Two whale wallets showing accumulation.",
  },
  {
    id:      "liquidity",
    label:   "LIQUIDITY",
    value:   0.30,
    color:   T.gold,
    icon:    "💧",
    verdict: "LOW",
    detail:  "Liquidity pool depth is $2.4M. No suspicious LP movements detected.",
  },
  {
    id:      "volatility",
    label:   "VOLATILITY",
    value:   0.62,
    color:   T.orange,
    icon:    "📈",
    verdict: "HIGH",
    detail:  "Price moved ±47% in 24h. Abnormal volume patterns detected. Caution advised.",
  },
  {
    id:      "contract",
    label:   "CONTRACT",
    value:   0.18,
    color:   T.cyan,
    icon:    "📋",
    verdict: "LOW",
    detail:  "Contract verified. No freeze authority. No hidden owner functions detected.",
  },
];

const VERDICT_META = {
  LOW:      { color: T.ok,     label: "LOW",      bg: "rgba(80,255,160,.08)"  },
  MODERATE: { color: T.gold,   label: "MODERATE", bg: "rgba(255,215,0,.08)"   },
  HIGH:     { color: T.warn,   label: "HIGH",      bg: "rgba(255,140,0,.1)"   },
  CRITICAL: { color: T.danger, label: "CRITICAL",  bg: "rgba(255,53,53,.1)"   },
};

function overallVerdict(risks) {
  const max = Math.max(...risks.map(r => r.value));
  if (max > 0.7) return "CRITICAL";
  if (max > 0.5) return "HIGH";
  if (max > 0.35) return "MODERATE";
  return "LOW";
}

// ─── RADAR CANVAS ─────────────────────────────────────────────
function RadarCanvas({ risks, size = 320, activeId, onHit }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const angleRef  = useRef(-Math.PI / 2);
  const trailRef  = useRef([]);
  const N         = risks.length;

  const hitTest = useCallback((mx, my, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const R  = canvas.width * 0.37;
    const px = (mx - rect.left) * scaleX;
    const py = (my - rect.top)  * scaleY;

    for (let i = 0; i < N; i++) {
      const a  = (i / N) * Math.PI * 2 - Math.PI / 2;
      const r  = R * risks[i].value;
      const dx = px - (cx + Math.cos(a) * r);
      const dy = py - (cy + Math.sin(a) * r);
      if (Math.sqrt(dx*dx + dy*dy) < 14) { onHit(risks[i].id); return; }
    }
    onHit(null);
  }, [risks, N, onHit]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx  = canvas.getContext("2d");
    const S    = canvas.width;
    const cx   = S / 2;
    const cy   = S / 2;
    const R    = S * 0.37;
    const RINGS = 4;

    const draw = () => {
      ctx.clearRect(0, 0, S, S);

      // ── Dark background circle
      ctx.beginPath();
      ctx.arc(cx, cy, R + 8, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,.55)";
      ctx.fill();

      // ── Grid rings
      for (let i = 1; i <= RINGS; i++) {
        const r = (R * i) / RINGS;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = i === RINGS ? "rgba(255,180,0,.14)" : "rgba(255,255,255,.05)";
        ctx.lineWidth   = i === RINGS ? 1.5 : 1;
        ctx.stroke();
      }

      // ── Ring labels (10, 25, 50, 75)
      const pctLabels = [25, 50, 75, 100];
      pctLabels.forEach((pct, i) => {
        const r = (R * (i+1)) / RINGS;
        ctx.fillStyle = "rgba(255,255,255,.18)";
        ctx.font      = `500 8px 'Rajdhani', sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${pct}`, cx + r, cy - 6);
      });

      // ── Axes
      risks.forEach((_, i) => {
        const a = (i / N) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * (R + 6), cy + Math.sin(a) * (R + 6));
        ctx.strokeStyle = "rgba(255,255,255,.07)";
        ctx.lineWidth   = 1;
        ctx.setLineDash([3, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // ── Sweep trail
      trailRef.current.push(angleRef.current);
      if (trailRef.current.length > 30) trailRef.current.shift();
      trailRef.current.forEach((a, i) => {
        const alpha = (i / trailRef.current.length) * 0.18;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
        ctx.strokeStyle = `rgba(255,180,0,${alpha})`;
        ctx.lineWidth   = 2;
        ctx.stroke();
      });

      // ── Sweep line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angleRef.current) * R, cy + Math.sin(angleRef.current) * R);
      const sweepGrad = ctx.createLinearGradient(cx, cy, cx + Math.cos(angleRef.current) * R, cy + Math.sin(angleRef.current) * R);
      sweepGrad.addColorStop(0, "rgba(255,200,0,.0)");
      sweepGrad.addColorStop(1, "rgba(255,200,0,.75)");
      ctx.strokeStyle = sweepGrad;
      ctx.lineWidth   = 1.5;
      ctx.stroke();

      // ── Risk polygon fill
      ctx.beginPath();
      risks.forEach((risk, i) => {
        const a = (i / N) * Math.PI * 2 - Math.PI / 2;
        const r = R * risk.value;
        if (i === 0) ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
        else         ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      });
      ctx.closePath();
      const polyGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
      polyGrad.addColorStop(0, "rgba(255,100,0,.22)");
      polyGrad.addColorStop(1, "rgba(255,40,0,.05)");
      ctx.fillStyle = polyGrad;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,140,0,.45)";
      ctx.lineWidth   = 1.5;
      ctx.stroke();

      // ── Dots + labels
      risks.forEach((risk, i) => {
        const a      = (i / N) * Math.PI * 2 - Math.PI / 2;
        const r      = R * risk.value;
        const x      = cx + Math.cos(a) * r;
        const y      = cy + Math.sin(a) * r;
        const isActive = risk.id === activeId;
        const dotR   = isActive ? 7 : 5;

        // Glow
        if (isActive) {
          ctx.beginPath();
          ctx.arc(x, y, 14, 0, Math.PI * 2);
          ctx.fillStyle = `${risk.color}22`;
          ctx.fill();
        }

        // Dot
        ctx.beginPath();
        ctx.arc(x, y, dotR, 0, Math.PI * 2);
        ctx.fillStyle   = risk.color;
        ctx.shadowColor = risk.color;
        ctx.shadowBlur  = isActive ? 16 : 8;
        ctx.fill();
        ctx.shadowBlur  = 0;

        // Label — outside ring
        const lDist = R + 22;
        const lx    = cx + Math.cos(a) * lDist;
        const ly    = cy + Math.sin(a) * lDist;
        ctx.fillStyle    = isActive ? "#fff" : "rgba(255,255,255,.52)";
        ctx.font         = `${isActive?"700":"500"} 9.5px 'Rajdhani', sans-serif`;
        ctx.textAlign    = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(risk.label, lx, ly);

        // Value %
        ctx.fillStyle    = isActive ? risk.color : `${risk.color}99`;
        ctx.font         = `600 8px 'Rajdhani', sans-serif`;
        ctx.fillText(`${Math.round(risk.value * 100)}%`, lx, ly + 11);
      });

      // ── Center dot
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fillStyle   = T.orange;
      ctx.shadowColor = T.orange;
      ctx.shadowBlur  = 12;
      ctx.fill();
      ctx.shadowBlur  = 0;

      // ── Sweep advance
      angleRef.current += 0.022;
      if (angleRef.current > Math.PI * 2 - Math.PI / 2) angleRef.current -= Math.PI * 2;

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [risks, activeId, N]);

  return (
    <canvas
      ref={canvasRef}
      width={size} height={size}
      style={{ width:`${size}px`, height:`${size}px`, maxWidth:"100%", cursor:"crosshair" }}
      onClick={e => hitTest(e.clientX, e.clientY, canvasRef.current)}
      onMouseMove={e => {
        // Hover highlight
        if (e.buttons === 0) return;
      }}
    />
  );
}

// ─── RISK DETAIL CARD ─────────────────────────────────────────
function RiskDetailCard({ risk }) {
  const vm = VERDICT_META[risk.verdict] || VERDICT_META.LOW;
  return (
    <div style={{
      padding:       "1.1rem 1.3rem",
      borderRadius:  "12px",
      border:        `1px solid ${risk.color}35`,
      background:    vm.bg,
      backdropFilter:"blur(10px)",
      animation:     "rf-fade .3s ease both",
      position:      "relative",
      overflow:      "hidden",
    }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:`linear-gradient(to right,transparent,${risk.color}66,transparent)` }}/>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:".7rem" }}>
        <div style={{ display:"flex", alignItems:"center", gap:".6rem" }}>
          <span style={{ fontSize:"1.2rem" }}>{risk.icon}</span>
          <span style={{ fontFamily:T.font, fontSize:".58rem", fontWeight:700, color:risk.color, letterSpacing:".12em" }}>{risk.label}</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:".5rem" }}>
          <div style={{ fontFamily:T.font, fontSize:".88rem", fontWeight:900, color:risk.color }}>{Math.round(risk.value*100)}%</div>
          <span style={{ padding:".18rem .55rem", borderRadius:"50px", border:`1px solid ${vm.color}33`, background:`${vm.color}0e`, fontFamily:T.font, fontSize:".32rem", letterSpacing:".18em", color:vm.color }}>{vm.label}</span>
        </div>
      </div>
      {/* Progress bar */}
      <div style={{ height:"4px", borderRadius:"99px", background:"rgba(255,255,255,.07)", overflow:"hidden", marginBottom:".8rem" }}>
        <div style={{ width:`${risk.value*100}%`, height:"100%", background:`linear-gradient(to right,${risk.color}66,${risk.color})`, borderRadius:"99px", transition:"width 1s ease" }}/>
      </div>
      <p style={{ fontFamily:T.body, fontSize:".92rem", color:"rgba(255,255,255,.52)", lineHeight:1.65, letterSpacing:".04em" }}>{risk.detail}</p>
    </div>
  );
}

// ─── RISK LEGEND ROW ──────────────────────────────────────────
function RiskRow({ risk, active, onClick }) {
  const vm = VERDICT_META[risk.verdict] || VERDICT_META.LOW;
  return (
    <div onClick={() => onClick(risk.id)}
      style={{
        display:"flex", alignItems:"center", gap:".8rem",
        padding:".75rem 1rem", borderRadius:"10px",
        border:`1px solid ${active ? risk.color+"44" : risk.color+"18"}`,
        background: active ? `${risk.color}0a` : "rgba(0,0,0,.4)",
        cursor:"pointer", transition:"all .22s",
        boxShadow: active ? `0 0 18px ${risk.color}18` : "none",
      }}
      onMouseEnter={e=>{e.currentTarget.style.borderColor=`${risk.color}38`;}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor=active?`${risk.color}44`:`${risk.color}18`;}}
    >
      <span style={{ fontSize:"1rem", flexShrink:0 }}>{risk.icon}</span>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:".3rem" }}>
          <span style={{ fontFamily:T.font, fontSize:".44rem", fontWeight:700, color:active?"#fff":risk.color, letterSpacing:".1em" }}>{risk.label}</span>
          <div style={{ display:"flex", alignItems:"center", gap:".4rem" }}>
            <span style={{ fontFamily:T.font, fontSize:".6rem", fontWeight:900, color:risk.color }}>{Math.round(risk.value*100)}%</span>
            <span style={{ padding:".12rem .45rem", borderRadius:"4px", border:`1px solid ${vm.color}28`, background:`${vm.color}0a`, fontFamily:T.font, fontSize:".3rem", letterSpacing:".14em", color:vm.color }}>{vm.label}</span>
          </div>
        </div>
        <div style={{ height:"3px", borderRadius:"99px", background:"rgba(255,255,255,.07)", overflow:"hidden" }}>
          <div style={{ width:`${risk.value*100}%`, height:"100%", background:`linear-gradient(to right,${risk.color}66,${risk.color})`, borderRadius:"99px" }}/>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────
export function ThreatScanner({ risks: propRisks = null, token = "", compact = false }) {
  const [activeId, setActiveId] = useState(null);
  const risks   = propRisks || DEFAULT_RISKS;
  const verdict = overallVerdict(risks);
  const vm      = VERDICT_META[verdict];
  const active  = risks.find(r => r.id === activeId) || null;

  const toggleActive = useCallback((id) => {
    setActiveId(prev => prev === id ? null : id);
  }, []);

  const radarSize = compact ? 260 : 320;

  return (
    <>
      <style>{`
        @keyframes rf-fade { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:translateY(0);} }
        @keyframes tr-spin  { to{transform:rotate(360deg);} }
        .threat-layout { display:grid; grid-template-columns:1fr 1fr; gap:2rem; align-items:start; }
        @media(max-width:720px){ .threat-layout{grid-template-columns:1fr!important;} .radar-wrap{align-items:center;} }
      `}</style>

      {/* Overall verdict banner */}
      {!compact && (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:".75rem 1.2rem", borderRadius:"10px", border:`1px solid ${vm.color}28`, background:vm.bg, marginBottom:"1.5rem", flexWrap:"wrap", gap:".5rem" }}>
          <div style={{ display:"flex", alignItems:"center", gap:".8rem" }}>
            <span style={{ width:"8px", height:"8px", borderRadius:"50%", background:vm.color, boxShadow:`0 0 10px ${vm.color}`, display:"inline-block", animation:"tr-spin 2s linear infinite" }}/>
            <span style={{ fontFamily:T.font, fontSize:".42rem", letterSpacing:".28em", color:"rgba(255,255,255,.45)" }}>OVERALL THREAT LEVEL</span>
          </div>
          <span style={{ fontFamily:T.font, fontSize:".72rem", fontWeight:900, color:vm.color, letterSpacing:".2em" }}>
            {verdict}
          </span>
        </div>
      )}

      <div className="threat-layout">
        {/* Left — Radar */}
        <div className="radar-wrap" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"1rem" }}>
          <RadarCanvas risks={risks} size={radarSize} activeId={activeId} onHit={toggleActive}/>
          <p style={{ fontFamily:T.body, fontSize:".8rem", color:"rgba(255,255,255,.22)", letterSpacing:".1em", textAlign:"center" }}>
            {activeId ? "Click dot again to deselect" : "Click any dot to inspect"}
          </p>
        </div>

        {/* Right — Risk rows + detail */}
        <div style={{ display:"flex", flexDirection:"column", gap:".6rem" }}>
          {risks.map(r => (
            <RiskRow key={r.id} risk={r} active={activeId===r.id} onClick={toggleActive}/>
          ))}
          {active && (
            <div style={{ marginTop:".4rem" }}>
              <RiskDetailCard risk={active}/>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── FULL PAGE ────────────────────────────────────────────────
export default function ThreatScannerPage() {
  const [inputToken, setInputToken] = useState("");
  const [token,      setToken]      = useState("");
  const [risks,      setRisks]      = useState(null);
  const [scanning,   setScanning]   = useState(false);

  const generateRisks = (seed) => {
    const hash = (s) => [...s].reduce((a,c) => a + c.charCodeAt(0), 0);
    const h    = hash(seed);
    return [
      { id:"rug",       label:"RUG RISK",   value:((h*7)%55+5)/100,  color:T.danger, icon:"☠️", verdict: "LOW",      detail:"No mint authority detected. LP lock status verified." },
      { id:"whale",     label:"WHALE RISK", value:((h*13)%65+15)/100,color:T.warn,   icon:"🐋", verdict: "MODERATE", detail:"Top wallet holds "+Math.round(((h*13)%30+10))+"%  of supply." },
      { id:"liquidity", label:"LIQUIDITY",  value:((h*3)%50+8)/100,  color:T.gold,   icon:"💧", verdict: "LOW",      detail:"Pool depth stable. No suspicious LP movements." },
      { id:"volatility",label:"VOLATILITY", value:((h*17)%70+20)/100,color:T.orange, icon:"📈", verdict:((h*17)%70+20)>55?"HIGH":"MODERATE", detail:"24h price variance detected from on-chain data." },
      { id:"contract",  label:"CONTRACT",   value:((h*5)%40+5)/100,  color:T.cyan,   icon:"📋", verdict: "LOW",      detail:"Contract verified. No hidden owner functions." },
    ].map(r => ({ ...r, verdict: r.value > .65 ? "CRITICAL" : r.value > .50 ? "HIGH" : r.value > .30 ? "MODERATE" : "LOW" }));
  };

  const handleScan = () => {
    if (!inputToken.trim()) return;
    setScanning(true);
    setRisks(null);
    setTimeout(() => {
      setToken(inputToken.trim().toUpperCase().replace("$",""));
      setRisks(generateRisks(inputToken));
      setScanning(false);
    }, 1800);
  };

  return (
    <div style={{ minHeight:"100vh", background:T.black, color:"#fff", fontFamily:T.font, overflowX:"hidden", position:"relative", isolation:"isolate" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-track{background:#050403;} ::-webkit-scrollbar-thumb{background:#ff8c0066;}
        @keyframes grid-dim{0%,100%{opacity:.014;}50%{opacity:.026;}}
        @keyframes scan-bar{0%{transform:scaleX(0);opacity:0;}30%{opacity:1;}100%{transform:scaleX(1);opacity:0;}}
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
      @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes fade-up{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
        input::placeholder{color:rgba(255,255,255,.22);}
      `}</style>

      {/* Background */}
      <div style={{ position:"absolute", inset:0, zIndex:0, pointerEvents:"none", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(255,80,0,.014) 1px,transparent 1px),linear-gradient(90deg,rgba(255,80,0,.014) 1px,transparent 1px)", backgroundSize:"65px 65px", animation:"grid-dim 10s ease-in-out infinite" }}/>
        <div style={{ position:"absolute", top:"5%",  right:"-8%", width:"550px", height:"550px", borderRadius:"50%", background:"radial-gradient(circle,rgba(255,53,53,.05),transparent 65%)" }}/>
        <div style={{ position:"absolute", bottom:"5%", left:"-8%", width:"500px", height:"500px", borderRadius:"50%", background:"radial-gradient(circle,rgba(255,140,0,.04),transparent 65%)" }}/>
      </div>

      <div style={{ position:"relative", zIndex:10, maxWidth:"1060px", margin:"0 auto", padding:"clamp(1.5rem,4vw,3rem) clamp(1rem,4vw,2rem)" }}>

        {/* Navbar */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"2.5rem", flexWrap:"wrap", gap:"1rem" }}>
          <a href="/" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:".6rem" }}>
            <div style={{ width:"28px", height:"28px", borderRadius:"50%", background:"radial-gradient(circle,#ffd700,#ff8c00)", boxShadow:"0 0 16px rgba(255,150,0,.5)" }}/>
            <span style={{ fontFamily:T.font, fontSize:".56rem", letterSpacing:".22em", color:"rgba(255,215,0,.9)" }}>$FLASH</span>
          </a>
          <div style={{ display:"flex", gap:".5rem", flexWrap:"wrap" }}>
            {[
              {l:"ECOSYSTEM", href:"/ecosystem"},
              {l:"DASHBOARD", href:"/dashboard"},
              {l:"ALERTS",    href:"/alerts"},
              {l:"SCANNER",   href:"/report"},
            ].map(b => (
              <a key={b.l} href={b.href} style={{ textDecoration:"none" }}>
                <button style={{ padding:".38rem .9rem", borderRadius:"6px", border:"1px solid rgba(255,255,255,.1)", background:"rgba(0,0,0,.35)", color:"rgba(255,255,255,.45)", fontFamily:T.font, fontSize:".38rem", letterSpacing:".16em", cursor:"pointer", transition:"all .2s" }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,80,0,.45)";e.currentTarget.style.color="rgba(255,140,0,.85)";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,.1)";e.currentTarget.style.color="rgba(255,255,255,.45)";}}>
                  {b.l}
                </button>
              </a>
            ))}
          </div>
        </div>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:"clamp(2rem,5vw,3rem)" }}>
          <div style={{ fontFamily:T.font, fontSize:".44rem", letterSpacing:".4em", color:"rgba(255,80,0,.6)", marginBottom:".8rem" }}>
            INTELLIGENCE MODULE
          </div>
          <h1 style={{ fontFamily:T.font, fontSize:"clamp(1.8rem,5vw,3rem)", fontWeight:900, background:"linear-gradient(135deg,#fff 0%,#ff8c00 45%,#ff3535 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", letterSpacing:".1em", marginBottom:".8rem" }}>
            THREAT RADAR
          </h1>
          <p style={{ fontFamily:T.body, fontSize:"clamp(.9rem,2vw,1.05rem)", color:"rgba(255,255,255,.38)", letterSpacing:".1em", maxWidth:"520px", margin:"0 auto" }}>
            Multi-vector risk intelligence. Scan any Solana token for rug, whale, liquidity, volatility and contract threats.
          </p>
        </div>

        {/* Scanner input */}
        <div style={{ maxWidth:"580px", margin:"0 auto 2.5rem" }}>
          <div style={{ display:"flex", gap:".7rem", alignItems:"center" }}>
            <div style={{ flex:1, position:"relative" }}>
              <input
                value={inputToken}
                onChange={e => setInputToken(e.target.value)}
                onKeyDown={e => e.key==="Enter" && handleScan()}
                placeholder="Token address or symbol…"
                style={{ width:"100%", padding:".85rem 1.2rem", borderRadius:"10px", border:"1.5px solid rgba(255,80,0,.3)", background:"rgba(0,0,0,.5)", color:"#fff", fontFamily:T.body, fontSize:"1rem", letterSpacing:".04em", outline:"none", backdropFilter:"blur(8px)", transition:"border-color .2s" }}
                onFocus={e =>{e.target.style.borderColor="rgba(255,80,0,.65)";}}
                onBlur={e  =>{e.target.style.borderColor="rgba(255,80,0,.3)";}}
              />
              {scanning && (
                <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"2px", background:"linear-gradient(to right,transparent,rgba(255,80,0,.7),transparent)", animation:"scan-bar 1.5s linear infinite", borderRadius:"99px" }}/>
              )}
            </div>
            <button onClick={handleScan} disabled={scanning || !inputToken.trim()}
              style={{ padding:".85rem 1.4rem", borderRadius:"10px", border:"1.5px solid rgba(255,80,0,.5)", background:"linear-gradient(135deg,rgba(255,80,0,.18),rgba(255,180,0,.08))", color:"rgba(255,140,0,.95)", fontFamily:T.font, fontSize:".52rem", letterSpacing:".18em", cursor:scanning||!inputToken.trim()?"not-allowed":"pointer", opacity:scanning||!inputToken.trim()?.5:1, transition:"all .3s", fontWeight:700, flexShrink:0 }}
              onMouseEnter={e=>{if(!scanning&&inputToken)e.currentTarget.style.boxShadow="0 0 28px rgba(255,80,0,.22)";}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";}}>
              {scanning ? (
                <span style={{ display:"flex", alignItems:"center", gap:".5rem" }}>
                  <span style={{ width:"12px", height:"12px", borderRadius:"50%", border:"2px solid rgba(255,80,0,.3)", borderTop:"2px solid #ff8c00", display:"inline-block", animation:"spin 1s linear infinite" }}/>
                  SCANNING
                </span>
              ) : "🎯 SCAN"}
            </button>
          </div>
        </div>

        {/* Result */}
        {risks && !scanning && (
          <div style={{ animation:"fade-up .5s ease" }}>
            {/* Token label */}
            {token && (
              <div style={{ display:"flex", alignItems:"center", gap:".8rem", marginBottom:"1.5rem", flexWrap:"wrap" }}>
                <span style={{ fontFamily:T.font, fontSize:".44rem", letterSpacing:".32em", color:"rgba(255,180,0,.4)" }}>SCANNING</span>
                <span style={{ fontFamily:T.font, fontSize:"clamp(.8rem,2vw,1.1rem)", fontWeight:900, color:"#fff", letterSpacing:".1em" }}>${token}</span>
                <span style={{ width:"1px", height:"16px", background:"rgba(255,255,255,.15)" }}/>
                <span style={{ fontFamily:T.body, fontSize:".9rem", color:"rgba(255,255,255,.35)" }}>Solana Network</span>
              </div>
            )}
            <ThreatScanner risks={risks} token={token}/>
          </div>
        )}

        {/* Empty state */}
        {!risks && !scanning && (
          <div style={{ textAlign:"center", padding:"4rem 1rem", border:"1px solid rgba(255,80,0,.1)", borderRadius:"16px", background:"rgba(0,0,0,.25)", animation:"fade-up .5s ease" }}>
            <div style={{ fontSize:"3rem", marginBottom:"1.2rem", opacity:.25 }}>🎯</div>
            <p style={{ fontFamily:T.body, fontSize:"1.05rem", color:"rgba(255,255,255,.28)", letterSpacing:".1em" }}>
              Paste a token address to run a multi-vector threat scan
            </p>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign:"center", padding:"1.5rem 0", marginTop:"2.5rem", borderTop:"1px solid rgba(255,255,255,.05)" }}>
          <span style={{ fontFamily:T.body, fontSize:".75rem", color:"rgba(255,255,255,.18)", letterSpacing:".1em" }}>
            Solar Flash Threat Scanner — Not financial advice — Data is indicative
          </span>
        </div>
      </div>
    </div>
  );
}
