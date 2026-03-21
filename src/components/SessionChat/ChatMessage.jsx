import React from "react";
import SearchResult from "./SearchResult";

export default function ChatMessage({ message, currentUserId }) {
  const mine = String(message.userId) === String(currentUserId);

  return (
    <div
      className={`rounded-lg border p-3 ${
        mine ? "border-[#0fb8ce]/40 bg-[#0f2c33]" : "border-[#ffffff14] bg-[#13202d]"
      }`}
    >
      <div className="text-[11px] text-gray-400 mb-1">
        {message.messageType === "query" ? "Query" : "Search Result"}
      </div>
      <p className="text-sm text-white whitespace-pre-wrap">{message.content}</p>
      {Array.isArray(message.searchResults) && message.searchResults.length > 0 && (
        <div className="mt-2 space-y-2">
          {message.searchResults.map((result, idx) => (
            <SearchResult key={`${message._id || idx}-${idx}`} result={result} />
          ))}
        </div>
      )}
    </div>
  );
}
