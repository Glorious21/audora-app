import AppShell from "../components/AppShell";
import ProofsPanel from "../components/ProofsPanel";

export default function Proofs() {
  return (
    <AppShell
      title={
        <>
          On-chain <em>proofs</em>
        </>
      }
      section="Proofs"
    >
      <ProofsPanel />
    </AppShell>
  );
}
