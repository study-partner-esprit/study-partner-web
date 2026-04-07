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
        className="flex-1 rounded-lg border border-[#ffffff20] bg-[#0f1923] px-3 py-2 text-sm text-white outline-none"
        maxLength={1000}
        disabled={disabled}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent-color-dynamic)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '#ffffff20';
        }}
      />
      <button
        type="submit"
        disabled={disabled || !query.trim()}
        className="rounded-lg px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          backgroundColor: 'var(--accent-color-dynamic)',
          color: '#0f1923',
        }}
      >
        Send
      </button>
    </form>
  );
}
