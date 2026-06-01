/**
 * SurvivalReactor.jsx — Solar Flash Design System v1
 * Phase 1: Survival Score Reactor + Orbit Metrics
 *
 * Usage:
 *   import { SurvivalReactor } from "./src/SurvivalReactor.jsx"
 *   <SurvivalReactor score={82} status="HEALTHY" confidence={91} trend="UP" metrics={...} />
 */

import { useEffect, useRef, useState } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────
const T = {
  orange:   "#ff8c00",
  gold:     "#ffd700",
  cyan:     "#00e5ff",
  blue:     "#0080ff",
  black:    "#050403",
  danger:   "#ff3535",
  warn:     "#ff8c00",
  ok:       "#50ffa0",
  font:     "'Orbitron', monospace",
  body:     "'Rajdhani', sans-serif",
};

// ─── SCORE → VISUAL MAPPING ───────────────────────────────────
function scoreVisuals(score) {
  if (score >= 80) return { color: T.ok,     glow: "rgba(80,255,160,.55)",  label: "OPTIMAL",  ring: "#50ffa0" };
  if (score >= 60) return { color: T.gold,   glow: "rgba(255,215,0,.5)",    label: "MODERATE", ring: "#ffd700" };
  if (score >= 40) return { color: T.warn,   glow: "rgba(255,140,0,.55)",   label: "ELEVATED", ring: "#ff8c00" };
  return              { color: T.danger, glow: "rgba(255,53,53,.6)",    label: "CRITICAL", ring: "#ff3535" };
}

// ─── SVG REACTOR CORE ─────────────────────────────────────────
function ReactorSVG({ score, size = 280 }) {
  const v    = scoreVisuals(score);
  const pct  = score / 100;
  const r    = size * 0.38;
  const cx   = size / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;
  const gap  = circ - dash;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: "visible" }}>
      <defs>
        <filter id="reactor-glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="core-glow">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <radialGradient id="core-grad" cx="38%" cy="35%">
          <stop offset="0%"   stopColor={v.color} stopOpacity="0.95" />
          <stop offset="60%"  stopColor={v.color} stopOpacity="0.5" />
          <stop offset="100%" stopColor={T.black}  stopOpacity="1" />
        </radialGradient>
      </defs>

      {/* Outer faint ring */}
      <circle cx={cx} cy={cx} r={r + size*0.14} fill="none"
        stroke={`${v.color}12`} strokeWidth="1" />

      {/* Mid ring */}
      <circle cx={cx} cy={cx} r={r + size*0.07} fill="none"
        stroke={`${v.color}18`} strokeWidth="1" />

      {/* Track ring */}
      <circle cx={cx} cy={cx} r={r} fill="none"
        stroke={`${v.color}14`} strokeWidth={size * 0.04} strokeLinecap="round" />

      {/* Progress arc */}
      <circle cx={cx} cy={cx} r={r} fill="none"
        stroke={v.color} strokeWidth={size * 0.04}
        strokeDasharray={`${dash} ${gap}`}
        strokeDashoffset={circ * 0.25}
        strokeLinecap="round"
        filter="url(#reactor-glow)"
        style={{ transition: "stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)" }}
      />

      {/* Core circle */}
      <circle cx={cx} cy={cx} r={r * 0.68}
        fill="url(#core-grad)"
        filter="url(#core-glow)" />

      {/* Score text */}
      <text x={cx} y={cx - size * 0.04}
        textAnchor="middle" dominantBaseline="middle"
        fill={v.color} fontSize={size * 0.16} fontWeight="900"
        fontFamily={T.font} letterSpacing="2">
        {score}
      </text>
      <text x={cx} y={cx + size * 0.12}
        textAnchor="middle" dominantBaseline="middle"
        fill={`${v.color}80`} fontSize={size * 0.048}
        fontFamily={T.font} letterSpacing="3">
        /100
      </text>
    </svg>
  );
}

// ─── ORBIT METRIC NODE ────────────────────────────────────────
function OrbitNode({ label, value, color, icon }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: ".3rem", padding: ".6rem .8rem",
      borderRadius: "10px",
      border: `1px solid ${color}28`,
      background: `${color}08`,
      backdropFilter: "blur(8px)",
      minWidth: "80px",
      transition: "all .25s",
      cursor: "default",
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}55`; e.currentTarget.style.boxShadow = `0 0 20px ${color}20`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = `${color}28`; e.currentTarget.style.boxShadow = "none"; }}
    >
      <span style={{ fontSize: "1rem" }}>{icon}</span>
      <span style={{ fontFamily: T.font, fontSize: ".42rem", fontWeight: 700, color, letterSpacing: ".1em" }}>{value}</span>
      <span style={{ fontFamily: T.body, fontSize: ".72rem", color: "rgba(255,255,255,.35)", letterSpacing: ".05em" }}>{label}</span>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────
export function SurvivalReactor({
  score      = 75,
  status     = "MODERATE",
  confidence = 84,
  trend      = "STABLE",
  token      = "",
  metrics    = null,
}) {
  const v = scoreVisuals(score);
  const [animScore, setAnimScore] = useState(0);
  const [pulse,     setPulse]     = useState(false);

  // Count-up animation
  useEffect(() => {
    setAnimScore(0);
    let start = null;
    const dur = 1200;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setAnimScore(Math.round(ease * score));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [score]);

  // Pulse every 3s
  useEffect(() => {
    const id = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 900);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const defaultMetrics = [
    { label: "Liquidity",    value: "HIGH",   icon: "💧", color: T.cyan   },
    { label: "Holders",      value: "12.4K",  icon: "👥", color: T.gold   },
    { label: "Activity",     value: "ACTIVE", icon: "⚡", color: T.orange },
    { label: "Smart Money",  value: "YES",    icon: "🧠", color: "#b060ff" },
    { label: "Risk",         value: v.label,  icon: "🛡", color: v.color  },
  ];

  const orbitMetrics = metrics || defaultMetrics;

  const trendColor = trend === "UP" ? T.ok : trend === "DOWN" ? T.danger : T.gold;
  const trendIcon  = trend === "UP" ? "↑" : trend === "DOWN" ? "↓" : "→";

  return (
    <>
      <style>{`
        @keyframes reactor-spin { to { transform: rotate(360deg); } }
        @keyframes reactor-spin-r { to { transform: rotate(-360deg); } }
        @keyframes reactor-pulse { 0%,100%{transform:scale(1);opacity:.6;} 50%{transform:scale(1.18);opacity:1;} }
        @keyframes reactor-ping  { 0%{transform:scale(1);opacity:.7;} 100%{transform:scale(2);opacity:0;} }
        @keyframes fade-up { from{opacity:0;transform:translateY(10px);} to{opacity:1;transform:translateY(0);} }
        .reactor-orbit-ring { animation: reactor-spin 18s linear infinite; transform-origin: center; }
        .reactor-orbit-ring-r { animation: reactor-spin-r 24s linear infinite; transform-origin: center; }
        .reactor-pulse-ring { animation: reactor-pulse 3s ease-in-out infinite; }
        .orbit-metrics-wrap {
          display: flex; flex-wrap: wrap; gap: .6rem;
          justify-content: center; margin-top: 1.2rem;
        }
        @media(max-width:600px){
          .reactor-svg-wrap svg { width: 200px !important; height: 200px !important; }
          .orbit-metrics-wrap { gap: .4rem; }
          .orbit-metrics-wrap > div { min-width: 68px !important; padding: .5rem .6rem !important; }
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.4rem", animation: "fade-up .6s ease both" }}>

        {/* Token label */}
        {token && (
          <div style={{ fontFamily: T.font, fontSize: ".44rem", letterSpacing: ".35em", color: "rgba(255,255,255,.35)" }}>
            ${token} · SURVIVAL ANALYSIS
          </div>
        )}

        {/* Reactor visual */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>

          {/* Pulse ping on heartbeat */}
          {pulse && (
            <div style={{
              position: "absolute", inset: "10%", borderRadius: "50%",
              border: `1px solid ${v.color}`,
              animation: "reactor-ping .9s ease-out forwards",
              pointerEvents: "none",
            }} />
          )}

          {/* Orbit ring 1 */}
          <div className="reactor-orbit-ring" style={{ position: "absolute", inset: "-14px", borderRadius: "50%", border: `1px dashed ${v.color}22` }} />

          {/* Orbit ring 2 */}
          <div className="reactor-orbit-ring-r" style={{ position: "absolute", inset: "-28px", borderRadius: "50%", border: `1px dashed ${v.color}12` }} />

          {/* Outer glow */}
          <div className="reactor-pulse-ring" style={{
            position: "absolute", inset: "-4px", borderRadius: "50%",
            boxShadow: `0 0 40px ${v.glow}, 0 0 80px ${v.glow.replace(".55",",.15").replace(".5",",.12")}`,
            pointerEvents: "none",
          }} />

          {/* SVG arc + score */}
          <div className="reactor-svg-wrap">
            <ReactorSVG score={animScore} size={280} />
          </div>
        </div>

        {/* Status row */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.2rem", flexWrap: "wrap", justifyContent: "center" }}>
          {/* Status badge */}
          <div style={{
            padding: ".3rem .9rem", borderRadius: "50px",
            border: `1px solid ${v.color}44`, background: `${v.color}10`,
            fontFamily: T.font, fontSize: ".38rem", letterSpacing: ".25em", color: v.color,
            display: "flex", alignItems: "center", gap: ".4rem",
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: v.color, display: "inline-block", boxShadow: `0 0 8px ${v.color}` }} />
            {v.label}
          </div>

          {/* Confidence */}
          <div style={{ fontFamily: T.font, fontSize: ".36rem", letterSpacing: ".18em", color: "rgba(255,255,255,.3)" }}>
            CONFIDENCE: <span style={{ color: "rgba(255,255,255,.7)" }}>{confidence}%</span>
          </div>

          {/* Trend */}
          <div style={{ fontFamily: T.font, fontSize: ".38rem", letterSpacing: ".18em", color: trendColor }}>
            {trendIcon} {trend}
          </div>
        </div>

        {/* Confidence bar */}
        <div style={{ width: "100%", maxWidth: "280px" }}>
          <div style={{ height: "3px", borderRadius: "99px", background: "rgba(255,255,255,.07)", overflow: "hidden" }}>
            <div style={{
              width: `${confidence}%`, height: "100%",
              background: `linear-gradient(to right,${v.color}66,${v.color})`,
              borderRadius: "99px", transition: "width 1.4s ease",
            }} />
          </div>
        </div>

        {/* Orbit metrics */}
        <div className="orbit-metrics-wrap">
          {orbitMetrics.map((m, i) => (
            <OrbitNode key={i} {...m} />
          ))}
        </div>

      </div>
    </>
  );
}

// ─── THREAT RADAR ─────────────────────────────────────────────
export function ThreatRadar({ risks = null }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const angleRef  = useRef(0);

  const defaultRisks = [
    { label: "Rug Risk",       value: 0.25, color: T.danger },
    { label: "Whale Risk",     value: 0.45, color: T.warn   },
    { label: "Liquidity Risk", value: 0.30, color: T.gold   },
    { label: "Volatility",     value: 0.60, color: T.orange },
    { label: "Contract Risk",  value: 0.20, color: T.cyan   },
  ];

  const riskData = risks || defaultRisks;
  const N        = riskData.length;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx  = canvas.getContext("2d");
    const SIZE = canvas.width;
    const cx   = SIZE / 2;
    const cy   = SIZE / 2;
    const R    = SIZE * 0.4;

    const draw = () => {
      ctx.clearRect(0, 0, SIZE, SIZE);

      // Background rings
      for (let i = 1; i <= 4; i++) {
        const r = (R * i) / 4;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,180,0,.08)";
        ctx.lineWidth   = 1;
        ctx.stroke();
      }

      // Axes
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
        ctx.strokeStyle = "rgba(255,255,255,.06)";
        ctx.lineWidth   = 1;
        ctx.stroke();
      }

      // Radar sweep
      const sweepAngle = angleRef.current;
      const grad = ctx.createConicalGradient
        ? null
        : null; // fallback — just draw sweep line

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, sweepAngle - 0.6, sweepAngle);
      ctx.closePath();
      const sweepGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
      sweepGrad.addColorStop(0, "rgba(255,140,0,.0)");
      sweepGrad.addColorStop(1, "rgba(255,140,0,.12)");
      ctx.fillStyle = sweepGrad;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sweepAngle) * R, cy + Math.sin(sweepAngle) * R);
      ctx.strokeStyle = "rgba(255,180,0,.55)";
      ctx.lineWidth   = 1.5;
      ctx.stroke();

      // Risk polygon
      ctx.beginPath();
      riskData.forEach((risk, i) => {
        const a = (i / N) * Math.PI * 2 - Math.PI / 2;
        const r = R * risk.value;
        if (i === 0) ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
        else ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      });
      ctx.closePath();
      ctx.fillStyle = "rgba(255,80,0,.12)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,140,0,.5)";
      ctx.lineWidth   = 1.5;
      ctx.stroke();

      // Risk dots
      riskData.forEach((risk, i) => {
        const a = (i / N) * Math.PI * 2 - Math.PI / 2;
        const r = R * risk.value;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle   = risk.color;
        ctx.shadowColor = risk.color;
        ctx.shadowBlur  = 8;
        ctx.fill();
        ctx.shadowBlur  = 0;

        // Label
        const lx = cx + Math.cos(a) * (R + 18);
        const ly = cy + Math.sin(a) * (R + 18);
        ctx.fillStyle  = "rgba(255,255,255,.45)";
        ctx.font       = `500 9px 'Rajdhani', sans-serif`;
        ctx.textAlign  = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(risk.label, lx, ly);
      });

      // Center dot
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle   = T.orange;
      ctx.shadowColor = T.orange;
      ctx.shadowBlur  = 10;
      ctx.fill();
      ctx.shadowBlur  = 0;

      angleRef.current += 0.018;
      animRef.current   = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [riskData]);

  const maxRisk      = Math.max(...riskData.map(r => r.value));
  const overallColor = maxRisk > 0.6 ? T.danger : maxRisk > 0.4 ? T.warn : T.ok;
  const overallLabel = maxRisk > 0.6 ? "HIGH RISK" : maxRisk > 0.4 ? "MODERATE" : "LOW RISK";

  return (
    <>
      <style>{`
        @keyframes radar-fade { from{opacity:0;} to{opacity:1;} }
        .threat-radar-wrap { display:flex; flex-direction:column; align-items:center; gap:1rem; animation: radar-fade .6s ease; }
        .radar-legend { display:flex; flex-wrap:wrap; gap:.5rem; justify-content:center; max-width:320px; }
        @media(max-width:480px){ .radar-canvas{ width:200px!important; height:200px!important; } }
      `}</style>

      <div className="threat-radar-wrap">
        <canvas
          ref={canvasRef}
          width={280} height={280}
          className="radar-canvas"
          style={{ width: "280px", height: "280px" }}
        />

        {/* Overall risk badge */}
        <div style={{
          padding: ".3rem 1rem", borderRadius: "50px",
          border: `1px solid ${overallColor}44`, background: `${overallColor}10`,
          fontFamily: T.font, fontSize: ".38rem", letterSpacing: ".25em", color: overallColor,
        }}>
          {overallLabel}
        </div>

        {/* Legend */}
        <div className="radar-legend">
          {riskData.map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: ".35rem" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: r.color, boxShadow: `0 0 6px ${r.color}` }} />
              <span style={{ fontFamily: T.body, fontSize: ".78rem", color: "rgba(255,255,255,.45)", letterSpacing: ".05em" }}>
                {r.label}: <span style={{ color: r.color, fontWeight: 600 }}>{Math.round(r.value * 100)}%</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── SOLAR PULSE TIMELINE ─────────────────────────────────────
export function SolarPulseTimeline({ events = null }) {
  const defaultEvents = [
    { type: "WHALE",     label: "Whale Activity",   token: "FLASH", desc: "Large buy detected — 2.4M tokens", color: T.cyan,   icon: "🐋", ts: Date.now() - 40000   },
    { type: "SMART",     label: "Smart Money",       token: "WIF",   desc: "Alpha wallet entered position",    color: "#b060ff", icon: "🧠", ts: Date.now() - 120000  },
    { type: "LIQUIDITY", label: "Liquidity Event",   token: "BONK",  desc: "LP depth increased 34%",          color: T.ok,     icon: "💧", ts: Date.now() - 240000  },
    { type: "RISK",      label: "Risk Alert",        token: "PUMP",  desc: "Mint authority active — caution", color: T.danger, icon: "☠️", ts: Date.now() - 360000  },
    { type: "NARRATIVE", label: "Narrative Signal",  token: "AI",    desc: "AI narrative momentum +340%",     color: T.orange, icon: "📡", ts: Date.now() - 480000  },
  ];

  const timeline = events || defaultEvents;

  function ago(ts) {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return `${s}s`;
    if (s < 3600) return `${Math.floor(s / 60)}m`;
    return `${Math.floor(s / 3600)}h`;
  }

  return (
    <>
      <style>{`
        @keyframes pulse-line { 0%,100%{opacity:.3;} 50%{opacity:.7;} }
        .pulse-event { transition: all .25s; }
        .pulse-event:hover { background: rgba(255,255,255,.04) !important; }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
        {timeline.map((ev, i) => (
          <div key={i} className="pulse-event" style={{
            display: "flex", gap: "1rem", alignItems: "flex-start",
            padding: ".8rem .6rem", borderRadius: "10px",
            position: "relative",
          }}>
            {/* Vertical line */}
            {i < timeline.length - 1 && (
              <div style={{
                position: "absolute", left: "19px", top: "36px", bottom: "-8px",
                width: "1px", background: `linear-gradient(to bottom,${ev.color}33,transparent)`,
                animation: "pulse-line 3s ease-in-out infinite",
                animationDelay: `${i * .4}s`,
              }} />
            )}

            {/* Icon node */}
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
              background: `${ev.color}14`, border: `1px solid ${ev.color}40`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: ".9rem", zIndex: 1,
              boxShadow: `0 0 12px ${ev.color}22`,
            }}>
              {ev.icon}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".2rem" }}>
                <span style={{ fontFamily: T.font, fontSize: ".44rem", fontWeight: 700, color: ev.color, letterSpacing: ".1em" }}>
                  {ev.label}
                </span>
                <span style={{ fontFamily: T.body, fontSize: ".75rem", color: "rgba(255,255,255,.25)", flexShrink: 0, marginLeft: ".5rem" }}>
                  {ago(ev.ts)} ago
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: ".5rem", marginBottom: ".25rem" }}>
                <span style={{ fontFamily: T.font, fontSize: ".5rem", fontWeight: 700, color: "rgba(255,255,255,.75)" }}>
                  ${ev.token}
                </span>
              </div>
              <p style={{ fontFamily: T.body, fontSize: ".83rem", color: "rgba(255,255,255,.42)", letterSpacing: ".03em", lineHeight: 1.5 }}>
                {ev.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── INTELLIGENCE PANEL WRAPPER ───────────────────────────────
export function IntelPanel({ title, subtitle, icon, color = T.gold, children, cta = null }) {
  return (
    <>
      <style>{`
        .intel-panel { transition: border-color .3s, box-shadow .3s; }
        .intel-panel:hover { border-color: ${color}35 !important; box-shadow: 0 0 40px ${color}0e; }
      `}</style>
      <div className="intel-panel" style={{
        borderRadius: "16px",
        border: `1px solid ${color}1a`,
        background: "rgba(0,0,0,.55)",
        backdropFilter: "blur(12px)",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "1rem 1.4rem",
          borderBottom: `1px solid ${color}12`,
          background: `${color}05`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: ".7rem" }}>
            <span style={{ fontSize: "1.1rem" }}>{icon}</span>
            <div>
              <div style={{ fontFamily: T.font, fontSize: ".5rem", fontWeight: 700, color, letterSpacing: ".14em" }}>{title}</div>
              {subtitle && <div style={{ fontFamily: T.body, fontSize: ".78rem", color: "rgba(255,255,255,.3)", letterSpacing: ".06em", marginTop: ".1rem" }}>{subtitle}</div>}
            </div>
          </div>
          {/* Top-right accent line */}
          <div style={{ width: "30px", height: "2px", background: `linear-gradient(to right,${color},transparent)`, borderRadius: "99px" }} />
        </div>

        {/* Body */}
        <div style={{ padding: "1.4rem" }}>
          {children}
        </div>

        {/* CTA */}
        {cta && (
          <div style={{ padding: "0 1.4rem 1.2rem" }}>
            <a href={cta.href} style={{ textDecoration: "none" }}>
              <button style={{
                width: "100%", padding: ".6rem", borderRadius: "8px",
                border: `1px solid ${color}35`, background: `${color}08`,
                color, fontFamily: T.font, fontSize: ".4rem", letterSpacing: ".2em",
                cursor: "pointer", transition: "all .25s", fontWeight: 700,
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 24px ${color}25`; e.currentTarget.style.borderColor = `${color}66`; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = `${color}35`; }}>
                {cta.label}
              </button>
            </a>
          </div>
        )}
      </div>
    </>
  );
}

// ─── DEMO PAGE (standalone preview) ──────────────────────────
export default function ReactorDemo() {
  return (
    <div style={{ minHeight: "100vh", background: T.black, color: "#fff", padding: "2rem", fontFamily: T.font }}>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600&display=swap');`}
      </style>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <h1 style={{ textAlign: "center", marginBottom: "3rem", fontSize: "clamp(1.2rem,4vw,2rem)", background: "linear-gradient(135deg,#fff,#ffd700,#ff8c00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", letterSpacing: ".1em" }}>
          SOLAR FLASH — DESIGN SYSTEM v1
        </h1>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,340px),1fr))", gap: "1.5rem" }}>

          <IntelPanel title="SURVIVAL REACTOR" subtitle="Token health score" icon="☀️" color={T.ok}
            cta={{ label: "SCAN TOKEN →", href: "/report" }}>
            <SurvivalReactor score={82} status="OPTIMAL" confidence={91} trend="UP" token="FLASH" />
          </IntelPanel>

          <IntelPanel title="THREAT RADAR" subtitle="Risk intelligence" icon="🎯" color={T.orange}
            cta={{ label: "VIEW ALERTS →", href: "/alerts" }}>
            <ThreatRadar />
          </IntelPanel>

          <IntelPanel title="SOLAR PULSE" subtitle="Live intelligence feed" icon="⚡" color={T.cyan}
            cta={{ label: "ALL ALERTS →", href: "/alerts" }}>
            <SolarPulseTimeline />
          </IntelPanel>

        </div>
      </div>
    </div>
  );
}
