/**
 * EmailSubscribe.jsx — Solar Flash Email Intelligence
 * Drop-in subscription component
 * Uses /api/subscribe serverless function
 */

import { useState } from "react";

const T = {
  gold:   "#ffd700",
  orange: "#ff8c00",
  ok:     "#50ffa0",
  danger: "#ff3535",
  cyan:   "#00e5ff",
  font:   "'Orbitron', monospace",
  body:   "'Rajdhani', sans-serif",
};

export default function EmailSubscribe({ variant = "full" }) {
  const [email,   setEmail]   = useState("");
  const [status,  setStatus]  = useState(null); // null | "loading" | "success" | "exists" | "error"
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: trimmed }),
      });

      const data = await res.json();

      if (data.success && data.message === "already_subscribed") {
        setStatus("exists");
        setMessage("You're already subscribed. We'll keep you updated.");
      } else if (data.success) {
        setStatus("success");
        setMessage("You're in. Intelligence updates will be delivered to your inbox.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("Connection error. Please try again.");
    }
  };

  const statusColor =
    status === "success" || status === "exists" ? T.ok :
    status === "error"   ? T.danger : T.gold;

  // ── COMPACT (banner/footer variant) ──────────────────────────
  if (variant === "compact") {
    return (
      <div style={{ display:"flex", gap:".6rem", alignItems:"center", flexWrap:"wrap", maxWidth:"480px" }}>
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          placeholder="your@email.com"
          disabled={status === "loading" || status === "success"}
          style={{
            flex:1, minWidth:"180px",
            padding:".6rem 1rem",
            borderRadius:"8px",
            border:"1.5px solid rgba(255,180,0,.28)",
            background:"rgba(0,0,0,.5)",
            color:"#fff",
            fontFamily:T.body, fontSize:".92rem", letterSpacing:".04em",
            outline:"none",
            transition:"border-color .2s",
          }}
          onFocus={e  => { e.target.style.borderColor="rgba(255,180,0,.65)"; }}
          onBlur={e   => { e.target.style.borderColor="rgba(255,180,0,.28)"; }}
        />
        <button
          onClick={handleSubmit}
          disabled={status === "loading" || status === "success"}
          style={{
            padding:".6rem 1.3rem",
            borderRadius:"8px",
            border:"1.5px solid rgba(255,180,0,.45)",
            background:"linear-gradient(135deg,rgba(255,180,0,.18),rgba(255,80,0,.1))",
            color:"rgba(255,215,0,.95)",
            fontFamily:T.font, fontSize:".42rem", letterSpacing:".18em",
            cursor: status==="loading"||status==="success" ? "not-allowed" : "pointer",
            opacity: status==="loading"||status==="success" ? .6 : 1,
            transition:"all .3s", fontWeight:700, whiteSpace:"nowrap",
          }}
          onMouseEnter={e => { if(status!=="loading"&&status!=="success") e.currentTarget.style.boxShadow="0 0 24px rgba(255,180,0,.25)"; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow="none"; }}
        >
          {status === "loading" ? "..." : status === "success" ? "✓ JOINED" : "JOIN"}
        </button>
        {message && (
          <p style={{ width:"100%", fontFamily:T.body, fontSize:".82rem", color:statusColor, letterSpacing:".04em", margin:0 }}>
            {message}
          </p>
        )}
      </div>
    );
  }

  // ── FULL (section variant) ────────────────────────────────────
  return (
    <section style={{
      position:"relative", zIndex:10,
      padding:"clamp(4rem,10vw,7rem) clamp(1rem,5vw,3rem)",
      background:"rgba(0,0,0,.3)",
      borderTop:"1px solid rgba(255,180,0,.08)",
      borderBottom:"1px solid rgba(255,180,0,.08)",
    }}>
      <div style={{ maxWidth:"660px", margin:"0 auto", textAlign:"center" }}>

        {/* Icon */}
        <div style={{
          width:"64px", height:"64px", borderRadius:"50%",
          background:"radial-gradient(circle at 38% 35%,#fffde7,#ffd700 28%,#ff8c00 60%,#cc2200)",
          boxShadow:"0 0 32px rgba(255,150,0,.5)",
          margin:"0 auto clamp(1.2rem,3vw,1.8rem)",
        }}/>

        {/* Headline */}
        <div style={{ fontFamily:T.font, fontSize:".42rem", letterSpacing:".42em", color:"rgba(255,180,0,.45)", marginBottom:".8rem" }}>
          SOLAR FLASH INTELLIGENCE
        </div>
        <h2 style={{
          fontFamily:T.font,
          fontSize:"clamp(1.5rem,4vw,2.4rem)", fontWeight:900,
          background:"linear-gradient(135deg,#fff,#ffd700,#ff8c00)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
          letterSpacing:".08em", lineHeight:1.1, marginBottom:"1rem",
        }}>
          STAY IN THE SIGNAL
        </h2>
        <p style={{
          fontFamily:T.body, fontSize:"clamp(.9rem,2vw,1.05rem)",
          color:"rgba(255,255,255,.42)", letterSpacing:".1em",
          lineHeight:1.8, marginBottom:"clamp(1.5rem,4vw,2.5rem)", maxWidth:"500px", margin:"0 auto clamp(1.5rem,4vw,2.5rem)",
        }}>
          Get notified when new intelligence modules launch, major updates ship, and ecosystem events happen.
        </p>

        {/* Form */}
        {status === "success" ? (
          <div style={{
            display:"inline-flex", alignItems:"center", gap:".8rem",
            padding:"1rem 2rem", borderRadius:"12px",
            border:"1px solid rgba(80,255,160,.35)", background:"rgba(80,255,160,.08)",
            animation:"es-fade .4s ease",
          }}>
            <span style={{ fontSize:"1.3rem" }}>✅</span>
            <div style={{ textAlign:"left" }}>
              <div style={{ fontFamily:T.font, fontSize:".52rem", color:T.ok, letterSpacing:".18em", marginBottom:".2rem" }}>YOU'RE IN</div>
              <div style={{ fontFamily:T.body, fontSize:".92rem", color:"rgba(255,255,255,.55)", letterSpacing:".05em" }}>{message}</div>
            </div>
          </div>
        ) : (
          <div>
            <div style={{
              display:"flex", gap:".7rem", maxWidth:"480px", margin:"0 auto",
              flexWrap:"wrap", justifyContent:"center",
            }}>
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                placeholder="Enter your email address"
                disabled={status === "loading"}
                style={{
                  flex:"1", minWidth:"220px",
                  padding:".9rem 1.3rem",
                  borderRadius:"10px",
                  border:"1.5px solid rgba(255,180,0,.25)",
                  background:"rgba(0,0,0,.55)",
                  color:"#fff",
                  fontFamily:T.body, fontSize:"1rem", letterSpacing:".04em",
                  outline:"none", backdropFilter:"blur(8px)",
                  transition:"border-color .2s, box-shadow .2s",
                }}
                onFocus={e  => { e.target.style.borderColor="rgba(255,180,0,.65)"; e.target.style.boxShadow="0 0 0 3px rgba(255,180,0,.08)"; }}
                onBlur={e   => { e.target.style.borderColor="rgba(255,180,0,.25)"; e.target.style.boxShadow="none"; }}
              />
              <button
                onClick={handleSubmit}
                disabled={status === "loading" || !email.trim()}
                style={{
                  padding:".9rem 1.8rem",
                  borderRadius:"10px",
                  border:"1.5px solid rgba(255,180,0,.5)",
                  background:"linear-gradient(135deg,rgba(255,180,0,.2),rgba(255,80,0,.12))",
                  color:"rgba(255,215,0,.95)",
                  fontFamily:T.font, fontSize:".52rem", letterSpacing:".2em",
                  cursor: status==="loading"||!email.trim() ? "not-allowed" : "pointer",
                  opacity: status==="loading"||!email.trim() ? .5 : 1,
                  transition:"all .3s", fontWeight:700, flexShrink:0,
                  display:"flex", alignItems:"center", gap:".5rem",
                }}
                onMouseEnter={e => { if(status!=="loading"&&email) e.currentTarget.style.boxShadow="0 0 32px rgba(255,180,0,.3)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow="none"; }}
              >
                {status === "loading" ? (
                  <>
                    <span style={{ width:"12px", height:"12px", borderRadius:"50%", border:"2px solid rgba(255,215,0,.3)", borderTop:"2px solid #ffd700", display:"inline-block", animation:"es-spin 1s linear infinite" }}/>
                    JOINING…
                  </>
                ) : "⚡ JOIN THE SIGNAL"}
              </button>
            </div>

            {/* Status message */}
            {message && status !== "success" && (
              <p style={{
                fontFamily:T.body, fontSize:".88rem", color:statusColor,
                letterSpacing:".06em", marginTop:".9rem", animation:"es-fade .3s ease",
              }}>
                {status === "exists" ? "✓ " : "⚠ "}{message}
              </p>
            )}

            {/* Privacy note */}
            <p style={{ fontFamily:T.body, fontSize:".75rem", color:"rgba(255,255,255,.2)", letterSpacing:".08em", marginTop:"1rem" }}>
              No spam. Unsubscribe anytime. Intelligence updates only.
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes es-spin { to{transform:rotate(360deg);} }
        @keyframes es-fade { from{opacity:0;transform:translateY(6px);} to{opacity:1;transform:translateY(0);} }
        input::placeholder{color:rgba(255,255,255,.22);}
      `}</style>
    </section>
  );
}
