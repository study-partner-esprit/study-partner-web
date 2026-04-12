import React, { useEffect, useState } from 'react';
import './AbilityNotification.css';

/**
 * Ability Notification Component
 * Displays ability trigger notifications and XP breakdown popups
 */
function AbilityNotification({
  ability,
  xpGain,
  baseXp,
  multiplier,
  character,
  debugInfo,
  onDismiss,
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onDismiss) {
        onDismiss();
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!isVisible) {
    return null;
  }

  const getAbilityColor = (effectType) => {
    const colors = {
      XP_MULTIPLIER: '#FFD700', // Gold
      CHALLENGE_MULTIPLIER: '#FF6B6B', // Red
      TEAM_XP_BOOST: '#4A90E2', // Blue
      STREAK_PRESERVATION: '#2ECC71', // Green
      MULTI_BENEFIT: '#9B59B6', // Purple
    };
    return colors[effectType] || '#999';
  };

  const getAbilityIcon = (effectType) => {
    const icons = {
      XP_MULTIPLIER: '⭐',
      CHALLENGE_MULTIPLIER: '🏆',
      TEAM_XP_BOOST: '👥',
      STREAK_PRESERVATION: '🔥',
      MULTI_BENEFIT: '👑',
    };
    return icons[effectType] || '✨';
  };

  const bonusXp = xpGain - baseXp;
  const bonusPercentage = Math.round(((multiplier - 1) * 100).toFixed(1));

  return (
    <div className="ability-notification">
      <div className="notification-background" />

      <div
        className="notification-content"
        style={{
          borderLeftColor: getAbilityColor(ability.effect_type),
        }}
      >
        <div className="notification-header">
          <span
            className="notification-icon"
            style={{ color: getAbilityColor(ability.effect_type) }}
          >
            {getAbilityIcon(ability.effect_type)}
          </span>
          <h3 className="notification-title">
            {character.name} - {ability.name}
          </h3>
          <button
            className="notification-close"
            onClick={() => {
              setIsVisible(false);
              if (onDismiss) {
                onDismiss();
              }
            }}
          >
            ×
          </button>
        </div>

        <div className="notification-body">
          <div className="xp-display">
            <div className="xp-row">
              <span className="xp-label">Base XP:</span>
              <span className="xp-value">{baseXp}</span>
            </div>

            {bonusXp > 0 && (
              <div className="xp-row bonus">
                <span className="xp-label">
                  {ability.name} (+{bonusPercentage}%):
                </span>
                <span className="xp-value">+{bonusXp}</span>
              </div>
            )}

            <div className="xp-divider" />

            <div className="xp-row total">
              <span className="xp-label">Total XP:</span>
              <span className="xp-value-total">+{xpGain}</span>
            </div>
          </div>

          {debugInfo && (
            <div className="notification-debug">
              {debugInfo.diminishingReturnsApplied && (
                <div className="debug-item warning">
                  ⚠️ Diminishing returns applied
                </div>
              )}
              {debugInfo.hardCapApplied && (
                <div className="debug-item warning">
                  ⚠️ Hard cap applied
                </div>
              )}
            </div>
          )}
        </div>

        <div className="notification-footer">
          <span className="notification-description">
            {ability.description}
          </span>
        </div>
      </div>

      <div className="notification-animation" />
    </div>
  );
}

export default AbilityNotification;
