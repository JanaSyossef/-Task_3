// src/components/CandidatePanel.jsx
import { useState } from "react";
import { useIceCandidates } from "../hooks/useIceCandidates";

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

  // State 1: Configuration Selection
  const [configName, setConfigName] = useState("stun");
  const iceServers = CONFIGS[configName];

  // O5: Using the custom hook to handle candidate gathering, state, and timer cleanly
  const { candidates, gatheringState, elapsed } = useIceCandidates(iceServers);


  // ==================================================
  // 6. SORT CANDIDATES BY PRIORITY
  // ==================================================

  const sorted = [...candidates].sort(
    (a, b) => b.priority - a.priority
  );

  // O6: Separate candidates into UDP and TCP groups
  const udpCandidates = sorted.filter((c) => c.protocol?.toLowerCase() === "udp");
  const tcpCandidates = sorted.filter((c) => c.protocol?.toLowerCase() === "tcp");

  // Helper to render rows
  const renderRows = (list) =>
    list.map((c) => (
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
    ));


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

          {/* O6: UDP Candidates Group */}
          <tr>
            <th colSpan={5} style={{ textAlign: "left", background: "#e5e7eb", padding: "6px 8px", color: "#1f2937" }}>
              UDP Candidates ({udpCandidates.length})
            </th>
          </tr>
          {udpCandidates.length > 0 ? (
            renderRows(udpCandidates)
          ) : (
            <tr>
              <td colSpan={5}>Waiting for UDP candidates...</td>
            </tr>
          )}

          {/* O6: TCP Candidates Group */}
          <tr>
            <th colSpan={5} style={{ textAlign: "left", background: "#e5e7eb", padding: "6px 8px", color: "#1f2937" }}>
              TCP Candidates ({tcpCandidates.length})
            </th>
          </tr>
          {tcpCandidates.length > 0 ? (
            renderRows(tcpCandidates)
          ) : (
            <tr>
              <td colSpan={5}>No TCP candidates gathered.</td>
            </tr>
          )}

        </tbody>

      </table>

    </div>
  );
}