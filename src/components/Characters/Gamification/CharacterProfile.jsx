import React, { useEffect, useState } from "react";
import "./CharacterProfile.css";
import {
  characterAPI,
  friendsAPI,
  gamificationAPI,
} from "../../../services/api";

const toSafeCount = (value, fallback = 0) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return Math.max(0, Math.trunc(Number(fallback) || 0));
  }

  return Math.max(0, Math.trunc(numeric));
};

const resolveBackendSignals = ({
  gamificationPayload,
  rankPayload,
  friendsPayload,
}) => {
  const stats =
    gamificationPayload?.stats || gamificationPayload?.data?.stats || {};
  const streakFromRank =
    rankPayload?.profile?.currentStreak ??
    rankPayload?.data?.profile?.currentStreak;
  const streakFromStats = stats.currentStreak ?? stats.current_streak;
  const friendsCount = Array.isArray(friendsPayload?.friends)
    ? friendsPayload.friends.length
    : Array.isArray(friendsPayload?.data?.friends)
      ? friendsPayload.data.friends.length
      : Array.isArray(friendsPayload)
        ? friendsPayload.length
        : 0;

  return {
    streak: toSafeCount(streakFromRank, streakFromStats),
    tasks: toSafeCount(
      stats.tasksCompleted ??
        stats.tasks_completed ??
        stats.challengesCompleted ??
        stats.challenges_completed,
      0,
    ),
    friends: toSafeCount(
      friendsCount,
      stats.friendsAdded ?? stats.friends_added,
    ),
    groupSessions: toSafeCount(
      stats.groupSessions ??
        stats.group_sessions ??
        stats.teamSessions ??
        stats.team_sessions,
      0,
    ),
  };
};

/**
 * Character Profile Component
 * Displays user's current character, mastery level, unlock progress, and abilities
 */
function CharacterProfile({ userId }) {
  const [character, setCharacter] = useState(null);
  const [userCharacter, setUserCharacter] = useState(null);
  const [unlockProgress, setUnlockProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [purchaseInFlightId, setPurchaseInFlightId] = useState(null);
  const [purchaseError, setPurchaseError] = useState("");
  const [backendSignals, setBackendSignals] = useState({
    streak: 0,
    tasks: 0,
    friends: 0,
    groupSessions: 0,
  });

  const formatUsd = (amountUsdCents) => {
    const normalized = Number(amountUsdCents || 0);
    if (!Number.isFinite(normalized) || normalized <= 0) return "$0.00";
    return `$${(normalized / 100).toFixed(2)}`;
  };

  const handlePurchaseCharacter = async (characterId) => {
    try {
      setPurchaseError("");
      setPurchaseInFlightId(characterId);

      const result = await characterAPI.purchaseCharacter(characterId);
      const checkoutUrl = result?.data?.checkoutUrl;

      if (!checkoutUrl) {
        throw new Error("Checkout URL was not returned by server");
      }

      window.location.assign(checkoutUrl);
    } catch (err) {
      setPurchaseError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to start purchase",
      );
      setPurchaseInFlightId(null);
    }
  };

  useEffect(() => {
    const fetchCharacterData = async () => {
      try {
        setLoading(true);

        const [userCharRes, progressRes, gamificationRes, rankRes, friendsRes] =
          await Promise.allSettled([
            characterAPI.getUserCharacter(),
            characterAPI.getUnlockProgress(),
            gamificationAPI.getProfile(),
            gamificationAPI.getRankProfile(),
            friendsAPI.getAll(),
          ]);

        if (
          userCharRes.status !== "fulfilled" ||
          !userCharRes.value?.success ||
          !userCharRes.value?.data
        ) {
          throw new Error("Failed to fetch user character");
        }

        const userCharData = userCharRes.value.data;
        setUserCharacter(userCharData);
        setCharacter(
          userCharData.character_id || userCharData.character || null,
        );

        if (
          progressRes.status === "fulfilled" &&
          progressRes.value?.success &&
          Array.isArray(progressRes.value?.data)
        ) {
          setUnlockProgress(progressRes.value.data);
        } else {
          setUnlockProgress([]);
        }

        setBackendSignals(
          resolveBackendSignals({
            gamificationPayload:
              gamificationRes.status === "fulfilled"
                ? gamificationRes.value
                : null,
            rankPayload: rankRes.status === "fulfilled" ? rankRes.value : null,
            friendsPayload:
              friendsRes.status === "fulfilled" ? friendsRes.value : null,
          }),
        );

        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchCharacterData();
    }
  }, [userId]);

  const getMasteryPercentage = () => {
    if (!userCharacter) return 0;
    return ((userCharacter.mastery_points % 100) / 100) * 100;
  };

  const getUnlockProgressPercentage = (item) => {
    if (!item) return 0;
    return (item.current_progress / item.required_progress) * 100;
  };

  const getUnlockStatus = (item) => {
    if (!item) return "LOCKED";
    if (item.current_progress >= item.required_progress) {
      return "UNLOCKED";
    }
    return "IN_PROGRESS";
  };

  const getRarityColor = (rarity) => {
    const colors = {
      common: "#d0d0d0",
      uncommon: "#4caf50",
      rare: "#2196f3",
      legendary: "#ff9800",
    };
    return colors[rarity] || "#999";
  };

  if (loading) {
    return (
      <div className="character-profile loading">
        <div className="profile-spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="character-profile error">
        <p>Error loading character: {error}</p>
      </div>
    );
  }

  if (!character || !userCharacter) {
    return (
      <div className="character-profile empty">
        <p>No character selected</p>
      </div>
    );
  }

  return (
    <div className="character-profile">
      <div className="profile-header">
        <div
          className="profile-avatar"
          style={{ backgroundColor: getRarityColor(character.rarity) }}
        >
          {character.name.charAt(0)}
        </div>

        <div className="profile-title">
          <h2 className="profile-name">{character.name}</h2>
          <span
            className="profile-rarity"
            style={{
              backgroundColor: getRarityColor(character.rarity),
            }}
          >
            {character.rarity.toUpperCase()}
          </span>
        </div>

        <button
          className="profile-toggle"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? "▼" : "▶"}
        </button>
      </div>

      <div className="profile-description">{character.description}</div>

      {/* Mastery Section */}
      <div className="profile-section">
        <h3 className="section-title">Mastery</h3>
        <div className="mastery-container">
          <div className="mastery-level">
            <span className="level-label">Level:</span>
            <span className="level-value">
              {userCharacter.mastery_level}/10
            </span>
          </div>
          <div className="mastery-bar">
            <div
              className="mastery-progress"
              style={{ width: `${getMasteryPercentage()}%` }}
            />
          </div>
          <div className="mastery-points">
            {userCharacter.mastery_points} total points
          </div>
        </div>
      </div>

      <div className="profile-section">
        <h3 className="section-title">Backend Progress Signals</h3>
        <div className="profile-signal-grid">
          <div className="profile-signal-item">
            <span>Streak</span>
            <strong>{backendSignals.streak}</strong>
          </div>
          <div className="profile-signal-item">
            <span>Tasks</span>
            <strong>{backendSignals.tasks}</strong>
          </div>
          <div className="profile-signal-item">
            <span>Friends</span>
            <strong>{backendSignals.friends}</strong>
          </div>
          <div className="profile-signal-item">
            <span>Group Sessions</span>
            <strong>{backendSignals.groupSessions}</strong>
          </div>
        </div>
      </div>

      {/* Abilities Section */}
      {showDetails && character.abilities && character.abilities.length > 0 && (
        <div className="profile-section">
          <h3 className="section-title">Abilities</h3>
          <div className="abilities-list">
            {character.abilities.map((ability) => (
              <div key={ability._id} className="ability-item">
                <div className="ability-header">
                  <h4 className="ability-name">{ability.name}</h4>
                  <span className="ability-type">{ability.effect_type}</span>
                </div>
                <p className="ability-description">{ability.description}</p>
                {ability.effect_value && (
                  <div className="ability-effect">
                    <span className="effect-label">Effect Value:</span>
                    <span className="effect-value">
                      +{(ability.effect_value * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
                {ability.hard_cap && (
                  <div className="ability-cap">
                    <span className="cap-label">Hard Cap:</span>
                    <span className="cap-value">
                      {(ability.hard_cap * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unlock Progress Section */}
      {showDetails && unlockProgress && unlockProgress.length > 0 && (
        <div className="profile-section">
          <h3 className="section-title">Unlock Progress</h3>
          {purchaseError && <p className="purchase-error">{purchaseError}</p>}
          <div className="unlock-list">
            {unlockProgress.map((item) => {
              const status = getUnlockStatus(item);
              const percentage = getUnlockProgressPercentage(item);
              const unlockCharacter = item?.character_id || {};
              const isPurchasable =
                Boolean(unlockCharacter?.is_purchasable) &&
                Number(unlockCharacter?.purchase_price_usd_cents || 0) > 0;

              return (
                <div key={item._id} className={`unlock-item ${status}`}>
                  <div className="unlock-header">
                    <h4 className="unlock-name">{item.character_id.name}</h4>
                    <span className={`unlock-status ${status.toLowerCase()}`}>
                      {status === "UNLOCKED"
                        ? "🔓 Unlocked"
                        : status === "IN_PROGRESS"
                          ? "⏳ In Progress"
                          : "🔒 Locked"}
                    </span>
                  </div>

                  {status !== "UNLOCKED" && (
                    <>
                      <p className="unlock-condition">
                        {item.condition_type
                          ? `Requires: ${item.condition_type}`
                          : "Complete studies to unlock"}
                      </p>
                      <div className="unlock-bar">
                        <div
                          className="unlock-progress"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="unlock-text">
                        {item.current_progress} / {item.required_progress}
                      </div>

                      {isPurchasable && (
                        <div className="unlock-actions">
                          <button
                            type="button"
                            className="unlock-purchase-btn"
                            disabled={
                              purchaseInFlightId === unlockCharacter._id
                            }
                            onClick={() =>
                              handlePurchaseCharacter(unlockCharacter._id)
                            }
                          >
                            {purchaseInFlightId === unlockCharacter._id
                              ? "Opening Checkout..."
                              : `Buy Now ${formatUsd(unlockCharacter.purchase_price_usd_cents)}`}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Prestige Section */}
      {showDetails && userCharacter.prestige_level > 0 && (
        <div className="profile-section prestige">
          <h3 className="section-title">Prestige</h3>
          <div className="prestige-info">
            <span className="prestige-icon">👑</span>
            <span className="prestige-level">
              Level {userCharacter.prestige_level}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default CharacterProfile;
