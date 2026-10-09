import Icon from "../components/Icon";
import { BuiltOnBadge } from "../components/PartnerLockup";
import SiteChrome, { CtaBlock, DEMO_URL } from "../components/SiteChrome";
import { Link } from "../lib/router";

const STEPS = [
  ["01", "Capture", "Jot the title, the type, the stage and the story while it is fresh. One shape for every idea.", "/capture"],
  ["02", "Store", "Audora writes it as one sentence to Walrus Memory. It is encrypted on Walrus, with a receipt you can check.", "/proofs"],
  ["03", "Recall", "Describe it the way you remember it. Results come back ranked by meaning, with everything you wrote.", "/recall"],
];

function IndexCard() {
  return (
    <div
      aria-label="Example stored memory"
      style={{
        background: "#141414",
        color: "#F4F2EE",
        borderRadius: 18,
        padding: "26px 26px 22px",
        boxShadow: "var(--shadow-lg)",
        transform: "rotate(1.5deg)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <span className="kicker" style={{ color: "#FF6B47" }}>Stored memory</span>
        <span style={{ fontSize: 12, color: "#B9B6B0" }}>3 days ago</span>
      </div>
      <p className="mono" style={{ marginTop: 16, fontSize: 13.5, lineHeight: 1.7 }}>
        Beat — "Low Tide". Stage: rough. Tags: amapiano, vocal chop, late night. Tempo: 113 BPM. Key: F minor. Where it
        lives: ~/Ableton/2026/lowtide_v3.als. Context: Chopped Maya's vocal from the 2 a.m. session.
      </p>
      <div
        className="mono"
        style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid #2A2A2A", display: "grid", gap: 4, fontSize: 11.5, color: "#B9B6B0" }}
      >
        <span>job_id&nbsp;&nbsp;job_8f3a21…c07e</span>
        <span>blob_id kX9a7Lw…Qe2w</span>
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <SiteChrome>
      <section className="l-wrap l-hero">
        <div className="rise">
          <div className="kicker">Memory for creative work</div>
          <h1 className="l-h1" style={{ marginTop: 18 }}>
            A memory for <em>everything you make</em>.
          </h1>
          <p style={{ marginTop: 22, fontSize: 18, lineHeight: 1.55, color: "var(--text-2)", maxWidth: 540 }}>
            Capture the context around an idea and find it again later by describing it in plain language. Each idea is
            stored as one sentence in Walrus Memory, encrypted on Walrus.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 30, flexWrap: "wrap" }}>
            <Link to="/capture" className="btn btn-ink" style={{ padding: "13px 24px", fontSize: 15 }}>
              Launch Studio <Icon name="arrowRight" size={16} stroke={2.2} />
            </Link>
            <a href={DEMO_URL} target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ padding: "13px 24px", fontSize: 15 }}>
              <Icon name="play" size={14} stroke={2} /> Watch the 2-min demo
            </a>
          </div>
          <div style={{ marginTop: 26 }}>
            <BuiltOnBadge />
          </div>
        </div>
        <div className="rise" style={{ animationDelay: "80ms" }}>
          <IndexCard />
        </div>
      </section>

      <section className="l-wrap l-section">
        <h2 className="l-h2">
          Capture once. <em>Recall the way you think.</em>
        </h2>
        <div className="l-grid3" style={{ marginTop: 40 }}>
          {STEPS.map(([n, title, body, to]) => (
            <Link key={n} to={to} className="card lift" style={{ padding: 26, textDecoration: "none", display: "block" }}>
              <div className="display" style={{ fontSize: 34, fontStyle: "italic", color: "var(--accent)" }}>{n}</div>
              <h3 style={{ fontSize: 18, fontWeight: 650, marginTop: 14 }}>{title}</h3>
              <p style={{ fontSize: 14.5, color: "var(--text-2)", marginTop: 6 }}>{body}</p>
            </Link>
          ))}
        </div>
        <div style={{ marginTop: 28 }}>
          <Link to="/how-it-works" className="link-btn" style={{ fontSize: 14, textDecoration: "none" }}>
            See how it works <Icon name="arrowRight" size={14} stroke={2} />
          </Link>
        </div>
      </section>

      <CtaBlock />

      <style>{`
        .l-hero { display: grid; grid-template-columns: 7fr 5fr; gap: 48px; align-items: center; padding-top: 88px; padding-bottom: 80px; }
        @media (max-width: 980px) { .l-hero { grid-template-columns: 1fr; padding-top: 56px; } }
      `}</style>
    </SiteChrome>
  );
}
