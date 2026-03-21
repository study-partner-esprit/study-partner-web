import { useCallback, useEffect, useRef, useState } from "react";
import { createPeerConnection, defaultIceServers } from "@/services/webrtcService";

const WS_BASE =
  import.meta.env.VITE_WS_URL ||
  `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.hostname}:3007`;

export default function useWebRTC({ sessionId, userId, localStream, enabled }) {
  const wsRef = useRef(null);
  const peersRef = useRef(new Map());
  const remoteAudioRef = useRef(new Map());

  const [connected, setConnected] = useState(false);
  const [participants, setParticipants] = useState([]);

  const addParticipant = useCallback((participantId) => {
    setParticipants((prev) => (prev.includes(participantId) ? prev : [...prev, participantId]));
  }, []);

  const removeParticipant = useCallback((participantId) => {
    setParticipants((prev) => prev.filter((id) => id !== participantId));
    const peer = peersRef.current.get(participantId);
    if (peer) {
      peer.close();
      peersRef.current.delete(participantId);
    }

    const audio = remoteAudioRef.current.get(participantId);
    if (audio) {
      audio.pause();
      audio.srcObject = null;
      remoteAudioRef.current.delete(participantId);
    }
  }, []);

  const sendSignal = useCallback((signalType, signal, targetUserId = null) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    ws.send(
      JSON.stringify({
        type: "voice_signal",
        signalType,
        signal,
        targetUserId,
      }),
    );
  }, []);

  const createOrGetPeer = useCallback(
    (peerUserId) => {
      if (peersRef.current.has(peerUserId)) return peersRef.current.get(peerUserId);

      const peer = createPeerConnection({
        iceServers: defaultIceServers,
        onIceCandidate: (candidate) => {
          sendSignal("ice-candidate", candidate, peerUserId);
        },
        onTrack: (stream) => {
          let audio = remoteAudioRef.current.get(peerUserId);
          if (!audio) {
            audio = new Audio();
            audio.autoplay = true;
            remoteAudioRef.current.set(peerUserId, audio);
          }
          audio.srcObject = stream;
        },
      });

      if (localStream) {
        localStream.getTracks().forEach((track) => peer.addTrack(track, localStream));
      }

      peersRef.current.set(peerUserId, peer);
      return peer;
    },
    [localStream, sendSignal],
  );

  const createOfferTo = useCallback(
    async (peerUserId) => {
      if (!localStream || peerUserId === userId) return;
      const peer = createOrGetPeer(peerUserId);
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      sendSignal("offer", offer, peerUserId);
    },
    [createOrGetPeer, localStream, sendSignal, userId],
  );

  useEffect(() => {
    if (!enabled || !sessionId || !userId || !localStream) return undefined;

    const ws = new WebSocket(`${WS_BASE}/ws/realtime?sessionId=${sessionId}&userId=${userId}`);
    const peers = peersRef.current;
    const remoteAudios = remoteAudioRef.current;
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
    };

    ws.onclose = () => {
      setConnected(false);
      wsRef.current = null;
    };

    ws.onmessage = async (event) => {
      let payload = null;
      try {
        payload = JSON.parse(event.data);
      } catch {
        return;
      }

      if (payload.type === "participant_joined") {
        const peerUserId = payload.userId;
        if (peerUserId === userId) return;
        addParticipant(peerUserId);
        await createOfferTo(peerUserId);
        return;
      }

      if (payload.type === "participant_left") {
        removeParticipant(payload.userId);
        return;
      }

      if (payload.type !== "voice_signal") return;

      if (payload.targetUserId && payload.targetUserId !== userId) return;
      if (payload.fromUserId === userId) return;

      const peerUserId = payload.fromUserId;
      addParticipant(peerUserId);
      const peer = createOrGetPeer(peerUserId);

      if (payload.signalType === "offer") {
        await peer.setRemoteDescription(new RTCSessionDescription(payload.signal));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        sendSignal("answer", answer, peerUserId);
        return;
      }

      if (payload.signalType === "answer") {
        await peer.setRemoteDescription(new RTCSessionDescription(payload.signal));
        return;
      }

      if (payload.signalType === "ice-candidate" && payload.signal) {
        await peer.addIceCandidate(new RTCIceCandidate(payload.signal));
      }
    };

    return () => {
      ws.close();
      peers.forEach((peer) => peer.close());
      peers.clear();
      remoteAudios.forEach((audio) => {
        audio.pause();
        audio.srcObject = null;
      });
      remoteAudios.clear();
      setParticipants([]);
    };
  }, [enabled, sessionId, userId, localStream, addParticipant, removeParticipant, createOrGetPeer, createOfferTo, sendSignal]);

  const sendMute = useCallback((isMuted) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: "voice_mute", isMuted }));
  }, []);

  const sendSpeaking = useCallback((speakingStatus) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: "voice_speaking", speakingStatus }));
  }, []);

  return {
    connected,
    participants,
    sendMute,
    sendSpeaking,
  };
}
