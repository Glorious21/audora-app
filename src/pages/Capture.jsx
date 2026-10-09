import AppShell from "../components/AppShell";
import CapturePanel from "../components/CapturePanel";
import SessionList from "../components/SessionList";
import { useRoute } from "../lib/router";
import { useSession } from "../lib/session";

export default function Capture() {
  const { captures, onCaptured, setPendingQuery } = useSession();
  const { navigate } = useRoute();

  const recall = (title) => {
    if (!title) return;
    setPendingQuery(title);
    navigate("/recall");
  };

  return (
    <AppShell
      title={
        <>
          Capture <em>an idea</em>
        </>
      }
      section="Capture"
      aside={<span style={{ fontSize: 13, color: "var(--text-2)" }}>Saved as one sentence on Walrus</span>}
    >
      <div className="capture-grid">
        <CapturePanel onCaptured={onCaptured} onRecall={recall} autoFocus />
        <SessionList captures={captures} onRecall={recall} />
      </div>
      <style>{`
        .capture-grid { display: grid; gap: 28px; align-items: start; grid-template-columns: minmax(0, 560px); }
        @media (min-width: 1000px) { .capture-grid { grid-template-columns: minmax(0, 560px) minmax(0, 360px); } }
      `}</style>
    </AppShell>
  );
}
