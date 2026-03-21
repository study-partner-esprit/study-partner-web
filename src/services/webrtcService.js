export function createPeerConnection({ iceServers, onIceCandidate, onTrack }) {
  const peer = new RTCPeerConnection({ iceServers });

  peer.onicecandidate = (event) => {
    if (event.candidate && onIceCandidate) {
      onIceCandidate(event.candidate);
    }
  };

  peer.ontrack = (event) => {
    if (onTrack) onTrack(event.streams[0]);
  };

  return peer;
}

export const defaultIceServers = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
];
