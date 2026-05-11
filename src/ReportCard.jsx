import { useState, useEffect, useRef } from "react";

// ─── CONFIG ─────────────────────────────────────────────────
// Replace with your Helius API key from helius.dev
const HELIUS_API_KEY = "3ef572d9-b813-4361-bf5b-3f7a4bff3985";
const HELIUS_RPC = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

// ─── HELPERS ────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const shortAddr = (a) =>
  a ? `${a.slice(0, 4)}…${a.slice(-4)}` : "—";

const fmtNum = (n) => {
  if (!n && n !== 0) return "—";
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(2) + "K";
  return Number(n).toFixed(2);
};

const fmtUsd = (n) => {
  if (!n && n !== 0) return "—";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return "$" + (n / 1e3).toFixed(2) + "K";
  return "$" + Number(n).toFixed(4);
};

// ─── SCORE ENGINE ────────────────────────────────────────────
function calcScore(data) {
  let score = 100;
  const flags = [];
  const goods = [];

  // Mint authority
  if (data.mintAuthority) {
    score -= 30;
    flags.push({ icon: "⚠️", text: "Mint authority NOT revoked — dev can print more tokens" });
  } else {
    goods.push({ icon: "✅", text: "Mint authority revoked — supply is fixed" });
  }

  // Freeze authority
  if (data.freezeAuthority) {
    score -= 20;
    flags.push({ icon: "⚠️", text: "Freeze authority active — dev can freeze wallets" });
  } else {
    goods.push({ icon: "✅", text: "Freeze authority revoked" });
  }

  // LP burned
  if (data.lpBurned) {
    goods.push({ icon: "✅", text: "Liquidity burned — can't rug pull" });
  } else if (data.lpLocked) {
    score -= 10;
    flags.push({ icon: "🔒", text: "Liquidity locked (not burned) — check lock expiry" });
  } else {
    score -= 35;
    flags.push({ icon: "🚨", text: "Liquidity NOT burned or locked — HIGH rug risk" });
  }

  // Top holder concentration
  if (data.topHolderPct > 50) {
    score -= 25;
    flags.push({ icon: "🚨", text: `Top holder owns ${data.topHolderPct.toFixed(1)}% — extreme concentration` });
  } else if (data.topHolderPct > 20) {
    score -= 10;
    flags.push({ icon: "⚠️", text: `Top holder owns ${data.topHolderPct.toFixed(1)}% — moderate concentration` });
  } else {
    goods.push({ icon: "✅", text: `Top holder owns ${data.topHolderPct?.toFixed(1) ?? "?"}% — healthy distribution` });
  }

  // Holder count
  if (data.holderCount < 50) {
    score -= 10;
    flags.push({ icon: "⚠️", text: `Only ${data.holderCount} holders — very early or low interest` });
  } else if (data.holderCount > 500) {
    goods.push({ icon: "✅", text: `${fmtNum(data.holderCount)} holders — solid community` });
  }

  // Market cap
  if (data.marketCap && data.marketCap < 5000) {
    flags.push({ icon: "⚠️", text: "Very low market cap — high risk, high reward" });
  }

  score = Math.max(0, Math.min(100, score));

  let grade, gradeColor, verdict;
  if (score >= 80) { grade = "A"; gradeColor = "#50ffa0"; verdict = "SAFE SIGNAL"; }
  else if (score >= 60) { grade = "B"; gradeColor = "#ffd700"; verdict = "PROCEED WITH CAUTION"; }
  else if (score >= 40) { grade = "C"; gradeColor = "#ff8c00"; verdict = "HIGH RISK"; }
  else { grade = "D"; gradeColor = "#ff3030"; verdict = "DANGER ZONE"; }

  return { score, grade, gradeColor, verdict, flags, goods };
}

// ─── DATA FETCHERS ───────────────────────────────────────────
async function fetchTokenMeta(mint) {
  // Token metadata via Helius
  const res = await fetch(HELIUS_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0", id: 1, method: "getAsset",
      params: { id: mint, displayOptions: { showFungible: true } },
    }),
  });
  const json = await res.json();
  return json.result;
}

async function fetchMintInfo(mint) {
  const res = await fetch(HELIUS_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0", id: 1,
      method: "getAccountInfo",
      params: [mint, { encoding: "jsonParsed" }],
    }),
  });
  const json = await res.json();
  return json.result?.value?.data?.parsed?.info;
}

async function fetchHolders(mint) {
  const res = await fetch(HELIUS_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0", id: 1,
      method: "getTokenLargestAccounts",
      params: [mint],
    }),
  });
  const json = await res.json();
  return json.result?.value ?? [];
}

async function fetchDexData(mint) {
  try {
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${mint}`
    );
    const json = await res.json();
    return json.pairs?.[0] ?? null;
  } catch { return null; }
}

// ─── MAIN COMPONENT ──────────────────────────────────────────
export default function ReportCard() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("");
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const glowRef = useRef(null);
  const rafRef  = useRef(null);
  const mt = useRef({ x: -999, y: -999 });
  const ms = useRef({ x: -999, y: -999 });

  // cursor glow
  useEffect(() => {
    const move = (e) => { mt.current = { x: e.clientX, y: e.clientY }; };
    const loop = () => {
      ms.current.x += (mt.current.x - ms.current.x) * 0.08;
      ms.current.y += (mt.current.y - ms.current.y) * 0.08;
      if (glowRef.current)
        glowRef.current.style.transform = `translate(${ms.current.x - 250}px,${ms.current.y - 250}px)`;
      rafRef.current = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", move, { passive: true });
    rafRef.current = requestAnimationFrame(loop);
    return () => { window.removeEventListener("mousemove", move); cancelAnimationFrame(rafRef.current); };
  }, []);

  const analyze = async () => {
    const mint = input.trim();
    if (!mint || mint.length < 32) {
      setError("Please enter a valid Solana token address.");
      return;
    }
    setError(null);
    setReport(null);
    setLoading(true);

    try {
      setStep("Scanning token metadata…");
      const [meta, mintInfo, holders, dex] = await Promise.all([
        fetchTokenMeta(mint).catch(() => null),
        fetchMintInfo(mint).catch(() => null),
        fetchHolders(mint).catch(() => []),
        fetchDexData(mint).catch(() => null),
      ]);

      setStep("Calculating risk score…");
      await sleep(600);

      // Parse supply
      const decimals = mintInfo?.decimals ?? 6;
      const supply = mintInfo?.supply
        ? Number(mintInfo.supply) / 10 ** decimals
        : null;

      // Holder concentration
      const totalSupplyRaw = mintInfo?.supply ? Number(mintInfo.supply) : 0;
      const topHolder = holders[0];
      const topHolderPct = topHolder && totalSupplyRaw > 0
        ? (Number(topHolder.amount) / totalSupplyRaw) * 100
        : 0;

      // LP heuristic — check if largest holder is burn address
      const BURN = "1nc1nerator11111111111111111111111111111111";
      const lpBurned = holders.some(
        (h) => h.address === BURN || h.address?.startsWith("11111")
      );

      const data = {
        mint,
        name: meta?.content?.metadata?.name ?? meta?.token_info?.symbol ?? "Unknown Token",
        symbol: meta?.token_info?.symbol ?? "???",
        image: meta?.content?.links?.image ?? null,
        mintAuthority: mintInfo?.mintAuthority ?? null,
        freezeAuthority: mintInfo?.freezeAuthority ?? null,
        supply,
        decimals,
        holderCount: holders.length,
        topHolderPct,
        lpBurned,
        lpLocked: false,
        price: dex ? Number(dex.priceUsd) : null,
        marketCap: dex?.fdv ? Number(dex.fdv) : null,
        volume24h: dex?.volume?.h24 ? Number(dex.volume.h24) : null,
        liquidity: dex?.liquidity?.usd ? Number(dex.liquidity.usd) : null,
        dexUrl: dex?.url ?? null,
        pairCreatedAt: dex?.pairCreatedAt ?? null,
      };

      const scored = calcScore(data);
      setReport({ ...data, ...scored });
      setStep("");
    } catch (e) {
      setError("Could not analyze token. Check the address and try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#060606", color: "#fff", fontFamily: "'Orbitron', monospace", overflowX: "hidden", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-track{background:#060606;} ::-webkit-scrollbar-thumb{background:#b8860b;}
        @keyframes pulse-ring{0%{transform:scale(.85);opacity:.9;}100%{transform:scale(2.2);opacity:0;}}
        @keyframes spin-cw{to{transform:rotate(360deg);}}
        @keyframes glow-in{from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);}}
        @keyframes bar-fill{from{width:0;}to{width:var(--w,0%);}}
        @keyframes scan{0%{top:-2px;}100%{top:100%;}}
        @keyframes border-breath{0%,100%{border-color:rgba(255,180,0,.2);}50%{border-color:rgba(255,200,60,.55);}}
        .card-in{animation:glow-in .5s ease forwards;}
        .input-box{width:100%;background:rgba(0,0,0,.55);border:1px solid rgba(255,180,0,.28);border-radius:10px;color:#fff;font-family:'Rajdhani',sans-serif;font-size:1rem;letter-spacing:.06em;padding:.9rem 1.4rem;outline:none;transition:border-color .3s;}
        .input-box:focus{border-color:rgba(255,200,60,.65);}
        .input-box::placeholder{color:rgba(255,255,255,.25);}
        .analyze-btn{width:100%;padding:1rem;border-radius:10px;border:1px solid rgba(255,180,0,.38);background:linear-gradient(135deg,rgba(255,160,0,.18),rgba(255,80,0,.12));color:rgba(255,210,70,.95);font-family:'Orbitron',monospace;font-size:.72rem;letter-spacing:.3em;cursor:pointer;transition:all .3s;margin-top:.8rem;animation:border-breath 3s ease-in-out infinite;}
        .analyze-btn:hover:not(:disabled){background:rgba(255,150,0,.28);box-shadow:0 0 40px rgba(255,150,0,.25);}
        .analyze-btn:disabled{opacity:.5;cursor:not-allowed;}
        .flag-row{display:flex;align-items:flex-start;gap:.6rem;padding:.6rem .8rem;border-radius:6px;background:rgba(255,50,0,.06);border:1px solid rgba(255,80,0,.15);margin-bottom:.5rem;}
        .good-row{display:flex;align-items:flex-start;gap:.6rem;padding:.6rem .8rem;border-radius:6px;background:rgba(80,255,160,.05);border:1px solid rgba(80,255,160,.15);margin-bottom:.5rem;}
        .stat-box{background:rgba(0,0,0,.45);border:1px solid rgba(255,180,0,.14);border-radius:10px;padding:1rem 1.2rem;text-align:center;transition:border-color .3s;}
        .stat-box:hover{border-color:rgba(255,180,0,.38);}
        .share-btn{padding:.6rem 1.4rem;border-radius:6px;border:1px solid rgba(255,180,0,.3);background:rgba(255,180,0,.06);color:rgba(255,200,80,.85);font-family:'Orbitron',monospace;font-size:.52rem;letter-spacing:.2em;cursor:pointer;transition:all .3s;}
        .share-btn:hover{border-color:rgba(255,200,60,.65);background:rgba(255,180,0,.14);}
        @media(max-width:640px){.stats-grid{grid-template-columns:1fr 1fr!important;}}
      `}</style>

      {/* Cursor glow */}
      <div ref={glowRef} style={{ position: "fixed", top: 0, left: 0, width: "500px", height: "500px", borderRadius: "50%", pointerEvents: "none", zIndex: 9999, background: "radial-gradient(circle,rgba(255,165,0,.06) 0%,transparent 62%)", mixBlendMode: "screen", willChange: "transform", transform: "translate(-3000px,-3000px)" }} />

      {/* Background grid */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(255,180,0,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,180,0,.02) 1px,transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse at 50% 0%,rgba(255,80,0,.06),transparent 60%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 10, maxWidth: "780px", margin: "0 auto", padding: "clamp(2rem,5vw,4rem) clamp(1rem,4vw,2rem)" }}>

        {/* ── HEADER ── */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          {/* Mini solar disk */}
          <div style={{ position: "relative", width: "72px", height: "72px", margin: "0 auto 1.4rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(255,170,0,.5)", animation: "pulse-ring 2.8s cubic-bezier(.215,.61,.355,1) infinite" }} />
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(255,170,0,.5)", animation: "pulse-ring 2.8s cubic-bezier(.215,.61,.355,1) infinite", animationDelay: "-1.4s" }} />
            <div style={{ position: "absolute", inset: "10%", borderRadius: "50%", border: "1.5px solid rgba(255,200,60,.5)", animation: "spin-cw 18s linear infinite" }} />
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "radial-gradient(circle at 38% 32%,#fffde7,#ffcc00 30%,#ff8c00 65%,#cc2200)", boxShadow: "0 0 22px rgba(255,150,0,.55)" }} />
          </div>

          <div style={{ fontSize: ".48rem", letterSpacing: ".55em", color: "rgba(255,170,0,.5)", marginBottom: ".5rem" }}>$FLASH PROTOCOL</div>
          <h1 style={{ fontSize: "clamp(1.5rem,5vw,2.8rem)", fontWeight: 900, letterSpacing: ".12em", background: "linear-gradient(140deg,#fff 0%,#ffd700 35%,#ff8c00 70%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: ".5rem" }}>
            MEME COIN REPORT CARD
          </h1>
          <p style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: "clamp(.9rem,2vw,1.05rem)", color: "rgba(255,255,255,.42)", letterSpacing: ".1em" }}>
            Paste any Solana token address. Get the truth in seconds.
          </p>
        </div>

        {/* ── INPUT ── */}
        <div style={{ background: "rgba(0,0,0,.5)", border: "1px solid rgba(255,180,0,.18)", borderRadius: "14px", padding: "clamp(1.2rem,3vw,2rem)", backdropFilter: "blur(12px)", marginBottom: "2rem" }}>
          <label style={{ display: "block", fontSize: ".48rem", letterSpacing: ".3em", color: "rgba(255,180,0,.55)", marginBottom: ".6rem" }}>
            TOKEN CONTRACT ADDRESS
          </label>
          <input
            className="input-box"
            placeholder="e.g. So11111111111111111111111111111111111111112"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && analyze()}
          />
          {error && (
            <p style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: ".82rem", color: "rgba(255,100,80,.8)", marginTop: ".5rem", letterSpacing: ".05em" }}>
              ⚠ {error}
            </p>
          )}
          <button className="analyze-btn" onClick={analyze} disabled={loading}>
            {loading ? `⊙ ${step}` : "⊙ ANALYZE TOKEN"}
          </button>
        </div>

        {/* ── LOADING ── */}
        {loading && (
          <div style={{ textAlign: "center", padding: "2rem", border: "1px solid rgba(255,180,0,.12)", borderRadius: "14px", background: "rgba(0,0,0,.35)", backdropFilter: "blur(8px)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, right: 0, height: "2px", background: "linear-gradient(to right,transparent,rgba(255,180,0,.5),transparent)", animation: "scan 2s linear infinite" }} />
            <div style={{ width: "44px", height: "44px", borderRadius: "50%", border: "2px solid rgba(255,180,0,.2)", borderTop: "2px solid rgba(255,200,60,.8)", animation: "spin-cw 1s linear infinite", margin: "0 auto 1rem" }} />
            <p style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: "1rem", color: "rgba(255,200,80,.7)", letterSpacing: ".1em" }}>{step}</p>
          </div>
        )}

        {/* ── REPORT ── */}
        {report && !loading && (
          <div className="card-in">

            {/* Token identity */}
            <div style={{ display: "flex", alignItems: "center", gap: "1.2rem", padding: "1.4rem 1.6rem", background: "rgba(0,0,0,.5)", border: "1px solid rgba(255,180,0,.18)", borderRadius: "14px", marginBottom: "1.2rem", flexWrap: "wrap" }}>
              {report.image && (
                <img src={report.image} alt={report.name} style={{ width: "56px", height: "56px", borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,180,0,.3)", flexShrink: 0 }} onError={(e) => e.target.style.display = "none"} />
              )}
              <div style={{ flex: 1, minWidth: "160px" }}>
                <h2 style={{ fontSize: "clamp(1rem,3vw,1.5rem)", fontWeight: 700, letterSpacing: ".12em", color: "#fff", marginBottom: ".2rem" }}>{report.name}</h2>
                <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: ".85rem", color: "rgba(255,200,80,.65)", letterSpacing: ".1em" }}>${report.symbol}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: ".42rem", letterSpacing: ".28em", color: "rgba(255,180,0,.42)", marginBottom: ".3rem" }}>CONTRACT</div>
                <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: ".82rem", color: "rgba(255,255,255,.5)" }}>{shortAddr(report.mint)}</div>
              </div>
            </div>

            {/* Score card */}
            <div style={{ background: "rgba(0,0,0,.55)", border: `2px solid ${report.gradeColor}44`, borderRadius: "14px", padding: "clamp(1.4rem,3vw,2.2rem)", marginBottom: "1.2rem", backdropFilter: "blur(10px)", textAlign: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 0%,${report.gradeColor}10,transparent 65%)`, pointerEvents: "none" }} />

              <div style={{ fontSize: ".48rem", letterSpacing: ".4em", color: "rgba(255,180,0,.48)", marginBottom: ".8rem" }}>SOLAR FREQUENCY SCORE</div>

              {/* Grade */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1.5rem", flexWrap: "wrap", marginBottom: "1.4rem" }}>
                <div style={{ fontSize: "clamp(3rem,12vw,6rem)", fontWeight: 900, color: report.gradeColor, lineHeight: 1, textShadow: `0 0 40px ${report.gradeColor}` }}>{report.grade}</div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: "clamp(1.4rem,5vw,2.4rem)", fontWeight: 700, color: report.gradeColor, letterSpacing: ".1em" }}>{report.score}/100</div>
                  <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: "clamp(.9rem,2.5vw,1.1rem)", color: report.gradeColor, letterSpacing: ".2em", fontWeight: 600 }}>{report.verdict}</div>
                </div>
              </div>

              {/* Score bar */}
              <div style={{ height: "6px", borderRadius: "3px", background: "rgba(255,255,255,.08)", overflow: "hidden", maxWidth: "420px", margin: "0 auto" }}>
                <div style={{ height: "100%", borderRadius: "3px", background: `linear-gradient(to right,${report.gradeColor},rgba(255,180,0,.4))`, width: `${report.score}%`, boxShadow: `0 0 10px ${report.gradeColor}`, animation: "bar-fill .9s cubic-bezier(.22,1,.36,1) forwards", "--w": `${report.score}%` }} />
              </div>
            </div>

            {/* Stats grid */}
            <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: ".75rem", marginBottom: "1.2rem" }}>
              {[
                { label: "PRICE", value: report.price ? fmtUsd(report.price) : "—" },
                { label: "MARKET CAP", value: report.marketCap ? fmtUsd(report.marketCap) : "—" },
                { label: "LIQUIDITY", value: report.liquidity ? fmtUsd(report.liquidity) : "—" },
                { label: "VOLUME 24H", value: report.volume24h ? fmtUsd(report.volume24h) : "—" },
                { label: "SUPPLY", value: fmtNum(report.supply) },
                { label: "HOLDERS", value: fmtNum(report.holderCount) },
                { label: "TOP HOLDER", value: report.topHolderPct ? `${report.topHolderPct.toFixed(1)}%` : "—" },
                { label: "LP BURNED", value: report.lpBurned ? "YES ✅" : "NO 🚨" },
              ].map((s) => (
                <div key={s.label} className="stat-box">
                  <div style={{ fontSize: ".38rem", letterSpacing: ".18em", color: "rgba(255,180,0,.45)", marginBottom: ".4rem" }}>{s.label}</div>
                  <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: "clamp(.85rem,2.5vw,1.05rem)", fontWeight: 600, color: "#fff" }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Flags */}
            {report.flags.length > 0 && (
              <div style={{ marginBottom: "1.2rem" }}>
                <div style={{ fontSize: ".44rem", letterSpacing: ".32em", color: "rgba(255,100,80,.65)", marginBottom: ".7rem" }}>⚡ RISK SIGNALS</div>
                {report.flags.map((f, i) => (
                  <div key={i} className="flag-row">
                    <span>{f.icon}</span>
                    <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: ".92rem", color: "rgba(255,200,180,.8)", letterSpacing: ".04em" }}>{f.text}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Good signals */}
            {report.goods.length > 0 && (
              <div style={{ marginBottom: "1.4rem" }}>
                <div style={{ fontSize: ".44rem", letterSpacing: ".32em", color: "rgba(80,255,160,.6)", marginBottom: ".7rem" }}>⊙ POSITIVE SIGNALS</div>
                {report.goods.map((g, i) => (
                  <div key={i} className="good-row">
                    <span>{g.icon}</span>
                    <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: ".92rem", color: "rgba(180,255,220,.8)", letterSpacing: ".04em" }}>{g.text}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: ".8rem", flexWrap: "wrap", justifyContent: "center", borderTop: "1px solid rgba(255,180,0,.1)", paddingTop: "1.2rem" }}>
              {report.dexUrl && (
                <a href={report.dexUrl} target="_blank" rel="noopener noreferrer"
                  style={{ textDecoration: "none" }}>
                  <button className="share-btn">📈 VIEW ON DEXSCREENER</button>
                </a>
              )}
              <button className="share-btn" onClick={() => {
                const text = `$${report.symbol} Report Card\nScore: ${report.score}/100 (${report.grade})\nVerdict: ${report.verdict}\n\nGenerated by $FLASH Protocol ⊙\nsolarflash.io`;
                navigator.clipboard.writeText(text).then(() => alert("Copied to clipboard!"));
              }}>
                📋 COPY REPORT
              </button>
              <a href={`https://t.me/SolarFlash_Sol`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <button className="share-btn">⚡ JOIN $FLASH</button>
              </a>
            </div>

            {/* Footer watermark */}
            <div style={{ textAlign: "center", marginTop: "1.4rem" }}>
              <span style={{ fontSize: ".42rem", letterSpacing: ".32em", color: "rgba(255,180,0,.22)" }}>
                POWERED BY $FLASH INFRASTRUCTURE ⊙ NOT FINANCIAL ADVICE
              </span>
            </div>
          </div>
        )}

        {/* ── EMPTY STATE ── */}
        {!report && !loading && (
          <div style={{ textAlign: "center", padding: "2.5rem 1rem", opacity: .45 }}>
            <div style={{ fontSize: "2.5rem", marginBottom: ".8rem" }}>⊙</div>
            <p style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: ".95rem", color: "rgba(255,255,255,.5)", letterSpacing: ".1em" }}>
              Enter a token address above to generate a full report
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
