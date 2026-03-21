import React from "react";

export default function VoiceIndicator({ speakingStatus }) {
  const color =
    speakingStatus === "loud"
      ? "bg-red-400"
      : speakingStatus === "speaking"
        ? "bg-green-400"
        : "bg-gray-500";

  return (
    <div className="flex items-center gap-2 text-xs text-gray-300">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      {speakingStatus}
    </div>
  );
}
