import Icon, { TYPE_ICON } from "./Icon";
import Copyable, { shortId } from "./Copyable";
import { stageLabel } from "./Stage";
import { Link } from "../lib/router";
import { useSession } from "../lib/session";

function Status({ c }) {
  const failed = c.status === "failed";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "var(--ink)", whiteSpace: "nowrap" }}>
      {c.finalized ? (
        <span style={{ color: "var(--green)" }}><Icon name="check" size={14} stroke={2.4} /></span>
      ) : (
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: failed ? "var(--accent)" : "var(--amber)" }} />
      )}
      {c.finalized ? "finalized" : failed ? "failed" : "finalizing"}
    </span>
  );
}

export default function ProofsPanel() {
  const { captures, health, runDemo, demoRunning } = useSession();
  const account = health?.account;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section className="card rise" style={{ padding: "20px 22px", display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
        <span
          style={{ width: 40, height: 40, borderRadius: 12, background: "var(--wash)", color: "var(--accent-strong)", display: "grid", placeItems: "center" }}
        >
          <Icon name="shield" size={19} />
        </span>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontSize: 15, fontWeight: 650 }}>Every capture leaves a receipt</div>
          <p style={{ fontSize: 13.5, color: "var(--text-2)", marginTop: 2 }}>
            The <span className="mono">job_id</span> comes back the moment the relayer accepts a memory. The{" "}
            <span className="mono">blob_id</span> follows once Walrus finalizes it, under your Sui account.
          </p>
        </div>
        {account && (
          <a
            href={`https://suiscan.xyz/mainnet/object/${account}`}
            target="_blank"
            rel="noreferrer"
            className="link-btn"
            style={{ textDecoration: "none" }}
          >
            View account on Suiscan <Icon name="arrowUpRight" size={13} stroke={2} />
          </a>
        )}
      </section>

      {captures.length === 0 ? (
        <section className="card rise" style={{ padding: "36px 28px" }}>
          <h2 style={{ fontSize: 34 }}>
            Nothing stored <em>this session</em> yet.
          </h2>
          <p style={{ marginTop: 10, fontSize: 14.5, color: "var(--text-2)" }}>
            Capture an idea and its receipt appears here.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
            <Link to="/capture" className="btn btn-ink">
              Capture an idea <Icon name="arrowRight" size={15} stroke={2.2} />
            </Link>
            <button type="button" className="btn btn-ghost" onClick={runDemo} disabled={demoRunning}>
              <Icon name="play" size={13} stroke={2} /> {demoRunning ? "Storing demo memories" : "Run 2-min demo"}
            </button>
          </div>
        </section>
      ) : (
        <section className="card rise" style={{ padding: "8px 22px" }} aria-label="Receipts">
          {captures.map((c, i) => {
            const f = c.fields || {};
            return (
              <div key={c.job_id} className="proof-row" style={{ borderTop: i ? "1px solid var(--line)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                  <span
                    style={{ width: 30, height: 30, borderRadius: 9, background: "var(--wash)", color: "var(--accent-strong)", display: "grid", placeItems: "center", flexShrink: 0 }}
                  >
                    <Icon name={TYPE_ICON[f.type] || "dot"} size={15} />
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 650, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {f.title || "Untitled"}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-2)" }}>
                      {stageLabel(f.type)} · {stageLabel(f.status)}
                    </div>
                  </div>
                </div>
                <div style={{ display: "grid", gap: 2, fontSize: 12 }}>
                  <span style={{ color: "var(--text-2)" }}>job_id</span>
                  <Copyable value={c.job_id} label="job id">{shortId(c.job_id, 8, 6)}</Copyable>
                </div>
                <div style={{ display: "grid", gap: 2, fontSize: 12 }}>
                  <span style={{ color: "var(--text-2)" }}>blob_id</span>
                  {c.blob_id ? (
                    <Copyable value={c.blob_id} label="blob id">{shortId(c.blob_id, 8, 6)}</Copyable>
                  ) : (
                    <span style={{ color: "var(--text-2)" }}>waiting for Walrus</span>
                  )}
                </div>
                <Status c={c} />
              </div>
            );
          })}
        </section>
      )}

      <section className="card rise" style={{ padding: "20px 22px" }} aria-label="Your vault">
        <h3 style={{ fontSize: 15, fontWeight: 650 }}>Your vault</h3>
        <div className="vault-grid">
          {[
            ["Sui account", account ? <Copyable value={account} label="Sui account">{shortId(account, 10, 6)}</Copyable> : "—"],
            ["Namespace", health?.namespace || "audora-demo"],
            ["Delegate key", "server-side"],
            ["Relayer", (health?.relayer || "https://relayer.memory.walrus.xyz").replace(/^https?:\/\//, "")],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "grid", gap: 4, minWidth: 0 }}>
              <span className="label">{k}</span>
              <span className="mono" style={{ fontSize: 13, color: "var(--ink)", overflowWrap: "anywhere" }}>{v}</span>
            </div>
          ))}
        </div>
      </section>

      <style>{`
        .proof-row { display: grid; grid-template-columns: minmax(0, 1.6fr) 1fr 1fr auto; gap: 20px; align-items: center; padding: 14px 0; }
        .vault-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 20px; margin-top: 14px; }
        @media (max-width: 720px) { .proof-row, .vault-grid { grid-template-columns: 1fr 1fr; } }
      `}</style>
    </div>
  );
}
