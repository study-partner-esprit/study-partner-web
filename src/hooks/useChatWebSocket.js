import { useCallback, useEffect, useRef, useState } from "react";

const WS_BASE =
  import.meta.env.VITE_WS_URL ||
  `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.hostname}:3007`;

export default function useChatWebSocket({ sessionId, userId, onMessage }) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!sessionId || !userId) return undefined;

    const ws = new WebSocket(`${WS_BASE}/ws/realtime?sessionId=${sessionId}&userId=${userId}`);
    socketRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
    };

    ws.onclose = () => {
      setConnected(false);
      socketRef.current = null;
    };

    ws.onerror = () => {
      setConnected(false);
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (onMessage) onMessage(payload);
      } catch {
        // Ignore malformed payloads.
      }
    };

    return () => {
      ws.close();
    };
  }, [sessionId, userId, onMessage]);

  const send = useCallback((payload) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return false;
    }
    socketRef.current.send(JSON.stringify(payload));
    return true;
  }, []);

  const sendChatQuery = useCallback(
    (query) => {
      return send({ type: "chat_query", query });
    },
    [send],
  );

  return {
    connected,
    send,
    sendChatQuery,
  };
}
