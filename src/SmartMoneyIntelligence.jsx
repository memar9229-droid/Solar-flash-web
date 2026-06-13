/**
 * SmartMoneyIntelligence.jsx — Solar Flash Phase 2
 * Smart Money Intelligence Engine V2
 * Route: /smart-money
 *
 * V2 Additions:
 *   - Capital Conviction Score (0-100)
 *   - Smart Money Confidence (Low/Medium/High/Very High)
 *   - Accumulation History (Increasing/Stable/Decreasing)
 *   - Distribution Detection (Soft/Aggressive/Neutral)
 *   - Sector Capital Rotation V2
 *   - Wallet Cluster Intelligence V2
 *   - AI Capital Intelligence (4-layer)
 *   - Alpha Engine data exports
 */

import { useState, useEffect, useRef, useMemo, useCallback } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────
const T = {
  orange: "#ff8c00", gold: "#ffd700", cyan: "#00e5ff",
  ok:     "#50ffa0", purple: "#b060ff", danger:"#ff3535",
  blue:   "#0080ff", black: "#050403",
  font:   "'Orbitron', monospace",
  body:   "'Rajdhani', sans-serif",
};

// ─── INTELLIGENCE DATA ────────────────────────────────────────
const SECTORS = [
  {
    id:"ai",       name:"AI",           icon:"🧠", color:T.cyan,
    smScore:91,    flow:"Strong Inflow",  accum:"Aggressive Accumulation",
    momentum:"Rising",   change7d:+22,  dominance:24, risk:"Low",
    topCluster:"High Conviction",       orbitalAngle:315,
    activity:"Very High",  signal:"Smart wallets building large positions across AI infra tokens. Coordination detected.",
  },
  {
    id:"depin",    name:"DePIN",         icon:"📡", color:T.ok,
    smScore:78,    flow:"Strong Inflow",  accum:"Accumulation",
    momentum:"Rising",   change7d:+15,  dominance:12, risk:"Low",
    topCluster:"Growth Cluster",         orbitalAngle:0,
    activity:"High",    signal:"Consistent accumulation from growth-oriented wallets. Early cycle behavior.",
  },
  {
    id:"rwa",      name:"RWA",           icon:"🏛", color:T.gold,
    smScore:72,    flow:"Moderate Inflow",accum:"Accumulation",
    momentum:"Rising",   change7d:+11,  dominance:10, risk:"Low",
    topCluster:"High Conviction",        orbitalAngle:45,
    activity:"High",    signal:"Institutional-tier wallets adding exposure. Long-term positioning pattern.",
  },
  {
    id:"infra",    name:"Infrastructure",icon:"🔧", color:"#00b4d8",
    smScore:65,    flow:"Moderate Inflow",accum:"Accumulation",
    momentum:"Stable",   change7d:+5,   dominance:11, risk:"Low",
    topCluster:"Growth Cluster",         orbitalAngle:90,
    activity:"Moderate",signal:"Steady accumulation from protocol-native wallets. Low noise ratio.",
  },
  {
    id:"layer1",   name:"Layer 1",       icon:"⛓", color:T.purple,
    smScore:58,    flow:"Neutral",        accum:"Neutral",
    momentum:"Stable",   change7d:+2,   dominance:18, risk:"Moderate",
    topCluster:"Speculative",            orbitalAngle:135,
    activity:"Moderate",signal:"Rotation within L1s. Net smart money position near flat. Watch SOL divergence.",
  },
  {
    id:"defi",     name:"DeFi",          icon:"⚡", color:T.orange,
    smScore:48,    flow:"Moderate Outflow",accum:"Neutral",
    momentum:"Stable",   change7d:-1,   dominance:14, risk:"Moderate",
    topCluster:"Speculative",            orbitalAngle:180,
    activity:"Moderate",signal:"Capital rotating out toward AI and DePIN. TVL stable but smart wallet exits increasing.",
  },
  {
    id:"gaming",   name:"Gaming",        icon:"🎮", color:"#e040fb",
    smScore:54,    flow:"Moderate Inflow",accum:"Accumulation",
    momentum:"Rising",   change7d:+8,   dominance:7,  risk:"Moderate",
    topCluster:"Speculative",            orbitalAngle:225,
    activity:"Moderate",signal:"Early accumulation cycle restarting. Smart wallets with prior gaming wins re-entering.",
  },
  {
    id:"layer2",   name:"Layer 2",       icon:"⬡", color:"#90caf9",
    smScore:35,    flow:"Moderate Outflow",accum:"Distribution",
    momentum:"Falling",  change7d:-6,   dominance:8,  risk:"Elevated",
    topCluster:"Distribution",           orbitalAngle:270,
    activity:"Low",     signal:"Persistent distribution from informed wallets. Token unlock pressure. Avoid large positions.",
  },
  {
    id:"meme",     name:"Memecoins",     icon:"🐸", color:"#ffd54f",
    smScore:18,    flow:"Strong Outflow", accum:"Aggressive Distribution",
    momentum:"Falling",  change7d:-14,  dominance:11, risk:"High",
    topCluster:"Distribution",           orbitalAngle:248,
    activity:"High",    signal:"High volume but smart money net short. Volume is retail, not conviction. Avoid.",
  },
];

const CLUSTERS = [
  {
    id:"hc",   name:"High Conviction",  icon:"⊙", color:T.cyan,
    size:47,   behavior:"Accumulation",  conviction:92,
    sectors:["ai","rwa"],
    desc:"Large, persistent positions. Low turnover. Long holding periods. Characteristic of informed institutional-type wallets.",
    signal:"Building AI Infrastructure and RWA exposure over 30+ day horizon.",
  },
  {
    id:"gc",   name:"Growth Cluster",   icon:"↑", color:T.ok,
    size:134,  behavior:"Accumulation",  conviction:74,
    sectors:["depin","infra"],
    desc:"Medium-sized wallets with high hit rate. Active rotation within themes. Risk-managed accumulation.",
    signal:"Rotating from DeFi into DePIN and Infrastructure. Pattern suggests 2-4 week accumulation cycle.",
  },
  {
    id:"sp",   name:"Speculative",      icon:"◈", color:T.gold,
    size:312,  behavior:"Neutral",       conviction:45,
    sectors:["gaming","layer1","defi"],
    desc:"Higher frequency, shorter holding periods. Trend-following behavior. Signal quality lower but momentum-relevant.",
    signal:"Mixed signals. Some gaming entry offsetting DeFi exits. Watch for directional clarity.",
  },
  {
    id:"dt",   name:"Distribution",     icon:"↓", color:T.danger,
    size:89,   behavior:"Distribution",  conviction:68,
    sectors:["layer2","meme"],
    desc:"Systematic exit from positions over multiple weeks. Historically accurate at identifying cycle peaks.",
    signal:"Continued exit from Layer 2 and Memecoins. Methodical, not panic. Cycle exhaustion signal.",
  },
];

const ROTATION_FLOWS = [
  { from:"defi",   to:"ai",    strength:0.85, label:"DeFi → AI"     },
  { from:"meme",   to:"depin", strength:0.72, label:"Meme → DePIN"  },
  { from:"layer2", to:"rwa",   strength:0.61, label:"L2 → RWA"      },
  { from:"defi",   to:"infra", strength:0.55, label:"DeFi → Infra"  },
  { from:"meme",   to:"gaming",strength:0.42, label:"Meme → Gaming" },
  { from:"layer2", to:"ai",    strength:0.38, label:"L2 → AI"       },
];


// ─── V2: CONVICTION BANDS ─────────────────────────────────────
const CONVICTION_BAND = {
  "Very High": { color:"#00e5ff",  min:80, label:"VERY HIGH", desc:"Persistent, coordinated, high-size accumulation"  },
  "High":      { color:"#50ffa0",  min:65, label:"HIGH",      desc:"Consistent accumulation with strong persistence"    },
  "Medium":    { color:"#ffd700",  min:45, label:"MEDIUM",    desc:"Mixed signals — moderate conviction observed"       },
  "Low":       { color:"#ff8c00",  min:0,  label:"LOW",       desc:"Weak or inconsistent smart money participation"     },
};

function convictionBand(score) {
  if (score >= 80) return CONVICTION_BAND["Very High"];
  if (score >= 65) return CONVICTION_BAND["High"];
  if (score >= 45) return CONVICTION_BAND["Medium"];
  return CONVICTION_BAND["Low"];
}

// ─── V2: ACCUMULATION HISTORY ─────────────────────────────────
const ACCUM_HISTORY = {
  Increasing:  { color:"#50ffa0", icon:"↑↑", desc:"Smart money building positions over time"  },
  Stable:      { color:"#ffd700", icon:"→",  desc:"Position sizes holding steady"             },
  Decreasing:  { color:"#ff8c00", icon:"↓",  desc:"Gradual reduction in exposure"             },
};

// ─── V2: DISTRIBUTION STATUS ──────────────────────────────────
const DIST_STATUS = {
  "Neutral":                { color:"rgba(255,255,255,.5)", icon:"○",  label:"NEUTRAL"               },
  "Soft Distribution":      { color:"#ffaa00",              icon:"◐",  label:"SOFT DISTRIBUTION"     },
  "Aggressive Distribution":{ color:"#ff3535",              icon:"●",  label:"AGGRESSIVE DIST."      },
};

// ─── DERIVED INTELLIGENCE ─────────────────────────────────────
function deriveIntelligence(sectors) {
  const totalSM   = sectors.reduce((s,n) => s + n.smScore, 0);
  const avgSM     = Math.round(totalSM / sectors.length);
  const accum     = sectors.filter(n => n.smScore > 65).length;
  const distrib   = sectors.filter(n => n.smScore < 40).length;
  const rising    = sectors.filter(n => n.momentum === "Rising").length;

  const overall   = avgSM >= 70 ? "Accumulation"
    : avgSM >= 50 ? "Neutral"
    : "Distribution";

  const risk      = distrib >= 3 ? "Elevated"
    : distrib >= 2 ? "Moderate"
    : "Low";

  const flow      = avgSM >= 70 ? "Strong Inflow"
    : avgSM >= 55 ? "Moderate Inflow"
    : avgSM >= 45 ? "Neutral"
    : avgSM >= 30 ? "Moderate Outflow"
    : "Strong Outflow";

  return { avgSM, accum, distrib, rising, overall, risk, flow };
}

function generateAI(sectors, intel) {
  const top    = [...sectors].sort((a,b)=>b.smScore-a.smScore).slice(0,3);
  const bot    = [...sectors].sort((a,b)=>a.smScore-b.smScore).slice(0,2);
  const topNames = top.map(s=>s.name).join(", ");
  const botNames = bot.map(s=>s.name).join(" and ");

  return {
    summary: `Smart money capital continues flowing toward ${topNames}. Accumulation behavior is persistent and structured — characteristic of informed positioning rather than speculative momentum. ${botNames} show sustained distribution patterns consistent with late-cycle exhaustion.`,
    interpretation: `Capital rotation is orderly and measurable. High Conviction clusters are building multi-sector AI and infrastructure exposure over extended timeframes. Distribution clusters are systematically reducing speculative exposure — a historically accurate signal of narrative fatigue.`,
    risk: intel.risk === "Low"
      ? "Risk assessment: LOW. Smart money behavior is constructive. No abnormal concentration patterns or rapid unwinding detected. Capital flows are diversified across 3+ sectors."
      : intel.risk === "Moderate"
      ? "Risk assessment: MODERATE. Some distribution in fringe sectors. Concentration increasing in AI narrative. Monitor for rotation acceleration."
      : "Risk assessment: ELEVATED. Multiple distribution signals active. Smart money reducing broad exposure. Position sizing discipline recommended.",
    conclusion: `Intelligence conclusion: Market attention is concentrating. AI Infrastructure and DePIN are absorbing the majority of smart capital inflow. Emerging signals in Gaming suggest early-cycle positioning. Overall smart money posture: ${intel.overall.toUpperCase()}.`,
  };
}

// ─── HELPERS ──────────────────────────────────────────────────
const FLOW_COLORS = {
  "Strong Inflow":    { color:T.ok,     glow:`rgba(80,255,160,.5)`,  label:"STRONG INFLOW"    },
  "Moderate Inflow":  { color:T.cyan,   glow:`rgba(0,229,255,.4)`,   label:"MODERATE INFLOW"  },
  "Neutral":          { color:"rgba(255,255,255,.5)", glow:"rgba(255,255,255,.2)", label:"NEUTRAL" },
  "Moderate Outflow": { color:T.orange, glow:`rgba(255,140,0,.4)`,   label:"MODERATE OUTFLOW" },
  "Strong Outflow":   { color:T.danger, glow:`rgba(255,53,53,.5)`,   label:"STRONG OUTFLOW"   },
};

const ACCUM_COLORS = {
  "Aggressive Accumulation": { color:T.ok,     icon:"⬆⬆" },
  "Accumulation":            { color:T.cyan,   icon:"⬆"  },
  "Neutral":                 { color:"rgba(255,255,255,.5)", icon:"→" },
  "Distribution":            { color:T.orange, icon:"⬇"  },
  "Aggressive Distribution": { color:T.danger, icon:"⬇⬇" },
};

const RISK_META = {
  "Low":      { color:T.ok,     label:"LOW RISK"      },
  "Moderate": { color:T.gold,   label:"MODERATE RISK" },
  "Elevated": { color:T.orange, label:"ELEVATED RISK"  },
  "High":     { color:T.danger, label:"HIGH RISK"      },
};

function LiveDot({ color, size=7 }) {
  return (
    <span style={{ position:"relative", display:"inline-flex", width:size, height:size, flexShrink:0 }}>
      <span style={{ position:"absolute", inset:0, borderRadius:"50%", background:color, opacity:.65, animation:"sm-ping 1.5s ease-out infinite" }}/>
      <span style={{ position:"relative", width:"100%", height:"100%", borderRadius:"50%", background:color, boxShadow:`0 0 6px ${color}88` }}/>
    </span>
  );
}

function ScoreRing({ score, color, size=140, label="" }) {
  const r   = size * 0.4;
  const circ = 2 * Math.PI * r;
  const dash = circ * (score / 100);
  return (
    <div style={{ position:"relative", width:size, height:size, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position:"absolute", transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth={size*0.045}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={size*0.045}
          strokeDasharray={`${dash} ${circ-dash}`} strokeLinecap="round"
          style={{ filter:`drop-shadow(0 0 6px ${color})`, transition:"stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)" }}/>
      </svg>
      <div style={{ textAlign:"center", zIndex:1 }}>
        <div style={{ fontFamily:T.font, fontSize:size*0.2+"px", fontWeight:900, color, lineHeight:1, textShadow:`0 0 20px ${color}88` }}>{score}</div>
        {label && <div style={{ fontFamily:T.font, fontSize:size*0.065+"px", color:"rgba(255,255,255,.35)", letterSpacing:".1em", marginTop:"2px" }}>{label}</div>}
      </div>
    </div>
  );
}

// ─── SMART MONEY CORE (Central Reactor) ───────────────────────
function SmartMoneyCore({ intel, sectors }) {
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    const id = setInterval(() => { setPulse(true); setTimeout(() => setPulse(false), 1200); }, 3500);
    return () => clearInterval(id);
  }, []);

  const fc = FLOW_COLORS[intel.flow] || FLOW_COLORS.Neutral;
  const ac = ACCUM_COLORS[intel.overall] || ACCUM_COLORS.Neutral;
  const energyScale = intel.avgSM / 100;

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"1.4rem" }}>
      {/* Reactor */}
      <div style={{ position:"relative", width:"280px", height:"280px", display:"flex", alignItems:"center", justifyContent:"center" }}>
        {/* Outer orbit rings */}
        <div style={{ position:"absolute", inset:"-32px", borderRadius:"50%", border:`1px dashed ${fc.color}22`, animation:"sm-spin 40s linear infinite", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", inset:"-16px", borderRadius:"50%", border:`1px dashed ${fc.color}18`, animation:"sm-spin-r 28s linear infinite", pointerEvents:"none" }}/>
        {/* Energy field */}
        <div style={{
          position:"absolute", inset:"12px", borderRadius:"50%",
          boxShadow:`0 0 ${40*energyScale}px ${fc.glow}, 0 0 ${80*energyScale}px ${fc.glow.replace(".5",",.1").replace(".4",",.1").replace(".2",",.05")}`,
          animation:"sm-breathe 4s ease-in-out infinite", pointerEvents:"none",
          opacity: 0.5 + energyScale * 0.5,
        }}/>
        {/* Ping ring on pulse */}
        {pulse && (
          <div style={{ position:"absolute", inset:"20%", borderRadius:"50%", border:`1.5px solid ${fc.color}`, animation:"sm-ping-ring 1.2s ease-out forwards", pointerEvents:"none" }}/>
        )}
        {/* Inner glow circle */}
        <div style={{ position:"absolute", inset:"25%", borderRadius:"50%", background:`radial-gradient(circle at 40% 35%,${fc.color}28,rgba(0,0,0,.8))`, border:`1px solid ${fc.color}22` }}/>
        {/* Score ring */}
        <ScoreRing score={intel.avgSM} color={fc.color} size={220} label="SM SCORE"/>
      </div>

      {/* Status badges */}
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:".6rem", width:"100%" }}>
        {/* Flow badge */}
        <div style={{ display:"flex", alignItems:"center", gap:".6rem", padding:".4rem 1.2rem", borderRadius:"50px", border:`1px solid ${fc.color}44`, background:`${fc.color}0e`, width:"100%", justifyContent:"center" }}>
          <LiveDot color={fc.color} size={7}/>
          <span style={{ fontFamily:T.font, fontSize:".44rem", fontWeight:700, color:fc.color, letterSpacing:".2em" }}>{fc.label}</span>
        </div>
        {/* Accumulation status */}
        <div style={{ display:"flex", alignItems:"center", gap:".5rem", padding:".35rem 1rem", borderRadius:"50px", border:`1px solid ${ac.color}35`, background:`${ac.color}0a` }}>
          <span style={{ fontFamily:T.font, fontSize:".65rem", color:ac.color }}>{ac.icon}</span>
          <span style={{ fontFamily:T.font, fontSize:".38rem", color:ac.color, letterSpacing:".16em" }}>{intel.overall.toUpperCase()}</span>
        </div>
        {/* Stats row */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:".5rem", width:"100%" }}>
          {[
            { label:"ACCUMULATING", val:intel.accum,   color:T.ok     },
            { label:"DISTRIBUTING", val:intel.distrib, color:T.danger  },
            { label:"RISING MOM.",  val:intel.rising,  color:T.cyan   },
          ].map((s,i) => (
            <div key={i} style={{ padding:".55rem .5rem", borderRadius:"8px", border:`1px solid ${s.color}18`, background:`${s.color}07`, textAlign:"center" }}>
              <div style={{ fontFamily:T.font, fontSize:".28rem", letterSpacing:".14em", color:"rgba(255,255,255,.28)", marginBottom:".25rem" }}>{s.label}</div>
              <div style={{ fontFamily:T.font, fontSize:".85rem", fontWeight:900, color:s.color }}>{s.val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── CAPITAL ORBIT NETWORK (SVG — Desktop) ────────────────────
function CapitalOrbitNetwork({ sectors, onSelect, selected }) {
  const W   = 560;
  const H   = 500;
  const cx  = W / 2;
  const cy  = H / 2;
  const ORB = 190;

  // Position each sector on orbit
  const positioned = sectors.map(s => {
    const a = (s.orbitalAngle * Math.PI) / 180;
    return {
      ...s,
      x: cx + ORB * Math.cos(a),
      y: cy + ORB * Math.sin(a),
    };
  });

  // Draw rotation flow arcs
  const flows = ROTATION_FLOWS.map(f => {
    const from = positioned.find(p => p.id === f.from);
    const to   = positioned.find(p => p.id === f.to);
    if (!from || !to) return null;
    const mx = (from.x + to.x) / 2 + (to.y - from.y) * 0.3;
    const my = (from.y + to.y) / 2 - (to.x - from.x) * 0.3;
    return { ...f, from, to, mx, my };
  }).filter(Boolean);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", maxWidth:`${W}px`, height:"auto", overflow:"visible" }}>
      <defs>
        {ROTATION_FLOWS.map((f,i) => (
          <marker key={i} id={`arrow-${i}`} viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M 0 0 L 8 4 L 0 8 z" fill={`rgba(255,200,80,${f.strength*0.7})`}/>
          </marker>
        ))}
      </defs>

      {/* Orbit ring */}
      <circle cx={cx} cy={cy} r={ORB} fill="none" stroke="rgba(255,180,0,.06)" strokeWidth="1" strokeDasharray="4 8"/>

      {/* Inner glow */}
      <circle cx={cx} cy={cy} r={ORB*0.55} fill="none" stroke="rgba(255,180,0,.04)" strokeWidth="1" strokeDasharray="2 10"/>

      {/* Capital flow arcs */}
      {flows.map((f,i) => (
        <g key={i}>
          <path
            d={`M ${f.from.x} ${f.from.y} Q ${f.mx} ${f.my} ${f.to.x} ${f.to.y}`}
            fill="none"
            stroke={`rgba(255,200,80,${f.strength*0.35})`}
            strokeWidth={f.strength*2.5}
            strokeLinecap="round"
            markerEnd={`url(#arrow-${i})`}
          />
          {/* Flow label */}
          <text x={f.mx} y={f.my-6} textAnchor="middle"
            fill={`rgba(255,200,80,${f.strength*0.6})`}
            fontSize="8" fontFamily="'Orbitron',monospace" letterSpacing="0.5">
            {f.label}
          </text>
        </g>
      ))}

      {/* Connection lines from center */}
      {positioned.filter(s => s.smScore > 65).map((s,i) => (
        <line key={i}
          x1={cx} y1={cy} x2={s.x} y2={s.y}
          stroke={`${s.color}18`} strokeWidth="1" strokeDasharray="3 6"
        />
      ))}

      {/* Center core */}
      <circle cx={cx} cy={cy} r={38} fill="rgba(0,0,0,.7)" stroke="rgba(255,180,0,.25)" strokeWidth="1.5"/>
      <circle cx={cx} cy={cy} r={26} fill="rgba(0,0,0,.8)" stroke="rgba(255,180,0,.15)" strokeWidth="1">
        <animate attributeName="r" values="26;29;26" dur="3s" repeatCount="indefinite"/>
      </circle>
      <text x={cx} y={cy-7} textAnchor="middle" fill="rgba(255,215,0,.9)" fontSize="9"
        fontFamily="'Orbitron',monospace" fontWeight="700" letterSpacing="1">SMART</text>
      <text x={cx} y={cy+8} textAnchor="middle" fill="rgba(255,215,0,.9)" fontSize="9"
        fontFamily="'Orbitron',monospace" fontWeight="700" letterSpacing="1">MONEY</text>

      {/* Sector nodes */}
      {positioned.map(s => {
        const isSelected = selected === s.id;
        const r = 22 + (s.smScore / 100) * 10;
        const fc = FLOW_COLORS[s.flow] || FLOW_COLORS.Neutral;
        return (
          <g key={s.id} style={{ cursor:"pointer" }} onClick={() => onSelect(isSelected ? null : s.id)}>
            {/* Pulse ring */}
            {s.smScore > 65 && (
              <circle cx={s.x} cy={s.y} r={r+8} fill="none" stroke={`${s.color}33`} strokeWidth="1">
                <animate attributeName="r" values={`${r+4};${r+14};${r+4}`} dur={`${3+Math.random()}s`} repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.6;0;0.6" dur={`${3+Math.random()}s`} repeatCount="indefinite"/>
              </circle>
            )}
            {/* Node circle */}
            <circle cx={s.x} cy={s.y} r={isSelected ? r+4 : r}
              fill={isSelected ? `${s.color}22` : "rgba(0,0,0,.75)"}
              stroke={isSelected ? s.color : `${s.color}55`}
              strokeWidth={isSelected ? 2 : 1.5}
              style={{ filter: isSelected ? `drop-shadow(0 0 10px ${s.color})` : `drop-shadow(0 0 4px ${s.color}44)`, transition:"all .3s" }}/>
            {/* Icon */}
            <text x={s.x} y={s.y-4} textAnchor="middle" dominantBaseline="middle" fontSize="14">{s.icon}</text>
            {/* Score */}
            <text x={s.x} y={s.y+10} textAnchor="middle" fill={s.color} fontSize="9"
              fontFamily="'Orbitron',monospace" fontWeight="700">{s.smScore}</text>
            {/* Name label */}
            <text x={s.x} y={s.y + r + 14} textAnchor="middle"
              fill={isSelected ? "#fff" : "rgba(255,255,255,.55)"} fontSize="8"
              fontFamily="'Orbitron',monospace" letterSpacing="0.5">
              {s.name.split(" ")[0].toUpperCase()}
            </text>
            {/* Flow indicator dot */}
            <circle cx={s.x+r-4} cy={s.y-r+4} r={4} fill={fc.color}>
              <animate attributeName="opacity" values="1;0.3;1" dur="1.8s" repeatCount="indefinite"/>
            </circle>
          </g>
        );
      })}
    </svg>
  );
}

// ─── SECTOR DETAIL PANEL ──────────────────────────────────────
function SectorDetail({ sector }) {
  if (!sector) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", gap:"1rem", opacity:.4 }}>
      <span style={{ fontSize:"2rem" }}>⊙</span>
      <span style={{ fontFamily:T.body, fontSize:".9rem", color:"rgba(255,255,255,.5)", letterSpacing:".1em" }}>Select a node to inspect</span>
    </div>
  );

  const fc = FLOW_COLORS[sector.flow] || FLOW_COLORS.Neutral;
  const ac = ACCUM_COLORS[sector.accum] || ACCUM_COLORS.Neutral;
  const rc = RISK_META[sector.risk] || RISK_META.Low;

  return (
    <div style={{ animation:"sm-fade .3s ease" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:".9rem", marginBottom:"1.2rem" }}>
        <span style={{ fontSize:"1.8rem", filter:`drop-shadow(0 0 10px ${sector.color}55)` }}>{sector.icon}</span>
        <div>
          <div style={{ fontFamily:T.font, fontSize:"clamp(.72rem,2vw,.95rem)", fontWeight:900, color:"#fff", letterSpacing:".1em" }}>{sector.name}</div>
          <div style={{ fontFamily:T.body, fontSize:".82rem", color:"rgba(255,255,255,.4)", letterSpacing:".06em" }}>Smart Money Intelligence</div>
        </div>
        <ScoreRing score={sector.smScore} color={sector.color} size={72}/>
      </div>

      {/* Status row */}
      <div style={{ display:"flex", gap:".5rem", marginBottom:"1rem", flexWrap:"wrap" }}>
        <span style={{ padding:".2rem .65rem", borderRadius:"50px", border:`1px solid ${fc.color}44`, background:`${fc.color}0e`, fontFamily:T.font, fontSize:".32rem", letterSpacing:".16em", color:fc.color }}>{fc.label}</span>
        <span style={{ padding:".2rem .65rem", borderRadius:"50px", border:`1px solid ${ac.color}35`, background:`${ac.color}0a`, fontFamily:T.font, fontSize:".32rem", letterSpacing:".14em", color:ac.color }}>{ac.icon} {sector.accum.toUpperCase()}</span>
        <span style={{ padding:".2rem .65rem", borderRadius:"50px", border:`1px solid ${rc.color}35`, background:`${rc.color}0a`, fontFamily:T.font, fontSize:".32rem", letterSpacing:".14em", color:rc.color }}>{rc.label}</span>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:".6rem", marginBottom:"1rem" }}>
        {[
          { label:"7D CHANGE",  val:(sector.change7d>=0?"+":"")+sector.change7d+"%", color:sector.change7d>=0?T.ok:T.danger },
          { label:"DOMINANCE",  val:sector.dominance+"%",   color:sector.color },
          { label:"MOMENTUM",   val:sector.momentum,        color:sector.momentum==="Rising"?T.ok:sector.momentum==="Falling"?T.danger:T.gold },
          { label:"ACTIVITY",   val:sector.activity,        color:sector.color },
        ].map((s,i) => (
          <div key={i} style={{ padding:".65rem .8rem", borderRadius:"9px", border:`1px solid ${s.color}18`, background:`${s.color}07` }}>
            <div style={{ fontFamily:T.font, fontSize:".28rem", letterSpacing:".18em", color:"rgba(255,255,255,.28)", marginBottom:".3rem" }}>{s.label}</div>
            <div style={{ fontFamily:T.body, fontSize:".95rem", fontWeight:700, color:s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Signal */}
      <div style={{ padding:".85rem 1rem", borderRadius:"10px", border:`1px solid ${sector.color}1e`, background:`${sector.color}07` }}>
        <div style={{ fontFamily:T.font, fontSize:".3rem", letterSpacing:".2em", color:`${sector.color}88`, marginBottom:".4rem" }}>⊙ INTELLIGENCE SIGNAL</div>
        <p style={{ fontFamily:T.body, fontSize:".9rem", color:"rgba(255,255,255,.55)", lineHeight:1.7, letterSpacing:".04em" }}>{sector.signal}</p>
      </div>
    </div>
  );
}

// ─── MOBILE SECTOR CARDS ─────────────────────────────────────
function MobileSectorCard({ sector }) {
  const [open, setOpen] = useState(false);
  const fc = FLOW_COLORS[sector.flow] || FLOW_COLORS.Neutral;
  const ac = ACCUM_COLORS[sector.accum] || ACCUM_COLORS.Neutral;

  return (
    <div onClick={() => setOpen(o=>!o)} style={{
      borderRadius:"12px", border:`1px solid ${open?sector.color+"44":sector.color+"1c"}`,
      background: open?`${sector.color}07`:"rgba(0,0,0,.48)", backdropFilter:"blur(10px)",
      cursor:"pointer", transition:"all .25s", overflow:"hidden",
    }}>
      <div style={{ padding:".9rem 1.1rem", display:"flex", alignItems:"center", gap:".8rem" }}>
        <span style={{ fontSize:"1.2rem", flexShrink:0, filter:`drop-shadow(0 0 7px ${sector.color}44)` }}>{sector.icon}</span>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:T.font, fontSize:".6rem", fontWeight:700, color:open?"#fff":sector.color, letterSpacing:".1em", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{sector.name}</div>
          <div style={{ display:"flex", alignItems:"center", gap:".4rem", marginTop:".25rem", flexWrap:"wrap" }}>
            <span style={{ fontFamily:T.font, fontSize:".28rem", color:`${fc.color}cc`, padding:".1rem .45rem", borderRadius:"4px", background:`${fc.color}0e`, border:`1px solid ${fc.color}28` }}>{fc.label}</span>
            <span style={{ fontFamily:T.font, fontSize:".28rem", color:`${ac.color}cc`, padding:".1rem .45rem", borderRadius:"4px", background:`${ac.color}0a`, border:`1px solid ${ac.color}22` }}>{ac.icon} {sector.accum.split(" ")[0].toUpperCase()}</span>
          </div>
        </div>
        <ScoreRing score={sector.smScore} color={sector.color} size={56}/>
        <span style={{ fontFamily:T.font, fontSize:".38rem", color:`${sector.color}55`, flexShrink:0, transition:"transform .25s", display:"inline-block", transform:open?"rotate(180deg)":"rotate(0)" }}>▼</span>
      </div>
      {open && (
        <div style={{ padding:"0 1.1rem 1.1rem", animation:"sm-fade .25s ease" }}>
          <div style={{ height:"1px", background:`linear-gradient(to right,transparent,${sector.color}28,transparent)`, marginBottom:".9rem" }}/>
          <p style={{ fontFamily:T.body, fontSize:".9rem", color:"rgba(255,255,255,.52)", lineHeight:1.7, letterSpacing:".04em" }}>{sector.signal}</p>
        </div>
      )}
    </div>
  );
}

// ─── CLUSTER CONSTELLATION ────────────────────────────────────
function ClusterConstellation({ clusters }) {
  const W = 480, H = 260;
  // Position clusters at 4 corners-ish
  const positions = [
    { x:100, y:80  },
    { x:340, y:80  },
    { x:100, y:190 },
    { x:340, y:190 },
  ];

  return (
    <div>
      {/* SVG network */}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", height:"auto", marginBottom:"1rem" }}>
        <defs>
          <filter id="node-glow">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        {/* Connection lines between related clusters */}
        {[
          [0,1],[0,2],[1,3],[2,3]
        ].map(([a,b],i) => (
          <line key={i}
            x1={positions[a].x} y1={positions[a].y}
            x2={positions[b].x} y2={positions[b].y}
            stroke="rgba(255,180,0,.08)" strokeWidth="1" strokeDasharray="4 8"
          />
        ))}
        {/* Cluster nodes */}
        {clusters.map((c,i) => {
          const pos  = positions[i];
          const nodeR = 24 + (c.size / 312) * 16;
          return (
            <g key={c.id} filter="url(#node-glow)">
              {/* Outer halo */}
              <circle cx={pos.x} cy={pos.y} r={nodeR+10} fill="none" stroke={`${c.color}18`} strokeWidth="1">
                <animate attributeName="r" values={`${nodeR+6};${nodeR+16};${nodeR+6}`} dur="4s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.5;0;0.5" dur="4s" repeatCount="indefinite"/>
              </circle>
              {/* Main node */}
              <circle cx={pos.x} cy={pos.y} r={nodeR} fill="rgba(0,0,0,.7)" stroke={`${c.color}55`} strokeWidth="1.5"/>
              {/* Icon */}
              <text x={pos.x} y={pos.y-6} textAnchor="middle" fontSize="14">{c.icon}</text>
              {/* Name */}
              <text x={pos.x} y={pos.y+8} textAnchor="middle" fill={c.color} fontSize="7.5" fontFamily="'Orbitron',monospace" fontWeight="700" letterSpacing="0.3">
                {c.name.split(" ")[0].toUpperCase()}
              </text>
              {/* Wallets */}
              <text x={pos.x} y={pos.y+18} textAnchor="middle" fill="rgba(255,255,255,.4)" fontSize="7" fontFamily="'Rajdhani',sans-serif">
                {c.size} wallets
              </text>
              {/* Behavior dot */}
              <circle cx={pos.x+nodeR-6} cy={pos.y-nodeR+6} r={5} fill={
                c.behavior==="Accumulation"?"#50ffa0":
                c.behavior==="Distribution"?"#ff3535":"rgba(255,255,255,.4)"
              }>
                <animate attributeName="opacity" values="1;0.3;1" dur="1.8s" repeatCount="indefinite"/>
              </circle>
            </g>
          );
        })}
      </svg>

      {/* Cluster cards */}
      <div style={{ display:"flex", flexDirection:"column", gap:".6rem" }}>
        {clusters.map(c => (
          <div key={c.id} style={{ padding:".85rem 1rem", borderRadius:"10px", border:`1px solid ${c.color}22`, background:`${c.color}07`, backdropFilter:"blur(8px)" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:".5rem" }}>
              <div style={{ display:"flex", alignItems:"center", gap:".5rem" }}>
                <span style={{ fontFamily:T.font, fontSize:".65rem", color:c.color }}>{c.icon}</span>
                <span style={{ fontFamily:T.font, fontSize:".48rem", fontWeight:700, color:c.color, letterSpacing:".12em" }}>{c.name.toUpperCase()}</span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:".5rem" }}>
                <span style={{ fontFamily:T.body, fontSize:".82rem", color:"rgba(255,255,255,.4)" }}>{c.size} wallets</span>
                <span style={{ padding:".12rem .5rem", borderRadius:"50px", border:`1px solid ${c.color}35`, background:`${c.color}0a`, fontFamily:T.font, fontSize:".3rem", letterSpacing:".14em", color:c.color }}>{c.behavior.toUpperCase()}</span>
              </div>
            </div>
            <p style={{ fontFamily:T.body, fontSize:".88rem", color:"rgba(255,255,255,.48)", lineHeight:1.65, letterSpacing:".04em" }}>{c.signal}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── AI INTELLIGENCE LAYER ────────────────────────────────────
function AIIntelLayer({ ai, intel }) {
  const rc = RISK_META[intel.risk] || RISK_META.Low;
  const sections = [
    { key:"summary",        icon:"⊙", label:"AI CAPITAL SUMMARY",       color:T.cyan,   text:ai.summary       },
    { key:"interpretation", icon:"🧠", label:"AI MARKET INTERPRETATION",  color:T.gold,   text:ai.interpretation},
    { key:"risk",           icon:"🛡", label:"AI RISK ASSESSMENT",        color:rc.color, text:ai.risk          },
    { key:"conclusion",     icon:"✦", label:"AI INTELLIGENCE CONCLUSION", color:T.ok,     text:ai.conclusion    },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:".8rem" }}>
      {sections.map((s,i) => (
        <div key={s.key} style={{ padding:"1rem 1.2rem", borderRadius:"12px", border:`1px solid ${s.color}1e`, background:`${s.color}07`, backdropFilter:"blur(8px)", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:0, left:"15%", right:"15%", height:"1px", background:`linear-gradient(to right,transparent,${s.color}44,transparent)` }}/>
          <div style={{ display:"flex", alignItems:"center", gap:".6rem", marginBottom:".6rem" }}>
            <span style={{ fontFamily:T.font, fontSize:".85rem", color:s.color, filter:`drop-shadow(0 0 8px ${s.color}55)` }}>{s.icon}</span>
            <span style={{ fontFamily:T.font, fontSize:".38rem", fontWeight:700, color:s.color, letterSpacing:".18em" }}>{s.label}</span>
          </div>
          <p style={{ fontFamily:T.body, fontSize:"clamp(.88rem,2vw,1rem)", color:"rgba(255,255,255,.6)", lineHeight:1.8, letterSpacing:".04em" }}>{s.text}</p>
        </div>
      ))}
      <p style={{ fontFamily:T.body, fontSize:".75rem", color:"rgba(255,255,255,.18)", letterSpacing:".08em", textAlign:"center" }}>
        AI analysis is heuristic intelligence — not financial advice.
      </p>
    </div>
  );
}

// ─── CAPITAL ROTATION TABLE ───────────────────────────────────
function CapitalRotation() {
  return (
    <div>
      <div style={{ display:"flex", flexDirection:"column", gap:".55rem" }}>
        {ROTATION_FLOWS.map((f,i) => {
          const from = SECTORS.find(s=>s.id===f.from);
          const to   = SECTORS.find(s=>s.id===f.to);
          if (!from||!to) return null;
          return (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:".8rem", padding:".7rem 1rem", borderRadius:"10px", border:"1px solid rgba(255,180,0,.1)", background:"rgba(0,0,0,.4)", backdropFilter:"blur(6px)" }}>
              {/* From */}
              <div style={{ display:"flex", alignItems:"center", gap:".4rem", minWidth:"80px" }}>
                <span style={{ fontSize:".9rem" }}>{from.icon}</span>
                <span style={{ fontFamily:T.font, fontSize:".38rem", color:from.color, letterSpacing:".08em" }}>{from.name.split(" ")[0]}</span>
              </div>
              {/* Arrow stream */}
              <div style={{ flex:1, position:"relative", height:"6px", borderRadius:"99px", background:"rgba(255,255,255,.05)" }}>
                <div style={{ width:`${f.strength*100}%`, height:"100%", borderRadius:"99px", background:`linear-gradient(to right,rgba(255,200,80,.3),rgba(255,200,80,.8))`, position:"relative", overflow:"hidden" }}>
                  <div style={{ position:"absolute", top:0, bottom:0, width:"30%", background:"linear-gradient(to right,transparent,rgba(255,255,255,.3),transparent)", animation:"sm-shimmer 2s ease infinite" }}/>
                </div>
                {/* Arrow head */}
                <div style={{ position:"absolute", right:0, top:"50%", transform:"translateY(-50%)", width:0, height:0, borderTop:"5px solid transparent", borderBottom:"5px solid transparent", borderLeft:`7px solid rgba(255,200,80,${f.strength*0.8})` }}/>
              </div>
              {/* To */}
              <div style={{ display:"flex", alignItems:"center", gap:".4rem", minWidth:"80px", justifyContent:"flex-end" }}>
                <span style={{ fontFamily:T.font, fontSize:".38rem", color:to.color, letterSpacing:".08em" }}>{to.name.split(" ")[0]}</span>
                <span style={{ fontSize:".9rem" }}>{to.icon}</span>
              </div>
              {/* Strength */}
              <div style={{ fontFamily:T.font, fontSize:".42rem", fontWeight:700, color:`rgba(255,200,80,${f.strength*0.9})`, flexShrink:0, minWidth:"32px", textAlign:"right" }}>
                {Math.round(f.strength*100)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────

// ─── V2: CAPITAL CONVICTION MODULE ───────────────────────────
function ConvictionModule({ sectors }) {
  const sorted = [...sectors].sort((a,b)=>(b.convictionScore||0)-(a.convictionScore||0));
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:".9rem" }}>
      <p style={{ fontFamily:T.body, fontSize:".92rem", color:"rgba(255,255,255,.42)", lineHeight:1.7, letterSpacing:".05em", marginBottom:".2rem" }}>
        Capital Conviction Score measures strength, persistence and quality of smart money participation — not volume.
      </p>
      {sorted.map(s => {
        const cb = convictionBand(s.convictionScore||0);
        return (
          <div key={s.id} style={{ padding:"1rem 1.2rem", borderRadius:"12px", border:`1px solid ${s.color}22`, background:"rgba(0,0,0,.48)", backdropFilter:"blur(8px)", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:`linear-gradient(to right,transparent,${s.color}44,transparent)` }}/>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:".7rem", flexWrap:"wrap", gap:".5rem" }}>
              <div style={{ display:"flex", alignItems:"center", gap:".6rem" }}>
                <span style={{ fontSize:"1rem" }}>{s.icon}</span>
                <span style={{ fontFamily:T.font, fontSize:".56rem", fontWeight:700, color:"rgba(255,255,255,.85)", letterSpacing:".1em" }}>{s.name}</span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:".5rem" }}>
                <span style={{ padding:".14rem .55rem", borderRadius:"50px", border:`1px solid ${cb.color}40`, background:`${cb.color}0d`, fontFamily:T.font, fontSize:".3rem", letterSpacing:".16em", color:cb.color }}>{cb.label}</span>
                <span style={{ fontFamily:T.font, fontSize:".85rem", fontWeight:900, color:s.color }}>{s.convictionScore||0}</span>
              </div>
            </div>
            {/* Conviction bar */}
            <div style={{ height:"5px", borderRadius:"99px", background:"rgba(255,255,255,.07)", overflow:"hidden", marginBottom:".45rem" }}>
              <div style={{ width:`${s.convictionScore||0}%`, height:"100%", background:`linear-gradient(to right,${s.color}55,${s.color})`, borderRadius:"99px", position:"relative", overflow:"hidden", transition:"width 1.2s ease" }}>
                <div style={{ position:"absolute", inset:0, background:"linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent)", animation:"sm-shimmer 2.5s ease 1s infinite" }}/>
              </div>
            </div>
            {/* Sub metrics */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,80px),1fr))", gap:".4rem" }}>
              {[
                { label:"ACCUM HIST",   val:s.accumHistory||"Stable",                            color:ACCUM_HISTORY[s.accumHistory]?.color||T.gold },
                { label:"DISTRIBUTION", val:(s.distributionStatus||"Neutral").split(" ")[0],     color:DIST_STATUS[s.distributionStatus||"Neutral"]?.color||T.dim },
                { label:"FLOW SCORE",   val:`${s.capitalFlowScore||50}`,                          color:s.color },
                { label:"RISK SCORE",   val:`${s.riskScore||30}`,                                 color:s.riskScore>=60?T.danger:s.riskScore>=40?T.warn:T.ok },
              ].map((m,i) => (
                <div key={i} style={{ textAlign:"center", padding:".35rem .4rem", borderRadius:"6px", background:"rgba(255,255,255,.03)" }}>
                  <div style={{ fontFamily:T.font, fontSize:".26rem", letterSpacing:".12em", color:"rgba(255,255,255,.25)", marginBottom:".2rem" }}>{m.label}</div>
                  <div style={{ fontFamily:T.body, fontSize:".82rem", fontWeight:700, color:m.color }}>{m.val}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── V2: ACCUMULATION HISTORY + DISTRIBUTION DETECTION ───────
function AccumDistributionModule({ sectors }) {
  const increasing = sectors.filter(s=>s.accumHistory==="Increasing");
  const stable     = sectors.filter(s=>s.accumHistory==="Stable");
  const decreasing = sectors.filter(s=>s.accumHistory==="Decreasing");
  const aggrDist   = sectors.filter(s=>s.distributionStatus==="Aggressive Distribution");
  const softDist   = sectors.filter(s=>s.distributionStatus==="Soft Distribution");

  const HistRow = ({ label, narrs, color, icon }) => (
    <div style={{ marginBottom:".9rem" }}>
      <div style={{ display:"flex", alignItems:"center", gap:".6rem", marginBottom:".45rem" }}>
        <span style={{ fontFamily:T.font, fontSize:".55rem", color }}>{icon}</span>
        <span style={{ fontFamily:T.font, fontSize:".38rem", fontWeight:700, color, letterSpacing:".16em" }}>{label}</span>
        <div style={{ flex:1, height:"1px", background:`linear-gradient(to right,${color}22,transparent)` }}/>
        <span style={{ fontFamily:T.font, fontSize:".38rem", color:`${color}88` }}>{narrs.length}</span>
      </div>
      {narrs.length === 0
        ? <div style={{ paddingLeft:"1.2rem", fontFamily:T.body, fontSize:".82rem", color:"rgba(255,255,255,.2)" }}>— None</div>
        : <div style={{ display:"flex", flexWrap:"wrap", gap:".45rem", paddingLeft:"1.2rem" }}>
            {narrs.map(s => (
              <div key={s.id} style={{ display:"flex", alignItems:"center", gap:".4rem", padding:".3rem .75rem", borderRadius:"7px", border:`1px solid ${s.color}25`, background:`${s.color}08` }}>
                <span style={{ fontSize:".85rem" }}>{s.icon}</span>
                <span style={{ fontFamily:T.font, fontSize:".36rem", color:s.color, letterSpacing:".1em" }}>{s.name.split(" ")[0].toUpperCase()}</span>
                <span style={{ fontFamily:T.font, fontSize:".52rem", fontWeight:700, color:`${s.color}cc` }}>{s.convictionScore||0}</span>
              </div>
            ))}
          </div>
      }
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1.4rem" }}>
      {/* Accumulation History */}
      <div style={{ padding:"1.2rem 1.4rem", borderRadius:"14px", border:`1px solid ${T.ok}18`, background:"rgba(0,0,0,.45)", backdropFilter:"blur(8px)" }}>
        <div style={{ fontFamily:T.font, fontSize:".44rem", fontWeight:700, color:T.ok, letterSpacing:".14em", marginBottom:"1rem" }}>📈 ACCUMULATION HISTORY</div>
        <HistRow label="INCREASING"  narrs={increasing}  color={T.ok}    icon="↑↑" />
        <HistRow label="STABLE"      narrs={stable}       color={T.gold}  icon="→"  />
        <HistRow label="DECREASING"  narrs={decreasing}   color={T.warn}  icon="↓"  />
      </div>
      {/* Distribution Detection */}
      <div style={{ padding:"1.2rem 1.4rem", borderRadius:"14px", border:`1px solid ${T.danger}18`, background:"rgba(0,0,0,.45)", backdropFilter:"blur(8px)" }}>
        <div style={{ fontFamily:T.font, fontSize:".44rem", fontWeight:700, color:T.danger, letterSpacing:".14em", marginBottom:"1rem" }}>⚠️ DISTRIBUTION DETECTION</div>
        <HistRow label="AGGRESSIVE DISTRIBUTION" narrs={aggrDist} color={T.danger} icon="●●" />
        <HistRow label="SOFT DISTRIBUTION"       narrs={softDist} color={T.warn}   icon="◐"  />
        <div style={{ marginTop:".8rem", padding:".8rem 1rem", borderRadius:"9px", border:"1px solid rgba(255,255,255,.07)", background:"rgba(255,255,255,.03)" }}>
          <div style={{ fontFamily:T.font, fontSize:".3rem", letterSpacing:".2em", color:"rgba(255,255,255,.28)", marginBottom:".4rem" }}>INTELLIGENCE NOTE</div>
          <p style={{ fontFamily:T.body, fontSize:".88rem", color:"rgba(255,255,255,.5)", lineHeight:1.7, letterSpacing:".04em" }}>
            {aggrDist.length > 0
              ? `AGGRESSIVE distribution detected in ${aggrDist.map(s=>s.name).join(", ")}. Methodical exit pattern — historically precedes extended underperformance.`
              : "No aggressive distribution signals detected. Smart money posture broadly constructive."}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── V2: AI CAPITAL INTELLIGENCE (4-layer) ───────────────────
function AICapitalIntelligence({ ai, intel }) {
  const rc = RISK_META[intel.risk] || RISK_META.Low;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:".8rem" }}>
      {[
        { icon:"⊙",  label:"AI CAPITAL SUMMARY",       color:T.cyan,   text:ai.summary       },
        { icon:"↑↑", label:"AI ACCUMULATION SUMMARY",  color:T.ok,     text:ai.accumulation  },
        { icon:"⬇",  label:"AI DISTRIBUTION ANALYSIS", color:T.orange, text:ai.distribution  },
        { icon:"🛡",  label:"AI RISK ANALYSIS",         color:rc.color, text:ai.risk          },
      ].map((s,i) => (
        <div key={i} style={{ padding:"1rem 1.2rem", borderRadius:"12px", border:`1px solid ${s.color}1e`, background:`${s.color}07`, backdropFilter:"blur(8px)", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:0, left:"15%", right:"15%", height:"1px", background:`linear-gradient(to right,transparent,${s.color}44,transparent)` }}/>
          <div style={{ display:"flex", alignItems:"center", gap:".6rem", marginBottom:".55rem" }}>
            <span style={{ fontFamily:T.font, fontSize:".85rem", color:s.color }}>{s.icon}</span>
            <span style={{ fontFamily:T.font, fontSize:".38rem", fontWeight:700, color:s.color, letterSpacing:".18em" }}>{s.label}</span>
          </div>
          <p style={{ fontFamily:T.body, fontSize:"clamp(.88rem,2vw,1rem)", color:"rgba(255,255,255,.6)", lineHeight:1.8, letterSpacing:".04em" }}>{s.text}</p>
        </div>
      ))}
      <p style={{ fontFamily:T.body, fontSize:".75rem", color:"rgba(255,255,255,.18)", letterSpacing:".08em", textAlign:"center" }}>AI analysis is heuristic intelligence — not financial advice.</p>
    </div>
  );
}

// ─── V2: ALPHA ENGINE INTEGRATION ────────────────────────────
function AlphaEnginePanel({ sectors, intel }) {
  const payload = useMemo(() => sectors.map(s => ({
    id:                s.id,
    name:              s.name,
    smScore:           s.smScore,
    convictionScore:   s.convictionScore   || 50,
    capitalFlowScore:  s.capitalFlowScore  || 50,
    accumStatus:       s.accumHistory      || "Stable",
    distributionStatus:s.distributionStatus|| "Neutral",
    riskScore:         s.riskScore         || 30,
    confidenceLevel:   s.confidenceLevel   || "Medium",
    alphaScore:        s.alphaScore        || Math.round((s.smScore*.4)+(s.convictionScore||50)*.35+((100-(s.riskScore||30))*.25)),
    momentum:          s.momentum,
    flow:              s.flow,
    weeklyDelta:       s.weeklyDelta       || 0,
    timestamp:         Date.now(),
  })).sort((a,b)=>b.alphaScore-a.alphaScore), [sectors]);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1.2rem" }}>
      <div style={{ padding:".9rem 1.2rem", borderRadius:"12px", border:"1px solid rgba(0,229,255,.2)", background:"rgba(0,229,255,.04)" }}>
        <div style={{ fontFamily:T.font, fontSize:".38rem", letterSpacing:".22em", color:"rgba(0,229,255,.7)", marginBottom:".5rem" }}>⊙ ALPHA ENGINE DATA SCHEMA V2</div>
        <p style={{ fontFamily:T.body, fontSize:".9rem", color:"rgba(255,255,255,.5)", lineHeight:1.7, letterSpacing:".04em" }}>
          Structured for direct Alpha Engine consumption. All V2 fields exposed: convictionScore · capitalFlowScore · accumStatus · distributionStatus · riskScore · confidenceLevel · alphaScore.
        </p>
      </div>
      {/* Data table */}
      <div style={{ display:"flex", flexDirection:"column", gap:".4rem" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1.4fr repeat(6,1fr)", gap:".5rem", padding:".4rem .8rem" }}>
          {["SECTOR","CONV.","CAP FLOW","ACCUM","DIST.","RISK","ALPHA"].map(h=>(
            <span key={h} style={{ fontFamily:T.font, fontSize:".26rem", letterSpacing:".12em", color:"rgba(255,255,255,.25)" }}>{h}</span>
          ))}
        </div>
        {payload.map(s => {
          const sc = s.alphaScore>=70?T.ok:s.alphaScore>=50?T.gold:T.orange;
          const ah = ACCUM_HISTORY[s.accumStatus];
          const ds = DIST_STATUS[s.distributionStatus];
          return (
            <div key={s.id} style={{ display:"grid", gridTemplateColumns:"1.4fr repeat(6,1fr)", gap:".5rem", padding:".65rem .8rem", borderRadius:"8px", border:`1px solid ${sc}1c`, background:`${sc}05` }}>
              <span style={{ fontFamily:T.body, fontSize:".85rem", color:"rgba(255,255,255,.65)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {sectors.find(x=>x.id===s.id)?.name}
              </span>
              <span style={{ fontFamily:T.font, fontSize:".44rem", fontWeight:700, color:sc }}>{s.convictionScore}</span>
              <span style={{ fontFamily:T.font, fontSize:".44rem", color:"rgba(255,255,255,.55)" }}>{s.capitalFlowScore}</span>
              <span style={{ fontFamily:T.font, fontSize:".55rem", color:ah?.color||T.gold }}>{ah?.icon||"→"}</span>
              <span style={{ fontFamily:T.font, fontSize:".55rem", color:ds?.color||T.dim }}>{ds?.icon||"○"}</span>
              <span style={{ fontFamily:T.font, fontSize:".44rem", color:s.riskScore>=60?T.danger:s.riskScore>=40?T.warn:T.ok }}>{s.riskScore}</span>
              <span style={{ fontFamily:T.font, fontSize:".52rem", fontWeight:700, color:sc }}>{s.alphaScore}</span>
            </div>
          );
        })}
      </div>
      <p style={{ fontFamily:T.body, fontSize:".75rem", color:"rgba(255,255,255,.2)", letterSpacing:".08em" }}>Smart Money Alpha Schema v2.0.0 · All fields reusable by Alpha Engine</p>
    </div>
  );
}

export default function SmartMoneyIntelligence() {
  const [selected,  setSelected]  = useState(null);
  const [tab,       setTab]       = useState("orbital");
  const [isMobile,  setIsMobile]  = useState(false);
  const [tick,      setTick]      = useState(0);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Simulate live intelligence pulse
  useEffect(() => {
    const id = setInterval(() => setTick(t => t+1), 8000);
    return () => clearInterval(id);
  }, []);

  const intel = useMemo(() => deriveIntelligence(SECTORS), []);
  const ai    = useMemo(() => generateAI(SECTORS, intel),  [intel]);
  const fc    = FLOW_COLORS[intel.flow] || FLOW_COLORS.Neutral;

  const selectedSector = SECTORS.find(s => s.id === selected) || null;

  return (
    <div style={{ minHeight:"100vh", background:T.black, color:"#fff", fontFamily:T.font, position:"relative", overflowX:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-track{background:#050403;} ::-webkit-scrollbar-thumb{background:#ffd70055;}
        @keyframes sm-ping    { 0%{transform:scale(1);opacity:.65;} 100%{transform:scale(2.5);opacity:0;} }
        @keyframes sm-ping-ring{ 0%{transform:scale(1);opacity:.7;} 100%{transform:scale(1.8);opacity:0;} }
        @keyframes sm-spin    { to{transform:rotate(360deg);} }
        @keyframes sm-spin-r  { to{transform:rotate(-360deg);} }
        @keyframes sm-breathe { 0%,100%{opacity:.5;} 50%{opacity:1;} }
        @keyframes sm-fade    { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:translateY(0);} }
        @keyframes sm-shimmer { 0%{left:-100%;} 100%{left:200%;} }
        @keyframes sm-grid    { 0%,100%{opacity:.013;} 50%{opacity:.025;} }
        @keyframes sm-blink   { 0%,100%{opacity:1;} 50%{opacity:.2;} }
        .sm-tab{padding:.48rem 1.1rem;border-radius:7px;border:1px solid rgba(255,255,255,.1);background:rgba(0,0,0,.35);color:rgba(255,255,255,.42);font-family:'Orbitron',monospace;font-size:.36rem;letter-spacing:.18em;cursor:pointer;transition:all .22s;white-space:nowrap;}
        .sm-tab.active{border-color:rgba(255,180,0,.45);background:rgba(255,180,0,.08);color:rgba(255,215,0,.9);}
        .sm-tab:hover:not(.active){border-color:rgba(255,255,255,.22);color:rgba(255,255,255,.65);}
        .panel{border-radius:16px;border:1px solid rgba(255,180,0,.14);background:rgba(0,0,0,.5);backdrop-filter:blur(12px);overflow:hidden;}
        .panel-hdr{padding:.9rem 1.4rem;border-bottom:1px solid rgba(255,180,0,.1);background:rgba(255,180,0,.03);display:flex;align-items:center;gap:.6rem;}
        .panel-body{padding:1.3rem 1.4rem;}
        @media(max-width:900px){.sm-main-grid{grid-template-columns:1fr!important;}.sm-hide-mobile{display:none!important;}}
        @media(max-width:480px){.sm-strip{grid-template-columns:1fr 1fr!important;} .sm-tabs{overflow-x:auto;-webkit-overflow-scrolling:touch;padding-bottom:.3rem;} .sm-tabs::-webkit-scrollbar{height:2px;}}
      `}</style>

      {/* Background */}
      <div style={{ position:"absolute", inset:0, zIndex:0, pointerEvents:"none", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(255,180,0,.013) 1px,transparent 1px),linear-gradient(90deg,rgba(255,180,0,.013) 1px,transparent 1px)", backgroundSize:"65px 65px", animation:"sm-grid 12s ease-in-out infinite" }}/>
        <div style={{ position:"absolute", top:"8%",   right:"-10%", width:"700px", height:"700px", borderRadius:"50%", background:"radial-gradient(circle,rgba(0,229,255,.04),transparent 65%)" }}/>
        <div style={{ position:"absolute", bottom:"5%", left:"-8%",  width:"600px", height:"600px", borderRadius:"50%", background:"radial-gradient(circle,rgba(255,140,0,.04),transparent 65%)" }}/>
      </div>

      <div style={{ position:"relative", zIndex:10, maxWidth:"1380px", margin:"0 auto", padding:"clamp(1.5rem,4vw,3rem) clamp(1rem,4vw,2rem)" }}>

        {/* ── NAVBAR ── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"2rem", flexWrap:"wrap", gap:"1rem" }}>
          <a href="/app" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:".6rem" }}>
            <div style={{ width:"26px", height:"26px", borderRadius:"50%", background:"radial-gradient(circle,#ffd700,#ff8c00)", boxShadow:"0 0 14px rgba(255,150,0,.5)" }}/>
            <span style={{ fontFamily:T.font, fontSize:".52rem", letterSpacing:".2em", color:"rgba(255,215,0,.9)" }}>$FLASH</span>
          </a>
          <div style={{ display:"flex", gap:".45rem", flexWrap:"wrap" }}>
            {[{l:"APP HUB",href:"/app"},{l:"NARRATIVE",href:"/narrative"},{l:"ALERTS",href:"/alerts"},{l:"ECOSYSTEM",href:"/ecosystem"}].map(b=>(
              <a key={b.l} href={b.href} style={{textDecoration:"none"}}>
                <button style={{padding:".34rem .85rem",borderRadius:"6px",border:"1px solid rgba(255,255,255,.1)",background:"rgba(0,0,0,.35)",color:"rgba(255,255,255,.45)",fontFamily:T.font,fontSize:".34rem",letterSpacing:".16em",cursor:"pointer",transition:"all .2s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,180,0,.38)";e.currentTarget.style.color="rgba(255,215,0,.75)";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,.1)";e.currentTarget.style.color="rgba(255,255,255,.45)";}}>
                  {b.l}
                </button>
              </a>
            ))}
          </div>
        </div>

        {/* ── HEADER ── */}
        <div style={{ marginBottom:"2rem" }}>
          <div style={{ display:"flex", alignItems:"center", gap:".8rem", marginBottom:".6rem", flexWrap:"wrap" }}>
            <div style={{ display:"flex", alignItems:"center", gap:".5rem" }}>
              <LiveDot color={fc.color} size={7}/>
              <span style={{ fontFamily:T.font, fontSize:".36rem", letterSpacing:".28em", color:`${fc.color}88` }}>PHASE 2 — INTELLIGENCE ACTIVE</span>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:"1rem" }}>
            <div>
              <div style={{ fontFamily:T.font, fontSize:".44rem", letterSpacing:".42em", color:"rgba(255,180,0,.42)", marginBottom:".4rem" }}>INTELLIGENCE MODULE</div>
              <h1 style={{ fontFamily:T.font, fontSize:"clamp(1.9rem,5vw,3.2rem)", fontWeight:900, background:"linear-gradient(135deg,#fff 0%,#ffd700 40%,#ff8c00 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", letterSpacing:".08em", lineHeight:1.05 }}>
                SMART MONEY<br/>INTELLIGENCE
              </h1>
              <p style={{ fontFamily:T.body, fontSize:"clamp(.88rem,2vw,1rem)", color:"rgba(255,255,255,.38)", letterSpacing:".1em", marginTop:".4rem" }}>
                Where sophisticated capital moves. Where conviction is building.
              </p>
            </div>
            {/* Overall risk badge */}
            <div style={{ padding:".55rem 1.2rem", borderRadius:"10px", border:`1px solid ${RISK_META[intel.risk].color}35`, background:`${RISK_META[intel.risk].color}0a`, display:"flex", alignItems:"center", gap:".6rem" }}>
              <LiveDot color={RISK_META[intel.risk].color} size={7}/>
              <span style={{ fontFamily:T.font, fontSize:".44rem", color:RISK_META[intel.risk].color, letterSpacing:".2em" }}>MARKET RISK: {intel.risk.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* ── STATUS STRIP ── */}
        <div className="sm-strip" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,80px),1fr))", gap:".7rem", marginBottom:"1.8rem" }}>
          {[
            { label:"SM SCORE",     val:`${intel.avgSM}/100`,     color:fc.color,  sub:"composite"    },
            { label:"CAPITAL FLOW", val:fc.label.replace(" ","↵"), color:fc.color,  sub:"current state" },
            { label:"ACCUMULATING", val:`${intel.accum} sectors`,  color:T.ok,      sub:"smart money"   },
            { label:"DISTRIBUTING", val:`${intel.distrib} sectors`,color:T.danger,  sub:"outflow signal" },
          ].map((s,i) => (
            <div key={i} style={{ padding:".9rem 1.1rem", borderRadius:"12px", border:`1px solid ${s.color}1e`, background:"rgba(0,0,0,.45)", backdropFilter:"blur(8px)" }}>
              <div style={{ fontFamily:T.font, fontSize:".3rem", letterSpacing:".2em", color:"rgba(255,255,255,.28)", marginBottom:".4rem" }}>{s.label}</div>
              <div style={{ fontFamily:T.font, fontSize:"clamp(.78rem,2.5vw,1.1rem)", fontWeight:900, color:s.color, lineHeight:1.1, marginBottom:".2rem" }}>{s.val}</div>
              <div style={{ fontFamily:T.body, fontSize:".75rem", color:"rgba(255,255,255,.28)" }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ── TABS ── */}
        {/* V2 badge */}
        <div style={{ display:"flex", alignItems:"center", gap:".6rem", marginBottom:".7rem" }}>
          <span style={{ padding:".15rem .6rem", borderRadius:"50px", border:"1px solid rgba(255,215,0,.35)", background:"rgba(255,215,0,.08)", fontFamily:T.font, fontSize:".3rem", letterSpacing:".18em", color:T.gold }}>V2</span>
          <span style={{ fontFamily:T.body, fontSize:".82rem", color:"rgba(255,255,255,.3)", letterSpacing:".06em" }}>Conviction · Accumulation History · Distribution Detection · Alpha Engine</span>
        </div>

        <div className="sm-tabs" style={{ display:"flex", gap:".4rem", marginBottom:"1.4rem", flexWrap:"wrap" }}>
          {[
            { id:"orbital",    label: isMobile ? "SECTORS" : "ORBITAL NETWORK"    },
            { id:"conviction", label:"CONVICTION"                                  },
            { id:"accumdist",  label:"ACCUM / DIST"                               },
            { id:"clusters",   label:"CLUSTERS"                                    },
            { id:"rotation",   label:"ROTATION"                                    },
            { id:"ai",         label:"AI INTELLIGENCE"                             },
            { id:"alpha",      label:"ALPHA ENGINE"                                },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`sm-tab${tab===t.id?" active":""}`}>{t.label}</button>
          ))}
        </div>

        {/* ─ ORBITAL NETWORK TAB ─ */}
        {tab === "orbital" && (
          <div>
            {!isMobile ? (
              /* Desktop: SVG orbit + detail panel */
              <div className="sm-main-grid" style={{ display:"grid", gridTemplateColumns:"1.1fr .9fr", gap:"1.5rem", alignItems:"start" }}>
                {/* Orbital network */}
                <div className="panel" style={{ position:"relative" }}>
                  <div className="panel-hdr">
                    <span style={{ fontSize:"1rem" }}>⊙</span>
                    <span style={{ fontFamily:T.font, fontSize:".5rem", fontWeight:700, color:T.gold, letterSpacing:".14em" }}>CAPITAL ORBIT NETWORK</span>
                    <div style={{ flex:1, height:"1px", background:"linear-gradient(to right,rgba(255,180,0,.22),transparent)", marginLeft:".5rem" }}/>
                    <span style={{ fontFamily:T.font, fontSize:".3rem", color:"rgba(255,255,255,.28)", letterSpacing:".14em" }}>SELECT A NODE</span>
                  </div>
                  <div className="panel-body" style={{ display:"flex", justifyContent:"center" }}>
                    <CapitalOrbitNetwork sectors={SECTORS} onSelect={setSelected} selected={selected}/>
                  </div>
                </div>

                {/* Right panel: Core + Detail */}
                <div style={{ display:"flex", flexDirection:"column", gap:"1.2rem" }}>
                  {/* Smart Money Core */}
                  <div className="panel">
                    <div className="panel-hdr">
                      <span style={{ fontSize:"1rem" }}>🧠</span>
                      <span style={{ fontFamily:T.font, fontSize:".5rem", fontWeight:700, color:T.gold, letterSpacing:".14em" }}>SMART MONEY CORE</span>
                    </div>
                    <div className="panel-body" style={{ display:"flex", justifyContent:"center" }}>
                      <SmartMoneyCore intel={intel} sectors={SECTORS}/>
                    </div>
                  </div>

                  {/* Sector detail */}
                  {selected && (
                    <div className="panel" style={{ border:`1px solid ${selectedSector?.color||T.gold}28` }}>
                      <div className="panel-hdr">
                        <span style={{ fontSize:"1rem" }}>📊</span>
                        <span style={{ fontFamily:T.font, fontSize:".5rem", fontWeight:700, color:T.gold, letterSpacing:".14em" }}>SECTOR INTELLIGENCE</span>
                      </div>
                      <div className="panel-body">
                        <SectorDetail sector={selectedSector}/>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Mobile: Core + stacked cards */
              <div style={{ display:"flex", flexDirection:"column", gap:"1.2rem" }}>
                {/* Compact core */}
                <div className="panel">
                  <div className="panel-hdr">
                    <span style={{ fontSize:"1rem" }}>🧠</span>
                    <span style={{ fontFamily:T.font, fontSize:".5rem", fontWeight:700, color:T.gold, letterSpacing:".14em" }}>SMART MONEY CORE</span>
                  </div>
                  <div className="panel-body" style={{ display:"flex", justifyContent:"center" }}>
                    <SmartMoneyCore intel={intel} sectors={SECTORS}/>
                  </div>
                </div>
                {/* Stacked sector cards */}
                <div style={{ display:"flex", flexDirection:"column", gap:".6rem" }}>
                  {SECTORS.map(s => <MobileSectorCard key={s.id} sector={s}/>)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─ CLUSTER INTELLIGENCE TAB ─ */}
        {tab === "clusters" && (
          <div className="panel">
            <div className="panel-hdr">
              <span style={{ fontSize:"1rem" }}>✦</span>
              <span style={{ fontFamily:T.font, fontSize:".5rem", fontWeight:700, color:T.gold, letterSpacing:".14em" }}>CLUSTER CONSTELLATION</span>
              <div style={{ flex:1, height:"1px", background:"linear-gradient(to right,rgba(255,180,0,.22),transparent)", marginLeft:".5rem" }}/>
              <span style={{ fontFamily:T.font, fontSize:".3rem", color:"rgba(255,255,255,.28)", letterSpacing:".12em" }}>BEHAVIORAL PATTERNS</span>
            </div>
            <div className="panel-body">
              <p style={{ fontFamily:T.body, fontSize:".92rem", color:"rgba(255,255,255,.42)", letterSpacing:".07em", marginBottom:"1.4rem", lineHeight:1.7 }}>
                Wallet behavior clustered by conviction, strategy and timing. Focus on patterns — not individual addresses.
              </p>
              <ClusterConstellation clusters={CLUSTERS}/>
            </div>
          </div>
        )}

        {/* ─ ROTATION TAB ─ */}
        {tab === "rotation" && (
          <div className="panel">
            <div className="panel-hdr">
              <span style={{ fontSize:"1rem" }}>💰</span>
              <span style={{ fontFamily:T.font, fontSize:".5rem", fontWeight:700, color:T.gold, letterSpacing:".14em" }}>CAPITAL ROTATION MAP</span>
              <div style={{ flex:1, height:"1px", background:"linear-gradient(to right,rgba(255,180,0,.22),transparent)", marginLeft:".5rem" }}/>
            </div>
            <div className="panel-body">
              <p style={{ fontFamily:T.body, fontSize:".92rem", color:"rgba(255,255,255,.42)", letterSpacing:".07em", marginBottom:"1.4rem", lineHeight:1.7 }}>
                Directional capital flows between narrative categories — 7-day signal strength.
              </p>
              <CapitalRotation/>
            </div>
          </div>
        )}

        {/* ─ AI INTELLIGENCE TAB ─ */}
        {tab === "ai" && (
          <div className="panel" style={{ border:"1px solid rgba(0,229,255,.2)", background:"linear-gradient(135deg,rgba(0,229,255,.03),rgba(0,0,0,.5))" }}>
            <div className="panel-hdr" style={{ background:"rgba(0,229,255,.04)", borderColor:"rgba(0,229,255,.12)" }}>
              <span style={{ fontSize:"1rem" }}>🧠</span>
              <div>
                <span style={{ fontFamily:T.font, fontSize:".52rem", fontWeight:700, color:T.cyan, letterSpacing:".14em" }}>AI INTELLIGENCE LAYER</span>
                <div style={{ fontFamily:T.body, fontSize:".78rem", color:"rgba(255,255,255,.3)", letterSpacing:".06em", marginTop:".1rem" }}>Smart Money Intelligence Engine</div>
              </div>
              <span style={{ marginLeft:"auto", display:"inline-flex", alignItems:"center", gap:".4rem" }}>
                <LiveDot color={T.cyan} size={7}/>
                <span style={{ fontFamily:T.font, fontSize:".3rem", color:`${T.cyan}77`, letterSpacing:".18em" }}>ACTIVE</span>
              </span>
            </div>
            <div className="panel-body">
              <AIIntelLayer ai={ai} intel={intel}/>
            </div>
          </div>
        )}


        {/* ─ CONVICTION TAB ─ */}
        {tab === "conviction" && (
          <div className="panel">
            <div className="panel-hdr">
              <span style={{ fontSize:"1rem" }}>💎</span>
              <span style={{ fontFamily:T.font, fontSize:".5rem", fontWeight:700, color:T.gold, letterSpacing:".14em" }}>CAPITAL CONVICTION SCORES</span>
              <div style={{ flex:1, height:"1px", background:"linear-gradient(to right,rgba(255,180,0,.22),transparent)", marginLeft:".5rem" }}/>
            </div>
            <div className="panel-body"><ConvictionModule sectors={SECTORS}/></div>
          </div>
        )}

        {/* ─ ACCUM/DIST TAB ─ */}
        {tab === "accumdist" && (
          <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
            <div className="panel">
              <div className="panel-hdr">
                <span style={{ fontSize:"1rem" }}>📈</span>
                <span style={{ fontFamily:T.font, fontSize:".5rem", fontWeight:700, color:T.ok, letterSpacing:".14em" }}>ACCUMULATION HISTORY + DISTRIBUTION</span>
                <div style={{ flex:1, height:"1px", background:"linear-gradient(to right,rgba(80,255,160,.22),transparent)", marginLeft:".5rem" }}/>
              </div>
              <div className="panel-body"><AccumDistributionModule sectors={SECTORS}/></div>
            </div>
          </div>
        )}

        {/* ─ AI CAPITAL INTELLIGENCE TAB ─ */}
        {tab === "ai" && (
          <div className="panel" style={{ border:"1px solid rgba(0,229,255,.2)", background:"linear-gradient(135deg,rgba(0,229,255,.03),rgba(0,0,0,.5))" }}>
            <div className="panel-hdr" style={{ background:"rgba(0,229,255,.04)", borderColor:"rgba(0,229,255,.12)" }}>
              <span style={{ fontSize:"1rem" }}>🧠</span>
              <div>
                <span style={{ fontFamily:T.font, fontSize:".5rem", fontWeight:700, color:T.cyan, letterSpacing:".14em" }}>AI CAPITAL INTELLIGENCE V2</span>
                <div style={{ fontFamily:T.body, fontSize:".78rem", color:"rgba(255,255,255,.3)", letterSpacing:".06em", marginTop:".1rem" }}>4-Layer Capital Analysis</div>
              </div>
              <span style={{ marginLeft:"auto", display:"inline-flex", alignItems:"center", gap:".4rem" }}>
                <LiveDot color={T.cyan} size={7}/>
                <span style={{ fontFamily:T.font, fontSize:".3rem", color:`${T.cyan}77`, letterSpacing:".18em" }}>ACTIVE</span>
              </span>
            </div>
            <div className="panel-body">
              <AICapitalIntelligence ai={ai} intel={intel}/>
            </div>
          </div>
        )}

        {/* ─ ALPHA ENGINE TAB ─ */}
        {tab === "alpha" && (
          <div className="panel" style={{ border:"1px solid rgba(0,229,255,.2)" }}>
            <div className="panel-hdr" style={{ background:"rgba(0,229,255,.03)", borderColor:"rgba(0,229,255,.12)" }}>
              <span style={{ fontSize:"1rem" }}>⊙</span>
              <div>
                <span style={{ fontFamily:T.font, fontSize:".5rem", fontWeight:700, color:T.cyan, letterSpacing:".14em" }}>ALPHA ENGINE INTEGRATION</span>
                <div style={{ fontFamily:T.body, fontSize:".78rem", color:"rgba(255,255,255,.3)", letterSpacing:".06em", marginTop:".1rem" }}>Smart Money Data Schema v2.0.0</div>
              </div>
            </div>
            <div className="panel-body">
              <AlphaEnginePanel sectors={SECTORS} intel={intel}/>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign:"center", padding:"1.5rem 0 0", marginTop:"2rem", borderTop:"1px solid rgba(255,255,255,.05)" }}>
          <p style={{ fontFamily:T.body, fontSize:".75rem", color:"rgba(255,255,255,.18)", letterSpacing:".1em" }}>
            Smart Money Intelligence V2 — Solar Flash Phase 2 — Conviction · Accumulation · Distribution · Alpha Engine — Not financial advice
          </p>
        </div>

      </div>
    </div>
  );
}
