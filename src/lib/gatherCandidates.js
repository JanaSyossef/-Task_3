export function gatherCandidates({
  iceServers,
  onCandidate,
  onDone,
  onStateChange,
}) {
  const pc = new RTCPeerConnection({ iceServers });

  // Create a data channel
  pc.createDataChannel("probe");

  // Listen for gathering state changes
  pc.onicegatheringstatechange = () => {
    onStateChange?.(pc.iceGatheringState);
  };

  // Receive ICE candidates
  pc.onicecandidate = (e) => {
    if (pc.signalingState === "closed") return;

    if (e.candidate) {
      onCandidate(e.candidate);
    } else {
      onDone();
    }
  };

  // Create offer and set local description
  pc.createOffer()
    .then((offer) => {
      if (pc.signalingState !== "closed") {
        return pc.setLocalDescription(offer);
      }
    })
    .catch((error) => {
      console.error("Error gathering candidates:", error);

      if (pc.signalingState !== "closed") {
        onDone();
      }
    });

  // Return cleanup function
  return () => {
    if (pc.signalingState !== "closed") {
      pc.close();
    }
  };
}

// O8: Parse raw SDP candidate string with a regular expression
export function parseCandidateString(candidateStr) {
  const regex =
    /^candidate:(\S+)\s+(\d+)\s+(udp|tcp)\s+(\d+)\s+(\S+)\s+(\d+)\s+typ\s+(\S+)/i;
  const match = candidateStr.match(regex);

  if (!match) return null;

  return {
    foundation: match[1],
    componentId: Number(match[2]),
    protocol: match[3].toLowerCase(),
    priority: Number(match[4]),
    address: match[5],
    port: Number(match[6]),
    type: match[7].toLowerCase(),
  };
}