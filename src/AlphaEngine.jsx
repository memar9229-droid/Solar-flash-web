/**
 * AlphaEngine.jsx — Solar Flash Phase 2
 * Alpha Engine — Signal Generation System
 * Route: /alpha-engine
 *
 * Takes opportunities from Opportunity Scanner and generates
 * professional trade-ready signals with full strategy.
 * MUST provide: Entry/TP/SL · Strategy · AI Reasoning
 */

import { useState, useEffect, useRef, useMemo } from "react";

const T = {
  orange:"#ff8c00", gold:"#ffd700", cyan:"#00e5ff",
  ok:"#50ffa0",     purple:"#b060ff", danger:"#ff3535",
  warn:"#ffaa00",   black:"#050403",
  font:"'Orbitron',monospace", body:"'Rajdhani',sans-serif",
};

// ─── SIGNAL GENERATOR ─────────────────────────────────────────
function generateSignal(opp) {
  const isBullish  = opp.opScore >= 65;
  const direction  = isBullish ? "LONG" : "SHORT";
  const dirColor   = isBullish ? T.ok : T.danger;

  // Simulate price (based on known token ranges)
  const BASE_PRICES = {
    SOL:185.50,TAO:420.00,HNT:12.80,ONDO:1.24,RNDR:9.85,FET:2.42,
    JUP:0.84,JTO:3.85,SUI:2.18,IMX:1.92,OCEAN:0.72,LINK:18.40,
    BEAM:0.028,PYTH:0.48,UNI:10.20,ARB:1.08,WIF:2.85,BONK:0.000028,
  };
  const price = BASE_PRICES[opp.coin] || 1.00;

  const pctEntry = 0.012;
  const pctSL    = isBullish ? -0.055 : 0.055;
  const pctTP1   = isBullish ?  0.065 : -0.065;
  const pctTP2   = isBullish ?  0.115 : -0.115;
  const pctTP3   = isBullish ?  0.175 : -0.175;

  const entryLow  = +(price * (1 - pctEntry)).toFixed(price>10?2:price>1?3:6);
  const entryHigh = +(price * (1 + pctEntry*0.5)).toFixed(price>10?2:price>1?3:6);
  const sl        = +(price * (1 + pctSL)).toFixed(price>10?2:price>1?3:6);
  const tp1       = +(price * (1 + pctTP1)).toFixed(price>10?2:price>1?3:6);
  const tp2       = +(price * (1 + pctTP2)).toFixed(price>10?2:price>1?3:6);
  const tp3       = +(price * (1 + pctTP3)).toFixed(price>10?2:price>1?3:6);

  const strategies = {
    Short:["Scalp","Intraday"],
    Mid:  ["Intraday","Swing"],
    Long: ["Swing","Position"],
  };
  const strategyPool = strategies[opp.timeframe] || ["Swing"];
  const strategy     = strategyPool[opp.opScore > 75 ? 1 : 0];

  const horizons = { Short:"1-3 Days", Mid:"3-10 Days", Long:"10-30 Days" };
  const riskReward = isBullish
    ? `1 : ${(Math.abs(pctTP2)/Math.abs(pctSL)).toFixed(1)}`
    : `1 : ${(Math.abs(pctTP2)/Math.abs(pctSL)).toFixed(1)}`;

  const positionSizes = {
    Low:"5-8% of portfolio",
    Medium:"3-5% of portfolio",
    High:"1-3% of portfolio",
    "Very High":"0.5-1% of portfolio",
  };

  const confidence = opp.confidence;
  const alphaScore = opp.opScore;
  const riskLevel  = opp.risk;

  // AI Reasoning
  const reasoning = [
    `${opp.narrative} narrative momentum is ${opp.narrativeScore >= 80 ? "very strong" : opp.narrativeScore >= 65 ? "strong" : "moderate"} (score: ${opp.narrativeScore}/100).`,
    `Smart money ${opp.smStatus === "Accumulating" ? "is actively accumulating — conviction score elevated" : opp.smStatus === "Distributing" ? "is distributing — caution warranted" : "is neutral — monitor for directional confirmation"} (SM score: ${opp.smScore}/100).`,
    `Market trend is ${opp.marketTrend}. ${opp.marketScore >= 75 ? "Strong technical backdrop supports the trade direction." : opp.marketScore >= 55 ? "Moderate market support. Confirmation signals present." : "Weak market conditions — reduce position size."}`,
    `Token health is ${opp.health}. ${opp.tokenScore >= 85 ? "Excellent fundamentals reduce structural risk." : opp.tokenScore >= 70 ? "Good fundamentals provide a solid base." : "Mixed token metrics — apply additional caution."}`,
    `Opportunity Score of ${alphaScore}/100 places this in the ${alphaScore >= 85 ? "top-tier discovery zone" : alphaScore >= 70 ? "high-priority discovery zone" : "standard discovery zone"}.`,
  ];

  const validityHours = { Short:24, Mid:72, Long:240 };

  return {
    direction, dirColor,
    alphaScore, confidence, riskLevel,
    timeHorizon: horizons[opp.timeframe] || "3-10 Days",
    strategy,
    entryLow, entryHigh,
    sl, tp1, tp2, tp3,
    riskReward,
    positionSize: positionSizes[opp.risk] || "3-5% of portfolio",
    reasoning,
    validityHours: validityHours[opp.timeframe] || 72,
    price,
    similarSetups: [
      { coin:"SOL/USDT", date:"3 weeks ago", result:"+18.4%",  strategy, win:true  },
      { coin:"TAO/USDT", date:"6 weeks ago", result:"+24.1%",  strategy, win:true  },
      { coin:"HNT/USDT", date:"8 weeks ago", result:"-4.2%",   strategy, win:false },
      { coin:"FET/USDT", date:"10 weeks ago",result:"+12.7%",  strategy, win:true  },
    ],
  };
}

// ─── PRICE CHART ──────────────────────────────────────────────
function SignalChart({ signal, coin }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const c   = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    const W   = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);

    // Generate sample price data
    const pts  = 60;
    const data = [];
    let p = signal.price * 0.94;
    for (let i = 0; i < pts; i++) {
      p += (Math.random() - 0.46) * signal.price * 0.015;
      data.push(Math.max(signal.price * 0.85, Math.min(signal.price * 1.12, p)));
    }

    const minP = Math.min(...data) * 0.99;
    const maxP = Math.max(...data) * 1.01;
    const range = maxP - minP;
    const toY   = (price) => H - ((price - minP) / range) * (H * 0.85) - H * 0.07;
    const toX   = (i)     => (i / (pts - 1)) * W;

    // Grid
    ctx.strokeStyle = "rgba(255,255,255,.04)";
    ctx.lineWidth   = 1;
    for (let i = 0; i <= 4; i++) {
      const y = (H / 4) * i;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Price levels
    const drawLevel = (price, color, label, dashed = false) => {
      const y = toY(price);
      if (y < 0 || y > H) return;
      ctx.beginPath();
      ctx.moveTo(0, y); ctx.lineTo(W, y);
      ctx.strokeStyle = color;
      ctx.lineWidth   = 1;
      if (dashed) ctx.setLineDash([4, 6]); else ctx.setLineDash([]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle   = color;
      ctx.font        = "bold 9px 'Rajdhani',sans-serif";
      ctx.textAlign   = "right";
      ctx.fillText(label, W - 4, y - 3);
    };

    drawLevel(signal.tp3, "rgba(80,255,160,.6)",  `TP3: ${signal.tp3}`, true);
    drawLevel(signal.tp2, "rgba(80,255,160,.55)", `TP2: ${signal.tp2}`, true);
    drawLevel(signal.tp1, "rgba(80,255,160,.5)",  `TP1: ${signal.tp1}`, true);
    drawLevel(signal.entryHigh, "rgba(0,229,255,.7)", `ENTRY: ${signal.entryLow}-${signal.entryHigh}`, false);
    drawLevel(signal.entryLow,  "rgba(0,229,255,.5)", "", false);
    drawLevel(signal.sl, "rgba(255,53,53,.6)",    `SL: ${signal.sl}`, true);

    // Entry zone fill
    const eyH = toY(signal.entryHigh), eyL = toY(signal.entryLow);
    ctx.fillStyle = "rgba(0,229,255,.06)";
    ctx.fillRect(0, Math.min(eyH, eyL), W, Math.abs(eyH - eyL));

    // Candlestick-style price line
    ctx.beginPath();
    data.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(toX(i), toY(pt));
      else ctx.lineTo(toX(i), toY(pt));
    });
    const grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, "rgba(255,140,0,.4)");
    grad.addColorStop(1, "rgba(0,229,255,.8)");
    ctx.strokeStyle = grad;
    ctx.lineWidth   = 1.5;
    ctx.stroke();

    // Glow under line
    ctx.beginPath();
    data.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(toX(i), toY(pt));
      else ctx.lineTo(toX(i), toY(pt));
    });
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
    const fillGrad = ctx.createLinearGradient(0, 0, 0, H);
    fillGrad.addColorStop(0, "rgba(0,229,255,.06)");
    fillGrad.addColorStop(1, "transparent");
    ctx.fillStyle = fillGrad;
    ctx.fill();

  }, [signal, coin]);

  return (
    <canvas ref={canvasRef} width={560} height={220}
      style={{ width:"100%", height:"220px", display:"block", borderRadius:"8px" }}/>
  );
}

// ─── SIGNAL HEADER ─────────────────────────────────────────────
function SignalHeader({ opp, signal }) {
  const col = signal.dirColor;
  return (
    <div style={{ padding:"1.4rem 1.8rem", borderRadius:"16px", border:`1px solid ${col}35`, background:`linear-gradient(135deg,${col}0d,rgba(0,0,0,.65))`, backdropFilter:"blur(14px)", position:"relative", overflow:"hidden", marginBottom:"1.2rem" }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:`linear-gradient(to right,transparent,${col}77,transparent)` }}/>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"1rem" }}>
        {/* Left: Coin + Direction */}
        <div style={{ display:"flex", alignItems:"center", gap:"1rem" }}>
          <span style={{ fontSize:"2rem" }}>{opp.icon}</span>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:".7rem" }}>
              <span style={{ fontFamily:T.font, fontSize:"clamp(1rem,3vw,1.5rem)", fontWeight:900, color:"#fff", letterSpacing:".1em" }}>{opp.coin}/USDT</span>
              <span style={{ padding:".3rem .9rem", borderRadius:"6px", border:`2px solid ${col}`, background:`${col}18`, fontFamily:T.font, fontSize:".55rem", fontWeight:900, color:col, letterSpacing:".2em" }}>
                {signal.direction}
              </span>
            </div>
            <div style={{ fontFamily:T.body, fontSize:".9rem", color:"rgba(255,255,255,.45)", marginTop:".2rem" }}>
              {opp.narrative} · {opp.chain} · {signal.strategy} Strategy
            </div>
          </div>
        </div>
        {/* Right: Score + Confidence + Risk */}
        <div style={{ display:"flex", gap:"1.2rem", alignItems:"center", flexWrap:"wrap" }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontFamily:T.font, fontSize:"clamp(1.4rem,4vw,2.2rem)", fontWeight:900, color:col, lineHeight:1, textShadow:`0 0 28px ${col}77` }}>{signal.alphaScore}</div>
            <div style={{ fontFamily:T.font, fontSize:".3rem", color:"rgba(255,255,255,.3)", letterSpacing:".18em" }}>ALPHA SCORE</div>
          </div>
          <div style={{ width:"1px", height:"40px", background:"rgba(255,255,255,.1)" }}/>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontFamily:T.font, fontSize:".88rem", fontWeight:700, color:T.ok }}>{signal.confidence}</div>
            <div style={{ fontFamily:T.font, fontSize:".3rem", color:"rgba(255,255,255,.3)", letterSpacing:".18em" }}>CONFIDENCE</div>
          </div>
          <div style={{ width:"1px", height:"40px", background:"rgba(255,255,255,.1)" }}/>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontFamily:T.font, fontSize:".88rem", fontWeight:700, color:opp.risk==="Low"?T.ok:opp.risk==="Medium"?T.gold:T.danger }}>{opp.risk}</div>
            <div style={{ fontFamily:T.font, fontSize:".3rem", color:"rgba(255,255,255,.3)", letterSpacing:".18em" }}>RISK</div>
          </div>
          <div style={{ width:"1px", height:"40px", background:"rgba(255,255,255,.1)" }}/>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontFamily:T.font, fontSize:".88rem", fontWeight:700, color:T.cyan }}>{signal.timeHorizon}</div>
            <div style={{ fontFamily:T.font, fontSize:".3rem", color:"rgba(255,255,255,.3)", letterSpacing:".18em" }}>TIME HORIZON</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN SIGNAL BOX ──────────────────────────────────────────
function SignalBox({ signal }) {
  const isLong = signal.direction === "LONG";
  return (
    <div className="ae-signal-box-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", marginBottom:"1.2rem" }}>
      {/* Entry Zone */}
      <div style={{ padding:"1.2rem 1.4rem", borderRadius:"14px", border:"1.5px solid rgba(0,229,255,.45)", background:"rgba(0,229,255,.07)", backdropFilter:"blur(8px)", gridColumn:"1/-1" }}>
        <div style={{ fontFamily:T.font, fontSize:".34rem", letterSpacing:".24em", color:"rgba(0,229,255,.6)", marginBottom:".5rem" }}>ENTRY ZONE</div>
        <div style={{ fontFamily:T.font, fontSize:"clamp(1.2rem,3vw,1.8rem)", fontWeight:900, color:T.cyan, letterSpacing:".08em" }}>
          {signal.entryLow} <span style={{ color:"rgba(255,255,255,.4)", fontSize:".5em" }}>—</span> {signal.entryHigh}
        </div>
        <div style={{ fontFamily:T.body, fontSize:".82rem", color:"rgba(0,229,255,.6)", marginTop:".3rem" }}>Current price zone · Enter between these levels</div>
      </div>

      {/* Stop Loss */}
      <div style={{ padding:"1.1rem 1.3rem", borderRadius:"12px", border:"1.5px solid rgba(255,53,53,.4)", background:"rgba(255,53,53,.07)" }}>
        <div style={{ fontFamily:T.font, fontSize:".32rem", letterSpacing:".22em", color:"rgba(255,53,53,.6)", marginBottom:".4rem" }}>STOP LOSS</div>
        <div style={{ fontFamily:T.font, fontSize:"clamp(1rem,2.5vw,1.4rem)", fontWeight:900, color:T.danger }}>{signal.sl}</div>
        <div style={{ fontFamily:T.body, fontSize:".78rem", color:"rgba(255,53,53,.55)", marginTop:".2rem" }}>
          {isLong?"Below entry":"Above entry"} · Max loss threshold
        </div>
      </div>

      {/* Risk/Reward */}
      <div style={{ padding:"1.1rem 1.3rem", borderRadius:"12px", border:"1.5px solid rgba(255,215,0,.35)", background:"rgba(255,215,0,.06)" }}>
        <div style={{ fontFamily:T.font, fontSize:".32rem", letterSpacing:".22em", color:"rgba(255,215,0,.6)", marginBottom:".4rem" }}>RISK / REWARD</div>
        <div style={{ fontFamily:T.font, fontSize:"clamp(1rem,2.5vw,1.4rem)", fontWeight:900, color:T.gold }}>{signal.riskReward}</div>
        <div style={{ fontFamily:T.body, fontSize:".78rem", color:"rgba(255,215,0,.55)", marginTop:".2rem" }}>Favorable ratio · High edge setup</div>
      </div>

      {/* Take Profits */}
      <div style={{ padding:"1.1rem 1.3rem", borderRadius:"12px", border:"1.5px solid rgba(80,255,160,.35)", background:"rgba(80,255,160,.06)", gridColumn:"1/-1" }}>
        <div style={{ fontFamily:T.font, fontSize:".32rem", letterSpacing:".22em", color:"rgba(80,255,160,.6)", marginBottom:".7rem" }}>TAKE PROFITS</div>
        <div className="ae-tp-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:".7rem" }}>
          {[
            {label:"TP1", value:signal.tp1, pct:"~6.5%", note:"First target — 30% position"},
            {label:"TP2", value:signal.tp2, pct:"~11.5%",note:"Second target — 40% position"},
            {label:"TP3", value:signal.tp3, pct:"~17.5%",note:"Final target — remaining 30%"},
          ].map((tp,i)=>(
            <div key={i} style={{ padding:".7rem .8rem", borderRadius:"9px", border:"1px solid rgba(80,255,160,.2)", background:"rgba(80,255,160,.04)", textAlign:"center" }}>
              <div style={{ fontFamily:T.font, fontSize:".34rem", letterSpacing:".18em", color:"rgba(80,255,160,.5)", marginBottom:".2rem" }}>{tp.label}</div>
              <div style={{ fontFamily:T.font, fontSize:".88rem", fontWeight:700, color:T.ok }}>{tp.value}</div>
              <div style={{ fontFamily:T.body, fontSize:".75rem", color:"rgba(80,255,160,.55)", marginTop:".15rem" }}>{tp.pct}</div>
              <div style={{ fontFamily:T.body, fontSize:".68rem", color:"rgba(255,255,255,.3)", marginTop:".1rem" }}>{tp.note}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── STRATEGY PANEL ────────────────────────────────────────────
function StrategyPanel({ signal, opp }) {
  return (
    <div style={{ padding:"1.2rem 1.4rem", borderRadius:"14px", border:"1px solid rgba(176,96,255,.3)", background:"rgba(176,96,255,.06)", backdropFilter:"blur(8px)", marginBottom:"1.2rem" }}>
      <div style={{ fontFamily:T.font, fontSize:".44rem", fontWeight:700, color:T.purple, letterSpacing:".14em", marginBottom:"1rem" }}>⊙ STRATEGY PANEL</div>
      <div className="ae-strategy-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,140px),1fr))", gap:".8rem" }}>
        {[
          {label:"BEST STRATEGY",  val:signal.strategy,                           c:T.purple},
          {label:"TIME HORIZON",   val:signal.timeHorizon,                        c:T.cyan},
          {label:"POSITION SIZE",  val:signal.positionSize,                       c:T.gold},
          {label:"RISK / REWARD",  val:signal.riskReward,                         c:T.ok},
          {label:"VALID FOR",      val:`${signal.validityHours}h`,                c:"rgba(255,255,255,.6)"},
          {label:"SECTOR",         val:opp.sector,                                c:T.orange},
        ].map((s,i)=>(
          <div key={i} style={{ padding:".7rem .9rem", borderRadius:"9px", border:`1px solid ${s.c}22`, background:`${s.c}07` }}>
            <div style={{ fontFamily:T.font, fontSize:".28rem", letterSpacing:".18em", color:"rgba(255,255,255,.28)", marginBottom:".3rem" }}>{s.label}</div>
            <div style={{ fontFamily:T.body, fontSize:".9rem", fontWeight:700, color:s.c }}>{s.val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── REASONING PANEL ──────────────────────────────────────────
function ReasoningPanel({ signal, opp }) {
  return (
    <div style={{ padding:"1.2rem 1.4rem", borderRadius:"14px", border:"1px solid rgba(0,229,255,.2)", background:"linear-gradient(135deg,rgba(0,229,255,.04),rgba(0,0,0,.55))", backdropFilter:"blur(10px)", marginBottom:"1.2rem" }}>
      <div style={{ display:"flex", alignItems:"center", gap:".6rem", marginBottom:"1rem" }}>
        <span style={{ fontSize:"1.1rem" }}>🤖</span>
        <span style={{ fontFamily:T.font, fontSize:".5rem", fontWeight:700, color:T.cyan, letterSpacing:".14em" }}>WHY THIS SIGNAL?</span>
        <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:T.cyan, boxShadow:`0 0 8px ${T.cyan}`, display:"inline-block", animation:"ae-blink 1.4s infinite", marginLeft:"auto" }}/>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:".6rem" }}>
        {signal.reasoning.map((r,i)=>(
          <div key={i} style={{ display:"flex", gap:".7rem", padding:".7rem .9rem", borderRadius:"8px", background:"rgba(0,0,0,.35)", border:"1px solid rgba(255,255,255,.06)" }}>
            <span style={{ fontFamily:T.font, fontSize:".55rem", color:T.cyan, flexShrink:0 }}>{i+1}.</span>
            <span style={{ fontFamily:T.body, fontSize:".92rem", color:"rgba(255,255,255,.65)", lineHeight:1.65, letterSpacing:".04em" }}>{r}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── DATA TABS ────────────────────────────────────────────────
function DataTabs({ opp, signal }) {
  const [tab, setTab] = useState("narrative");

  const tabData = {
    narrative: [
      {label:"Narrative",       val:opp.narrative,                       c:T.gold},
      {label:"Narrative Score", val:`${opp.narrativeScore}/100`,          c:T.gold},
      {label:"Sector",          val:opp.sector,                          c:T.orange},
      {label:"Market Trend",    val:opp.marketTrend,                     c:opp.marketTrend==="Bullish"?T.ok:T.danger},
      {label:"Lifecycle Stage", val:"Early Growth",                      c:T.cyan},
      {label:"Momentum",        val:"Rising",                            c:T.ok},
    ],
    smartMoney: [
      {label:"SM Status",       val:opp.smStatus,                        c:opp.smStatus==="Accumulating"?T.ok:T.danger},
      {label:"SM Score",        val:`${opp.smScore}/100`,                 c:T.cyan},
      {label:"Cluster",         val:"High Conviction",                   c:T.cyan},
      {label:"Conviction Score",val:`${Math.round(opp.smScore*.95)}/100`, c:T.cyan},
      {label:"Accum History",   val:"Increasing",                        c:T.ok},
      {label:"Capital Flow",    val:"Strong Inflow",                     c:T.ok},
    ],
    market: [
      {label:"24H Change",      val:(opp.change24h>=0?"+":"")+opp.change24h+"%", c:opp.change24h>=0?T.ok:T.danger},
      {label:"Volume 24H",      val:opp.volume,                          c:T.gold},
      {label:"Liquidity",       val:opp.liquidity,                       c:T.cyan},
      {label:"Market Cap",      val:opp.mcap,                            c:"rgba(255,255,255,.7)"},
      {label:"Market Score",    val:`${opp.marketScore}/100`,             c:T.gold},
      {label:"Chain",           val:opp.chain,                           c:T.purple},
    ],
    tokenHealth: [
      {label:"Token Health",    val:opp.health,                          c:opp.health==="Excellent"?T.ok:T.cyan},
      {label:"Token Score",     val:`${opp.tokenScore}/100`,              c:T.ok},
      {label:"Opportunity Score",val:`${opp.opScore}/100`,               c:signal.dirColor},
      {label:"Risk Level",      val:opp.risk,                            c:opp.risk==="Low"?T.ok:opp.risk==="Medium"?T.gold:T.danger},
      {label:"Confidence",      val:opp.confidence,                      c:T.cyan},
      {label:"Timeframe",       val:opp.timeframe,                       c:T.purple},
    ],
  };

  return (
    <div style={{ marginBottom:"1.2rem" }}>
      <div style={{ display:"flex", gap:".4rem", marginBottom:".8rem", flexWrap:"wrap" }}>
        {[
          {id:"narrative",  label:"NARRATIVE"},
          {id:"smartMoney", label:"SMART MONEY"},
          {id:"market",     label:"MARKET"},
          {id:"tokenHealth",label:"TOKEN HEALTH"},
          {id:"similar",    label:"SIMILAR SETUPS"},
        ].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{padding:".4rem .9rem",borderRadius:"7px",border:`1px solid ${tab===t.id?"rgba(255,180,0,.45)":"rgba(255,255,255,.1)"}`,background:tab===t.id?"rgba(255,180,0,.08)":"rgba(0,0,0,.35)",color:tab===t.id?"rgba(255,215,0,.9)":"rgba(255,255,255,.42)",fontFamily:T.font,fontSize:".3rem",letterSpacing:".16em",cursor:"pointer",transition:"all .2s",whiteSpace:"nowrap"}}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding:"1.1rem 1.3rem", borderRadius:"12px", border:"1px solid rgba(255,255,255,.08)", background:"rgba(0,0,0,.45)", backdropFilter:"blur(8px)", animation:"ae-fade .25s ease" }}>
        {tab !== "similar" ? (
          <div className="ae-data-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,160px),1fr))", gap:".7rem" }}>
            {(tabData[tab]||[]).map((d,i)=>(
              <div key={i} style={{ padding:".65rem .8rem", borderRadius:"8px", border:`1px solid ${d.c}18`, background:`${d.c}07` }}>
                <div style={{ fontFamily:T.font, fontSize:".26rem", letterSpacing:".16em", color:"rgba(255,255,255,.28)", marginBottom:".25rem" }}>{d.label}</div>
                <div style={{ fontFamily:T.body, fontSize:".9rem", fontWeight:700, color:d.c }}>{d.val}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:".5rem" }}>
            <div style={{ fontFamily:T.font, fontSize:".32rem", letterSpacing:".2em", color:"rgba(255,255,255,.28)", marginBottom:".4rem" }}>SIMILAR HISTORICAL SETUPS — {signal.strategy} STRATEGY</div>
            {signal.similarSetups.map((s,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:"1rem", padding:".65rem .9rem", borderRadius:"8px", border:`1px solid ${s.win?"rgba(80,255,160,.2)":"rgba(255,53,53,.2)"}`, background:s.win?"rgba(80,255,160,.05)":"rgba(255,53,53,.05)" }}>
                <span style={{ fontFamily:T.font, fontSize:".55rem", width:"24px", textAlign:"center" }}>{s.win?"✓":"✗"}</span>
                <span style={{ fontFamily:T.body, fontSize:".88rem", color:"rgba(255,255,255,.65)", flex:1 }}>{s.coin}</span>
                <span style={{ fontFamily:T.body, fontSize:".82rem", color:"rgba(255,255,255,.38)" }}>{s.date}</span>
                <span style={{ fontFamily:T.font, fontSize:".6rem", fontWeight:700, color:s.win?T.ok:T.danger }}>{s.result}</span>
              </div>
            ))}
            <div style={{ padding:".65rem .9rem", borderRadius:"8px", border:"1px solid rgba(255,255,255,.07)", background:"rgba(255,255,255,.03)", marginTop:".3rem" }}>
              <span style={{ fontFamily:T.body, fontSize:".85rem", color:"rgba(255,255,255,.45)", letterSpacing:".05em" }}>
                Historical win rate for similar setups: <span style={{ color:T.ok, fontWeight:700 }}>75%</span> · Average return: <span style={{ color:T.ok, fontWeight:700 }}>+14.2%</span> · Sample size: 12 setups
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ACTION BAR ───────────────────────────────────────────────
function ActionBar({ opp, tracked, onTrack }) {
  const [shared, setShared] = useState(false);

  const shareText = () => {
    const text = `⚡ ${opp.coin}/USDT — OpScore: ${opp.opScore}/100 — ${opp.narrative} Narrative — Solar Flash Alpha Engine`;
    navigator.clipboard?.writeText(text).catch(()=>{});
    setShared(true);
    setTimeout(()=>setShared(false), 2000);
  };

  return (
    <div className="ae-action-bar" style={{ display:"flex", gap:".7rem", flexWrap:"wrap", padding:"1.2rem 1.4rem", borderRadius:"14px", border:"1px solid rgba(255,255,255,.08)", background:"rgba(0,0,0,.45)", backdropFilter:"blur(8px)" }}>
      <button onClick={onTrack} style={{ padding:".65rem 1.3rem", borderRadius:"8px", border:`1px solid ${tracked?"rgba(80,255,160,.5)":"rgba(255,255,255,.2)"}`, background:tracked?"rgba(80,255,160,.1)":"rgba(255,255,255,.05)", color:tracked?T.ok:"rgba(255,255,255,.65)", fontFamily:T.font, fontSize:".38rem", letterSpacing:".18em", cursor:"pointer", transition:"all .25s" }}>
        {tracked?"✓ TRACKING":"TRACK SIGNAL"}
      </button>
      <button style={{ padding:".65rem 1.3rem", borderRadius:"8px", border:"1px solid rgba(255,215,0,.3)", background:"rgba(255,215,0,.06)", color:"rgba(255,215,0,.8)", fontFamily:T.font, fontSize:".38rem", letterSpacing:".18em", cursor:"pointer", transition:"all .25s" }}
        onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 0 18px rgba(255,215,0,.15)";}}
        onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";}}>
        SET ALERT
      </button>
      <button onClick={shareText} style={{ padding:".65rem 1.3rem", borderRadius:"8px", border:"1px solid rgba(0,229,255,.3)", background:"rgba(0,229,255,.06)", color:"rgba(0,229,255,.8)", fontFamily:T.font, fontSize:".38rem", letterSpacing:".18em", cursor:"pointer", transition:"all .25s" }}>
        {shared?"✓ COPIED":"SHARE SIGNAL"}
      </button>
      <a href="/scanner" style={{ textDecoration:"none", marginLeft:"auto" }}>
        <button style={{ padding:".65rem 1.3rem", borderRadius:"8px", border:"1px solid rgba(255,255,255,.12)", background:"rgba(255,255,255,.04)", color:"rgba(255,255,255,.5)", fontFamily:T.font, fontSize:".38rem", letterSpacing:".18em", cursor:"pointer", transition:"all .25s" }}>
          ← BACK TO SCANNER
        </button>
      </a>
    </div>
  );
}

// ─── DEFAULT OPPORTUNITY (no data passed) ─────────────────────
const DEFAULT_OPP = {
  id:"sol",rank:1,coin:"SOL",pair:"SOL/USDT",icon:"☀️",sector:"Layer 1",narrative:"DePIN",
  opScore:92,confidence:"Very High",risk:"Medium",timeframe:"Mid",
  smStatus:"Accumulating",marketTrend:"Bullish",health:"Excellent",
  change24h:+8.4,volume:"$2.8B",liquidity:"$920M",
  chain:"Solana",mcap:"Large",narrativeScore:88,smScore:91,marketScore:82,tokenScore:94,
  reason:"Strong DePIN narrative momentum combined with increasing smart money accumulation.",
  full:"SOL leads ecosystem growth with dominant DePIN exposure. Smart money positioning is at multi-month highs.",
};

// ─── MAIN PAGE ────────────────────────────────────────────────
export default function AlphaEngine() {
  const [opp,     setOpp]     = useState(null);
  const [signal,  setSignal]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [tracked, setTracked] = useState(false);
  const [dataTab, setDataTab] = useState("narrative");

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("sf_alpha_opp");
      const data   = stored ? JSON.parse(stored) : DEFAULT_OPP;
      setTimeout(() => {
        setOpp(data);
        setSignal(generateSignal(data));
        setLoading(false);
      }, 1400);
    } catch {
      setOpp(DEFAULT_OPP);
      setSignal(generateSignal(DEFAULT_OPP));
      setLoading(false);
    }
  }, []);

  return (
    <div style={{ minHeight:"100vh", background:T.black, color:"#fff", fontFamily:T.font, overflowX:"hidden", position:"relative", isolation:"isolate" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-track{background:#050403;} ::-webkit-scrollbar-thumb{background:rgba(255,180,0,.4);}
        @keyframes ae-blink {0%,100%{opacity:1;}50%{opacity:.2;}}
        @keyframes ae-fade  {from{opacity:0;}to{opacity:1;}}
        @keyframes ae-spin  {to{transform:rotate(360deg);}}
        @keyframes ae-grid  {0%,100%{opacity:.013;}50%{opacity:.025;}}
        @media(max-width:1000px){
          .ae-main{grid-template-columns:1fr!important;}
        }
        @media(max-width:768px){
          .ae-signal-box-grid{grid-template-columns:1fr!important;}
          .ae-strategy-grid{grid-template-columns:1fr 1fr!important;}
          .ae-tp-grid{grid-template-columns:1fr 1fr!important;}
          .ae-header-right{flex-direction:column!important;align-items:flex-start!important;gap:.6rem!important;}
          .ae-data-grid{grid-template-columns:1fr 1fr!important;}
        }
        @media(max-width:600px){
          .ae-reason-why{display:none!important;}
          .ae-strategy-grid{grid-template-columns:1fr!important;}
          .ae-tp-grid{grid-template-columns:1fr!important;}
          .ae-header-coins{flex-direction:column!important;align-items:flex-start!important;}
          .ae-action-bar{flex-direction:column!important;}
          .ae-action-bar button,.ae-action-bar a button{width:100%!important;}
        }
      `}</style>

      {/* Background */}
      <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(255,180,0,.013) 1px,transparent 1px),linear-gradient(90deg,rgba(255,180,0,.013) 1px,transparent 1px)", backgroundSize:"65px 65px", animation:"ae-grid 12s ease-in-out infinite" }}/>
        <div style={{ position:"absolute", top:"5%",   right:"-8%", width:"600px", height:"600px", borderRadius:"50%", background:"radial-gradient(circle,rgba(255,140,0,.04),transparent 65%)" }}/>
        <div style={{ position:"absolute", bottom:"5%", left:"-8%", width:"500px", height:"500px", borderRadius:"50%", background:"radial-gradient(circle,rgba(0,229,255,.03),transparent 65%)" }}/>
      </div>

      <div style={{ position:"relative", zIndex:10, maxWidth:"1200px", margin:"0 auto", padding:"clamp(1rem,3vw,2rem) clamp(.8rem,3vw,1.5rem)" }}>

        {/* Navbar */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.4rem", flexWrap:"wrap", gap:".8rem" }}>
          <a href="/app" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:".6rem" }}>
            <div style={{ width:"24px", height:"24px", borderRadius:"50%", background:"radial-gradient(circle,#ffd700,#ff8c00)", boxShadow:"0 0 12px rgba(255,150,0,.5)" }}/>
            <span style={{ fontFamily:T.font, fontSize:".5rem", letterSpacing:".2em", color:"rgba(255,215,0,.9)" }}>$FLASH</span>
          </a>
          <div style={{ display:"flex", gap:".4rem", flexWrap:"wrap" }}>
            {[{l:"SCANNER",h:"/scanner"},{l:"NARRATIVE",h:"/narrative"},{l:"SMART MONEY",h:"/smart-money"},{l:"ECOSYSTEM",h:"/ecosystem"}].map(b=>(
              <a key={b.l} href={b.h} style={{ textDecoration:"none" }}>
                <button style={{ padding:".32rem .8rem", borderRadius:"6px", border:"1px solid rgba(255,255,255,.1)", background:"rgba(0,0,0,.35)", color:"rgba(255,255,255,.45)", fontFamily:T.font, fontSize:".3rem", letterSpacing:".14em", cursor:"pointer", transition:"all .2s" }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,180,0,.4)";e.currentTarget.style.color="rgba(255,215,0,.8)";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,.1)";e.currentTarget.style.color="rgba(255,255,255,.45)";}}>
                  {b.l}
                </button>
              </a>
            ))}
          </div>
        </div>

        {/* Page header */}
        <div style={{ marginBottom:"1.4rem" }}>
          <div style={{ fontFamily:T.font, fontSize:".42rem", letterSpacing:".4em", color:"rgba(255,180,0,.42)", marginBottom:".4rem" }}>SOLAR FLASH — PHASE 2</div>
          <h1 style={{ fontFamily:T.font, fontSize:"clamp(1.6rem,4vw,2.6rem)", fontWeight:900, background:"linear-gradient(135deg,#fff 0%,#ffd700 40%,#ff8c00 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", letterSpacing:".08em" }}>
            ALPHA ENGINE
          </h1>
          <p style={{ fontFamily:T.body, fontSize:".9rem", color:"rgba(255,255,255,.38)", letterSpacing:".1em", marginTop:".3rem" }}>
            Trade-ready signals from highest-ranked opportunities · Entry · TP · SL · Strategy · AI Reasoning
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{ textAlign:"center", padding:"6rem 2rem" }}>
            <span style={{ width:"36px", height:"36px", borderRadius:"50%", border:"3px solid rgba(255,180,0,.2)", borderTop:"3px solid #ffd700", display:"inline-block", animation:"ae-spin 1s linear infinite", marginBottom:"1.2rem" }}/>
            <p style={{ fontFamily:T.body, fontSize:"1rem", color:"rgba(255,255,255,.35)", letterSpacing:".1em" }}>Generating signal from intelligence layers…</p>
          </div>
        )}

        {/* Signal */}
        {!loading && opp && signal && (
          <div style={{ animation:"ae-fade .5s ease" }}>
            {/* Signal Header */}
            <SignalHeader opp={opp} signal={signal}/>

            {/* Main layout: Signal + Chart | Why column */}
            <div className="ae-main" style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:"1.2rem", marginBottom:"1.2rem" }}>
              <div>
                {/* Signal Box */}
                <SignalBox signal={signal}/>
                {/* Strategy Panel */}
                <StrategyPanel signal={signal} opp={opp}/>
              </div>

              {/* Why this signal (right column) */}
              <div className="ae-reason-why">
                <div style={{ padding:"1.2rem 1.3rem", borderRadius:"14px", border:"1px solid rgba(0,229,255,.2)", background:"linear-gradient(135deg,rgba(0,229,255,.05),rgba(0,0,0,.6))", backdropFilter:"blur(10px)", height:"100%" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:".6rem", marginBottom:"1rem" }}>
                    <span style={{ fontSize:"1rem" }}>🤖</span>
                    <span style={{ fontFamily:T.font, fontSize:".44rem", fontWeight:700, color:T.cyan, letterSpacing:".14em" }}>WHY THIS SIGNAL?</span>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:".55rem" }}>
                    {[
                      `${opp.narrative} narrative is strong and growing`,
                      `Smart money ${opp.smStatus.toLowerCase()} this week`,
                      `Market trend is ${opp.marketTrend}`,
                      `Token health is ${opp.health}`,
                      `High opportunity score (${opp.opScore}/100)`,
                      `Similar setups had 75% success rate`,
                    ].map((r,i)=>(
                      <div key={i} style={{ display:"flex", gap:".6rem", alignItems:"flex-start" }}>
                        <span style={{ color:T.ok, fontSize:".75rem", flexShrink:0, marginTop:".1rem" }}>•</span>
                        <span style={{ fontFamily:T.body, fontSize:".88rem", color:"rgba(255,255,255,.6)", lineHeight:1.6 }}>{r}</span>
                      </div>
                    ))}
                  </div>
                  {/* Score breakdown */}
                  <div style={{ marginTop:"1.2rem", padding:".9rem 1rem", borderRadius:"10px", border:"1px solid rgba(255,255,255,.08)", background:"rgba(0,0,0,.4)" }}>
                    <div style={{ fontFamily:T.font, fontSize:".3rem", letterSpacing:".2em", color:"rgba(255,255,255,.28)", marginBottom:".7rem" }}>ALPHA SCORE BREAKDOWN</div>
                    {[
                      {l:"Narrative",  v:opp.narrativeScore, c:T.gold},
                      {l:"Smart Money",v:opp.smScore,         c:T.cyan},
                      {l:"Market",     v:opp.marketScore,     c:T.purple},
                      {l:"Token",      v:opp.tokenScore,      c:T.ok},
                    ].map((s,i)=>(
                      <div key={i} style={{ marginBottom:".45rem" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:".18rem" }}>
                          <span style={{ fontFamily:T.body, fontSize:".8rem", color:"rgba(255,255,255,.5)" }}>{s.l}</span>
                          <span style={{ fontFamily:T.font, fontSize:".44rem", fontWeight:700, color:s.c }}>{s.v}</span>
                        </div>
                        <div style={{ height:"3px", borderRadius:"99px", background:"rgba(255,255,255,.07)", overflow:"hidden" }}>
                          <div style={{ width:`${s.v}%`, height:"100%", background:`linear-gradient(to right,${s.c}55,${s.c})`, borderRadius:"99px" }}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Reasoning Panel */}
            <ReasoningPanel signal={signal} opp={opp}/>

            {/* Chart Panel */}
            <div style={{ padding:"1.2rem 1.4rem", borderRadius:"14px", border:"1px solid rgba(255,255,255,.08)", background:"rgba(0,0,0,.48)", backdropFilter:"blur(8px)", marginBottom:"1.2rem" }}>
              <div style={{ fontFamily:T.font, fontSize:".44rem", fontWeight:700, color:"rgba(255,255,255,.6)", letterSpacing:".14em", marginBottom:".8rem" }}>
                📊 PRICE CHART — ENTRY/TP/SL LEVELS
              </div>
              <SignalChart signal={signal} coin={opp.coin}/>
              <p style={{ fontFamily:T.body, fontSize:".78rem", color:"rgba(255,255,255,.25)", textAlign:"center", marginTop:".6rem", letterSpacing:".06em" }}>
                Simulated chart for illustration · Always verify with live price data
              </p>
            </div>

            {/* Data Tabs */}
            <DataTabs opp={opp} signal={signal}/>

            {/* Action Bar */}
            <ActionBar opp={opp} signal={signal} tracked={tracked} onTrack={()=>setTracked(t=>!t)}/>

            <div style={{ textAlign:"center", padding:"1.4rem 0 0", marginTop:"1.2rem", borderTop:"1px solid rgba(255,255,255,.05)" }}>
              <p style={{ fontFamily:T.body, fontSize:".75rem", color:"rgba(255,255,255,.18)", letterSpacing:".1em" }}>
                Alpha Engine — Solar Flash Phase 2 — This is intelligence, not financial advice — Always DYOR — Never risk more than you can afford to lose
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
