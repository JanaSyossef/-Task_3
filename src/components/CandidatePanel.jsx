
import { useEffect, useState } from "react";
import { gatherCandidates } from "../lib/gatherCandidates";

// ==================================================
// 1. STUN SERVER CONFIGURATIONS
// ==================================================

const CONFIGS = {
  none: [],
  stun: [
    { urls: "stun:stun.l.google.com:19302" },
  ],
  wrong: [
    { urls: "stun:stun.invalid.example:3478" },
  ],
};


// ==================================================
// 2. CANDIDATE COLORS
// ==================================================

const COLORS = {
  host: "#d5f0ec",
  srflx: "#fdecc8",
  relay: "#fbd9cf",
};


// ==================================================
// 3. REACT COMPONENT
// ==================================================

export default function CandidatePanel() {

  // State 1:
  const [configName, setConfigName] = useState("stun");

  // State 2:
  const [candidates, setCandidates] = useState([]);
  const [elapsed, setElapsed] = useState(null);
  const [gatheringState, setGatheringState] = useState("new");

  // لو configName = stun هيرجع Google STUN.
  // لو configName = none هيرجع Array فاضية.

  const iceServers = CONFIGS[configName];


  // ==================================================
  // 4. USE EFFECT - START GATHERING
  // ==================================================

  useEffect(() => {
    let active = true;

    setCandidates([]);
    setElapsed(null);
    setGatheringState("new");

    // تسجيل وقت بداية Gathering
    const start = performance.now();

    // Update timer every 10 milliseconds
    const timer = setInterval(() => {
      setElapsed(Math.round(performance.now() - start));
    }, 10);

    const stop = gatherCandidates({
      iceServers,

      onStateChange: (state) => {
        if (!active) return;

        setGatheringState(state);
      },

      onCandidate: (candidate) => {
        if (!active) return;

        setCandidates((prev) => [
          ...prev,
          candidate,
        ]);
      },

      onDone: () => {
        if (!active) return;

        clearInterval(timer);

        const end = performance.now();

        setElapsed(Math.round(end - start));
      },
    });

    return () => {
      active = false;
      clearInterval(timer);
      stop();
    };

  }, [iceServers]);


  // ==================================================
  // 6. SORT CANDIDATES BY PRIORITY
  // ==================================================

  const sorted = [...candidates].sort(
    (a, b) => b.priority - a.priority
  );


  // ==================================================
  // 7. RENDER THE USER INTERFACE
  // ==================================================

  return (

    <div style={{ padding: "24px" }}>

      <h1>ICE Candidate Panel</h1>


      {/* ==========================================
          STUN SERVER SELECTION
          ========================================== */}

      <select
        value={configName}
        onChange={(e) => setConfigName(e.target.value)}
      >

        <option value="none">No STUN</option>

        <option value="stun">Google STUN</option>

        <option value="wrong">Unreachable STUN</option>

      </select>

      <p>
        Gathering State: {gatheringState}
      </p>

      <p>
        Gathering Time:{" "}
        {elapsed !== null ? `${elapsed} ms` : "Calculating..."}
      </p>


      {/* ==========================================
          CANDIDATES TABLE
          ========================================== */}

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "20px",
        }}
      >

        <thead>
          <tr>
            <th>Type</th>
            <th>Protocol</th>
            <th>Address : Port</th>
            <th>Priority</th>
            <th>Foundation</th>
          </tr>
        </thead>

        <tbody>

          {sorted.map((c) => (

            <tr
              key={`${c.foundation}-${c.priority}-${c.address}-${c.port}`}

              style={{
                background: COLORS[c.type] ?? "white",
              }}
            >

              <td>{c.type}</td>

              <td>{c.protocol}</td>

              <td>
                {c.address}:{c.port}
              </td>

              <td>{c.priority}</td>

              <td>{c.foundation}</td>

            </tr>

          ))}

          {sorted.length === 0 && (

            <tr>
              <td colSpan={5}>
                Waiting for candidates...
              </td>
            </tr>

          )}

        </tbody>

      </table>

    </div>
  );
}
