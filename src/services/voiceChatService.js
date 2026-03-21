import { voiceAPI } from "@/services/api";

export async function startVoiceSession(sessionId) {
  return voiceAPI.start(sessionId);
}

export async function endVoiceSession(sessionId) {
  return voiceAPI.end(sessionId);
}

export async function joinVoiceSession(sessionId, peerId = "") {
  return voiceAPI.join(sessionId, peerId);
}

export async function leaveVoiceSession(sessionId) {
  return voiceAPI.leave(sessionId);
}

export async function setVoiceMute(sessionId, isMuted) {
  return voiceAPI.mute(sessionId, isMuted);
}

export async function getVoiceStatus(sessionId) {
  return voiceAPI.status(sessionId);
}
