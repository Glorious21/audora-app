import Backdrop from "./Backdrop";
import TopBar from "./TopBar";
import { BuiltOnBadge } from "./PartnerLockup";
import { Link, useRoute } from "../lib/router";
import { useSession } from "../lib/session";

const TABS = [
  { to: "/capture", label: "Capture" },
  { to: "/recall", label: "Recall" },
  { to: "/chat", label: "Ask Audora" },
  { to: "/proofs", label: "Proofs", count: true },
];

/**
 * Shared frame for the app pages: top bar, the page title with its tab row,
 * and the footer credit.
 */
export default function AppShell({ title, section, aside, children }) {
  const { health, captures } = useSession();
  const { path: raw } = useRoute();
  const path = raw === "/studio" ? "/capture" : raw;

  return (
    <div style={{ position: "relative", minHeight: "100dvh", background: "var(--bg)" }}>
      <Backdrop />
      <div style={{ position: "relative", zIndex: 1 }}>
        <TopBar health={health} section={section} />

        <div className="shell-title rise">
          <h1 style={{ fontSize: 48, lineHeight: 1 }}>{title}</h1>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 24, marginTop: 22, flexWrap: "wrap" }}>
            <nav aria-label="Studio pages" className="shell-tabs">
              {TABS.map((t) => {
                const active = path === t.to;
                return (
                  <Link
                    key={t.to}
                    to={t.to}
                    aria-current={active ? "page" : undefined}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "0 0 10px",
                      textDecoration: "none",
                      fontSize: 14,
                      fontWeight: active ? 600 : 500,
                      color: active ? "var(--ink)" : "var(--text-2)",
                      borderBottom: `2px solid ${active ? "var(--ink)" : "transparent"}`,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t.label}
                    {t.count && captures.length > 0 && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "1px 7px",
                          borderRadius: 999,
                          background: "var(--line)",
                          color: "var(--ink)",
                        }}
                      >
                        {captures.length}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
            <div style={{ flex: 1 }} />
            {aside && <div className="hide-sm" style={{ paddingBottom: 10 }}>{aside}</div>}
          </div>
        </div>

        <main className="shell-body">{children}</main>

        <footer className="shell-foot">
          <BuiltOnBadge />
          <span className="mono" style={{ fontSize: 12, color: "var(--text-3)" }}>
            {health?.namespace || "audora-demo"} · {captures.length}{" "}
            {captures.length === 1 ? "memory" : "memories"} this session
          </span>
        </footer>
      </div>

      <style>{`
        .shell-title { max-width: var(--maxw); margin: 0 auto; padding: 36px 28px 0; }
        .shell-tabs { display: flex; gap: 24px; border-bottom: 1px solid var(--line); overflow-x: auto; }
        .shell-body { max-width: var(--maxw); margin: 0 auto; padding: 28px 28px 40px; }
        .shell-foot { max-width: var(--maxw); margin: 0 auto; padding: 18px 28px 32px; display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between; border-top: 1px solid var(--line); }
        @media (max-width: 720px) {
          .shell-title { padding: 22px 16px 0; }
          .shell-title h1 { font-size: 36px !important; }
          .shell-body { padding: 18px 16px 120px; }
          .shell-foot { padding: 16px 16px 110px; }
        }
      `}</style>
    </div>
  );
}
