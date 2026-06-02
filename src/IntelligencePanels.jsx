/**
 * IntelligencePanels.jsx — Solar Flash Design System v5
 * Intelligence Panel System + Micro Interactions
 * 
 * Exports:
 *   IntelPanel        — glassmorphic intelligence panel wrapper
 *   IntelCard         — compact metric card
 *   IntelBadge        — status badge with pulse
 *   IntelButton       — premium CTA button
 *   IntelProgress     — animated progress bar
 *   IntelStat         — stat display with trend
 *   IntelDivider      — section divider with glow
 *   IntelTag          — filter/label tag
 *   IntelInput        — scanner input field
 *   LiveFeedItem      — timeline feed row
 *   DataActivation    — number count-up animation
 *   SignalPulse       — radial signal pulse visual
 *   GlowBorder        — hover glow border wrapper
 *   MicroTooltip      — hover tooltip
 */

import { useState, useEffect, useRef, useCallback } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────
export const DS = {
  // Colors
  orange:  "#ff8c00",
  gold:    "#ffd700",
  cyan:    "#00e5ff",
  ok:      "#50ffa0",
  purple:  "#b060ff",
  danger:  "#ff3535",
  black:   "#050403",
  // Fonts
  font:    "'Orbitron', monospace",
  body:    "'Rajdhani', sans-serif",
  // Radii
  r_sm:    "6px",
  r_md:    "10px",
  r_lg:    "14px",
  r_xl:    "18px",
  // Transitions
  fast:    "all .18s ease",
  mid:     "all .28s ease",
  slow:    "all .45s ease",
};

// ─── GLOBAL CSS ───────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600&display=swap');

  /* ── Pulse animations ── */
  @keyframes ds-ping      { 0%{transform:scale(1);opacity:.7;} 100%{transform:scale(2.5);opacity:0;} }
  @keyframes ds-blink     { 0%,100%{opacity:1;} 50%{opacity:.2;} }
  @keyframes ds-spin      { to{transform:rotate(360deg);} }
  @keyframes ds-spin-r    { to{transform:rotate(-360deg);} }
  @keyframes ds-fade-up   { from{opacity:0;transform:translateY(12px);} to{opacity:1;transform:translateY(0);} }
  @keyframes ds-fade-in   { from{opacity:0;} to{opacity:1;} }
  @keyframes ds-scale-in  { from{opacity:0;transform:scale(.94);} to{opacity:1;transform:scale(1);} }
  @keyframes ds-shimmer   { 0%{left:-120%;} 100%{left:160%;} }
  @keyframes ds-glow-pulse{ 0%,100%{opacity:.5;} 50%{opacity:1;} }
  @keyframes ds-count-up  { from{opacity:0;transform:translateY(4px);} to{opacity:1;transform:translateY(0);} }
  @keyframes ds-signal-expand { 0%{transform:scale(0);opacity:.8;} 100%{transform:scale(3);opacity:0;} }
  @keyframes ds-scan-line { 0%{top:-2px;} 100%{top:102%;} }
  @keyframes ds-border-glow { 0%,100%{opacity:.3;} 50%{opacity:.7;} }

  /* ── Panel base ── */
  .ds-panel {
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,.08);
    background: rgba(0,0,0,.55);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    overflow: hidden;
    transition: border-color .3s, box-shadow .3s, transform .3s;
    position: relative;
  }
  .ds-panel:hover {
    transform: translateY(-2px);
  }
  .ds-panel::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(135deg, transparent, rgba(255,255,255,.04), transparent);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: destination-out;
    mask-composite: exclude;
    pointer-events: none;
  }

  /* ── Scan line effect on active panels ── */
  .ds-panel-scanning::after {
    content: '';
    position: absolute;
    left: 0; right: 0; height: 1px;
    background: linear-gradient(to right, transparent, rgba(255,200,0,.4), transparent);
    animation: ds-scan-line 2.5s linear infinite;
    pointer-events: none;
    z-index: 10;
  }

  /* ── Button base ── */
  .ds-btn {
    border: none; outline: none;
    cursor: pointer;
    font-family: 'Orbitron', monospace;
    position: relative;
    overflow: hidden;
    transition: all .25s;
    font-weight: 700;
    letter-spacing: .18em;
  }
  .ds-btn::after {
    content: '';
    position: absolute;
    top: 0; left: -120%; width: 60%; height: 100%;
    background: linear-gradient(to right, transparent, rgba(255,255,255,.08), transparent);
    transform: skewX(-20deg);
    transition: none;
  }
  .ds-btn:hover::after {
    animation: ds-shimmer .55s ease;
  }
  .ds-btn:active { transform: scale(.97); }

  /* ── Tag base ── */
  .ds-tag {
    display: inline-flex; align-items: center; gap: .35rem;
    font-family: 'Orbitron', monospace;
    letter-spacing: .14em;
    border-radius: 50px;
    cursor: pointer;
    transition: all .2s;
    white-space: nowrap;
  }
  .ds-tag:hover { filter: brightness(1.15); }

  /* ── Input ── */
  .ds-input {
    width: 100%;
    background: rgba(0,0,0,.5);
    border: 1.5px solid rgba(255,255,255,.1);
    border-radius: 10px;
    color: #fff;
    font-family: 'Rajdhani', sans-serif;
    font-size: 1rem;
    letter-spacing: .04em;
    outline: none;
    transition: border-color .2s, box-shadow .2s;
    backdrop-filter: blur(8px);
  }
  .ds-input:focus {
    box-shadow: 0 0 0 3px rgba(255,180,0,.08);
  }
  .ds-input::placeholder { color: rgba(255,255,255,.22); }

  /* ── Tooltip ── */
  .ds-tooltip-wrap { position: relative; display: inline-flex; }
  .ds-tooltip {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    background: rgba(10,8,4,.95);
    border: 1px solid rgba(255,180,0,.2);
    border-radius: 8px;
    padding: .45rem .8rem;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity .2s, transform .2s;
    transform: translateX(-50%) translateY(4px);
    font-family: 'Rajdhani', sans-serif;
    font-size: .85rem;
    color: rgba(255,255,255,.75);
    letter-spacing: .05em;
    z-index: 100;
    backdrop-filter: blur(8px);
  }
  .ds-tooltip::after {
    content: '';
    position: absolute;
    top: 100%; left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: rgba(255,180,0,.2);
  }
  .ds-tooltip-wrap:hover .ds-tooltip {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }

  /* ── Feed item ── */
  .ds-feed-item {
    display: flex; gap: .8rem; align-items: flex-start;
    padding: .7rem .6rem;
    border-radius: 10px;
    cursor: pointer;
    transition: background .2s;
  }
  .ds-feed-item:hover { background: rgba(255,255,255,.035); }

  /* ── Responsive ── */
  @media(max-width:480px) {
    .ds-panel { border-radius: 12px; }
  }
`;

// ─── INJECT GLOBAL CSS ────────────────────────────────────────
let _cssInjected = false;
function injectCSS() {
  if (_cssInjected || typeof document === "undefined") return;
  const tag = document.createElement("style");
  tag.textContent = GLOBAL_CSS;
  document.head.appendChild(tag);
  _cssInjected = true;
}

// ─── LIVE DOT ─────────────────────────────────────────────────
export function LiveDot({ color = DS.ok, size = 7, className = "" }) {
  return (
    <span className={className} style={{ position:"relative", display:"inline-flex", width:size, height:size, flexShrink:0, alignItems:"center", justifyContent:"center" }}>
      <span style={{ position:"absolute", inset:0, borderRadius:"50%", background:color, opacity:.65, animation:"ds-ping 1.5s ease-out infinite" }}/>
      <span style={{ position:"relative", width:"100%", height:"100%", borderRadius:"50%", background:color, boxShadow:`0 0 6px ${color}88` }}/>
    </span>
  );
}

// ─── INTEL BADGE ─────────────────────────────────────────────
export function IntelBadge({ label, color = DS.gold, pulse = false, size = "md" }) {
  injectCSS();
  const sz = size === "sm" ? { pad:".14rem .5rem", font:".3rem" }
           : size === "lg" ? { pad:".28rem .85rem", font:".48rem" }
           : { pad:".18rem .65rem", font:".36rem" };
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:".35rem",
      padding:sz.pad, borderRadius:"50px",
      border:`1px solid ${color}35`, background:`${color}0e`,
      fontFamily:DS.font, fontSize:sz.font, letterSpacing:".18em", color,
      whiteSpace:"nowrap",
    }}>
      {pulse && <LiveDot color={color} size={5}/>}
      {label}
    </span>
  );
}

// ─── INTEL BUTTON ─────────────────────────────────────────────
export function IntelButton({
  children, color = DS.gold, href, onClick,
  size = "md", variant = "outline", fullWidth = false,
  disabled = false, loading = false,
}) {
  injectCSS();
  const sz = size === "sm" ? { pad:".45rem 1rem",    font:".38rem" }
           : size === "lg" ? { pad:".9rem 2rem",     font:".6rem"  }
           : { pad:".65rem 1.5rem", font:".46rem" };

  const variantStyle = variant === "solid"
    ? { background:`linear-gradient(135deg,${color}33,${color}18)`, borderColor:`${color}66` }
    : variant === "ghost"
    ? { background:"transparent", borderColor:`${color}28` }
    : { background:`${color}0d`, borderColor:`${color}3a` };

  const el = (
    <button
      className="ds-btn"
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        padding: sz.pad, borderRadius: DS.r_md,
        border: `1.5px solid ${variantStyle.borderColor}`,
        background: variantStyle.background,
        color: disabled ? "rgba(255,255,255,.3)" : color,
        fontSize: sz.font, width: fullWidth ? "100%" : "auto",
        opacity: disabled ? .5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        display:"inline-flex", alignItems:"center", gap:".5rem",
      }}
      onMouseEnter={e => { if(!disabled&&!loading) { e.currentTarget.style.boxShadow=`0 0 28px ${color}28`; e.currentTarget.style.borderColor=`${color}77`; }}}
      onMouseLeave={e => { e.currentTarget.style.boxShadow="none"; e.currentTarget.style.borderColor=variantStyle.borderColor; }}
    >
      {loading && (
        <span style={{ width:"12px", height:"12px", borderRadius:"50%", border:`2px solid ${color}33`, borderTop:`2px solid ${color}`, display:"inline-block", animation:"ds-spin 1s linear infinite" }}/>
      )}
      {children}
    </button>
  );

  if (href) return <a href={href} style={{ textDecoration:"none" }}>{el}</a>;
  return el;
}

// ─── INTEL PROGRESS ───────────────────────────────────────────
export function IntelProgress({ value = 0, color = DS.gold, height = 4, label, showValue = true, animated = true }) {
  injectCSS();
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (!animated) { setDisplayed(value); return; }
    let start = null;
    const dur  = 900;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplayed(Math.round(ease * value));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value, animated]);

  return (
    <div>
      {(label || showValue) && (
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:".35rem" }}>
          {label && <span style={{ fontFamily:DS.font, fontSize:".32rem", letterSpacing:".18em", color:"rgba(255,255,255,.35)" }}>{label}</span>}
          {showValue && <span style={{ fontFamily:DS.font, fontSize:".42rem", fontWeight:700, color }}>{displayed}%</span>}
        </div>
      )}
      <div style={{ height, borderRadius:"99px", background:"rgba(255,255,255,.06)", overflow:"hidden", position:"relative" }}>
        <div style={{ width:`${displayed}%`, height:"100%", background:`linear-gradient(to right,${color}77,${color})`, borderRadius:"99px", transition:"width .9s cubic-bezier(.4,0,.2,1)", position:"relative", overflow:"hidden" }}>
          {/* Shimmer */}
          <div style={{ position:"absolute", top:0, bottom:0, width:"30%", background:"linear-gradient(to right,transparent,rgba(255,255,255,.2),transparent)", animation:"ds-shimmer 2s ease 1s infinite" }}/>
        </div>
      </div>
    </div>
  );
}

// ─── INTEL STAT ───────────────────────────────────────────────
export function IntelStat({ label, value, sub, trend, color = DS.gold, icon, size = "md" }) {
  injectCSS();
  const trendColor = trend === "UP"   ? DS.ok
                   : trend === "DOWN" ? DS.danger
                   : "rgba(255,255,255,.3)";
  const trendArrow = trend === "UP" ? "↑" : trend === "DOWN" ? "↓" : "→";
  const fontSize = size === "sm" ? "clamp(.7rem,2vw,.9rem)" : size === "lg" ? "clamp(1.2rem,3vw,1.8rem)" : "clamp(.9rem,2.5vw,1.2rem)";

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:".25rem" }}>
      <div style={{ fontFamily:DS.font, fontSize:".32rem", letterSpacing:".22em", color:"rgba(255,255,255,.28)" }}>{label}</div>
      <div style={{ display:"flex", alignItems:"center", gap:".5rem" }}>
        {icon && <span style={{ fontSize:"1rem" }}>{icon}</span>}
        <span style={{ fontFamily:DS.font, fontSize, fontWeight:900, color, lineHeight:1, animation:"ds-count-up .4s ease" }}>
          {value}
        </span>
        {trend && (
          <span style={{ fontFamily:DS.font, fontSize:".55rem", color:trendColor, fontWeight:700 }}>
            {trendArrow}
          </span>
        )}
      </div>
      {sub && <div style={{ fontFamily:DS.body, fontSize:".82rem", color:"rgba(255,255,255,.3)", letterSpacing:".05em" }}>{sub}</div>}
    </div>
  );
}

// ─── INTEL DIVIDER ────────────────────────────────────────────
export function IntelDivider({ color = DS.gold, label, margin = "1.5rem 0" }) {
  injectCSS();
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"1rem", margin }}>
      <div style={{ flex:1, height:"1px", background:`linear-gradient(to right,transparent,${color}28)` }}/>
      {label && (
        <span style={{ fontFamily:DS.font, fontSize:".34rem", letterSpacing:".28em", color:`${color}66`, whiteSpace:"nowrap" }}>
          {label}
        </span>
      )}
      <div style={{ flex:1, height:"1px", background:`linear-gradient(to left,transparent,${color}28)` }}/>
    </div>
  );
}

// ─── INTEL TAG ────────────────────────────────────────────────
export function IntelTag({ label, icon, color = DS.gold, active = false, onClick, size = "sm" }) {
  injectCSS();
  const sz = size === "md" ? { pad:".38rem .9rem", font:".4rem" } : { pad:".25rem .65rem", font:".32rem" };
  return (
    <span
      className="ds-tag"
      onClick={onClick}
      style={{
        padding: sz.pad, fontSize: sz.font,
        border: `1px solid ${active ? color+"55" : color+"22"}`,
        background: active ? `${color}10` : "rgba(0,0,0,.3)",
        color: active ? color : "rgba(255,255,255,.42)",
        cursor: onClick ? "pointer" : "default",
        boxShadow: active ? `0 0 14px ${color}18` : "none",
      }}
    >
      {icon && <span>{icon}</span>}
      {label}
    </span>
  );
}

// ─── INTEL INPUT ──────────────────────────────────────────────
export function IntelInput({ value, onChange, onKeyDown, placeholder, color = DS.gold, loading = false, prefix }) {
  injectCSS();
  return (
    <div style={{ position:"relative", width:"100%" }}>
      {prefix && (
        <span style={{ position:"absolute", left:"1rem", top:"50%", transform:"translateY(-50%)", fontFamily:DS.font, fontSize:".44rem", color:`${color}66`, pointerEvents:"none" }}>
          {prefix}
        </span>
      )}
      <input
        className="ds-input"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        style={{ padding: prefix ? ".85rem 1.2rem .85rem 2.4rem" : ".85rem 1.2rem" }}
        onFocus={e  => { e.target.style.borderColor=`${color}66`; e.target.style.boxShadow=`0 0 0 3px ${color}0d`; }}
        onBlur={e   => { e.target.style.borderColor="rgba(255,255,255,.1)"; e.target.style.boxShadow="none"; }}
      />
      {loading && (
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"2px", background:`linear-gradient(to right,transparent,${color}66,transparent)`, animation:"ds-scan-line 1.8s linear infinite", borderRadius:"99px" }}/>
      )}
    </div>
  );
}

// ─── INTEL CARD ───────────────────────────────────────────────
export function IntelCard({ label, value, sub, icon, color = DS.gold, trend, onClick, active = false }) {
  injectCSS();
  const [hov, setHov] = useState(false);
  const on = hov || active;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding:"1rem 1.2rem", borderRadius:DS.r_lg,
        border:`1px solid ${on ? color+"44" : color+"1c"}`,
        background: on ? `${color}0a` : "rgba(0,0,0,.48)",
        backdropFilter:"blur(10px)",
        cursor:onClick?"pointer":"default",
        transition:DS.mid,
        boxShadow: on ? `0 0 28px ${color}16` : "none",
        position:"relative", overflow:"hidden",
      }}
    >
      {/* Top accent */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:`linear-gradient(to right,transparent,${color}${on?"55":"22"},transparent)`, transition:"opacity .3s" }}/>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:".5rem" }}>
        {icon && <span style={{ fontSize:"1.1rem", filter:`drop-shadow(0 0 6px ${color}44)` }}>{icon}</span>}
        {trend && (
          <span style={{ fontFamily:DS.font, fontSize:".55rem", color:trend==="UP"?DS.ok:trend==="DOWN"?DS.danger:"rgba(255,255,255,.3)", fontWeight:700 }}>
            {trend==="UP"?"↑":trend==="DOWN"?"↓":"→"}
          </span>
        )}
      </div>
      <div style={{ fontFamily:DS.body, fontSize:"clamp(.95rem,2vw,1.15rem)", fontWeight:700, color, marginBottom:".2rem", letterSpacing:".03em" }}>{value}</div>
      <div style={{ fontFamily:DS.font, fontSize:".32rem", letterSpacing:".2em", color:"rgba(255,255,255,.32)" }}>{label}</div>
      {sub && <div style={{ fontFamily:DS.body, fontSize:".8rem", color:"rgba(255,255,255,.28)", marginTop:".3rem" }}>{sub}</div>}
    </div>
  );
}

// ─── GLOW BORDER WRAPPER ──────────────────────────────────────
export function GlowBorder({ color = DS.gold, children, radius = "16px", intensity = "md" }) {
  injectCSS();
  const [hov, setHov] = useState(false);
  const glowPx = intensity === "sm" ? "16px" : intensity === "lg" ? "48px" : "30px";
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: radius,
        border:`1px solid ${hov ? color+"40" : color+"18"}`,
        boxShadow: hov ? `0 0 ${glowPx} ${color}18, inset 0 0 ${glowPx} ${color}05` : "none",
        transition: DS.mid,
        position:"relative",
      }}
    >
      {children}
    </div>
  );
}

// ─── MICRO TOOLTIP ────────────────────────────────────────────
export function MicroTooltip({ children, tip, color = DS.gold }) {
  injectCSS();
  return (
    <div className="ds-tooltip-wrap">
      {children}
      <div className="ds-tooltip" style={{ borderColor:`${color}30`, color:"rgba(255,255,255,.72)" }}>
        {tip}
        <div style={{ position:"absolute", bottom:"-5px", left:"50%", transform:"translateX(-50%)", width:0, height:0, borderLeft:"5px solid transparent", borderRight:"5px solid transparent", borderTop:`5px solid ${color}30` }}/>
      </div>
    </div>
  );
}

// ─── SIGNAL PULSE ─────────────────────────────────────────────
export function SignalPulse({ color = DS.gold, size = 48, rings = 3, speed = "md" }) {
  injectCSS();
  const dur = speed === "fast" ? 1.2 : speed === "slow" ? 3 : 2;
  return (
    <div style={{ position:"relative", width:size, height:size, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      {Array.from({length:rings}).map((_,i) => (
        <div key={i} style={{
          position:"absolute", inset:0, borderRadius:"50%",
          border:`1px solid ${color}`,
          animation:`ds-signal-expand ${dur}s ease-out infinite`,
          animationDelay:`${i*(dur/rings)}s`,
        }}/>
      ))}
      <div style={{ width:size*.28, height:size*.28, borderRadius:"50%", background:color, boxShadow:`0 0 ${size*.3}px ${color}` }}/>
    </div>
  );
}

// ─── DATA ACTIVATION ──────────────────────────────────────────
export function DataActivation({ value, duration = 1200, color = DS.gold, prefix = "", suffix = "" }) {
  injectCSS();
  const [displayed, setDisplayed] = useState(0);
  const numVal = parseFloat(String(value).replace(/[^0-9.]/g, "")) || 0;

  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplayed(ease * numVal);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [numVal, duration]);

  const formatted = numVal >= 1000
    ? `${(displayed/1000).toFixed(1)}K`
    : numVal >= 1 ? displayed.toFixed(0)
    : displayed.toFixed(2);

  return (
    <span style={{ fontFamily:DS.font, color, fontWeight:900, animation:"ds-count-up .4s ease" }}>
      {prefix}{formatted}{suffix}
    </span>
  );
}

// ─── LIVE FEED ITEM ───────────────────────────────────────────
export function LiveFeedItem({ icon, label, token, desc, color, time, isNew = false, onClick }) {
  injectCSS();
  return (
    <div className="ds-feed-item" onClick={onClick}>
      {/* Icon node */}
      <div style={{ width:"32px", height:"32px", borderRadius:"50%", flexShrink:0, background:`${color}14`, border:`1px solid ${color}${isNew?"50":"28"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:".9rem", boxShadow:isNew?`0 0 14px ${color}28`:"none" }}>
        {icon}
      </div>
      {/* Content */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:".2rem" }}>
          <div style={{ display:"flex", alignItems:"center", gap:".45rem" }}>
            <span style={{ fontFamily:DS.font, fontSize:".44rem", fontWeight:700, color, letterSpacing:".1em" }}>{label}</span>
            {isNew && <IntelBadge label="NEW" color={DS.ok} size="sm"/>}
          </div>
          <span style={{ fontFamily:DS.body, fontSize:".78rem", color:"rgba(255,255,255,.25)", flexShrink:0, marginLeft:".5rem" }}>{time}</span>
        </div>
        {token && <span style={{ fontFamily:DS.font, fontSize:".52rem", fontWeight:700, color:"rgba(255,255,255,.75)", display:"block", marginBottom:".2rem" }}>${token}</span>}
        {desc && <p style={{ fontFamily:DS.body, fontSize:".88rem", color:"rgba(255,255,255,.4)", letterSpacing:".03em", lineHeight:1.55, margin:0 }}>{desc}</p>}
      </div>
    </div>
  );
}

// ─── INTEL PANEL (main component) ─────────────────────────────
export function IntelPanel({
  title, subtitle, icon, color = DS.gold,
  children, cta, status, scanning = false,
  variant = "default", collapsible = false,
  defaultCollapsed = false,
}) {
  injectCSS();
  const [hov,       setHov]       = useState(false);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const borderColor = hov ? `${color}38` : `${color}1c`;
  const glowShadow  = hov ? `0 0 40px ${color}10` : "none";

  return (
    <div
      className={`ds-panel${scanning?" ds-panel-scanning":""}`}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderColor,
        boxShadow: glowShadow,
        transform: hov ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      {/* ── Top glow line ── */}
      <div style={{ position:"absolute", top:0, left:"15%", right:"15%", height:"1px", background:`linear-gradient(to right,transparent,${color}${hov?"44":"22"},transparent)`, transition:"opacity .3s" }}/>

      {/* ── Header ── */}
      <div style={{
        padding: "1rem 1.4rem",
        borderBottom: collapsed ? "none" : `1px solid ${color}10`,
        background: `${color}04`,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        cursor: collapsible ? "pointer" : "default",
      }}
        onClick={() => collapsible && setCollapsed(c => !c)}
      >
        <div style={{ display:"flex", alignItems:"center", gap:".7rem" }}>
          {icon && <span style={{ fontSize:"1.15rem", filter:`drop-shadow(0 0 8px ${color}44)`, transition:"filter .3s" }}>{icon}</span>}
          <div>
            <div style={{ fontFamily:DS.font, fontSize:".52rem", fontWeight:700, color, letterSpacing:".14em" }}>{title}</div>
            {subtitle && <div style={{ fontFamily:DS.body, fontSize:".82rem", color:"rgba(255,255,255,.32)", letterSpacing:".06em", marginTop:".1rem" }}>{subtitle}</div>}
          </div>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:".6rem" }}>
          {status && <IntelBadge label={status.label} color={status.color || color} pulse={status.pulse}/>}
          {scanning && (
            <div style={{ width:"14px", height:"14px", borderRadius:"50%", border:`2px solid ${color}33`, borderTop:`2px solid ${color}`, animation:"ds-spin 1s linear infinite" }}/>
          )}
          {/* Accent line */}
          <div style={{ width:"28px", height:"2px", background:`linear-gradient(to right,${color}${hov?"66":"33"},transparent)`, borderRadius:"99px", transition:"opacity .3s" }}/>
          {collapsible && (
            <span style={{ fontFamily:DS.font, fontSize:".4rem", color:`${color}66`, transition:"transform .25s", display:"inline-block", transform:collapsed?"rotate(0)":"rotate(180deg)" }}>▼</span>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      {!collapsed && (
        <div style={{ padding:"1.4rem", animation:"ds-fade-in .25s ease" }}>
          {children}
        </div>
      )}

      {/* ── CTA ── */}
      {!collapsed && cta && (
        <div style={{ padding:"0 1.4rem 1.2rem" }}>
          <IntelButton href={cta.href} onClick={cta.onClick} color={color} fullWidth>
            {cta.label}
          </IntelButton>
        </div>
      )}
    </div>
  );
}

// ─── DEMO PAGE ────────────────────────────────────────────────
export default function IntelligencePanelsDemo() {
  injectCSS();
  const [inputVal,  setInputVal]  = useState("");
  const [loading,   setLoading]   = useState(false);
  const [tagActive, setTagActive] = useState("all");

  const handleScan = () => {
    if (!inputVal) return;
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div style={{ minHeight:"100vh", background:DS.black, color:"#fff", padding:"2rem", fontFamily:DS.font }}>

      <h1 style={{ textAlign:"center", marginBottom:"2.5rem", fontSize:"clamp(1.2rem,4vw,2rem)", background:`linear-gradient(135deg,#fff,${DS.gold},${DS.orange})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", letterSpacing:".1em" }}>
        SOLAR FLASH — DESIGN SYSTEM v5
      </h1>

      <div style={{ maxWidth:"1100px", margin:"0 auto", display:"flex", flexDirection:"column", gap:"2rem" }}>

        {/* ── ROW 1: Panels ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,300px),1fr))", gap:"1rem" }}>

          <IntelPanel title="SURVIVAL REACTOR" subtitle="Token health analysis" icon="☀️" color={DS.ok}
            status={{ label:"LIVE", color:DS.ok, pulse:true }}
            cta={{ label:"⊙ SCAN TOKEN →", href:"/score" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:".7rem", marginBottom:"1rem" }}>
              {[
                {label:"SCORE",    value:"82/100", color:DS.ok,    trend:"UP"},
                {label:"RISK",     value:"LOW",    color:DS.ok,    trend:null},
                {label:"LIQUIDITY",value:"$2.4M",  color:DS.cyan,  trend:"UP"},
                {label:"HOLDERS",  value:"14.2K",  color:DS.gold,  trend:"UP"},
              ].map((s,i) => <IntelCard key={i} {...s}/>)}
            </div>
            <IntelProgress value={82} color={DS.ok} label="SURVIVAL SCORE"/>
          </IntelPanel>

          <IntelPanel title="THREAT RADAR" subtitle="Risk intelligence" icon="🎯" color={DS.orange}
            status={{ label:"SCANNING", color:DS.gold, pulse:true }} scanning
            cta={{ label:"🎯 VIEW THREATS →", href:"/threat" }}>
            <div style={{ display:"flex", flexDirection:"column", gap:".6rem" }}>
              {[
                {label:"Rug Risk",       val:25, color:DS.danger },
                {label:"Whale Risk",     val:48, color:DS.warn   },
                {label:"Volatility",     val:62, color:DS.orange },
                {label:"Contract Risk",  val:18, color:DS.cyan   },
              ].map((r,i) => <IntelProgress key={i} value={r.val} color={r.color} label={r.label} height={3}/>)}
            </div>
          </IntelPanel>

          <IntelPanel title="SOLAR PULSE" subtitle="Live market heartbeat" icon="⚡" color={DS.cyan}
            status={{ label:"LIVE", color:DS.ok, pulse:true }}
            cta={{ label:"⚡ FULL TIMELINE →", href:"/pulse" }}>
            <div style={{ display:"flex", flexDirection:"column", gap:".2rem" }}>
              {[
                {icon:"🐋",label:"WHALE",   token:"FLASH", desc:"Large accumulation detected",         color:DS.cyan,   isNew:true,  time:"12s"},
                {icon:"🧠",label:"SMART",   token:"WIF",   desc:"Alpha wallet entered position",       color:"#b060ff", isNew:false, time:"4m"},
                {icon:"☠️",label:"RISK",    token:"PUMP",  desc:"Mint authority active",               color:DS.danger, isNew:false, time:"9m"},
                {icon:"📡",label:"NARRATIVE",token:"AI",   desc:"Narrative momentum +340%",            color:DS.orange, isNew:false, time:"18m"},
              ].map((ev,i) => <LiveFeedItem key={i} {...ev}/>)}
            </div>
          </IntelPanel>

        </div>

        <IntelDivider color={DS.gold} label="MICRO INTERACTIONS"/>

        {/* ── ROW 2: Micro Interactions ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,240px),1fr))", gap:"1.2rem" }}>

          {/* Badges */}
          <IntelPanel title="BADGES" icon="🏷" color={DS.purple}>
            <div style={{ display:"flex", flexWrap:"wrap", gap:".5rem" }}>
              <IntelBadge label="LIVE"     color={DS.ok}     pulse/>
              <IntelBadge label="BUILDING" color={DS.gold}   pulse/>
              <IntelBadge label="HIGH"     color={DS.danger}/>
              <IntelBadge label="MODERATE" color={DS.orange}/>
              <IntelBadge label="NEXT"     color={DS.cyan}   size="sm"/>
              <IntelBadge label="FUTURE"   color={DS.purple} size="sm"/>
            </div>
          </IntelPanel>

          {/* Buttons */}
          <IntelPanel title="BUTTONS" icon="⊙" color={DS.cyan}>
            <div style={{ display:"flex", flexDirection:"column", gap:".6rem" }}>
              <IntelButton color={DS.gold}   size="md">⊙ LAUNCH APP</IntelButton>
              <IntelButton color={DS.cyan}   size="md" variant="solid">⚡ SCAN TOKEN</IntelButton>
              <IntelButton color={DS.danger} size="sm" variant="ghost">🎯 VIEW THREAT</IntelButton>
              <IntelButton color={DS.ok}     size="md" loading fullWidth>SCANNING</IntelButton>
            </div>
          </IntelPanel>

          {/* Tags */}
          <IntelPanel title="FILTER TAGS" icon="🏷" color={DS.orange}>
            <div style={{ display:"flex", flexWrap:"wrap", gap:".45rem" }}>
              {["all","whale","smart","liquidity","risk","narrative"].map(t => (
                <IntelTag key={t} label={t.toUpperCase()} active={tagActive===t} color={DS.gold} onClick={() => setTagActive(t)}/>
              ))}
            </div>
          </IntelPanel>

          {/* Signal Pulses */}
          <IntelPanel title="SIGNAL PULSE" icon="📡" color={DS.cyan}>
            <div style={{ display:"flex", gap:"2rem", justifyContent:"center", alignItems:"center", padding:"1rem 0" }}>
              <div style={{ textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:".5rem" }}>
                <SignalPulse color={DS.ok}     size={44}/>
                <span style={{ fontFamily:DS.font, fontSize:".3rem", color:DS.ok, letterSpacing:".2em" }}>LOW</span>
              </div>
              <div style={{ textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:".5rem" }}>
                <SignalPulse color={DS.gold}   size={44} speed="md"/>
                <span style={{ fontFamily:DS.font, fontSize:".3rem", color:DS.gold, letterSpacing:".2em" }}>MED</span>
              </div>
              <div style={{ textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:".5rem" }}>
                <SignalPulse color={DS.danger} size={44} speed="fast" rings={4}/>
                <span style={{ fontFamily:DS.font, fontSize:".3rem", color:DS.danger, letterSpacing:".2em" }}>CRIT</span>
              </div>
            </div>
          </IntelPanel>

          {/* Data Activation */}
          <IntelPanel title="DATA ACTIVATION" icon="📊" color={DS.gold}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontFamily:DS.font, fontSize:".3rem", color:"rgba(255,255,255,.28)", marginBottom:".4rem", letterSpacing:".2em" }}>WALLETS</div>
                <DataActivation value={48291} color={DS.cyan}/>
              </div>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontFamily:DS.font, fontSize:".3rem", color:"rgba(255,255,255,.28)", marginBottom:".4rem", letterSpacing:".2em" }}>SCANS</div>
                <DataActivation value={1847} color={DS.gold} suffix="/min"/>
              </div>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontFamily:DS.font, fontSize:".3rem", color:"rgba(255,255,255,.28)", marginBottom:".4rem", letterSpacing:".2em" }}>ALERTS</div>
                <DataActivation value={412} color={DS.orange}/>
              </div>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontFamily:DS.font, fontSize:".3rem", color:"rgba(255,255,255,.28)", marginBottom:".4rem", letterSpacing:".2em" }}>RISKS</div>
                <DataActivation value={8841} color={DS.danger}/>
              </div>
            </div>
          </IntelPanel>

          {/* Tooltips + Input */}
          <IntelPanel title="INPUT + TOOLTIPS" icon="🔍" color={DS.ok}>
            <div style={{ display:"flex", flexDirection:"column", gap:".8rem" }}>
              <IntelInput
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={e => e.key==="Enter" && handleScan()}
                placeholder="Token address…"
                color={DS.ok}
                loading={loading}
                prefix="⊙"
              />
              <div style={{ display:"flex", gap:".6rem", flexWrap:"wrap" }}>
                {[
                  {children:<IntelBadge label="HOVER ME" color={DS.cyan}/>, tip:"Status: System Online"},
                  {children:<IntelBadge label="LIVE"     color={DS.ok} pulse/>, tip:"Feed is active"},
                  {children:<IntelBadge label="HIGH"     color={DS.danger}/>, tip:"Elevated risk level"},
                ].map((t,i) => (
                  <MicroTooltip key={i} tip={t.tip} color={DS.cyan}>{t.children}</MicroTooltip>
                ))}
              </div>
            </div>
          </IntelPanel>

        </div>

        {/* ── ROW 3: Collapsible panels ── */}
        <div style={{ display:"flex", flexDirection:"column", gap:".7rem" }}>
          <IntelDivider color={DS.purple} label="COLLAPSIBLE PANELS"/>
          {[
            {title:"WALLET INTELLIGENCE", icon:"🔬", color:DS.cyan,   sub:"Deep wallet profiling", status:{label:"BUILDING",color:DS.gold,pulse:true}},
            {title:"NARRATIVE RADAR",     icon:"📡", color:DS.orange, sub:"Trend detection",       status:{label:"NEXT",color:DS.cyan}},
            {title:"SMART MONEY VISION",  icon:"🧠", color:"#b060ff", sub:"Alpha wallet tracking", status:{label:"NEXT",color:DS.cyan}},
          ].map((p,i) => (
            <IntelPanel key={i} {...p} subtitle={p.sub} collapsible defaultCollapsed={i>0}>
              <p style={{ fontFamily:DS.body, fontSize:".95rem", color:"rgba(255,255,255,.45)", lineHeight:1.7 }}>
                This intelligence module is currently in development. Early access for $FLASH holders coming in Phase 2B.
              </p>
              <IntelProgress value={i===0?65:i===1?30:20} color={p.color} label="BUILD PROGRESS" style={{ marginTop:"1rem" }}/>
            </IntelPanel>
          ))}
        </div>

      </div>
    </div>
  );
}
