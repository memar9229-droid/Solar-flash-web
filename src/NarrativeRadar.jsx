/**
 * NarrativeRadar.jsx — Solar Flash Phase 2
 * Narrative Intelligence Engine V1
 * Route: /narrative
 */

import { useState, useEffect, useRef, useMemo } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────
const T = {
  orange: "#ff8c00", gold: "#ffd700", cyan: "#00e5ff",
  ok:     "#50ffa0", purple: "#b060ff", danger:"#ff3535",
  warm:   "#ffaa00", black: "#050403",
  font:   "'Orbitron', monospace",
  body:   "'Rajdhani', sans-serif",
};

// ─── CONSTANTS ────────────────────────────────────────────────
const HEAT = {
  Cold:      { color:"#4a90d9",              label:"COLD",      glow:"rgba(74,144,217,.35)"   },
  Warm:      { color:T.gold,                 label:"WARM",      glow:"rgba(255,215,0,.35)"    },
  Hot:       { color:T.orange,               label:"HOT",       glow:"rgba(255,140,0,.45)"    },
  Explosive: { color:T.danger,               label:"EXPLOSIVE", glow:"rgba(255,53,53,.5)"     },
};

const MOMENTUM = {
  Rising:  { icon:"↑" , color:T.ok,                 label:"RISING"  },
  Stable:  { icon:"→" , color:"rgba(255,255,255,.5)",label:"STABLE"  },
  Falling: { icon:"↓" , color:T.danger,              label:"FALLING" },
};

const LIFECYCLE = {
  Emerging:     { color:T.cyan,   order:1, desc:"Very early signal detection" },
  "Early Growth":{ color:T.ok,   order:2, desc:"Initial adoption accelerating" },
  Expanding:    { color:T.gold,   order:3, desc:"Broad market awareness building" },
  Mature:       { color:T.orange, order:4, desc:"Peak mainstream attention" },
  Saturated:    { color:T.warm,   order:5, desc:"Diminishing returns on attention" },
  Declining:    { color:T.danger, order:6, desc:"Capital rotation out" },
};

// ─── NARRATIVE DATA ───────────────────────────────────────────
// Seeded deterministically — ready for real API data in V2
function seedNarratives() {
  return [
    {
      id:        "ai",
      name:      "AI Infrastructure",
      category:  "AI",
      icon:      "🧠",
      color:     T.cyan,
      score:     88,
      heat:      "Hot",
      momentum:  "Rising",
      lifecycle: "Expanding",
      capitalFlow: +2.4,
      volume7d:  4.2,
      dominance: 22,
      description: "AI-native infrastructure, inference networks, and decentralized compute for LLMs.",
      topTokens: ["TAO","RNDR","OCEAN","FET","AIOZ"],
      signal:    "Strong institutional flows. Multiple protocols hitting ATH. Narrative at expansion phase.",
      change7d:  +18,
    },
    {
      id:        "depin",
      name:      "DePIN",
      category:  "DePIN",
      icon:      "📡",
      color:     T.ok,
      score:     74,
      heat:      "Hot",
      momentum:  "Rising",
      lifecycle: "Early Growth",
      capitalFlow: +1.8,
      volume7d:  2.1,
      dominance: 11,
      description: "Decentralized physical infrastructure networks — wireless, compute, energy, and mapping.",
      topTokens: ["HNT","IOTX","MOBILE","GEODNET","DIMO"],
      signal:    "Early growth phase with strong fundamentals. Smart money accumulating across sector.",
      change7d:  +14,
    },
    {
      id:        "rwa",
      name:      "Real World Assets",
      category:  "RWA",
      icon:      "🏛",
      color:     T.gold,
      score:     71,
      heat:      "Hot",
      momentum:  "Rising",
      lifecycle: "Early Growth",
      capitalFlow: +1.5,
      volume7d:  1.8,
      dominance: 9,
      description: "Tokenization of real-world assets: bonds, real estate, credit, commodities.",
      topTokens: ["ONDO","MKR","PENDLE","CFG","TBT"],
      signal:    "Institutional narratives driving capital. TradFi integration signals maturing.",
      change7d:  +11,
    },
    {
      id:        "layer1",
      name:      "Layer 1",
      category:  "Layer 1",
      icon:      "⛓",
      color:     T.purple,
      score:     66,
      heat:      "Warm",
      momentum:  "Stable",
      lifecycle: "Mature",
      capitalFlow: -0.3,
      volume7d:  8.4,
      dominance: 18,
      description: "Base layer blockchain ecosystems competing for developer and user mindshare.",
      topTokens: ["SOL","ETH","AVAX","SUI","APT"],
      signal:    "Mature narrative. Rotation within L1s rather than into sector. Solana maintaining dominance.",
      change7d:  +2,
    },
    {
      id:        "defi",
      name:      "DeFi",
      category:  "DeFi",
      icon:      "⚡",
      color:     T.warm,
      score:     58,
      heat:      "Warm",
      momentum:  "Stable",
      lifecycle: "Mature",
      capitalFlow: -0.8,
      volume7d:  5.2,
      dominance: 14,
      description: "Decentralized protocols for trading, lending, yield and liquidity.",
      topTokens: ["UNI","AAVE","JUP","DRIFT","RAY"],
      signal:    "Mature cycle. TVL recovering but attention consolidating to established protocols.",
      change7d:  -1,
    },
    {
      id:        "gaming",
      name:      "Gaming",
      category:  "Gaming",
      icon:      "🎮",
      color:     "#e040fb",
      score:     52,
      heat:      "Warm",
      momentum:  "Rising",
      lifecycle: "Early Growth",
      capitalFlow: +0.9,
      volume7d:  1.4,
      dominance: 7,
      description: "Blockchain gaming, play-to-earn, digital ownership and virtual economies.",
      topTokens: ["IMX","RONIN","BEAM","MAGIC","GALA"],
      signal:    "Early growth recovery. New titles launching on Solana driving fresh attention.",
      change7d:  +8,
    },
    {
      id:        "infra",
      name:      "Infrastructure",
      category:  "Infrastructure",
      icon:      "🔧",
      color:     T.cyan,
      score:     62,
      heat:      "Warm",
      momentum:  "Stable",
      lifecycle: "Expanding",
      capitalFlow: +0.4,
      volume7d:  3.1,
      dominance: 10,
      description: "Cross-chain bridges, oracles, data availability, and developer tooling.",
      topTokens: ["LINK","PYTH","JTO","JITO","WORMHOLE"],
      signal:    "Steady expansion. Oracle and data infrastructure showing renewed institutional interest.",
      change7d:  +4,
    },
    {
      id:        "layer2",
      name:      "Layer 2",
      category:  "Layer 2",
      icon:      "⬡",
      color:     "#00b4d8",
      score:     55,
      heat:      "Warm",
      momentum:  "Falling",
      lifecycle: "Saturated",
      capitalFlow: -1.2,
      volume7d:  2.8,
      dominance: 8,
      description: "Ethereum scaling solutions, rollups, and execution environment competition.",
      topTokens: ["ARB","OP","STRK","BASE","BLAST"],
      signal:    "Saturation phase. Token unlocks creating sell pressure. Attention rotating to alternative L1s.",
      change7d:  -6,
    },
    {
      id:        "meme",
      name:      "Memecoins",
      category:  "Memecoins",
      icon:      "🐸",
      color:     T.gold,
      score:     45,
      heat:      "Cold",
      momentum:  "Falling",
      lifecycle: "Declining",
      capitalFlow: -1.9,
      volume7d:  6.1,
      dominance: 11,
      description: "Community-driven tokens with cultural and speculative characteristics.",
      topTokens: ["DOGE","SHIB","BONK","WIF","PEPE"],
      signal:    "Cycle peak has passed. Volume declining, smart money exiting. Watch for next catalyst.",
      change7d:  -12,
    },
  ].sort((a,b) => b.score - a.score);
}

// ─── AI SUMMARY GENERATOR ─────────────────────────────────────
function generateSummary(narratives) {
  const top      = narratives.filter(n => n.momentum === "Rising").slice(0,3);
  const falling  = narratives.filter(n => n.momentum === "Falling").slice(0,2);
  const emerging = narratives.filter(n => n.lifecycle === "Early Growth" || n.lifecycle === "Emerging");
  const sat      = narratives.filter(n => n.lifecycle === "Saturated" || n.lifecycle === "Declining");

  const topNames    = top.map(n=>n.name).join(", ");
  const fallingNames= falling.map(n=>n.name).join(" and ");
  const emergeNames = emerging.map(n=>n.name).join(", ");

  return [
    `${topNames} are currently attracting the strongest capital flows and attention signals across monitored intelligence channels.`,
    emerging.length > 0
      ? `${emergeNames} remain in early growth phases — smart money positioning is detectable but pre-mainstream.`
      : "",
    falling.length > 0
      ? `${fallingNames} show weakening momentum signals, consistent with capital rotation toward higher-attention narratives.`
      : "",
    `Current cycle favors infrastructure and utility narratives over pure speculative momentum plays.`,
  ].filter(Boolean).join(" ");
}

// ─── HELPERS ──────────────────────────────────────────────────
function ScoreBadge({ score, color, size = "md" }) {
  const sz = size === "sm" ? ".7rem" : size === "lg" ? "1.4rem" : "1rem";
  return (
    <div style={{
      fontFamily: T.font, fontSize: sz, fontWeight: 900,
      color, lineHeight:1,
      textShadow: `0 0 16px ${color}77`,
    }}>
      {score}
    </div>
  );
}

function HeatBadge({ heat, size = "sm" }) {
  const h  = HEAT[heat] || HEAT.Cold;
  const sz = size === "lg" ? ".42rem" : ".32rem";
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:".3rem",
      padding:".15rem .55rem", borderRadius:"50px",
      border:`1px solid ${h.color}44`,
      background:`${h.color}0e`,
      fontFamily:T.font, fontSize:sz, letterSpacing:".16em", color:h.color,
      whiteSpace:"nowrap",
    }}>
      <span style={{ width:"5px", height:"5px", borderRadius:"50%", background:h.color, boxShadow:`0 0 6px ${h.color}`, display:"inline-block", animation:"nr-blink 1.4s infinite" }}/>
      {h.label}
    </span>
  );
}

function MomentumArrow({ momentum }) {
  const m = MOMENTUM[momentum] || MOMENTUM.Stable;
  return (
    <span style={{ fontFamily:T.font, fontSize:".9rem", color:m.color, fontWeight:900, lineHeight:1 }}>
      {m.icon}
    </span>
  );
}

function LifecyclePill({ stage }) {
  const lc = LIFECYCLE[stage];
  if (!lc) return null;
  return (
    <span style={{
      padding:".14rem .55rem", borderRadius:"50px",
      border:`1px solid ${lc.color}35`,
      background:`${lc.color}0c`,
      fontFamily:T.font, fontSize:".3rem", letterSpacing:".16em", color:lc.color,
      whiteSpace:"nowrap",
    }}>
      {stage.toUpperCase()}
    </span>
  );
}

function ProgressBar({ value, color, height = 4, animated = true }) {
  return (
    <div style={{ height, borderRadius:"99px", background:"rgba(255,255,255,.07)", overflow:"hidden" }}>
      <div style={{
        width:`${Math.min(100,Math.max(0,value))}%`, height:"100%",
        background:`linear-gradient(to right,${color}66,${color})`,
        borderRadius:"99px",
        transition: animated ? "width 1.2s cubic-bezier(.4,0,.2,1)" : "none",
        position:"relative", overflow:"hidden",
      }}>
        <div style={{ position:"absolute", top:0, bottom:0, width:"30%", background:"linear-gradient(to right,transparent,rgba(255,255,255,.18),transparent)", animation:"nr-shimmer 2.5s ease 1s infinite" }}/>
      </div>
    </div>
  );
}

// ─── LIFECYCLE TRACK ─────────────────────────────────────────
function LifecycleTrack({ stage }) {
  const stages  = Object.keys(LIFECYCLE);
  const current = stages.indexOf(stage);
  return (
    <div style={{ display:"flex", alignItems:"center", gap:0, width:"100%" }}>
      {stages.map((s,i) => {
        const lc     = LIFECYCLE[s];
        const active = i === current;
        const past   = i < current;
        return (
          <div key={s} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:".25rem", position:"relative" }}>
            {/* Connector line */}
            {i > 0 && (
              <div style={{
                position:"absolute", left:0, right:"50%", top:"6px", height:"2px",
                background: past||active ? `${LIFECYCLE[stages[i-1]].color}66` : "rgba(255,255,255,.08)",
              }}/>
            )}
            {i < stages.length-1 && (
              <div style={{
                position:"absolute", left:"50%", right:0, top:"6px", height:"2px",
                background: past ? `${lc.color}66` : "rgba(255,255,255,.08)",
              }}/>
            )}
            {/* Node */}
            <div style={{
              width:"14px", height:"14px", borderRadius:"50%", flexShrink:0, zIndex:1,
              border:`2px solid ${active ? lc.color : past ? lc.color+"66" : "rgba(255,255,255,.12)"}`,
              background: active ? lc.color : past ? `${lc.color}22` : "rgba(0,0,0,.5)",
              boxShadow: active ? `0 0 12px ${lc.color}66` : "none",
              transition:"all .3s",
            }}/>
            {/* Label */}
            <div style={{
              fontFamily:T.font, fontSize:".24rem", letterSpacing:".1em", textAlign:"center",
              color: active ? lc.color : "rgba(255,255,255,.28)",
              lineHeight:1.2, maxWidth:"44px",
            }}>
              {s.toUpperCase()}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── NARRATIVE CARD ───────────────────────────────────────────
function NarrativeCard({ narrative, rank, expanded, onToggle }) {
  const h  = HEAT[narrative.heat]     || HEAT.Cold;
  const m  = MOMENTUM[narrative.momentum] || MOMENTUM.Stable;
  const lc = LIFECYCLE[narrative.lifecycle];

  return (
    <div
      onClick={() => onToggle(narrative.id)}
      style={{
        borderRadius:"14px",
        border:`1px solid ${expanded ? narrative.color+"44" : narrative.color+"1c"}`,
        background: expanded ? `${narrative.color}07` : "rgba(0,0,0,.48)",
        backdropFilter:"blur(12px)",
        cursor:"pointer",
        transition:"all .28s",
        position:"relative", overflow:"hidden",
        boxShadow: expanded ? `0 0 32px ${narrative.color}14` : "none",
        animation:"nr-fade .4s ease",
      }}
      onMouseEnter={e=>{if(!expanded){e.currentTarget.style.borderColor=`${narrative.color}38`;e.currentTarget.style.boxShadow=`0 0 24px ${narrative.color}10`;}}}
      onMouseLeave={e=>{if(!expanded){e.currentTarget.style.borderColor=`${narrative.color}1c`;e.currentTarget.style.boxShadow="none";}}}
    >
      {/* Top line */}
      <div style={{ position:"absolute", top:0, left:"10%", right:"10%", height:"1px", background:`linear-gradient(to right,transparent,${narrative.color}${expanded?"55":"22"},transparent)`, transition:"opacity .3s" }}/>

      {/* Main row */}
      <div style={{ padding:"1.1rem 1.4rem", display:"flex", alignItems:"center", gap:"1rem" }}>
        {/* Rank */}
        <div style={{ fontFamily:T.font, fontSize:"1.2rem", fontWeight:900, color:`${narrative.color}25`, width:"28px", flexShrink:0, lineHeight:1 }}>
          {String(rank).padStart(2,"0")}
        </div>

        {/* Icon */}
        <div style={{ fontSize:"1.4rem", flexShrink:0, filter:`drop-shadow(0 0 8px ${narrative.color}44)` }}>
          {narrative.icon}
        </div>

        {/* Name + badges */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:T.font, fontSize:"clamp(.6rem,2vw,.75rem)", fontWeight:700, color: expanded?"#fff":narrative.color, letterSpacing:".1em", marginBottom:".35rem", transition:"color .2s", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {narrative.name}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:".4rem", flexWrap:"wrap" }}>
            <HeatBadge heat={narrative.heat}/>
            <LifecyclePill stage={narrative.lifecycle}/>
          </div>
        </div>

        {/* Score + momentum */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:".2rem", flexShrink:0 }}>
          <ScoreBadge score={narrative.score} color={narrative.color}/>
          <div style={{ display:"flex", alignItems:"center", gap:".25rem" }}>
            <MomentumArrow momentum={narrative.momentum}/>
            <span style={{ fontFamily:T.font, fontSize:".3rem", color:m.color, letterSpacing:".1em" }}>{m.label}</span>
          </div>
        </div>

        {/* Expand indicator */}
        <span style={{ fontFamily:T.font, fontSize:".38rem", color:`${narrative.color}55`, flexShrink:0, transition:"transform .25s", display:"inline-block", transform:expanded?"rotate(180deg)":"rotate(0)" }}>▼</span>
      </div>

      {/* Score bar */}
      <div style={{ padding:"0 1.4rem .9rem" }}>
        <ProgressBar value={narrative.score} color={narrative.color} height={3}/>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding:"0 1.4rem 1.4rem", animation:"nr-fade .3s ease", borderTop:`1px solid ${narrative.color}12` }}>
          <div style={{ paddingTop:"1rem" }}>

            {/* Description */}
            <p style={{ fontFamily:T.body, fontSize:".92rem", color:"rgba(255,255,255,.52)", lineHeight:1.75, letterSpacing:".04em", marginBottom:"1.2rem" }}>
              {narrative.description}
            </p>

            {/* Lifecycle track */}
            <div style={{ marginBottom:"1.4rem" }}>
              <div style={{ fontFamily:T.font, fontSize:".32rem", letterSpacing:".2em", color:"rgba(255,255,255,.28)", marginBottom:".8rem" }}>LIFECYCLE POSITION</div>
              <LifecycleTrack stage={narrative.lifecycle}/>
              <div style={{ marginTop:".6rem", fontFamily:T.body, fontSize:".82rem", color:`${lc.color}aa`, letterSpacing:".05em" }}>
                {lc.desc}
              </div>
            </div>

            {/* Stats */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,110px),1fr))", gap:".6rem", marginBottom:"1.2rem" }}>
              {[
                { label:"SCORE",     val:narrative.score,              color:narrative.color,  sub:"/ 100"          },
                { label:"7D CHANGE", val:(narrative.change7d>=0?"+":"")+narrative.change7d+"%", color:narrative.change7d>=0?T.ok:T.danger, sub:"momentum"    },
                { label:"DOMINANCE", val:narrative.dominance+"%",      color:narrative.color,  sub:"attention share" },
                { label:"CAP FLOW",  val:(narrative.capitalFlow>=0?"+":"")+narrative.capitalFlow+"B", color:narrative.capitalFlow>=0?T.ok:T.danger, sub:"7d rotation" },
              ].map((s,i) => (
                <div key={i} style={{ padding:".7rem .9rem", borderRadius:"9px", border:`1px solid ${s.color}18`, background:`${s.color}06`, textAlign:"center" }}>
                  <div style={{ fontFamily:T.font, fontSize:".28rem", letterSpacing:".18em", color:"rgba(255,255,255,.28)", marginBottom:".3rem" }}>{s.label}</div>
                  <div style={{ fontFamily:T.body, fontSize:".95rem", fontWeight:700, color:s.color, marginBottom:".15rem" }}>{s.val}</div>
                  <div style={{ fontFamily:T.body, fontSize:".72rem", color:"rgba(255,255,255,.25)" }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Top tokens */}
            <div style={{ marginBottom:"1rem" }}>
              <div style={{ fontFamily:T.font, fontSize:".3rem", letterSpacing:".2em", color:"rgba(255,255,255,.28)", marginBottom:".55rem" }}>TOP TOKENS</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:".4rem" }}>
                {narrative.topTokens.map((t,i) => (
                  <span key={i} style={{ padding:".22rem .65rem", borderRadius:"6px", border:`1px solid ${narrative.color}28`, background:`${narrative.color}0a`, fontFamily:T.font, fontSize:".32rem", letterSpacing:".12em", color:narrative.color }}>
                    ${t}
                  </span>
                ))}
              </div>
            </div>

            {/* Signal */}
            <div style={{ padding:".8rem 1rem", borderRadius:"9px", border:`1px solid ${narrative.color}18`, background:`${narrative.color}07` }}>
              <span style={{ fontFamily:T.font, fontSize:".3rem", letterSpacing:".18em", color:`${narrative.color}88` }}>⊙ INTELLIGENCE SIGNAL: </span>
              <span style={{ fontFamily:T.body, fontSize:".88rem", color:"rgba(255,255,255,.55)", letterSpacing:".04em" }}>{narrative.signal}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CAPITAL FLOW SECTION ─────────────────────────────────────
function CapitalFlow({ narratives }) {
  const sorted = [...narratives].sort((a,b) => b.capitalFlow - a.capitalFlow);
  const max    = Math.max(...sorted.map(n => Math.abs(n.capitalFlow)));

  return (
    <div>
      <div style={{ display:"flex", flexDirection:"column", gap:".55rem" }}>
        {sorted.map(n => {
          const pct  = max > 0 ? Math.abs(n.capitalFlow) / max * 100 : 0;
          const pos  = n.capitalFlow >= 0;
          return (
            <div key={n.id} style={{ display:"grid", gridTemplateColumns:"130px 1fr auto", gap:".8rem", alignItems:"center" }}>
              {/* Name */}
              <div style={{ display:"flex", alignItems:"center", gap:".5rem", minWidth:0 }}>
                <span style={{ fontSize:".85rem", flexShrink:0 }}>{n.icon}</span>
                <span style={{ fontFamily:T.font, fontSize:".38rem", color:"rgba(255,255,255,.6)", letterSpacing:".08em", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {n.name.split(" ")[0].toUpperCase()}
                </span>
              </div>
              {/* Bar */}
              <div style={{ position:"relative", height:"8px", borderRadius:"99px", background:"rgba(255,255,255,.05)", overflow:"hidden" }}>
                <div style={{
                  position:"absolute",
                  left: pos ? "50%" : `calc(50% - ${pct/2}%)`,
                  width: `${pct/2}%`,
                  height:"100%",
                  background: pos
                    ? `linear-gradient(to right,${T.ok}66,${T.ok})`
                    : `linear-gradient(to left,${T.danger}66,${T.danger})`,
                  borderRadius:"99px",
                  transition:"width 1s ease",
                }}/>
                {/* Center line */}
                <div style={{ position:"absolute", left:"50%", width:"1px", height:"100%", background:"rgba(255,255,255,.15)" }}/>
              </div>
              {/* Value */}
              <span style={{
                fontFamily:T.font, fontSize:".42rem", fontWeight:700,
                color: pos ? T.ok : T.danger,
                letterSpacing:".1em", minWidth:"50px", textAlign:"right",
              }}>
                {pos?"+":""}{n.capitalFlow}B
              </span>
            </div>
          );
        })}
      </div>
      <p style={{ fontFamily:T.body, fontSize:".75rem", color:"rgba(255,255,255,.2)", marginTop:".9rem", letterSpacing:".07em" }}>
        Capital rotation estimated from 7-day on-chain and market data signals.
      </p>
    </div>
  );
}

// ─── LIFECYCLE OVERVIEW ───────────────────────────────────────
function LifecycleOverview({ narratives }) {
  const byStage = {};
  Object.keys(LIFECYCLE).forEach(s => { byStage[s] = []; });
  narratives.forEach(n => { if (byStage[n.lifecycle]) byStage[n.lifecycle].push(n); });

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:".7rem" }}>
      {Object.entries(byStage).map(([stage, narrs]) => {
        const lc = LIFECYCLE[stage];
        return (
          <div key={stage}>
            <div style={{ display:"flex", alignItems:"center", gap:".7rem", marginBottom:".35rem" }}>
              <div style={{ width:"10px", height:"10px", borderRadius:"50%", background:lc.color, boxShadow:`0 0 8px ${lc.color}66`, flexShrink:0 }}/>
              <span style={{ fontFamily:T.font, fontSize:".36rem", letterSpacing:".16em", color:lc.color }}>{stage.toUpperCase()}</span>
              <div style={{ flex:1, height:"1px", background:`linear-gradient(to right,${lc.color}22,transparent)` }}/>
            </div>
            {narrs.length === 0 ? (
              <div style={{ paddingLeft:"1.4rem", fontFamily:T.body, fontSize:".8rem", color:"rgba(255,255,255,.2)", letterSpacing:".06em" }}>
                — No narratives currently
              </div>
            ) : (
              <div style={{ display:"flex", flexWrap:"wrap", gap:".4rem", paddingLeft:"1.4rem" }}>
                {narrs.map(n => (
                  <span key={n.id} style={{ display:"flex", alignItems:"center", gap:".3rem", padding:".2rem .65rem", borderRadius:"6px", border:`1px solid ${n.color}28`, background:`${n.color}0a` }}>
                    <span style={{ fontSize:".75rem" }}>{n.icon}</span>
                    <span style={{ fontFamily:T.font, fontSize:".32rem", color:n.color, letterSpacing:".1em" }}>{n.name.split(" ")[0].toUpperCase()}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── AI SUMMARY ───────────────────────────────────────────────
function AISummary({ narratives }) {
  const text = useMemo(() => generateSummary(narratives), [narratives]);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:".9rem" }}>
      <p style={{ fontFamily:T.body, fontSize:"clamp(.88rem,2vw,1rem)", color:"rgba(255,255,255,.62)", lineHeight:1.8, letterSpacing:".04em" }}>
        {text}
      </p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,160px),1fr))", gap:".6rem" }}>
        {[
          { label:"STRONGEST SIGNAL", val: narratives[0]?.name || "—",      color:T.ok     },
          { label:"FASTEST RISING",   val: narratives.find(n=>n.momentum==="Rising"&&n.score>=70)?.name || "—", color:T.cyan },
          { label:"CAPITAL OUTFLOW",  val: narratives.filter(n=>n.capitalFlow<0).length + " narratives", color:T.danger },
          { label:"EMERGING",         val: narratives.filter(n=>["Emerging","Early Growth"].includes(n.lifecycle)).length + " narratives", color:T.gold },
        ].map((s,i) => (
          <div key={i} style={{ padding:".7rem .9rem", borderRadius:"9px", border:`1px solid ${s.color}18`, background:`${s.color}07` }}>
            <div style={{ fontFamily:T.font, fontSize:".28rem", letterSpacing:".2em", color:"rgba(255,255,255,.28)", marginBottom:".35rem" }}>{s.label}</div>
            <div style={{ fontFamily:T.body, fontSize:".9rem", fontWeight:700, color:s.color, letterSpacing:".04em" }}>{s.val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────
export default function NarrativeRadar() {
  const [narratives]  = useState(() => seedNarratives());
  const [expanded,    setExpanded]   = useState(null);
  const [filterHeat,  setFilterHeat] = useState("ALL");
  const [filterMom,   setFilterMom]  = useState("ALL");
  const [tab,         setTab]        = useState("rankings");
  const [lastUpdated, setLastUpdated]= useState(new Date());

  // Simulate live update tick
  useEffect(() => {
    const id = setInterval(() => setLastUpdated(new Date()), 45000);
    return () => clearInterval(id);
  }, []);

  const toggle = (id) => setExpanded(prev => prev === id ? null : id);

  const filtered = useMemo(() => {
    return narratives.filter(n => {
      if (filterHeat !== "ALL" && n.heat !== filterHeat)         return false;
      if (filterMom  !== "ALL" && n.momentum !== filterMom)      return false;
      return true;
    });
  }, [narratives, filterHeat, filterMom]);

  // Totals for header strip
  const hotCount  = narratives.filter(n=>n.heat==="Hot"||n.heat==="Explosive").length;
  const risingCount=narratives.filter(n=>n.momentum==="Rising").length;
  const avgScore  = Math.round(narratives.reduce((s,n)=>s+n.score,0)/narratives.length);

  return (
    <div style={{ minHeight:"100vh", background:T.black, color:"#fff", fontFamily:T.font, overflowX:"hidden", position:"relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-track{background:#050403;} ::-webkit-scrollbar-thumb{background:#ffd70055;}
        @keyframes nr-blink  {0%,100%{opacity:1;}50%{opacity:.2;}}
        @keyframes nr-fade   {from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
        @keyframes nr-shimmer{0%{left:-100%;}100%{left:200%;}}
        @keyframes nr-spin   {to{transform:rotate(360deg);}}
        @keyframes nr-spin-r {to{transform:rotate(-360deg);}}
        @keyframes nr-grid   {0%,100%{opacity:.014;}50%{opacity:.026;}}
        @keyframes nr-pulse  {0%,100%{opacity:.5;}50%{opacity:1;}}
        @keyframes nr-scan   {0%{top:-2px;}100%{top:102%;}}
        .nr-tab{padding:.48rem 1.1rem;border-radius:7px;border:1px solid rgba(255,255,255,.1);background:rgba(0,0,0,.35);color:rgba(255,255,255,.42);font-family:'Orbitron',monospace;font-size:.36rem;letter-spacing:.18em;cursor:pointer;transition:all .22s;white-space:nowrap;}
        .nr-tab.active{border-color:rgba(255,180,0,.45);background:rgba(255,180,0,.08);color:rgba(255,215,0,.9);}
        .nr-tab:hover:not(.active){border-color:rgba(255,255,255,.22);color:rgba(255,255,255,.65);}
        .nr-filter{padding:.3rem .75rem;border-radius:6px;border:1px solid rgba(255,255,255,.1);background:rgba(0,0,0,.3);color:rgba(255,255,255,.42);font-family:'Orbitron',monospace;font-size:.3rem;letter-spacing:.14em;cursor:pointer;transition:all .2s;white-space:nowrap;}
        .nr-filter.active{background:rgba(255,180,0,.08);}
        .panel{border-radius:16px;border:1px solid rgba(255,180,0,.14);background:rgba(0,0,0,.5);backdrop-filter:blur(12px);overflow:hidden;}
        .panel-header{padding:.9rem 1.4rem;border-bottom:1px solid rgba(255,180,0,.1);background:rgba(255,180,0,.03);display:flex;align-items:center;gap:.6rem;}
        .panel-body{padding:1.3rem 1.4rem;}
        @media(max-width:768px){
          .nr-main-grid{grid-template-columns:1fr!important;}
          .nr-sidebar{display:none;}
          .nr-tabs{overflow-x:auto;-webkit-overflow-scrolling:touch;padding-bottom:.3rem;}
          .nr-tabs::-webkit-scrollbar{height:2px;}
        }
        @media(max-width:480px){
          .nr-header-strip{grid-template-columns:1fr 1fr!important;}
        }
      `}</style>

      {/* Background */}
      <div style={{ position:"absolute", inset:0, zIndex:0, pointerEvents:"none", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(255,180,0,.014) 1px,transparent 1px),linear-gradient(90deg,rgba(255,180,0,.014) 1px,transparent 1px)", backgroundSize:"65px 65px", animation:"nr-grid 12s ease-in-out infinite" }}/>
        <div style={{ position:"absolute", top:"5%",   right:"-8%", width:"600px", height:"600px", borderRadius:"50%", background:"radial-gradient(circle,rgba(255,140,0,.04),transparent 65%)" }}/>
        <div style={{ position:"absolute", bottom:"5%", left:"-8%", width:"500px", height:"500px", borderRadius:"50%", background:"radial-gradient(circle,rgba(0,229,255,.03),transparent 65%)" }}/>
      </div>

      <div style={{ position:"relative", zIndex:10, maxWidth:"1280px", margin:"0 auto", padding:"clamp(1.5rem,4vw,3rem) clamp(1rem,4vw,2rem)" }}>

        {/* ── NAVBAR ── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"2rem", flexWrap:"wrap", gap:"1rem" }}>
          <a href="/app" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:".6rem" }}>
            <div style={{ width:"26px", height:"26px", borderRadius:"50%", background:"radial-gradient(circle,#ffd700,#ff8c00)", boxShadow:"0 0 14px rgba(255,150,0,.5)" }}/>
            <span style={{ fontFamily:T.font, fontSize:".52rem", letterSpacing:".2em", color:"rgba(255,215,0,.9)" }}>$FLASH</span>
          </a>
          <div style={{ display:"flex", gap:".45rem", flexWrap:"wrap" }}>
            {[{l:"APP HUB",href:"/app"},{l:"DASHBOARD",href:"/dashboard"},{l:"ALERTS",href:"/alerts"},{l:"ECOSYSTEM",href:"/ecosystem"}].map(b=>(
              <a key={b.l} href={b.href} style={{ textDecoration:"none" }}>
                <button style={{ padding:".34rem .85rem", borderRadius:"6px", border:"1px solid rgba(255,255,255,.1)", background:"rgba(0,0,0,.35)", color:"rgba(255,255,255,.45)", fontFamily:T.font, fontSize:".34rem", letterSpacing:".16em", cursor:"pointer", transition:"all .2s" }}
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
          <div style={{ display:"flex", alignItems:"center", gap:".8rem", marginBottom:".7rem", flexWrap:"wrap" }}>
            <div style={{ display:"flex", alignItems:"center", gap:".5rem" }}>
              <span style={{ width:"7px", height:"7px", borderRadius:"50%", background:T.ok, boxShadow:`0 0 10px ${T.ok}`, display:"inline-block", animation:"nr-blink 1.4s infinite" }}/>
              <span style={{ fontFamily:T.font, fontSize:".38rem", letterSpacing:".28em", color:"rgba(80,255,160,.7)" }}>PHASE 2 — LIVE</span>
            </div>
            <span style={{ fontFamily:T.font, fontSize:".34rem", color:"rgba(255,255,255,.2)", letterSpacing:".1em" }}>
              Updated {lastUpdated.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}
            </span>
          </div>
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:"1rem" }}>
            <div>
              <div style={{ fontFamily:T.font, fontSize:".44rem", letterSpacing:".4em", color:"rgba(255,180,0,.45)", marginBottom:".5rem" }}>INTELLIGENCE MODULE</div>
              <h1 style={{ fontFamily:T.font, fontSize:"clamp(2rem,5vw,3.2rem)", fontWeight:900, background:"linear-gradient(135deg,#fff 0%,#ffd700 45%,#ff8c00 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", letterSpacing:".08em", lineHeight:1.05 }}>
                NARRATIVE RADAR
              </h1>
              <p style={{ fontFamily:T.body, fontSize:"clamp(.88rem,2vw,1rem)", color:"rgba(255,255,255,.38)", letterSpacing:".1em", marginTop:".4rem" }}>
                Where market attention moves. Where capital rotates.
              </p>
            </div>
          </div>
        </div>

        {/* ── STATUS STRIP ── */}
        <div className="nr-header-strip" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:".7rem", marginBottom:"1.8rem" }}>
          {[
            { label:"NARRATIVES",   val: narratives.length,     color:T.gold,   sub:"tracked"    },
            { label:"HOT / EXPLOSIVE",val: hotCount,            color:T.orange, sub:"high signal" },
            { label:"RISING",       val: risingCount,           color:T.ok,     sub:"momentum up" },
            { label:"AVG SCORE",    val: avgScore+"/100",       color:T.cyan,   sub:"composite"   },
          ].map((s,i) => (
            <div key={i} style={{ padding:".9rem 1.1rem", borderRadius:"12px", border:`1px solid ${s.color}1e`, background:"rgba(0,0,0,.45)", backdropFilter:"blur(8px)" }}>
              <div style={{ fontFamily:T.font, fontSize:".3rem", letterSpacing:".2em", color:"rgba(255,255,255,.28)", marginBottom:".4rem" }}>{s.label}</div>
              <div style={{ fontFamily:T.font, fontSize:"clamp(.85rem,2.5vw,1.2rem)", fontWeight:900, color:s.color, lineHeight:1, marginBottom:".2rem" }}>{s.val}</div>
              <div style={{ fontFamily:T.body, fontSize:".75rem", color:"rgba(255,255,255,.28)" }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ── MAIN LAYOUT ── */}
        <div className="nr-main-grid" style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:"1.5rem", alignItems:"start" }}>

          {/* ── LEFT: Main content ── */}
          <div>
            {/* Tabs */}
            <div className="nr-tabs" style={{ display:"flex", gap:".4rem", marginBottom:"1.2rem", flexWrap:"wrap" }}>
              {[
                { id:"rankings",  label:"RANKINGS"        },
                { id:"lifecycle", label:"LIFECYCLE MAP"   },
                { id:"capital",   label:"CAPITAL FLOW"    },
                { id:"summary",   label:"AI SUMMARY"      },
              ].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} className={`nr-tab${tab===t.id?" active":""}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Filters (only on rankings) */}
            {tab === "rankings" && (
              <div style={{ display:"flex", gap:".4rem", marginBottom:"1rem", flexWrap:"wrap", alignItems:"center" }}>
                <span style={{ fontFamily:T.font, fontSize:".3rem", letterSpacing:".15em", color:"rgba(255,255,255,.25)", marginRight:".3rem" }}>HEAT:</span>
                {["ALL","Cold","Warm","Hot","Explosive"].map(h => (
                  <button key={h} onClick={() => setFilterHeat(h)}
                    className={`nr-filter${filterHeat===h?" active":""}`}
                    style={{ borderColor: filterHeat===h ? (HEAT[h]?.color||"rgba(255,180,0,.5)") : "rgba(255,255,255,.1)", color: filterHeat===h ? (HEAT[h]?.color||"rgba(255,215,0,.9)") : undefined }}>
                    {h}
                  </button>
                ))}
                <span style={{ fontFamily:T.font, fontSize:".3rem", letterSpacing:".15em", color:"rgba(255,255,255,.25)", margin:"0 .3rem" }}>MOM:</span>
                {["ALL","Rising","Stable","Falling"].map(m => (
                  <button key={m} onClick={() => setFilterMom(m)}
                    className={`nr-filter${filterMom===m?" active":""}`}
                    style={{ borderColor: filterMom===m ? (MOMENTUM[m]?.color||"rgba(255,180,0,.5)") : "rgba(255,255,255,.1)", color: filterMom===m ? (MOMENTUM[m]?.color||"rgba(255,215,0,.9)") : undefined }}>
                    {m}
                  </button>
                ))}
              </div>
            )}

            {/* ── RANKINGS TAB ── */}
            {tab === "rankings" && (
              <div style={{ display:"flex", flexDirection:"column", gap:".7rem" }}>
                {filtered.length === 0 ? (
                  <div style={{ textAlign:"center", padding:"3rem", border:"1px solid rgba(255,255,255,.06)", borderRadius:"12px", background:"rgba(0,0,0,.3)" }}>
                    <p style={{ fontFamily:T.body, color:"rgba(255,255,255,.3)", letterSpacing:".1em" }}>No narratives match current filters</p>
                  </div>
                ) : filtered.map((n,i) => (
                  <NarrativeCard key={n.id} narrative={n} rank={narratives.indexOf(n)+1} expanded={expanded===n.id} onToggle={toggle}/>
                ))}
              </div>
            )}

            {/* ── LIFECYCLE TAB ── */}
            {tab === "lifecycle" && (
              <div className="panel">
                <div className="panel-header">
                  <span style={{ fontSize:"1rem" }}>🔄</span>
                  <span style={{ fontFamily:T.font, fontSize:".5rem", fontWeight:700, color:T.gold, letterSpacing:".14em" }}>NARRATIVE LIFECYCLE MAP</span>
                  <div style={{ flex:1, height:"1px", background:"linear-gradient(to right,rgba(255,180,0,.22),transparent)", marginLeft:".5rem" }}/>
                </div>
                <div className="panel-body">
                  <p style={{ fontFamily:T.body, fontSize:".9rem", color:"rgba(255,255,255,.42)", letterSpacing:".07em", marginBottom:"1.4rem", lineHeight:1.7 }}>
                    Every narrative moves through a predictable lifecycle. Understanding the stage determines risk/reward positioning.
                  </p>
                  <LifecycleOverview narratives={narratives}/>
                </div>
              </div>
            )}

            {/* ── CAPITAL FLOW TAB ── */}
            {tab === "capital" && (
              <div className="panel">
                <div className="panel-header">
                  <span style={{ fontSize:"1rem" }}>💰</span>
                  <span style={{ fontFamily:T.font, fontSize:".5rem", fontWeight:700, color:T.gold, letterSpacing:".14em" }}>CAPITAL ROTATION</span>
                  <div style={{ flex:1, height:"1px", background:"linear-gradient(to right,rgba(255,180,0,.22),transparent)", marginLeft:".5rem" }}/>
                </div>
                <div className="panel-body">
                  <p style={{ fontFamily:T.body, fontSize:".9rem", color:"rgba(255,255,255,.42)", letterSpacing:".07em", marginBottom:"1.4rem", lineHeight:1.7 }}>
                    7-day estimated capital flow across narrative categories. Green = inflow, Red = outflow.
                  </p>
                  <CapitalFlow narratives={narratives}/>
                </div>
              </div>
            )}

            {/* ── AI SUMMARY TAB ── */}
            {tab === "summary" && (
              <div className="panel" style={{ border:"1px solid rgba(0,229,255,.2)", background:"linear-gradient(135deg,rgba(0,229,255,.04),rgba(0,0,0,.5))" }}>
                <div className="panel-header" style={{ background:"rgba(0,229,255,.04)", borderColor:"rgba(0,229,255,.12)" }}>
                  <span style={{ fontSize:"1rem" }}>🧠</span>
                  <div>
                    <span style={{ fontFamily:T.font, fontSize:".5rem", fontWeight:700, color:T.cyan, letterSpacing:".14em" }}>AI INTELLIGENCE SUMMARY</span>
                    <div style={{ fontFamily:T.body, fontSize:".78rem", color:"rgba(255,255,255,.3)", letterSpacing:".06em", marginTop:".1rem" }}>Narrative Radar Intelligence Engine</div>
                  </div>
                  <span style={{ width:"7px", height:"7px", borderRadius:"50%", background:T.cyan, boxShadow:`0 0 10px ${T.cyan}`, display:"inline-block", animation:"nr-blink 1.4s infinite", marginLeft:"auto" }}/>
                </div>
                <div className="panel-body">
                  <AISummary narratives={narratives}/>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="nr-sidebar" style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>

            {/* Quick Heat Map */}
            <div className="panel">
              <div className="panel-header">
                <span style={{ fontSize:".95rem" }}>🌡</span>
                <span style={{ fontFamily:T.font, fontSize:".44rem", fontWeight:700, color:T.gold, letterSpacing:".14em" }}>HEAT MAP</span>
              </div>
              <div className="panel-body">
                <div style={{ display:"flex", flexDirection:"column", gap:".5rem" }}>
                  {narratives.map(n => (
                    <div key={n.id} onClick={() => { setTab("rankings"); toggle(n.id); }}
                      style={{ display:"flex", alignItems:"center", gap:".7rem", cursor:"pointer", padding:".4rem .5rem", borderRadius:"7px", transition:"background .2s" }}
                      onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,.04)";}}
                      onMouseLeave={e=>{e.currentTarget.style.background="transparent";}}>
                      <span style={{ fontSize:".9rem", flexShrink:0 }}>{n.icon}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontFamily:T.font, fontSize:".34rem", color:"rgba(255,255,255,.65)", letterSpacing:".08em", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginBottom:".2rem" }}>
                          {n.name.split(" ")[0].toUpperCase()}
                        </div>
                        <ProgressBar value={n.score} color={HEAT[n.heat].color} height={2} animated={false}/>
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:".15rem", flexShrink:0 }}>
                        <span style={{ fontFamily:T.font, fontSize:".55rem", fontWeight:700, color:n.color }}>{n.score}</span>
                        <MomentumArrow momentum={n.momentum}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Capital Rotation Summary */}
            <div className="panel">
              <div className="panel-header">
                <span style={{ fontSize:".95rem" }}>💰</span>
                <span style={{ fontFamily:T.font, fontSize:".44rem", fontWeight:700, color:T.gold, letterSpacing:".14em" }}>ROTATION</span>
              </div>
              <div className="panel-body">
                <div style={{ display:"flex", flexDirection:"column", gap:".5rem" }}>
                  {[
                    { label:"INFLOW",  items:narratives.filter(n=>n.capitalFlow>0.5).map(n=>n.name.split(" ")[0]),  color:T.ok,     icon:"↑" },
                    { label:"NEUTRAL", items:narratives.filter(n=>Math.abs(n.capitalFlow)<=0.5).map(n=>n.name.split(" ")[0]), color:"rgba(255,255,255,.4)", icon:"→" },
                    { label:"OUTFLOW", items:narratives.filter(n=>n.capitalFlow<-0.5).map(n=>n.name.split(" ")[0]), color:T.danger, icon:"↓" },
                  ].map((row,i) => (
                    <div key={i}>
                      <div style={{ display:"flex", alignItems:"center", gap:".4rem", marginBottom:".3rem" }}>
                        <span style={{ fontFamily:T.font, fontSize:".7rem", color:row.color, fontWeight:900 }}>{row.icon}</span>
                        <span style={{ fontFamily:T.font, fontSize:".32rem", letterSpacing:".18em", color:row.color }}>{row.label}</span>
                      </div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:".3rem", paddingLeft:"1.2rem" }}>
                        {row.items.length === 0
                          ? <span style={{ fontFamily:T.body, fontSize:".78rem", color:"rgba(255,255,255,.2)" }}>—</span>
                          : row.items.map((name,j) => (
                            <span key={j} style={{ fontFamily:T.font, fontSize:".28rem", letterSpacing:".1em", color:`${row.color}cc`, padding:".1rem .4rem", borderRadius:"4px", background:`${row.color}0e`, border:`1px solid ${row.color}22` }}>
                              {name.toUpperCase()}
                            </span>
                          ))
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Phase 2 badge */}
            <div style={{ padding:"1rem 1.2rem", borderRadius:"12px", border:"1px solid rgba(255,180,0,.18)", background:"linear-gradient(135deg,rgba(255,80,0,.06),rgba(0,0,0,.5))", textAlign:"center" }}>
              <div style={{ fontFamily:T.font, fontSize:".36rem", letterSpacing:".28em", color:"rgba(255,180,0,.55)", marginBottom:".5rem" }}>SOLAR FLASH</div>
              <div style={{ fontFamily:T.font, fontSize:".5rem", fontWeight:700, color:T.gold, letterSpacing:".14em", marginBottom:".5rem" }}>PHASE 2 PRODUCT</div>
              <p style={{ fontFamily:T.body, fontSize:".82rem", color:"rgba(255,255,255,.35)", lineHeight:1.6, marginBottom:".9rem" }}>
                Narrative Radar V1 — intelligence foundation for future phases.
              </p>
              <a href="/ecosystem" style={{ textDecoration:"none" }}>
                <button style={{ width:"100%", padding:".55rem", borderRadius:"7px", border:"1px solid rgba(255,180,0,.3)", background:"rgba(255,180,0,.06)", color:"rgba(255,215,0,.8)", fontFamily:T.font, fontSize:".36rem", letterSpacing:".18em", cursor:"pointer", transition:"all .3s" }}
                  onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 0 22px rgba(255,180,0,.2)";}}
                  onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";}}>
                  VIEW ECOSYSTEM →
                </button>
              </a>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign:"center", padding:"1.5rem 0 0", marginTop:"2rem", borderTop:"1px solid rgba(255,255,255,.05)" }}>
          <p style={{ fontFamily:T.body, fontSize:".75rem", color:"rgba(255,255,255,.18)", letterSpacing:".1em" }}>
            Narrative Radar V1 — Solar Flash Phase 2 Intelligence — Data is indicative — Not financial advice
          </p>
        </div>

      </div>
    </div>
  );
}
