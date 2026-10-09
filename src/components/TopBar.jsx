import Icon from "./Icon";
import HealthPill from "./HealthPill";
import AudoraLogo from "./AudoraLogo";
import { Link } from "../lib/router";
import { useSession } from "../lib/session";

export default function TopBar({ health, section = "Studio" }) {
  const { theme, setTheme, runDemo, demoRunning } = useSession();
  const dark = theme === "dark";
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        background: "color-mix(in srgb, var(--bg) 88%, transparent)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <div className="topbar">
        <Link to="/" style={{ textDecoration: "none", flexShrink: 0 }} aria-label="Audora home">
          <AudoraLogo size={30} wordSize={21} />
        </Link>
        <span
          className="hide-sm"
          style={{
            padding: "4px 11px",
            borderRadius: 999,
            background: "var(--wash)",
            color: "var(--accent-strong)",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {section}
        </span>
        <div style={{ flex: 1 }} />
        <span className="hide-sm"><HealthPill health={health} /></span>
        <span className="show-sm"><HealthPill health={health} compact /></span>
        <button
          type="button"
          onClick={runDemo}
          disabled={demoRunning}
          className="btn btn-ghost hide-sm"
          style={{ padding: "8px 15px", fontSize: 13 }}
        >
          <Icon name="play" size={13} stroke={2} />
          {demoRunning ? "Storing demo memories" : "Run 2-min demo"}
        </button>
        <button
          type="button"
          className="icon-btn"
          aria-label={`Switch to ${dark ? "light" : "dark"} theme`}
          onClick={() => setTheme(dark ? "light" : "dark")}
        >
          <Icon name={dark ? "sun" : "moon"} size={16} />
        </button>
      </div>
      <style>{`
        .topbar { max-width: var(--maxw); margin: 0 auto; padding: 14px 28px; display: flex; align-items: center; gap: 12px; }
        .show-sm { display: none; }
        @media (max-width: 720px) {
          .topbar { padding: 12px 16px; }
          .hide-sm { display: none !important; }
          .show-sm { display: inline-flex; }
        }
      `}</style>
    </header>
  );
}
