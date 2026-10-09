import { motion } from "framer-motion";
import Icon from "./Icon";
import Copyable, { shortId } from "./Copyable";

/** 116px wax-seal, rotated −12°. Dashed and quiet while pending, solid accent once sealed. */
function Seal({ done }) {
  const text = done ? "SEALED ON WALRUS · SUI MAINNET · " : "FINALIZING ON WALRUS · HOLD ON · ";
  const id = done ? "seal-done" : "seal-pending";
  const ink = done ? "#fff" : "var(--text-2)";
  return (
    <motion.svg
      key={id}
      width="116"
      height="116"
      viewBox="0 0 116 116"
      aria-hidden
      initial={done ? { scale: 1.15, rotate: -20, opacity: 0 } : false}
      animate={{ scale: 1, rotate: -12, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{ flexShrink: 0, rotate: -12 }}
    >
      <defs>
        <path id={id} d="M58 58m-41 0a41 41 0 1 1 82 0a41 41 0 1 1 -82 0" />
      </defs>
      <circle
        cx="58"
        cy="58"
        r="54"
        fill={done ? "var(--accent-strong)" : "none"}
        stroke={done ? "var(--accent-strong)" : "var(--line-strong)"}
        strokeWidth="2"
        strokeDasharray={done ? undefined : "4 4"}
      />
      <circle cx="58" cy="58" r="33" fill="none" stroke={done ? "rgba(255,255,255,.6)" : "var(--line-strong)"} strokeWidth="1.25" />
      <text fontFamily="var(--font-mono)" fontSize="9" letterSpacing="1.4" fill={ink}>
        <textPath href={`#${id}`}>{text}{text}</textPath>
      </text>
      {done ? (
        <path d="M45 58l9 9 18-19" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        [46, 58, 70].map((x, i) => (
          <motion.circle
            key={x}
            cx={x}
            cy="58"
            r="3"
            fill="var(--text-2)"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))
      )}
    </motion.svg>
  );
}

function Row({ label, value, state }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "64px 1fr auto",
        alignItems: "center",
        gap: 12,
        padding: "11px 0",
        borderTop: "1px solid var(--line)",
        fontSize: 13,
      }}
    >
      <span className="mono" style={{ color: "var(--text-2)", fontSize: 12 }}>{label}</span>
      <span style={{ minWidth: 0 }}>
        {value ? (
          <Copyable value={value} label={label}>{shortId(value, 12, 6)}</Copyable>
        ) : (
          <span style={{ color: "var(--text-2)" }}>waiting for Walrus</span>
        )}
      </span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--ink)" }}>
        {state === "pending" ? (
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--amber)" }} />
        ) : (
          <span style={{ color: "var(--green)" }}><Icon name="check" size={14} stroke={2.4} /></span>
        )}
        {state}
      </span>
    </div>
  );
}

export default function StoredReceipt({ result, onRecall, onAnother }) {
  const done = !!result.finalized;
  const failed = result.status === "failed";
  const title = result.fields?.title || "your memory";

  return (
    <div className="rise" style={{ display: "grid", gap: 18 }} aria-live="polite">
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ minWidth: 0 }}>
          <div className="kicker">{done ? "Stored" : failed ? "Not stored" : "Storing"}</div>
          <h2 style={{ fontSize: 30, marginTop: 8, lineHeight: 1.1 }}>
            {done ? (
              <>
                {title} is <em>on Walrus</em>.
              </>
            ) : failed ? (
              <>
                Walrus <em>didn't take it</em>.
              </>
            ) : (
              <>
                Writing <em>{title}</em> to Walrus
              </>
            )}
          </h2>
          <p style={{ marginTop: 10, fontSize: 14, color: "var(--text-2)" }}>
            {done
              ? "Encrypted and finalized. Describe it any way you like and it will come back."
              : failed
                ? result.error || "The relayer reported a failure. Try storing it again."
                : "The relayer has it. Walrus is finalizing the blob, which usually takes a few seconds."}
          </p>
        </div>
        <Seal done={done} />
      </div>

      <div>
        <Row label="job_id" value={result.job_id} state="written" />
        <div style={{ borderBottom: "1px solid var(--line)" }}>
          <Row label="blob_id" value={result.blob_id} state={done ? "finalized" : "pending"} />
        </div>
      </div>

      {!done && !failed && (
        <div style={{ height: 4, borderRadius: 999, background: "var(--line)", overflow: "hidden" }}>
          <motion.div
            style={{ height: "100%", width: "40%", borderRadius: 999, background: "var(--accent)" }}
            animate={{ x: ["-100%", "250%"] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {done && (
          <button type="button" className="btn btn-ghost" onClick={() => onRecall?.(title)}>
            Recall it
          </button>
        )}
        <button type="button" className="btn btn-ink" onClick={onAnother} style={{ flex: done ? undefined : 1 }}>
          Capture another <Icon name="plus" size={14} stroke={2.2} />
        </button>
      </div>
    </div>
  );
}
