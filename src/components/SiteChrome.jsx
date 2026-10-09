import Icon from "./Icon";
import AudoraLogo from "./AudoraLogo";
import Backdrop from "./Backdrop";
import { PartnerLockup } from "./PartnerLockup";
import { Link, useRoute } from "../lib/router";
import { useSession } from "../lib/session";

export const DEMO_URL = "https://youtu.be/Qw8WglkZTa8";
export const REPO_URL = "https://github.com/Glorious21/Audora";
export const PROMPT_URL = `${REPO_URL}/blob/main/prompts/audora.md`;

const NAV = [
  ["/how-it-works", "How it works"],
  ["/recall", "Recall"],
  ["/chat", "Ask Audora"],
];

function Header() {
  const { theme, setTheme } = useSession();
  const { path } = useRoute();
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
      <div className="l-wrap" style={{ display: "flex", alignItems: "center", gap: 28, paddingTop: 14, paddingBottom: 14 }}>
        <Link to="/" style={{ textDecoration: "none" }} aria-label="Audora home">
          <AudoraLogo size={30} wordSize={21} />
        </Link>
        <nav className="l-nav" style={{ display: "flex", gap: 24 }}>
          {NAV.map(([to, label]) => (
            <Link key={to} to={to} aria-current={path === to ? "page" : undefined}>
              {label}
            </Link>
          ))}
        </nav>
        <div style={{ flex: 1 }} />
        <button
          type="button"
          className="icon-btn"
          aria-label={`Switch to ${dark ? "light" : "dark"} theme`}
          onClick={() => setTheme(dark ? "light" : "dark")}
        >
          <Icon name={dark ? "sun" : "moon"} size={16} />
        </button>
        <Link to="/capture" className="btn btn-ink" style={{ padding: "9px 18px", fontSize: 13.5 }}>
          Launch Studio
        </Link>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer
      className="l-wrap"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20,
        flexWrap: "wrap",
        paddingTop: 28,
        paddingBottom: 40,
        borderTop: "1px solid var(--line)",
      }}
    >
      <PartnerLockup height={32} />
      <nav className="l-foot" style={{ display: "flex", gap: 8, fontSize: 13, color: "var(--text-2)", flexWrap: "wrap" }}>
        <a href={REPO_URL} target="_blank" rel="noreferrer">GitHub</a>
        <span aria-hidden>·</span>
        <a href={PROMPT_URL} target="_blank" rel="noreferrer">System prompt</a>
        <span aria-hidden>·</span>
        <span>© 2026 Audora</span>
      </nav>
    </footer>
  );
}

/** Ink call-to-action block that closes each marketing page. */
export function CtaBlock() {
  return (
    <section className="l-wrap l-section">
      <div className="l-cta" style={{ background: "#141414", color: "#F4F2EE", borderRadius: 24 }}>
        <h2 className="l-cta-h" style={{ color: "#F4F2EE" }}>
          Stop losing <em style={{ color: "#FF6B47" }}>the good ideas</em>.
        </h2>
        <p style={{ marginTop: 18, fontSize: 17, color: "#B9B6B0", maxWidth: 520 }}>
          No tags to maintain, no naming rules, no database to run. Just say what you remember.
        </p>
        <div style={{ marginTop: 30 }}>
          <Link to="/capture" className="btn" style={{ background: "#FF6B47", color: "#141414", padding: "13px 24px", fontSize: 15 }}>
            Launch Studio <Icon name="arrowRight" size={16} stroke={2.2} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/** Frame for the marketing pages (home, how it works). */
export default function SiteChrome({ children }) {
  return (
    <div style={{ position: "relative", minHeight: "100dvh", background: "var(--bg)" }}>
      <Backdrop />
      <div style={{ position: "relative", zIndex: 1 }}>
        <Header />
        <main>{children}</main>
        <Footer />
      </div>
      <style>{`
        .l-wrap { max-width: var(--maxw); margin: 0 auto; padding-left: 28px; padding-right: 28px; }
        .l-nav a, .l-foot a { color: var(--text-2); text-decoration: none; font-size: 14px; }
        .l-nav a:hover, .l-foot a:hover, .l-nav a[aria-current="page"] { color: var(--ink); }
        .l-h1 { font-size: 80px; line-height: 1; }
        .l-h2 { font-size: 52px; line-height: 1.05; max-width: 820px; }
        .l-section { padding-top: 56px; padding-bottom: 56px; }
        .l-grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .l-cta { padding: 64px 48px; }
        .l-cta-h { font-size: 64px; line-height: 1; }
        @media (max-width: 980px) {
          .l-h1 { font-size: 60px; }
          .l-grid3 { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 640px) {
          .l-wrap { padding-left: 16px; padding-right: 16px; }
          .l-nav { display: none !important; }
          .l-h1 { font-size: 44px; }
          .l-h2 { font-size: 34px; }
          .l-grid3 { grid-template-columns: 1fr; }
          .l-cta { padding: 40px 24px; }
          .l-cta-h { font-size: 40px; }
          .l-section { padding-top: 40px; padding-bottom: 40px; }
        }
      `}</style>
    </div>
  );
}
