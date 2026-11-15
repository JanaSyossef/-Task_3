
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
