import React, { useState } from "react";

export default function ChatInput({ onSubmit, disabled }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!query.trim()) return;
    onSubmit(query.trim());
    setQuery("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Ask something about this study topic..."
        className="flex-1 rounded-lg border border-[#ffffff20] bg-[#0f1923] px-3 py-2 text-sm text-white outline-none focus:border-[#0fb8ce]"
        maxLength={1000}
        disabled={disabled}
      />
      <button
        type="submit"
        disabled={disabled || !query.trim()}
        className="rounded-lg bg-[#0fb8ce] px-4 py-2 text-sm font-bold text-[#0f1923] disabled:cursor-not-allowed disabled:opacity-60"
      >
        Send
      </button>
    </form>
  );
}
