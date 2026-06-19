import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS & DATA ENGINE
// ─────────────────────────────────────────────────────────────────────────────

const SEVERITY = {
  LOW:      { label:"LOW",      color:"#50ffa0", glow:"rgba(80,255,160,.35)",  bg:"rgba(80,255,160,.06)",  pulse:"rgba(80,255,160,.5)"  },
  MEDIUM:   { label:"MEDIUM",   color:"#ffd700", glow:"rgba(255,215,0,.35)",   bg:"rgba(255,215,0,.06)",   pulse:"rgba(255,215,0,.5)"   },
  HIGH:     { label:"HIGH",     color:"#ff8c00", glow:"rgba(255,140,0,.4)",    bg:"rgba(255,140,0,.07)",   pulse:"rgba(255,140,0,.6)"   },
  CRITICAL: { label:"CRITICAL", color:"#ff3535", glow:"rgba(255,53,53,.45)",   bg:"rgba(255,53,53,.08)",   pulse:"rgba(255,53,53,.7)"   },
};

const ALERT_TYPES = [
  { id:"whale",     label:"Whale Activity",   icon:"🐋", color:"#00e5ff" },
  { id:"volume",    label:"Volume Spike",      icon:"📈", color:"#ffd700" },
  { id:"liquidity", label:"Liquidity Alert",   icon:"💧", color:"#50ffa0" },
  { id:"smart",     label:"Smart Money",       icon:"🧠", color:"#b060ff" },
  { id:"risk",      label:"Risk Signal",       icon:"☠️", color:"#ff3535" },
  { id:"narrative", label:"Narrative Shift",   icon:"📡", color:"#ff8c00" },
];

const AI_SUMMARIES = {
  whale: [
    "Unusual whale accumulation detected across multiple wallets in coordinated pattern.",
    "Large-scale exit detected — wallet classification: historically profitable smart money.",
    "Whale cluster identified. Coordinated buy pressure building from 4 distinct addresses.",
    "Abnormal holding pattern shift — 3 top-10 wallets moving simultaneously.",
    "Smart whale entering position — similar behavior preceded 2 prior rallies.",
  ],
  volume: [
    "Volume 847% above 24h average. Momentum signal elevated.",
    "Sudden buy volume surge detected. No correlated news source identified — organic.",
    "Volume spike preceded by unusual DEX routing pattern — potential accumulation phase.",
    "Abnormal trading velocity detected. Sell-side volume pressure accelerating.",
    "Spike pattern matches pre-launch accumulation signature from historical database.",
  ],
  liquidity: [
    "Rapid liquidity withdrawal detected. Risk exposure elevated — monitor closely.",
    "Liquidity depth decreased 68% in under 4 minutes. Potential exit risk.",
    "Large LP position added — signals operator confidence in short-term price action.",
    "Liquidity concentration narrowing. Spread manipulation risk elevated.",
    "Unusual LP token burn detected. Rug vector classified as possible.",
  ],
  smart: [
    "Early accumulation from wallets with 94% historical accuracy rating.",
    "Coordinated wallet activity from 6 addresses — pattern matches pre-pump behavior.",
    "Smart money entry detected 3 blocks ago. Position sizing: large.",
    "Notable exit from wallet classified as Alpha Tier. Risk posture: cautious.",
    "Wallet cluster associated with 4 prior 10x events entering quietly.",
  ],
  risk: [
    "Mint authority detected as active. Token creation risk: elevated.",
    "Abnormal sell pressure from dev wallet. Rug probability scoring: HIGH.",
    "Freeze authority enabled. Token control centralized — exercise caution.",
    "Contract interaction pattern matches known exit scam vector.",
    "LP burn below threshold. Liquidity removal risk: persistent.",
  ],
  narrative: [
    "Narrative momentum accelerating across monitored intelligence channels.",
    "Token referenced in 340 monitored signals in past 60 minutes — 12x baseline.",
    "Cross-channel narrative emergence detected. Early signal confirmed.",
    "Sentiment shift from neutral to bullish across 7 tracked intelligence feeds.",
    "New narrative category emerging — AI + [token] correlation spiking.",
  ],
};

const TOKEN_POOL = [
  "FLASH","WIF","BONK","JUP","POPCAT","BOME","SLERF","MYRO","DOGWIFHAT","ORCA",
  "RAY","PYTH","JTO","MOODENG","PNUT","GIGA","CHILLGUY","MEW","TRUMP","FARTCOIN",
];

const CHAINS = ["Solana","Ethereum","Base","Arbitrum","BSC"];

let _idCounter = 1000;
function generateAlert(overrides = {}) {
  const typeObj = ALERT_TYPES[Math.floor(Math.random() * ALERT_TYPES.length)];
  const sevKeys = Object.keys(SEVERITY);
  const sevKey  = sevKeys[Math.floor(Math.random() * sevKeys.length)];
  const sev     = SEVERITY[sevKey];
  const token   = TOKEN_POOL[Math.floor(Math.random() * TOKEN_POOL.length)];
  const summaries = AI_SUMMARIES[typeObj.id];
  const summary   = summaries[Math.floor(Math.random() * summaries.length)];
  const confidence = 62 + Math.floor(Math.random() * 35);
  const chain   = CHAINS[Math.floor(Math.random() * CHAINS.length)];

  return {
    id:        ++_idCounter,
    type:      typeObj,
    severity:  sevKey,
    token,
    chain,
    summary,
    confidence,
    timestamp: Date.now(),
    value:     sevKey === "CRITICAL" || sevKey === "HIGH"
               ? `$${(Math.random()*2+.1).toFixed(2)}M`
               : `$${(Math.random()*800+50).toFixed(0)}K`,
    isNew:     true,
    ...overrides,
  };
}

function seedAlerts() {
  return Array.from({length:18}, (_,i) => generateAlert({
    isNew: false,
    timestamp: Date.now() - (i * 47000 + Math.random() * 30000),
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60)  return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  return `${Math.floor(s/3600)}h ago`;
}

function LiveDot({ color, size=8 }) {
  return (
    <span style={{position:"relative",display:"inline-flex",width:size,height:size,flexShrink:0}}>
      <span style={{position:"absolute",inset:0,borderRadius:"50%",background:color,opacity:.7,animation:"ping-dot 1.4s ease-out infinite"}}/>
      <span style={{position:"relative",width:"100%",height:"100%",borderRadius:"50%",background:color}}/>
    </span>
  );
}

function ConfidenceBar({ value, color }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:".5rem"}}>
      <div style={{flex:1,height:"3px",borderRadius:"99px",background:"rgba(255,255,255,.07)",overflow:"hidden"}}>
        <div style={{width:`${value}%`,height:"100%",borderRadius:"99px",background:`linear-gradient(to right,${color}88,${color})`,transition:"width 1s ease"}}/>
      </div>
      <span style={{fontFamily:"'Orbitron',monospace",fontSize:".36rem",color:`${color}cc`,letterSpacing:".1em",minWidth:"28px"}}>{value}%</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ALERT CARD
// ─────────────────────────────────────────────────────────────────────────────

function AlertCard({ alert, compact=false }) {
  const s   = SEVERITY[alert.severity];
  const age = timeAgo(alert.timestamp);
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      onClick={() => !compact && setExpanded(e => !e)}
      style={{
        position:"relative",
        borderRadius: compact ? "10px" : "12px",
        border:`1px solid ${s.color}${alert.isNew?"66":"28"}`,
        background: alert.isNew
          ? `linear-gradient(135deg,${s.bg},rgba(0,0,0,.55))`
          : "rgba(0,0,0,.45)",
        backdropFilter:"blur(10px)",
        padding: compact ? ".7rem 1rem" : "1.1rem 1.4rem",
        cursor: compact ? "default" : "pointer",
        transition:"all .25s",
        overflow:"hidden",
        animation: alert.isNew ? "alert-enter .4s ease both" : "none",
      }}
      onMouseEnter={e => { if(!compact) e.currentTarget.style.borderColor=`${s.color}55`; e.currentTarget.style.boxShadow=`0 0 28px ${s.glow}`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor=`${s.color}${alert.isNew?"66":"28"}`; e.currentTarget.style.boxShadow="none"; }}
    >
      {/* Severity stripe */}
      <div style={{position:"absolute",left:0,top:0,bottom:0,width:"3px",background:`linear-gradient(to bottom,${s.color},${s.color}44)`,borderRadius:"3px 0 0 3px"}}/>

      {/* Pulse for critical/high */}
      {(alert.severity==="CRITICAL"||alert.severity==="HIGH") && alert.isNew && (
        <div style={{position:"absolute",top:"10px",right:"10px",width:"8px",height:"8px",borderRadius:"50%",background:s.color,boxShadow:`0 0 0 0 ${s.pulse}`,animation:"severity-pulse 2s ease-out infinite"}}/>
      )}

      <div style={{display:"flex",alignItems:"flex-start",gap:".8rem",paddingLeft:".6rem"}}>
        {/* Icon */}
        <div style={{width: compact?"28px":"36px",height:compact?"28px":"36px",borderRadius:"8px",background:`${alert.type.color}12`,border:`1px solid ${alert.type.color}28`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:compact?"1rem":"1.2rem",flexShrink:0}}>
          {alert.type.icon}
        </div>

        {/* Content */}
        <div style={{flex:1,minWidth:0}}>
          {/* Header row */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:".5rem",marginBottom:".35rem",flexWrap:"wrap"}}>
            <div style={{display:"flex",alignItems:"center",gap:".5rem",flexWrap:"wrap"}}>
              <span style={{fontFamily:"'Orbitron',monospace",fontSize: compact?".44rem":".5rem",fontWeight:700,color:alert.type.color,letterSpacing:".12em"}}>{alert.type.label}</span>
              <span style={{padding:".12rem .5rem",borderRadius:"4px",background:`${s.color}14`,border:`1px solid ${s.color}30`,fontFamily:"'Orbitron',monospace",fontSize:".34rem",color:s.color,letterSpacing:".15em"}}>{s.label}</span>
              {alert.isNew && <span style={{padding:".1rem .45rem",borderRadius:"4px",background:"rgba(80,255,160,.12)",border:"1px solid rgba(80,255,160,.3)",fontFamily:"'Orbitron',monospace",fontSize:".3rem",color:"#50ffa0",letterSpacing:".15em"}}>NEW</span>}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:".5rem",flexShrink:0}}>
              <LiveDot color={s.color} size={6}/>
              <span style={{fontFamily:"'Rajdhani',sans-serif",fontSize:".78rem",color:"rgba(255,255,255,.3)",letterSpacing:".05em"}}>{age}</span>
            </div>
          </div>

          {/* Token + chain */}
          <div style={{display:"flex",alignItems:"center",gap:".6rem",marginBottom:".5rem"}}>
            <span style={{fontFamily:"'Orbitron',monospace",fontSize: compact?".6rem":".72rem",fontWeight:700,color:"rgba(255,255,255,.9)",letterSpacing:".08em"}}>${alert.token}</span>
            <span style={{fontFamily:"'Rajdhani',sans-serif",fontSize:".78rem",color:"rgba(255,255,255,.28)"}}>|</span>
            <span style={{fontFamily:"'Rajdhani',sans-serif",fontSize:".8rem",color:"rgba(255,255,255,.38)",letterSpacing:".05em"}}>{alert.chain}</span>
            <span style={{fontFamily:"'Rajdhani',sans-serif",fontSize:".82rem",color:s.color,marginLeft:"auto",fontWeight:600}}>{alert.value}</span>
          </div>

          {/* AI Summary */}
          {!compact && (
            <p style={{fontFamily:"'Rajdhani',sans-serif",fontSize:".88rem",color:"rgba(255,255,255,.52)",letterSpacing:".04em",lineHeight:1.6,marginBottom:".6rem"}}>
              <span style={{color:alert.type.color,fontWeight:600,fontSize:".72rem",letterSpacing:".1em"}}>⊙ AI: </span>
              {alert.summary}
            </p>
          )}

          {/* Confidence */}
          {!compact && (
            <div style={{marginTop:".4rem"}}>
              <span style={{fontFamily:"'Orbitron',monospace",fontSize:".34rem",letterSpacing:".18em",color:"rgba(255,255,255,.25)",display:"block",marginBottom:".3rem"}}>CONFIDENCE</span>
              <ConfidenceBar value={alert.confidence} color={s.color}/>
            </div>
          )}

          {/* Expanded detail */}
          {!compact && expanded && (
            <div style={{marginTop:"1rem",padding:".8rem",borderRadius:"8px",background:"rgba(0,0,0,.4)",border:"1px solid rgba(255,255,255,.06)",animation:"fade-in-up .3s ease"}}>
              <div className="alert-detail-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:".7rem"}}>
                {[
                  {label:"ALERT ID",   val:`#${alert.id}`},
                  {label:"CHAIN",      val:alert.chain},
                  {label:"SEVERITY",   val:alert.severity},
                  {label:"TYPE",       val:alert.type.label},
                  {label:"VALUE",      val:alert.value},
                  {label:"CONFIDENCE", val:`${alert.confidence}%`},
                ].map((f,i) => (
                  <div key={i}>
                    <div style={{fontFamily:"'Orbitron',monospace",fontSize:".3rem",letterSpacing:".18em",color:"rgba(255,255,255,.22)",marginBottom:".2rem"}}>{f.label}</div>
                    <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:".85rem",color:"rgba(255,255,255,.6)",fontWeight:600}}>{f.val}</div>
                  </div>
                ))}
              </div>
              <div style={{marginTop:".8rem",padding:".6rem .8rem",borderRadius:"6px",background:"rgba(0,229,255,.04)",border:"1px solid rgba(0,229,255,.1)"}}>
                <span style={{fontFamily:"'Orbitron',monospace",fontSize:".32rem",letterSpacing:".18em",color:"rgba(0,229,255,.5)"}}>RECOMMENDED ACTION: </span>
                <span style={{fontFamily:"'Rajdhani',sans-serif",fontSize:".85rem",color:"rgba(255,255,255,.5)"}}>
                  {alert.severity==="CRITICAL" ? "Immediate attention required. Review position exposure." :
                   alert.severity==="HIGH"     ? "Monitor closely. Consider risk mitigation." :
                   alert.severity==="MEDIUM"   ? "Watch for follow-up signals before acting." :
                                                 "Low priority. Log and observe."}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STATS BAR
// ─────────────────────────────────────────────────────────────────────────────

function SystemStats({ alerts }) {
  const critical = alerts.filter(a=>a.severity==="CRITICAL").length;
  const high     = alerts.filter(a=>a.severity==="HIGH").length;
  const threat   = critical > 2 ? "CRITICAL" : high > 3 ? "HIGH" : high > 1 ? "ELEVATED" : "MODERATE";
  const tColor   = critical > 2 ? "#ff3535" : high > 3 ? "#ff8c00" : high > 1 ? "#ffd700" : "#50ffa0";

  const stats = [
    { label:"THREAT LEVEL",      val:threat,                         color:tColor,      glow:true },
    { label:"ACTIVE ALERTS",     val:alerts.filter(a=>a.isNew).length, color:"#ffd700",   glow:false },
    { label:"CRITICAL",          val:critical,                       color:"#ff3535",   glow:critical>0 },
    { label:"HIGH",              val:high,                           color:"#ff8c00",   glow:false },
    { label:"WALLETS MONITORED", val:"48,291",                       color:"#00e5ff",   glow:false },
    { label:"SCANS/MIN",         val:"1,847",                        color:"rgba(255,255,255,.5)", glow:false },
  ];

  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:".7rem",marginBottom:"1.5rem"}}>
      {stats.map((s,i) => (
        <div key={i} style={{padding:".8rem 1rem",borderRadius:"10px",border:`1px solid ${s.color}22`,background:"rgba(0,0,0,.5)",backdropFilter:"blur(8px)",position:"relative",overflow:"hidden"}}>
          {s.glow && s.val && (
            <div style={{position:"absolute",inset:0,background:`radial-gradient(circle at 50% 50%,${s.color}08,transparent)`,animation:"stat-glow 3s ease-in-out infinite"}}/>
          )}
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:".32rem",letterSpacing:".2em",color:"rgba(255,255,255,.28)",marginBottom:".4rem"}}>{s.label}</div>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:"clamp(.7rem,2vw,1rem)",fontWeight:900,color:s.color,lineHeight:1,display:"flex",alignItems:"center",gap:".4rem"}}>
            {s.glow && <LiveDot color={s.color} size={6}/>}
            {s.val}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTER BAR
// ─────────────────────────────────────────────────────────────────────────────

function FilterBar({ filters, onChange }) {
  return (
    <div className="filter-bar" style={{display:"flex",flexWrap:"wrap",gap:".5rem",marginBottom:"1.2rem"}}>
      {/* Severity filter */}
      <div style={{display:"flex",gap:".3rem",alignItems:"center"}}>
        <span style={{fontFamily:"'Orbitron',monospace",fontSize:".34rem",letterSpacing:".15em",color:"rgba(255,255,255,.25)",marginRight:".2rem"}}>SEV:</span>
        {["ALL","LOW","MEDIUM","HIGH","CRITICAL"].map(s => (
          <button key={s} onClick={() => onChange({...filters, severity:s})}
            style={{padding:".28rem .65rem",borderRadius:"6px",border:`1px solid ${filters.severity===s ? (SEVERITY[s]?.color||"rgba(255,180,0,.6)") : "rgba(255,255,255,.1)"}`,background: filters.severity===s ? (SEVERITY[s]?.bg||"rgba(255,180,0,.1)") : "rgba(0,0,0,.3)",color: filters.severity===s ? (SEVERITY[s]?.color||"#ffd700") : "rgba(255,255,255,.4)",fontFamily:"'Orbitron',monospace",fontSize:".32rem",letterSpacing:".12em",cursor:"pointer",transition:"all .2s"}}>
            {s}
          </button>
        ))}
      </div>

      {/* Type filter */}
      <div style={{display:"flex",gap:".3rem",alignItems:"center",flexWrap:"wrap"}}>
        <span style={{fontFamily:"'Orbitron',monospace",fontSize:".34rem",letterSpacing:".15em",color:"rgba(255,255,255,.25)",marginRight:".2rem"}}>TYPE:</span>
        {["ALL",...ALERT_TYPES.map(t=>t.id)].map(t => {
          const typeObj = ALERT_TYPES.find(x=>x.id===t);
          const active  = filters.type === t;
          return (
            <button key={t} onClick={() => onChange({...filters, type:t})}
              style={{padding:".28rem .65rem",borderRadius:"6px",border:`1px solid ${active ? (typeObj?.color||"rgba(255,180,0,.6)") : "rgba(255,255,255,.1)"}`,background: active ? `${typeObj?.color||"#ffd700"}12` : "rgba(0,0,0,.3)",color: active ? (typeObj?.color||"#ffd700") : "rgba(255,255,255,.4)",fontFamily:"'Orbitron',monospace",fontSize:".32rem",letterSpacing:".1em",cursor:"pointer",transition:"all .2s"}}>
              {typeObj ? `${typeObj.icon} ${typeObj.id.toUpperCase()}` : "ALL"}
            </button>
          );
        })}
      </div>

      {/* Chain filter */}
      <div style={{display:"flex",gap:".3rem",alignItems:"center"}}>
        <span style={{fontFamily:"'Orbitron',monospace",fontSize:".34rem",letterSpacing:".15em",color:"rgba(255,255,255,.25)",marginRight:".2rem"}}>CHAIN:</span>
        {["ALL",...CHAINS].map(c => (
          <button key={c} onClick={() => onChange({...filters, chain:c})}
            style={{padding:".28rem .65rem",borderRadius:"6px",border:`1px solid ${filters.chain===c ? "rgba(0,229,255,.5)" : "rgba(255,255,255,.1)"}`,background: filters.chain===c ? "rgba(0,229,255,.08)" : "rgba(0,0,0,.3)",color: filters.chain===c ? "rgba(0,229,255,.9)" : "rgba(255,255,255,.4)",fontFamily:"'Orbitron',monospace",fontSize:".32rem",letterSpacing:".1em",cursor:"pointer",transition:"all .2s"}}>
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SMARTALERTS PAGE
// ─────────────────────────────────────────────────────────────────────────────


// ─── SSE CONNECTION ──────────────────────────────────────────
function useAlertStream(onAlert, onInit) {
  useEffect(() => {
    let es = null;
    let reconnectTimer = null;

    function connect() {
      es = new EventSource("/api/alerts/stream");

      es.addEventListener("init", (e) => {
        try {
          const data = JSON.parse(e.data);
          if (onInit) onInit(data.alerts || []);
        } catch(err) {}
      });

      es.addEventListener("alerts", (e) => {
        try {
          const data = JSON.parse(e.data);
          if (onAlert) onAlert(data.alerts || []);
        } catch(err) {}
      });

      es.addEventListener("reconnect", () => {
        es.close();
        reconnectTimer = setTimeout(connect, 2000);
      });

      es.onerror = () => {
        es.close();
        reconnectTimer = setTimeout(connect, 15000); // retry in 15s
      };
    }

    connect();
    return () => {
      if (es) es.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, []);
}

export default function SmartAlerts() {
  const [alerts,   setAlerts]   = useState(() => seedAlerts());
  const [filters,  setFilters]  = useState({ severity:"ALL", type:"ALL", chain:"ALL" });
  const [paused,   setPaused]   = useState(false);
  const [tab,      setTab]      = useState("feed");
  const [connStatus,setConnStatus] = useState("connecting"); // connecting|live|polling|seeded
  const [dataSource,setDataSource] = useState("seeded");
  const intervalRef = useRef(null);
  const sseRef      = useRef(null);

  // Map DB alert to component format
  const mapApiAlert = (a) => ({
    id:         a.id || Math.random().toString(36).slice(2),
    type:       (a.type || "WHALE").toUpperCase(),
    severity:   a.severity || "MEDIUM",
    token:      a.token_symbol || "???",
    chain:      a.chain || "Solana",
    value:      a.value_usd
                  ? `$${a.value_usd >= 1e6 ? (a.value_usd/1e6).toFixed(1)+"M" : (a.value_usd/1000).toFixed(0)+"K"}`
                  : "—",
    confidence: a.confidence || 70,
    summary:    a.ai_summary || "",
    time:       a.created_at
                  ? new Date(a.created_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})
                  : "now",
    ts:         a.created_at ? new Date(a.created_at) : new Date(),
    isNew:      a.created_at ? (Date.now()-new Date(a.created_at).getTime()) < 60000 : false,
  });

  // Connect to /api/alerts/stream (SSE) or fallback to polling
  useEffect(() => {
    let retryT;
    function connectSSE() {
      try {
        const es = new EventSource("/api/alerts/stream");
        sseRef.current = es;
        es.addEventListener("connected", () => setConnStatus("live"));
        es.addEventListener("initial", (e) => {
          const d = JSON.parse(e.data);
          if (d.alerts?.length) {
            setAlerts(d.alerts.map(mapApiAlert));
            setDataSource("live");
            setConnStatus("live");
          }
        });
        es.addEventListener("alerts", (e) => {
          if (paused) return;
          const d = JSON.parse(e.data);
          if (d.alerts?.length) {
            setAlerts(prev => {
              const ids = new Set(prev.map(a=>a.id));
              return [...d.alerts.map(mapApiAlert).filter(a=>!ids.has(a.id)), ...prev].slice(0,100);
            });
          }
        });
        es.onerror = () => {
          setConnStatus("reconnecting");
          es.close();
          retryT = setTimeout(connectSSE, 6000);
        };
      } catch(_) {
        pollAlerts();
      }
    }
    async function pollAlerts() {
      setConnStatus("polling");
      try {
        const r = await fetch("/api/alerts/recent?limit=30");
        const d = await r.json();
        if (d.alerts?.length) {
          setAlerts(d.alerts.map(mapApiAlert));
          setDataSource("live");
        }
      } catch(_) {
        setDataSource("seeded");
        setConnStatus("seeded");
      }
    }
    if (typeof EventSource !== "undefined") connectSSE();
    else pollAlerts();
    return () => { if(sseRef.current) sseRef.current.close(); clearTimeout(retryT); };
  }, []);

  // Live feed — new alert every 8–16s
  useEffect(() => {
    if (paused) return;
    const tick = () => {
      setAlerts(prev => {
        const next = [generateAlert(), ...prev.slice(0,49)];
        return next;
      });
    };
    const delay = 8000 + Math.random() * 8000;
    intervalRef.current = setTimeout(tick, delay);
    return () => clearTimeout(intervalRef.current);
  }, [alerts, paused]);

  // Mark alerts as old after 12s
  useEffect(() => {
    const id = setInterval(() => {
      setAlerts(prev => prev.map(a => ({
        ...a,
        isNew: a.isNew && (Date.now() - a.timestamp < 12000),
      })));
    }, 3000);
    return () => clearInterval(id);
  }, []);

  // Filtered alerts
  const filtered = useMemo(() => alerts.filter(a => {
    if (filters.severity !== "ALL" && a.severity !== filters.severity) return false;
    if (filters.type     !== "ALL" && a.type.id  !== filters.type)     return false;
    if (filters.chain    !== "ALL" && a.chain     !== filters.chain)    return false;
    return true;
  }), [alerts, filters]);

  return (
    <div style={{minHeight:"100vh",background:"#050403",color:"#fff",fontFamily:"'Orbitron',monospace",position:"relative",overflowX:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-track{background:#050403;} ::-webkit-scrollbar-thumb{background:rgba(255,180,0,.4);}
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
      @keyframes ping-dot{0%{transform:scale(1);opacity:.7;}100%{transform:scale(2.5);opacity:0;}}
        @keyframes severity-pulse{0%{box-shadow:0 0 0 0 currentColor;}70%{box-shadow:0 0 0 8px transparent;}100%{box-shadow:0 0 0 0 transparent;}}
        @keyframes alert-enter{from{opacity:0;transform:translateX(-12px);}to{opacity:1;transform:translateX(0);}}
        @keyframes fade-in-up{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
        @keyframes stat-glow{0%,100%{opacity:.6;}50%{opacity:1;}}
        @keyframes scan-line{0%{top:-4px;}100%{top:100%;}}
        @keyframes grid-pulse{0%,100%{opacity:.018;}50%{opacity:.032;}}
        @keyframes header-glow{0%,100%{box-shadow:0 4px 40px rgba(255,140,0,.12);}50%{box-shadow:0 4px 60px rgba(255,140,0,.22);}}
        @keyframes blink{0%,100%{opacity:1;}50%{opacity:.3;}}
        .tab-btn{padding:.55rem 1.2rem;border-radius:8px;border:1px solid rgba(255,255,255,.1);background:rgba(0,0,0,.3);color:rgba(255,255,255,.4);font-family:'Orbitron',monospace;font-size:.38rem;letter-spacing:.18em;cursor:pointer;transition:all .2s;}
        .tab-btn.active{border-color:rgba(255,180,0,.45);background:rgba(255,180,0,.08);color:rgba(255,215,0,.9);}
        .tab-btn:hover:not(.active){border-color:rgba(255,255,255,.2);color:rgba(255,255,255,.6);}
        @media(max-width:768px){
          .stats-grid{grid-template-columns:1fr 1fr!important;}
          .alerts-layout{flex-direction:column!important;}
          .alerts-sidebar{width:100%!important;display:grid!important;grid-template-columns:1fr 1fr!important;gap:.8rem!important;}
          .sidebar-tg{grid-column:1/-1!important;}
          .filter-bar{gap:.3rem!important;}
          .filter-bar button{font-size:.28rem!important;padding:.22rem .5rem!important;}
          .tab-btn{font-size:.32rem!important;padding:.45rem .8rem!important;}
          .nav-links-desktop{display:none!important;}
          .mobile-nav-btns{display:flex!important;}
          .alert-detail-grid{grid-template-columns:1fr 1fr!important;}
          .alert-header-inner{flex-direction:column!important;align-items:flex-start!important;gap:.8rem!important;}
        }
        @media(max-width:480px){
          .alerts-sidebar{grid-template-columns:1fr!important;}
          .tab-btn{font-size:.28rem!important;padding:.38rem .6rem!important;}
        }
      `}</style>

      {/* Background grid */}
      <div style={{position:"absolute",inset:0,zIndex:0,pointerEvents:"none",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(255,140,0,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,140,0,.018) 1px,transparent 1px)",backgroundSize:"60px 60px",animation:"grid-pulse 8s ease-in-out infinite"}}/>
        <div style={{position:"absolute",top:"15%",left:"-15%",width:"600px",height:"600px",borderRadius:"50%",background:"radial-gradient(circle,rgba(255,80,0,.06),transparent 65%)"}}/>
        <div style={{position:"absolute",bottom:"10%",right:"-10%",width:"500px",height:"500px",borderRadius:"50%",background:"radial-gradient(circle,rgba(0,100,200,.05),transparent 65%)"}}/>
      </div>

      <div style={{position:"relative",zIndex:10,maxWidth:"1300px",margin:"0 auto",padding:"clamp(1.5rem,4vw,2.5rem) clamp(1rem,4vw,2rem)"}}>

        {/* ── TOP NAV ── */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"2rem",flexWrap:"wrap",gap:"1rem"}}>
          <a href="/" style={{textDecoration:"none",display:"flex",alignItems:"center",gap:".7rem"}}>
            <div style={{width:"30px",height:"30px",borderRadius:"50%",background:"radial-gradient(circle,#ffd700,#ff8c00)",boxShadow:"0 0 18px rgba(255,150,0,.5)"}}/>
            <span style={{fontFamily:"'Orbitron',monospace",fontSize:".56rem",letterSpacing:".22em",color:"rgba(255,215,0,.9)"}}>SOLAR FLASH</span>
          </a>

          <div className="nav-links-desktop" style={{display:"flex",alignItems:"center",gap:".6rem",flexWrap:"wrap"}}>
            {[
              {label:"HOME", href:"/"},
              {label:"DASHBOARD", href:"/dashboard"},
              {label:"SCANNER", href:"/report"},
              {label:"LITEPAPER", href:"/litepaper"},
            ].map(l => (
              <a key={l.label} href={l.href} style={{textDecoration:"none"}}>
                <button style={{padding:".4rem .9rem",borderRadius:"6px",border:"1px solid rgba(255,255,255,.1)",background:"rgba(0,0,0,.3)",color:"rgba(255,255,255,.45)",fontFamily:"'Orbitron',monospace",fontSize:".34rem",letterSpacing:".18em",cursor:"pointer",transition:"all .2s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,180,0,.4)";e.currentTarget.style.color="rgba(255,215,0,.8)";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,.1)";e.currentTarget.style.color="rgba(255,255,255,.45)";}}>
                  {l.label}
                </button>
              </a>
            ))}
          </div>
        </div>

        {/* ── HEADER ── */}
        <div style={{padding:"1.5rem 2rem",borderRadius:"16px",border:"1px solid rgba(255,140,0,.2)",background:"linear-gradient(135deg,rgba(255,80,0,.06),rgba(0,0,0,.5))",backdropFilter:"blur(12px)",marginBottom:"1.5rem",position:"relative",overflow:"hidden",animation:"header-glow 5s ease-in-out infinite"}}>
          {/* Scan line */}
          <div style={{position:"absolute",left:0,right:0,height:"1px",background:"linear-gradient(to right,transparent,rgba(255,140,0,.3),transparent)",animation:"scan-line 4s linear infinite",zIndex:1}}/>
          <div className="alert-header-inner" style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"1rem",position:"relative",zIndex:2}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:".8rem",marginBottom:".6rem"}}>
                <LiveDot color="#50ffa0" size={8}/>
                <span style={{fontFamily:"'Orbitron',monospace",fontSize:".38rem",letterSpacing:".3em",color:"rgba(80,255,160,.7)"}}>SYSTEM ONLINE — LIVE INTELLIGENCE</span>
              </div>
              <h1 style={{fontFamily:"'Orbitron',monospace",fontSize:"clamp(1.4rem,4vw,2.2rem)",fontWeight:900,background:"linear-gradient(135deg,#fff,#ffd700,#ff8c00)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",letterSpacing:".08em",lineHeight:1.1}}>
                SMART ALERTS
              </h1>
              <p style={{fontFamily:"'Rajdhani',sans-serif",fontSize:".95rem",color:"rgba(255,255,255,.38)",letterSpacing:".1em",marginTop:".4rem"}}>
                Real-time crypto intelligence monitoring infrastructure
              </p>
            </div>
            <div style={{display:"flex",gap:".6rem",alignItems:"center"}}>
              <button onClick={() => setPaused(p => !p)}
                style={{padding:".55rem 1.2rem",borderRadius:"8px",border:`1px solid ${paused?"rgba(255,53,53,.5)":"rgba(80,255,160,.4)"}`,background:paused?"rgba(255,53,53,.08)":"rgba(80,255,160,.06)",color:paused?"#ff5050":"#50ffa0",fontFamily:"'Orbitron',monospace",fontSize:".38rem",letterSpacing:".18em",cursor:"pointer",transition:"all .2s"}}>
                {paused ? "▶ RESUME" : "⏸ PAUSE"} FEED
              </button>
              <a href="/dashboard" style={{textDecoration:"none"}}>
                <button style={{padding:".55rem 1.2rem",borderRadius:"8px",border:"1px solid rgba(0,229,255,.35)",background:"rgba(0,229,255,.06)",color:"rgba(0,229,255,.8)",fontFamily:"'Orbitron',monospace",fontSize:".38rem",letterSpacing:".18em",cursor:"pointer",transition:"all .2s"}}>
                  ⊙ DASHBOARD
                </button>
              </a>
            </div>
          </div>
        </div>

        {/* ── SYSTEM STATS ── */}
        <SystemStats alerts={alerts}/>

        {/* ── TABS ── */}
        <div style={{display:"flex",gap:".5rem",marginBottom:"1.2rem",flexWrap:"wrap"}}>
          {[
            {id:"feed",      label:"LIVE FEED",        badge: alerts.filter(a=>a.isNew).length},
            {id:"critical",  label:"CRITICAL",         badge: alerts.filter(a=>a.severity==="CRITICAL").length},
            {id:"whale",     label:"WHALE ACTIVITY",   badge: alerts.filter(a=>a.type.id==="whale").length},
            {id:"risk",      label:"RISK SIGNALS",     badge: alerts.filter(a=>a.type.id==="risk").length},
            {id:"smart",     label:"SMART MONEY",      badge: alerts.filter(a=>a.type.id==="smart").length},
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`tab-btn${tab===t.id?" active":""}`}>
              {t.label}
              {t.badge > 0 && (
                <span style={{marginLeft:".4rem",padding:".1rem .45rem",borderRadius:"999px",background:tab===t.id?"rgba(255,215,0,.25)":"rgba(255,255,255,.1)",color:tab===t.id?"#ffd700":"rgba(255,255,255,.5)",fontSize:".3rem"}}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── FILTERS ── */}
        <FilterBar filters={filters} onChange={setFilters}/>

        {/* ── ALERT FEED ── */}
        <div className="alerts-layout" style={{display:"flex",gap:"1.2rem",alignItems:"flex-start"}}>

          {/* Main feed */}
          <div style={{flex:1,display:"flex",flexDirection:"column",gap:".7rem"}}>
            {(() => {
              let displayAlerts = filtered;
              if (tab === "critical") displayAlerts = filtered.filter(a => a.severity === "CRITICAL");
              if (tab === "whale")    displayAlerts = filtered.filter(a => a.type.id === "whale");
              if (tab === "risk")     displayAlerts = filtered.filter(a => a.type.id === "risk");
              if (tab === "smart")    displayAlerts = filtered.filter(a => a.type.id === "smart");

              if (!displayAlerts.length) return (
                <div style={{textAlign:"center",padding:"3rem",border:"1px solid rgba(255,255,255,.06)",borderRadius:"12px",background:"rgba(0,0,0,.3)"}}>
                  <div style={{fontSize:"2rem",marginBottom:".8rem",opacity:.3}}>⊙</div>
                  <p style={{fontFamily:"'Rajdhani',sans-serif",color:"rgba(255,255,255,.3)",letterSpacing:".1em"}}>No alerts match current filters</p>
                </div>
              );

              return displayAlerts.map(alert => (
                <AlertCard key={alert.id} alert={alert}/>
              ));
            })()}
          </div>

          {/* Sidebar — notification types + Telegram CTA */}
          <div className="alerts-sidebar" style={{width:"260px",flexShrink:0,display:"flex",flexDirection:"column",gap:"1rem"}}>

            {/* Alert type breakdown */}
            <div style={{padding:"1.2rem",borderRadius:"12px",border:"1px solid rgba(255,180,0,.14)",background:"rgba(0,0,0,.5)",backdropFilter:"blur(8px)"}}>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:".36rem",letterSpacing:".25em",color:"rgba(255,180,0,.5)",marginBottom:"1rem"}}>ALERT TYPES</div>
              {ALERT_TYPES.map(t => {
                const count = alerts.filter(a => a.type.id === t.id).length;
                const pct   = Math.round(count / alerts.length * 100);
                return (
                  <div key={t.id} style={{marginBottom:".7rem"}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:".25rem"}}>
                      <span style={{fontFamily:"'Orbitron',monospace",fontSize:".33rem",letterSpacing:".12em",color:t.color}}>{t.icon} {t.id.toUpperCase()}</span>
                      <span style={{fontFamily:"'Rajdhani',sans-serif",fontSize:".8rem",color:"rgba(255,255,255,.4)"}}>{count}</span>
                    </div>
                    <div style={{height:"2px",borderRadius:"99px",background:"rgba(255,255,255,.06)",overflow:"hidden"}}>
                      <div style={{width:`${pct}%`,height:"100%",background:`linear-gradient(to right,${t.color}66,${t.color})`,borderRadius:"99px"}}/>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Severity breakdown */}
            <div style={{padding:"1.2rem",borderRadius:"12px",border:"1px solid rgba(255,180,0,.14)",background:"rgba(0,0,0,.5)",backdropFilter:"blur(8px)"}}>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:".36rem",letterSpacing:".25em",color:"rgba(255,180,0,.5)",marginBottom:"1rem"}}>SEVERITY MIX</div>
              {Object.entries(SEVERITY).map(([k,v]) => {
                const count = alerts.filter(a => a.severity === k).length;
                return (
                  <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:".55rem",padding:".4rem .6rem",borderRadius:"6px",background:`${v.color}08`,border:`1px solid ${v.color}18`}}>
                    <div style={{display:"flex",alignItems:"center",gap:".4rem"}}>
                      <LiveDot color={v.color} size={5}/>
                      <span style={{fontFamily:"'Orbitron',monospace",fontSize:".33rem",letterSpacing:".14em",color:v.color}}>{k}</span>
                    </div>
                    <span style={{fontFamily:"'Orbitron',monospace",fontSize:".55rem",fontWeight:700,color:v.color}}>{count}</span>
                  </div>
                );
              })}
            </div>

            {/* Telegram CTA */}
            <div className="sidebar-tg" style={{padding:"1.2rem",borderRadius:"12px",border:"1px solid rgba(255,140,0,.2)",background:"linear-gradient(135deg,rgba(255,80,0,.07),rgba(0,0,0,.5))",backdropFilter:"blur(8px)",textAlign:"center"}}>
              <div style={{fontSize:"1.8rem",marginBottom:".6rem"}}>⚡</div>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:".44rem",fontWeight:700,color:"rgba(255,215,0,.9)",letterSpacing:".12em",marginBottom:".5rem"}}>INSTANT ALERTS</div>
              <p style={{fontFamily:"'Rajdhani',sans-serif",fontSize:".82rem",color:"rgba(255,255,255,.4)",lineHeight:1.6,marginBottom:"1rem"}}>
                Get critical alerts delivered directly to Telegram in real time.
              </p>
              <a href="https://t.me/SolarFlashbot" target="_blank" rel="noopener noreferrer" style={{textDecoration:"none"}}>
                <button style={{width:"100%",padding:".65rem 1rem",borderRadius:"8px",border:"1px solid rgba(255,180,0,.4)",background:"linear-gradient(135deg,rgba(255,180,0,.15),rgba(255,80,0,.08))",color:"rgba(255,215,0,.9)",fontFamily:"'Orbitron',monospace",fontSize:".38rem",letterSpacing:".18em",cursor:"pointer",transition:"all .3s",fontWeight:700}}
                  onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 0 30px rgba(255,180,0,.25)";}}
                  onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";}}>
                  ⚡ CONNECT BOT
                </button>
              </a>
            </div>

            {/* Notification channels */}
            <div style={{padding:"1.2rem",borderRadius:"12px",border:"1px solid rgba(255,255,255,.08)",background:"rgba(0,0,0,.4)",backdropFilter:"blur(8px)"}}>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:".36rem",letterSpacing:".25em",color:"rgba(255,255,255,.25)",marginBottom:".8rem"}}>NOTIFICATION CHANNELS</div>
              {[
                {label:"Telegram Bot", status:"ACTIVE",  color:"#50ffa0"},
                {label:"Browser Push", status:"SOON",    color:"#ffd700"},
                {label:"Mobile App",   status:"PLANNED", color:"rgba(255,255,255,.3)"},
                {label:"API Webhooks", status:"PLANNED", color:"rgba(255,255,255,.3)"},
              ].map((n,i) => (
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:".5rem"}}>
                  <span style={{fontFamily:"'Rajdhani',sans-serif",fontSize:".85rem",color:"rgba(255,255,255,.5)"}}>{n.label}</span>
                  <span style={{padding:".1rem .45rem",borderRadius:"4px",background:`${n.color}14`,border:`1px solid ${n.color}28`,fontFamily:"'Orbitron',monospace",fontSize:".3rem",color:n.color,letterSpacing:".12em"}}>{n.status}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Footer */}
        <div style={{marginTop:"2rem",paddingTop:"1.5rem",borderTop:"1px solid rgba(255,255,255,.06)",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"1rem"}}>
          <span style={{fontFamily:"'Rajdhani',sans-serif",fontSize:".78rem",color:"rgba(255,255,255,.2)",letterSpacing:".08em"}}>
            Solar Flash Intelligence — Smart Alerts v1.0 — Data is simulated for demonstration
          </span>
          <div style={{display:"flex",gap:".5rem"}}>
            <LiveDot color="#50ffa0" size={6}/>
            <span style={{fontFamily:"'Orbitron',monospace",fontSize:".34rem",letterSpacing:".2em",color:"rgba(80,255,160,.6)"}}>FEED ACTIVE</span>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MINI ALERTS FEED — embed in main site homepage
// ─────────────────────────────────────────────────────────────────────────────

export function AlertsFeedMini() {
  const [alerts, setAlerts] = useState(() => seedAlerts().slice(0,6));

  useEffect(() => {
    const id = setInterval(() => {
      setAlerts(prev => [generateAlert(), ...prev.slice(0,5)]);
    }, 7000 + Math.random()*5000);
    return () => clearInterval(id);
  }, []);

  return (
    <section style={{position:"relative",zIndex:10,padding:"clamp(4rem,10vw,7rem) clamp(1rem,5vw,3rem)"}}>
      <div style={{maxWidth:"1100px",margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:"clamp(2rem,5vw,3rem)",flexWrap:"wrap",gap:"1rem"}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:".6rem",marginBottom:".8rem"}}>
              <LiveDot color="#50ffa0" size={7}/>
              <span style={{fontFamily:"'Orbitron',monospace",fontSize:".38rem",letterSpacing:".3em",color:"rgba(80,255,160,.7)"}}>LIVE INTELLIGENCE FEED</span>
            </div>
            <h2 style={{fontFamily:"'Orbitron',monospace",fontSize:"clamp(1.4rem,4vw,2.4rem)",fontWeight:900,letterSpacing:".1em",background:"linear-gradient(135deg,#fff,#ffd700,#ff8c00)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
              SMART ALERTS
            </h2>
          </div>
          <a href="/alerts" style={{textDecoration:"none"}}>
            <button style={{padding:".6rem 1.4rem",borderRadius:"8px",border:"1px solid rgba(255,180,0,.35)",background:"rgba(255,180,0,.06)",color:"rgba(255,215,0,.8)",fontFamily:"'Orbitron',monospace",fontSize:".4rem",letterSpacing:".2em",cursor:"pointer",transition:"all .3s"}}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 0 24px rgba(255,180,0,.2)";e.currentTarget.style.borderColor="rgba(255,180,0,.65)";}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";e.currentTarget.style.borderColor="rgba(255,180,0,.35)";}}>
              VIEW ALL ALERTS →
            </button>
          </a>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:".6rem"}}>
          {alerts.map(a => <AlertCard key={a.id} alert={a} compact={true}/>)}
        </div>
      </div>
    </section>
  );
}
