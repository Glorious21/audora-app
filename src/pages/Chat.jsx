import AppShell from "../components/AppShell";
import ChatPanel from "../components/ChatPanel";

export default function Chat() {
  return (
    <AppShell
      title={
        <>
          Ask <em>Audora</em>
        </>
      }
      section="Ask Audora"
      aside={
        <span style={{ fontSize: 13, color: "var(--text-2)" }}>Answers come only from your vault</span>
      }
    >
      <div style={{ maxWidth: 860 }}>
        <ChatPanel />
      </div>
    </AppShell>
  );
}
