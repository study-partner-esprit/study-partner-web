import React from "react";

const getRarityLabel = (character) =>
  String(character?.rarity || "common").toUpperCase();

export default function SessionCharacterPicker({
  characters = [],
  selectedCharacterId = "",
  onSelect,
  disabled = false,
  compact = false,
  title = "Choose Character",
  subtitle = "Pick the character you want to play with.",
}) {
  if (!characters.length) {
    return (
      <div className="rounded-xl border border-[#ffffff10] bg-[#1a2633]/60 p-4 text-sm text-gray-400">
        No owned characters available yet.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#ffffff10] bg-[#1a2633]/55 p-4">
      <div className="mb-3">
        <h3 className="text-sm font-bold tracking-wider uppercase text-gray-300">
          {title}
        </h3>
        {!compact && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>

      <div
        className={`grid ${compact ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"} gap-3`}
      >
        {characters.map((character) => {
          const characterId = String(character?._id || "");
          const isSelected = String(selectedCharacterId) === characterId;

          return (
            <button
              key={characterId || character?.name}
              type="button"
              disabled={disabled}
              onClick={() => onSelect?.(characterId)}
              className={`relative overflow-hidden rounded-xl border p-3 text-left transition-all ${
                isSelected
                  ? "border-[var(--accent-color-dynamic)] bg-[var(--accent-color-dynamic)]/12 shadow-[0_0_20px_var(--accent-color-dynamic-shadow-30)]"
                  : "border-[#ffffff14] bg-[#0f1923]/70 hover:border-[var(--accent-color-dynamic)]/45"
              } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-[var(--accent-color-dynamic)]/10 to-transparent opacity-60" />

              <div className="relative z-10 flex items-start gap-3">
                <div className="w-14 h-14 rounded-lg overflow-hidden border border-[#ffffff20] bg-[#0f1923] shrink-0">
                  {character?.image_asset_path ? (
                    <img
                      src={character.image_asset_path}
                      alt={character?.name || "Character"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg font-black text-[var(--accent-color-dynamic)]">
                      {character?.name?.[0] || "?"}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm tracking-wide uppercase truncate">
                    {character?.name || "Unknown"}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {getRarityLabel(character)}
                  </p>
                  {character?.primary_ability_id?.name && (
                    <p className="text-xs text-gray-300 mt-1 truncate">
                      {character.primary_ability_id.name}
                    </p>
                  )}
                </div>
              </div>

              {isSelected && (
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--accent-color-dynamic)] text-white tracking-wider uppercase">
                  Selected
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
