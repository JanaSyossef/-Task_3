// src/hooks/useIceCandidates.js
import { useEffect, useState } from "react";
import { gatherCandidates } from "../lib/gatherCandidates";

export function useIceCandidates(iceServers) {
  const [candidates, setCandidates] = useState([]);
  const [gatheringState, setGatheringState] = useState("new");
  const [elapsed, setElapsed] = useState(null);

  useEffect(() => {
    let active = true;

    setCandidates([]);
    setElapsed(null);
    setGatheringState("new");

    const start = performance.now();

    const timer = setInterval(() => {
      if (active) {
        setElapsed(Math.round(performance.now() - start));
      }
    }, 10);

    const stop = gatherCandidates({
      iceServers,

      onStateChange: (state) => {
        if (!active) return;
        setGatheringState(state);

        if (state === "complete") {
          clearInterval(timer);
          setElapsed(Math.round(performance.now() - start));
        }
      },

      onCandidate: (candidate) => {
        if (!active) return;
        setCandidates((prev) => [...prev, candidate]);
      },

      onDone: () => {
        if (!active) return;
        clearInterval(timer);
        setElapsed(Math.round(performance.now() - start));
      },
    });

    return () => {
      active = false;
      clearInterval(timer);
      stop();
    };
  }, [iceServers]);

  return { candidates, gatheringState, elapsed };
}