import { useCallback, useMemo, useState } from "react";
import useChatWebSocket from "@/hooks/useChatWebSocket";
import { sessionChatAPI } from "@/services/api";

export default function useSessionChat({ sessionId, userId }) {
  const [messages, setMessages] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onSocketMessage = useCallback((payload) => {
    if (payload.type === "chat_query") {
      setMessages((prev) => [
        {
          _id: `query-${payload.userId}-${payload.createdAt}`,
          messageType: "query",
          userId: payload.userId,
          content: payload.query,
          searchQuery: payload.query,
          createdAt: payload.createdAt,
        },
        ...prev,
      ]);
      return;
    }

    if (payload.type === "chat_result") {
      setMessages((prev) => [
        {
          _id:
            payload.messageId ||
            `result-${payload.userId}-${payload.createdAt}`,
          messageType: "result",
          userId: payload.userId,
          content: payload.answer,
          searchQuery: payload.question,
          searchResults: payload.results || [],
          createdAt: payload.createdAt,
        },
        ...prev,
      ]);
      setSubmitting(false);
      return;
    }

    if (payload.type === "chat_error") {
      setError(payload.error || "Search failed");
      setSubmitting(false);
    }
  }, []);

  const { connected, sendChatQuery } = useChatWebSocket({
    sessionId,
    userId,
    onMessage: onSocketMessage,
  });

  const loadHistory = useCallback(async () => {
    if (!sessionId) return;
    setLoadingHistory(true);
    setError("");

    try {
      const response = await sessionChatAPI.getHistory(sessionId, {
        limit: 100,
      });
      setMessages(response.data?.items || []);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load chat history");
    } finally {
      setLoadingHistory(false);
    }
  }, [sessionId]);

  const submitQuery = useCallback(
    async (query) => {
      const normalized = (query || "").trim();
      if (!normalized) return;

      setSubmitting(true);
      setError("");

      const sentViaWs = sendChatQuery(normalized);
      if (sentViaWs) {
        return;
      }

      try {
        const response = await sessionChatAPI.query(sessionId, normalized);
        const result = response.data;
        setMessages((prev) => [
          {
            _id: result.messageId,
            messageType: "result",
            userId,
            content: result.answer,
            searchQuery: result.question,
            searchResults: result.results || [],
            createdAt: result.createdAt,
          },
          ...prev,
        ]);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to process search query");
      } finally {
        setSubmitting(false);
      }
    },
    [sendChatQuery, sessionId, userId],
  );

  const sortedMessages = useMemo(
    () =>
      [...messages].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      ),
    [messages],
  );

  return {
    connected,
    messages: sortedMessages,
    loadingHistory,
    submitting,
    error,
    loadHistory,
    submitQuery,
  };
}
