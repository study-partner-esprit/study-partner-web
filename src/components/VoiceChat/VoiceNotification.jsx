import React from "react";

export default function VoiceNotification({ message }) {
  if (!message) return null;
  return (
    <div className="rounded-md border border-[#0fb8ce]/40 bg-[#0f2c33] px-2 py-1 text-xs text-[#8ce6f3]">
      {message}
    </div>
  );
}
