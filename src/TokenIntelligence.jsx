/**
 * TokenIntelligence.jsx — Solar Flash Token Intelligence Engine
 * Merges: Survival Score + Report Card + AI Intelligence Layer
 * Route: /token
 */

import { useState, useEffect, useRef, useCallback } from "react";

// ── DESIGN ───────────────────────────────────────────────────
const T = {
  gold:   "#ffd700", orange: "#ff8c00", cyan: "#00e5ff",
  ok:     "#50ffa0", purple: "#b060ff", danger:"#ff3535",
  black:  "#050403",
  font:   "'Orbitron', monospace", body: "'Rajdhani', sans-serif",
};

// ── CONFIG ───────────────────────────────────────────────────
// ── SECURE: All API calls go through /api/token/scan (server-side)
// No API keys in client code

// ── FORMATTERS ───────────────────────────────────────────────
const fmtNum = (n) => {
  if (!n && n !== 0) return "—";
  if (n >= 1e9) return (n/1e9).toFixed(2)+"B";
  if (n >= 1e6) return (n/1e6).toFixed(2)+"M";
  if (n >= 1e3) return (n/1e3).toFixed(2)+"K";
  return Number(n).toLocaleString();
};
const fmtUsd = (n) => {
  if (!n && n !== 0) return "—";
  if (n >= 1e9) return "$"+(n/1e9).toFixed(2)+"B";
  if (n >= 1e6) return "$"+(n/1e6).toFixed(2)+"M";
  if (n >= 1e3) return "$"+(n/1e3).toFixed(2)+"K";
  return "$"+Number(n).toFixed(4);
};
const fmtPct = (n) => {
  if (n === null || n === undefined) return "—";
  return (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
};
const fmtPrice = (p) => {
  if (!p && p !== 0) return "—";
  if (p >= 1) return "$"+p.toLocaleString("en-US",{maximumFractionDigits:4});
  if (p >= 0.01) return "$"+p.toFixed(6);
  const s = p.toFixed(30);
  const m = s.match(/^0\.(0*)(\d{1,6})/);
  if (!m) return "$"+p.toFixed(8);
  const zeros = m[1].length;
  const sig   = m[2].replace(/0+$/,"").slice(0,5);
  const SUB   = "₀₁₂₃₄₅₆₇₈₉";
  if (zeros < 4) return `$0.${"0".repeat(zeros)}${sig}`;
  return `$0.0${[...zeros.toString()].map(d=>SUB[+d]).join("")}${sig}`;
};

// ── SCORE ENGINE ─────────────────────────────────────────────
function calcScore(data) {
  let score = 100;
  const flags = [], goods = [];

  if (data.mintAuthority) {
    score -= 30;
    flags.push({ sev:"critical", icon:"🚨", text:"Mint authority ACTIVE — dev can print unlimited tokens" });
  } else {
    goods.push({ icon:"✅", text:"Mint authority revoked — supply is fixed" });
  }
  if (data.freezeAuthority) {
    score -= 20;
    flags.push({ sev:"high", icon:"⚠️", text:"Freeze authority active — wallets can be frozen" });
  } else {
    goods.push({ icon:"✅", text:"Freeze authority revoked" });
  }
  if (data.lpBurned) {
    goods.push({ icon:"🔥", text:"Liquidity burned — rug pull impossible" });
  } else {
    score -= 30;
    flags.push({ sev:"critical", icon:"🚨", text:"Liquidity NOT secured — HIGH rug pull risk" });
  }
  if (data.topHolderPct > 50) {
    score -= 25;
    flags.push({ sev:"critical", icon:"🚨", text:`Top holder owns ${data.topHolderPct.toFixed(1)}% — extreme concentration` });
  } else if (data.topHolderPct > 20) {
    score -= 10;
    flags.push({ sev:"medium", icon:"⚠️", text:`Top holder owns ${data.topHolderPct.toFixed(1)}% — moderate concentration` });
  } else if (data.topHolderPct > 0) {
    goods.push({ icon:"✅", text:`Top holder ${data.topHolderPct.toFixed(1)}% — healthy distribution` });
  }
  if (data.holderCount < 50) {
    score -= 10;
    flags.push({ sev:"low", icon:"⚠️", text:`Only ${data.holderCount} holders — very early stage` });
  } else if (data.holderCount > 500) {
    goods.push({ icon:"✅", text:`${fmtNum(data.holderCount)} holders — solid community` });
  }

  score = Math.max(0, Math.min(100, score));

  let grade, color, verdict;
  if      (score >= 80) { grade="A"; color=T.ok;     verdict="SAFE SIGNAL" }
  else if (score >= 60) { grade="B"; color=T.gold;   verdict="PROCEED WITH CAUTION" }
  else if (score >= 40) { grade="C"; color=T.orange; verdict="HIGH RISK" }
  else                  { grade="D"; color=T.danger; verdict="DANGER — AVOID" }

  return { score, grade, color, verdict, flags, goods };
}

// ── THREAT RISK VECTORS ──────────────────────────────────────
function calcRisks(data, scored) {
  return [
    {
      id:"rug",    label:"RUG RISK",    icon:"☠️", color:T.danger,
      value: data.mintAuthority ? 0.75 : data.lpBurned ? 0.15 : 0.55,
    },
    {
      id:"whale",  label:"WHALE RISK",  icon:"🐋", color:T.orange,
      value: Math.min(0.95, (data.topHolderPct||0)/100 * 1.5),
    },
    {
      id:"liq",    label:"LIQUIDITY",   icon:"💧", color:T.cyan,
      value: data.liquidity > 500000 ? 0.15 : data.liquidity > 100000 ? 0.35 : 0.65,
    },
    {
      id:"vol",    label:"VOLATILITY",  icon:"📈", color:T.gold,
      value: Math.abs(data.change24h||0) > 50 ? 0.7 : Math.abs(data.change24h||0) > 20 ? 0.45 : 0.2,
    },
    {
      id:"con",    label:"CONTRACT",    icon:"📋", color:T.ok,
      value: (data.mintAuthority ? 0.4 : 0) + (data.freezeAuthority ? 0.3 : 0) + 0.1,
    },
  ];
}

// ── AI SUMMARY ENGINE ────────────────────────────────────────
function generateAISummary(data, scored, risks) {
  const { score, grade, verdict, flags, goods } = scored;
  const maxRisk = Math.max(...risks.map(r => r.value));

  const context = score >= 80 ? "low-risk"
    : score >= 60 ? "moderate-risk"
    : score >= 40 ? "high-risk" : "critical-risk";

  const summaries = {
    "low-risk": [
      `${data.name} presents a favorable intelligence profile. Mint authority is revoked, liquidity appears secured, and holder distribution is within acceptable parameters. Smart money signals are neutral-to-positive.`,
      `Survival analysis indicates ${data.name} meets baseline safety criteria. No major red flags detected in contract structure. Recommended: monitor for whale movements and liquidity changes.`,
    ],
    "moderate-risk": [
      `${data.name} shows mixed intelligence signals. Structural fundamentals have some concerns — review flag summary below. Proceed with position sizing discipline and defined risk limits.`,
      `Intelligence assessment for ${data.name}: moderate risk profile. Some indicators require monitoring. Not recommended for large position sizes without further due diligence.`,
    ],
    "high-risk": [
      `${data.name} is flagged as HIGH RISK by the intelligence engine. Multiple structural vulnerabilities detected. Only consider with strict loss limits and full understanding of identified threats.`,
      `Warning: ${data.name} intelligence scan reveals elevated risk across multiple vectors. Contract structure and liquidity profile suggest significant downside exposure.`,
    ],
    "critical-risk": [
      `CRITICAL: ${data.name} has failed multiple survival checks. High probability of adverse outcomes. Intelligence engine recommends AVOID until fundamental issues are resolved.`,
      `${data.name} intelligence assessment: DANGER signal. Critical flags detected in contract and liquidity structure. This profile matches known exit scam patterns. Exercise extreme caution.`,
    ],
  };

  const pool = summaries[context];
  const summary = pool[Math.floor(Math.random() * pool.length)];

  const riskInterpretation = maxRisk > 0.6
    ? "Threat radar shows CRITICAL exposure across multiple vectors."
    : maxRisk > 0.4
    ? "Threat radar shows ELEVATED risk in key areas."
    : "Threat radar shows LOW-to-MODERATE risk across all vectors.";

  const marketContext = data.price
    ? `Market data: ${fmtPrice(data.price)} · ${fmtUsd(data.marketCap)} mcap · ${fmtUsd(data.liquidity)} liquidity · ${fmtPct(data.change24h)} 24h.`
    : "Market data unavailable — token may not be listed on major DEXes.";

  const conclusion = score >= 70
    ? "AI Conclusion: Profile passes minimum safety thresholds. Confidence: MODERATE-HIGH."
    : score >= 50
    ? "AI Conclusion: Profile shows mixed signals. Proceed with caution. Confidence: LOW-MODERATE."
    : "AI Conclusion: Profile fails multiple safety checks. High-risk classification confirmed.";

  return { summary, riskInterpretation, marketContext, conclusion };
}

// ── RADAR CANVAS ─────────────────────────────────────────────
function ThreatRadarMini({ risks }) {
  const ref = useRef(null);
  const anim = useRef(null);
  const angle = useRef(-Math.PI/2);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    const S = c.width, cx = S/2, cy = S/2, R = S*0.37, N = risks.length;
    const draw = () => {
      ctx.clearRect(0,0,S,S);
      // Rings
      for (let i=1;i<=4;i++) {
        ctx.beginPath(); ctx.arc(cx,cy,R*i/4,0,Math.PI*2);
        ctx.strokeStyle=`rgba(255,180,0,.07)`; ctx.lineWidth=1; ctx.stroke();
      }
      // Axes
      risks.forEach((_,i) => {
        const a=(i/N)*Math.PI*2-Math.PI/2;
        ctx.beginPath(); ctx.moveTo(cx,cy);
        ctx.lineTo(cx+Math.cos(a)*(R+6), cy+Math.sin(a)*(R+6));
        ctx.strokeStyle="rgba(255,255,255,.05)"; ctx.setLineDash([3,5]); ctx.stroke(); ctx.setLineDash([]);
      });
      // Sweep
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+Math.cos(angle.current)*R, cy+Math.sin(angle.current)*R);
      ctx.strokeStyle="rgba(255,180,0,.5)"; ctx.lineWidth=1.5; ctx.stroke();
      // Polygon
      ctx.beginPath();
      risks.forEach((r,i) => {
        const a=(i/N)*Math.PI*2-Math.PI/2, rv=R*r.value;
        if(i===0) ctx.moveTo(cx+Math.cos(a)*rv, cy+Math.sin(a)*rv);
        else ctx.lineTo(cx+Math.cos(a)*rv, cy+Math.sin(a)*rv);
      });
      ctx.closePath(); ctx.fillStyle="rgba(255,80,0,.12)"; ctx.fill();
      ctx.strokeStyle="rgba(255,140,0,.45)"; ctx.lineWidth=1.5; ctx.stroke();
      // Dots + labels
      risks.forEach((r,i) => {
        const a=(i/N)*Math.PI*2-Math.PI/2, rv=R*r.value;
        const x=cx+Math.cos(a)*rv, y=cy+Math.sin(a)*rv;
        ctx.beginPath(); ctx.arc(x,y,4,0,Math.PI*2);
        ctx.fillStyle=r.color; ctx.shadowColor=r.color; ctx.shadowBlur=8; ctx.fill(); ctx.shadowBlur=0;
        const lx=cx+Math.cos(a)*(R+20), ly=cy+Math.sin(a)*(R+20);
        ctx.fillStyle="rgba(255,255,255,.45)"; ctx.font="9px 'Rajdhani',sans-serif"; ctx.textAlign="center"; ctx.textBaseline="middle";
        ctx.fillText(r.label, lx, ly);
        ctx.fillStyle=`${r.color}aa`; ctx.font="8px 'Rajdhani',sans-serif";
        ctx.fillText(`${Math.round(r.value*100)}%`, lx, ly+11);
      });
      ctx.beginPath(); ctx.arc(cx,cy,3,0,Math.PI*2);
      ctx.fillStyle=T.orange; ctx.shadowColor=T.orange; ctx.shadowBlur=10; ctx.fill(); ctx.shadowBlur=0;
      angle.current += 0.02;
      anim.current = requestAnimationFrame(draw);
    };
    anim.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(anim.current);
  }, [risks]);

  return <canvas ref={ref} width={240} height={240} style={{ width:"240px", height:"240px", maxWidth:"100%" }}/>;
}

// ── SECURE API: calls /api/token/scan server-side proxy ─────────
async function fetchAll(mint) {
  const r = await fetch(`/api/token/scan?mint=${mint}`);
  if (!r.ok) throw new Error(`Scan failed: ${r.status}`);
  return await r.json();
}

// ── SECTION COMPONENTS ───────────────────────────────────────
function Section({ title, icon, color = T.gold, children }) {
  return (
    <div style={{ borderRadius:"14px", border:`1px solid ${color}1e`, background:"rgba(0,0,0,.48)", backdropFilter:"blur(10px)", overflow:"hidden", marginBottom:"1.2rem" }}>
      <div style={{ padding:".85rem 1.4rem", borderBottom:`1px solid ${color}12`, background:`${color}05`, display:"flex", alignItems:"center", gap:".6rem" }}>
        <span style={{ fontSize:"1.05rem" }}>{icon}</span>
        <span style={{ fontFamily:T.font, fontSize:".52rem", fontWeight:700, color, letterSpacing:".14em" }}>{title}</span>
        <div style={{ flex:1, height:"1px", background:`linear-gradient(to right,${color}22,transparent)`, marginLeft:".5rem" }}/>
      </div>
      <div style={{ padding:"1.3rem 1.4rem" }}>{children}</div>
    </div>
  );
}

function StatGrid({ stats }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,130px),1fr))", gap:".7rem" }}>
      {stats.map((s,i) => (
        <div key={i} style={{ padding:".85rem 1rem", borderRadius:"10px", border:`1px solid ${s.color||T.gold}18`, background:"rgba(0,0,0,.4)", textAlign:"center" }}>
          <div style={{ fontFamily:T.font, fontSize:".3rem", letterSpacing:".2em", color:"rgba(255,255,255,.28)", marginBottom:".4rem" }}>{s.label}</div>
          <div style={{ fontFamily:T.body, fontSize:"clamp(.88rem,2.5vw,1.1rem)", fontWeight:700, color:s.color||T.gold, lineHeight:1.1 }}>{s.value}</div>
          {s.sub && <div style={{ fontFamily:T.body, fontSize:".78rem", color:"rgba(255,255,255,.28)", marginTop:".2rem" }}>{s.sub}</div>}
        </div>
      ))}
    </div>
  );
}

// ── MAIN COMPONENT ───────────────────────────────────────────
export default function TokenIntelligence() {
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [step,    setStep]    = useState("");
  const [report,  setReport]  = useState(null);
  const [error,   setError]   = useState(null);
  const [aiOpen,  setAiOpen]  = useState(true);
  const scanRef = useRef(null);

  const analyze = useCallback(async () => {
    const mint = input.trim();
    if (!mint || mint.length < 32) { setError("Enter a valid Solana token address."); return; }
    setError(null); setReport(null); setLoading(true);
    try {
      setStep("Scanning on-chain…");
      // /api/token/scan returns pre-processed data from server
      const apiData = await fetchAll(mint);
      setStep("Running survival analysis…");
      await new Promise(r => setTimeout(r, 300));

      const data = {
        mint,
        name:            apiData.name           ?? "Unknown Token",
        symbol:          apiData.symbol         ?? "???",
        image:           apiData.image          ?? null,
        mintAuthority:   apiData.mint_authority ? "active" : null,
        freezeAuthority: apiData.freeze_authority ? "active" : null,
        supply:          apiData.supply         ?? 0,
        decimals:        apiData.decimals       ?? 6,
        holderCount:     apiData.holder_count   ?? 0,
        topHolderPct:    apiData.top_holder_pct ?? 0,
        lpBurned:        apiData.lp_burned      ?? false,
        price:           apiData.price_usd,
        marketCap:       apiData.market_cap_usd,
        liquidity:       apiData.liquidity_usd,
        volume24h:       apiData.volume_24h_usd,
        change24h:       apiData.change_24h_pct,
        buys24h:         null,
        sells24h:        null,
        dexUrl:          apiData.dex_url,
        holders:         apiData.holders_detail ?? [],
        rugcheckScore:   apiData.rugcheck_score,
        rugcheckRisks:   apiData.rugcheck_risks ?? [],
        // API already calculated these server-side
        survival_score:  apiData.survival_score,
        grade:           apiData.grade,
        verdict:         apiData.verdict,
      };

      setStep("Generating AI intelligence summary…");
      await new Promise(r => setTimeout(r, 300));

      // Use server-calculated score, or recalculate if needed
      const scored = data.survival_score != null ? {
        score:   data.survival_score,
        grade:   data.grade,
        color:   data.survival_score>=80?"#50ffa0":data.survival_score>=60?"#ffd700":data.survival_score>=40?"#ff8c00":"#ff3535",
        verdict: data.verdict,
        flags:   [], goods: [],
      } : calcScore(data);
      const risks  = calcRisks(data, scored);
      const ai     = generateAISummary(data, scored, risks);

      setReport({ ...data, scored, risks, ai });
      setTimeout(() => scanRef.current?.scrollIntoView({ behavior:"smooth", block:"start" }), 100);
    } catch(e) {
      setError("Analysis failed. Check the address and try again.");
      console.error(e);
    } finally { setLoading(false); setStep(""); }
  }, [input]);

  return (
    <div style={{ minHeight:"100vh", background:T.black, color:"#fff", fontFamily:T.font, position:"relative", overflowX:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-track{background:#050403;} ::-webkit-scrollbar-thumb{background:#ffd70055;}
        @keyframes ti-grid{0%,100%{opacity:.015;}50%{opacity:.028;}}
        @media(max-width:768px){
          .ti-report-grid{grid-template-columns:1fr!important;}
          .ti-ai-grid{grid-template-columns:1fr!important;}
          .ti-holder-grid{grid-template-columns:1fr 1fr auto!important;}
          .ti-stat-grid{grid-template-columns:1fr 1fr!important;}
        }
        @media(max-width:480px){
          .ti-holder-grid{display:none!important;}
          .ti-nav-btns{display:none!important;}
        }
        @keyframes ti-scan{0%{transform:scaleX(0);opacity:0;}30%{opacity:1;}100%{transform:scaleX(1);opacity:0;}}
        @keyframes ti-spin{to{transform:rotate(360deg);}}
        @keyframes ti-fade{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
        @keyframes ti-pulse{0%,100%{box-shadow:0 0 20px rgba(255,180,0,.1);}50%{box-shadow:0 0 40px rgba(255,180,0,.22);}}
        @keyframes ti-blink{0%,100%{opacity:1;}50%{opacity:.2;}}
        input::placeholder{color:rgba(255,255,255,.22);}
        .ti-card-hover{transition:transform .28s,border-color .28s,box-shadow .28s;will-change:transform;}
        .ti-card-hover:hover{transform:translateY(-2px);}
      `}</style>

      {/* Background */}
      <div style={{ position:"absolute", inset:0, zIndex:0, pointerEvents:"none", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(80,255,160,.012) 1px,transparent 1px),linear-gradient(90deg,rgba(80,255,160,.012) 1px,transparent 1px)", backgroundSize:"65px 65px", animation:"ti-grid 10s ease-in-out infinite" }}/>
        <div style={{ position:"absolute", top:"5%",   right:"-8%",  width:"600px", height:"600px", borderRadius:"50%", background:"radial-gradient(circle,rgba(80,255,160,.04),transparent 65%)" }}/>
        <div style={{ position:"absolute", bottom:"5%", left:"-8%",  width:"500px", height:"500px", borderRadius:"50%", background:"radial-gradient(circle,rgba(255,100,0,.04),transparent 65%)" }}/>
      </div>

      <div style={{ position:"relative", zIndex:10, maxWidth:"1050px", margin:"0 auto", padding:"clamp(1.5rem,4vw,3rem) clamp(1rem,4vw,2rem)" }}>

        {/* ── NAV ── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"2.5rem", flexWrap:"wrap", gap:"1rem" }}>
          <a href="/app" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:".6rem", padding:".4rem .9rem", borderRadius:"7px", border:"1px solid rgba(255,255,255,.1)", background:"rgba(0,0,0,.35)", transition:"all .2s" }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,180,0,.4)";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,.1)";}}>
            <span style={{ fontFamily:T.font, fontSize:".4rem", letterSpacing:".18em", color:"rgba(255,215,0,.7)" }}>← APP HUB</span>
          </a>
          <div style={{ display:"flex", gap:".5rem", flexWrap:"wrap" }}>
            {[{l:"WALLET",href:"/dashboard",c:T.cyan},{l:"MARKET",href:"/alerts",c:T.gold},{l:"PULSE",href:"/pulse",c:T.orange}].map(b=>(
              <a key={b.l} href={b.href} style={{textDecoration:"none"}}>
                <button style={{padding:".35rem .85rem",borderRadius:"6px",border:`1px solid ${b.c}28`,background:"rgba(0,0,0,.35)",color:`${b.c}88`,fontFamily:T.font,fontSize:".34rem",letterSpacing:".16em",cursor:"pointer",transition:"all .2s"}}
                  onMouseEnter={e=>{e.currentTarget.style.color=b.c;e.currentTarget.style.borderColor=`${b.c}55`;}}
                  onMouseLeave={e=>{e.currentTarget.style.color=`${b.c}88`;e.currentTarget.style.borderColor=`${b.c}28`;}}>
                  {b.l}
                </button>
              </a>
            ))}
          </div>
        </div>

        {/* ── HEADER ── */}
        <div style={{ textAlign:"center", marginBottom:"clamp(2rem,5vw,3rem)" }}>
          <div style={{ fontFamily:T.font, fontSize:".44rem", letterSpacing:".42em", color:"rgba(80,255,160,.55)", marginBottom:".8rem" }}>INTELLIGENCE MODULE 03</div>
          <h1 style={{ fontFamily:T.font, fontSize:"clamp(1.8rem,5vw,3rem)", fontWeight:900, background:"linear-gradient(135deg,#fff 0%,#50ffa0 40%,#00e5ff 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", letterSpacing:".1em", marginBottom:".8rem" }}>
            TOKEN INTELLIGENCE
          </h1>
          <p style={{ fontFamily:T.body, fontSize:"clamp(.9rem,2vw,1.05rem)", color:"rgba(255,255,255,.38)", letterSpacing:".1em", maxWidth:"540px", margin:"0 auto" }}>
            Paste any Solana token address for a complete intelligence report —<br/>
            Survival Score · Threat Radar · AI Risk Summary
          </p>
        </div>

        {/* ── SCANNER INPUT ── */}
        <div style={{ maxWidth:"640px", margin:"0 auto clamp(2rem,5vw,3rem)", position:"relative" }}>
          <div style={{ display:"flex", gap:".7rem", alignItems:"center" }}>
            <div style={{ flex:1, position:"relative" }}>
              <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&analyze()}
                placeholder="Token contract address (Solana)…"
                style={{ width:"100%", padding:".9rem 1.2rem", borderRadius:"10px", border:`1.5px solid rgba(80,255,160,.28)`, background:"rgba(0,0,0,.5)", color:"#fff", fontFamily:T.body, fontSize:"1rem", letterSpacing:".04em", outline:"none", backdropFilter:"blur(8px)", transition:"border-color .2s" }}
                onFocus={e=>{e.target.style.borderColor="rgba(80,255,160,.65)";e.target.style.boxShadow="0 0 0 3px rgba(80,255,160,.08)";}}
                onBlur={e=>{e.target.style.borderColor="rgba(80,255,160,.28)";e.target.style.boxShadow="none";}}
              />
              {loading && <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"2px", background:"linear-gradient(to right,transparent,rgba(80,255,160,.7),transparent)", animation:"ti-scan 1.6s linear infinite", borderRadius:"99px" }}/>}
            </div>
            <button onClick={analyze} disabled={loading || !input.trim()}
              style={{ padding:".9rem 1.5rem", borderRadius:"10px", border:"1.5px solid rgba(80,255,160,.5)", background:"linear-gradient(135deg,rgba(80,255,160,.18),rgba(0,229,255,.08))", color:"rgba(80,255,160,.95)", fontFamily:T.font, fontSize:".52rem", letterSpacing:".18em", cursor:loading||!input.trim()?"not-allowed":"pointer", opacity:loading||!input.trim()?.5:1, transition:"all .3s", fontWeight:700, flexShrink:0, display:"flex", alignItems:"center", gap:".5rem" }}
              onMouseEnter={e=>{if(!loading&&input)e.currentTarget.style.boxShadow="0 0 32px rgba(80,255,160,.25)";}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";}}>
              {loading
                ? <><span style={{width:"12px",height:"12px",borderRadius:"50%",border:"2px solid rgba(80,255,160,.3)",borderTop:"2px solid #50ffa0",display:"inline-block",animation:"ti-spin 1s linear infinite"}}/>{step||"SCANNING"}</>
                : "🎯 ANALYZE"}
            </button>
          </div>
          {error && <p style={{ fontFamily:T.body, color:T.danger, fontSize:".9rem", marginTop:".7rem", letterSpacing:".05em" }}>{error}</p>}
        </div>

        {/* ── EMPTY STATE ── */}
        {!report && !loading && (
          <div style={{ textAlign:"center", padding:"4rem 1rem", border:"1px solid rgba(80,255,160,.08)", borderRadius:"16px", background:"rgba(0,0,0,.22)" }}>
            <div style={{ fontSize:"3rem", marginBottom:"1.2rem", opacity:.22 }}>🎯</div>
            <p style={{ fontFamily:T.body, fontSize:"1.05rem", color:"rgba(255,255,255,.28)", letterSpacing:".1em" }}>
              Paste a Solana token address to generate a full intelligence report
            </p>
          </div>
        )}

        {/* ── REPORT ── */}
        {report && !loading && (
          <div ref={scanRef} style={{ animation:"ti-fade .5s ease" }}>

            {/* Token header */}
            <div style={{ display:"flex", alignItems:"center", gap:"1.2rem", marginBottom:"1.8rem", padding:"1.2rem 1.5rem", borderRadius:"14px", border:"1px solid rgba(255,255,255,.08)", background:"rgba(0,0,0,.5)", backdropFilter:"blur(12px)", flexWrap:"wrap" }}>
              {report.image && <img src={report.image} alt={report.symbol} style={{ width:"56px", height:"56px", borderRadius:"50%", border:"2px solid rgba(255,180,0,.35)", objectFit:"cover" }} onError={e=>{e.target.style.display="none";}}/>}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:T.font, fontSize:"clamp(.85rem,2.5vw,1.2rem)", fontWeight:900, color:"#fff", letterSpacing:".08em" }}>{report.name}</div>
                <div style={{ fontFamily:T.body, fontSize:".9rem", color:"rgba(255,255,255,.4)" }}>${report.symbol} · {report.mint.slice(0,8)}…{report.mint.slice(-6)}</div>
              </div>
              {/* Grade */}
              <div style={{ textAlign:"center", flexShrink:0 }}>
                <div style={{ fontFamily:T.font, fontSize:"clamp(2rem,6vw,3.5rem)", fontWeight:900, color:report.scored.color, lineHeight:1, textShadow:`0 0 30px ${report.scored.color}88` }}>{report.scored.grade}</div>
                <div style={{ fontFamily:T.font, fontSize:".38rem", color:report.scored.color, letterSpacing:".2em" }}>{report.scored.score}/100</div>
              </div>
            </div>

            {/* ── ROW 1: Survival Score + Market Data ── */}
            <div className="ti-report-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,300px),1fr))", gap:"1.2rem", marginBottom:"1.2rem" }}>

              {/* Survival Score */}
              <Section title="SURVIVAL SCORE" icon="🛡" color={report.scored.color}>
                <div style={{ textAlign:"center", marginBottom:"1rem" }}>
                  <div style={{ fontFamily:T.font, fontSize:".42rem", letterSpacing:".32em", color:`${report.scored.color}88`, marginBottom:".4rem" }}>VERDICT</div>
                  <div style={{ fontFamily:T.font, fontSize:"clamp(.8rem,3vw,1.1rem)", fontWeight:900, color:report.scored.color, letterSpacing:".1em" }}>{report.scored.verdict}</div>
                </div>
                {/* Progress ring */}
                <div style={{ position:"relative", width:"120px", margin:"0 auto 1rem", height:"120px", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <svg width="120" height="120" viewBox="0 0 120 120" style={{ position:"absolute" }}>
                    <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="8"/>
                    <circle cx="60" cy="60" r="50" fill="none" stroke={report.scored.color} strokeWidth="8"
                      strokeDasharray={`${report.scored.score*3.14} ${314-report.scored.score*3.14}`}
                      strokeDashoffset="78.5" strokeLinecap="round"/>
                  </svg>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontFamily:T.font, fontSize:"1.6rem", fontWeight:900, color:report.scored.color }}>{report.scored.score}</div>
                    <div style={{ fontFamily:T.font, fontSize:".32rem", color:"rgba(255,255,255,.3)" }}>/ 100</div>
                  </div>
                </div>
                {/* Risk items */}
                <div style={{ display:"flex", flexDirection:"column", gap:".4rem" }}>
                  {report.scored.flags.map((f,i) => (
                    <div key={i} style={{ display:"flex", gap:".55rem", padding:".6rem .85rem", borderRadius:"7px", background:"rgba(255,50,0,.07)", border:"1px solid rgba(255,80,0,.18)", fontSize:".82rem", fontFamily:T.body, color:"rgba(255,200,200,.7)", alignItems:"flex-start" }}>
                      <span style={{ flexShrink:0 }}>{f.icon}</span>{f.text}
                    </div>
                  ))}
                  {report.scored.goods.map((g,i) => (
                    <div key={i} style={{ display:"flex", gap:".55rem", padding:".6rem .85rem", borderRadius:"7px", background:"rgba(80,255,160,.06)", border:"1px solid rgba(80,255,160,.18)", fontSize:".82rem", fontFamily:T.body, color:"rgba(180,255,210,.7)", alignItems:"flex-start" }}>
                      <span style={{ flexShrink:0 }}>{g.icon}</span>{g.text}
                    </div>
                  ))}
                </div>
              </Section>

              {/* Market Data */}
              <Section title="MARKET DATA" icon="📊" color={T.gold}>
                <StatGrid stats={[
                  { label:"PRICE",      value: fmtPrice(report.price),    color:T.gold },
                  { label:"MKT CAP",    value: fmtUsd(report.marketCap),  color:T.cyan },
                  { label:"LIQUIDITY",  value: fmtUsd(report.liquidity),  color:T.ok   },
                  { label:"VOLUME 24H", value: fmtUsd(report.volume24h),  color:T.gold },
                  { label:"24H CHANGE", value: fmtPct(report.change24h),  color: (report.change24h||0)>=0?T.ok:T.danger },
                  { label:"BUYS/SELLS", value: report.buys24h!=null ? `${report.buys24h}/${report.sells24h}` : "—", color:"rgba(255,255,255,.6)" },
                ]}/>
                <div style={{ marginTop:"1rem" }}>
                  <div style={{ fontFamily:T.font, fontSize:".32rem", letterSpacing:".2em", color:"rgba(255,255,255,.28)", marginBottom:".6rem" }}>TOKEN DATA</div>
                  <StatGrid stats={[
                    { label:"SUPPLY",   value: fmtNum(report.supply),         color:"rgba(255,255,255,.6)" },
                    { label:"HOLDERS",  value: fmtNum(report.holderCount),     color:T.cyan },
                    { label:"TOP HOLD", value: `${(report.topHolderPct||0).toFixed(1)}%`, color:(report.topHolderPct||0)>30?T.danger:T.ok },
                    { label:"LP STATUS",value: report.lpBurned?"BURNED":"OPEN", color:report.lpBurned?T.ok:T.danger },
                  ]}/>
                </div>
                {report.dexUrl && (
                  <a href={report.dexUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none", display:"block", marginTop:"1rem" }}>
                    <button style={{ width:"100%", padding:".6rem", borderRadius:"8px", border:`1px solid ${T.gold}35`, background:`${T.gold}08`, color:T.gold, fontFamily:T.font, fontSize:".4rem", letterSpacing:".2em", cursor:"pointer", transition:"all .3s" }}
                      onMouseEnter={e=>{e.currentTarget.style.boxShadow=`0 0 24px ${T.gold}22`;}}
                      onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";}}>
                      VIEW ON DEXSCREENER →
                    </button>
                  </a>
                )}
              </Section>
            </div>

            {/* ── ROW 2: Threat Radar + Holders ── */}
            <div className="ti-report-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,300px),1fr))", gap:"1.2rem", marginBottom:"1.2rem" }}>

              {/* Threat Radar */}
              <Section title="THREAT RADAR" icon="🎯" color={T.orange}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"1rem" }}>
                  <ThreatRadarMini risks={report.risks}/>
                  <div style={{ width:"100%", display:"flex", flexDirection:"column", gap:".45rem" }}>
                    {report.risks.map((r,i) => (
                      <div key={i}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:".2rem" }}>
                          <span style={{ fontFamily:T.font, fontSize:".34rem", letterSpacing:".12em", color:r.color }}>{r.icon} {r.label}</span>
                          <span style={{ fontFamily:T.body, fontSize:".85rem", color:r.color, fontWeight:600 }}>{Math.round(r.value*100)}%</span>
                        </div>
                        <div style={{ height:"3px", borderRadius:"99px", background:"rgba(255,255,255,.06)", overflow:"hidden" }}>
                          <div style={{ width:`${r.value*100}%`, height:"100%", background:`linear-gradient(to right,${r.color}66,${r.color})`, borderRadius:"99px" }}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Section>

              {/* Top Holders */}
              <Section title="HOLDER INTELLIGENCE" icon="👥" color={T.purple}>
                <div>
                  <div style={{ display:"grid", gridTemplateColumns:"auto 1fr auto auto", gap:".5rem .8rem", alignItems:"center" }}>
                    {["#","ADDRESS","AMOUNT","%"].map((h,i) => (
                      <span key={i} style={{ fontFamily:T.font, fontSize:".3rem", letterSpacing:".15em", color:"rgba(255,255,255,.28)" }}>{h}</span>
                    ))}
                    {(report.holders||[]).map((h,i) => {
                      const totalRaw = report.supply * 10**(report.decimals||6);
                      const pct = totalRaw > 0 ? ((Number(h.amount)/totalRaw)*100).toFixed(2) : "—";
                      const isBurn = h.address?.startsWith("1nc1") || h.address?.startsWith("11111");
                      return [
                        <span key={`n${i}`} style={{ fontFamily:T.font, fontSize:".5rem", color:"rgba(255,255,255,.3)" }}>{i+1}</span>,
                        <span key={`a${i}`} style={{ fontFamily:T.body, fontSize:".82rem", color: isBurn ? T.ok : "rgba(255,255,255,.6)" }}>
                          {isBurn ? "🔥 BURN" : `${h.address?.slice(0,6)}…${h.address?.slice(-4)}`}
                        </span>,
                        <span key={`v${i}`} style={{ fontFamily:T.body, fontSize:".82rem", color:"rgba(255,255,255,.5)", textAlign:"right" }}>
                          {fmtNum(Number(h.uiAmount||h.amount/10**(report.decimals||6)))}
                        </span>,
                        <span key={`p${i}`} style={{ fontFamily:T.body, fontSize:".85rem", fontWeight:700, color: Number(pct)>30?T.danger:Number(pct)>15?T.orange:T.ok, textAlign:"right" }}>
                          {pct}%
                        </span>,
                      ];
                    })}
                  </div>
                </div>
              </Section>
            </div>

            {/* ── AI INTELLIGENCE SUMMARY ── */}
            <div style={{
              borderRadius:"16px",
              border:`1px solid ${T.cyan}28`,
              background:"linear-gradient(135deg,rgba(0,229,255,.04),rgba(0,0,0,.55))",
              backdropFilter:"blur(14px)",
              overflow:"hidden",
              marginBottom:"1.2rem",
              animation:"ti-pulse 5s ease-in-out infinite",
            }}>
              <div style={{ padding:"1rem 1.4rem", borderBottom:`1px solid ${T.cyan}14`, background:`${T.cyan}04`, display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer" }}
                onClick={() => setAiOpen(o=>!o)}>
                <div style={{ display:"flex", alignItems:"center", gap:".7rem" }}>
                  <span style={{ fontSize:"1.1rem" }}>🧠</span>
                  <div>
                    <div style={{ fontFamily:T.font, fontSize:".52rem", fontWeight:700, color:T.cyan, letterSpacing:".14em" }}>AI INTELLIGENCE SUMMARY</div>
                    <div style={{ fontFamily:T.body, fontSize:".8rem", color:"rgba(255,255,255,.3)", letterSpacing:".06em", marginTop:".1rem" }}>Powered by Solar Flash Intelligence Engine</div>
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:".8rem" }}>
                  <span style={{ width:"7px", height:"7px", borderRadius:"50%", background:T.cyan, boxShadow:`0 0 10px ${T.cyan}`, display:"inline-block", animation:"ti-blink 1.4s infinite" }}/>
                  <span style={{ fontFamily:T.font, fontSize:".4rem", color:`${T.cyan}66`, transition:"transform .25s", display:"inline-block", transform:aiOpen?"rotate(180deg)":"rotate(0)" }}>▼</span>
                </div>
              </div>

              {aiOpen && (
                <div style={{ padding:"1.4rem", animation:"ti-fade .3s ease" }}>
                  {/* AI Summary */}
                  <div style={{ padding:"1rem 1.2rem", borderRadius:"10px", border:`1px solid ${T.cyan}18`, background:`${T.cyan}06`, marginBottom:"1rem" }}>
                    <div style={{ fontFamily:T.font, fontSize:".34rem", letterSpacing:".22em", color:`${T.cyan}88`, marginBottom:".6rem" }}>⊙ AI ANALYSIS</div>
                    <p style={{ fontFamily:T.body, fontSize:".95rem", color:"rgba(255,255,255,.62)", lineHeight:1.75, letterSpacing:".04em" }}>{report.ai.summary}</p>
                  </div>

                  {/* Sub sections */}
                  <div className="ti-ai-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,280px),1fr))", gap:"1rem" }}>
                    {[
                      { label:"AI RISK INTERPRETATION", text:report.ai.riskInterpretation, color:T.orange, icon:"🎯" },
                      { label:"AI MARKET CONTEXT",      text:report.ai.marketContext,       color:T.gold,   icon:"📊" },
                      { label:"AI CONCLUSION",          text:report.ai.conclusion,          color:T.ok,     icon:"✦"  },
                    ].map((s,i) => (
                      <div key={i} style={{ padding:".9rem 1rem", borderRadius:"10px", border:`1px solid ${s.color}18`, background:`${s.color}05` }}>
                        <div style={{ fontFamily:T.font, fontSize:".3rem", letterSpacing:".2em", color:`${s.color}88`, marginBottom:".5rem" }}>{s.icon} {s.label}</div>
                        <p style={{ fontFamily:T.body, fontSize:".88rem", color:"rgba(255,255,255,.52)", lineHeight:1.65, letterSpacing:".04em" }}>{s.text}</p>
                      </div>
                    ))}
                  </div>

                  <p style={{ fontFamily:T.body, fontSize:".75rem", color:"rgba(255,255,255,.2)", letterSpacing:".08em", marginTop:"1rem", textAlign:"center" }}>
                    AI summaries are generated heuristically and are not financial advice.
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display:"flex", gap:"1rem", flexWrap:"wrap", justifyContent:"center", paddingBottom:"2rem" }}>
              <button onClick={() => setReport(null)}
                style={{ padding:".6rem 1.4rem", borderRadius:"8px", border:"1px solid rgba(255,255,255,.15)", background:"rgba(0,0,0,.35)", color:"rgba(255,255,255,.5)", fontFamily:T.font, fontSize:".42rem", letterSpacing:".2em", cursor:"pointer", transition:"all .2s" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,.35)";e.currentTarget.style.color="rgba(255,255,255,.8)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,.15)";e.currentTarget.style.color="rgba(255,255,255,.5)";}}>
                ↺ NEW SCAN
              </button>
              <a href="/app" style={{textDecoration:"none"}}>
                <button style={{ padding:".6rem 1.4rem", borderRadius:"8px", border:`1px solid ${T.ok}35`, background:`${T.ok}08`, color:T.ok, fontFamily:T.font, fontSize:".42rem", letterSpacing:".2em", cursor:"pointer", transition:"all .3s" }}
                  onMouseEnter={e=>{e.currentTarget.style.boxShadow=`0 0 22px ${T.ok}22`;}}
                  onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";}}>
                  ← APP HUB
                </button>
              </a>
            </div>

          </div>
        )}

        <div style={{ textAlign:"center", padding:"1.2rem 0", fontFamily:T.body, fontSize:".75rem", color:"rgba(255,255,255,.18)", letterSpacing:".1em" }}>
          Solar Flash Token Intelligence — $FLASH on Solana — Not financial advice
        </div>
      </div>
    </div>
  );
}
