import Icon from "../components/Icon";
import SiteChrome, { CtaBlock, PROMPT_URL } from "../components/SiteChrome";

const FEATURES = [
  ["search", "Recall by meaning", "Find “the moody thing from that late session” without the title or the filename."],
  ["layers", "One shape for every idea", "Beats, lyrics, voice notes, concepts and drafts are stored the same way, so all of them can be found."],
  ["lock", "Encrypted on Walrus", "Memories are encrypted before they are stored. The key stays on the server, never in the browser."],
  ["receipt", "A receipt for every idea", "Each capture returns a job_id, then a blob_id once Walrus finalizes."],
  ["sparkle", "Works with your assistant", "Paste the Audora system prompt into any MCP client and it remembers for you."],
  ["check", "Nothing to maintain", "No tags to keep tidy, no naming rules, no database to run."],
];

const STACK = [
  ["Memory", "Walrus Memory"],
  ["Client", "@mysten-incubation/memwal"],
  ["Chain", "Sui mainnet"],
  ["App", "React · Vite · Express"],
];

export default function HowItWorks() {
  return (
    <SiteChrome>
      <section className="l-wrap" style={{ paddingTop: 72, paddingBottom: 24 }}>
        <div className="kicker rise">How it works</div>
        <h1 className="l-h1 rise" style={{ marginTop: 18, fontSize: "clamp(44px, 7vw, 72px)" }}>
          A vault that <em>understands what you meant</em>.
        </h1>
        <p className="rise" style={{ marginTop: 22, fontSize: 18, lineHeight: 1.55, color: "var(--text-2)", maxWidth: 600 }}>
          Every idea is saved as one structured sentence, so search can match it by meaning instead of by name.
        </p>
      </section>

      <section id="features" className="l-wrap l-section">
        <div className="l-grid3">
          {FEATURES.map(([icon, title, body]) => (
            <div key={title} className="card lift rise" style={{ padding: 24 }}>
              <span
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  background: "var(--wash)",
                  color: "var(--accent-strong)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Icon name={icon} size={18} />
              </span>
              <h3 style={{ fontSize: 16, fontWeight: 650, marginTop: 16 }}>{title}</h3>
              <p style={{ fontSize: 14.5, color: "var(--text-2)", marginTop: 6 }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="l-wrap l-section">
        <div className="card" style={{ padding: "28px 30px" }}>
          <div className="kicker">The stored sentence</div>
          <p className="mono" style={{ marginTop: 14, fontSize: 13.5, lineHeight: 1.7, color: "var(--ink)", overflowWrap: "anywhere" }}>
            {'{Type} — "{title}". Captured on {date}. Stage: {status}. Tags: {tags}. Tempo: {bpm}. Key: {key}. Where it lives: {location}. Context: {notes}.'}
          </p>
          <p style={{ marginTop: 14, fontSize: 14.5, color: "var(--text-2)" }}>
            Keeping one shape for every idea is what makes recall reliable. The same shape works in any assistant through the{" "}
            <a href={PROMPT_URL} target="_blank" rel="noreferrer" style={{ color: "var(--accent-strong)", fontWeight: 600 }}>
              Audora system prompt
            </a>
            .
          </p>
        </div>
      </section>

      <section id="stack" className="l-wrap l-section">
        <div className="card" style={{ padding: "28px 30px" }}>
          <h2 className="l-h2" style={{ fontSize: 36 }}>
            The <em>stack</em>
          </h2>
          <div className="l-stack" style={{ marginTop: 24 }}>
            {STACK.map(([k, v]) => (
              <div key={k} style={{ display: "grid", gap: 6 }}>
                <span className="label">{k}</span>
                <span className="mono" style={{ fontSize: 14, color: "var(--ink)", overflowWrap: "anywhere" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBlock />

      <style>{`
        .l-stack { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
        @media (max-width: 980px) { .l-stack { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 640px) { .l-stack { grid-template-columns: 1fr; } }
      `}</style>
    </SiteChrome>
  );
}
