import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { api, pollJob } from "../api";
import { useHealth } from "../components/HealthPill";
import { useRoute } from "./router";

/**
 * State shared by the Capture, Recall, Ask Audora and Proofs pages: theme,
 * relayer health, everything captured this session, and the 2-min demo.
 * Captures are kept in sessionStorage so moving between pages (or a reload)
 * doesn't lose the receipts.
 */
const SessionCtx = createContext(null);

const DEMO_SEED = [
  {
    title: "Third Mainland at 2AM",
    type: "beat",
    status: "rough",
    tags: "amapiano, nocturnal, log drum, vocal chop",
    bpm: "112",
    key: "G minor",
    location: "Ableton / 2026 / tml_2am_v3.als",
    notes:
      "Made this straight after the late session with Zinternet. The vocal chop on the hook is the whole idea — pitched her ad-lib up a fourth. Needs real drums.",
  },
  {
    title: "leaving lagos (verse scratch)",
    type: "lyrics",
    status: "idea",
    tags: "diaspora, homesick, bittersweet",
    location: "Notes app + voice memo 41",
    notes:
      "Verse about packing a life into two suitcases. 'I kept the noise, I left the address.' Want it over something sparse.",
  },
  {
    title: "dark piano trap sketch",
    type: "beat",
    status: "idea",
    tags: "trap, cinematic, minor piano, no drums",
    bpm: "140",
    key: "C# minor",
    location: "hard drive / sketches / march",
    notes: "Just a looped grand piano phrase from March. Villain-arc energy. Never added drums.",
  },
  {
    title: "car hum — chorus melody",
    type: "voice note",
    status: "idea",
    tags: "melody, catchy, driving",
    location: "phone voice memo, Aug 12",
    notes:
      "Hummed a full chorus melody at a red light on the way back from Dayo's. Da-da-DAAA, then it falls. Don't lose this one.",
  },
];

const read = (store, key, fallback) => {
  try {
    const v = store.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};
const write = (store, key, value) => {
  try {
    store.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — state still lives in memory */
  }
};

export function SessionProvider({ children }) {
  const { navigate } = useRoute();
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("audora-theme") === "dark" ? "dark" : "light";
    } catch {
      return "light";
    }
  });
  const [captures, setCaptures] = useState(() => read(sessionStorage, "audora-captures", []));
  const [pendingQuery, setPendingQuery] = useState(null);
  const [demoRunning, setDemoRunning] = useState(false);
  const [health, setHealth] = useState(null);
  useHealth(useCallback((h) => setHealth(h), []));

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("audora-theme", theme);
    } catch {
      /* private mode — theme still applies for this visit */
    }
  }, [theme]);

  useEffect(() => write(sessionStorage, "audora-captures", captures), [captures]);

  const onCaptured = useCallback((res) => {
    if (!res?.job_id) return;
    setCaptures((prev) => {
      const i = prev.findIndex((c) => c.job_id === res.job_id);
      if (i === -1) return [{ ...res }, ...prev];
      const next = [...prev];
      next[i] = { ...next[i], ...res };
      return next;
    });
  }, []);

  // Resume polling any receipts that were still finalizing before a reload.
  const lifetime = useRef(null);
  useEffect(() => {
    lifetime.current = new AbortController();
    const signal = lifetime.current.signal;
    for (const c of read(sessionStorage, "audora-captures", [])) {
      if (!c.finalized && c.status !== "failed") pollJob(c.job_id, { signal, onUpdate: onCaptured });
    }
    return () => lifetime.current.abort();
  }, [onCaptured]);

  const runDemo = useCallback(async () => {
    if (demoRunning) return;
    setDemoRunning(true);
    navigate("/recall");
    try {
      const signal = lifetime.current.signal;
      for (const seed of DEMO_SEED) {
        if (signal.aborted) return;
        try {
          const res = await api.capture({ ...seed, date: new Date().toISOString().slice(0, 10) }, signal);
          onCaptured(res);
          if (!res.finalized) pollJob(res.job_id, { signal, onUpdate: onCaptured });
        } catch (e) {
          if (!signal.aborted) console.warn("demo seed failed:", seed.title, e.message);
        }
      }
      setPendingQuery("the melody I hummed in the car on the drive home");
    } finally {
      setDemoRunning(false);
    }
  }, [demoRunning, navigate, onCaptured]);

  return (
    <SessionCtx.Provider
      value={{
        theme,
        setTheme,
        health,
        captures,
        onCaptured,
        pendingQuery,
        setPendingQuery,
        runDemo,
        demoRunning,
      }}
    >
      {children}
    </SessionCtx.Provider>
  );
}

export const useSession = () => useContext(SessionCtx);
