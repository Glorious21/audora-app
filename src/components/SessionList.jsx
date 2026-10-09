import Icon, { TYPE_ICON } from "./Icon";
import { stageLabel } from "./Stage";

/** "This session" — what's been stored so far, each a one-click recall. */
export default function SessionList({ captures, onRecall }) {
  if (!captures.length) return null;
  return (
    <section className="card rise" style={{ padding: 22 }} aria-label="This session">
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <h3 style={{ fontSize: 15, fontWeight: 650 }}>This session</h3>
        <span style={{ fontSize: 12, color: "var(--text-2)" }}>{captures.length} stored</span>
      </div>
      <div style={{ display: "grid", marginTop: 8 }}>
        {captures.map((c, i) => {
          const f = c.fields || {};
          return (
            <div
              key={c.job_id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 0",
                borderTop: i ? "1px solid var(--line)" : "none",
              }}
            >
              <span
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 9,
                  background: "var(--wash)",
                  color: "var(--accent-strong)",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <Icon name={TYPE_ICON[f.type] || "dot"} size={15} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 650, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {f.title || "Untitled"}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-2)" }}>
                  {stageLabel(f.type)} · {stageLabel(f.status)}
                  {!c.finalized && " · finalizing"}
                </div>
              </div>
              <button type="button" className="link-btn" onClick={() => onRecall?.(f.title)}>
                recall this <Icon name="arrowUpRight" size={13} stroke={2} />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
