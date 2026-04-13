import React from "react";
import { Activity, Sparkles } from "lucide-react";
import "./AbilityActiveIndicator.css";

function AbilityActiveIndicator({
  character,
  abilityName,
  multiplier = 1,
  isSessionActive,
}) {
  if (!isSessionActive || !character) {
    return null;
  }

  const numericMultiplier = Number(multiplier);
  const safeMultiplier = Number.isFinite(numericMultiplier)
    ? Math.max(1, numericMultiplier)
    : 1;
  const showMultiplier = safeMultiplier > 1;

  return (
    <div className="ability-active-indicator" role="status" aria-live="polite">
      <div className="ability-active-indicator__title-row">
        <Activity size={14} className="ability-active-indicator__icon" />
        <span className="ability-active-indicator__title">Ability Active</span>
      </div>

      <div className="ability-active-indicator__content">
        <span className="ability-active-indicator__character">
          {character.icon || "*"} {character.name}
        </span>

        {abilityName && (
          <span className="ability-active-indicator__ability">
            <Sparkles size={12} /> {abilityName}
          </span>
        )}

        {showMultiplier && (
          <span className="ability-active-indicator__multiplier">
            {safeMultiplier.toFixed(2)}x XP
          </span>
        )}
      </div>
    </div>
  );
}

export default AbilityActiveIndicator;
