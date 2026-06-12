/**
 * OpportunityScanner.jsx — Solar Flash Phase 2 Final Product
 * Opportunity Scanner V1 — The Discovery Layer
 * Route: /scanner
 *
 * Visual Identity: Signal Observatory
 * NOT orbits. NOT constellations. NOT radar charts.
 * Signal pulses. Detection waves. Discovery beacons.
 */

import { useState, useEffect, useRef, useMemo, useCallback } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────
const T = {
  // Primary palette — Signal Observatory
  beacon:  "#00e5ff",   // detection signal
  pulse:   "#7b61ff",   // intelligence pulse
  signal:  "#50ffa0",   // positive signal
  warn:    "#ffaa00",   // caution signal
  danger:  "#ff4444",   // risk signal
  gold:    "#ffd700",   // opportunity highlight
  dim:     "rgba(255,255,255,.35)",
  black:   "#050403",
  // Typography
  font:    "'Orbitron', monospace",
  body:    "'Rajdhani', sans-serif",
};

// ─── OPPORTUNITY DATA ─────────────────────────────────────────
// Each opportunity synthesizes: Narrative + Smart Money + Market + Token intelligence
const OPPORTUNITIES = [
  {
    id:        "ai-infra",
    rank:       1,
    name:       "AI Infrastructure",
    token:      "TAO / FET / RNDR",
    icon:       "🧠",
    oppScore:   94,
    confidence: 89,
    narrative:  "AI",
    stage:      "Expanding",
    risk:       "Low",
    momentum:   "Rising",
    smStatus:   "Aggressive Accumulation",
    intelligence: {
      narrative:  88,
      smartMoney: 91,
      market:     82,
      tokenHealth:79,
    },
    why: "AI Infrastructure is receiving the strongest combined intelligence signal in the current cycle. Smart money accumulation is persistent and structured. Narrative score at multi-month high. Capital rotation strongly favoring this sector over DeFi and Layer 2.",
    aiSignal: "Multiple High Conviction wallets are building concentrated positions. Narrative momentum shows no signs of saturation. Risk-adjusted opportunity signal is the highest across all monitored categories.",
    change7d: +22,
    capital:  "Strong Inflow",
    beacon:   T.beacon,
  },
  {
    id:        "depin-expansion",
    rank:       2,
    name:       "DePIN Expansion",
    token:      "HNT / IOTX / MOBILE",
    icon:       "📡",
    oppScore:   81,
    confidence: 76,
    narrative:  "DePIN",
    stage:      "Early Growth",
    risk:       "Low",
    momentum:   "Rising",
    smStatus:   "Accumulation",
    intelligence: {
      narrative:  74,
      smartMoney: 78,
      market:     69,
      tokenHealth:72,
    },
    why: "DePIN remains in early growth phase with genuine real-world utility driving adoption. Smart money is consistently accumulating across the sector. Narrative not yet mainstream — discovery window still open.",
    aiSignal: "Growth Cluster wallets rotating from DeFi into DePIN. Activity pattern matches prior early-cycle positioning. Capital conviction growing steadily over 30-day window.",
    change7d: +15,
    capital:  "Strong Inflow",
    beacon:   T.signal,
  },
  {
    id:        "rwa-tokenization",
    rank:       3,
    name:       "RWA Tokenization",
    token:      "ONDO / MKR / PENDLE",
    icon:       "🏛",
    oppScore:   77,
    confidence: 72,
    narrative:  "RWA",
    stage:      "Early Growth",
    risk:       "Low",
    momentum:   "Rising",
    smStatus:   "Accumulation",
    intelligence: {
      narrative:  71,
      smartMoney: 72,
      market:     74,
      tokenHealth:68,
    },
    why: "Real World Asset tokenization is attracting institutional-quality capital. TradFi integration signals are accelerating. Smart money positioning suggests early-cycle conviction. Narrative has long-term structural tailwinds.",
    aiSignal: "High Conviction cluster wallets entering with long-horizon positioning. Not momentum-driven — fundamental capital allocation signal. Strongest institutional intelligence score in portfolio.",
    change7d: +11,
    capital:  "Moderate Inflow",
    beacon:   T.gold,
  },
  {
    id:        "gaming-recovery",
    rank:       4,
    name:       "Gaming Recovery",
    token:      "IMX / RONIN / BEAM",
    icon:       "🎮",
    oppScore:   63,
    confidence: 58,
    narrative:  "Gaming",
    stage:      "Early Growth",
    risk:       "Moderate",
    momentum:   "Rising",
    smStatus:   "Accumulation",
    intelligence: {
      narrative:  52,
      smartMoney: 54,
      market:     61,
      tokenHealth:55,
    },
    why: "Gaming narrative is in early recovery after a prolonged contraction cycle. Smart wallets with prior gaming wins are re-entering. New Solana-native titles creating fresh attention. Timing intelligence suggests early-cycle entry window.",
    aiSignal: "Speculative cluster wallets positioning in gaming. Conviction moderate — not yet confirmed by High Conviction cluster. Monitor for confirmation from larger capital pools before increasing exposure.",
    change7d: +8,
    capital:  "Moderate Inflow",
    beacon:   "#e040fb",
  },
  {
    id:        "sol-infra",
    rank:       5,
    name:       "Solana Ecosystem",
    token:      "JUP / JITO / DRIFT",
    icon:       "☀️",
    oppScore:   61,
    confidence: 65,
    narrative:  "Infrastructure",
    stage:      "Expanding",
    risk:       "Low",
    momentum:   "Stable",
    smStatus:   "Accumulation",
    intelligence: {
      narrative:  62,
      smartMoney: 65,
      market:     58,
      tokenHealth:63,
    },
    why: "Solana-native infrastructure protocols benefit from continued ecosystem growth and DePIN/AI narrative tailwinds. Smart money maintaining positions. Protocol fundamentals improving. Risk-adjusted profile attractive relative to alternatives.",
    aiSignal: "Infrastructure capital flowing steadily. No aggressive positioning — measured accumulation by Growth Cluster wallets. Solana ecosystem metrics continue compounding favorably.",
    change7d: +5,
    capital:  "Moderate Inflow",
    beacon:   T.beacon,
  },
  {
    id:        "l1-rotation",
    rank:       6,
    name:       "L1 Internal Rotation",
    token:      "SOL / SUI / APT",
    icon:       "⛓",
    oppScore:   52,
    confidence: 55,
    narrative:  "Layer 1",
    stage:      "Mature",
    risk:       "Moderate",
    momentum:   "Stable",
    smStatus:   "Neutral",
    intelligence: {
      narrative:  66,
      smartMoney: 58,
      market:     61,
      tokenHealth:57,
    },
    why: "Internal rotation within L1 sector presents selective opportunity. Solana maintaining dominance while newer chains show early momentum. Smart money net-flat but Solana-specific signals stronger than sector average.",
    aiSignal: "Within L1 sector: Solana showing divergence from peers. Capital rotating from ETH-ecosystem L1s toward Solana. Selective opportunity — not broad L1 exposure.",
    change7d: +2,
    capital:  "Neutral",
    beacon:   T.pulse,
  },
  {
    id:        "defi-selective",
    rank:       7,
    name:       "DeFi Selective",
    token:      "UNI / AAVE / JUP",
    icon:       "⚡",
    oppScore:   44,
    confidence: 46,
    narrative:  "DeFi",
    stage:      "Mature",
    risk:       "Moderate",
    momentum:   "Stable",
    smStatus:   "Neutral",
    intelligence: {
      narrative:  58,
      smartMoney: 48,
      market:     52,
      tokenHealth:54,
    },
    why: "DeFi sector is mature with capital rotating out toward AI and DePIN. Selective opportunities exist in protocols with strong fundamentals and TVL growth. Broad DeFi exposure carries opportunity cost versus higher-momentum narratives.",
    aiSignal: "Mature cycle, declining relative opportunity. Capital outflow from DeFi to AI narrative is measurable and persistent. Only protocol-specific opportunities merit attention at this stage.",
    change7d: -1,
    capital:  "Neutral",
    beacon:   T.warn,
  },
  {
    id:        "l2-caution",
    rank:       8,
    name:       "Layer 2 Caution",
    token:      "ARB / OP / STRK",
    icon:       "⬡",
    oppScore:   28,
    confidence: 40,
    narrative:  "Layer 2",
    stage:      "Saturated",
    risk:       "Elevated",
    momentum:   "Falling",
    smStatus:   "Distribution",
    intelligence: {
      narrative:  55,
      smartMoney: 35,
      market:     42,
      tokenHealth:38,
    },
    why: "Layer 2 sector is in saturation phase with systematic smart money distribution. Token unlock pressure is creating supply overhang. Capital rotating to alternative L1s. Intelligence signals do not support new position entry.",
    aiSignal: "Distribution Cluster wallets persistently exiting L2 positions. Signal is not panic — it is methodical. Historically similar patterns preceded extended underperformance periods. Exercise caution.",
    change7d: -6,
    capital:  "Moderate Outflow",
    beacon:   T.warn,
  },
  {
    id:        "meme-avoid",
    rank:       9,
    name:       "Memecoins — Cycle Peak",
    token:      "WIF / BONK / DOGE",
    icon:       "🐸",
    oppScore:   12,
    confidence: 72,
    narrative:  "Memecoins",
    stage:      "Declining",
    risk:       "High",
    momentum:   "Falling",
    smStatus:   "Aggressive Distribution",
    intelligence: {
      narrative:  45,
      smartMoney: 18,
      market:     38,
      tokenHealth:32,
    },
    why: "Memecoin cycle peak has passed. Smart money has exited. High volume is retail-driven, not conviction. Distribution signals are among the strongest currently detected. Discovery layer classifies this as: avoid.",
    aiSignal: "Strongest negative signal in current scan. Smart money distribution is aggressive and coordinated. Volume is misleading — it represents retail chasing, not informed capital. Intelligence conclusion: no opportunity detected.",
    change7d: -14,
    capital:  "Strong Outflow",
    beacon:   T.danger,
  },
];

// ─── SCORE METADATA ───────────────────────────────────────────
function scoreColor(score) {
  if (score >= 80) return T.signal;
  if (score >= 65) return T.beacon;
  if (score >= 50) return T.gold;
  if (score >= 35) return T.warn;
  return T.danger;
}

const RISK_META = {
  "Low":      { color:T.signal,  label:"LOW RISK"      },
  "Moderate": { color:T.gold,    label:"MODERATE RISK" },
  "Elevated": { color:T.warn,    label:"ELEVATED RISK" },
  "High":     { color:T.danger,  label:"HIGH RISK"     },
};

const STAGE_META = {
  "Emerging":    { color:T.beacon, order:1 },
  "Early Growth":{ color:T.signal, order:2 },
  "Expanding":   { color:T.gold,   order:3 },
  "Mature":      { color:T.warn,   order:4 },
  "Saturated":   { color:"#ff8c00",order:5 },
  "Declining":   { color:T.danger, order:6 },
};

const CAPITAL_META = {
  "Strong Inflow":    { color:T.signal, icon:"⬆⬆" },
  "Moderate Inflow":  { color:T.beacon, icon:"⬆"  },
  "Neutral":          { color:T.dim,    icon:"→"  },
  "Moderate Outflow": { color:T.warn,   icon:"⬇"  },
  "Strong Outflow":   { color:T.danger, icon:"⬇⬇" },
};

// ─── AI SUMMARY ENGINE ────────────────────────────────────────
function generateAISummary(opps) {
  const top    = opps.filter(o=>o.oppScore>=75);
  const mid    = opps.filter(o=>o.oppScore>=50&&o.oppScore<75);
  const avoid  = opps.filter(o=>o.oppScore<35);
  const avgScore = Math.round(opps.reduce((s,o)=>s+o.oppScore,0)/opps.length);

  return {
    summary: `Discovery scan complete. ${top.length} high-conviction opportunities identified across ${top.map(o=>o.narrative).join(", ")} narratives. Combined intelligence indicates a constructive environment for selective capital deployment in early-growth narratives while avoiding saturated sectors.`,
    confidence: `Overall market intelligence confidence: ${avgScore >= 65 ? "HIGH" : avgScore >= 50 ? "MODERATE" : "LOW"}. ${top.length} opportunities scored above 75 — representing above-average signal clarity. Confidence is strongest in AI Infrastructure and DePIN, where multiple intelligence layers are converging.`,
    risk: `Risk environment: ${avoid.length} sectors showing active distribution signals. Memecoins and Layer 2 are flagged as avoid. Concentration risk is low for top-ranked opportunities. Portfolio-level risk is manageable with narrative diversification across AI, DePIN, and RWA.`,
    insight: `Key discovery insight: Capital rotation from DeFi and Memecoins into AI Infrastructure and DePIN is the primary theme of the current cycle. Smart money positioning supports 2-3 sectors with strong conviction. The discovery window for DePIN and RWA may be narrowing as institutional awareness grows.`,
  };
}

// ─── SCANNER BEAM COMPONENT ───────────────────────────────────
function ScannerBeam({ active }) {
  return (
    <div style={{ position:"relative", width:"100%", height:"3px", borderRadius:"99px", background:"rgba(0,229,255,.08)", overflow:"hidden", marginBottom:"1.5rem" }}>
      {active && (
        <>
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to right,transparent,rgba(0,229,255,.6),transparent)", animation:"os-scan-sweep 2.5s ease-in-out infinite" }}/>
          <div style={{ position:"absolute", top:"-2px", left:"-2px", right:"-2px", bottom:"-2px", boxShadow:"0 0 12px rgba(0,229,255,.3)" }}/>
        </>
      )}
    </div>
  );
}

// ─── DETECTION WAVE ───────────────────────────────────────────
function DetectionWave({ score, color, size=80 }) {
  const rings = 3;
  const intensity = score / 100;
  return (
    <div style={{ position:"relative", width:size, height:size, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      {/* Detection rings */}
      {Array.from({length:rings}).map((_,i) => (
        <div key={i} style={{
          position:"absolute",
          inset: `${i*8}px`,
          borderRadius:"50%",
          border:`1.5px solid ${color}`,
          opacity: (1 - i/rings) * intensity * 0.7,
          animation:`os-wave-ring ${1.8 + i*0.6}s ease-out infinite`,
          animationDelay:`${i*0.4}s`,
        }}/>
      ))}
      {/* Core beacon */}
      <div style={{
        width: size*0.38, height: size*0.38,
        borderRadius:"50%",
        background:`radial-gradient(circle at 40% 35%,${color}33,rgba(0,0,0,.8))`,
        border:`1.5px solid ${color}88`,
        display:"flex", alignItems:"center", justifyContent:"center",
        boxShadow:`0 0 ${size*0.2}px ${color}${Math.round(intensity*50).toString(16).padStart(2,'0')}`,
      }}>
        <span style={{ fontFamily:T.font, fontSize:size*0.14+"px", fontWeight:900, color, lineHeight:1 }}>{score}</span>
      </div>
    </div>
  );
}

// ─── INTELLIGENCE BAR ─────────────────────────────────────────
function IntelBar({ label, value, color }) {
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:".22rem" }}>
        <span style={{ fontFamily:T.font, fontSize:".3rem", letterSpacing:".14em", color:"rgba(255,255,255,.32)" }}>{label}</span>
        <span style={{ fontFamily:T.font, fontSize:".38rem", fontWeight:700, color }}>{value}</span>
      </div>
      <div style={{ height:"3px", borderRadius:"99px", background:"rgba(255,255,255,.07)", overflow:"hidden" }}>
        <div style={{
          width:`${value}%`, height:"100%",
          background:`linear-gradient(to right,${color}55,${color})`,
          borderRadius:"99px", transition:"width 1.1s cubic-bezier(.4,0,.2,1)",
          position:"relative", overflow:"hidden",
        }}>
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent)", animation:"os-shimmer 2.5s ease 1s infinite" }}/>
        </div>
      </div>
    </div>
  );
}

// ─── OPPORTUNITY CARD ─────────────────────────────────────────
function OpportunityCard({ opp, featured=false, defaultOpen=false }) {
  const [open, setOpen] = useState(defaultOpen);
  const sc  = scoreColor(opp.oppScore);
  const rm  = RISK_META[opp.risk]     || RISK_META.Low;
  const sm  = STAGE_META[opp.stage]   || STAGE_META.Emerging;
  const cm  = CAPITAL_META[opp.capital] || CAPITAL_META.Neutral;

  return (
    <div
      onClick={() => setOpen(o=>!o)}
      style={{
        borderRadius: featured ? "18px" : "14px",
        border:`1px solid ${open ? sc+"55" : sc+"22"}`,
        background: open
          ? `linear-gradient(135deg,${sc}08,rgba(0,0,0,.6))`
          : "rgba(0,0,0,.5)",
        backdropFilter:"blur(14px)",
        cursor:"pointer",
        transition:"all .3s cubic-bezier(.4,0,.2,1)",
        position:"relative", overflow:"hidden",
        boxShadow: open ? `0 4px 40px ${sc}14, 0 0 0 1px ${sc}22` : "none",
        animation:"os-card-appear .4s ease both",
      }}
      onMouseEnter={e=>{if(!open){e.currentTarget.style.borderColor=`${sc}44`;e.currentTarget.style.boxShadow=`0 4px 28px ${sc}10`;}}}
      onMouseLeave={e=>{if(!open){e.currentTarget.style.borderColor=`${sc}22`;e.currentTarget.style.boxShadow="none";}}}
    >
      {/* Top signal line */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:`linear-gradient(to right,transparent,${sc}${open?"77":"33"},transparent)`, transition:"opacity .3s" }}/>

      {/* Featured badge */}
      {featured && opp.rank === 1 && (
        <div style={{ position:"absolute", top:"12px", right:"12px", padding:".18rem .6rem", borderRadius:"50px", background:`${T.beacon}14`, border:`1px solid ${T.beacon}44`, fontFamily:T.font, fontSize:".28rem", letterSpacing:".18em", color:T.beacon }}>
          TOP SIGNAL
        </div>
      )}

      {/* ── MAIN ROW ── */}
      <div style={{ padding: featured ? "1.4rem 1.6rem" : "1.1rem 1.4rem", display:"flex", alignItems:"center", gap:"1.2rem" }}>
        {/* Detection wave */}
        <DetectionWave score={opp.oppScore} color={sc} size={featured?90:72}/>

        {/* Content */}
        <div style={{ flex:1, minWidth:0 }}>
          {/* Row 1: Rank + name */}
          <div style={{ display:"flex", alignItems:"center", gap:".6rem", marginBottom:".4rem", flexWrap:"wrap" }}>
            <span style={{ fontFamily:T.font, fontSize:"1rem", fontWeight:900, color:`${sc}28`, lineHeight:1, flexShrink:0 }}>
              #{String(opp.rank).padStart(2,"0")}
            </span>
            <span style={{ fontFamily:T.font, fontSize:"clamp(.68rem,2.5vw,featured?1rem:.82rem)", fontWeight:900, color:"rgba(255,255,255,.9)", letterSpacing:".08em" }}>
              {opp.name}
            </span>
            <span style={{ fontSize:featured?"1.3rem":"1rem", filter:`drop-shadow(0 0 8px ${sc}55)` }}>{opp.icon}</span>
          </div>

          {/* Row 2: Token */}
          <div style={{ fontFamily:T.body, fontSize:".88rem", color:"rgba(255,255,255,.38)", letterSpacing:".06em", marginBottom:".55rem" }}>
            {opp.token}
          </div>

          {/* Row 3: Badges */}
          <div style={{ display:"flex", gap:".4rem", flexWrap:"wrap" }}>
            {/* Risk */}
            <span style={{ padding:".14rem .55rem", borderRadius:"50px", border:`1px solid ${rm.color}40`, background:`${rm.color}0d`, fontFamily:T.font, fontSize:".3rem", letterSpacing:".14em", color:rm.color }}>
              {rm.label}
            </span>
            {/* Stage */}
            <span style={{ padding:".14rem .55rem", borderRadius:"50px", border:`1px solid ${sm.color}35`, background:`${sm.color}0a`, fontFamily:T.font, fontSize:".3rem", letterSpacing:".14em", color:sm.color }}>
              {opp.stage.toUpperCase()}
            </span>
            {/* Capital */}
            <span style={{ padding:".14rem .55rem", borderRadius:"50px", border:`1px solid ${cm.color}35`, background:`${cm.color}0a`, fontFamily:T.font, fontSize:".3rem", letterSpacing:".14em", color:cm.color }}>
              {cm.icon} {opp.capital.toUpperCase()}
            </span>
            {/* Smart Money */}
            <span style={{ padding:".14rem .55rem", borderRadius:"50px", border:"1px solid rgba(255,255,255,.12)", background:"rgba(255,255,255,.04)", fontFamily:T.font, fontSize:".3rem", letterSpacing:".1em", color:"rgba(255,255,255,.5)" }}>
              🧠 {opp.smStatus.split(" ")[0].toUpperCase()}
            </span>
          </div>
        </div>

        {/* Right: Confidence + momentum + expand */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:".4rem", flexShrink:0 }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontFamily:T.font, fontSize:".3rem", letterSpacing:".18em", color:"rgba(255,255,255,.28)", marginBottom:".2rem" }}>CONFIDENCE</div>
            <div style={{ fontFamily:T.font, fontSize:".85rem", fontWeight:700, color:`${sc}cc` }}>{opp.confidence}%</div>
          </div>
          <div style={{ fontFamily:T.font, fontSize:".75rem", fontWeight:900, color:opp.momentum==="Rising"?T.signal:opp.momentum==="Falling"?T.danger:T.dim }}>
            {opp.momentum==="Rising"?"↑":opp.momentum==="Falling"?"↓":"→"}
            <span style={{ fontSize:".28rem", letterSpacing:".12em", marginLeft:".2rem" }}>{opp.momentum.toUpperCase()}</span>
          </div>
          <span style={{ fontFamily:T.font, fontSize:".36rem", color:`${sc}55`, transition:"transform .3s", display:"inline-block", transform:open?"rotate(180deg)":"rotate(0)" }}>▼</span>
        </div>
      </div>

      {/* ── EXPANDED DETAIL ── */}
      {open && (
        <div style={{ padding:"0 1.4rem 1.4rem", borderTop:`1px solid ${sc}14`, animation:"os-reveal .3s ease" }}>
          <div style={{ paddingTop:"1.2rem", display:"flex", flexDirection:"column", gap:"1.2rem" }}>

            {/* Intelligence breakdown */}
            <div>
              <div style={{ fontFamily:T.font, fontSize:".34rem", letterSpacing:".24em", color:"rgba(255,255,255,.28)", marginBottom:".8rem" }}>
                ⊙ INTELLIGENCE BREAKDOWN
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:".7rem" }}>
                <IntelBar label="NARRATIVE STRENGTH" value={opp.intelligence.narrative}  color={T.beacon}/>
                <IntelBar label="SMART MONEY"        value={opp.intelligence.smartMoney} color={T.pulse}/>
                <IntelBar label="MARKET SIGNALS"     value={opp.intelligence.market}     color={T.gold}/>
                <IntelBar label="TOKEN HEALTH"       value={opp.intelligence.tokenHealth}color={T.signal}/>
              </div>
            </div>

            {/* Why this opportunity */}
            <div style={{ padding:"1rem 1.2rem", borderRadius:"12px", border:`1px solid ${sc}1c`, background:`${sc}07` }}>
              <div style={{ fontFamily:T.font, fontSize:".3rem", letterSpacing:".2em", color:`${sc}88`, marginBottom:".5rem" }}>
                WHY THIS OPPORTUNITY
              </div>
              <p style={{ fontFamily:T.body, fontSize:"clamp(.88rem,2vw,.98rem)", color:"rgba(255,255,255,.62)", lineHeight:1.78, letterSpacing:".04em" }}>
                {opp.why}
              </p>
            </div>

            {/* AI Signal */}
            <div style={{ padding:"1rem 1.2rem", borderRadius:"12px", border:"1px solid rgba(0,229,255,.18)", background:"rgba(0,229,255,.05)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:".5rem", marginBottom:".5rem" }}>
                <span style={{ fontFamily:T.font, fontSize:".85rem", color:T.beacon }}>🤖</span>
                <span style={{ fontFamily:T.font, fontSize:".3rem", letterSpacing:".2em", color:`${T.beacon}88` }}>AI INTELLIGENCE SIGNAL</span>
              </div>
              <p style={{ fontFamily:T.body, fontSize:".92rem", color:"rgba(255,255,255,.55)", lineHeight:1.72, letterSpacing:".04em" }}>
                {opp.aiSignal}
              </p>
            </div>

            {/* Quick stats */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:".6rem" }}>
              {[
                { label:"7D CHANGE",   val:(opp.change7d>=0?"+":"")+opp.change7d+"%", color:opp.change7d>=0?T.signal:T.danger },
                { label:"OPP SCORE",   val:`${opp.oppScore}/100`,                      color:sc          },
                { label:"NARRATIVE",   val:opp.narrative,                              color:T.beacon     },
              ].map((s,i) => (
                <div key={i} style={{ padding:".65rem .8rem", borderRadius:"9px", border:`1px solid ${s.color}18`, background:`${s.color}07`, textAlign:"center" }}>
                  <div style={{ fontFamily:T.font, fontSize:".28rem", letterSpacing:".18em", color:"rgba(255,255,255,.28)", marginBottom:".3rem" }}>{s.label}</div>
                  <div style={{ fontFamily:T.body, fontSize:".95rem", fontWeight:700, color:s.color }}>{s.val}</div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

// ─── SIGNAL OBSERVATORY (Live Scanner Status) ─────────────────
function SignalObservatory({ scanning, onScan, lastScan }) {
  return (
    <div style={{
      padding:"1.4rem 1.8rem",
      borderRadius:"16px",
      border:"1px solid rgba(0,229,255,.2)",
      background:"linear-gradient(135deg,rgba(0,229,255,.04),rgba(0,0,0,.6))",
      backdropFilter:"blur(14px)",
      position:"relative", overflow:"hidden",
      marginBottom:"1.8rem",
    }}>
      {/* Scanning animation overlay */}
      {scanning && (
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to right,transparent,rgba(0,229,255,.03),transparent)", animation:"os-scan-sweep 2s ease-in-out infinite", pointerEvents:"none" }}/>
      )}

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"1rem", flexWrap:"wrap", position:"relative", zIndex:1 }}>
        <div style={{ display:"flex", alignItems:"center", gap:"1.2rem" }}>
          {/* Beacon */}
          <div style={{ position:"relative", width:"48px", height:"48px", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:"1px solid rgba(0,229,255,.3)", animation:"os-wave-ring 2s ease-out infinite" }}/>
            <div style={{ position:"absolute", inset:"8px", borderRadius:"50%", border:"1px solid rgba(0,229,255,.2)", animation:"os-wave-ring 2s ease-out infinite", animationDelay:".5s" }}/>
            <div style={{ width:"18px", height:"18px", borderRadius:"50%", background:scanning?"rgba(0,229,255,.4)":"rgba(0,229,255,.15)", border:`2px solid ${scanning?"rgba(0,229,255,.9)":"rgba(0,229,255,.35)"}`, boxShadow:scanning?"0 0 16px rgba(0,229,255,.6)":"none", transition:"all .5s" }}/>
          </div>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:".5rem", marginBottom:".2rem" }}>
              <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:scanning?T.signal:T.beacon, boxShadow:`0 0 8px ${scanning?T.signal:T.beacon}`, animation:"os-blink 1.2s ease-in-out infinite" }}/>
              <span style={{ fontFamily:T.font, fontSize:".4rem", letterSpacing:".28em", color:scanning?"rgba(80,255,160,.8)":"rgba(0,229,255,.7)" }}>
                {scanning?"SCANNING INTELLIGENCE LAYERS…":"OBSERVATORY READY"}
              </span>
            </div>
            <div style={{ fontFamily:T.body, fontSize:".88rem", color:"rgba(255,255,255,.35)", letterSpacing:".07em" }}>
              {scanning ? "Analyzing Narrative · Smart Money · Market · Token layers" : `Last scan: ${lastScan}`}
            </div>
          </div>
        </div>

        <button onClick={onScan} disabled={scanning}
          style={{
            padding:".7rem 1.6rem", borderRadius:"10px",
            border:`1.5px solid ${scanning?"rgba(0,229,255,.2)":"rgba(0,229,255,.5)"}`,
            background: scanning ? "rgba(0,0,0,.3)" : "linear-gradient(135deg,rgba(0,229,255,.16),rgba(123,97,255,.08))",
            color: scanning ? "rgba(0,229,255,.4)" : "rgba(0,229,255,.95)",
            fontFamily:T.font, fontSize:".46rem", letterSpacing:".2em",
            cursor:scanning?"not-allowed":"pointer",
            opacity:scanning?.6:1, transition:"all .3s", fontWeight:700,
            display:"flex", alignItems:"center", gap:".6rem", flexShrink:0,
          }}
          onMouseEnter={e=>{if(!scanning){e.currentTarget.style.boxShadow="0 0 28px rgba(0,229,255,.25)";e.currentTarget.style.borderColor="rgba(0,229,255,.8)";} }}
          onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";e.currentTarget.style.borderColor=scanning?"rgba(0,229,255,.2)":"rgba(0,229,255,.5)";}}>
          {scanning ? (
            <>
              <span style={{ width:"12px", height:"12px", borderRadius:"50%", border:"2px solid rgba(0,229,255,.3)", borderTop:"2px solid rgba(0,229,255,.9)", display:"inline-block", animation:"os-spin 1s linear infinite" }}/>
              SCANNING…
            </>
          ) : "⊙ RUN SCAN"}
        </button>
      </div>

      {/* Signal beam */}
      <ScannerBeam active={scanning}/>
    </div>
  );
}

// ─── AI INTELLIGENCE SUMMARY ──────────────────────────────────
function AIOpportunitySummary({ ai }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:".8rem" }}>
      {[
        { icon:"⊙", label:"AI OPPORTUNITY SUMMARY",   color:T.beacon, text:ai.summary      },
        { icon:"📊", label:"AI CONFIDENCE ANALYSIS",  color:T.gold,   text:ai.confidence   },
        { icon:"🛡", label:"AI RISK INTERPRETATION",  color:T.warn,   text:ai.risk         },
        { icon:"✦", label:"AI DISCOVERY INSIGHTS",   color:T.pulse,  text:ai.insight      },
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
      <p style={{ fontFamily:T.body, fontSize:".75rem", color:"rgba(255,255,255,.2)", letterSpacing:".08em", textAlign:"center" }}>
        AI analysis is heuristic intelligence — not financial advice — not trading signals.
      </p>
    </div>
  );
}

// ─── SCORE OVERVIEW ───────────────────────────────────────────
function ScoreOverview({ opps }) {
  const high   = opps.filter(o=>o.oppScore>=75).length;
  const mid    = opps.filter(o=>o.oppScore>=50&&o.oppScore<75).length;
  const low    = opps.filter(o=>o.oppScore<50).length;
  const avgScr = Math.round(opps.reduce((s,o)=>s+o.oppScore,0)/opps.length);

  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,120px),1fr))", gap:".7rem", marginBottom:"1.6rem" }}>
      {[
        { label:"SCANNED",     val:opps.length,   color:T.beacon, sub:"opportunities"   },
        { label:"HIGH SIGNAL", val:high,           color:T.signal, sub:"score ≥ 75"     },
        { label:"MODERATE",    val:mid,            color:T.gold,   sub:"score 50–74"     },
        { label:"AVOID",       val:low,            color:T.danger, sub:"score < 50"      },
        { label:"AVG SCORE",   val:avgScr+"/100",  color:T.beacon, sub:"composite"       },
      ].map((s,i) => (
        <div key={i} style={{ padding:".9rem 1rem", borderRadius:"12px", border:`1px solid ${s.color}1c`, background:"rgba(0,0,0,.45)", backdropFilter:"blur(8px)" }}>
          <div style={{ fontFamily:T.font, fontSize:".3rem", letterSpacing:".2em", color:"rgba(255,255,255,.28)", marginBottom:".4rem" }}>{s.label}</div>
          <div style={{ fontFamily:T.font, fontSize:"clamp(.78rem,2.5vw,1.1rem)", fontWeight:900, color:s.color, lineHeight:1.1, marginBottom:".2rem" }}>{s.val}</div>
          <div style={{ fontFamily:T.body, fontSize:".75rem", color:"rgba(255,255,255,.28)" }}>{s.sub}</div>
        </div>
      ))}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────
export default function OpportunityScanner() {
  const [scanning,  setScanning]  = useState(false);
  const [revealed,  setRevealed]  = useState(false);
  const [tab,       setTab]       = useState("discovery");
  const [filter,    setFilter]    = useState("ALL");
  const [lastScan,  setLastScan]  = useState("Never");
  const scanTimer = useRef(null);

  const opps    = useMemo(() => OPPORTUNITIES, []);
  const ai      = useMemo(() => generateAISummary(opps), [opps]);

  // Initial scan on mount
  useEffect(() => {
    setTimeout(() => runScan(), 800);
  }, []);

  const runScan = useCallback(() => {
    setScanning(true);
    setRevealed(false);
    clearTimeout(scanTimer.current);
    scanTimer.current = setTimeout(() => {
      setScanning(false);
      setRevealed(true);
      setLastScan(new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}));
    }, 2800);
  }, []);

  const filtered = useMemo(() => {
    if (filter === "ALL")       return opps;
    if (filter === "HIGH")      return opps.filter(o=>o.oppScore>=75);
    if (filter === "RISING")    return opps.filter(o=>o.momentum==="Rising");
    if (filter === "LOW_RISK")  return opps.filter(o=>o.risk==="Low");
    if (filter === "AVOID")     return opps.filter(o=>o.oppScore<35);
    return opps;
  }, [opps, filter]);

  return (
    <div style={{ minHeight:"100vh", background:T.black, color:"#fff", fontFamily:T.font, position:"relative", overflowX:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-track{background:#050403;} ::-webkit-scrollbar-thumb{background:rgba(0,229,255,.4);}
        @keyframes os-scan-sweep { 0%{transform:translateX(-100%);} 100%{transform:translateX(100%);} }
        @keyframes os-wave-ring  { 0%{transform:scale(1);opacity:.6;} 100%{transform:scale(2);opacity:0;} }
        @keyframes os-blink      { 0%,100%{opacity:1;} 50%{opacity:.2;} }
        @keyframes os-shimmer    { 0%{left:-100%;} 100%{left:200%;} }
        @keyframes os-spin       { to{transform:rotate(360deg);} }
        @keyframes os-card-appear{ from{opacity:0;transform:translateY(10px);} to{opacity:1;transform:translateY(0);} }
        @keyframes os-reveal     { from{opacity:0;} to{opacity:1;} }
        @keyframes os-grid       { 0%,100%{opacity:.012;} 50%{opacity:.022;} }
        .os-tab{padding:.48rem 1.1rem;border-radius:7px;border:1px solid rgba(255,255,255,.1);background:rgba(0,0,0,.35);color:rgba(255,255,255,.42);font-family:'Orbitron',monospace;font-size:.36rem;letter-spacing:.18em;cursor:pointer;transition:all .22s;white-space:nowrap;}
        .os-tab.active{border-color:rgba(0,229,255,.45);background:rgba(0,229,255,.08);color:rgba(0,229,255,.9);}
        .os-tab:hover:not(.active){border-color:rgba(255,255,255,.22);color:rgba(255,255,255,.65);}
        .os-filter{padding:.3rem .75rem;border-radius:6px;border:1px solid rgba(255,255,255,.1);background:rgba(0,0,0,.3);color:rgba(255,255,255,.42);font-family:'Orbitron',monospace;font-size:.3rem;letter-spacing:.14em;cursor:pointer;transition:all .2s;white-space:nowrap;}
        .os-filter.active{border-color:rgba(0,229,255,.5);background:rgba(0,229,255,.08);color:rgba(0,229,255,.9);}
        @media(max-width:900px){
          .os-main{grid-template-columns:1fr!important;}
          .os-sidebar{display:none!important;}
          .os-intel-grid{grid-template-columns:1fr!important;}
        }
        @media(max-width:640px){
          .os-strip{grid-template-columns:1fr 1fr!important;}
          .os-tabs{overflow-x:auto;-webkit-overflow-scrolling:touch;padding-bottom:.3rem;}
          .os-tabs::-webkit-scrollbar{height:2px;}
          .os-filter-row{flex-wrap:wrap!important;}
        }
        @media(max-width:480px){
          .os-strip{grid-template-columns:1fr!important;}
        }
        input::placeholder{color:rgba(255,255,255,.22);}
      `}</style>

      {/* Background */}
      <div style={{ position:"absolute", inset:0, zIndex:0, pointerEvents:"none", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(0,229,255,.012) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,.012) 1px,transparent 1px)", backgroundSize:"70px 70px", animation:"os-grid 14s ease-in-out infinite" }}/>
        <div style={{ position:"absolute", top:"5%",   right:"-8%", width:"700px", height:"700px", borderRadius:"50%", background:"radial-gradient(circle,rgba(0,229,255,.035),transparent 65%)" }}/>
        <div style={{ position:"absolute", bottom:"5%", left:"-8%", width:"600px", height:"600px", borderRadius:"50%", background:"radial-gradient(circle,rgba(123,97,255,.03),transparent 65%)" }}/>
        <div style={{ position:"absolute", top:"40%", left:"40%", width:"400px", height:"400px", borderRadius:"50%", background:"radial-gradient(circle,rgba(80,255,160,.02),transparent 65%)" }}/>
      </div>

      <div style={{ position:"relative", zIndex:10, maxWidth:"1300px", margin:"0 auto", padding:"clamp(1.5rem,4vw,3rem) clamp(1rem,4vw,2rem)" }}>

        {/* ── NAVBAR ── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"2rem", flexWrap:"wrap", gap:"1rem" }}>
          <a href="/app" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:".6rem" }}>
            <div style={{ width:"26px", height:"26px", borderRadius:"50%", background:"radial-gradient(circle,#ffd700,#ff8c00)", boxShadow:"0 0 14px rgba(255,150,0,.5)" }}/>
            <span style={{ fontFamily:T.font, fontSize:".52rem", letterSpacing:".2em", color:"rgba(255,215,0,.9)" }}>$FLASH</span>
          </a>
          <div style={{ display:"flex", gap:".45rem", flexWrap:"wrap" }}>
            {[
              {l:"APP HUB",     href:"/app"},
              {l:"NARRATIVE",   href:"/narrative"},
              {l:"SMART MONEY", href:"/smart-money"},
              {l:"ECOSYSTEM",   href:"/ecosystem"},
            ].map(b=>(
              <a key={b.l} href={b.href} style={{textDecoration:"none"}}>
                <button style={{padding:".34rem .85rem",borderRadius:"6px",border:"1px solid rgba(255,255,255,.1)",background:"rgba(0,0,0,.35)",color:"rgba(255,255,255,.45)",fontFamily:T.font,fontSize:".34rem",letterSpacing:".16em",cursor:"pointer",transition:"all .2s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(0,229,255,.38)";e.currentTarget.style.color="rgba(0,229,255,.75)";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,.1)";e.currentTarget.style.color="rgba(255,255,255,.45)";}}>
                  {b.l}
                </button>
              </a>
            ))}
          </div>
        </div>

        {/* ── HEADER ── */}
        <div style={{ marginBottom:"1.8rem" }}>
          <div style={{ display:"flex", alignItems:"center", gap:".8rem", marginBottom:".6rem" }}>
            <div style={{ width:"7px", height:"7px", borderRadius:"50%", background:T.beacon, boxShadow:`0 0 10px ${T.beacon}`, animation:"os-blink 1.4s infinite" }}/>
            <span style={{ fontFamily:T.font, fontSize:".38rem", letterSpacing:".28em", color:"rgba(0,229,255,.65)" }}>PHASE 2 — DISCOVERY LAYER</span>
          </div>
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:"1rem" }}>
            <div>
              <div style={{ fontFamily:T.font, fontSize:".44rem", letterSpacing:".42em", color:"rgba(0,229,255,.38)", marginBottom:".4rem" }}>SIGNAL OBSERVATORY</div>
              <h1 style={{ fontFamily:T.font, fontSize:"clamp(2rem,5vw,3.4rem)", fontWeight:900, background:"linear-gradient(135deg,#fff 0%,#00e5ff 40%,#7b61ff 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", letterSpacing:".08em", lineHeight:1.05 }}>
                OPPORTUNITY<br/>SCANNER
              </h1>
              <p style={{ fontFamily:T.body, fontSize:"clamp(.88rem,2vw,1rem)", color:"rgba(255,255,255,.38)", letterSpacing:".1em", marginTop:".4rem" }}>
                The discovery layer of the Solar Flash intelligence ecosystem.<br/>
                Where opportunity is detected before it becomes obvious.
              </p>
            </div>
          </div>
        </div>

        {/* ── SIGNAL OBSERVATORY ── */}
        <SignalObservatory scanning={scanning} onScan={runScan} lastScan={lastScan}/>

        {revealed && (
          <>
            {/* ── SCORE OVERVIEW ── */}
            <ScoreOverview opps={opps}/>

            {/* ── TABS ── */}
            <div className="os-tabs" style={{ display:"flex", gap:".4rem", marginBottom:"1.2rem", flexWrap:"wrap" }}>
              {[
                { id:"discovery", label:"DISCOVERY FEED"     },
                { id:"ai",        label:"AI INTELLIGENCE"    },
              ].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} className={`os-tab${tab===t.id?" active":""}`}>{t.label}</button>
              ))}
            </div>

            {/* ── DISCOVERY FEED ── */}
            {tab === "discovery" && (
              <div>
                {/* Filter row */}
                <div className="os-filter-row" style={{ display:"flex", gap:".4rem", marginBottom:"1.2rem", alignItems:"center", flexWrap:"wrap" }}>
                  <span style={{ fontFamily:T.font, fontSize:".32rem", letterSpacing:".18em", color:"rgba(255,255,255,.28)" }}>FILTER:</span>
                  {[
                    { id:"ALL",      label:"ALL SIGNALS" },
                    { id:"HIGH",     label:"HIGH SIGNAL" },
                    { id:"RISING",   label:"RISING MOM." },
                    { id:"LOW_RISK", label:"LOW RISK"    },
                    { id:"AVOID",    label:"AVOID"       },
                  ].map(f => (
                    <button key={f.id} onClick={() => setFilter(f.id)}
                      className={`os-filter${filter===f.id?" active":""}`}>
                      {f.label}
                    </button>
                  ))}
                  <span style={{ marginLeft:"auto", fontFamily:T.font, fontSize:".3rem", color:"rgba(255,255,255,.28)", letterSpacing:".12em" }}>
                    {filtered.length} DETECTED
                  </span>
                </div>

                {/* Two-column layout */}
                <div className="os-main" style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:"1.4rem", alignItems:"start" }}>

                  {/* Main feed */}
                  <div style={{ display:"flex", flexDirection:"column", gap:".8rem" }}>
                    {filtered.length === 0 ? (
                      <div style={{ textAlign:"center", padding:"4rem 2rem", border:"1px solid rgba(0,229,255,.1)", borderRadius:"16px", background:"rgba(0,0,0,.3)" }}>
                        <div style={{ fontSize:"2.5rem", marginBottom:"1rem", opacity:.3 }}>⊙</div>
                        <p style={{ fontFamily:T.body, fontSize:"1rem", color:"rgba(255,255,255,.35)", letterSpacing:".1em" }}>
                          No significant opportunities detected at this time.
                        </p>
                      </div>
                    ) : filtered.map((opp,i) => (
                      <OpportunityCard
                        key={opp.id}
                        opp={opp}
                        featured={opp.rank===1&&filter==="ALL"}
                        defaultOpen={opp.rank===1&&filter==="ALL"&&i===0}
                      />
                    ))}
                  </div>

                  {/* Sidebar */}
                  <div className="os-sidebar" style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>

                    {/* Quick signal map */}
                    <div style={{ borderRadius:"14px", border:"1px solid rgba(0,229,255,.14)", background:"rgba(0,0,0,.5)", backdropFilter:"blur(12px)", overflow:"hidden" }}>
                      <div style={{ padding:".85rem 1.2rem", borderBottom:"1px solid rgba(0,229,255,.1)", background:"rgba(0,229,255,.03)", display:"flex", alignItems:"center", gap:".6rem" }}>
                        <span style={{ fontFamily:T.font, fontSize:".44rem", fontWeight:700, color:T.beacon, letterSpacing:".14em" }}>SIGNAL MAP</span>
                        <div style={{ flex:1, height:"1px", background:"linear-gradient(to right,rgba(0,229,255,.22),transparent)", marginLeft:".4rem" }}/>
                      </div>
                      <div style={{ padding:"1.1rem 1.2rem", display:"flex", flexDirection:"column", gap:".5rem" }}>
                        {opps.map(o => {
                          const sc = scoreColor(o.oppScore);
                          return (
                            <div key={o.id} style={{ display:"flex", alignItems:"center", gap:".7rem" }}>
                              <span style={{ fontSize:".85rem", flexShrink:0 }}>{o.icon}</span>
                              <div style={{ flex:1, minWidth:0 }}>
                                <div style={{ fontFamily:T.font, fontSize:".32rem", color:"rgba(255,255,255,.55)", letterSpacing:".08em", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginBottom:".2rem" }}>
                                  {o.name.split(" ")[0].toUpperCase()}
                                </div>
                                <div style={{ height:"3px", borderRadius:"99px", background:"rgba(255,255,255,.06)", overflow:"hidden" }}>
                                  <div style={{ width:`${o.oppScore}%`, height:"100%", background:`linear-gradient(to right,${sc}55,${sc})`, borderRadius:"99px" }}/>
                                </div>
                              </div>
                              <span style={{ fontFamily:T.font, fontSize:".52rem", fontWeight:700, color:sc, flexShrink:0, minWidth:"24px", textAlign:"right" }}>{o.oppScore}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Intelligence sources */}
                    <div style={{ borderRadius:"14px", border:"1px solid rgba(255,255,255,.08)", background:"rgba(0,0,0,.45)", backdropFilter:"blur(8px)", padding:"1.1rem 1.2rem" }}>
                      <div style={{ fontFamily:T.font, fontSize:".36rem", letterSpacing:".24em", color:"rgba(255,255,255,.28)", marginBottom:".9rem" }}>INTELLIGENCE SOURCES</div>
                      {[
                        { icon:"📡", label:"Narrative Radar",      color:T.warn,   status:"ACTIVE" },
                        { icon:"🧠", label:"Smart Money",          color:T.pulse,  status:"ACTIVE" },
                        { icon:"⚡", label:"Market Intelligence",  color:T.gold,   status:"ACTIVE" },
                        { icon:"🎯", label:"Token Intelligence",   color:T.signal, status:"ACTIVE" },
                      ].map((s,i) => (
                        <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:".45rem .5rem", borderRadius:"7px", marginBottom:".3rem", transition:"background .2s" }}
                          onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,.04)";}}
                          onMouseLeave={e=>{e.currentTarget.style.background="transparent";}}>
                          <div style={{ display:"flex", alignItems:"center", gap:".5rem" }}>
                            <span style={{ fontSize:".85rem" }}>{s.icon}</span>
                            <span style={{ fontFamily:T.body, fontSize:".88rem", color:"rgba(255,255,255,.5)" }}>{s.label}</span>
                          </div>
                          <span style={{ fontFamily:T.font, fontSize:".28rem", letterSpacing:".16em", color:s.color, padding:".1rem .4rem", borderRadius:"4px", background:`${s.color}0e`, border:`1px solid ${s.color}25` }}>{s.status}</span>
                        </div>
                      ))}
                    </div>

                    {/* Phase badge */}
                    <div style={{ padding:"1.1rem 1.2rem", borderRadius:"14px", border:"1px solid rgba(0,229,255,.18)", background:"linear-gradient(135deg,rgba(0,229,255,.04),rgba(0,0,0,.5))", textAlign:"center" }}>
                      <div style={{ fontFamily:T.font, fontSize:".34rem", letterSpacing:".28em", color:"rgba(0,229,255,.5)", marginBottom:".4rem" }}>SOLAR FLASH</div>
                      <div style={{ fontFamily:T.font, fontSize:".52rem", fontWeight:700, color:T.beacon, letterSpacing:".14em", marginBottom:".5rem" }}>PHASE 2 — COMPLETE</div>
                      <p style={{ fontFamily:T.body, fontSize:".82rem", color:"rgba(255,255,255,.32)", lineHeight:1.6, marginBottom:".9rem" }}>
                        Opportunity Scanner is the final Phase 2 product. The complete discovery layer.
                      </p>
                      <a href="/ecosystem" style={{ textDecoration:"none" }}>
                        <button style={{ width:"100%", padding:".55rem", borderRadius:"7px", border:"1px solid rgba(0,229,255,.28)", background:"rgba(0,229,255,.06)", color:"rgba(0,229,255,.75)", fontFamily:T.font, fontSize:".36rem", letterSpacing:".18em", cursor:"pointer", transition:"all .3s" }}
                          onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 0 20px rgba(0,229,255,.18)";}}
                          onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";}}>
                          VIEW ECOSYSTEM →
                        </button>
                      </a>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* ── AI INTELLIGENCE TAB ── */}
            {tab === "ai" && (
              <div style={{ borderRadius:"16px", border:"1px solid rgba(0,229,255,.22)", background:"linear-gradient(135deg,rgba(0,229,255,.04),rgba(0,0,0,.6))", backdropFilter:"blur(14px)", overflow:"hidden" }}>
                <div style={{ padding:"1rem 1.4rem", borderBottom:"1px solid rgba(0,229,255,.12)", background:"rgba(0,229,255,.04)", display:"flex", alignItems:"center", gap:".7rem" }}>
                  <span style={{ fontSize:"1rem" }}>🤖</span>
                  <div>
                    <div style={{ fontFamily:T.font, fontSize:".52rem", fontWeight:700, color:T.beacon, letterSpacing:".14em" }}>AI INTELLIGENCE LAYER</div>
                    <div style={{ fontFamily:T.body, fontSize:".78rem", color:"rgba(255,255,255,.3)", letterSpacing:".06em", marginTop:".1rem" }}>Opportunity Scanner Intelligence Engine</div>
                  </div>
                  <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:".4rem" }}>
                    <div style={{ width:"7px", height:"7px", borderRadius:"50%", background:T.signal, boxShadow:`0 0 8px ${T.signal}`, animation:"os-blink 1.4s infinite" }}/>
                    <span style={{ fontFamily:T.font, fontSize:".3rem", letterSpacing:".18em", color:"rgba(80,255,160,.6)" }}>ACTIVE</span>
                  </div>
                </div>
                <div style={{ padding:"1.4rem" }}>
                  <AIOpportunitySummary ai={ai}/>
                </div>
              </div>
            )}

          </>
        )}

        {/* Not yet scanned */}
        {!revealed && !scanning && (
          <div style={{ textAlign:"center", padding:"5rem 2rem", border:"1px solid rgba(0,229,255,.08)", borderRadius:"16px", background:"rgba(0,0,0,.22)" }}>
            <div style={{ fontSize:"3rem", marginBottom:"1.2rem", opacity:.22 }}>⊙</div>
            <p style={{ fontFamily:T.body, fontSize:"1rem", color:"rgba(255,255,255,.28)", letterSpacing:".1em" }}>
              Observatory is initializing…
            </p>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign:"center", padding:"1.5rem 0 0", marginTop:"2rem", borderTop:"1px solid rgba(255,255,255,.05)" }}>
          <p style={{ fontFamily:T.body, fontSize:".75rem", color:"rgba(255,255,255,.18)", letterSpacing:".1em" }}>
            Opportunity Scanner V1 — Solar Flash Phase 2 Final Product — Discovery only — Not financial advice — Not trading signals
          </p>
        </div>

      </div>
    </div>
  );
}
