import { useEffect, useRef } from "react";

import AppShell from "../components/AppShell";
import RecallPanel from "../components/RecallPanel";
import Icon from "../components/Icon";
import { Link } from "../lib/router";
import { useMedia } from "../lib/useMedia";

export default function Recall() {
  const mobile = useMedia("(max-width: 720px)");
  const searchRef = useRef(null);

  // "/" focuses recall from anywhere on the page.
  useEffect(() => {
    const onKey = (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable;
      if (e.key === "/" && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <AppShell
      title={
        <>
          Recall <em>by meaning</em>
        </>
      }
      section="Recall"
      aside={
        <span style={{ fontSize: 13, color: "var(--text-2)", display: "inline-flex", alignItems: "center", gap: 8 }}>
          Press <span className="kbd">/</span> to recall
        </span>
      }
    >
      <div style={{ maxWidth: 860 }}>
        <RecallPanel inputRef={searchRef} compact={mobile} />
      </div>
      {mobile && (
        <Link
          to="/capture"
          className="btn btn-ink"
          style={{
            position: "fixed",
            left: 16,
            right: 16,
            bottom: 24,
            zIndex: 40,
            padding: "15px 20px",
            fontSize: 15,
            boxShadow: "var(--shadow-lg)",
          }}
        >
          New memory <Icon name="plus" size={16} stroke={2.2} />
        </Link>
      )}
    </AppShell>
  );
}
