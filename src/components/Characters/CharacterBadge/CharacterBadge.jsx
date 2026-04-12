import React, { useState } from 'react';
import './CharacterBadge.css';

/**
 * Character Badge Component
 * Displays character avatar and name in lobby/profile areas
 */
function CharacterBadge({
  character,
  size = 'medium',
  showName = true,
  showRarity = true,
  className = '',
  theme = 'light',
}) {
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  if (!character) {
    return null;
  }

  const getCharacterColor = (rarity) => {
    const colors = {
      common: '#999',
      uncommon: '#4caf50',
      rare: '#2196f3',
      legendary: '#ff9800',
    };
    return colors[rarity] || '#999';
  };

  const badgeClasses = [
    'character-badge',
    `badge-${size}`,
    theme === 'dark' ? 'theme-dark' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={badgeClasses}>
      <div className="badge-avatar-wrapper">
        {character.image_asset_path && !imageLoadFailed && (
          <img
            src={character.image_asset_path}
            alt={character.name}
            className="badge-avatar-image"
            onError={() => setImageLoadFailed(true)}
          />
        )}
        {(!character.image_asset_path || imageLoadFailed) && (
          <div
            className="badge-avatar-placeholder"
            style={{ backgroundColor: getCharacterColor(character.rarity) }}
          >
            {character.icon || character.name.charAt(0)}
          </div>
        )}
      </div>

      {showName && (
        <div className="badge-info">
          <h3 className="badge-character-name">{character.name}</h3>
          {showRarity && (
            <span
              className={`badge-rarity badge-rarity-${character.rarity}`}
            >
              {character.rarity}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default CharacterBadge;
