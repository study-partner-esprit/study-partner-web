import React, { useState, useEffect } from "react";
import "./CharacterSelector.css";
import { characterAPI } from "../../../services/api";

/**
 * Character Selection Component
 * Displayed during onboarding for users to choose their starting character
 */
function CharacterSelector({ onCharacterSelected, loading = false }) {
  const [characters, setCharacters] = useState([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch base characters
  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setIsLoading(true);
        const data = await characterAPI.getBaseCharacters();

        if (data.success) {
          setCharacters(data.data);
        } else {
          setError("Failed to load characters");
        }
      } catch (err) {
        setError("Error fetching characters: " + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCharacters();
  }, []);

  const handleCharacterClick = (characterId) => {
    setSelectedCharacterId(characterId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCharacterId) {
      setError("Please select a character");
      return;
    }

    try {
      setIsSubmitting(true);
      const data = await characterAPI.selectCharacter(selectedCharacterId);

      if (data.success) {
        onCharacterSelected(data.data);
      } else {
        setError(data.message || "Failed to select character");
      }
    } catch (err) {
      const message = err?.response?.data?.message || err.message;
      setError("Error selecting character: " + message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="character-selector">
        <div className="loading">Loading characters...</div>
      </div>
    );
  }

  return (
    <div className="character-selector">
      <div className="character-selector-container">
        <h1 className="character-selector-title">Choose Your Character</h1>
        <p className="character-selector-subtitle">
          Each character has a unique ability to enhance your study experience.
        </p>

        {error && <div className="character-selector-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="character-grid">
            {characters.map((character) => (
              <div
                key={character._id}
                className={`character-card ${
                  selectedCharacterId === character._id ? "selected" : ""
                }`}
                onClick={() => handleCharacterClick(character._id)}
              >
                {character.image_asset_path && (
                  <div className="character-image">
                    <img
                      src={character.image_asset_path}
                      alt={character.name}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                )}

                <div className="character-card-content">
                  <h2 className="character-name">{character.name}</h2>
                  <p className="character-description">
                    {character.description}
                  </p>

                  {character.primary_ability_id && (
                    <div className="character-ability">
                      <h3 className="ability-label">Ability</h3>
                      <p className="ability-name">
                        {character.primary_ability_id.name}
                      </p>
                      <p className="ability-description">
                        {character.primary_ability_id.description}
                      </p>
                    </div>
                  )}

                  <div className="character-rarity">
                    <span className={`rarity-badge rarity-${character.rarity}`}>
                      {character.rarity.toUpperCase()}
                    </span>
                  </div>

                  {character.playstyle && (
                    <div className="character-playstyle">
                      <span className="playstyle-tag">
                        {character.playstyle}
                      </span>
                    </div>
                  )}
                </div>

                {selectedCharacterId === character._id && (
                  <div className="character-selected-indicator">
                    <span className="checkmark">✓</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="character-selector-actions">
            <button
              type="submit"
              disabled={!selectedCharacterId || isSubmitting}
              className="btn-select-character"
            >
              {isSubmitting ? "Selecting..." : "Select Character"}
            </button>
          </div>
        </form>

        <div className="character-selector-note">
          <p>
            💡 <strong>Important:</strong> This onboarding choice is permanent.
            You can pick from owned characters in lobby before each session.
          </p>
        </div>
      </div>
    </div>
  );
}

export default CharacterSelector;
