/**
 * AppHub.jsx — Solar Flash App Hub
 * Entry point for all 3 core products
 * Route: /app
 */
import { useState } from "react";

const T = {
  gold:   "#ffd700", orange: "#ff8c00", cyan: "#00e5ff",
  ok:     "#50ffa0", purple: "#b060ff", danger:"#ff3535",
  black:  "#050403",
  font:   "'Orbitron', monospace", body: "'Rajdhani', sans-serif",
};

const PRODUCTS = [
  {
    id:      "wallet",
    num:     "01",
    icon:    "⊙",
    name:    "WALLET INTELLIGENCE",
    tagline: "Know your portfolio. Know your risk.",
    color:   T.cyan,
    href:    "/dashboard",
    status:  "LIVE",
    desc:    "Connect your Solana wallet for a complete portfolio intelligence report. Holdings breakdown, risk exposure, smart money correlation, and wallet health scoring.",
    features:[
      "Full portfolio visualization",
      "Real-time token prices",
      "Risk exposure analysis",
      "Holdings breakdown",
      "Frequency Score per token",
    ],
    input:   "Wallet Address",
    cta:     "LAUNCH WALLET INTEL →",
  },
  {
    id:      "market",
    num:     "02",
    icon:    "⚡",
    name:    "MARKET INTELLIGENCE",
    tagline: "The living pulse of the market.",
    color:   T.gold,
    href:    "/alerts",
    status:  "LIVE",
    desc:    "Real-time market monitoring across Solana. Whale activity, smart money signals, liquidity events, and risk alerts — before the market moves.",
    features:[
      "Live whale activity alerts",
      "Smart money signals",
      "Liquidity event detection",
      "Risk & rug alerts",
      "Narrative shift detection",
    ],
    input:   "No input required",
    cta:     "LAUNCH MARKET INTEL →",
  },
  {
    id:      "token",
    num:     "03",
    icon:    "🎯",
    name:    "TOKEN INTELLIGENCE",
    tagline: "Complete token analysis. One engine.",
    color:   T.ok,
    href:    "/token",
    status:  "LIVE",
    desc:    "Paste any Solana token address for a full intelligence report — Survival Score, Threat Radar, liquidity analysis, holder intelligence, and an AI-generated risk summary.",
    features:[
      "Survival Score (0-100)",
      "Multi-vector Threat Radar",
      "Holder & whale analysis",
      "Liquidity intelligence",
      "AI Risk Interpretation",
    ],
    input:   "Token Address",
    cta:     "LAUNCH TOKEN INTEL →",
  },
];

function ProductCard({ product, expanded, onToggle }) {
  const { color, status } = product;
  return (
    <div
      onClick={() => onToggle(product.id)}
      style={{
        borderRadius:"16px",
        border:`1px solid ${expanded ? color+"45" : color+"1e"}`,
        background: expanded ? `${color}08` : "rgba(0,0,0,.5)",
        backdropFilter:"blur(14px)",
        cursor:"pointer",
        transition:"all .3s",
        position:"relative",
        overflow:"hidden",
        boxShadow: expanded ? `0 0 40px ${color}14` : "none",
      }}
      onMouseEnter={e => { if(!expanded){ e.currentTarget.style.borderColor=`${color}38`; e.currentTarget.style.boxShadow=`0 0 28px ${color}10`; }}}
      onMouseLeave={e => { if(!expanded){ e.currentTarget.style.borderColor=`${color}1e`; e.currentTarget.style.boxShadow="none"; }}}
    >
      {/* Top line */}
      <div style={{position:"absolute",top:0,left:"10%",right:"10%",height:"1px",background:`linear-gradient(to right,transparent,${color}${expanded?"55":"28"},transparent)`,transition:"opacity .3s"}}/>

      {/* Header */}
      <div style={{padding:"1.5rem 1.8rem",display:"flex",alignItems:"flex-start",gap:"1.2rem",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:"1.2rem",flex:1}}>
          {/* Number + icon */}
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:".4rem",flexShrink:0}}>
            <div style={{fontFamily:T.font,fontSize:"2rem",fontWeight:900,color:`${color}28`,lineHeight:1}}>{product.num}</div>
            <div style={{fontSize:"1.6rem",filter:`drop-shadow(0 0 10px ${color}55)`}}>{product.icon}</div>
          </div>

          <div style={{flex:1,minWidth:0}}>
            {/* Status */}
            <div style={{display:"flex",alignItems:"center",gap:".5rem",marginBottom:".5rem"}}>
              <span style={{width:"6px",height:"6px",borderRadius:"50%",background:color,boxShadow:`0 0 8px ${color}`,display:"inline-block",animation:"ap-blink 1.4s infinite"}}/>
              <span style={{fontFamily:T.font,fontSize:".32rem",letterSpacing:".22em",color:`${color}aa`}}>{status}</span>
            </div>
            <div style={{fontFamily:T.font,fontSize:"clamp(.72rem,2.5vw,1rem)",fontWeight:900,color: expanded?"#fff":color,letterSpacing:".1em",marginBottom:".4rem",transition:"color .2s"}}>{product.name}</div>
            <div style={{fontFamily:T.body,fontSize:".95rem",color:"rgba(255,255,255,.42)",letterSpacing:".06em"}}>{product.tagline}</div>
          </div>
        </div>

        {/* Expand indicator */}
        <span style={{fontFamily:T.font,fontSize:".4rem",color:`${color}66`,flexShrink:0,marginTop:".4rem",transition:"transform .3s",display:"inline-block",transform:expanded?"rotate(180deg)":"rotate(0)"}}>▼</span>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{padding:"0 1.8rem 1.8rem",animation:"ap-fade .3s ease"}}>
          <div style={{height:"1px",background:`linear-gradient(to right,transparent,${color}28,transparent)`,marginBottom:"1.2rem"}}/>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.2rem",marginBottom:"1.4rem"}}>
            {/* Description */}
            <div>
              <p style={{fontFamily:T.body,fontSize:".95rem",color:"rgba(255,255,255,.52)",lineHeight:1.75,letterSpacing:".04em"}}>{product.desc}</p>
              <div style={{marginTop:"1rem",padding:".55rem .9rem",borderRadius:"8px",border:`1px solid ${color}22`,background:`${color}07`,display:"inline-flex",alignItems:"center",gap:".5rem"}}>
                <span style={{fontFamily:T.font,fontSize:".32rem",letterSpacing:".18em",color:`${color}88`}}>INPUT</span>
                <span style={{fontFamily:T.body,fontSize:".88rem",color:color}}>{product.input}</span>
              </div>
            </div>

            {/* Features */}
            <div>
              <div style={{fontFamily:T.font,fontSize:".34rem",letterSpacing:".24em",color:"rgba(255,255,255,.3)",marginBottom:".7rem"}}>CAPABILITIES</div>
              <div style={{display:"flex",flexDirection:"column",gap:".45rem"}}>
                {product.features.map((f,i) => (
                  <div key={i} style={{display:"flex",alignItems:"center",gap:".55rem"}}>
                    <span style={{width:"5px",height:"5px",borderRadius:"50%",background:color,flexShrink:0,boxShadow:`0 0 6px ${color}`}}/>
                    <span style={{fontFamily:T.body,fontSize:".9rem",color:"rgba(255,255,255,.55)"}}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <a href={product.href} style={{textDecoration:"none"}}>
            <button style={{
              width:"100%",padding:".85rem",borderRadius:"10px",
              border:`1.5px solid ${color}55`,
              background:`linear-gradient(135deg,${color}18,${color}08)`,
              color,fontFamily:T.font,fontSize:".52rem",letterSpacing:".2em",
              cursor:"pointer",transition:"all .3s",fontWeight:700,
              position:"relative",overflow:"hidden",
            }}
              onClick={e => e.stopPropagation()}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow=`0 0 36px ${color}28`;e.currentTarget.style.borderColor=color;}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";e.currentTarget.style.borderColor=`${color}55`;}}>
              {product.cta}
            </button>
          </a>
        </div>
      )}
    </div>
  );
}

export default function AppHub() {
  const [expanded, setExpanded] = useState("wallet");

  const toggle = (id) => setExpanded(prev => prev === id ? null : id);

  return (
    <div style={{minHeight:"100vh",background:T.black,color:"#fff",fontFamily:T.font,position:"relative",overflowX:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-track{background:#050403;} ::-webkit-scrollbar-thumb{background:#ffd70055;}
        @keyframes ap-blink  {0%,100%{opacity:1;}50%{opacity:.2;}}
        @keyframes ap-fade   {from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
        @keyframes ap-spin   {to{transform:rotate(360deg);}}
        @keyframes ap-spin-r {to{transform:rotate(-360deg);}}
        @keyframes ap-pulse  {0%,100%{opacity:.6;}50%{opacity:1;}}
        @keyframes ap-grid   {0%,100%{opacity:.015;}50%{opacity:.028;}}
        @keyframes ap-float  {0%,100%{transform:translateY(0);}50%{transform:translateY(-18px);}}
      `}</style>

      {/* Background */}
      <div style={{position:"absolute",inset:0,zIndex:0,pointerEvents:"none",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(255,180,0,.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,180,0,.015) 1px,transparent 1px)",backgroundSize:"65px 65px",animation:"ap-grid 10s ease-in-out infinite"}}/>
        <div style={{position:"absolute",top:"5%",right:"-8%",width:"600px",height:"600px",borderRadius:"50%",background:"radial-gradient(circle,rgba(0,229,255,.045),transparent 65%)"}}/>
        <div style={{position:"absolute",bottom:"5%",left:"-8%",width:"500px",height:"500px",borderRadius:"50%",background:"radial-gradient(circle,rgba(255,180,0,.04),transparent 65%)"}}/>
        <div style={{position:"absolute",top:"40%",right:"20%",width:"300px",height:"300px",borderRadius:"50%",background:"radial-gradient(circle,rgba(80,255,160,.03),transparent 65%)"}}/>
      </div>

      <div style={{position:"relative",zIndex:10,maxWidth:"900px",margin:"0 auto",padding:"clamp(2rem,5vw,4rem) clamp(1rem,4vw,2rem)"}}>

        {/* ── NAVBAR ── */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"clamp(2.5rem,6vw,4rem)",flexWrap:"wrap",gap:"1rem"}}>
          <a href="/" style={{textDecoration:"none",display:"flex",alignItems:"center",gap:".7rem"}}>
            <div style={{position:"relative",width:"32px",height:"32px"}}>
              <div style={{position:"absolute",inset:"-6px",borderRadius:"50%",border:"1px dashed rgba(255,180,0,.2)",animation:"ap-spin 20s linear infinite"}}/>
              <div style={{width:"100%",height:"100%",borderRadius:"50%",background:"radial-gradient(circle at 38% 35%,#fffde7,#ffd700 28%,#ff8c00 60%,#cc2200)",boxShadow:"0 0 18px rgba(255,150,0,.55)"}}/>
            </div>
            <span style={{fontFamily:T.font,fontSize:".58rem",letterSpacing:".22em",color:"rgba(255,215,0,.9)"}}>SOLAR FLASH</span>
          </a>
          <div style={{display:"flex",gap:".5rem",flexWrap:"wrap"}}>
            {[{l:"HOME",href:"/"},{l:"ECOSYSTEM",href:"/ecosystem"},{l:"LITEPAPER",href:"/litepaper"}].map(b=>(
              <a key={b.l} href={b.href} style={{textDecoration:"none"}}>
                <button style={{padding:".38rem .9rem",borderRadius:"6px",border:"1px solid rgba(255,255,255,.1)",background:"rgba(0,0,0,.35)",color:"rgba(255,255,255,.45)",fontFamily:T.font,fontSize:".38rem",letterSpacing:".16em",cursor:"pointer",transition:"all .2s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,180,0,.4)";e.currentTarget.style.color="rgba(255,215,0,.8)";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,.1)";e.currentTarget.style.color="rgba(255,255,255,.45)";}}>
                  {b.l}
                </button>
              </a>
            ))}
          </div>
        </div>

        {/* ── HEADER ── */}
        <div style={{textAlign:"center",marginBottom:"clamp(2.5rem,6vw,4rem)"}}>
          {/* Solar core mark */}
          <div style={{position:"relative",width:"80px",height:"80px",margin:"0 auto clamp(1.5rem,4vw,2.5rem)"}}>
            <div style={{position:"absolute",inset:"-16px",borderRadius:"50%",border:"1px dashed rgba(255,180,0,.12)",animation:"ap-spin 25s linear infinite"}}/>
            <div style={{position:"absolute",inset:"-8px",borderRadius:"50%",border:"1px dashed rgba(255,180,0,.08)",animation:"ap-spin-r 18s linear infinite"}}/>
            <div style={{position:"absolute",inset:0,borderRadius:"50%",boxShadow:"0 0 40px rgba(255,150,0,.3)",animation:"ap-pulse 4s ease-in-out infinite"}}/>
            <div style={{width:"100%",height:"100%",borderRadius:"50%",background:"radial-gradient(circle at 38% 35%,#fffde7,#ffd700 28%,#ff8c00 60%,#cc2200)",boxShadow:"0 0 28px rgba(255,150,0,.6)"}}/>
          </div>

          <div style={{fontFamily:T.font,fontSize:".44rem",letterSpacing:".45em",color:"rgba(255,180,0,.45)",marginBottom:"1rem"}}>SOLAR FLASH ECOSYSTEM</div>
          <h1 style={{fontFamily:T.font,fontSize:"clamp(1.8rem,5vw,3rem)",fontWeight:900,background:"linear-gradient(135deg,#fff 0%,#ffd700 45%,#ff8c00 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",letterSpacing:".08em",lineHeight:1.1,marginBottom:"1rem"}}>
            APP HUB
          </h1>
          <p style={{fontFamily:T.body,fontSize:"clamp(.9rem,2vw,1.1rem)",color:"rgba(255,255,255,.42)",letterSpacing:".1em",maxWidth:"520px",margin:"0 auto",lineHeight:1.75}}>
            Three intelligence products. One ecosystem.<br/>Select your intelligence module.
          </p>
        </div>

        {/* ── PRODUCT SELECTOR ── */}
        <div style={{display:"flex",flexDirection:"column",gap:"1rem",marginBottom:"2.5rem"}}>
          {PRODUCTS.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              expanded={expanded === p.id}
              onToggle={toggle}
            />
          ))}
        </div>

        {/* ── FOOTER LINKS ── */}
        <div style={{display:"flex",justifyContent:"center",gap:"1.5rem",flexWrap:"wrap",paddingTop:"1.5rem",borderTop:"1px solid rgba(255,255,255,.06)"}}>
          {[
            {l:"PULSE TIMELINE", href:"/pulse",     color:T.gold},
            {l:"THREAT RADAR",  href:"/threat",    color:T.orange},
            {l:"ECOSYSTEM",     href:"/ecosystem", color:T.cyan},
            {l:"LITEPAPER",     href:"/litepaper", color:"rgba(255,255,255,.4)"},
          ].map((b,i) => (
            <a key={i} href={b.href} style={{textDecoration:"none"}}>
              <span style={{fontFamily:T.font,fontSize:".38rem",letterSpacing:".18em",color:b.color,opacity:.7,cursor:"pointer",transition:"opacity .2s"}}
                onMouseEnter={e=>{e.currentTarget.style.opacity="1";}}
                onMouseLeave={e=>{e.currentTarget.style.opacity=".7";}}>
                {b.l}
              </span>
            </a>
          ))}
        </div>

        <div style={{textAlign:"center",padding:"1.2rem 0 0",fontFamily:T.body,fontSize:".75rem",color:"rgba(255,255,255,.18)",letterSpacing:".1em"}}>
          Solar Flash Intelligence Ecosystem — $FLASH on Solana
        </div>
      </div>
    </div>
  );
}
