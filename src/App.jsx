import { RouterProvider, useRoute } from "./lib/router";
import { SessionProvider } from "./lib/session";
import Landing from "./pages/Landing";
import HowItWorks from "./pages/HowItWorks";
import Capture from "./pages/Capture";
import Recall from "./pages/Recall";
import Chat from "./pages/Chat";
import Proofs from "./pages/Proofs";

const PAGES = {
  "/how-it-works": HowItWorks,
  "/capture": Capture,
  "/studio": Capture,
  "/recall": Recall,
  "/chat": Chat,
  "/proofs": Proofs,
};

function Routes() {
  const { path } = useRoute();
  const clean = path.replace(/\/+$/, "") || "/";
  const Page = PAGES[clean] || Landing;
  return <Page />;
}

export default function App() {
  return (
    <RouterProvider>
      <SessionProvider>
        <Routes />
      </SessionProvider>
    </RouterProvider>
  );
}
