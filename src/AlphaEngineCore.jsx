/**
 * src/AlphaEngineCore.jsx — INTERNAL TESTING INTERFACE
 * Route: /alpha-core
 *
 * This is NOT the public Alpha Engine page. It is a minimal,
 * functional tool for verifying the decision pipeline end to end:
 * input a mint -> see raw JSON + a readable decision card.
 * Focus: correctness, stability, explainability. No design polish.
 */

import { useState } from "react";

const T = {
  font: "'Orbitron',monospace",
  body: "'Rajdhani',sans-serif",
  bg:   "#0a0907",
  ok:   "#50ffa0",
  bad:  "#ff4d4d",
  warn: "#ffaa00",
  cyan: "#00e5ff",
};

const TEST_MINTS = [
  { label: "SOL",  mint: "So11111111111111111111111111111111111111112" },
  { label: "JUP",  mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN" },
  { label: "WIF",  mint: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm" },
];

function dirColor(d) {
  if (d === "LONG")  return T.ok;
  if (d === "SHORT") return T.bad;
  if (d === "WATCH") return T.warn;
  return "rgba(255,255,255,.4)"; // IGNORE
}

export default function AlphaEngineCore() {
  const [mint, setMint]           = useState("");
  const [timeframe, setTimeframe] = useState("swing");
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState(null);
  const [showRaw, setShowRaw]     = useState(false);

  async function runEngine(useMint) {
    const target = useMint || mint;
    if (!target || target.length < 32) {
      setError("Enter a valid Solana mint address (32+ chars).");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const r = await fetch(`/api/alpha-engine?mint=${target}&timeframe=${timeframe}`);
      const json = await r.json();
      if (!json.success) {
        setError(json.error || "Engine returned an error");
        setResult(json);
      } else {
        setResult(json);
      }
    } catch (e) {
      setError(e.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: "#fff", fontFamily: T.body, padding: "2rem 1.2rem" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;600&display=swap');
        * { box-sizing: border-box; }
        input, select { font-family: 'Rajdhani',sans-serif; }
      `}</style>

      <div style={{ maxWidth: "880px", margin: "0 auto" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ fontFamily: T.font, fontSize: ".55rem", letterSpacing: ".3em", color: "rgba(255,180,0,.6)" }}>
            INTERNAL TOOL — NOT PUBLIC
          </div>
          <h1 style={{ fontFamily: T.font, fontSize: "1.5rem", fontWeight: 900, margin: ".4rem 0" }}>
            Alpha Engine V1 — Core Test Console
          </h1>
          <p style={{ color: "rgba(255,255,255,.45)", fontSize: ".95rem" }}>
            Runs the real decision pipeline: collect → normalize → score → risk → decision → signal → reasoning.
          </p>
        </div>

        {/* Input row */}
        <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          <input
            value={mint}
            onChange={e => setMint(e.target.value.trim())}
            placeholder="Solana mint address…"
            style={{ flex: 1, minWidth: "260px", padding: ".7rem .9rem", borderRadius: "8px",
              border: "1px solid rgba(255,255,255,.15)", background: "rgba(255,255,255,.04)", color: "#fff", fontSize: ".95rem" }}
          />
          <select value={timeframe} onChange={e => setTimeframe(e.target.value)}
            style={{ padding: ".7rem .9rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,.15)",
              background: "rgba(255,255,255,.04)", color: "#fff", fontSize: ".9rem" }}>
            <option value="scalp">Scalp</option>
            <option value="intraday">Intraday</option>
            <option value="swing">Swing</option>
            <option value="position">Position</option>
          </select>
          <button onClick={() => runEngine()} disabled={loading}
            style={{ padding: ".7rem 1.4rem", borderRadius: "8px", border: "1px solid rgba(0,229,255,.4)",
              background: "rgba(0,229,255,.1)", color: T.cyan, fontFamily: T.font, fontSize: ".42rem",
              letterSpacing: ".15em", cursor: loading ? "wait" : "pointer" }}>
            {loading ? "RUNNING…" : "RUN ENGINE"}
          </button>
        </div>

        {/* Quick test mints */}
        <div style={{ display: "flex", gap: ".5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          {TEST_MINTS.map(t => (
            <button key={t.mint} onClick={() => { setMint(t.mint); runEngine(t.mint); }}
              style={{ padding: ".35rem .8rem", borderRadius: "6px", border: "1px solid rgba(255,255,255,.12)",
                background: "rgba(255,255,255,.03)", color: "rgba(255,255,255,.55)", fontFamily: T.font,
                fontSize: ".34rem", letterSpacing: ".1em", cursor: "pointer" }}>
              TEST: {t.label}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ padding: "1rem", borderRadius: "8px", border: `1px solid ${T.bad}40`, background: `${T.bad}10`, marginBottom: "1.2rem" }}>
            <strong style={{ color: T.bad }}>Error:</strong> <span style={{ color: "rgba(255,255,255,.7)" }}>{error}</span>
          </div>
        )}

        {result && result.success && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

            {/* Decision card */}
            <div style={{ padding: "1.3rem", borderRadius: "12px", border: `1px solid ${dirColor(result.decision.direction)}40`,
              background: `${dirColor(result.decision.direction)}0d` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: ".6rem" }}>
                <div>
                  <div style={{ fontFamily: T.font, fontSize: "1.6rem", fontWeight: 900, color: dirColor(result.decision.direction) }}>
                    {result.decision.direction}
                  </div>
                  <div style={{ color: "rgba(255,255,255,.5)", fontSize: ".9rem" }}>{result.symbol} · {result.sector || "unmapped sector"}</div>
                </div>
                <div style={{ display: "flex", gap: "1.4rem" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: T.font, fontSize: "1.1rem", fontWeight: 700 }}>{result.decision.alphaScore}</div>
                    <div style={{ fontSize: ".62rem", color: "rgba(255,255,255,.35)" }}>ALPHA SCORE</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: T.font, fontSize: "1.1rem", fontWeight: 700 }}>{result.decision.confidence}%</div>
                    <div style={{ fontSize: ".62rem", color: "rgba(255,255,255,.35)" }}>CONFIDENCE</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: T.font, fontSize: "1.1rem", fontWeight: 700, color: T.warn }}>{result.decision.riskPct}%</div>
                    <div style={{ fontSize: ".62rem", color: "rgba(255,255,255,.35)" }}>RISK ({result.decision.riskLevel})</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trade levels */}
            {result.trade && (
              <div style={{ padding: "1.1rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.02)" }}>
                <div style={{ fontFamily: T.font, fontSize: ".5rem", letterSpacing: ".15em", color: "rgba(255,255,255,.4)", marginBottom: ".7rem" }}>TRADE LEVELS</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: ".7rem" }}>
                  <div><div style={{ fontSize: ".7rem", color: "rgba(255,255,255,.4)" }}>Entry Zone</div><div>{result.trade.entryZone?.[0]} – {result.trade.entryZone?.[1]}</div></div>
                  <div><div style={{ fontSize: ".7rem", color: T.bad }}>Stop Loss</div><div>{result.trade.stopLoss}</div></div>
                  <div><div style={{ fontSize: ".7rem", color: T.ok }}>TP1</div><div>{result.trade.takeProfits?.tp1}</div></div>
                  <div><div style={{ fontSize: ".7rem", color: T.ok }}>TP2</div><div>{result.trade.takeProfits?.tp2}</div></div>
                  <div><div style={{ fontSize: ".7rem", color: T.ok }}>TP3</div><div>{result.trade.takeProfits?.tp3}</div></div>
                  <div><div style={{ fontSize: ".7rem", color: "rgba(255,255,255,.4)" }}>Holding Period</div><div>{result.trade.holdingPeriodHours}h</div></div>
                </div>
                <div style={{ marginTop: ".8rem", display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                  {Object.entries(result.trade.timeframeSuitability || {}).map(([tf, val]) => (
                    <span key={tf} style={{ fontSize: ".7rem", padding: ".2rem .6rem", borderRadius: "5px",
                      background: val === "Suitable" ? `${T.ok}15` : val === "Marginal" ? `${T.warn}15` : "rgba(255,255,255,.05)",
                      color: val === "Suitable" ? T.ok : val === "Marginal" ? T.warn : "rgba(255,255,255,.35)" }}>
                      {tf}: {val}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Scores breakdown */}
            <div style={{ padding: "1.1rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.02)" }}>
              <div style={{ fontFamily: T.font, fontSize: ".5rem", letterSpacing: ".15em", color: "rgba(255,255,255,.4)", marginBottom: ".7rem" }}>CATEGORY SCORES</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: ".5rem" }}>
                {Object.entries(result.scores).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", flexDirection: "column", gap: ".25rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".75rem" }}>
                      <span style={{ color: "rgba(255,255,255,.5)" }}>{k}</span><span>{v}</span>
                    </div>
                    <div style={{ height: "4px", borderRadius: "99px", background: "rgba(255,255,255,.08)" }}>
                      <div style={{ width: `${v}%`, height: "100%", borderRadius: "99px", background: v >= 60 ? T.ok : v >= 40 ? T.warn : T.bad }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reasoning */}
            <div style={{ padding: "1.1rem", borderRadius: "10px", border: "1px solid rgba(0,229,255,.2)", background: "rgba(0,229,255,.03)" }}>
              <div style={{ fontFamily: T.font, fontSize: ".5rem", letterSpacing: ".15em", color: T.cyan, marginBottom: ".7rem" }}>AI REASONING</div>
              <ul style={{ margin: 0, paddingLeft: "1.1rem", display: "flex", flexDirection: "column", gap: ".4rem" }}>
                {result.reasoning?.map((r, i) => (
                  <li key={i} style={{ color: "rgba(255,255,255,.65)", fontSize: ".88rem", lineHeight: 1.5 }}>{r}</li>
                ))}
              </ul>
            </div>

            {/* Data quality */}
            <div style={{ padding: "1rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,.08)", background: "rgba(255,255,255,.015)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: ".6rem", alignItems: "center" }}>
                <span style={{ fontSize: ".8rem", color: "rgba(255,255,255,.45)" }}>Data completeness: {result.dataQuality.completeness}%</span>
                <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                  {Object.entries(result.dataQuality.sourcesAvailable).map(([src, ok]) => (
                    <span key={src} style={{ fontSize: ".68rem", padding: ".15rem .5rem", borderRadius: "5px",
                      color: ok ? T.ok : "rgba(255,255,255,.3)", border: `1px solid ${ok ? T.ok+"30" : "rgba(255,255,255,.1)"}` }}>
                      {ok ? "✓" : "✗"} {src}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={() => setShowRaw(s => !s)}
              style={{ alignSelf: "flex-start", padding: ".4rem .9rem", borderRadius: "6px", border: "1px solid rgba(255,255,255,.15)",
                background: "transparent", color: "rgba(255,255,255,.5)", fontSize: ".75rem", cursor: "pointer" }}>
              {showRaw ? "Hide" : "Show"} raw JSON
            </button>
            {showRaw && (
              <pre style={{ padding: "1rem", borderRadius: "8px", background: "#000", overflow: "auto", fontSize: ".75rem", color: "rgba(255,255,255,.6)", maxHeight: "400px" }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </div>
        )}

        {result && !result.success && (
          <pre style={{ padding: "1rem", borderRadius: "8px", background: "#000", overflow: "auto", fontSize: ".8rem", color: T.bad }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
