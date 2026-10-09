import { useEffect, useState } from "react";
import { api } from "../api";

/** Map an /api/health response (or failure) to online | read-only | offline. */
export function healthState(h) {
  if (!h || h.loading) return "connecting";
  if (!h.ok) return "offline";
  return h.writeReady === false ? "read-only" : "online";
}

const DOT = {
  connecting: "var(--line-strong)",
  online: "var(--green)",
  "read-only": "var(--amber)",
  offline: "var(--accent)",
};
const LABEL = {
  connecting: "Connecting",
  online: "Relayer online",
  "read-only": "Relayer read-only",
  offline: "Relayer offline",
};
const SHORT = { connecting: "Connecting", online: "Online", "read-only": "Read-only", offline: "Offline" };

/** Polls relayer health every 15s and reports it upward. */
export function useHealth(onData) {
  const [h, setH] = useState({ loading: true });
  useEffect(() => {
    let alive = true;
    const check = () =>
      api
        .health()
        .then((r) => {
          if (!alive) return;
          setH(r);
          onData?.(r);
        })
        .catch((e) => {
          if (!alive) return;
          const r = { ok: false, error: e.message };
          setH(r);
          onData?.(r);
        });
    check();
    const t = setInterval(check, 15000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [onData]);
  return h;
}

/** Status pill: surface, 1px line, 8px dot; the label stays ink. */
export default function HealthPill({ health, compact = false }) {
  const s = healthState(health);
  return (
    <span
      title={health?.error || (health?.namespace ? `namespace ${health.namespace}` : "")}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 12px",
        borderRadius: 999,
        border: "1px solid var(--line)",
        background: "var(--surface)",
        fontSize: 12.5,
        fontWeight: 500,
        color: "var(--ink)",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: DOT[s] }} />
      {compact ? SHORT[s] : LABEL[s]}
    </span>
  );
}
